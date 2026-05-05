# Game Flow: Queens — 5×5 Multi-Constraint Reasoning

## One-liner

Solve three 5×5 coloured-region queen puzzles per session — place 5 queens per board so no two share a row, column, region, or touch corners — using ✖ marks as a free working-memory scaffold and 2 lives shared across the whole 3-puzzle session.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────────┐  tap   ┌──────────────┐  auto   ┌──────────────────┐
│ Preview  ├───────▶│ Welcome /    ├───────▶│ Round-1      ├────────▶│ Gameplay:        │
│ 🔊 prev  │        │ Round-1 TS   │        │ intro TS     │ (after  │ Puzzle 1 (5×5)   │
│   audio  │        │ "Puzzle 1    │        │ 🔊 "Puzzle 1 │  sound) │ palette = vivid  │
│ "Start"  │        │  of 3"       │        │  of 3"       │         │ glyph    = ♛     │
└──────────┘        └──────────────┘        └──────────────┘         │ rule numbering   │
                                                                     │   = emoji        │
                                                                     │  ┌─────────────┐ │
                                                                     │  │ tap a cell: │ │
                                                                     │  │  empty → ✖  │ │
                                                                     │  │  → ♛ → empt │ │
                                                                     │  │ Reset btn   │ │
                                                                     │  └─────────────┘ │
                                                                     └────────┬─────────┘
                                                       (auto-validate on every queen placement)
                                                                              │
                  ┌───────────────────┬──────────────────┬───────────────────┐│
                  │                   │                  │                   ││
                  ▼ safe placement    ▼ attacking placement                  ▼▼ puzzle solved
         ┌────────────────┐    ┌────────────────────────┐          ┌──────────────────┐
         │ chime SFX (FF) │    │ isProcessing=true      │          │ celebration glow │
         │ glyph scale-in │    │ wrongSFX awaited+sad   │          │   propagates     │
         │ no TTS, no     │    │ TTS rule-named (priority           │ progressBar.    │
         │ input block    │    │   row>col>region>diag) │          │  update FIRST    │
         │ stays placed   │    │ flash red 600ms        │          │ round-complete   │
         └────────┬───────┘    │ revert queen, life --  │          │   SFX awaited +  │
                  │            │ heart-pop animation    │          │   celebration    │
                  │            │ isProcessing=false     │          │   sticker        │
                  │            └────┬──────────┬────────┘          │ TTS "Brilliant!  │
                  │                 │          │                   │  All five queens │
                  │                 │          │ lives = 0         │  are safe."      │
                  │                 │          │                   │ awaited          │
                  ▼                 │          │                   └─────────┬────────┘
         player keeps placing       │          │                             │ auto-advance
         queens until 5 are placed  │          │                             │
                                    │          ▼                             ▼
                                    │  ┌────────────────────┐   currentRound===3 ?
                                    │  │ Game Over (TS)     │   ┌─────────┴──────────┐
                                    │  │ "Tough puzzle!     │   │ no                 │ yes
                                    │  │  Take a breath     │   ▼                    ▼
                                    │  │  and try again."   │   ┌──────────────┐  ┌──────────────────────┐
                                    │  │ stars per session  │   │ Round-N      │  │ Victory (TS,         │
                                    │  │   so far           │   │ intro TS     │  │   intermediate)      │
                                    │  │ game_complete      │   │ "Puzzle N    │  │ 🔊 victory SFX +     │
                                    │  │  posted FIRST      │   │  of 3"       │  │   VO                 │
                                    │  │ then game_over     │   │ tap          │  │ stars rendered       │
                                    │  │   audio (CASE 8)   │   └──────┬───────┘  │ game_complete posted │
                                    │  │ [Try Again]        │          │          │   BEFORE end-game    │
                                    │  └─────────┬──────────┘          ▼          │   audio              │
                                    │            │ tap                next puzzle │ [Claim Stars]        │
                                    │            ▼                                └─────────┬────────────┘
                                    │   rotateRoundSet()                                    │ tap
                                    │   resetGameState()                                    ▼
                                    │   lives = 2 (RESET)                       ┌────────────────────┐
                                    │   currentRound = 1                        │ Stars Collected    │
                                    │   queens cleared, marks cleared           │   (TS, persist,    │
                                    │   → Round-1 intro TS                      │     no buttons)    │
                                    │                                           │ 🔊 stars_collected │
                                    │ wrong placement, lives > 0 still:         │   + ✨ show_star   │
                                    └─ board re-enabled, queen reverted ────┐   │   + setTimeout     │
                                       student picks again, lives carry     │   │   ~1500ms →       │
                                       across to next puzzle                │   │   showAnswerCarousl│
                                                                            │   └─────────┬──────────┘
                                                                            │             │ TS stays mounted
                                                                            │             ▼
                                                                            │  ┌──────────────────────┐
                                                                            │  │ Correct Answers      │
                                                                            │  │ carousel (PART-051)  │
                                                                            │  │ 3 slides, 1/puzzle,  │
                                                                            │  │ solved 5×5 boards    │
                                                                            │  │ FloatingBtn 'next'   │
                                                                            │  │   appears AFTER show │
                                                                            │  └─────────┬────────────┘
                                                                            │            │ tap Next
                                                                            │            ▼
                                                                            │  single-stage exit:
                                                                            │  answerComponent.destroy()
                                                                            │  postMessage({type:'next_ended'})
                                                                            │  previewScreen.destroy()
                                                                            │  floatingBtn.destroy()
                                                                            │
                      Pause overlay: VisibilityTracker's PopupComponent ────┘
                      auto-shows on tab-hidden (Case 14); audio pauses;
                      no timer to pause. On resume (Case 15), audio
                      resumes. NEVER build a custom pause overlay.

                      Reset Puzzle button (per-puzzle):
                        soft confirm SFX (fire-and-forget)
                        clears all marks/queens on current puzzle
                        does NOT refund lives
                        does NOT advance currentRound
