### PART-038: InteractionManager
**Purpose:** Suppress user interaction during audio feedback or evaluation.
**Condition:** Game needs interaction suppression during feedback.
**API:** `new InteractionManager({ selector, disableOnAudioFeedback, disableOnEvaluation })` -> `.enable(reason)` / `.disable(reason)`
**Key rules:**
- Must be assigned to `window.interactionManager` for FeedbackManager auto-integration
- Controls `pointer-events` on the selected element
- Place after `FeedbackManager.init()` in DOMContentLoaded
