### PART-028: InputSchema Patterns
**Purpose:** Defines the content structure a game template expects via `game_init` postMessage.
**Concept:** One template + unlimited content variations = reusable games. Backend validates content against schema.
**Key rules:**
- Schema defines shape of `event.data.data.content` from `game_init`
- Common patterns: question list, multi-choice, grid content, story blocks
- Serialized to `inputSchema.json` in post-gen step (PART-034)
