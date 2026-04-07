### PART-011: End Game & Metrics
**Purpose:** `endGame()` function — computes final metrics, seals signals, shows results, notifies parent.
**API:** `endGame()` — guards with `if (!gameState.isActive) return`, sets `isActive = false`
**Metrics computed:** `accuracy`, `time`, `stars` (3/2/1/0 based on 80%/50%/0% thresholds), `attempts`, `duration_data`, `tries` (per-round)
**Key rules:**
- Uses `computeTriesPerRound(attempts)` helper for per-round try counts
- Calls `signalCollector.seal()`, then `showResults(metrics)`, then `window.parent.postMessage({ type: 'game_complete', data: { metrics, attempts, completedAt } })`
- Stars: >=80% = 3, >=50% = 2, >0% = 1, 0% = 0
