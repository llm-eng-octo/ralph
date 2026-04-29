# Game Flow — Hexa Numbers

**One-liner:** A 3-round Board Puzzle (archetype #6) where the student drags 13 colour-coded numbered hexagons into 13 blank slots so that all three target sums (4279, 7248, 9346 in Set A) hold simultaneously, then taps CHECK to validate the whole arrangement.

**Shape:** Multi-round (Shape 2) with two deltas — (a) **No Game Over branch** because `lives = 0`, and (b) **wrong CHECK does NOT loop back to the same round** — wrong submit advances to the next round (or to Victory/Stars Collected if it was the final round).

**Archetype:** Board Puzzle (#6).
**totalRounds:** 3 (one set played per session — B1 → B2 → B3 cosmetic progression within the active set).
**Lives:** 0 (no game-over path).
**Star thresholds:** 3★ = 3 first-CHECK solves, 2★ = 2 solves, 1★ = 1 solve, 0★ still reaches Results.
**Drag library:** Pattern P6 with `@dnd-kit/dom@beta` (CDN: `https://esm.sh/@dnd-kit/dom@beta`). **Step 4 (Build) MUST run in `[MAIN CONTEXT]`** per the orchestration `Step 4 execution mode override` table — sub-agents cannot fetch context7 docs for `@dnd-kit/dom@beta` and would silently hand-roll a substitute, tripping validator rule `GEN-DND-KIT`.
**Round-set cycling:** validator `GEN-ROUNDSETS-MIN-3` — 9 round objects across Sets A/B/C; `gameState.setIndex` rotates A → B → C → A on Try Again **before** `resetGameState()`.

---

## 1. Screen flow

Every screen and every transition the student traverses in a single session.

```
[Preview Screen — PART-039]
    │  (showGameOnPreview: false; previewInstruction + previewAudioText
    │   are the SOLE source of how-to-play copy for the whole game)
    │  tap "Got it" / Start
    ▼
[Welcome / Level Screen — TransitionScreen ("Get Ready", stars=0)]
    │  brief intro card; tap-dismissible
    ▼
[Round 1 Transition — TransitionScreen ("Round 1 — Variant B1")]
    │  shows variant chrome (target colour = dark teal-grey; rule glyph 1⃣/2⃣)
    │  tap-dismissible
    ▼
[Gameplay R1 — Honeycomb workspace + 13-hex pool tray + CHECK FloatingButton]
    │  CHECK is disabled until all 13 slots are filled with matching-colour hexagons
    │
    │  tap CHECK (FloatingButton submit handler)
    ▼
[Validate 3 target sums]
    │
    ├─ all 3 targets pass ──► [Correct feedback in-place: green flash, ✓ badges, awaited correct SFX + sticker, fire-and-forget TTS] ──► auto-advance
    │                                                                                                                                       │
    └─ at least 1 target fails ─► [Wrong feedback in-place: red conflict slots, ✓/✗ badges per target,                                    │
                                    awaited wrong SFX + sad sticker, fire-and-forget TTS,                                                    │
                                    CHECK button morphs to NEXT (setMode('next') AFTER feedback awaits),                                    │
                                    after ~1500ms correct arrangement is briefly revealed]                                                  │
                                          │  tap NEXT (or 3500ms auto-advance)                                                              │
                                          ▼                                                                                                  ▼
                                     ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
                                     │  IF currentRound < 3:  [Round (N+1) Transition] ──► [Gameplay R(N+1)] ──► CHECK ──► loop            │
                                     │  IF currentRound == 3: [Victory TransitionScreen ──► Stars Collected TransitionScreen ──►          │
                                     │                          AnswerComponent carousel ──► single-stage Next exit]                       │
                                     └────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Round-complete handler ordering (CRITICAL)

Per project memory `progress_bar_round_complete.md`, in the round-complete handler:

1. `progressBar.update(currentRound, lives)` — **FIRST**, before any awaited SFX, before `nextRound()`, before `endGame()`. Otherwise the final round's Victory shows N-1/N.
2. `recordAttempt({...})` — capture per-round arrangement BEFORE audio starts.
3. `await FeedbackManager.play('correct' | 'incorrect')` — full audio + sticker.
4. If wrong: render reveal-correct-arrangement animation (~1500ms after wrong-feedback), morph CHECK → NEXT via `floatingBtn.setMode('next')`.
5. If correct OR after NEXT tap: call `nextRound()` (currentRound < 3) or `endGame()` (currentRound == 3).

### End-of-game chain (Step 2e — multi-round with Victory + Stars Collected + AnswerComponent)

`answerComponent: true` (default — spec does NOT opt out, so PART-051 is mandatory).

1. `await FeedbackManager.play('correct' | 'incorrect')` — final-round feedback, awaited.
2. `postMessage({ type: 'game_complete', data: { score, stars, attempts } })`.
3. `endGame()` → `showVictory()`.
4. **Victory transition:** `transitionScreen.show({ title: 'Victory!', subtitle: 'You cracked all the target sums!', stars, buttons: [{ text: 'Claim Stars', action: showStarsCollected }], persist: true })`. The Claim Stars action calls `showStarsCollected()` — **NEVER** `answerComponent.show(...)`.
5. **Stars Collected transition (celebration backdrop):** `transitionScreen.show({ title: 'Yay! Stars collected!', stars, buttons: [], persist: true, onMounted })`. The `onMounted` callback plays the yay sound, fires `show_star` animation, and via `setTimeout(showAnswerCarousel, 1500)`. The Stars Collected TS does **not** call `transitionScreen.hide()` — it stays mounted as the backdrop.
6. **Answer carousel reveal:** `showAnswerCarousel()` calls `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` then `floatingBtn.setMode('next')`. AnswerComponent renders OVER the Stars Collected backdrop (PART-051 integration point).
7. **Single-stage Next exit:** `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({ type: 'next_ended' }); previewScreen.destroy(); floatingBtn.destroy(); })`.

### Try Again / Play Again (set rotation)

When the player taps Try Again from the Stars Collected/AnswerComponent stack OR Play Again from the Welcome path:

1. `gameState.setIndex = (gameState.setIndex + 1) % 3` — rotate **BEFORE** `resetGameState()`. Index 0=A, 1=B, 2=C, then wraps.
2. `resetGameState()` — clears `score`, `attempts`, `currentRound`, `lives` (0), placement maps. **Does not reset `setIndex`**.
3. Stop all audio. Re-enter the Round 1 Transition for the new active set. **No PreviewScreen rerun** (per spec).

### Visibility / pause handling

`VisibilityTracker` handles the pause overlay (per project memory `feedback_pause_overlay.md` — never roll a custom one). Audio + drag state pause on `visibilitychange → hidden`; restore on `visible`. Customise via `popupProps`, never build a custom div.

### Persistent fixtures

- **PreviewScreen header** is mounted at top on Round transitions and Gameplay screens (per PART-039 integration); a `#timer-container` may be mounted in `.mathai-preview-header-center` if elapsed-time display is desired (but no countdown — see project memory `timer_preview_integration.md`). Spec defaults to no timer; we omit the timer entirely for L4.
- **ProgressBar** sits below the preview header on every Gameplay screen, tracking `currentRound / totalRounds = 3`.
- **CHECK / NEXT FloatingButton** (PART-050) mounts in the fixed-bottom slot. `slots.floatingButton: true` in `ScreenLayout.inject()`. Visibility predicate: `floatingBtn.setSubmittable(allSlotsFilledWithMatchingColours())` is called from the drag/drop handlers.

