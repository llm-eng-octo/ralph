Build-time and runtime validation rules with rule IDs used to enforce the data contract.

## Build-Time (Static Analysis -- validate-static.js)

These checks run on the raw HTML string before any browser execution. They use regex/string matching.

| Rule ID | What It Checks | How | Priority |
|---------|---------------|-----|----------|
| GEN-PM-001 | `game_complete` postMessage uses exact type string | Regex: `/postMessage.*game_complete/` | CRITICAL |
| GEN-PM-DUAL-PATH | `game_complete` fires on both victory and game-over | Checks postMessage is not inside victory-only if-block | CRITICAL |
| GEN-PM-READY | `game_ready` postMessage exists | Regex: `/postMessage\s*\(\s*\{[^}]*['"]game_ready['"][^}]*\}/` | CRITICAL |
| GEN-PHASE-INIT | `#app` initial `data-phase` matches `gameState.phase` init | Extracts both values via regex, compares | CRITICAL |
| GEN-PHASE-SEQUENCE | endGame sets `gameState.phase` BEFORE calling syncDOM | Checks assignment appears before syncDOM call in endGame body | STANDARD |
| GEN-PHASE-MCQ | At least 3 syncDOM calls exist | Counts `syncDOMState()` or `syncDOM()` occurrences | STANDARD |
| GEN-DATA-LIVES-SYNC | syncDOM writes `data-lives` for lives games | Checks for `data-lives` in syncDOM body when totalLives > 0 | STANDARD |
| GEN-SYNCDOMSTATE-ALLATTRS | syncDOM writes `data-round` and `data-score` | Checks for attribute set calls in syncDOM body | STANDARD |
| GEN-SHOWRESULTS-SYNC | showResults calls syncDOM after phase assignment | Checks call order in showResults body | STANDARD |
| GEN-RESTART-RESET | restartGame resets required gameState fields | Checks for assignment to `phase`, `currentRound`, `score`, `attempts`, `events` | STANDARD |
| GEN-CORRECT-ANSWER-EXPOSURE | `gameState.correctAnswer` is set each round | Checks assignment exists in render function | ADVISORY |

## Runtime (Test Harness -- Playwright)

These checks run during actual browser execution via the test suite.

| Category | What It Checks | How |
|----------|---------------|-----|
| **contract** | `window.gameState` exists and has required fields | `page.evaluate(() => window.gameState)` then field-by-field assertion |
| **contract** | `data-phase` on `#app` matches `gameState.phase` | `page.getAttribute('#app', 'data-phase')` vs `page.evaluate(() => gameState.phase)` |
| **contract** | `game_complete` postMessage fires on endGame | Listen for `message` event, assert `type === 'game_complete'` |
| **contract** | `game_complete` has all required metrics fields | Destructure `data.metrics`, assert each field exists and has correct type |
| **contract** | `attempts` array has correct length | `data.metrics.attempts.length === rounds_played` |
| **contract** | Each attempt has all required fields | Iterate attempts, assert all 12 fields present |
| **game-flow** | Phase transitions happen in order | `waitForPhase('playing')` -> play rounds -> `waitForPhase('results')` or `waitForPhase('gameover')` |
| **game-flow** | `data-score` increments on correct answer | Read attribute before and after correct answer, assert increment |
| **game-flow** | `data-lives` decrements on wrong answer | Read attribute before and after wrong answer, assert decrement |
| **mechanics** | `isProcessing` guard prevents double-tap | Rapid-click and assert only one attempt recorded |
| **mechanics** | `gameEnded` guard prevents double-end | Trigger endGame twice, assert single `game_complete` |
| **edge-cases** | Replay resets all state | Click replay, assert `gameState.score === 0`, `attempts.length === 0`, `phase === 'start_screen'` |
