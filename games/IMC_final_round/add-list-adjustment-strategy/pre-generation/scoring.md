# Scoring: Add List with Adjustment Strategy — The Compensation Workout

## Points

| Action | Points | Notes |
|--------|--------|-------|
| Correct submit (first try) | +1 to `score`; +1 to `firstTryCorrect` | `attemptsOnThisRound === 0` AT correct submit |
| Correct submit (on retry) | +1 to `score` | `attemptsOnThisRound > 0` AT correct submit; **`firstTryCorrect` NOT incremented** |
| Wrong submit | 0 (no point penalty); `lives -= 1`; `attemptsOnThisRound += 1` | Re-presents same round (RETRY-SAME-ROUND) unless lives reach 0 |
| +/- nudge tap | 0 | Display-only mutation; not graded |
| Reset tap | 0 | Display-only reset; not graded |

## Formula

```
score             = number of rounds completed correctly (first try OR retry)
firstTryCorrect   = number of rounds completed correctly on the FIRST submit attempt
maxScore          = 9    (totalRounds)
maxFirstTry       = 9    (one per round)
percentage        = (firstTryCorrect / maxFirstTry) * 100   // used in recordAttempt accuracy field
```

**The default 90/66/33 percentage thresholds DO NOT apply.** Star tier is computed by the creator-specified `getStars()` function below, which reads `firstTryCorrect` and `lives` (NOT a percentage of `score / totalRounds`).

## Star Thresholds (creator-specified — first-try-correct count drives stars)

```js
function getStars() {
  if (gameState.lives <= 0) return 0;            // game-over branch
  if (gameState.firstTryCorrect >= 9) return 3;  // perfect run
  if (gameState.firstTryCorrect >= 7) return 2;  // 7-8 first-try
  return 1;                                       // finished with 5-6 first-try (or fewer)
}
```

| Stars | Threshold | Displayed as |
|-------|-----------|--------------|
| 3 stars | `firstTryCorrect === 9` AND `lives > 0` | Three filled stars, Victory subtitle "Perfect compensation — all 9 first try!" |
| 2 stars | `firstTryCorrect ∈ {7, 8}` AND `lives > 0` | Two filled, one empty; Victory subtitle "Great work! ${firstTryCorrect} of 9 first try." |
| 1 star | `firstTryCorrect ≤ 6` AND `lives > 0` | One filled, two empty; Victory subtitle "You finished — keep practising!" (structurally rare per audit) |
| 0 stars | `lives === 0` (mid-session game-over) | Three empty stars; routes to Game Over (NOT Victory) |

**Star Generosity Audit note:** Because each wrong submit costs exactly one life, a student can have at most 3 wrong submits across the entire 9-round session before lives run out. Therefore a student who reaches Round 9 has by definition lost at most 2 lives, which means `firstTryCorrect ≥ 7`. The 1★ band (`firstTryCorrect ≤ 6` with `lives > 0`) is **structurally unreachable under standard play** — kept as a defensive default per creator spec.

| Outcome scenario | `firstTryCorrect` | `lives` at end | Stars | Routed via |
|------------------|-------------------|----------------|-------|------------|
| All 9 first-try correct | 9 | 3 | 3★ | Victory |
| 8 first-try, 1 retry-correct | 8 | 2 | 2★ | Victory |
| 7 first-try, 2 retry-correct | 7 | 1 | 2★ | Victory |
| 5–6 first-try (structurally unreachable) | 5–6 | ≥1 | 1★ | Victory (kept defensively) |
| 3 wrong submits → lives = 0 mid-session | n/a | 0 | 0★ | Game Over |

## Lives

| Parameter | Value |
|-----------|-------|
| Starting lives | 3 |
| Lives lost per wrong submit | 1 |
| Lives lost per +/- nudge tap | 0 |
| Lives lost per Reset tap | 0 |
| Game over condition | `lives === 0` |
| Lives display | 3 PART-023 standard red hearts in the persistent header (rendered alongside the 9-segment ProgressBar) |
| Life loss animation | heart-break / heart-dim 600 ms (component-owned by ProgressBarComponent / PART-023) |

