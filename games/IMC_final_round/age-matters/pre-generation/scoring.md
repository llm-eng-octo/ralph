# Scoring: Age Matters

## Points

| Action | Points | Notes |
|--------|--------|-------|
| Step-decision correct on first tap | +1 | Each step (1, 2, 3) is independently accounted. |
| Step-decision correct after one or more wrong taps | 0 | Step still completes; first-tap accounting forfeit. |
| Step-decision after idle-glow nudge fired | 0 | Glow fires after 15 s idle; sets `stepFirstTapDirty = true` immediately, so the next tap (whether on the glowing piece or another) cannot earn the first-tap point. |
| Wrong tap on a step | 0 | NO point penalty. Sets `stepFirstTapDirty = true` for the active step. NO life lost (lives = 0). |
| Round-equation correct | (already counted via Step-3 first-tap) | The round-complete event itself does NOT add points beyond the per-step accounting. |

There are 30 step-decisions in a session: 10 rounds × 3 steps = 30. Each step is worth 0 or 1 point (first-tap correct or not). `gameState.firstTapCorrect` and `gameState.score` are aliases — both range 0..30.

---

## Formula

```
score = gameState.firstTapCorrect       // 0..30
maxScore = totalRounds * 3              // 30
percentage = (score / maxScore) * 100   // 0..100, used only for telemetry
stars = computeStars()                  // see custom rule below
```

`maxScore` is `30` for all sets / all sessions.

---

## Star Thresholds (CUSTOM — not default 90/66/33%)

| Stars | Threshold | Displayed as |
|-------|-----------|-------------|
| 3 stars | `firstTapCorrect ∈ [27, 30]` AND completed all 10 rounds | Three filled stars |
| 2 stars | `firstTapCorrect ∈ [21, 26]` AND completed all 10 rounds | Two filled, one empty |
| 1 star | `firstTapCorrect < 21` AND completed all 10 rounds | One filled, two empty |
| 0 stars | `currentRound < totalRounds` (abandoned mid-session) | Three empty stars (never rendered in-app) |

```js
function computeStars() {
  // Abandoned mid-session: 0 stars. This branch fires only if endGame is invoked
  // before currentRound reaches totalRounds, which in this game cannot happen via
  // any in-app path (no Game Over branch, no lives). It exists for safety.
  if (gameState.currentRound < gameState.totalRounds) return 0;

  const f = gameState.firstTapCorrect; // 0..30
  if (f >= 27) return 3;
  if (f >= 21) return 2;
  return 1; // floor: completing all 10 rounds always yields >= 1 star.
}
```

**Star generosity audit** (from spec): tight at the 3⭐ end (90 % first-tap accuracy required), generously framed at the 1⭐ floor (completion = at least 1⭐). 0⭐ is reserved for genuine abandonment, which is the only "no progress" case. Verdict: appropriately calibrated for L4 mastery.

---

## Lives

NOT applicable. `totalLives = 0`.

| Parameter | Value |
|-----------|-------|
| Starting lives | 0 |
| Lives lost per wrong answer | 0 (never decremented) |
| Game over condition | Never (no `game_over` screen exists) |
| Lives display | NOT rendered (slot hidden, not zero-rendered) |
| Life loss animation | NONE |

`gameState.lives` is initialised to 0 and never decremented. The `progressBar.update(currentRound, lives)` call still passes `lives` (because the API is shared), but the lives indicator is hidden via CSS / template flag (`totalLives === 0` → render no hearts).

---

## Progress Bar

| Parameter | Value |
|-----------|-------|
| Tracks | `currentRound / totalRounds` (1..10 → 0%..100%) |
| Position | **Top of game body** — below the fixed preview header, above `#gameContent`. Owned by ScreenLayout + ProgressBarComponent. Visible on every non-Preview screen (gameplay, round_intro, stage_takeaway, victory, stars_collected, answer_carousel). |
| Style | Filled bar with 10 segments (one per round), left-to-right. PART-023 standard. |
| Updates | After Step-3 final placement triggers round-complete: `progressBar.update(currentRound, lives)` is FIRED FIRST in the round-complete handler (per MEMORY rule `progress_bar_round_complete`), BEFORE awaited SFX / nextRound / endGame. This guarantees the final round (Round 10) shows 10/10 at Victory, not 9/10. |
| First-tap counter chip | Sits alongside the progress bar (right side). Renders `firstTapCorrect / 30 correct so far`. Updates after every step-decision (right or wrong) via `.first-tap-chip-bump` 200ms. |

---

## Data Contract Fields

