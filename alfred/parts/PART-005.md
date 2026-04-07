### PART-005: VisibilityTracker
**Purpose:** Pauses game (timer, audio, signals) when tab loses focus, resumes on return.
**API:** `new VisibilityTracker({ onInactive, onResume, popupProps })`
**Key rules:**
- `onInactive`: pause timer, pause `FeedbackManager.sound`/`stream`, record inactive time
- `onResume`: resume timer (only if `isPaused`), resume audio, record inactive end time
- Shows a "Game Paused" popup via `popupProps`
- Use `visibilityTracker.triggerInactive()` for testing (NOT `simulatePause()`)