```

## Shape

**Shape:** Shape 2 Multi-round (3 rounds, one per stage).

## Changes from default

- **Lives = 2 SHARED across the entire 3-puzzle session.** This is non-standard. `gameState.lives` is decremented on attacking placements and **NOT reset between rounds**. `resetGameState()` (called on round-transition) MUST NOT touch `lives`. Lives are reset to 2 ONLY on Try-Again / Play-Again (full session restart).
- **No timer (PART-006 omitted).** L4 Analyze deserves deliberation.
- **No FloatingButton (PART-050) on the gameplay screens.** Placement auto-validates per tap; the puzzle auto-detects solve and auto-advances. PART-050 IS used at end-of-game ONLY for the single-stage Next exit after the AnswerComponent carousel (per PART-051's required end-game chain). Validator note: archetype 6 lists PART-050 as conditional ("if spec's flow has an explicit Check CTA — auto-detect-on-solve variants skip it during gameplay"); we are the auto-detect variant.
- **Tri-state cell cycle (empty → ✖ → ♛/👑 → empty).** ✖ marks are unlimited and free — they do NOT cost lives, do NOT trigger TTS, do NOT block input. They are the central scaffolding mechanism for externalising working memory.
- **Per-stage cosmetic graduation:** Stage 1 vivid + ♛ + emoji-numbered rules; Stage 2 pastel + 👑 + emoji-numbered; Stage 3 muted + 👑 + plain numerals. Same mechanic across stages, only the surface skin and region geometry change.
- **Custom star rule (NOT default 90/66/33%):**
  - **3⭐** = all 3 puzzles solved AND both lives still intact at end (perfect run).
  - **2⭐** = all 3 puzzles solved with 0 or 1 lives intact, OR exactly 2 puzzles solved (regardless of lives).
  - **1⭐** = exactly 1 puzzle solved.
  - **0⭐** = no puzzles solved.
- **Round-set rotation on every restart.** `setIndex` rotates 0 → 1 → 2 → 0 BEFORE `resetGameState()` on every Try Again / Play Again. Set A on first attempt, Set B after first restart, Set C after second restart, then cycles back. `setIndex` resets to 0 only on fresh page load, NOT on in-session restart — i.e. `resetGameState()` MUST NOT clear `setIndex`. Region partitions and unique solutions differ across A/B/C but parallel difficulty per stage holds (see `regions.md`).
- **Reset Puzzle button.** Per-puzzle, secondary style, below the board. Tap clears all marks + queens on the current puzzle without refunding lives. Distinct from the global Try Again restart.
- **AnswerComponent end-of-game payload = 3 slides** (one per stage). Each slide renders a non-interactive 5×5 coloured board with the round's `paletteHex` and the 5 queen glyphs (round's `glyph`) at the solved positions from `answer.queens`.
- **Misconception tagging on attacks.** Each attacking placement records a single misconception tag selected by the highest-priority violated rule (row > column > region > diagonal). Tags: `row-constraint-overlooked`, `column-constraint-overlooked`, `region-constraint-overlooked`, `diagonal-adjacency-overlooked`.

## Stages

| Stage | Round | Palette | Glyph | Rule numbering | Geometry knob | Deductions | Target first-solve |
|-------|-------|---------|-------|----------------|---------------|------------|--------------------|
| 1 | 1 — Puzzle 1 | Vivid (E63946 / F4A261 / F1C453 / 2A9D8F / 3D8BFD) | ♛ U+265B | 1️⃣ 2️⃣ 3️⃣ 4️⃣ | Large rectangular blobs (min size 4, max 7); no size-2 regions | 1–2 | ~80 % |
| 2 | 2 — Puzzle 2 | Pastel (FFB3B3 / FFD6A5 / FDFFB6 / CAFFBF / 9BF6FF) | 👑 U+1F451 | 1️⃣ 2️⃣ 3️⃣ 4️⃣ | One L-shape or off-axis size-3 strip; mid-irregular | 2–3 | ~60 % |
| 3 | 3 — Puzzle 3 | Muted (C97B6F / C9A372 / 7FA593 / 7B92A5 / 9483A8) | 👑 U+1F451 | 1. 2. 3. 4. | One size-2 region forces tightly-constrained queen; diagonal-touch is load-bearing | ≥ 3 | ~40 % |

Round 1 → solved → Round-2 intro TS → Round 2 → solved → Round-3 intro TS → Round 3 → solved → Victory.
At any point, lives = 0 → Game Over (CASE 8 audio sequence).

## Round-by-round player experience

**Puzzle 1 (Stage 1 — vivid):** A bright, saturated 5×5 splashes onto the screen. Five large rectangular regions in red / orange / yellow / teal / blue, each spanning 4–7 cells. Above the board, a four-rule panel uses emoji numerals (1️⃣ 2️⃣ 3️⃣ 4️⃣). Two pink hearts and "Puzzle 1 of 3" sit in the header. The student taps cells: each cell cycles empty → ✖ → ♛ → empty. Most students place 2–3 ♛ glyphs and immediately recognise the four constraints visually (rows/columns are obvious, regions read from colour, diagonal-touch is the new wrinkle). Expected solve: 1–3 minutes. Most students finish with both hearts intact.

**Puzzle 2 (Stage 2 — pastel):** Same mechanic, softer palette (pastel red / orange / yellow / green / cyan), and crowns 👑 instead of queens ♛. One region is an L-shape and a small size-3 strip cuts across — students who tried pure trial-and-error in Puzzle 1 will discover that strategy is too costly here (2 lives don't last). The ✖ mark becomes the explicit working-memory tool. Lives carry over from Puzzle 1: a student who lost 1 heart in Puzzle 1 starts Puzzle 2 with 1 heart remaining. Expected solve: 2–5 minutes.

**Puzzle 3 (Stage 3 — muted):** Final puzzle. Muted brick / ochre / sage / slate / plum palette with crowns 👑 and plain "1. 2. 3. 4." rule numbering — visual maturity step. One region is only 2 cells, forcing a tight constraint on which row that region's queen can occupy. Two regions interlock so that diagonal-touch is the load-bearing rule. ≥ 3 explicit deductions are needed; pure trial-and-error WILL exhaust the 2-life budget. Expected solve: 3–7 minutes. ~40 % of students clear this on first attempt — the mastery gate.

## Scoring + lives logic

**Per-puzzle scoring:** binary. A puzzle is solved iff all 5 queens land satisfying the four constraints simultaneously. `gameState.score += 1` on solve. Max session score = 3.

**Lives semantics:**
- `gameState.lives` starts at 2 on session start.
- **Decremented ONLY on attacking placements.** Mark/unmark/cycle-empty taps do NOT cost lives. Reset Puzzle does NOT cost lives.
- **NOT refunded between puzzles.** A wrong placement on Puzzle 1 carries over to Puzzle 2's starting life count.
- **NOT refunded on Reset Puzzle.** Reset clears the board state but the life ledger persists.
- **Reset to 2 on Try-Again / Play-Again** (full session restart).
- If `lives === 0` after a wrong placement, the wrong-answer SFX completes (CASE 8), then the Game Over TS renders (`game_complete` posted BEFORE game-over audio), regardless of which puzzle the student was on.

**Star calculation** (custom — see `scoring.md` for formula):
- 3 puzzles solved AND lives === 2 → **3⭐**
- 3 puzzles solved AND lives < 2 (i.e. 0 or 1) → **2⭐**
- 2 puzzles solved (any lives) → **2⭐**
- 1 puzzle solved → **1⭐**
- 0 puzzles solved → **0⭐**

In code:
```
if (puzzlesSolved === 3 && livesAtEnd === 2) return 3;
if (puzzlesSolved >= 2) return 2;
if (puzzlesSolved === 1) return 1;
return 0;
```

**Routing to Victory vs Game Over:** Routes through Victory (intermediate) → Stars Collected when the player completes Puzzle 3 with `lives > 0` at the moment of solve. Routes through Game Over when `lives === 0` after an attacking placement, regardless of how many puzzles were solved.

## Custom star calculation procedure

When a puzzle solves OR lives reach 0, `endGame(victory)` runs:

1. Compute `puzzlesSolved = gameState.attempts.filter(a => a.is_correct === true && a.attempt_type === 'puzzle-solve').length`.
   (Each puzzle-solve event pushes one `is_correct: true` attempt; each attacking placement pushes one `is_correct: false` attempt with the appropriate misconception tag — see `feedback.md` and `scoring.md`.)
2. Read `livesAtEnd = gameState.lives` (already decremented if reaching here via attack).
3. Apply the rule above to produce `stars ∈ {0,1,2,3}`.
4. Post `game_complete` with `data.stars = stars` and the metrics payload.
5. If `victory === true && stars >= 1`, route to Victory TS → Stars Collected → AnswerComponent → Next.
6. If `lives === 0`, route to Game Over TS → Try Again.

## Feedback choreography per outcome

(Full table in `feedback.md`; this is the per-outcome summary.)

- **Mark / unmark / cycle empty:** soft tap SFX, fire-and-forget, ~50 ms. No sticker, no TTS, no input block. CASE 9.
- **Safe queen placement (no violation, board not yet solved):** soft chime SFX, fire-and-forget, ~150 ms. Queen glyph scale-in (~200 ms). No TTS, no input block. Player continues placing.
- **Attacking queen placement (≥ 1 violation):**
  - `gameState.isProcessing = true` BEFORE any await.
  - Both offending queens flash red `#E63946` for 600 ms (3 cycles of 200 ms).
  - `await FeedbackManager.sound.play('sound_incorrect', {sticker:'sad'})` — wrong-answer SFX with sad sticker.
  - `await FeedbackManager.playDynamicFeedback({audio_content: ruleMessage, subtitle: ruleMessage, sticker:'sad'})` — TTS announcing the violated rule per priority (row > column > region > diagonal).
  - After audio: queen reverts to empty (canonical), heart-pop animation on lives counter, `gameState.lives -= 1`.
  - `gameState.isProcessing = false` on next tick.
  - `recordAttempt({ is_correct: false, attempt_type: 'placement-attack', misconception_tag: <selected> })`.
  - If `gameState.lives === 0` → `endGame(false)` (Game Over branch).
