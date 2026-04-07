### PART-012: Debug Functions
**Purpose:** Exposes `window.debugGame()`, `window.debugAudio()`, `window.testAudio(id)`, `window.testPause()`, `window.testResume()`.
**Key rules:**
- `debugGame()` logs `gameState` as JSON
- `testPause()` uses `visibilityTracker.triggerInactive()` (NOT `simulatePause()`)
- `testResume()` uses `visibilityTracker.triggerResume()` (NOT `simulateResume()`)
