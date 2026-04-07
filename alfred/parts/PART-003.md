### PART-003: waitForPackages
**Purpose:** Async polling function that waits for all CDN packages to be defined on `window`.
**API:** `await waitForPackages()` — polls every 50ms, 10s timeout, shows error div on failure.
**Key rules:**
- Checks: `FeedbackManager`, `TimerComponent`, `VisibilityTracker`, `SignalCollector`
- Must be called first thing in DOMContentLoaded
- On timeout, replaces body with "Failed to load" message and throws