- **Puzzle solved (all 5 queens correct):**
  - Per-cell celebration glow propagates across the board (~600 ms total, staggered).
  - `progressBar.update(currentRound, lives)` fires FIRST (per `progress_bar_round_complete` MEMORY rule).
  - `await FeedbackManager.sound.play('sound_round_complete', {sticker:'celebration'})`.
  - `await FeedbackManager.playDynamicFeedback({audio_content:'Brilliant! All five queens are safe.', subtitle:'Brilliant! All five queens are safe.', sticker:'celebration'})`.
  - `recordAttempt({ is_correct: true, attempt_type: 'puzzle-solve' })`.
  - If `currentRound < 3` → `nextRound()` → Round-(N+1) intro TS.
  - If `currentRound === 3` → `endGame(true)` → Victory.
- **Reset Puzzle tapped:** soft confirm SFX (fire-and-forget). All marks/queens on current puzzle clear instantly. Lives unchanged. No TTS, no input block.
- **Lives reach 0 (last life lost):** wrong-answer SFX completes FIRST (CASE 8), THEN `endGame(false)` is invoked → `game_complete` posted BEFORE Game Over audio → Game Over TS renders → tap "Try Again".
- **All 3 puzzles solved (Victory path):** Victory TS appears with stars rendered → `game_complete` posted → tap "Claim Stars" → Stars Collected TS (`onMounted` plays yay sound + `show_star` animation) → after ~1500 ms `setTimeout` → AnswerComponent carousel reveals → Floating Next button appears → tap → single-stage exit (`answerComponent.destroy()`, post `next_ended`, destroy preview, destroy floating).
- **Try Again (from Game Over TS):** all audio stopped → `setIndex` rotates → `resetGameState()` (which DOES reset `lives` to 2, queens, marks, currentRound to 1, but does NOT clear `setIndex`) → Round-1 intro TS.

