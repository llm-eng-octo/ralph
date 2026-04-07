### PART-025: ScreenLayout Component (v2)
**Purpose:** Auto-generates page structure with sections API.
**API:** `ScreenLayout.inject('app', { sections: { header, questionText, progressBar, playArea, transitionScreen }, styles: { ... } })`
**Key rules:**
- HTML requires only `<div id="app"></div>` — ScreenLayout builds everything inside
- Sections: `header` (only if timer/HUD), `questionText` (always), `progressBar` (always), `playArea` (always), `transitionScreen` (always)
- Returns `{ header, questionText, progressBar, playArea, transitionSlot, progressSlot, gameContent }`
- Game content goes inside `#gameContent` (injected by ScreenLayout)
- Old `slots` API is DEPRECATED — use `sections`
