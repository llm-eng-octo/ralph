### PART-017: Feedback Integration
**Purpose:** Audio feedback and sticker animations on correct/incorrect answers.
**Condition:** Game has audio feedback or sticker moments.
**API (preload):** `await FeedbackManager.sound.preload([{ id, url }, ...])` — NO `register()` method
**API (play):** `await FeedbackManager.sound.play('correct_tap', { subtitle, sticker: { image, duration } })`
**Key rules:**
- Simple games: preload `correct_tap` + `wrong_tap`
- Multi-part games: preload `all_correct`, `partial_correct_attempt1`, `partial_correct_last_attempt`, `all_incorrect_attempt1`, `all_incorrect_last_attempt`
- Sticker object: `{ image: URL, duration: seconds }` — shows animated GIF overlay
- Use `preload()` with array of `{id, url}` — there is NO `register()` method
