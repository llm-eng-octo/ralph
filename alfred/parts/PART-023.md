### PART-023: ProgressBar Component (v2)
**Purpose:** Round counter + lives display in gameplay header.
**API:** `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds, totalLives })` -> `.update(roundsCompleted, livesRemaining)` -> `.destroy()`
**Key rules:**
- Game MUST NOT render its own round/lives display
- `update()` takes rounds COMPLETED (0-based), not current round number
- Lives param: always `Math.max(0, lives)` to prevent RangeError
- Use `createProgressBar()` helper for init and restart (destroy old, create new)
- Never call `.init()`, `.start()`, `.reset()` — they don't exist
