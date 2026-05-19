# game_complete Schema — Single Source of Truth

The JSON Schema at [`game-complete.schema.json`](./game-complete.schema.json) is the **canonical definition** of the `game_complete` postMessage payload. Every other markdown doc in `alfred/` (postmessage-schema.md, data-contract/SKILL.md, PART-008.md) mirrors this schema. When they disagree, the JSON Schema wins.

## Why a JSON Schema

Three competing markdown definitions historically caused drift (`tries` shape, `time` unit, missing correctness fields). A single machine-readable schema:

1. Resolves drift at validation time — payloads validate against ONE definition.
2. Enables runtime validation in the Playwright test harness via `ajv`.
3. Surfaces field-level errors with stable paths (e.g. `data.metrics.tries` instead of regex matches).

## Embedded schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "alfred/game-complete",
  "type": "object",
  "required": ["type", "data"],
  "properties": {
    "type": { "const": "game_complete" },
    "data": {
      "type": "object",
      "required": ["metrics", "completedAt"],
      "properties": {
        "metrics": {
          "type": "object",
          "required": [
            "accuracy", "time", "stars", "attempts", "duration_data",
            "totalLives", "tries", "correct", "roundCorrectness"
          ],
          "properties": {
            "accuracy":         { "type": "integer", "minimum": 0, "maximum": 100 },
            "time":             { "type": "integer", "minimum": 0, "maximum": 86400 },
            "stars":            { "type": "integer", "minimum": 0, "maximum": 3 },
            "attempts":         { "type": "array" },
            "duration_data":    { "type": "object" },
            "totalLives":       { "type": "integer", "minimum": 0 },
            "tries":            { "type": "integer", "minimum": 1 },
            "correct":          { "type": "boolean" },
            "roundCorrectness": { "type": "array", "items": { "type": "boolean" } }
          }
        },
        "completedAt":   { "type": "integer" },
        "previewResult": { "type": ["object", "null"] }
      }
    }
  }
}
```

Refer to [`game-complete.schema.json`](./game-complete.schema.json) for the complete schema including `$defs/attempt`, `$defs/previewResult`, and per-field descriptions.

## Field reference

### `data.metrics.correct` (boolean, REQUIRED)

Overall game correctness. **Passthrough of the `correct` argument to `endGame(correct)`** — never derived.

| Game shape | Source |
|---|---|
| Standalone, evaluating | Submit handler passes its evaluation; `endGame(true)` if correct, `endGame(false)` when lives reach 0. |
| Multi-round, evaluating | Caller computes `correct = (gameState.lives > 0 && gameState.stars > 0)` at the final-round path; `endGame(false)` at the lives-zero branch. |
| Feedback-only (any shape) | Caller hardcodes `endGame(true)`. `metrics.correct === true` always. |

### `data.metrics.roundCorrectness` (boolean[], REQUIRED)

Per-round correctness, length `totalRounds`. Derived from `gameState.attempts` — walk the array and take the LAST attempt per `round_number`. Helper: `deriveRoundCorrectness(attempts, totalRounds)` in `code-patterns.md`.

- Standalone (`totalRounds: 1`): length-1 array. Equals `[correct]` by construction.
- Multi-round: length `totalRounds`. Multiple attempts on the same round (Try Again replays) collapse to their LAST `correct` value.

### `data.metrics.time` (integer SECONDS, REQUIRED)

Total game duration in **SECONDS**. Compute as `Math.round((Date.now() - gameState.startTime) / 1000)`. Schema upper bound `86400` (24 hours) is a sanity cap — values above this indicate a missing `/1000` conversion.

**Unit asymmetry warning.** `recordAttempt.time_since_start_of_game` and `recordAttempt.response_time_ms` are MILLISECONDS. `data.completedAt` is EPOCH MS. Only `metrics.time` is SECONDS.

### `data.metrics.tries` (integer ≥ 1, REQUIRED)

Counter representing total attempt count at the game.

- Initialized to `1` at game start (`gameState.tries = 1`).
- Incremented by `1` every time a life is lost.
- **Persists across Try Again** — `restartGame()` MUST NOT reset it. Same session-scope contract as `setIndex` and `attempts`.
- Formula: `tries = 1 + total_lives_lost_across_session`.

Worked examples:

| Scenario | `tries` |
|---|---|
| 3 lives, complete without losing | `1` |
| 3 lives, lose 1, complete | `2` |
| Lose all 3 → Try Again → fresh 3 lives → complete | `4` |
| Lose all 3 → Try Again → lose 1 → complete | `5` |

### `data.metrics.attempts` (array, REQUIRED)

Session-scoped attempt history. Accumulates across `restartGame()` / Try Again within the same iframe load. `round_number` values may repeat for multi-round games that went through Try Again; consumers should treat the array as ordered attempt history, NOT as a map keyed by round.

Per-attempt shape: see `$defs/attempt` in `game-complete.schema.json` and the longer description in [`attempt-schema.md`](./attempt-schema.md).

### `data.metrics.accuracy` (integer 0-100, REQUIRED)

Integer percentage. Compute over the full `attempts` array (including pre-restart history).

### `data.metrics.stars` (integer 0-3, REQUIRED)

Stars awarded at end-of-game.

### `data.metrics.totalLives` (integer ≥ 0, REQUIRED)

**Initial life budget** — the count of lives the player had when the question first rendered (`gameState.totalLives`, set at game start, never decremented). NOT the remaining count.

Lives remaining is derivable: `remaining = totalLives - (tries - 1)`. Emit `gameState.totalLives` (not `gameState.lives`) into this field.

### `data.metrics.duration_data` (object, REQUIRED)

Per-round timing telemetry. Game-specific shape.

### `data.completedAt` (integer epoch ms, REQUIRED)

`Date.now()` at the moment `endGame()` ran.

### `data.previewResult` (object | null, OPTIONAL)

Populated when the preview was interactive. See PART-039.

## Validation at build time

Static regex rules in `alfred/scripts/validate-static.js` enforce the schema's structural assertions against the generated HTML before any browser test runs. See:

- [`validation-rules.md`](./validation-rules.md) — full rule table with rule IDs.
- [`postmessage-schema.md`](./postmessage-schema.md) — narrative protocol doc; cross-links to rule IDs.

## Validation at runtime (Playwright test harness)

The Playwright test step can load this schema and validate intercepted `game_complete` payloads:

```javascript
const Ajv = require('ajv');
const schema = require('alfred/skills/data-contract/schemas/game-complete.schema.json');
const validate = new Ajv().compile(schema);

// In a Playwright test:
const payload = await page.evaluate(() => /* captured game_complete message */);
const ok = validate(payload);
if (!ok) console.error(validate.errors);
```

This catches semantic violations the static regex rules can't see (e.g. `time: 47000` because the game emitted milliseconds — caught by the `86400` upper bound).
