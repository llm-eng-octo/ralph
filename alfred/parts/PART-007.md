### PART-007: Game State Object
**Purpose:** Global `window.gameState` object tracking rounds, score, attempts, events, timing.
**API:** `window.gameState = { currentRound: 0, totalRounds, score, attempts: [], events: [], startTime, isActive, content, duration_data: { ... } }`
**Key rules:**
- Declare `let timer = null; let visibilityTracker = null; let signalCollector = null;` alongside
- Placed at top of `<script>`, before initialization block
- `duration_data` must include `startTime`, `preview`, `attempts`, `evaluations`, `inActiveTime`, `totalInactiveTime`