## State machine sketch

`gameState` shape:

```js
const gameState = {
  // Persistent across in-session restarts (do NOT clear in resetGameState):
  setIndex: 0,                  // 0=A, 1=B, 2=C — rotates BEFORE resetGameState on Try Again

  // Per-session (reset by resetGameState on Try Again ONLY):
  lives: 2,                     // SHARED across the 3-puzzle session, NOT reset between rounds
  currentRound: 1,              // 1..3
  score: 0,                     // 0..3 (puzzles solved this session)
  attempts: [],                 // recordAttempt log (placement-attack + puzzle-solve events)
  isProcessing: false,          // input block during awaited feedback

  // Per-puzzle (cleared by loadRound between Puzzle N → Puzzle N+1, and by Reset Puzzle):
  cells: Array(25).fill(0),     // 0=empty, 1=mark (✖), 2=queen (♛/👑)
  placedQueens: [],             // [{r,c}] — current queens on the current puzzle's board
  currentRoundData: null,       // the round object from fallbackContent.rounds[i]
};
```

**Key transitions:**

- `boot → Preview` (PART-039 shows `previewInstruction` + audio).
- `Preview → Welcome / Round-1 intro TS` on Start tap (`previewScreen.hide()` + `transitionScreen.show({title:"Puzzle 1 of 3", ...})`).
- `Round-N intro TS → Gameplay (Puzzle N)` on tap-dismiss (`renderRound(N)` — note: NOT `loadRound`, per `feedback_window_loadround_shadow` MEMORY rule).
- `Gameplay (Puzzle N) → Round-(N+1) intro TS` on solve, after awaited round-complete feedback, when `N < 3`.
- `Gameplay (Puzzle 3) → Victory TS` on solve, after awaited round-complete feedback.
- `Gameplay (any) → Game Over TS` on attacking placement that brings lives to 0, after CASE 8 wrong-answer SFX.
- `Victory TS → Stars Collected TS` on `[Claim Stars]` tap.
- `Stars Collected TS → AnswerComponent carousel + Next button` after `~1500ms setTimeout` inside Stars Collected `onMounted`.
- `AnswerComponent → exit` on Next tap (single-stage: destroy + post `next_ended` + destroy preview + destroy floating).
- `Game Over TS → Round-1 intro TS` on `[Try Again]` tap, after `setIndex` rotation + `resetGameState()`.

