### PART-027: Play Area Construction
**Purpose:** Framework for designing the interactive game area inside `#gameContent`.
**Process:** Interpret game definition -> construct spatial layout -> model player behavior -> build HTML
**Key rules:**
- Play area HTML must be injected into `#gameContent` via JS AFTER `ScreenLayout.inject()`
- Do NOT place play area HTML directly in `<body>` or `#app`
- Design: spatial layout (grid/linear/freeform), interactive elements, visual zones, state indicators
