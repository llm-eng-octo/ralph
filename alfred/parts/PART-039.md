### PART-039: Preview Screen
**Purpose:** Instruction/preview screen shown before gameplay starts.
**API:** `new PreviewScreenComponent({ autoInject: true, slotId: 'mathai-preview-slot', gameContentId: 'gameContent' })` -> `.show({ instruction, audioUrl, previewContent, onComplete })`
**Key rules:**
- MANDATORY for every game
- Shows header bar (back button, avatar, question label), timer progress bar, instruction text
- `questionLabel`, `score`, `showStar` are read from `game_init` payload automatically
- In `game_init` handler, call `previewScreen.show()` instead of starting game directly
- `onComplete` callback receives `previewData` and should start actual gameplay
