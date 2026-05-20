### PART-008: PostMessage Protocol
**Purpose:** Communication between game (iframe) and parent harness via `window.postMessage`.
**Inbound:** `game_init` — delivers `content` + `signalConfig` to the game template.
**Outbound:** `game_ready` (after init), `game_complete` (with metrics/attempts at end).
**Key rules:**
- Boot ordering — see § Boot ordering below.
- `handlePostMessage` filters for `event.data.type === 'game_init'`, then calls `setupGame()`
- If PART-042: on `game_init`, configure SignalCollector with `signalConfig.flushUrl` and call `startFlushing()`

### Boot ordering {#boot-ordering}

**Single canonical source for the `game_ready` emission rule.** Every doc that touches boot order links here rather than restating.

**Canonical order inside `DOMContentLoaded`:**

> `await waitForPackages()` → `new XComponent(...)` ×N → `addEventListener('message', handlePostMessage)` → `postMessage({type:'game_ready'}, '*')` → `setupGame()`

Either form of the wait boundary is legal: `await waitForPackages()` in an `async` handler, OR `waitForPackages().then(...)` — for the purposes of the rule, both define a "post-`waitForPackages()` region" that must contain the constructors, the listener, and the `game_ready` postMessage.

**Why this order matters.** The host harness replies to `game_ready` with `game_init` (carrying `content` + `signalConfig`). If `game_ready` fires before component constructors run, `game_init` lands on `undefined` refs and `setupGame()` crashes. The canonical bug shape: listener + `game_ready` on the outer `DOMContentLoaded` body while constructors sit inside `waitForPackages().then(...)`.

**Validators (all in [`validate-static.js`](../scripts/validate-static.js)):**

- `GEN-PM-READY` — `game_ready` postMessage exists.
- `GEN-PM-READY-AFTER-WAITFOR` — every `game_ready` site sits in the post-`waitForPackages()` region; a message listener is registered in-region before each site; `game_ready` does not appear inside any `.catch(...)` body.
- `GEN-PM-READY-BEFORE-SETUPGAME` — `setupGame()` runs only AFTER `game_ready` is posted.

### Metrics fields (game_complete payload)

The `data.metrics` block sent in `game_complete` carries the canonical session result. **Source of truth:** [`alfred/skills/data-contract/schemas/game-complete.schema.json`](../skills/data-contract/schemas/game-complete.schema.json).

| Field | Type | Notes |
|---|---|---|
| `accuracy` | integer 0–100 | Computed over the full `attempts` array (including pre-Try-Again history). |
| `time` | integer **SECONDS** | `Math.round((Date.now() - gameState.startTime) / 1000)`. Note other time fields in the payload are MILLISECONDS — see [`postmessage-schema.md` § Time unit asymmetry](../skills/data-contract/schemas/postmessage-schema.md). |
| `stars` | integer 0–3 | Stars awarded at end-of-game. |
| `attempts` | array | Session-scoped — accumulates across Try Again / `restartGame()`. See [`attempt-schema.md`](../skills/data-contract/schemas/attempt-schema.md). |
| `duration_data` | object | Per-round timing telemetry. |
| `totalLives` | integer ≥ 0 | **Initial life budget** — count of lives the player had when the question first rendered (`gameState.totalLives`, set at game start, never decremented). NOT the remaining count. Lives remaining is derivable: `remaining = totalLives - (tries - 1)`. |
| `tries` | integer ≥ 1 | **Counter** = `1 + total_lives_lost_across_session`. Persists across Try Again. NOT an array. See [`postmessage-schema.md` § tries — counter semantics](../skills/data-contract/schemas/postmessage-schema.md). |
| `correct` | boolean | Overall correctness. PASSTHROUGH of `endGame(correct)`'s argument — never derived. See [`postmessage-schema.md` § Correctness fields](../skills/data-contract/schemas/postmessage-schema.md). |
| `roundCorrectness` | boolean[] | Per-round correctness, length `totalRounds`. Derived via `deriveRoundCorrectness(attempts, totalRounds)` — takes the LAST attempt per `round_number`. |

The caller of `endGame(correct)` decides what value to pass:

- **Standalone (`totalRounds: 1`), evaluating** — Submit handler passes its evaluation: `endGame(true)` on correct, `endGame(false)` when lives reach 0.
- **Multi-round (`totalRounds > 1`), evaluating** — `endGame(gameState.lives > 0 && gameState.stars > 0)` at the final-round path; `endGame(false)` at the lives-zero branch.
- **Feedback-only (any shape, no correctness eval)** — `endGame(true)` hardcoded; every `recordAttempt(...)` uses `correct: true`.