---

## 2. Round-by-round breakdown

Total rounds rendered per session: **3** (the three cosmetic variants of the active set). The student plays B1 → B2 → B3 of whichever set is active.

| Round | Set-A id | Set-B id | Set-C id | Targets (Set A / B / C) | Target colour | Rule glyphs |
|------:|----------|----------|----------|--------------------------|---------------|-------------|
| 1 (B1) | A_r1_b1_4279_7248_9346 | B_r1_b1_5318_6427_8259 | C_r1_b1_3147_8624_9135 | 4279, 7248, 9346 / 5318, 6427, 8259 / 3147, 8624, 9135 | **dark teal-grey** `#2F5F61` | **1⃣ / 2⃣** |
| 2 (B2) | A_r2_b2_4279_7248_9346 | B_r2_b2_5318_6427_8259 | C_r2_b2_3147_8624_9135 | (same targets as R1, same set) | **dark green** `#27666D` | **1. / 2.** (plain) |
| 3 (B3) | A_r3_b3_4279_7248_9346 | B_r3_b3_5318_6427_8259 | C_r3_b3_3147_8624_9135 | (same targets as R1, same set) | **dark green** `#27666D` | **1️⃣ / 2️⃣** (emoji) |

### What the student sees on each round (active-set view)

**Round 1 — Variant B1 (dark teal-grey + 1⃣/2⃣):**
- Round 1 Transition card briefly displays "Round 1" with the dark teal-grey target chrome.
- Gameplay screen renders three target hexagons in **`#2F5F61` (dark teal-grey)** showing the active set's three target values arranged as a downward-pointing triangle (T1 top-left, T2 top-right, T3 bottom-centre).
- 13 blank slots (6 blue inner s1..s6 + 7 white outer s7..s13) and 13-hex pool tray below in 4 rows (4+4+4+1).
- Instruction in the **PreviewScreen** header / preview card uses **1⃣** and **2⃣** glyphs. Gameplay screen does NOT duplicate the instruction text (per Constraint #7).
- Drag pool hexagons → matching-colour slots → tap CHECK.

**Round 2 — Variant B2 (dark green + plain 1./2.):**
- Round 2 Transition card displays "Round 2" with the dark green target chrome — signals cosmetic refresh.
- Same geometry, same target values, same solution as R1 within the active set. Only target colour and the instruction-card glyph rendering differ. Per spec this is a deliberate reinforcement loop with the source concept's B1 → B2 mandate.
- A student who solved R1 will recognise the puzzle and will likely solve R2 faster (target first-attempt rate 55–70% per spec).

**Round 3 — Variant B3 (dark green + 1️⃣/2️⃣ emoji):**
- Round 3 Transition card displays "Round 3" with the dark green target chrome (same colour as R2) — only the rule-glyph style changes (plain → emoji).
- Same geometry, same target values, same solution as R1/R2 within the active set. Target first-attempt rate 65–80% per spec.
- After CHECK on R3 → end-of-game chain (Victory → Stars Collected → AnswerComponent → Next).

### Per-set rotation behaviour

The 9 round objects in `fallbackContent.rounds[]` (3 per set × 3 sets) MUST all have a `set: 'A' | 'B' | 'C'` field, all `id` values globally unique. `currentRound` is 1..3 within the active set; `gameState.setIndex ∈ {0,1,2}` selects the active set. The renderer filters `fallbackContent.rounds.filter(r => r.set === ['A','B','C'][gameState.setIndex])` and indexes by `round`.

**Rotation on Try Again / Play Again (validator `GEN-ROUNDSETS-MIN-3`):**

1. Increment `gameState.setIndex = (gameState.setIndex + 1) % 3` **FIRST**, before `resetGameState()`.
2. Then call `resetGameState()` which clears `score`, `attempts`, `currentRound = 1`, `lives = 0` but **must preserve `setIndex`**. Tests should assert that `restartGame()` increments setIndex on every invocation.

Cross-set difficulty is parallel by design — Sets A, B, C use different 4-digit target triples but the same geometry, slot count, and pool-size footprint, so all three sets are equivalent in cognitive load.

### Constraint-solver requirement (CRITICAL — Build step)

The illustrative pool values shipped in `spec.md`'s `fallbackContent` may NOT arithmetically sum to the declared target triples for any of the 9 rounds. The builder MUST run the `verifyPuzzleSolvability()` constraint-solver pass **independently for each of the three sets**:

- **Set A:** regenerate pool values so the 6-member rings sum to **4279, 7248, 9346**.
- **Set B:** regenerate pool values so the 6-member rings sum to **5318, 6427, 8259**.
- **Set C:** regenerate pool values so the 6-member rings sum to **3147, 8624, 9135**.

Within a set, all 3 rounds (B1/B2/B3) share the SAME regenerated pool + SAME solution; only `targetColor` and `ruleGlyph` differ. If the solver cannot find a valid assignment for Set B or C, the builder may adjust those set's target values as a last resort (Set A targets are canonical from the source concept and must remain fixed). A runtime `verifyPuzzleSolvability()` self-check should embed in `index.html` and log a warning if any round's solution fails the four invariants (see spec § "Puzzle authoring invariant").

---

## 3. Scoring and lives logic

### Points

- **+1 point per round solved on first CHECK** (max 3 points).
- No partial credit per target — the entire 3-target arrangement must pass to count as a "solve".
- Wrong CHECK on a round = 0 points for that round, but the round is still recorded as an attempt.

### Stars

- **3★** = 3 first-CHECK solves (perfect run).
- **2★** = 2 first-CHECK solves.
- **1★** = 1 first-CHECK solve.
- **0★** = 0 first-CHECK solves (still reaches Results — no game-over fallback).

### Lives

- `gameState.lives = 0` at game start. **Lives are not decremented**, not displayed in the header (no heart-row UI), and never gate progression.
- **NO `game_over` branch.** Wrong CHECK does NOT trigger Game Over. Wrong CHECK advances to the next round (NEXT button or 3500ms auto-advance).
- The `transitionScreen.show({ title: 'Game Over', ... })` template is **never** invoked in this game.
- The `heartBreak` animation is removed from feedback.md per pedagogy/feedback defaults when `lives === 0`.

### Final-round behaviour (currentRound == 3 == totalRounds)

Both the correct path and the wrong path on the final round advance to the end-of-game chain (Victory → Stars Collected → AnswerComponent → single-stage Next). There is no scenario in which CHECK on R3 loops back or stays on R3.

### Progress bar

Tracks `currentRound / 3`. Updates **FIRST** in the round-complete handler, before any awaited SFX or `nextRound()` / `endGame()` (project memory `progress_bar_round_complete.md`). On the final round, the progress bar shows 3/3 BEFORE Victory renders.

### Telemetry

`recordAttempt({ round, set, attemptedSolution, perTargetPass: [bool,bool,bool], correctOnFirstCheck, ts })` fires once per CHECK, captured BEFORE audio starts. The `perTargetPass` array enables analytics to distinguish "1-of-3 sums off by a small amount" from "widely scrambled" arrangements per spec.

---

## 4. Feedback patterns per answer type

### Drop-event micro-feedback (during gameplay, before CHECK)

| Event | Audio | Visual | Notes |
|-------|-------|--------|-------|
| Pick up pool hexagon | none | hex lifts (scale 1.06 + drop-shadow); pool slot dims | cursor-grab |
| Drag-over matching-colour slot | none | slot border highlights purple | hover state |
| Drag-over mismatched-colour slot | none | slot border highlights soft red | feedback-only — drop will be rejected |
| **Drop on empty matching-colour slot (snap)** | `FeedbackManager.sound.play('snap', { fireAndForget: true })` | slot turns filled; CHECK enables if all 13 slots filled | success path |
| **Drop on occupied matching-colour slot (evict)** | `FeedbackManager.sound.play('snap', { fireAndForget: true })` | previous occupant animates back to its pool row | evict path |
| **Drop on occupied matching-colour slot (swap from another slot)** | `FeedbackManager.sound.play('snap', { fireAndForget: true })` | swap animation between source and destination slot | swap path |
| **Drop on mismatched-colour slot (reject)** | `FeedbackManager.sound.play('error_soft', { fireAndForget: true })` | hex snaps back to source; no placement change | the 9th drop path beyond P6's V1–V7 matrix; **`resetDragStyling(el)` MUST fire** per spec WARNING — R4 cleanup |
| Drop hex from slot back onto pool | `FeedbackManager.sound.play('deselect_soft', { fireAndForget: true })` | slot clears; pool row refills | CHECK disables (slots no longer all filled) |

All micro-feedback is **fire-and-forget** — never awaited, never blocks input, never carries TTS or sticker. Drag state is reset (`resetDragStyling(el)`) on **all 9 drop paths**: drop-on-empty, drop-on-occupied-evict, drop-on-occupied-swap, zone-to-zone-transfer, zone-to-bank-return, drop-outside-cancel, same-zone-no-op, pointercancel, **and colour-mismatch-reject**.

### CHECK → Correct (all 3 targets pass)

1. `gameState.isProcessing = true` set BEFORE any await — input blocked.
2. `recordAttempt({ ..., correctOnFirstCheck: true })` fires immediately.
3. All 13 slots flash green (CSS class `.slot-correct`, 400ms).
4. Each target hexagon shows a **green ✓ badge** overlay.
5. `progressBar.update(currentRound, 0)` — FIRST, before any await.
6. `await FeedbackManager.playDynamicFeedback({ feedbackType: 'correct', audio_content: '...', subtitle: 'Great thinking! Every sum is spot on.', sticker: 'celebration' })` — minimum ~1500ms duration.
7. After feedback resolves: if `currentRound < 3` → `nextRound()`; if `currentRound == 3` → `endGame()` → end-of-game chain.

### CHECK → Wrong (one or more targets fail)

1. `gameState.isProcessing = true` set BEFORE any await.
2. `recordAttempt({ ..., correctOnFirstCheck: false, perTargetPass: [...] })` fires immediately.
3. **Conflict-slot red highlighting** — for each target whose 6-member ring does not sum to its value, every slot in that ring receives CSS class `.slot-conflict` (red border + soft red background). A slot shared between two targets becomes a conflict slot if **either** target fails. Slots in only-passing rings stay neutral.
4. **Per-target ✓/✗ badges** — each of the 3 target hexagons displays a small badge: green ✓ if its ring sum matches its declared value, red ✗ if not. Critical for diagnosing which sum(s) failed.
5. `progressBar.update(currentRound, 0)` — FIRST, before any await.
6. `await FeedbackManager.playDynamicFeedback({ feedbackType: 'incorrect', audio_content: '...', subtitle: 'Oh no! Not quite — check each sum.', sticker: 'sad' })` — minimum ~1500ms duration.
7. **Reveal correct arrangement** — after feedback resolves, hexagons slide to their solution positions (CSS transform animation, ~1500ms) so the student sees the answer before advancing.
8. `floatingBtn.setMode('next')` — CHECK button morphs to NEXT label. Registered handler is `floatingBtn.on('next', ...)` (NOT `on('submit')`).
9. NEXT is tappable any time after step 6 completes; OR 3500ms auto-advance fires automatically (whichever first).
10. Stop all audio on NEXT tap. Then: if `currentRound < 3` → `nextRound()`; if `currentRound == 3` → `endGame()`.

### End-of-game

After R3 CHECK (correct or wrong), the awaited final-round feedback resolves, then the chain in §1 fires (Victory → Stars Collected → AnswerComponent → single-stage Next). `floatingBtn.setMode('next')` is called **inside `showAnswerCarousel()`**, AFTER both transitions have rendered — never inside `endGame()` directly (validator `GEN-FLOATING-BUTTON-NEXT-TIMING`).

### Cleanup on round reset

When the next round mounts, the new round's content replaces the workspace. CSS classes `.slot-correct`, `.slot-conflict`, and the per-target ✓/✗ badges MUST be cleared. The reveal-arrangement animation MUST be torn down so the new round's empty slots render cleanly. The CHECK FloatingButton resets to `setMode('submit')` with `setSubmittable(false)` (no slots filled yet).

---

## Integration points (PART references)

- **PART-039 PreviewScreen** — owns `previewInstruction` + `previewAudioText`. `showGameOnPreview: false`. Mounted as the persistent header on all non-Preview screens; the PreviewScreen's "Got it" tap is the **single-stage Next handler** for the preview-to-Welcome transition.
- **PART-050 FloatingButton** — `slots.floatingButton: true` in `ScreenLayout.inject()`. Submit handler: `floatingBtn.on('submit', async () => { await checkAnswer(); })`. Visibility predicate `floatingBtn.setSubmittable(allSlotsFilledWithMatchingColours())` wired to drag/drop handlers.
- **PART-051 AnswerComponent** — `answerComponent: true` (default; spec does not opt out). Renders OVER the Stars Collected TransitionScreen backdrop. `buildAnswerSlidesForAllRounds()` returns 3 slides, one per played round, each `{ render(container) {...} }` reproducing the target triangle + correct hexagon arrangement (drop-zones in solved state, NO draggable bank). Single-stage Next exit destroys AnswerComponent + FloatingButton + PreviewScreen.

## Summary of changes from canonical Shape-2 default flow

1. **Remove Game Over branch** (lives = 0).
2. **Wrong CHECK does NOT loop back** to the same round — advances to next round (or end-game if R3).
3. **Per-set rotation on Try Again** — `gameState.setIndex` rotates A → B → C → A BEFORE `resetGameState()`.
4. **Submit CTA is CHECK** — FloatingButton with `setMode('submit')`; morphs to `setMode('next')` only on the wrong path AFTER awaited feedback.
5. **AnswerComponent over Stars Collected backdrop** — single-stage Next exit per Step 2e of game-planning skill.