`gameState.lives` is decremented by exactly 1 on each wrong submit (regardless of `attemptsOnThisRound` count — i.e. each wrong attempt costs a life, not "all retries on a round cost lives"). `gameState.lives` is NOT reset by the Try Again / Play Again / `restartGame()` path back to 3 (lives reset is part of `resetGameState()` inside `restartGame()`).

## Progress Bar (PART-023)

| Parameter | Value |
|-----------|-------|
| Tracks | Round number AND lives — `progressBar.update(currentRound, lives)` updates both segments and hearts |
| Segments | 9 (one per round) |
| Hearts | 3 (rendered alongside segments in the same component) |
| Position | **Top of game body** — below the fixed PreviewScreen header, above `#gameContent`. Owned by ScreenLayout + ProgressBarComponent. Visible on every screen except Preview. **Do NOT place at the bottom.** |
| Style | Filled bar, left-to-right; 3 red hearts dim from filled → outline as lives decrement |
| Updates (correct) | `progressBar.update(currentRound, lives)` is the **FIRST** action in the correct round-complete handler (memory: `progress_bar_round_complete`), BEFORE any awaited SFX/TTS. On R9 this paints `9/9` BEFORE Victory renders. |
| Updates (wrong-with-lives) | `progressBar.update(currentRound, lives - 1)` is the **FIRST** action in the wrong-with-lives handler, BEFORE any awaited SFX/TTS. Decrements heart visually before audio. |
| Updates (wrong-last-life) | Same as wrong-with-lives — `progressBar.update(currentRound, 0)` BEFORE awaited wrong SFX/TTS. |
| Restart-path reset | `progressBar.update(0, 3)` is called inside Motivation's `onMounted` AND as a safety net inside `restartGame()` (idempotent — both fire). |

## Round-set cycling impact on scoring

Across in-session restarts (Try Again / Play Again), `gameState.setIndex` cycles A → B → C → A. The score / firstTryCorrect / lives counters reset to 0 / 0 / 3 on each `restartGame()` (inside `resetGameState()`), so each session's star tier is computed against that session's 9 rounds only. The set rotation ensures the player sees fresh addend pairs on each restart; difficulty is parallel across sets, so Set B's R1 ≈ Set A's R1 in pedagogical demand.

`setIndex` itself is **NOT reset** by `resetGameState()` — it persists across in-session restarts and resets to 0 only on a fresh page load. This is enforced by the `restartGame()` ordering rule: `setIndex` is bumped in step 1 BEFORE `resetGameState()` is called in step 2; the `resetGameState()` body must NOT include `setIndex` in its reset list.

## Data Contract Fields

### `recordAttempt` (per submit)

```
{
  round: <currentRound 1..9>,
  set: <round.set 'A' | 'B' | 'C'>,
  id: <round.id e.g. 'A_r1_58_72'>,
  stage: <round.stage 1 | 2 | 3>,
  value: <inputEl.value.trim() — string>,
  is_correct: <boolean>,
  is_retry: <gameState.attemptsOnThisRound > 0 BEFORE the increment>,
  misconception_tags: [<resolveMisconception(round, typedValue) — single tag>],
  attempts_on_round: <gameState.attemptsOnThisRound + 1>
}
```

### `game_complete` (sent BEFORE end-game audio in `endGame()`)