**Round-set cycling specifics:**

```js
function rotateRoundSet() {
  gameState.setIndex = (gameState.setIndex + 1) % 3;   // 0 → 1 → 2 → 0 → ...
}

function resetGameState() {
  // Reset session state
  gameState.lives = 2;
  gameState.currentRound = 1;
  gameState.score = 0;
  gameState.attempts = [];
  gameState.isProcessing = false;
  gameState.cells = Array(25).fill(0);
  gameState.placedQueens = [];
  gameState.currentRoundData = null;
  // CRITICAL: do NOT touch gameState.setIndex — it persists across in-session restarts.
}
```

Try Again handler invokes `rotateRoundSet()` BEFORE `resetGameState()`, so the next session uses the new set:

```js
function onTryAgain() {
  rotateRoundSet();         // 0→1→2→0
  resetGameState();         // resets lives/round/score/cells but NOT setIndex
  showRoundIntroTS(1);      // → Puzzle 1 of new set
}
```

## AnswerComponent end-of-game payload

The carousel reveals AFTER Stars Collected's celebration beat (per PART-051's required end-game chain). It builds 3 slides via `buildAnswerSlidesForAllRounds()`:

```js
function buildAnswerSlidesForAllRounds() {
  // Filter rounds for the current setIndex (3 of the 9 round objects).
  const setLetter = ['A','B','C'][gameState.setIndex];
  const rounds = fallbackContent.rounds.filter(r => r.set === setLetter); // length === 3
  return rounds.map(round => ({
    render(container) {
      // 1. Title: "Puzzle N — <palette name>" (e.g. "Puzzle 1 — Vivid")
      // 2. Subtitle: load-bearing-rule one-liner (e.g. Stage 3:
      //    "Two queens cannot touch corners — that's the rule most students miss.")
      // 3. Non-interactive 5×5 board:
      //    - cells painted with round.paletteHex[round.regions[r][c]]
      //    - cell at (r,c) === answer.queens[i] for some i renders round.glyph centered
      //    - other cells render plain (no glyph, no ✖)
      //    - NO tap handlers, NO lives indicator, NO Reset button
      renderAnswerForRound(round, container);
    }
  }));
}
```

