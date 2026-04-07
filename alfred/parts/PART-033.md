### PART-033: Interaction Patterns
**Purpose:** Reusable patterns for drag-and-drop, grids, and tag/chip inputs.
**Condition:** Game uses drag-and-drop, grids, or tag/chip inputs.
**Patterns:**
- **Drag & Drop:** `draggable="true"` items + `.drop-zone` slots with `dragstart`/`dragover`/`drop` handlers
- **Grid:** CSS Grid with clickable cells, `data-row`/`data-col` attributes
- **Tag/Chip Input:** Removable tags with text input, flexbox layout
