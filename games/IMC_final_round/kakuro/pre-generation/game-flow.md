# Game Flow: Kakuro — Sum-Snake Logic Puzzle

## One-liner

Solve three crossword-style digit puzzles per session — fill 4×4 / 5×5 / 6×6 grids of white cells with digits 1–9 so every run sums to its clue and never repeats a digit — using drag-and-drop (drag a digit tile from a tray onto a white cell; drag back to the tray to clear) powered by `@dnd-kit/dom@beta`, with no per-cell validation: the student fills the grid freely and submits the whole puzzle via a Check button below the digit tray. No timer, no lives, no hint button. Stars are decided by failed-Check count at end-of-game (3⭐ = 0, 2⭐ = 1–2, 1⭐ = ≥ 3).

## Shape

**Shape:** Multi-round (Shape 2). 3 rounds = 3 puzzles, one per stage, played in order Stage 1 (4×4) → Stage 2 (5×5) → Stage 3 (6×6).

## Changes from default

- **No timer (PART-006 omitted).** Concept explicitly forbids a timer; the game's tone is "quiet and deliberate."
- **No lives indicator** in the gameplay header. `totalLives: 99` (high cap, never decremented, never displayed). The session has no Game Over branch — it is structurally unreachable. `gameState.lives` is set once at session start and never mutated.
- **Submission auto-detected.** No per-puzzle Submit / Check / Done CTA. The puzzle solves the moment the last white cell is filled correctly. PART-050 (FloatingButton) is **NOT used during gameplay**.
- **PART-050 IS used at end-of-game** for the single-stage Next CTA after the AnswerComponent carousel (per PART-051 / Stars Collected handoff). This is the standard archetype-6-without-FloatingButton-during-gameplay pattern.
- **In-flow Hint button** in the gameplay header. Not a flow-shape change — it lives inside the gameplay screen and modifies `hintsUsed` / fills a cell when tapped.
- **Custom star rule** (NOT default 90/66/33%): driven by `hintsUsed` and `wrongAttempts`, both session-wide totals across the 3 puzzles. See "Scoring + lives logic" below.
- **Round-set rotation A → B → C → A** on every Try Again / Play Again. `setIndex` rotates BEFORE `resetGameState()` and is **NOT** cleared by `resetGameState()` (persists across in-session restarts; reset only on fresh page-load).
- **Cell-level state machine** (empty → has-digit → locked) and **drag-tile lifecycle** (`@dnd-kit/dom` `DragDropManager` + `Draggable` tiles + `Droppable` cells) are first-class — see "Per-cell DOM layout" and "Drag tile lifecycle" sections below.
- **Hint banner** below the grid for wrong-digit constraint messages (3 s auto-fade) — a per-game UI element not present in the canonical multi-round template.
- **AnswerComponent (PART-051) end-of-game payload = 3 slides** (one per stage), each rendering the corresponding puzzle's solved grid (locked-mint white cells with their solution digits, clue cells, walls — non-interactive).

## Flow Diagram

