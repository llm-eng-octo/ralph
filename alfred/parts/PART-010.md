### PART-010: Event Tracking & SignalCollector
**Purpose:** Two complementary tracking systems — `trackEvent` (game-level) and `SignalCollector` (atomic interactions).
**API (trackEvent):** `trackEvent(type, target, data)` — pushes to `gameState.events[]`
**API (SignalCollector):** `new SignalCollector({ sessionId, studentId, gameId, contentSetId })` -> `.recordCustomEvent(name, data)` -> `.seal()`
**Key rules:**
- Standard events: `game_start`, `game_end`, `question_shown`, `tap`, `input_change`, `drag_start`, `drag_end`, `game_paused`, `game_resumed`
- NEVER define an inline stub/polyfill for SignalCollector — it shadows the real CDN class
- `signalCollector.seal()` called in `endGame()` — fires sendBeacon to flush, stops timer
