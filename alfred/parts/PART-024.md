### PART-024: TransitionScreen Component (v2)
**Purpose:** Welcome, results, game-over, and level transition screens with audio.
**API:** `new TransitionScreenComponent({ autoInject: true })` -> `.show({ icons, stars, title, subtitle, buttons, duration, persist, content, styles })` -> `.hide()`
**Key rules:**
- MANDATORY for all games — every transition MUST play audio (silent = not mathai-equivalent)
- `content` accepts HTML string for custom content (e.g., results metrics)
- `styles` object: `{ screen, card, title, subtitle, icons, buttons, custom }`
- `persist: true` keeps screen visible (for results); `duration` auto-hides (for welcome)
- Injects into `#mathai-transition-slot`