```
┌──────────┐  tap     ┌──────────────┐  tap     ┌──────────────┐  auto    ┌──────────────────────────┐
│ Preview  ├─────────▶│ Welcome /    ├─────────▶│ Round-1 intro├─────────▶│ Gameplay: Puzzle 1 (4×4) │
│ 🔊 prev  │          │ Round-1 TS   │          │  TS          │ (after   │ Header:                  │
│   audio  │          │ "Puzzle 1    │          │ 🔊 "Puzzle 1 │  sound)  │  • "Puzzle 1 of 3"       │
│ "Start"  │          │  of 3"       │          │  of 3"       │          │  • 💡 Hint (-1⭐ badge)  │
│(PART-039)│          │ tap-dismiss  │          │ tap-dismiss  │          │  (NO timer, NO lives)    │
└──────────┘          └──────────────┘          └──────────────┘          │ Body:                    │
                                                                          │  • 4×4 board             │
                                                                          │  • Digit tray (always    │
                                                                          │     visible: 9 tiles)    │
                                                                          │  • Hint banner slot      │
                                                                          │     (empty until wrong)  │
                                                                          └────────┬─────────────────┘
                                                                                   │
                                              (drag digit tile from tray → drop on white cell → digit lands)
                                                                                   │
                       ┌────────────┬────────────┬────────────┬─────────────┐
                       │            │            │            │             │
                       ▼ has-digit  ▼ run-OK     ▼ wrong-sum  ▼ wrong-rep   ▼ hint-tap
              ┌─────────────────┐ ┌────────────┐┌────────────┐┌────────────┐┌──────────────────┐
              │ digit lands.    │ │ run cells  ││ red flash  ││ red flash  ││ random empty cell│
              │ run not yet     │ │ flash green││ + shake    ││ + shake    ││ chosen, fills    │
              │ complete.       │ │ → locked   ││ + FAF wrong││ + FAF wrong││ with solution    │
              │ FAF tap SFX.    │ │ mint-green ││ SFX        ││ SFX        ││ digit (yellow    │
              │ scale-in 150 ms │ │ FAF click- ││ hint banner││ hint banner││ flash 200 ms,    │
              │ no TTS no       │ │ click SFX  ││ "row sum X"││ "no repeat ││ then scale-in    │
              │ sticker no block│ │ no TTS     ││ for 3 s    ││ in run."   ││ 150 ms)          │
              │ (CASE 9)        │ │ (CASE 5/10 ││ digit STAYS││ for 3 s    ││ FAF confirm SFX  │
              │                 │ │  multi-step││ wrong++    ││ digit STAYS││ hintsUsed++      │
              │                 │ │  partial-  ││ NO life    ││ wrong++    ││ if completes a   │
              │                 │ │  progress) ││ decrement  ││ NO life    ││ run → green-flash│
              │                 │ │            ││ NO block   ││ decrement  ││ if completes the │
              │                 │ │            ││            ││            ││ puzzle → solved  │
              └────────┬────────┘ └─────┬──────┘└─────┬──────┘└─────┬──────┘└───────┬──────────┘
                       │                │             │             │               │
                       └────────────────┴─── student keeps placing / choosing  ─────┘
                                              │
                                              │ all white cells filled correctly
                                              ▼
                                ┌─────────────────────────────┐
                                │ Puzzle solved (auto-detect) │
                                │ progressBar.update(N,lives) │
                                │   FIRST                     │
                                │ celebration glow ~600 ms    │
                                │ (cell-by-cell propagation)  │
                                │ await round-complete SFX +  │
                                │   celebration sticker       │
                                │ await dynamic TTS           │
                                │   ("Brilliant! Every run    │
                                │    adds up.")               │
                                │ recordAttempt is_correct:   │
                                │   true, attempt_type:       │
                                │   'puzzle-solve'            │
                                └────────────┬────────────────┘
                                             │
                              ┌──────────────┴────────────────┐
                              │                                │
                              ▼ currentRound < 3              ▼ currentRound === 3
                       ┌──────────────┐               ┌──────────────────────┐
                       │ Round-(N+1)  │               │ Victory (TS,         │
                       │ intro TS     │               │   intermediate)      │
                       │ "Puzzle N+1  │               │ 🔊 victory SFX +     │
                       │  of 3"       │               │   VO (per star tier) │
                       │ tap-dismiss  │               │ stars rendered       │
                       └──────┬───────┘               │ game_complete posted │
                              │                       │   BEFORE end-game    │
                              ▼                       │   audio              │
                     loadRound(N+1)                   │ [Claim Stars]        │
                     gameState.currentRound++         └─────────┬────────────┘
                     dndManager rebuilt                         │ tap
                     hint banner cleared                        ▼
                     placedDigits = {}                ┌────────────────────┐
                                                     │ Stars Collected    │
                                                     │   (TS, persist,    │
                                                     │     no buttons)    │
                                                     │ 🔊 stars_collected │
                                                     │   + ✨ show_star   │
                                                     │   + setTimeout     │
                                                     │   ~1500 ms →       │
                                                     │ showAnswerCarousel │
                                                     └─────────┬──────────┘
                                                               │ TS stays mounted
                                                               ▼ as backdrop
                                                     ┌──────────────────────┐
                                                     │ Correct Answers      │
                                                     │ carousel (PART-051)  │
                                                     │ 3 slides (one per    │
                                                     │  stage), each = the  │
                                                     │  solved grid in      │
                                                     │  locked-mint colour  │
                                                     │ FloatingBtn 'next'   │
                                                     │   appears AFTER show │
                                                     └─────────┬────────────┘
                                                               │ tap Next
                                                               ▼
                                                     single-stage exit:
                                                     answerComponent.destroy()
                                                     postMessage({type:'next_ended'})
                                                     previewScreen.destroy()
                                                     floatingBtn.destroy()

                       Pause overlay: VisibilityTracker's PopupComponent
                       auto-shows on tab-hidden (CASE 14); audio pauses;
                       no timer to pause. On resume (CASE 15), audio
                       resumes. NEVER build a custom pause overlay.

                       Drop-on-locked-run cell (rejected — locked cells are
                       NOT registered as droppables):
                         tile snaps back to the tray (150 ms)
                         suppressed-tap SFX (FAF, ~50 ms)
                         no animation on the locked cell, no state change.

                       Drag cancelled (released over a wall, clue cell,
                       body, or anywhere not registered as a droppable):
                         tile snaps back to the tray (150 ms)
                         suppressed-tap SFX (FAF)
                         no state change.

                       Drag a digit out of a non-locked cell back to tray:
                         cell empties (placedDigits[`r,c`] deleted)
                         tile snaps back into tray slot (150 ms)
                         soft tap SFX (FAF)

                       NO Game Over branch — lives never decrement,
                       lives === 0 is unreachable, the `game_over`
                       phase is dead-code. `data-phase="game_over"`
                       is NEVER rendered.
```

## Stages

| Stage | Round | Grid | White cells | Run lengths              | Sum range | Deductions    | Cosmetic skin                                       | Target first-solve (no hint) |
|-------|-------|------|-------------|--------------------------|-----------|---------------|-----------------------------------------------------|------------------------------|
| 1     | 1     | 4×4  | ~5–8        | Pairs, ≤1 triple         | 4–13      | 1–2           | Cream cells / navy walls / mint-green locked        | ~80 %                        |
| 2     | 2     | 5×5  | ~8–14       | Pairs and triples        | 3–18      | 2–3           | Same palette                                        | ~60 %                        |
| 3     | 3     | 6×6  | ~18–24      | Triples + quadruples     | 6–28      | ≥ 3           | Same palette + 1 px outer-frame accent              | ~40 %                        |

Round 1 → solved → Round-2 intro TS → Round 2 → solved → Round-3 intro TS → Round 3 → solved → Victory (intermediate) → Stars Collected → AnswerComponent → Next.

## Round-by-round player experience

**Puzzle 1 (Stage 1 — 4×4, "Warm-up").** A small 4×4 grid splashes onto the screen with a few cream-coloured white cells and dark navy walls. Above the board: "Puzzle 1 of 3" left-aligned, "💡 Hint" right-aligned. Below the board, a strip of 9 reusable digit tiles (1–9) — the digit tray — sits ready. The student presses a digit tile, drags it onto a white cell, and releases — the digit lands with a snap-in animation. They drag another digit; it lands too. To change a digit, drag a different tile onto the cell; to clear, drag the digit back down to the tray. When they fill the last cell of a run correctly, the cells flash green and turn locked-mint (locked cells are no longer drop targets). When they fill all the whites correctly, the whole grid celebrates and the screen advances. Expected solve: 1–3 minutes; ~80 % clear without a hint.

**Puzzle 2 (Stage 2 — 5×5, "Standard").** The grid grows to 5×5 with more cells, more runs, and a wider mix of pair / triple runs. The student starts to feel that pure trial-and-error doesn't pay — there's a cell where the row says "3 or 4" and the column says "4 or 5", and the student has to *intersect* those two sets to land on 4. The "💡 Hint" is still there, but using it costs a star. Expected solve: 4–8 minutes; ~60 % clear without a hint.

**Puzzle 3 (Stage 3 — 6×6, "Stretch").** The mastery puzzle. Triples and one quadruple. Sums up to 28. The student needs to hold two or three options for a single cell while they reason about the rest of the run, and use process-of-elimination to collapse those options. The 1 px border accent on the outer frame is the only cosmetic flag that this is the mastery board. Expected solve: 6–12 minutes; ~40 % clear without a hint.

