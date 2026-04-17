# Scoring: Matching Doubles

## Scoring Model Summary

This game uses **time-only star rating** (not accuracy-based). Points are not tracked for the star decision — they are captured in `recordAttempt` for analytics. This deliberately decouples stars from accuracy per the spec's fluency/speed framing.

## Points (analytics only — does NOT affect stars)

| Action | Points | Notes |
|--------|--------|-------|
| Correct match (pair locked) | +1 | `gameState.totalPairsMatched++`. Stored for `score` in `game_complete`. |
| Wrong match | 0 | No point penalty. Life decrements instead. |

Total possible `score` over 9 rounds = **36 correct pairs** (3+3+3 + 4+4+4 + 5+5+5).

## Formula (time-based star rating)

```
elapsedMs       = timer-stopped-value - timer-started-value
                = (Date.now() - gameState.startTime)   // paused time excluded (CASE 14)
elapsedSeconds  = elapsedMs / 1000

stars = 3   if elapsedMs <= 60_000  AND lives > 0 at victory
stars = 2   if 60_000  < elapsedMs <= 90_000  AND lives > 0 at victory
stars = 1   if elapsedMs > 90_000  AND lives > 0 at victory
stars = 1   if game ended via lives === 0  (forced, regardless of elapsedMs)
```

`score` (analytics) = `gameState.totalPairsMatched` (0..36).
`accuracy` = `(totalPairsMatched / 36) * 100` (for `game_complete` payload).

## Star Thresholds

| Stars | Condition | Displayed as |
|-------|-----------|-------------|
| 3 stars | `elapsedMs ≤ 60_000` AND `lives > 0` at victory | Three filled stars |
| 2 stars | `60_000 < elapsedMs ≤ 90_000` AND `lives > 0` at victory | Two filled, one empty |
| 1 star | `elapsedMs > 90_000` AND `lives > 0` at victory | One filled, two empty |
| 1 star (forced) | `lives === 0` at any point | One filled, two empty |
| 0 stars | Not reachable — minimum is 1 | — |

Note: 0 stars is not reachable in this game because reaching Game Over forces 1★, and reaching Victory with `lives > 0` always gives at least 1★. This is a deliberate floor per spec §Scoring.

## Lives

| Parameter | Value |
|-----------|-------|
| Starting lives | 3 |
| Lives lost per wrong answer | 1 |
| Game over condition | `lives === 0` after a wrong match |
| Lives display | 3-heart row inside the progress bar block (below round counter). Filled hearts = remaining lives, empty hearts = lost lives. |
| Life loss animation | `.heart-break` 600ms on the just-emptied heart |

## Timer

| Parameter | Value |
|-----------|-------|
| Type | Count-up (no upper limit) via `TimerComponent` (CDN) |
| Start | `startGameAfterPreview()` — immediately after preview dismiss, before Welcome mounts (so Welcome transition time counts toward final). Alternative: start on Round 1 gameplay mount — the spec says "from `startGameAfterPreview()` to final pair matched in Round 9", so start at preview dismiss. |
| Stop | Last pair in Round 9 locked (before Victory screen renders), OR `lives === 0` (before Game Over renders). Store final `elapsedMs`. |
| Pause | (a) `document.visibilityState === 'hidden'` (CASE 14) — resumed on visibility restore (CASE 15). (b) Victory screen mount. (c) Game Over screen mount. |
| Reset | On `restartToRound1()` only: `gameState.startTime = Date.now()`, displayed value resets to `00:00`. |
| Display | Top-right of game body on gameplay screens. Hidden on Preview, Welcome, round_intro transitions, motivation, stars_collected (optional — building choice). Visible on Victory as the final frozen value for context. |

## Progress Bar

| Parameter | Value |
|-----------|-------|
| Tracks | Round number (`currentRound / 9`) AND lives (3-heart row) |
| Position | **Top of game body** — below the fixed preview header, above `#gameContent`. Owned by ScreenLayout + ProgressBarComponent. Visible on every screen except Preview. |
| Style | Filled bar left-to-right for round; heart row beside/below with filled vs. empty hearts. |
| Round counter updates | On **entering** each new round's gameplay screen (after round-intro auto-dismiss for Rounds 2–9, after Welcome tap for Round 1). Do NOT advance round counter on correct match — the spec bases the round advance on "every left-column tile correctly paired". |
| Lives row updates | On wrong match, immediately (same frame as the life decrement). Heart-break animation plays on the just-emptied heart (600ms). |
| State through Game Over | Preserved — shows `Round N / 9` for the round where game-over fired, and 0 hearts. |
| State through restart | Reset to `Round 1 / 9` + 3 hearts on `restartToRound1()`. |

## Partial Credit

None. A pair is either **locked (green)** or **not matched**. Students who lose all 3 lives mid-round do not receive partial credit for pairs already matched in that round beyond their contribution to the `score` analytics field.

## Round Advance Rule

A round is complete when **every entry in `round.left` has been correctly paired with its double in `round.right`** — i.e. `gameState.pairsLockedThisRound === round.left.length`. On satisfaction:
1. Block input (`isProcessing = true`).
2. Play round-complete SFX + dynamic TTS "Round complete!" (both awaited — CASE 6).
3. Reset `pairsLockedThisRound = 0`, increment `currentRound`, unblock input.
4. If `currentRound > 9` → Victory. Else → mount Round-N intro transition.

## Data Contract Fields (game_complete payload)

| Field | Source | Example value |
|-------|--------|---------------|
| `type` | literal | `"game_complete"` |
| `stars` | `gameState.stars` (computed per formula above) | `3` |
| `score` | `gameState.totalPairsMatched` | `36` |
| `totalQuestions` | literal `36` (total pairs across all 9 rounds) | `36` |
| `accuracy` | `(totalPairsMatched / 36) * 100` | `100` |
| `timeSpent` | `elapsedMs` (ms between `startTime` and stop) | `47000` |
| `gameStatus` | `"victory"` OR `"game_over"` | `"victory"` |

## recordAttempt payload (per match attempt, during gameplay)

| Field | Source | Example value |
|-------|--------|---------------|
| `is_correct` | true for pair locked, false for wrong match | `true` |
| `round` | `gameState.currentRound` | `7` |
| `misconception_tag` | `round.misconception_tags[wrongRightValue]` on wrong; `null` on correct | `"double-add-instead"` |
| `left_value` | the tapped left tile value | `15` |
| `right_value` | the tapped right tile value | `17` |

## Starting State (every new game + every restart)

```
gameState = {
  phase: 'start',              // → 'gameplay' on preview dismiss, 'results'|'game_over' on end
  currentRound: 1,
  lives: 3,
  startTime: null,             // set by startGameAfterPreview()
  selectedLeft: null,
  pairsLockedThisRound: 0,
  totalPairsMatched: 0,
  stars: 0,                    // computed at end only
  isProcessing: false,
}
```
