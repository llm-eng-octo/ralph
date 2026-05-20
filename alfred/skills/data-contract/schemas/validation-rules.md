Build-time and runtime validation rules with rule IDs used to enforce the data contract.

## Build-Time (Static Analysis -- validate-static.js)

These checks run on the raw HTML string before any browser execution. They use regex/string matching.

| Rule ID | What It Checks | How | Priority |
|---------|---------------|-----|----------|
| GEN-PM-001 | `game_complete` postMessage uses exact type string | Regex: `/postMessage.*game_complete/` | CRITICAL |
| GEN-PM-DUAL-PATH | `game_complete` fires on both victory and game-over | Checks postMessage is not inside victory-only if-block | CRITICAL |
| GEN-PM-READY | `game_ready` postMessage exists | Regex: `/postMessage\s*\(\s*\{[^}]*['"]game_ready['"][^}]*\}/`. Rule defined in [PART-008 § Boot ordering](../../../parts/PART-008.md#boot-ordering). | CRITICAL |
| GEN-PM-READY-AFTER-WAITFOR | Every `game_ready` site sits in the post-`waitForPackages()` region; a message listener (any callback shape) is registered in-region before each site; `game_ready` does not appear inside any `.catch(...)` recovery body. Rule defined in [PART-008 § Boot ordering](../../../parts/PART-008.md#boot-ordering). | Locates the boundary (either `await waitForPackages()` or `waitForPackages().then(...)`), iterates all `game_ready` matches via `matchAll`, and checks in-region + listener-before-ready + not-in-`.catch`. | CRITICAL |
| GEN-PM-READY-BEFORE-SETUPGAME | `setupGame()` runs AFTER the last `game_ready` postMessage. Rule defined in [PART-008 § Boot ordering](../../../parts/PART-008.md#boot-ordering). | Asserts the first `setupGame()` call site appears after the last `game_ready` postMessage site in source order. | CRITICAL |
| GEN-PHASE-INIT | `#app` initial `data-phase` matches `gameState.phase` init | Extracts both values via regex, compares | CRITICAL |
| GEN-PHASE-SEQUENCE | endGame sets `gameState.phase` BEFORE calling syncDOM | Checks assignment appears before syncDOM call in endGame body | STANDARD |
| GEN-PHASE-MCQ | At least 3 syncDOM calls exist | Counts `syncDOMState()` or `syncDOM()` occurrences | STANDARD |
| GEN-DATA-LIVES-SYNC | syncDOM writes `data-lives` for lives games | Checks for `data-lives` in syncDOM body when totalLives > 0 | STANDARD |
| GEN-SYNCDOMSTATE-ALLATTRS | syncDOM writes `data-round` and `data-score` | Checks for attribute set calls in syncDOM body | STANDARD |
| GEN-SHOWRESULTS-SYNC | showResults calls syncDOM after phase assignment | Checks call order in showResults body | STANDARD |
| GEN-RESTART-RESET | restartGame resets required gameState fields | Checks for assignment to `phase`, `currentRound`, `score`, `events` (NOT `attempts` — that's session-scoped per Fix 5; see `GEN-RESTART-ATTEMPTS-PRESERVED`) | STANDARD |
| GEN-RESTART-TRIES-PRESERVED | restartGame MUST NOT reset `gameState.tries` | Asserts `gameState.tries\s*=` does NOT appear in `restartGame` / `resetGameState` function body | STANDARD |
| GEN-RESTART-ATTEMPTS-PRESERVED | restartGame MUST NOT reset `gameState.attempts` | Asserts `gameState.attempts\s*=` does NOT appear in `restartGame` / `resetGameState` function body (only `startGame()` may reset it) | STANDARD |
| GEN-METRICS-CORRECT-PRESENT | game_complete metrics block contains `correct` and `roundCorrectness` keys | Locate the `metrics: { … }` block inside the `game_complete` postMessage; assert both keys present | CRITICAL |
| GEN-METRICS-CORRECT-PASSTHROUGH | `metrics.correct` is a passthrough of `endGame(correct)`'s arg | Allowed values: identifier `correct`, literal `true`, or `gameState.<name>`. Forbidden: `accuracy === 100`, `finalAttempt.correct`, `attempts[…].correct` | STANDARD |
| GEN-ENDGAME-CORRECT-ARG | `endGame` function declares a `correct` parameter; every call site passes an argument | Regex: `function\s+endGame\s*\(\s*correct\b` or `endGame\s*=\s*async\s*\(\s*correct\b`; ERROR on `endGame()` no-arg call | STANDARD |
| GEN-METRICS-ROUND-CORRECTNESS-DERIVED | `metrics.roundCorrectness` calls the canonical `deriveRoundCorrectness` helper | Regex: `roundCorrectness:\s*deriveRoundCorrectness\s*\(` | ADVISORY |
| GEN-METRICS-TIME-UNIT | `metrics.time` is in seconds, not milliseconds | Locate the `time:` expression in the metrics block. PASS if it contains `/ 1000` or `Math.round(`, or references an upstream variable with `/ 1000`. ERROR on raw `Date.now() - <var>` with no `/1000` | STANDARD |
| GEN-METRICS-TRIES-SCALAR | `metrics.tries` is a scalar expression, not an array | ERROR if `tries:` value is `[` literal or a name traceable to an array literal upstream | STANDARD |
| GEN-METRICS-TRIES-INIT | `gameState` initializer sets `tries: 1` | Locate `gameState` initializer; assert `tries:` key present | STANDARD |
| GEN-METRICS-TRIES-INCREMENT | Every `gameState.lives -= 1` is paired with `gameState.tries += 1` within ~200 chars | Scan for `gameState.lives\s*(-=\s*1|--)` and assert a matching `gameState.tries\s*(\+=\s*1|\+\+)` in the same function body | STANDARD |
| GEN-CORRECT-ANSWER-EXPOSURE | `gameState.correctAnswer` is set each round | Checks assignment exists in render function | ADVISORY |

## Runtime (Test Harness -- Playwright)

These checks run during actual browser execution via the test suite.

| Category | What It Checks | How |
|----------|---------------|-----|
| **contract** | `window.gameState` exists and has required fields | `page.evaluate(() => window.gameState)` then field-by-field assertion |
| **contract** | `data-phase` on `#app` matches `gameState.phase` | `page.getAttribute('#app', 'data-phase')` vs `page.evaluate(() => gameState.phase)` |
| **contract** | `game_complete` postMessage fires on endGame | Listen for `message` event, assert `type === 'game_complete'` |
| **contract** | `game_complete` has all required metrics fields | Destructure `data.metrics`, assert each field exists and has correct type. Authoritative shape: [`game-complete.schema.json`](./game-complete.schema.json) — load with `ajv` and validate intercepted payloads. The schema enforces `correct` (boolean), `roundCorrectness` (boolean[]), `time` (integer ≤ 86400, catches ms-not-converted bug), `tries` (integer ≥ 1, catches array-shape bug). |
| **contract** | `attempts` array has correct length | `data.metrics.attempts.length === rounds_played` |
| **contract** | Each attempt has all required fields | Iterate attempts, assert all 12 fields present |
| **game-flow** | Phase transitions happen in order | `waitForPhase('playing')` -> play rounds -> `waitForPhase('results')` or `waitForPhase('gameover')` |
| **game-flow** | `data-score` increments on correct answer | Read attribute before and after correct answer, assert increment |
| **game-flow** | `data-lives` decrements on wrong answer | Read attribute before and after wrong answer, assert decrement |
| **mechanics** | `isProcessing` guard prevents double-tap | Rapid-click and assert only one attempt recorded |
| **mechanics** | `gameEnded` guard prevents double-end | Trigger endGame twice, assert single `game_complete` |
| **edge-cases** | Replay resets all state | Click replay, assert `gameState.score === 0`, `attempts.length === 0`, `phase === 'start_screen'` |