(Per `skills/data-contract/`'s `recordAttempt` and `game_complete` schemas.)

### `recordAttempt(...)` per event

The runtime calls `recordAttempt(...)` on every step-decision (right or wrong) and on every round-equation completion. The `attempts[]` array is the canonical telemetry log.

| Event | `recordAttempt` payload |
|-------|-------------------------|
| Step-1 right (Type A) | `{ is_correct: true, attempt_type: 'step-tap', step: 1, round: N, set: 'A'\|'B'\|'C', retryCount: 0 }` |
| Step-1 wrong (Type B/C, soft) | `{ is_correct: false, attempt_type: 'step-tap', step: 1, round: N, set, misconception_tag: 'variable-choice-suboptimal', retryCount: 0 }` |
| Step-2 right | `{ is_correct: true, attempt_type: 'step-tap', step: 2, round: N, set, retryCount: stepFirstTapDirty ? 1 : 0 }` |
| Step-2 wrong | `{ is_correct: false, attempt_type: 'step-tap', step: 2, round: N, set, misconception_tag: tag, retryCount: stepFirstTapDirty ? 1 : 0 }` |
| Step-3 partial (right piece, slot not full) | (no recordAttempt — partial fills aren't decision events) |
| Step-3 final right (Step-3 slot-full + AST match) | `{ is_correct: true, attempt_type: 'round-equation', round: N, set, step3FirstTapClean: !stepFirstTapDirty, retryCount: ... }` |
| Step-3 wrong piece | `{ is_correct: false, attempt_type: 'step-tap', step: 3, round: N, set, misconception_tag: tag, retryCount: stepFirstTapDirty ? 1 : 0 }` |
| Idle-glow fired | (no recordAttempt — the glow itself is not a decision event; the next tap will record per the above) |

`retryCount` is incremented per wrong tap on the active step; it resets to 0 in `loadStep(N)` when the step opens.

### `game_complete` postMessage payload

Posted BEFORE end-game audio (per CASE 11 / Victory pattern):

```js
postMessage({
  type: 'game_complete',
  data: {
    stars: computeStars(),                      // 0..3 (always 1..3 in-app)
    score: gameState.firstTapCorrect,           // 0..30
    maxScore: 30,
    accuracy: Math.round((gameState.firstTapCorrect / 30) * 100),
    completed: gameState.currentRound === gameState.totalRounds, // true at Victory
    setIndex: gameState.setIndex,               // 0..2 (which set was played)
    setLetter: ['A','B','C'][gameState.setIndex],
    metrics: {
      totalRounds: gameState.totalRounds,
      roundsCompleted: gameState.currentRound,
      firstTapCorrect: gameState.firstTapCorrect,
      attempts: gameState.attempts,             // full attempt log
      misconceptionsHit: tallyMisconceptions(gameState.attempts), // {tag → count}
      timeSpent: Date.now() - gameState.startTime,
    }
  }
});
```

`misconceptionsHit` is a tally for telemetry / future iteration analysis: `{'time-shift-direction-flip': 4, 'sign-error-younger-confused-with-older': 1, ...}`.

### `next_ended` postMessage

Posted from the FloatingButton `'next'` handler after the AnswerComponent carousel:

```js
floatingBtn.on('next', () => {
  answerComponent.destroy();
  postMessage({ type: 'next_ended' });
  previewScreen.destroy();
  floatingBtn.destroy();
});
```

Single-stage exit. Validator `GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE` blocks any handler that branches on a `gameState.starsCollectedShown`-style flag.

---

## Round-set rotation impact on scoring

`setIndex` rotation does NOT alter scoring. Each set has parallel difficulty (Set A's R1 ≈ Set B's R1 ≈ Set C's R1 in equation shape and decision count) and the same 30 step-decisions. The per-set distractor count is identical (2 for Stage 1, 3 for Stages 2 & 3). A 3⭐ run on Set A is mathematically equivalent in difficulty to a 3⭐ run on Set B or C.

`setIndex` IS reported in `game_complete.data.setIndex` for telemetry (so analysis can detect "Set B is harder than expected" if data shows lower first-tap rates on Set B's R8 vs Set A's R8).

---

## Star generosity edge cases

| Outcome scenario | Rounds completed | First-tap correct (out of 30) | Stars | Verdict |
|------------------|------------------|-------------------------------|-------|---------|
| Completed all 10, no wrong taps anywhere | 10 | 30 | **3⭐** | TIGHT — perfect run only. |
| Completed all 10, 3 wrong taps total | 10 | 27 | **3⭐** | NEUTRAL — 90 % first-tap, allows minor slips on hardest steps. |
| Completed all 10, 4 wrong taps total | 10 | 26 | **2⭐** | TIGHT EDGE — 86 % first-tap drops to 2⭐ deliberately. |
| Completed all 10, 8 wrong taps total | 10 | 22 | **2⭐** | NEUTRAL — 73 %, broad middle band. |
| Completed all 10, 9 wrong taps total | 10 | 21 | **2⭐** | EDGE — 70 %, just above 2⭐ floor. |
| Completed all 10, 10 wrong taps total | 10 | 20 | **1⭐** | EDGE — 67 %, just below 2⭐ floor (deliberately tight, NOT default 66 %). |
| Completed all 10, 30 wrong taps total | 10 | 0 | **1⭐** | LOOSE FLOOR — completion = at least 1⭐, deliberate emotional safety. |
| Abandoned at Round 5 | 4 (R5 in progress) | any | **0⭐** | Only the abandonment case earns 0⭐. |

The 21-step threshold for 2⭐ (vs the default 66 % which would be 19.8 → 20) is the creator's deliberate tighter calibration for L4 mastery.