Slide payload uses `{render(container){...}}` callbacks (NOT `{html: '...'}` strings — per PART-051 validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`). Each `render` is self-contained: reads only `round` data, no DOM lookups outside `container`.

End-game chain (multi-round + Victory + AnswerComponent — per Step 2e):

1. `await FeedbackManager.play('round-complete')` — final round-complete feedback awaited.
2. `postMessage({type:'game_complete', data:{stars, metrics}})`.
3. `endGame(true)` → `showVictory()`.
4. `transitionScreen.show({title:'Victory', stars, buttons:[{text:'Claim Stars', action: showStarsCollected}], persist:true})`.
5. On Claim Stars tap → `showStarsCollected()`.
6. `transitionScreen.show({title:'Yay! Stars collected!', stars, buttons:[], persist:true, onMounted})` — `onMounted` plays `sound_stars_collected`, fires `show_star` postMessage, `setTimeout(showAnswerCarousel, 1500)`.
7. `showAnswerCarousel()`: `answerComponent.show({slides: buildAnswerSlidesForAllRounds()})`, then `floatingBtn.setMode('next')`.
8. `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({type:'next_ended'}); previewScreen.destroy(); floatingBtn.destroy(); })`.

The Stars Collected TS is the terminal celebration backdrop; it stays mounted while AnswerComponent + Next layer over it. Both tear down together on Next.