## Per-screen breakdown — what the student sees, what they tap, what fires

### Preview Screen (PART-039)

- **Sees:** Background tint, "How to play" instruction text (HTML), play button, a 🔊 audio indicator that auto-plays the preview narration on screen-mount.
- **Taps:** the "Start" / play button (PART-039 default label).
- **Fires:** `previewScreen.hide()` → `transitionScreen.show({ title: "Puzzle 1 of 3", subtitle: "Warm-up · 4×4", buttons: [], persist: false })` (Round-1 intro). Tap-to-dismiss the intro TS.

### Round-N intro TransitionScreen (N ∈ {1,2,3})

- **Sees:** Title "Puzzle N of 3", subtitle "<Stage label> · <size>×<size>".
- **Taps:** Anywhere on the TS (tap-to-dismiss).
- **Fires:** `transitionScreen.hide()` + `loadRound(N)`. The 🔊 round-intro SFX (`sound_round_intro`) is fire-and-forget on mount, no awaited TTS. (CASE 0 — round-intro beat.)

### Gameplay screen (per round)

#### Header (persistent through gameplay, NOT shown on Preview / TS / Victory)

- **Left:** "Puzzle N of 3" pill (text label, not tappable).
- **Right:** Hint button — `<button id="hintBtn" class="mathai-secondary-btn">💡 Hint <span class="badge">−1⭐</span></button>`. ~88 × 44 px. Tappable when puzzle unsolved AND no drag in flight AND no feedback in flight; otherwise `opacity:0.6; pointer-events:none`.
- **Centre:** empty (no timer, no lives counter).
- **Below header:** ProgressBar (PART-023, no lives — see "ProgressBar configuration" below). Bumps on every round-complete (`progressBar.update(currentRound, gameState.lives)` is called FIRST in the round-complete handler per the project's `progress_bar_round_complete` MEMORY rule).

#### Body

- **Board:** centered, `display: grid; grid-template-columns: repeat(<size>, 1fr)`. Each cell is a `<div data-r="<r>" data-c="<c>" data-kind="white|clue|wall">`. White cells (when not locked) are registered as `Droppable` with the dnd-kit manager; locked cells, clue cells, and walls are NOT droppables (drops over them fall through to the drag-cancel branch). Clue and wall cells have `pointer-events: none`.
  - **White cell DOM:** `<div class="kkr-cell kkr-white" data-r=".." data-c="..">.</div>` — initially renders empty (cell content `""`); when a digit is dropped on it, the cell content becomes `<span class="kkr-digit">3</span>`. While a tile is being dragged over the cell, the dnd library adds `data-droppable-over` (or its equivalent attribute) and CSS renders a soft yellow inset ring. When the run locks, the cell gains class `kkr-locked` (background flips to mint-green) and is unregistered from the droppable set.
  - **Clue cell DOM:** `<div class="kkr-cell kkr-clue" data-r=".." data-c="..">` with two inner spans `<span class="kkr-clue-row">4</span><span class="kkr-clue-col">11</span>` rendered in top-right and bottom-left positions respectively (CSS grid or absolute positioning). If only one of row/col is present, the other span is omitted; if both are present, a thin diagonal line `<svg>` is drawn corner-to-corner.
  - **Wall cell DOM:** `<div class="kkr-cell kkr-wall"></div>`. Solid navy, no content, no interaction.
- **Digit tray (below board, always visible):** `<div id="digitTray" class="kkr-tray">` containing 9 draggable digit tiles in a 5+4 layout. The tray itself is also registered as a `Droppable` zone (id `tray-clear`) so dropping a tile from a cell onto the tray empties that cell. Tile DOM:
  ```
  <div id="digitTray" class="kkr-tray" data-droppable="tray-clear">
    <div class="kkr-tile" data-digit="1" data-draggable="tile-1" tabindex="0">1</div>
    <div class="kkr-tile" data-digit="2" data-draggable="tile-2" tabindex="0">2</div>
    ... (1 through 9)
  </div>
  ```
  Two-row layout: row 1 = 1,2,3,4,5; row 2 = 6,7,8,9 (bottom-right slot empty — no Clear tile; the tray itself is the clear-zone). Each tile ~62 × 56 px. Tiles have `touch-action: none` so the dnd-kit `PointerSensor` can capture touch gestures without page scroll. **Tiles are reusable** — dragging tile `5` onto a cell does NOT remove it from the tray; the tile stays put and remains draggable. Tiles are registered as `Draggable` with the dnd-kit manager; the `PointerSensor` activation distance is 6 px so accidental taps don't fire drag.
- **Hint banner slot (below digit tray):** `<div id="hintBanner" class="kkr-hint-banner" hidden></div>`. When a wrong-digit fires, populated with `<p class="kkr-hint-text">This row needs to sum to 11.</p>` and `hidden` removed; auto-fades after 3 s (opacity 1 → 0 over 200 ms, then `hidden` re-applied).

### Victory TransitionScreen

- **Sees:** "Victory" title, stars (1–3 shown per `getStars()`), no buttons (CTA wired below).
- Action wiring: `transitionScreen.show({ title:'Victory', subtitle: 'You solved all three puzzles!', stars: gameState.stars, buttons: [{ text:'Claim Stars', action: showStarsCollected }], persist: true })`.
- **Fires:** Per "End-of-game chain" below.

### Stars Collected TransitionScreen

- **Sees:** "Yay! Stars collected!" title, stars, no buttons. Backdrop persists as the AnswerComponent layers over.
- `transitionScreen.show({ title:'Yay! Stars collected!', stars: gameState.stars, buttons: [], persist: true, onMounted })`.
- `onMounted` fires `await FeedbackManager.sound.play('sound_stars_collected', { sticker: null })`, posts `{ type: 'show_star', stars: gameState.stars }`, then `setTimeout(showAnswerCarousel, 1500)`.

### AnswerComponent carousel

- **Sees:** 3 slides (Puzzle 1 / 2 / 3), each rendering the solved grid in locked-mint with all clue cells and solution digits visible. Title per slide: "Puzzle 1 — Warm-up (4×4)" / "Puzzle 2 — Standard (5×5)" / "Puzzle 3 — Stretch (6×6)". Subtitle: a one-liner naming the load-bearing skill (Stage 1: "Decomposition fluency — every run had only one way to add up." / Stage 2: "Cross-clue intersection — the row says 3-or-4, the column says 4-or-5, the cell must be 4." / Stage 3: "Triple-run elimination — three options held, collapsed by the column.").
- **Taps:** the FloatingButton "Next" (`floatingBtn.setMode('next')` is called at end of `showAnswerCarousel`).
- **Fires:** Single-stage exit on `floatingBtn.on('next', ...)` → `answerComponent.destroy()`, `postMessage({ type:'next_ended' })`, `previewScreen.destroy()`, `floatingBtn.destroy()`.

## Per-cell DOM layout (gameplay)

- **Grid container:** `<div id="kkrBoard" class="kkr-board" data-size="4|5|6">`.
- **Cells:** rendered in row-major order, `<div class="kkr-cell kkr-{wall|clue|white}" data-r="<r>" data-c="<c>">`.
- **Drop-target hover ring:** while a tile is being dragged over a non-locked white cell, the dnd-kit library adds an attribute the spec watches (`data-droppable-over`, or whatever the manager exposes — confirm via context7 at build time). CSS targets `.kkr-white[data-droppable-over]` to render a 2 px inset yellow ring (`box-shadow: inset 0 0 0 2px #F1C453`). There is NO `kkr-active` class — that was a P15 artefact and is no longer used (cells have no "active for numpad" state in P6).
- **Locked-run cells:** when a run is validated as solved, every cell in the run gains class `kkr-locked` (background mint), AND each cell is unregistered from the dnd-kit `Droppable` set so drops over it are rejected (snap-back to tray + suppressed-tap SFX). The class is permanent for the rest of the puzzle.
- **Wrong-digit cell:** transient class `kkr-wrong` for ~600 ms during the red-flash + shake sequence, then removed.

## Cell-state machine

```
   ┌────────────────────────┐
   │ empty (no digit)       │
   │ kkr-white              │
   │ registered as Droppable│
   │ drop tile → has-digit  │
   └─────────┬──────────────┘
             │ tile dropped
             ▼
   ┌────────────────────────┐
   │ has-digit              │
   │ kkr-white + child span │
   │ registered as Droppable│
   │ drop different tile →  │
   │   silent replace       │
   │ drag digit out to tray │
   │   → empty              │
   └─────────┬──────────────┘
             │ run completes correctly
             ▼
   ┌────────────────────────┐
   │ locked (mint-green)    │
   │ kkr-white + kkr-locked │
   │ UNREGISTERED Droppable │
   │ drop on it → snap-back │
   │   + suppressed-tap SFX │
   └────────────────────────┘
```

Wrong-digit transient state (`kkr-wrong`) is a flash of `kkr-white` (NOT a state-machine state) — the cell stays in `has-digit` after the red flash dissipates. The student can then drag a different tile onto it to replace, or drag the existing digit back to the tray to clear.

## Drag tile lifecycle

```
[init on loadRound(N)]
  - new DragDropManager({ sensors: [PointerSensor({ activationDistance: 6 }),
                                    KeyboardSensor()] })
  - 9 Draggable instances bound to the .kkr-tile elements (id 'tile-1'..'tile-9');
    these persist across rounds — the tray is rendered once
  - For each non-locked white cell in the round, register a Droppable (id 'cell-r-c')
  - Register the tray element as a Droppable (id 'tray-clear')
  - Subscribe to manager.monitor for 'dragstart' / 'dragend' events

[idle: tiles in tray slots; locations map = { 'tile-1': 'tray', ... }]
     │
     │ pointer down on a .kkr-tile, then move ≥ 6 px
     ▼
[dragstart]
  - locations[tileId] = 'dragging'
  - gameState.isDragging = true
  - tile lifts (~1.1× scale + soft shadow), follows pointer
  - soft tap SFX (FAF)
  - hint button disabled (CSS .kkr-hint-disabled while isDragging)
     │
     │ pointer moves; library tracks droppable under pointer
     ▼
[dragover]
  - Droppable cell under pointer gets data-droppable-over → yellow ring CSS
  - locked cells / walls / clues never get this state (not registered)
     │
     │ pointer up
     ▼
[dragend — branch on drop target]
  - if target is a non-locked white-cell Droppable (cell-r-c):
      placeDigit(r, c, tile.digit, /* fromHint */ false)
        → existing digit (if any) silently replaced
        → per-cell validation runs synchronously
        → if run now complete and correct → green flash + lock + lockedRuns.add
        → if run now complete but wrong → red flash + shake + hint banner +
          wrongAttempts++
      tile snaps back to its tray slot (150 ms)
  - if target is the tray (tray-clear) AND tile was dragged from a cell
    (drag-source tracked separately via locations map):
      delete placedDigits[`r,c`] for the source cell
      tile snaps back to its tray slot (150 ms)
      soft tap SFX (FAF)
  - if target is null (released over a wall, clue, or outside any droppable):
      tile snaps back to its tray slot (150 ms)
      suppressed-tap SFX (FAF)
  - locations[tileId] = 'tray'
  - gameState.isDragging = false
  - hint button re-enabled

[teardown on loadRound(N+1) and endGame()]
  - manager.destroy()  // releases all draggables, droppables, sensors
  - re-init for the next puzzle (or skip on endGame)
```

Edge cases:
- **Drop on the same cell that already holds a digit (non-locked):** silent replace, validation re-runs.
- **Drop on a locked-run cell:** rejected at the droppable layer (locked cells are not registered as droppables), tile snaps back, suppressed-tap SFX. Defensive branch only.
- **Drop on a clue or wall:** swallowed (`pointer-events: none` on the cell, and the cell is not registered as a droppable). Falls through to the drag-cancel branch (snap-back).
- **Drag in flight during feedback (run-complete green flash, wrong-digit red flash, hint cell scale-in):** the dnd manager's input-block toggle (`.dnd-disabled` class on the board, `pointer-events: none` on draggables) is set TRUE only around the awaited round-complete sequence (CASE 6); for FAF mid-puzzle feedback, drags remain live so the student can keep working. Per `interaction/SKILL.md` § "isProcessing on every input channel".
- **Pointer cancelled by OS (e.g. system gesture):** dnd-kit's PointerSensor handles `pointercancel` → emits a `dragend` with no drop target → snap-back branch fires.

## Hint banner lifecycle

```
[idle: #hintBanner hidden, innerHTML empty]
     │
     │ wrong-digit placement validated
     ▼
[show]
  - render <p class="kkr-hint-text">{message}</p> with the matched template
  - remove `hidden` attribute, fade-in 200 ms (opacity 0 → 1)
     │
     │ wait 3000 ms
     ▼
[fade-out: 200 ms]
  - opacity 1 → 0
     │
     ▼
[idle]
  - re-add `hidden` attribute
  - clear innerHTML
```

If a SECOND wrong-digit fires while the banner is still visible, the existing banner's text is **replaced in-place**, the fade-timer is reset to 3 s, and no fade-in animation re-runs (the banner stays at opacity 1). This keeps the banner's wording fresh without flashing.

The banner uses `--mathai-color-text-secondary` foreground on a soft red background (`rgba(230,57,70,0.10)`), 14 px font, single line, padding 8 px 12 px, border-radius 6 px.

## Scoring + lives logic

**Per-puzzle:** binary. A puzzle is solved iff every white cell holds the correct digit (per the build-step's pre-validated unique solution from `pre-generation/puzzles.md`). `gameState.score += 1` on solve. Max session score = 3.

**Lives:** **No-op in this game.**
- `gameState.lives` is initialised to `99` on session start (= `totalLives`).
- It is **NEVER decremented** anywhere in the code.
- The lives indicator in the progress bar slot is **hidden** (CSS `display: none` on the lives sub-slot of PART-023, OR pass `null` / omit the second arg to `progressBar.update(round)`).
- There is **no Game Over branch**. The state machine is `start → gameplay → results` (Victory only).

**Scoring counters (session-wide, NOT per-puzzle):**
- `gameState.wrongAttempts` increments by 1 on every wrong-digit placement (whether row-violated, column-violated, repeat-in-run, or both row+col simultaneously — one placement = one increment).
- `gameState.hintsUsed` increments by 1 on every hint-button tap that successfully fills a cell.
- Both reset to 0 on Try Again / Play Again (full session restart). They persist across the 3 puzzles within a single session.

**Star calculation (`getStars()`):**

```js
function getStars() {
  const w = gameState.wrongAttempts;
  const h = gameState.hintsUsed;
  const solved = gameState.score; // 0..3, expected to be 3 at Victory time

  if (solved < 3) return 0;        // unreachable in v1 (no abort UI)

  // 3⭐: zero hints AND ≤ 1 wrong attempt
  if (h === 0 && w <= 1) return 3;

  // 2⭐: 1 hint (any wrongs) OR 0 hints with 2–4 wrongs
  if (h === 1) return 2;
  if (h === 0 && w >= 2 && w <= 4) return 2;

  // 1⭐: 2+ hints OR 0 hints with 5+ wrongs OR 1 hint with 5+ wrongs (already covered by h===1 above; keep explicit)
  if (h >= 2) return 1;
  if (h === 0 && w >= 5) return 1;

  return 1;
}
```

(The fallback `return 1` covers any combination not explicitly enumerated, defending against future state changes.)

**Progress bar configuration (PART-023):**
- Total rounds: 3.
- Round increment: `progressBar.update(currentRound, gameState.lives)` is called FIRST in the round-complete handler — BEFORE any awaited SFX / TTS / `nextRound()` / `endGame()` (per `progress_bar_round_complete` MEMORY rule).
- Lives slot: hidden (no rendered hearts). The build step accomplishes this either by passing `null` for the second arg if PART-023 supports it, or by CSS-hiding the lives slot (`#progressBarLives { display:none }`).

## Active-set rotation & restart semantics

Round-set cycling matches the queens / mind-your-numbers pattern.

```js
const SETS = ['A', 'B', 'C'];

function rotateRoundSet() {
  gameState.setIndex = (gameState.setIndex + 1) % 3;   // 0 → 1 → 2 → 0 → ...
}

function resetGameState() {
  // Reset session state
  gameState.lives = 99;            // never decremented anyway, but rehydrated on restart
  gameState.currentRound = 1;
  gameState.score = 0;
  gameState.wrongAttempts = 0;     // session-wide totals reset on full restart only
  gameState.hintsUsed = 0;
  gameState.attempts = [];
  gameState.isProcessing = false;
  gameState.isDragging = false;    // true while a tile is in flight (set on dragstart, cleared on dragend)
  gameState.placedDigits = {};     // 'r,c' → digit (per current puzzle)
  gameState.lockedRuns = new Set();// run ids that have been validated and locked
  gameState.dragSourceCell = null; // 'r,c' string when a tile was picked up FROM a cell (not the tray); null otherwise. Lets the dragend handler distinguish "drag-from-tray" (place) vs "drag-from-cell-back-to-tray" (clear).
  gameState.currentRoundData = null;
  // CRITICAL: do NOT touch gameState.setIndex — it persists across in-session restarts.
}

function onPlayAgain() {
  rotateRoundSet();           // 0 → 1 → 2 → 0
  resetGameState();           // resets round/score/wrongs/hints but NOT setIndex
  showRoundIntroTS(1);        // → Puzzle 1 of new set
}
```

`setIndex` resets to 0 only on fresh page-load (default state), NOT on in-session restart. Set A on first attempt, Set B after first restart, Set C after second restart, then cycles back to A.

The active set is filtered from `fallbackContent.rounds` on every `loadRound` call:

```js
function loadRound(n) {
  const setLetter = SETS[gameState.setIndex];
  const round = fallbackContent.rounds.find(r => r.set === setLetter && r.round === n);
  gameState.currentRoundData = round;
  // ... render board with round.grid, attach listeners ...
}
```

(Use `loadRound` here is fine — there's no `window.loadRound` collision in this codebase. But per `feedback_window_loadround_shadow` MEMORY rule, if any harness helper of the same name is added in the future, rename to `renderRound` to avoid the recursive-shadow infinite-loop bug.)

## End-of-game chain (Victory + Stars Collected + AnswerComponent)

This is the multi-round + AnswerComponent + Victory + Stars Collected chain prescribed by PART-051 / game-planning Step 2e. It plays the celebration FIRST and reveals the carousel AFTER. Single-stage Next exit.

```js
async function onPuzzleSolved() {
  // 1. ProgressBar bumps FIRST (per progress_bar_round_complete MEMORY rule)
  progressBar.update(gameState.currentRound, gameState.lives);

  // 2. Celebration glow (cell-by-cell propagation across the board, ~600 ms)
  await playCelebrationGlow();   // CSS-driven, awaited via setTimeout(600)

  // 3. Awaited round-complete SFX + TTS (CASE 6)
  await FeedbackManager.sound.play('sound_round_complete', { sticker: 'celebration' });
  await FeedbackManager.playDynamicFeedback({
    audio_content: 'Brilliant! Every run adds up.',
    subtitle:      'Brilliant! Every run adds up.',
    sticker:       'celebration'
  });

  // 4. Record the puzzle-solve attempt
  recordAttempt({ is_correct: true, attempt_type: 'puzzle-solve' });
  gameState.score += 1;

  // 5. Branch on round number
  if (gameState.currentRound < 3) {
    nextRound();   // → Round-(N+1) intro TS
  } else {
    endGame(true); // → showVictory()
  }
}

function endGame(victory) {
  // 1. game_complete posted FIRST, BEFORE end-game audio
  const stars = getStars();
  postMessage({ type:'game_complete', data: { stars, metrics: buildMetrics() } });

  // 2. Routes to showVictory (always, since no Game Over branch)
  showVictory(stars);
}

function showVictory(stars) {
  transitionScreen.show({
    title:    'Victory',
    subtitle: 'You solved all three puzzles!',
    stars,
    buttons:  [{ text: 'Claim Stars', action: showStarsCollected }],
    persist:  true
  });
  // Victory SFX + per-tier VO play sequentially, awaited inside Stars Collected onMounted.
}

function showStarsCollected() {
  transitionScreen.show({
    title:    'Yay! Stars collected!',
    stars:    getStars(),
    buttons:  [],
    persist:  true,
    onMounted: async () => {
      await FeedbackManager.sound.play('sound_stars_collected', { sticker: null });
      postMessage({ type:'show_star', stars: getStars() });
      setTimeout(showAnswerCarousel, 1500);
      // CRITICAL: do NOT call transitionScreen.hide() — Stars Collected stays mounted as backdrop.
    }
  });
}

function showAnswerCarousel() {
  answerComponent.show({
    slides: buildAnswerSlidesForAllRounds()
  });
  floatingBtn.setMode('next');   // single-stage Next; appears AFTER answerComponent.show()
}

floatingBtn.on('next', () => {
  answerComponent.destroy();
  postMessage({ type: 'next_ended' });
  previewScreen.destroy();
  floatingBtn.destroy();
});

function buildAnswerSlidesForAllRounds() {
  const setLetter = SETS[gameState.setIndex];
  const rounds = fallbackContent.rounds.filter(r => r.set === setLetter); // length === 3
  return rounds.map(round => ({
    render(container) {
      // Title: "Puzzle N — <Stage label> (<size>×<size>)"
      // Subtitle: load-bearing-skill one-liner per stage (see "AnswerComponent carousel" above)
      // Body: non-interactive Kakuro grid
      //   - white cells render with their `solution` digit
      //   - all white cells in locked-mint colour
      //   - clue cells in dark-navy with cream sums in canonical positions
      //   - black walls solid
      //   - NO tap handlers, NO digit tray, NO hint button, NO drop-target hover ring
      renderAnswerForRound(round, container);
    }
  }));
}
```

**Single-stage Next exit guarantees:**
- Next is registered via `floatingBtn.on('next', ...)` (NOT `'submit'`); per game-planning Step 2c, after `setMode('next')` only the `'next'` handler fires.
- Next is set AFTER the AnswerComponent has been mounted, so the player sees the carousel + Next together.
- The handler is single-stage: destroy the component, post `next_ended`, destroy preview, destroy floating button. No `gameState.starsCollectedShown`-style flag. No two-stage handler.

## Try Again / Play Again handler (from Victory at <3⭐)

```js
function onPlayAgain() {
  // 1. Stop all audio
  FeedbackManager.stopAll();

  // 2. Hide all screens
  transitionScreen.hide();
  answerComponent.destroy();
  floatingBtn.destroy();

  // 3. Rotate the round set (BEFORE resetGameState — setIndex must persist)
  rotateRoundSet();

  // 4. Reset session state (lives, round, wrongs, hints, attempts, board state)
  resetGameState();

  // 5. Show the "Ready to improve your score?" motivation TS
  transitionScreen.show({
    title:    'Ready to improve your score?',
    subtitle: 'Try a fresh set of puzzles.',
    stars:    null,
    buttons:  [{ text: "I'm ready! 🙌", action: () => {
      transitionScreen.hide();
      progressBar.update(0, gameState.lives);
      showRoundIntroTS(1);
    }}],
    persist:  true
  });
}
```

This routes through the canonical Shape-2 motivation transition before re-entering Round 1. (CASE 13 — full restart.)

## Feedback patterns per event (with awaited / fire-and-forget annotations + CASE mapping)

The full feedback table is below. Annotations: **AWAIT** = the call must be `await`ed before the next line; **FAF** = fire-and-forget (no `await`). FeedbackManager calls match the project's PART-017 API.

| Event | Trigger | SFX | Animation | TTS | Sticker | Awaited? | CASE |
|---|---|---|---|---|---|---|---|
| Drag-start on a digit tile | dnd-kit `dragstart` (PointerSensor activation distance 6 px reached) | `sound_tap_soft` | tile lifts ~1.1× scale + soft shadow, follows pointer | none | none | FAF | CASE 9 (micro-interaction) |
| Drop a digit tile on an empty white cell | dnd-kit `dragend` over `cell-r-c` Droppable | none (drag-start tap already played) | digit scale-in (cell) 150 ms; tile snap-back to tray slot 150 ms | none | none | FAF | CASE 9 |
| Drag a digit tile from a non-locked cell back to the tray | dnd-kit `dragend` over `tray-clear` Droppable, `dragSourceCell != null` | `sound_tap_soft` | cell digit fade-out 100 ms; tile snap-back to tray slot 150 ms | none | none | FAF | CASE 9 |
| Run completed correctly (sum matches AND no repeats) | per-cell validation after digit lands; row-run OR col-run completes | `sound_run_complete_partial` (e.g. soft click-click) | per-cell green-glow propagation across run cells (~50 ms / cell, 100–250 ms total); cells transition to mint-green and become non-tappable | none | none | **FAF** (multi-step partial-progress, NOT round-complete) | CASE 5 / CASE 10 (multi-step partial-progress) |
| Wrong digit, row sum violated (run is now complete but sums wrong) | per-cell validation determines row-complete + sum ≠ clue | `sound_incorrect_partial` (soft, brief) | red flash on offending cell (300 ms ease-in-out, 1 cycle); shake ±4 px translateX over 300 ms (3 × 100 ms) | none | none | **FAF** (multi-step partial-wrong, CASE 7 multi-step variant) | CASE 7 multi-step |
| Wrong digit, column sum violated (run is now complete but sums wrong) | per-cell validation determines col-complete + sum ≠ clue | `sound_incorrect_partial` | red flash + shake (same as above) | none | none | **FAF** | CASE 7 multi-step |
| Wrong digit, repeats a digit already in the run | per-cell validation finds digit already in row-run OR col-run | `sound_incorrect_partial` | red flash + shake | none | none | **FAF** | CASE 7 multi-step |
| Wrong digit, BOTH row and column violated simultaneously | both checks fail | `sound_incorrect_partial` (single SFX, NOT doubled) | red flash + shake (single occurrence) | none | none | **FAF** | CASE 7 multi-step |
| Hint button tapped | `hintBtn.click` AND not in feedback | `sound_confirm_soft` | chosen empty cell highlights yellow 200 ms; digit slide-in (scale 0 → 1) over 150 ms; if completes a run, run-complete sequence chains | none | none | FAF | CASE 9 (hint as micro-interaction) |
| Drop on a locked-run cell (rejected) | dnd-kit `dragend` — cell is not registered as a Droppable, falls through to drag-cancel branch | `sound_suppressed_tap` (very soft, ~50 ms) | tile snap-back to tray slot 150 ms; no animation on the locked cell | none | none | FAF | CASE 9 |
| Drag cancelled (released over a wall, clue, body, or anywhere not a droppable) | dnd-kit `dragend` with no drop target | `sound_suppressed_tap` | tile snap-back to tray slot 150 ms | none | none | FAF | CASE 9 |
| Puzzle solved (all white cells correct, last cell triggers it) | per-cell validation finds all white cells correctly filled AND every run sums correctly | `sound_round_complete` | full-grid celebration glow ~600 ms (cell-by-cell propagation outward from grid centre) | dynamic TTS: "Brilliant! Every run adds up." OR "Solved! That last run was tricky." (context-aware per puzzle id) | `celebration` | **AWAIT** (SFX awaited; THEN TTS awaited) | CASE 6 |
| Final puzzle (Puzzle 3) solved → Victory | as above + `currentRound === 3` | `sound_game_victory` then VO per star tier | Victory TS renders | "Perfect! Every run, no hint." (3⭐) / "Solved! One small slip." (2⭐) / "You got there — that was tough!" (1⭐) | `celebration` | **AWAIT** all (sequentially) | CASE 11 |
| Stars Collected mounted | TS `onMounted` fires after Victory `Claim Stars` tap | `sound_stars_collected` | TS persists as backdrop | none | none | **AWAIT** SFX, then `setTimeout(1500ms)` to AnswerComponent | CASE 11 (continuation) |
| AnswerComponent shown | `showAnswerCarousel()` after the 1500 ms setTimeout | none | carousel slides in over the Stars Collected backdrop | none | none | n/a | (no SFX at component reveal) |
| Floating Next tapped (end-of-game exit) | `floatingBtn.on('next')` fires | none | components destroy in sequence | none | none | n/a | CASE 11 (exit) |
| Play Again tapped (Victory < 3⭐) | `[Play Again]` button on Victory TS | `sound_tap_soft` | TS hides, motivation TS shows | none | none | FAF | CASE 13 (restart) |
| Try Again — wait, no Game Over | (no event — there is no Game Over branch in this game) | n/a | n/a | n/a | n/a | n/a | n/a |
| Tab switch / screen lock | `visibilitychange` event (handled by VisibilityTracker) | static + stream audio paused | VisibilityTracker's PopupComponent renders the pause overlay (autoShowPopup default) | none | none | n/a | CASE 14 |
| Tab restored | `visibilitychange` event | audio resumes | VisibilityTracker dismisses its own popup | none | none | n/a | CASE 15 |
| Audio failure (any awaited audio rejects) | promise rejection in any `await FeedbackManager.*` call | n/a | try/catch swallows; visual feedback (green flash, red flash, hint banner) still renders | none | none | n/a | CASE 16 |

**Why mid-puzzle wrongs are FAF (no awaited TTS):** the concept frames Kakuro as "quiet and deliberate, audio is minimal — only on success, on error, and on completion. The student should feel like they're the one driving the pace." An awaited TTS on every wrong digit would make the game feel chatty and slow. Mid-puzzle wrongs use the hint banner (visual, on-screen, persistent for 3 s) as the "explanation" surface, with only a short SFX as the audio cue. This is the multi-step CASE 7 variant explicitly allowed by the Feedback skill.

**Why run-complete is FAF (no awaited TTS, just SFX):** a run-complete is a *partial-progress* beat (CASE 5 / CASE 10) — the puzzle is not yet solved. Awaited audio at run-completion would block the student's flow on every locked run (potentially 4–6 times per puzzle). FAF SFX + visual green-glow is the right pacing.

**Why puzzle-solve IS awaited:** the puzzle-solve beat is the round-complete moment (CASE 6) — the awaited round-complete SFX + TTS lands the success with full weight, which is what the concept asks for ("only on success, on error, and on completion").

**Priority on simultaneous row+column violations:** when a wrong digit violates both row sum AND column sum simultaneously, the hint banner displays the **row** message (reading-order priority: row > column). `recordAttempt` tags the misconception as `multi-constraint-collapse-failure` (per spec). `wrongAttempts` increments by **1** (single placement = single attempt, regardless of how many constraints were violated).

## Hint mechanic detail

```js
function onHintTap() {
  if (gameState.isProcessing || gameState.isDragging) return;

  // 1. Find all currently-empty white cells in the active puzzle
  const emptyCells = [];
  const round = gameState.currentRoundData;
  for (let r = 0; r < round.size; r++) {
    for (let c = 0; c < round.size; c++) {
      const cell = round.grid[r][c];
      if (cell.kind === 'white' && !gameState.placedDigits[`${r},${c}`]) {
        emptyCells.push({ r, c });
      }
    }
  }
  if (emptyCells.length === 0) return; // puzzle already solved (defensive)

  // 2. Uniform random selection
  const choice = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const cell = round.grid[choice.r][choice.c];
  const correctDigit = cell.solution;

  // 3. Visual: highlight yellow 200 ms, then scale-in digit
  highlightCellYellow(choice.r, choice.c, 200);
  setTimeout(() => {
    placeDigit(choice.r, choice.c, correctDigit, /* fromHint */ true);
    // placeDigit handles run-completion check, run-lock, puzzle-solve check.
  }, 200);

  // 4. Counter
  gameState.hintsUsed += 1;

  // 5. SFX
  FeedbackManager.sound.play('sound_confirm_soft'); // FAF
}
```

If filling that cell completes a run, the standard run-complete green-flash + lock fires immediately afterward (so a hint can chain into a run-lock). If the hint completes the entire puzzle (last empty cell), the puzzle-solved beat fires (CASE 6).

## State machine sketch — `gameState`

```js
const gameState = {
  // Persistent across in-session restarts (NOT cleared by resetGameState):
  setIndex: 0,                         // 0=A, 1=B, 2=C; rotates BEFORE resetGameState on restart

  // Per-session (reset by resetGameState on restart):
  lives: 99,                           // never decremented; never displayed
  currentRound: 1,                     // 1..3
  score: 0,                            // 0..3 (puzzles solved this session)
  wrongAttempts: 0,                    // session-wide; increments on every wrong digit
  hintsUsed: 0,                        // session-wide; increments on every hint tap
  attempts: [],                        // recordAttempt log
  isProcessing: false,                 // input block during awaited puzzle-solve sequence

  // Per-puzzle (cleared by loadRound between Puzzle N → N+1):
  isDragging: false,                   // true while a tile is in flight (dragstart→dragend)
  dragSourceCell: null,                // 'r,c' if the tile was picked up from a cell; null if from tray
  placedDigits: {},                    // { 'r,c': digit } — current digit assignments
  lockedRuns: new Set(),               // run ids that have been validated and locked
  currentRoundData: null               // the round object from fallbackContent.rounds[i]
};
```

**Key transitions:**

- `boot → Preview` (PART-039 shows `previewInstruction` + audio).
- `Preview → Welcome / Round-1 intro TS` on Start tap.
- `Round-N intro TS → Gameplay (Puzzle N)` on tap-dismiss → `loadRound(N)`.
- `Gameplay → Round-(N+1) intro TS` on solve, after awaited round-complete feedback, when `N < 3`.
- `Gameplay (Puzzle 3) → Victory TS` on solve, after awaited round-complete feedback.
- `Victory TS → Stars Collected TS` on `[Claim Stars]` tap.
- `Stars Collected TS → AnswerComponent + Next button` after `~1500 ms setTimeout` inside Stars Collected `onMounted`.
- `AnswerComponent → exit` on Next tap (single-stage: destroy + post `next_ended` + destroy preview + destroy floating).
- `Victory TS (with <3⭐) → Motivation TS → Round-1 intro TS` on `[Play Again]` tap, after `setIndex` rotation + `resetGameState()`.

## AnswerComponent end-of-game payload

The carousel reveals AFTER Stars Collected's celebration beat (per PART-051's required end-game chain). It builds 3 slides via `buildAnswerSlidesForAllRounds()` (function definition above). Each slide:

- **Title:** "Puzzle 1 — Warm-up (4×4)" / "Puzzle 2 — Standard (5×5)" / "Puzzle 3 — Stretch (6×6)".
- **Subtitle:** load-bearing-skill one-liner per stage. Stage 1: "Decomposition fluency — every run had only one way to add up." Stage 2: "Cross-clue intersection — the row says 3-or-4, the column says 4-or-5, so the cell must be 4." Stage 3: "Triple-run elimination — three options held, collapsed by the column."
- **Body (the solved grid, non-interactive):**
  - All white cells render with their `solution` digit, in the locked-mint background colour.
  - Clue cells render with row-sum (top-right) and col-sum (bottom-left) in cream-on-navy.
  - Walls render solid navy.
  - **No tap handlers, no digit tray, no Hint button, no drop-target hover ring.**

Slide payload uses `{render(container){...}}` callbacks (NOT `{html: '...'}` strings — per PART-051 validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`). Each `render` is self-contained and reads only `round` data; no DOM lookups outside `container`.

## Cross-cutting rules applied

- **Pause overlay** comes from `VisibilityTracker`'s PopupComponent (`autoShowPopup` default). NEVER build a custom overlay — confirmed in `feedback_pause_overlay` MEMORY rule.
- **TimerComponent** is NOT used (no timer in this game). The `timer_preview_integration` MEMORY rule does not apply.
- **ProgressBar bumps FIRST** in the round-complete handler — `progressBar.update(currentRound, lives)` is the FIRST line of `onPuzzleSolved`, before any awaited SFX / TTS / `nextRound()` / `endGame()`. Ensures Victory shows the correct N/N progress on the final round (per `progress_bar_round_complete` MEMORY rule).
- **Autonomous Alfred run** — the orchestration step that runs this game's pipeline auto-approves each HUMAN REVIEWS gate and runs end-to-end through Phase 3 (Deploy) (per `feedback_autonomous_alfred` MEMORY rule). No human gate blocks the build.
- **Don't shadow `loadRound`** — confirmed `loadRound` is safe in this codebase. If a `window.loadRound` harness helper is ever added, rename to `renderRound` (per `feedback_window_loadround_shadow` MEMORY rule).
- **Playwright MCP** is the only test driver — orchestration steps 6/7/8 use Playwright MCP tools, not Bash chromium one-liners (per `feedback_playwright_mcp_only` MEMORY rule).
