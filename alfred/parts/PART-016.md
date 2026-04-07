### PART-016: StoriesComponent
**Purpose:** Narrative/story display with slides, inputs, and completion tracking.
**Condition:** Game has narrative/story elements.
**API:** `new StoriesComponent('story-container', { storyBlockId, onComplete, onStoryChange, onError })`
**Key rules:**
- `storyBlockId` (required) — GraphQL block ID, component fetches story data internally
- `onComplete` receives `{ history, inputs, globalContext, durations }`
- Hide story container and show game screen in `onComplete`
