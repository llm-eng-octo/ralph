### PART-006: TimerComponent
**Purpose:** Countdown or count-up timer with pause/resume support.
**Condition:** Game has time pressure.
**API:** `new TimerComponent('timer-container', { timerType, format, startTime, endTime, autoStart, onEnd })`
**Key rules:**
- `timerType`: `'decrease'` (countdown) or `'increase'` (count-up)
- `format`: `'min'` (MM:SS) or `'sec'` (SS)
- Methods: `.start()`, `.pause({ fromVisibilityTracker })`, `.resume({ fromVisibilityTracker })`, `.getTimeTaken()`, `.reset()`
- Create BEFORE VisibilityTracker so tracker can reference `timer`
- `autoStart: false` — start manually after game begins
