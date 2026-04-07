### PART-019: Results Screen (v2 via TransitionScreen)
**Purpose:** Show end-of-game results using TransitionScreen's content slot.
**API:** `transitionScreen.show({ stars, title, content: metricsHTML, buttons: [{ text, type, action }], persist: true })`
**Key rules:**
- v1 standalone `#results-screen` div is DEPRECATED — TransitionScreen hides `#gameContent`
- Build metrics HTML string with accuracy, time, avg speed
- Use `persist: true` so results screen stays visible