```
{
  type: 'game_complete',
  data: {
    score: <gameState.score 0..9>,                          // count of rounds completed correctly (first OR retry)
    totalQuestions: 9,                                       // gameState.totalRounds
    stars: <gameState.stars 0..3>,                          // computed by getStars()
    accuracy: <(gameState.firstTryCorrect / 9) * 100>,      // first-try percentage (NOT score percentage)
    timeSpent: <Date.now() - gameState.startTime>,          // ms
    firstTryCorrect: <gameState.firstTryCorrect 0..9>,      // first-try-correct count (custom — surfaces the star-driver metric)
    lives: <gameState.lives 0..3>,                          // remaining lives
    setIndex: <gameState.setIndex 0..2>,                    // active round-set index (custom — surfaces which set was played)
    setLabel: <SETS[gameState.setIndex] — 'A' | 'B' | 'C'>  // active round-set label
  }
}
```

### `show_star` (sent from Stars Collected `onMounted` AFTER `sound_stars_collected` awaited)

```
{
  type: 'show_star',
  stars: <gameState.stars 0..3>
}
```

### `next_ended` (sent from FloatingButton 'next' click handler — single-stage exit)

```
{
  type: 'next_ended'
}
```

## Field Source Mapping

| Field | Source | Example value |
|-------|--------|---------------|
| `score` | `gameState.score` (count of all correct submits, first or retry) | 9 |
| `firstTryCorrect` | `gameState.firstTryCorrect` (count of correct submits where `attemptsOnThisRound === 0` at submit time) | 7 |
| `totalQuestions` | `gameState.totalRounds` (constant 9) | 9 |
| `stars` | `getStars()` reading `firstTryCorrect` and `lives` | 2 |
| `accuracy` | `(firstTryCorrect / 9) * 100` | 77.78 |
| `timeSpent` | `Date.now() - gameState.startTime` | 240000 (4 minutes) |
| `lives` | `gameState.lives` | 1 |
| `setIndex` | `gameState.setIndex` (0, 1, or 2) | 0 |
| `setLabel` | `SETS[gameState.setIndex]` ('A', 'B', or 'C') | 'A' |
| `attempts_on_round` | `gameState.attemptsOnThisRound + 1` (per `recordAttempt`) | 1 (first try) or 2 (retry) |
| `is_retry` | `gameState.attemptsOnThisRound > 0` BEFORE the increment (per `recordAttempt`) | `false` (first try) or `true` (retry) |
| `misconception_tags` | `[resolveMisconception(round, typedValue)]` (per `recordAttempt`) | `['compensation-applied-only-to-addend1']` or `['whole-rule-mismatch']` |

## Cross-checks

- ✅ Star formula reads `firstTryCorrect` + `lives` (NOT percentage of score / totalRounds).
- ✅ `score` increments on EVERY correct submit (first or retry). `firstTryCorrect` increments ONLY when `attemptsOnThisRound === 0` AT the correct submit.
- ✅ `attemptsOnThisRound` increments on every wrong submit; resets to 0 on round-advance (correct OR endGame). NEVER reset inside `resetRoundForRetry()`.
- ✅ Lives decrement by 1 on each wrong submit. +/- and Reset taps do NOT cost lives.
- ✅ Game Over fires when `lives === 0` after the wrong-feedback chain has completed (CASE 8).
- ✅ `getStars()` returns 0 on game-over, 3 on perfect, 2 on 7-8 first-try, 1 otherwise (defensive — structurally rare).
- ✅ ProgressBar.update is FIRST in round-complete handler (correct AND wrong) — BEFORE any awaited SFX/TTS.
- ✅ `setIndex` cycles A → B → C → A on restartGame; bumped BEFORE resetGameState; NOT in resetGameState's reset list; persists across in-session restarts; resets to 0 only on fresh page load.
- ✅ `game_complete` posted BEFORE end-game audio in `endGame()`. Carries `score`, `totalQuestions`, `stars`, `accuracy`, `timeSpent`, `firstTryCorrect`, `lives`, `setIndex`, `setLabel`.
- ✅ `recordAttempt` per-submit includes `round`, `set`, `id`, `stage`, `value`, `is_correct`, `is_retry`, `misconception_tags`, `attempts_on_round`.
