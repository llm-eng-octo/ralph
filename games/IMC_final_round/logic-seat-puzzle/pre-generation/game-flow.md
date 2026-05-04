# Game Flow: Logic Seating Puzzle — Who Sits Where?

## One-liner

Drag named character chips onto numbered seats around a table so every clue is satisfied simultaneously, then tap CHECK to test the whole arrangement at once — 7 puzzles per session across 3 stages, NO lives, NO timer, single CHECK per round (wrong CHECK reskins the FloatingButton CHECK → NEXT and ends the round informationally; chips stay put against red-glow seats showing which clues failed), star count is single-attempt accuracy by FIRST-CHECK count.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────────┐  tap   ┌──────────────┐  auto   ┌─────────────────────┐
│ Preview  ├───────▶│ Welcome /    ├───────▶│ Round-1      ├────────▶│ Gameplay:           │
│ 🔊 prev  │ (Start)│ Round-1 TS   │        │ intro TS     │ (after  │ Puzzle 1 (4 seats,  │
│   audio  │        │ "Welcome to  │        │ "Puzzle 1    │  sound) │ 4 chips, 2-3 clues) │
│ "Start"  │        │  Who Sits    │        │  of 7"       │         │ ┌─────────────────┐ │
│ NO game  │        │  Where?"     │        │              │         │ │ clue panel top  │ │
│  visible │        └──────────────┘        └──────────────┘         │ │ table centre    │ │
└──────────┘                                                         │ │ chip pool below │ │
       (PreviewScreen unmounts                                       │ │ CHECK FB dimmed │ │
        on Start; never                                              │ │   until all     │ │
        re-shown on restart)                                         │ │   required      │ │
                                                                     │ │   seats filled  │ │
                                                                     │ └─────────────────┘ │
                                                                     │ Drag pickup: SFX FF │
                                                                     │ Drop on seat: SFX FF│
                                                                     │ Swap-back: SFX FF   │
                                                                     │ Drag-back-to-pool   │
                                                                     │   ALSO valid (P6)   │
                                                                     │ NO mid-round TTS    │
                                                                     │ NO retry button     │
                                                                     │ NO hint button      │
                                                                     │ NO reset button     │
                                                                     └──────────┬──────────┘
                                            (only commit affordance is CHECK FloatingButton)
                                                                                │ tap CHECK
                                                ┌───────────────────────────────┤
                                                ▼                               ▼
                                  ┌──────────────────────────┐  ┌────────────────────────────┐
                                  │ CORRECT (all clues pass) │  │ WRONG (≥1 clue violated)   │
                                  │ isProcessing=true        │  │ isProcessing=true          │
                                  │ Per-seat green flash      │  │ Every seat in any         │
                                  │   propagates clockwise   │  │   violated clue glows red │
                                  │   ~600ms (~80ms stagger) │  │   #E63946 ~1500ms         │
                                  │ progressBar.update(N,0)  │  │   (3×500ms ease-in-out)   │
                                  │   FIRST                  │  │ progressBar does NOT bump │
                                  │ await sound.play(        │  │   yet (waits for NEXT)    │
                                  │   'correct_sound_effect' │  │ await sound.play(         │
                                  │   {sticker, minDur:1500})│  │   'incorrect_sound_effect'│
                                  │ await playDynamicFeedback│  │   {sticker, minDur:1500}) │
                                  │   ("Yes! That's the      │  │ await playDynamicFeedback │
                                  │    right seating.")      │  │   ("Oh no — that's not   │
                                  │ recordAttempt(           │  │    quite right!")         │
                                  │   is_correct:true,       │  │ recordAttempt(            │
                                  │   attemptNumber:1)       │  │   is_correct:false,       │
                                  │ firstCheckCount += 1     │  │   attemptNumber:1,        │
                                  │ perRoundFirstCheck[N]=✓ │  │   misconception_tag:      │
                                  │ isProcessing=false       │  │   <highest-priority>)     │
                                  │ CASE 6                   │  │ perRoundFirstCheck[N]=✗  │
                                  └────────────┬─────────────┘  │ floatingBtn.setMode('next'│
                                               │                │   {label:'Next puzzle →'})│
                                               │                │ Chips STAY where placed   │
                                               │                │ Red glow stays visible    │
                                               │                │ until NEXT tapped         │
                                               │                │ NO second CHECK on this   │
                                               │                │   round (mode is 'next')  │
                                               │                │ isProcessing=false        │
                                               │                │ CASE 7-style single-step  │
                                               │                │   wrong (round terminates)│
                                               │                └────────────┬──────────────┘
                                               │                             │ tap NEXT
                                               │                             ▼
                                               │                ┌──────────────────────────┐
                                               │                │ Soft confirm SFX (FF)    │
                                               │                │ progressBar.update(N,0)  │
                                               │                │ floatingBtn.setMode(null)│
                                               │                │   (next round will       │
                                               │                │    re-bind 'submit')     │
                                               │                └────────────┬─────────────┘
                                               │                             │
                                               ▼                             ▼
                                       ┌──────────────────────────────────────────────┐
                                       │ currentRound === 7 ?                         │
                                       └────────────┬─────────────────────────────────┘
                                                    │
                                  ┌─────────────────┴──────────────────┐
                                  │ no                                 │ yes
                                  ▼                                    ▼
                         ┌──────────────┐                    ┌────────────────────────┐
                         │ Round-(N+1)  │                    │ Victory (TS,           │
                         │ intro TS     │                    │   intermediate)        │
                         │ "Puzzle N+1  │                    │ stars rendered (3/2/1) │
                         │  of 7"       │                    │ game_complete posted   │
                         │ tap to begin │                    │   BEFORE end-game      │
                         └──────┬───────┘                    │   audio                │
                                │                            │ buttons:               │
                                │                            │  [Play Again] (only    │
                                │                            │    if 1-2 stars)       │
                                │                            │  [Claim Stars] (always)│
                                │                            └──────┬─────────────────┘
                                │ next puzzle gameplay                │ tap Claim Stars
                                ▼                                     ▼
                        (loops back to                   ┌──────────────────────────┐
                         "Gameplay" box                  │ Stars Collected (TS,     │
                         above for Puzzle N+1)           │  persist, buttons:[])    │
                                                         │ onMounted:               │
                                                         │  await sound.play(       │
                                                         │   'victory_sound_effect')│
                                                         │  postMessage(            │
                                                         │   {type:'show_star'})    │
                                                         │  setTimeout(             │
                                                         │   showAnswerCarousel,    │
                                                         │   1500)                  │
                                                         │ TS does NOT call hide()  │
                                                         │   in onMounted — stays   │
                                                         │   mounted as backdrop    │
                                                         └────────────┬─────────────┘
                                                                      │ TS persists
                                                                      ▼
                                                         ┌──────────────────────────┐
                                                         │ AnswerComponent carousel │
                                                         │ (PART-051)               │
                                                         │ 7 slides — 1 per round   │
                                                         │ each slide:              │
                                                         │  solved seating diagram  │
                                                         │  (non-interactive)       │
                                                         │  + clue list verbatim    │
                                                         │ Stage 3 slides also pin  │
                                                         │  distractor in pool with │
                                                         │  "(not used)" caption    │
                                                         │ FloatingBtn 'next'       │
                                                         │   appears AFTER show     │
                                                         └────────────┬─────────────┘
                                                                      │ tap Next
                                                                      ▼
                                                         single-stage exit:
                                                          answerComponent.destroy()
                                                          postMessage({type:'next_ended'})
                                                          previewScreen.destroy()
                                                          floatingBtn.destroy()

       Try Again / Play Again (from Victory):
         all audio stopped
         rotateRoundSet()  → setIndex (0→1→2→0)  BEFORE
         resetGameState()  → currentRound=1, score=0, attempts=[], firstCheckCount=0,
                             perRoundFirstCheckResult=[], placement={}, distractorChipId=null,
                             isProcessing=false; does NOT touch setIndex
         showRoundIntroTS(1)  → Puzzle 1 of new set
         Preview screen does NOT re-show on restart

       Pause overlay: VisibilityTracker's PopupComponent auto-shows on tab-hidden (Case 14);
       audio pauses; no timer to pause. On resume (Case 15), audio resumes. NEVER build a
       custom pause overlay.

       NO Game Over screen — totalLives = 0 means there is no game_over phase. Wrong CHECK
       does not decrement anything; the session always reaches Round 7 unless the player walks
       away (handled by harness session-incomplete path, not game-internal).
```

## Shape

**Shape:** Shape 2 Multi-round (7 rounds across 3 stages: R1-R2 = Stage 1, R3-R5 = Stage 2, R6-R7 = Stage 3).

## Changes from default

- **NO lives, NO game_over screen.** `totalLives: 0`. Wrong CHECK does NOT decrement anything and CANNOT end the session prematurely. The only terminal screen is Victory. **The build step MUST NOT generate a `game_over` TransitionScreen** (game-archetypes constraint #5: lives = 0 means no game_over).
- **NO timer (PART-006 omitted).** Concept: "this is a thinking game; a clock would push students toward guessing."
- **Single CHECK per round.** After the first CHECK, the round terminates regardless of correctness. Wrong CHECK does NOT re-enable a second CHECK on the same round; instead the FloatingButton reskins from `submit` mode to `next` mode (`floatingBtn.setMode('next')` with copy `Next puzzle →`). Tapping NEXT advances to the next round (or Victory after Round 7).
- **CHECK→NEXT in-round reskin (no retry).** This is the load-bearing flow customisation. The wrong-CHECK feedback is INFORMATIONAL (red-glowing seats showing which clues failed) — chips stay where the student placed them, the red glow stays visible, the student reads the failure, then taps NEXT to move on. CASE 7-style single-step wrong but the round terminates rather than re-prompting.
- **PreviewScreen `showGameOnPreview: false`.** The puzzle is hidden behind the preview overlay (the student should see the instruction first, not the puzzle).
- **Custom star rule (single-attempt accuracy by FIRST-CHECK count, NOT default 90/66/33):**
  - **3⭐** = all 7 rounds solved on first CHECK (perfect run).
  - **2⭐** = 5 or 6 of 7 rounds solved on first CHECK.
  - **1⭐** = fewer than 5 rounds solved on first CHECK, but the student finished all 7 rounds.
  - **0⭐** = walked away before Round 7 (session ended without reaching the Victory screen).
- **ANY round (correct OR wrong-on-first-CHECK) counts as a "completed" round** for scoring purposes. The 1⭐ floor for completing all 7 even with 0 first-CHECK correct is the persistence reward.
- **Round-set rotation on every restart.** `setIndex` rotates `0 → 1 → 2 → 0` BEFORE `resetGameState()` on every Try Again / Play Again. Set A on first attempt, Set B after first restart, Set C after second restart, then cycles back. `setIndex` resets to 0 ONLY on fresh page load, NOT on in-session restart — i.e. `resetGameState()` MUST NOT clear `setIndex`. Each set has different chip names + clues + unique solutions per puzzle but parallel difficulty (Set A's R3 ≈ Set B's R3 ≈ Set C's R3 in seat count, clue count, deduction depth). 21 round objects total (3 × 7); validator `GEN-ROUNDSETS-MIN-3`.
- **AnswerComponent end-of-game payload = 7 slides** (one per round, regardless of stage). Slides build via `buildAnswerSlidesForAllRounds()` (filter rounds for current `setIndex`).
- **Misconception tagging on wrong CHECK.** Each wrong CHECK records ONE misconception tag selected by the highest-priority violated clue (priority order: `seat-pin > head-of-table > between > left-of > across-from > not-next-to > next-to`). If the student also failed by leaving all 7 chips placed in Stage 3, also tag `distractor-not-recognised`.
- **PART-050 FloatingButton is the ONLY commit affordance.** Dimmed (`opacity:0.6; pointer-events:none`) until **all required SEATS are filled** — NOT all chips placed (Stage 3 distractor must remain in pool). The build step's `isCheckable()` predicate counts filled seats, NOT placed chips. Validator note: archetype 6 lists PART-050 as conditional ("if spec's flow has an explicit Check CTA"); we have an explicit CHECK CTA.
- **`@dnd-kit/dom@beta` mandatory for drag interaction** (P6 pattern). Step 4 (Build) MUST run in `[MAIN CONTEXT]` per project root `CLAUDE.md`. Pointer + touch sensors enabled. Drop-zones registered for each seat AND for the pool itself (so a chip can be dragged back to the pool to "unseat"). `validate-static.js` rule `GEN-DND-KIT` enforces this and rejects hand-rolled `pointerdown`/`touchstart` substitutes.

## Stages

| Stage | Rounds | Seats | Chips | Clue count | Clue grammar (additive) | Notable feature | Target first-CHECK |
|-------|--------|-------|-------|------------|-------------------------|-----------------|--------------------|
| 1 | R1-R2 | 4 (square: 1=top, 2=right, 3=bottom, 4=left) | 4 (no distractor) | 2-3 | seat-pin (REQUIRED), next-to, across-from, left-of | First-exposure geometry; seat-pin breaks 4-cycle rotational symmetry | ~85% |
| 2 | R3-R5 | 5 (oval with head: 1=head/top, 2/3 right, 5/4 left; foot side OPEN) | 5 (no distractor) | 3-4 | + between, + head-of-table | Head anchor pins the load-bearing chip; "between" requires 3-name reasoning | ~65% |
| 3 | R6-R7 | 6 (rectangle with head + foot: 1=head/top, 4=foot/bottom, 2/3 right, 5/6 left) | **7 (1 distractor — never named in any clue)** | 4-5 | + NOT-next-to (negation, in ≥1 of the 2 R6/R7 puzzles per set) | Distractor recognition = meta-step; negation requires elimination reasoning | ~45% |

## Round-by-round breakdown (all 7 rounds)

Every round is the same `seating-puzzle` round-type. The differences are **stage geometry** (seat count + adjacency + head/foot), **chip pool size** (with optional distractor), **clue count + clue grammar**, and the load-bearing reasoning move. The exact chip pools, clue strings, and unique solutions for all 21 round objects (3 sets × 7) are deferred to `pre-generation/puzzles.md` (Pre-Generation Step 3 will exhaustively-search-validate uniqueness per the spec's "Pre-Generation step").

| Round | Stage | Seats (count + layout) | Chips in pool | Distractor? | Clue count | Clue grammar | Load-bearing reasoning move | What it LOOKS like |
|-------|-------|------------------------|---------------|-------------|------------|--------------|------------------------------|--------------------|
| R1 | 1 | 4 — rounded-square corners (1=top, 2=right, 3=bottom, 4=left) | 4 | No | 2-3 | seat-pin (req) + ≥1 of {next-to, across-from, left-of} | "Anchor with the seat-pin, then propagate via one relational clue." | *Worked sample A_r1 (spec):* clues `Anu sits in seat 1.`, `Ravi is across from Anu.`, `Priya sits to the left of Ravi.` — solution `{1:anu, 2:neha, 3:ravi, 4:priya}`. Two-step deduction. Pure first-exposure. |
| R2 | 1 | 4 — same square as R1 | 4 (different names; e.g. Meera/Bobby/Tara/Diya) | No | 2-3 | seat-pin (req) + 1-2 relational | "Same shape as R1 but with a slightly less-obvious anchor — e.g. the seat-pin clue references a non-corner-of-attention chip; student must use one relational clue to fix the second seat then propagate." | Same square layout as R1; different chip names so students don't pattern-match the previous solution. Outline: 1 seat-pin + 1 across-from + (optional) 1 next-to. |
| R3 | 2 | 5 — oval with head/top (1=head, 2/3 right side, 5/4 left side; foot OPEN) | 5 | No | 3-4 | head-of-table (load-bearing), next-to, across-from, between, left-of | "Head clue pins one chip; 'between' or relational clues fix neighbours." | *Worked sample A_r3 (spec):* clues `Meera is at the head of the table.`, `Anu sits next to Meera.`, `Ravi sits between Anu and Priya.`, `Neha sits to the left of Meera.` — solution `{1:meera, 2:neha, 3:priya, 4:anu, 5:ravi}`. 4 clues; head clue is load-bearing. |
| R4 | 2 | 5 — same oval as R3 | 5 (different names) | No | 3-4 | head-of-table + 2-3 of {next-to, across-from, between, left-of} | "Mid-stretch — head still load-bearing but the relational clues require holding 2 partial restrictions in mind to find the seat with two qualifying neighbours." | Same oval layout as R3. Outline: head-of-table + 1 between (3-name constraint) + 1 across-from + (optional) 1 left-of. |
| R5 | 2 | 5 — same oval as R3 | 5 (different names) | No | 3-4 | head-of-table + ≥1 between + relational(s) | "Combine — between is the centre of the puzzle; head pins the anchor; one more relational fixes the rest." | Same oval layout as R3/R4. Outline: head-of-table + 1 between + 1 next-to + 1 left-of (or 1 across-from). Slightly tighter than R4; the between-seat has fewer candidate slots. |
| R6 | 3 | 6 — rectangle with head + foot (1=head/top, 4=foot/bottom, 2/3 right, 5/6 left) | **7 (1 distractor)** | **Yes** — 1 chip is never named in any clue | 4-5 | head-of-table + ≥3 of {next-to, across-from, between, left-of, not-next-to (optional)} | "Identify the distractor by scanning all clues for chip names; set them aside; then solve the 6-into-6 puzzle. Negation MAY be present in R6 OR R7 (≥1 of the two)." | *Worked sample A_r6 (spec):* clues `Meera is at the head of the table.`, `Anu is across from Meera.`, `Ravi sits between Bobby and Anu.`, `Priya is NOT next to Anu.`, `Neha sits to the left of Anu.` — chips include Tara as distractor — solution `{1:meera, 2:bobby, 3:ravi, 4:anu, 5:neha, 6:priya}`, distractor `tara`. 5 clues including 1 negation; student must pre-identify Tara. |
| R7 | 3 | 6 — same rectangle as R6 | **7 (1 distractor — different chip than R6)** | **Yes** | 4-5 | head-of-table + ≥3 relational + (≥1 of R6/R7 in this set has not-next-to negation) | "Mastery — distractor + tightest combination of clues. If R6 had the negation, R7 may not; if not, R7 must include it." | Same 6-seat rectangle as R6. Outline: head-of-table + 1 between + 1 across-from + 1 not-next-to (if R6 didn't have it) + 1 left-of. Distractor is a different chip name than R6's distractor. |

**Per-set parallelism:** Set A's R3 ≈ Set B's R3 ≈ Set C's R3 in seat count, clue count, and deduction depth, but with different chip names + different clues + different unique solutions. Same for every other round. Build-time validator (exhaustive permutation search) asserts each round's `clues` admit exactly one valid `solution`.

## Scoring + lives logic

**Per-round scoring:** binary first-CHECK only.

- A round is "first-CHECK correct" iff the student's first (and only) CHECK on that round produced an arrangement satisfying every clue.
- `gameState.score = number of rounds where the FIRST CHECK was correct` (0..7).
- A wrong CHECK on a round contributes 0 to score. There is no second CHECK on the same round (the FloatingButton reskins to NEXT immediately after the wrong-CHECK feedback resolves).
- A round where the student tapped CHECK once (correct OR wrong) AND then advanced (auto on correct, via NEXT tap on wrong) is a "completed" round.

**Lives semantics: NONE.**

- `gameState.lives` is structurally `0` (totalLives: 0). Wrong CHECK does NOT decrement anything.
- There is NO `game_over` screen and NO life-counter UI in the gameplay header.
- The session CANNOT terminate via lives = 0; it can only terminate by reaching Round 7 (Victory) or by the player walking away (handled by harness, not in-game).
- `progressBar.update(currentRound, 0)` is called with `lives = 0` literal on every round-complete (correct AND wrong-then-NEXT). The bar shows `N/7`, no hearts.

**Star calculation (custom — see `scoring.md` for full formula):**

```js
function getStars() {
  var firstCheckCorrect = gameState.attempts.filter(function (a) {
    return a.isCorrect && a.attemptNumber === 1; // attemptNumber is always 1 on this game
  }).length;
  if (gameState.currentRound < gameState.totalRounds) return 0; // walked away before Round 7
  if (firstCheckCorrect === 7) return 3;
  if (firstCheckCorrect >= 5) return 2;
  return 1; // completed all 7 with < 5 first-CHECK correct
}
```

(Every round records exactly one attempt — the single CHECK or the implicit "wrong + NEXT" path. `attemptNumber` is always 1.)

**Routing to Victory:** When the student completes Round 7 (correct CHECK auto-advances OR wrong-then-NEXT-tap advances), `endGame(true)` runs → `showVictory()`. There is no Game Over branch.

## Custom star calculation procedure

When Round 7 completes (correct OR wrong+NEXT), `endGame(true)` runs:

1. Compute `firstCheckCorrect = gameState.attempts.filter(a => a.isCorrect === true && a.attemptNumber === 1).length`. (Equivalently: `gameState.firstCheckCount`, kept incrementally as a counter.)
2. Apply the rubric: `7→3⭐`, `5-6→2⭐`, `<5→1⭐` (since `currentRound === totalRounds` when this runs, the 0⭐ "walked away" branch is impossible from inside the game; it only applies to the harness-side incomplete-session signal).
3. Post `game_complete` with `data.stars = stars` and the metrics payload (attempts array, total firstCheckCount, etc.).
4. Route to Victory TS → Stars Collected → AnswerComponent → Next.

## Feedback choreography per outcome

(Full table in `feedback.md`; this is the per-outcome summary, with FeedbackManager CASE numbers.)

- **Drag start (chip pickup) — CASE 9.** Soft tap SFX, fire-and-forget, ~50 ms. No sticker, no TTS, never blocks input. Chip lifts ~4 px with subtle shadow; ghost chip follows pointer; original chip pool slot greys to `opacity: 0.3`.
- **Drag drop (chip → empty seat) — fire-and-forget SFX.** Soft snap SFX (~80 ms, FF). Chip scale-in animation ~150 ms. No TTS. Pool slot becomes empty (or the chip's home pool slot if from another seat). Seat highlights with thin cyan ring (`#3D8BFD`, 2 px) WHILE the chip hovers over it pre-drop.
- **Drag drop (chip → occupied seat, swap-back) — fire-and-forget SFX.** Same soft snap SFX. Previous occupant animates back to its origin pool slot (or first free pool slot if origin is taken). New chip lands in seat. No TTS. Silent swap UI.
- **Drag drop (chip → pool, unseat) — fire-and-forget SFX.** Same soft snap SFX. Seat becomes empty. Chip animates into a pool slot. No TTS. **Drag-back-to-pool is a valid P6 affordance** — the pool itself is registered as a drop-zone in `@dnd-kit/dom@beta`.
- **Drag cancelled (released over no valid drop-zone) — no SFX.** Chip animates back to origin (~200 ms ease-out). Original pool slot un-greys.
- **All required seats filled (state change, no event):** CHECK FloatingButton transitions from dimmed to enabled (PART-022 enabled style; no SFX, no animation flourish — pure visual `setSubmittable(true)`). Triggered by every drop-handler that sees `isCheckable() === true`.
- **CHECK tap, all clues satisfied — CASE 6.**
  - `gameState.isProcessing = true` BEFORE await.
  - Per-seat green flash (`#2A9D8F`) propagates around the table clockwise (~600 ms total, ~80 ms stagger per seat).
  - `progressBar.update(currentRound, 0)` bumps **FIRST** (per `progress_bar_round_complete` MEMORY rule).
  - `await FeedbackManager.sound.play('correct_sound_effect', {sticker:'celebration', minDuration:1500})`.
  - `await FeedbackManager.playDynamicFeedback({audio_content:'Yes! That\'s the right seating.', subtitle:'Yes! That\'s the right seating.', sticker:'celebration'})`.
  - `recordAttempt({isCorrect:true, attemptNumber:1, roundIndex:N})`; `firstCheckCount += 1`; `perRoundFirstCheckResult[N] = true`.
  - `gameState.isProcessing = false` on next tick.
  - If `currentRound < 7` → `nextRound()` → Round-(N+1) intro TS.
  - If `currentRound === 7` → `endGame(true)` → Victory.
- **CHECK tap, ≥1 clue violated — CASE 7-style single-step wrong, round terminates.**
  - `gameState.isProcessing = true` BEFORE await.
  - Compute `violatedClues` and `redSeats = union of seats referenced by violated clues`.
  - Every seat in `redSeats` glows red (`#E63946`) for ~1500 ms (3 cycles 500 ms ease-in-out).
  - `await FeedbackManager.sound.play('incorrect_sound_effect', {sticker:'sad', minDuration:1500})`.
  - `await FeedbackManager.playDynamicFeedback({audio_content:'Oh no — that\'s not quite right!', subtitle:'Oh no — that\'s not quite right!', sticker:'sad'})`.
  - `recordAttempt({isCorrect:false, attemptNumber:1, roundIndex:N, misconception_tag:<highest-priority violated clue tag>})`. Stage-3-only: if all 7 chips were placed (no chip left in pool), append `distractor-not-recognised`.
  - `perRoundFirstCheckResult[N] = false` (firstCheckCount NOT incremented).
  - **After audio resolves:** `floatingBtn.setMode('next', {label:'Next puzzle →'})`. The FloatingButton primary handler is now wired to `'next'`, NOT `'submit'`. **CHECK is gone from this round.**
  - Chips STAY where the student placed them. Red glow stays visible (or re-renders on demand) until NEXT tapped.
  - `gameState.isProcessing = false` on next tick.
- **NEXT tap (after wrong CHECK) — soft confirm SFX (FF).**
  - `progressBar.update(currentRound, 0)` bumps.
  - `floatingBtn.setMode(null)` (or directly `setMode('submit')` when next round renders — the round-load handler re-binds the submit handler and sets dimmed state).
  - If `currentRound < 7` → `nextRound()` → Round-(N+1) intro TS.
  - If `currentRound === 7` → `endGame(true)` → Victory. (Note: even on a wrong-CHECK Round 7, we still route to Victory — there is no Game Over.)
- **Round transition (Round-N intro TS):** TransitionScreen `"Puzzle N of 7"` + auto-advance after round-intro SFX + VO (sequential, awaited). Tap-dismissible. Only the `currentRound > 1` rounds actually show this transition; Round 1's intro IS the Welcome TS.
- **Welcome TS (before Round 1):** `"Welcome to Who Sits Where?"` + welcome VO, tap-dismissible. Mounts AFTER PreviewScreen's Start tap fires `next_ended` (PART-039 lifecycle).
- **Victory (all 7 rounds complete):** Victory TS appears with stars rendered. `game_complete` posted **BEFORE** end-game audio. Buttons: `[Play Again]` (only if 1-2 stars), `[Claim Stars]` (always). CASE 11.
- **Stars Collected (after Claim Stars):** `transitionScreen.show({title:'Yay! Stars collected!', stars, buttons:[], persist:true, onMounted})`. `onMounted` does: `await FeedbackManager.sound.play('victory_sound_effect')` → `postMessage({type:'show_star'})` → `setTimeout(showAnswerCarousel, 1500)`. Per `default-transition-screens.md` § 4 the Stars Collected TS does NOT call `transitionScreen.hide()` in `onMounted` — it stays mounted as the celebration backdrop while AnswerComponent layers over.
- **Correct Answers carousel (PART-051 AnswerComponent):** 7 slides (one per round of the current set). Each slide: solved seating diagram (non-interactive) + clue list verbatim. Stage-3 slides also pin the distractor chip in the pool with `(not used)` caption. After `answerComponent.show({slides})`, `floatingBtn.setMode('next')`. Tap → single-stage exit (`answerComponent.destroy()`, `postMessage({type:'next_ended'})`, `previewScreen.destroy()`, `floatingBtn.destroy()`).
- **Try Again / Play Again (from Victory):** all audio stopped; `rotateRoundSet()` rotates `setIndex 0→1→2→0` BEFORE `resetGameState()`; `resetGameState()` resets all per-session state EXCEPT `setIndex`; `showRoundIntroTS(1)` for Round 1 of the new set. **Preview screen does NOT re-show on restart.** CASE 13.
- **Tab switch / screen lock — CASE 14.** Static & stream audio paused. VisibilityTracker's PopupComponent renders the pause overlay (`autoShowPopup` default; do NOT build a custom pause-overlay div per the `feedback_pause_overlay` MEMORY rule — customize via `popupProps` if needed).
- **Tab restored — CASE 15.** Audio resumes. VisibilityTracker dismisses its own popup. Gameplay continues; the in-flight drag (if any) is auto-cancelled by `@dnd-kit/dom@beta` on visibility loss.
- **Audio failure (any audio call rejects) — CASE 16.** Try/catch swallows; visual feedback (green flash, red glow, sticker) still renders. Game continues.

## Component lifecycle

**PreviewScreen (PART-039):**
- **Mount:** before Round 1, on game boot. Reads `previewInstruction` (HTML), `previewAudioText` (TTS), `showGameOnPreview: false` (puzzle NOT visible behind overlay).
- **Destroy:** on FloatingButton 'next' tap from the Preview's Start CTA — fires `next_ended` postMessage from PART-039 internally, then the orchestrator calls `previewScreen.destroy()` BEFORE Round 1 game UI renders.
- **Re-show on restart:** **NO.** Preview screen is one-shot per session. Try Again / Play Again routes directly to the Round-1 intro TS, skipping Preview.

**TransitionScreen (PART-024):**
- **Welcome TS:** mounts AFTER Preview destroyed; tap-dismissible.
- **Round-N intro TS** (N=2..7): mounts after the previous round's auto-advance OR NEXT-tap; auto-advance after round-intro SFX + VO sequential awaited.
- **Victory TS:** mounts after Round 7 endGame; persists until Claim Stars (or Play Again) tapped. `buttons: [{text:'Claim Stars', action:showStarsCollected}]` always; `[{text:'Play Again', action:onTryAgain}]` PREPENDED only if `stars < 3`.
- **Stars Collected TS:** mounts after Claim Stars; `buttons: []`, `persist: true`, `onMounted` runs the celebration sequence and reveals AnswerComponent. **Stays mounted as backdrop** (does NOT call `transitionScreen.hide()` in onMounted).

**ProgressBar (PART-023):**
- **Mount:** on Round 1 game UI render (NOT during Preview).
- **Configuration:** 7 segments, NO hearts (`totalLives: 0`).
- **Update:** `progressBar.update(currentRound, 0)` bumps **FIRST** in round-complete handler — BEFORE awaited SFX / TTS / `nextRound()` / `endGame()`. Per `progress_bar_round_complete` MEMORY rule. Bumps on BOTH correct CHECK (immediately) AND on NEXT tap after wrong CHECK.
- **Final-round caveat:** the bump on Round 7 ensures Victory shows `7/7`, not `6/7`.

**FloatingButton (PART-050):**
- **Mount:** on Round 1 game UI render (NOT during Preview).
- **Default mode each round:** `submit` (CHECK). Predicate: `floatingBtn.setSubmittable(isCheckable())` wired to every drag-end handler. Dimmed (`opacity:0.6; pointer-events:none`) until `isCheckable() === true`.
- **`isCheckable()`:** counts FILLED SEATS, NOT placed chips. Returns `true` iff every seat in `currentRoundData.seats` has a chip in `gameState.placement[seatIdx]`. (Stage 3: 6 seats filled even though 1 chip remains in pool.)
- **Submit handler:** `floatingBtn.on('submit', async () => evaluateCheck())` — fires on CHECK tap.
- **Mode flip on wrong CHECK:** `floatingBtn.setMode('next', {label:'Next puzzle →'})` AFTER the wrong-CHECK feedback audio resolves. CHECK is now disabled for this round.
- **Next handler (intra-game, after wrong CHECK):** `floatingBtn.on('next', () => advanceFromWrong())` — fires on NEXT tap; bumps progress bar, calls `nextRound()` or `endGame(true)`.
- **Mode flip back on next round load:** when the next round's game UI renders, the round-load handler calls `floatingBtn.setMode('submit')` (or `setMode(null)` first then `setMode('submit')`) and re-binds the submit handler; dimmed state resets.
- **End-of-game Next:** after AnswerComponent reveals, `floatingBtn.setMode('next')` is called inside `showAnswerCarousel()`. The Next handler at this stage is the single-stage exit: `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({type:'next_ended'}); previewScreen.destroy(); floatingBtn.destroy(); })`. Note: this is `on('next')`, NOT `on('submit')` — per the FAILED REASONING PATTERN guard in game-planning Step 2c.
- **Destroy:** at the very end, in the single-stage Next exit handler.

**AnswerComponent (PART-051):**
- **Mount:** AFTER Stars Collected `onMounted` plays yay sound + show_star + setTimeout(~1500ms) → calls `showAnswerCarousel()` → `answerComponent.show({slides: buildAnswerSlidesForAllRounds()})`.
- **Slide count:** 7 (one per round of the current set, filtered by `setIndex`).
- **Slide payload:** `[{render(container) { renderAnswerForRound(round, container); }}, ...]` — `{render}` callbacks (NEVER `{html: '...'}` strings; PART-051 validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`).
- **Per-slide rendering** (`renderAnswerForRound(round, container)`): non-interactive table for that round's stage geometry; each seat shows the correct chip avatar + name (fixed, no drag); the round's clue list listed beneath verbatim; Stage-3 slides additionally render the `answer.distractor` chip in a small "Not used" pool slot below the clues with `(not used)` caption. Slide title `"Puzzle N"` + per-stage subtitle (Stage 1: `"Reading one clue at a time."`; Stage 2: `"Two clues together pin one seat."`; Stage 3: `"Find the friend with no clue, set them aside, then solve."`).
- **End-game chain** (per game-planning Step 2e — supersedes the legacy 5-step chain): `await final-round feedback` → `postMessage(game_complete)` → `endGame(true)` → `showVictory()` → Victory TS Claim Stars action calls `showStarsCollected()` (NEVER calls `answerComponent.show(...)` — that would skip the celebration; FAILED REASONING PATTERN guard) → Stars Collected `onMounted` plays yay + show_star + setTimeout → `showAnswerCarousel()` → `answerComponent.show({slides})` + `floatingBtn.setMode('next')` → tap Next → single-stage exit.
- **Destroy:** in the single-stage Next exit handler, BEFORE `postMessage(next_ended)`.

**FeedbackManager (PART-017):**
- Used for all SFX (drag pickup, drop snap, NEXT confirm, correct/incorrect CHECK, round-intro, victory, stars-collected) and dynamic TTS (correct/incorrect CHECK only — no mid-round TTS).
- Drag/drop SFX: fire-and-forget (no `await`). CHECK feedback SFX + TTS: awaited (sequential).
- Per-CHECK TTS uses `playDynamicFeedback({audio_content, subtitle, sticker})` with the literal strings `'Yes! That\'s the right seating.'` / `'Oh no — that\'s not quite right!'`.

## State machine sketch

`gameState` shape:

```js
const gameState = {
  // Persistent across in-session restarts (do NOT clear in resetGameState):
  setIndex: 0,                         // 0=A, 1=B, 2=C — rotates BEFORE resetGameState

  // Per-session (reset by resetGameState on Try Again ONLY):
  totalRounds: 7,
  totalLives: 0,                       // structurally zero — never decremented
  currentRound: 1,                     // 1..7
  score: 0,                            // = firstCheckCount
  firstCheckCount: 0,                  // counter for star calc
  perRoundFirstCheckResult: [],        // length-currentRound boolean array
  attempts: [],                        // recordAttempt log; one entry per round (always attemptNumber:1)
  isProcessing: false,                 // input block during awaited feedback

  // Per-round (cleared by renderRound between Puzzle N → N+1, and on round-load):
  placement: {},                       // map seat number (string) → chip ID, e.g. {'1':'anu', '2':'ravi'}
  poolChips: [],                       // ordered list of chip IDs currently in the pool for this round
  distractorChipId: null,              // Stage 3 only: the chip ID never named in any clue
  currentRoundData: null,              // the round object from fallbackContent.rounds[i]
  redSeats: []                         // seats glowing red after wrong CHECK; cleared on round load
};
```

**Key transitions:**

- `boot → Preview` (PART-039 shows `previewInstruction` + audio, `showGameOnPreview: false`).
- `Preview → Welcome TS` on Start tap (`previewScreen` fires `next_ended` internally; orchestrator calls `previewScreen.destroy()` then `transitionScreen.show({title:'Welcome to Who Sits Where?', ...})`).
- `Welcome TS → Round-1 intro TS → Gameplay (Puzzle 1)` on tap-dismiss → `renderRound(1)` (NOT `loadRound`, per `feedback_window_loadround_shadow` MEMORY rule — `function loadRound` would shadow `window.loadRound` harness helper and infinite-recurse).
- `Gameplay (Puzzle N) → Round-(N+1) intro TS` on correct CHECK auto-advance (after awaited feedback) when `N < 7`.
- `Gameplay (Puzzle N) → Round-(N+1) intro TS` on NEXT tap after wrong CHECK when `N < 7`.
- `Gameplay (Puzzle 7) → Victory TS` on correct CHECK (after awaited feedback) OR on NEXT tap after wrong CHECK.
- `Victory TS → Stars Collected TS` on `[Claim Stars]` tap.
- `Stars Collected TS → AnswerComponent carousel + Next button` after `~1500ms setTimeout` inside Stars Collected `onMounted`.
- `AnswerComponent → exit` on Next tap (single-stage: destroy + post `next_ended` + destroy preview + destroy floating).
- `Victory TS → Round-1 intro TS` on `[Play Again]` tap (only present if `stars < 3`), after `rotateRoundSet()` + `resetGameState()`.

**Round-set cycling specifics:**

```js
function rotateRoundSet() {
  gameState.setIndex = (gameState.setIndex + 1) % 3;   // 0 → 1 → 2 → 0 → ...
}

function resetGameState() {
  // Reset session state
  gameState.currentRound = 1;
  gameState.score = 0;
  gameState.firstCheckCount = 0;
  gameState.perRoundFirstCheckResult = [];
  gameState.attempts = [];
  gameState.isProcessing = false;
  gameState.placement = {};
  gameState.poolChips = [];
  gameState.distractorChipId = null;
  gameState.currentRoundData = null;
  gameState.redSeats = [];
  // CRITICAL: do NOT touch gameState.setIndex — it persists across in-session restarts.
  // CRITICAL: do NOT touch gameState.totalLives (structurally 0).
}

function onTryAgain() {
  rotateRoundSet();           // 0→1→2→0
  resetGameState();           // resets per-session state but NOT setIndex
  showRoundIntroTS(1);        // → Puzzle 1 of new set (Preview NOT re-shown)
}
```

**Round-load specifics (`renderRound(N)`):**

- Read `currentRoundData = fallbackContent.rounds.find(r => r.set === ['A','B','C'][setIndex] && r.round === N)`.
- Identify `distractorChipId`: for Stage 3, scan all `currentRoundData.clues` for chip-IDs referenced; the chip in `currentRoundData.chips` whose ID is NOT in any clue's `args` is the distractor. (For Stage 1 and 2, `distractorChipId = null`.)
- Render the table for the current stage geometry (using `currentRoundData.seats`, `adjacency`, `acrossFrom`, `leftNeighbour`, `headSeat`).
- Render the chip pool with all `currentRoundData.chips`.
- Render the clue panel with all `currentRoundData.clues` (verbatim text, numbered "1." "2." "3." ...).
- `gameState.placement = {}`, `redSeats = []`, `isProcessing = false`.
- `floatingBtn.setMode('submit')` (in case it was 'next' from previous round); `floatingBtn.setSubmittable(false)` (dimmed); re-bind `floatingBtn.on('submit', evaluateCheck)`.

**`isCheckable()` predicate:**

```js
function isCheckable() {
  if (gameState.isProcessing) return false;
  return gameState.currentRoundData.seats.every(s => gameState.placement[String(s)] != null);
}
```

(Counts FILLED SEATS, not placed chips. Stage 3 OK with 1 chip left in pool.)

**`evaluateCheck()` shape:**

```js
async function evaluateCheck() {
  if (gameState.isProcessing) return;
  gameState.isProcessing = true;
  const violatedClues = currentRoundData.clues.filter(c => !satisfies(c, gameState.placement));
  if (violatedClues.length === 0) {
    // CORRECT path
    progressBar.update(gameState.currentRound, 0);   // FIRST
    await runCorrectFlash();                          // green propagation ~600ms
    await FeedbackManager.sound.play('correct_sound_effect', {sticker:'celebration', minDuration:1500});
    await FeedbackManager.playDynamicFeedback({...});
    recordAttempt({isCorrect:true, attemptNumber:1, roundIndex:gameState.currentRound});
    gameState.firstCheckCount++;
    gameState.perRoundFirstCheckResult.push(true);
    gameState.isProcessing = false;
    if (gameState.currentRound < gameState.totalRounds) nextRound();
    else endGame(true);
  } else {
    // WRONG path — round terminates, FB reskins to NEXT
    gameState.redSeats = unionSeatsOf(violatedClues);
    await runRedGlow(gameState.redSeats);              // ~1500ms
    await FeedbackManager.sound.play('incorrect_sound_effect', {sticker:'sad', minDuration:1500});
    await FeedbackManager.playDynamicFeedback({...});
    const tag = pickHighestPriority(violatedClues);    // seat-pin > head-of-table > between > left-of > across-from > not-next-to > next-to
    recordAttempt({isCorrect:false, attemptNumber:1, roundIndex:gameState.currentRound, misconception_tag:tag});
    gameState.perRoundFirstCheckResult.push(false);
    floatingBtn.setMode('next', {label:'Next puzzle →'});
    floatingBtn.on('next', advanceFromWrong);
    gameState.isProcessing = false;
  }
}

function advanceFromWrong() {
  FeedbackManager.sound.play('confirm_soft', {});      // FF, no await
  progressBar.update(gameState.currentRound, 0);
  if (gameState.currentRound < gameState.totalRounds) nextRound();
  else endGame(true);
}
```

(Note `floatingBtn.on('next', advanceFromWrong)` — NOT `on('submit')` — per game-planning Step 2c FAILED REASONING PATTERN.)

## AnswerComponent end-of-game payload

The carousel reveals AFTER Stars Collected's celebration beat (per PART-051's required end-game chain). It builds 7 slides via `buildAnswerSlidesForAllRounds()`:

```js
function buildAnswerSlidesForAllRounds() {
  // Filter rounds for the current setIndex (7 of the 21 round objects).
  const setLetter = ['A','B','C'][gameState.setIndex];
  const rounds = fallbackContent.rounds.filter(r => r.set === setLetter); // length === 7
  return rounds.map(round => ({
    render(container) {
      // 1. Title: "Puzzle N"
      // 2. Subtitle: per-stage one-liner
      //      Stage 1 (R1-R2): "Reading one clue at a time."
      //      Stage 2 (R3-R5): "Two clues together pin one seat."
      //      Stage 3 (R6-R7): "Find the friend with no clue, set them aside, then solve."
      // 3. Non-interactive table for the round's stage geometry:
      //      - seats rendered in their canonical positions (using round.seats / adjacency / headSeat)
      //      - each seat shows the avatar + name of round.answer.seating[seatNum]
      //      - NO drag handlers, NO CHECK button, NO progress bar update from inside
      // 4. Clue list verbatim beneath the table (numbered 1. 2. 3. ...)
      // 5. Stage-3 only: render round.answer.distractor chip in a small "Not used"
      //      pool slot below the clues with "(not used)" caption.
      renderAnswerForRound(round, container);
    }
  }));
}
```

Slide payload uses `{render(container){...}}` callbacks (NOT `{html: '...'}` strings — per PART-051 validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`). Each `render` is self-contained: reads only `round` data, no DOM lookups outside `container`.

End-game chain (multi-round + Victory + AnswerComponent — per game-planning Step 2e):

1. `await FeedbackManager.play(...)` — final-round CHECK feedback awaited (correct path) OR no awaited feedback if final-round was wrong-then-NEXT (the wrong-CHECK feedback was already awaited inside `evaluateCheck()`).
2. `postMessage({type:'game_complete', data:{stars: getStars(), metrics}})`.
3. `endGame(true)` → `showVictory()`.
4. `transitionScreen.show({title:'Victory', stars, buttons:[{text:'Claim Stars', action: showStarsCollected}, ...(stars < 3 ? [{text:'Play Again', action: onTryAgain}] : [])], persist:true})` — note `[Play Again]` only if `stars < 3`; `[Claim Stars]` always.
5. On Claim Stars tap → `showStarsCollected()`.
6. `transitionScreen.show({title:'Yay! Stars collected!', stars, buttons:[], persist:true, onMounted})` — `onMounted` plays `victory_sound_effect` (or `sound_stars_collected`), fires `show_star` postMessage, `setTimeout(showAnswerCarousel, 1500)`. Does NOT call `transitionScreen.hide()` in onMounted.
7. `showAnswerCarousel()`: `answerComponent.show({slides: buildAnswerSlidesForAllRounds()})`, then `floatingBtn.setMode('next')` (intra-game floating button is currently absent because gameplay ended; the floating instance must be re-acquired or persisted across endGame).
8. `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({type:'next_ended'}); previewScreen.destroy(); floatingBtn.destroy(); })` — single-stage exit, `on('next')` NOT `on('submit')`.

The Stars Collected TS is the terminal celebration backdrop; it stays mounted while AnswerComponent + Next layer over it. Both tear down together on Next.

## Cross-validation pointers (for spec-creation Step 7 + build Step 4)

- Every screen in this game-flow.md MUST have a wireframe in `screens.md`: Preview, Welcome TS, Round-N intro TS, Gameplay (Stage 1 / 2 / 3 — three distinct wireframes for the three table geometries), Victory TS, Stars Collected TS, AnswerComponent carousel slide. **No Game Over TS** (lives = 0).
- Every feedback moment in this game-flow.md MUST correspond to a step in `round-flow.md` and a row in `feedback.md`.
- The star-calculation formula here MUST match `scoring.md` exactly.
- The CHECK→NEXT in-round reskin is the load-bearing flow customisation; both `screens.md` and `round-flow.md` MUST document the FloatingButton mode-flip on wrong CHECK and that NEXT advances WITHOUT a second CHECK.
- The `isCheckable()` predicate counts FILLED SEATS, NOT placed chips — `round-flow.md` MUST state this rule explicitly (Stage 3 distractor depends on it).
- Round-set cycling: `setIndex` rotates BEFORE `resetGameState()` on Try Again / Play Again, persists across in-session restarts, resets to 0 ONLY on fresh page load. Validator `GEN-ROUNDSETS-MIN-3` enforces 3 sets × 7 rounds = 21 round objects.
- Step 4 (Build) MUST run in `[MAIN CONTEXT]` per project root `CLAUDE.md` for Pattern P6 (`@dnd-kit/dom@beta`). Sub-agent route would silently substitute native pointerdown — `validate-static.js` rule `GEN-DND-KIT` catches the artifact, but the routing rule prevents the mistake at the source.
