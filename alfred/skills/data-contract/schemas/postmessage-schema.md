# postMessage Schema

Per **PART-008** (PostMessage Protocol). See `parts/PART-008.md` for the full protocol — game_ready, game_init, game_complete message formats.

> **Single source of truth:** [`game-complete.schema.json`](./game-complete.schema.json) (with prose companion [`game-complete.schema.md`](./game-complete.schema.md)) is the canonical machine-readable definition of the `game_complete` payload. This file mirrors it in prose — when in doubt, the JSON Schema wins.

## Alfred-specific rules (cross-PART, not in PART-008 alone)

### game_complete MUST be nested (CRITICAL)

```javascript
// WRONG — flat structure, platform receives undefined metrics
window.parent.postMessage({
  type: 'game_complete',
  metrics: { accuracy: 70 },  // platform reads event.data.data.metrics — misses this
  completedAt: Date.now()
}, '*');

// RIGHT — nested under data
window.parent.postMessage({
  type: 'game_complete',
  data: {
    metrics: {
      accuracy: 70,
      time: 45,                                                                            // SECONDS — Math.round((Date.now() - gameState.startTime) / 1000)
      stars: 2,
      attempts: gameState.attempts,                                                        // session-scoped; survives Try Again
      duration_data: gameState.duration_data,
      totalLives: gameState.totalLives,                                                    // INITIAL life budget (count at first render); NOT remaining. Remaining = totalLives - (tries - 1).
      tries: gameState.tries,                                                              // INTEGER counter = 1 + lives_lost; NOT an array
      correct: correct,                                                                    // PASSTHROUGH of endGame(correct) arg
      roundCorrectness: deriveRoundCorrectness(gameState.attempts, gameState.totalRounds)
    },
    completedAt: Date.now()
  }
}, '*');
```

### game_init handler — phase MUST be first line (CRITICAL)

Per GEN-PHASE-INIT: `gameState.phase = 'gameplay'` must be the VERY FIRST LINE in the game_init handler, before any content processing. Test harness calls `waitForPhase('gameplay')` immediately after sending game_init.

### Dual-path firing (GEN-PM-DUAL-PATH)

game_complete MUST fire on BOTH paths: `endGame(false)` (all rounds done → results) AND `endGame(true)` (lives exhausted → game_over). A single endGame function handles both.

### Required metrics fields

Per PART-008 + Alfred data requirements:

| Field | Type | Notes |
|---|---|---|
| `accuracy` | integer 0–100 | Never `0.0–1.0` float. Computed over the full `attempts` array (including pre-Try-Again history). |
| `time` | integer **SECONDS** | `Math.round((Date.now() - gameState.startTime) / 1000)`. See § Time unit asymmetry below. |
| `stars` | integer 0–3 | Stars awarded at end-of-game. |
| `attempts` | array | Session-scoped attempt history. See § `metrics.attempts` — session-scoped below. |
| `duration_data` | object | Per-round timing telemetry. Game-specific shape. |
| `totalLives` | integer ≥ 0 | **Initial life budget** — count of lives at first render (`gameState.totalLives`, set at game start, never decremented). NOT remaining. Remaining is derivable: `remaining = totalLives - (tries - 1)`. |
| `tries` | integer ≥ 1 | **Counter** = `1 + total_lives_lost_across_session`. See § `tries` — counter semantics below. |
| `correct` | boolean | Overall correctness. PASSTHROUGH of `endGame(correct)`'s argument — never derived. See § Correctness fields below. |
| `roundCorrectness` | boolean[] | Per-round correctness, length `totalRounds`. See § Correctness fields below. |

See PART-008 for recommended fields.

### Correctness fields (`correct`, `roundCorrectness`)

**`correct: boolean`** — overall game correctness. Source: the `correct` argument passed into `endGame(correct)`. Direct passthrough — `metrics.correct = correct`. Never derive from `accuracy === 100`, never read `attempts[attempts.length - 1].correct`. The caller (Submit handler for standalone, end-of-game router for multi-round) decides the value at the call site.

| Game shape | What the caller passes |
|---|---|
| **Standalone (`totalRounds: 1`), evaluating** | The Submit handler's evaluation: `endGame(true)` on correct, `endGame(false)` when lives reach 0. Already canonical per PART-050 § Standalone lifecycle. |
| **Multi-round (`totalRounds > 1`), evaluating** | `endGame(gameState.lives > 0 && gameState.stars > 0)` at the final-round path; `endGame(false)` at the lives-zero branch. (Multi-round `endGame()` signature changes to `endGame(correct)`.) |
| **Feedback-only (any shape, no correctness eval)** | `endGame(true)` hardcoded. Every `recordAttempt(...)` call uses `correct: true`. `metrics.correct === true` always. Applies to BOTH standalone and multi-round feedback-only games. |

**`roundCorrectness: boolean[]`** — per-round correctness, length `totalRounds`. Derived from `gameState.attempts` via the canonical `deriveRoundCorrectness(attempts, totalRounds)` helper:

```javascript
function deriveRoundCorrectness(attempts, totalRounds) {
  var byRound = {};
  for (var i = 0; i < attempts.length; i++) {
    byRound[attempts[i].round_number] = attempts[i].correct;
  }
  var out = [];
  for (var r = 1; r <= totalRounds; r++) {
    out.push(byRound[r] === true);   // missing rounds default to false
  }
  return out;
}
```

The helper takes the LAST attempt per `round_number`. For multi-round games that went through Try Again (repeating `round_number`s in `attempts`), the player's most-recent correctness for each round wins.

### Time unit asymmetry

The `game_complete` payload mixes units across fields. Be explicit:

| Field | Unit |
|---|---|
| `data.metrics.time` | INTEGER SECONDS |
| `data.completedAt` | EPOCH MILLISECONDS (`Date.now()`) |
| `data.metrics.attempts[i].attempt_timestamp` | EPOCH MILLISECONDS |
| `data.metrics.attempts[i].time_since_start_of_game` | MILLISECONDS |
| `data.metrics.attempts[i].response_time_ms` | MILLISECONDS |

Only `metrics.time` is in seconds. Canonical conversion at the call site:

```javascript
var totalTime = gameState.startTime ? Math.round((Date.now() - gameState.startTime) / 1000) : 0;
// ... emit { ..., time: totalTime, ... } inside metrics
```

Emitting raw `Date.now() - gameState.startTime` (milliseconds) into `metrics.time` is a bug. Validator `GEN-METRICS-TIME-UNIT` catches the missing `/1000` conversion at build time. The JSON Schema's `time` upper bound (`86400`) catches the same bug at runtime (a 24-hour cap; ms values blow past it).

### `tries` — counter semantics

`tries: number` is an INTEGER counter representing total attempt count at the game.

- **Initialized to `1`** in the `gameState` initializer (`gameState.tries = 1`).
- **Incremented by `1`** every time the player loses a life — in the wrong-answer / life-decrement branch, adjacent to `gameState.lives -= 1`.
- **Persists across Try Again** — `restartGame()` MUST NOT reset `gameState.tries`. Same session-scoped contract as `setIndex` (see SKILL.md § Session-scoped fields).
- Formula: `tries = 1 + total_lives_lost_in_session`.

Worked examples (3-life games; standalone and multi-round behave identically):

| Scenario | `tries` |
|---|---|
| Complete without losing any life | `1` |
| Lose 1 life, complete | `2` |
| Lose all 3 → Try Again → fresh 3 lives → complete without losing | `4` |
| Lose all 3 → Try Again → lose 1 → complete | `5` |

Validator rules: `GEN-METRICS-TRIES-SCALAR` (no array shape), `GEN-METRICS-TRIES-INIT` (initialized to 1), `GEN-METRICS-TRIES-INCREMENT` (paired with `lives -= 1`), `GEN-RESTART-TRIES-PRESERVED` (not reset by `restartGame()`).

### `metrics.attempts` — session-scoped

The `attempts` array contains EVERY attempt across the entire iframe session, including pre-Try-Again history. `restartGame()` does NOT reset `gameState.attempts` (only `startGame()` does — that's the fresh-session boot, fired once per page load).

For multi-round games that went through a game-over → Try Again loop, `round_number` values may repeat:

```
attempts: [
  { round_number: 1, correct: true,  is_retry: false, ... },
  { round_number: 2, correct: false, is_retry: false, ... },
  { round_number: 3, correct: false, is_retry: false, ... },   // lives exhausted here → game over
  // — Try Again pressed; restartGame() runs; gameState.attempts SURVIVES —
  { round_number: 1, correct: true,  is_retry: true,  ... },
  { round_number: 2, correct: true,  is_retry: true,  ... },
  { round_number: 3, correct: true,  is_retry: true,  ... }
]
```

Consumers MUST treat the array as ordered attempt history, NOT as a map keyed by round. `roundCorrectness` (above) takes the LAST attempt per round, which is the natural "most-recent correctness" signal. `accuracy` continues to compute over the full array.

`is_retry: true` flags any attempt that is not the first attempt of its `round_number` across the session — both within-round retries and post-restart replays.

Validator rule `GEN-RESTART-ATTEMPTS-PRESERVED` blocks any `gameState.attempts =` assignment in `restartGame()` / `resetGameState()`.

### next_ended (PART-050) — end-of-game navigation signal

After a game ends and the player has viewed the victory / game_over TransitionScreen + tapped the FloatingButton Next button, the game MUST post a `next_ended` message:

```javascript
window.parent.postMessage({ type: 'next_ended' }, '*');
```

- Fires ONCE per game session, AFTER `game_complete`, in response to the user clicking Next.
- Does NOT replace `game_complete` — host listens for both. `game_complete` carries metrics; `next_ended` is a pure navigation signal the host uses to decide iframe teardown / advance to the next worksheet item.
- Minimal payload — only `type` is required. Future optional fields (e.g. `data.viewedResultsMs`) may be added without breaking compatibility.
- Sent from the `floatingBtn.on('next', ...)` handler. See PART-050's "Next flow" section for the canonical handler shape.

Validator rules: `GEN-FLOATING-BUTTON-NEXT-MISSING`, `GEN-FLOATING-BUTTON-NEXT-POSTMESSAGE` — both fire when a FloatingButton-using game reaches end-game without the Next + `next_ended` wiring.

### Per-round `answer` field (PART-051) — answer-component payload

Each entry in `content.rounds[i]` MAY carry an `answer` field that the AnswerComponent uses to render its slide for that round. The harness does not validate the inner shape — it is **game-specific** and follows the same per-game contract as the question payload. The shape MUST be documented in `spec.md`'s content-schema section, and added to `inputSchema.json` during deployment for content-set validation.

```javascript
// example — grid game with a solved-cell map
{
  type: 'game_init',
  data: {
    content: {
      rounds: [
        {
          round: 1,
          // ... existing question fields ...
          answer: {
            queens: [{ r: 0, c: 2 }, { r: 1, c: 0 }, { r: 2, c: 3 }, { r: 3, c: 1 }]
          }
        }
      ]
    }
  }
}
```

For a **standalone game with N evaluated answers** (`totalRounds: 1`, multiple answers shown as separate carousel slides), use an `answers: [...]` array on the single round:

```javascript
{
  rounds: [{
    round: 1,
    // ... question fields ...
    answers: [
      { /* slide 1 payload */ },
      { /* slide 2 payload */ },
      { /* slide 3 payload */ }
    ]
  }]
}
```

When the spec declares `answerComponent: false`, the field is unused (and may be omitted) — validator rules in the `GEN-ANSWER-COMPONENT-*` group auto-skip. **`answerComponent: false` is a CREATOR-ONLY opt-out per PART-051; no LLM step may auto-default it.** Spec-creation MUST default `answerComponent` to `true` silently; spec-review FAILs any spec setting `false` without quoted creator opt-out (check H5); build MUST NOT mutate spec.md to silence the validator.

#### Standalone `game_complete` — `attempts` cardinality

For a standalone game (`totalRounds: 1`), `gameState.attempts` accumulates across Try Again retries. Cardinality:

- **No retries (correct on first submit, OR wrong on first submit with `totalLives: 1`):** `attempts.length === 1`. Single record with `correct: true|false`.
- **N − 1 retries used (multi-life standalone, finally correct or out of lives):** `attempts.length === N`. Each record has `is_retry: true` after the first; the last record has `correct: true` (won on a later try) or `correct: false` (out of lives, end-of-game).
- **`attempts.length` never exceeds `totalLives`** — once lives reach 0, the game ends and no more retries are possible.

Example `game_complete` payload for a 3-life standalone where the player got it wrong twice then correct on the third try:

```javascript
window.parent.postMessage({
  type: 'game_complete',
  data: {
    metrics: {
      accuracy: 100,              // got it right eventually
      time: 38,                   // SECONDS — Math.round((Date.now() - gameState.startTime) / 1000)
      stars: 1,                   // typical: fewer stars when retries used
      correct: true,              // PASSTHROUGH of endGame(correct) — player got it right on the 3rd try
      roundCorrectness: [true],   // length-1 array for totalRounds: 1; equals [correct]
      attempts: [
        { round_number: 1, correct: false, is_retry: false, /* … */ },
        { round_number: 1, correct: false, is_retry: true,  /* … */ },
        { round_number: 1, correct: true,  is_retry: true,  /* … */ }
      ],
      duration_data: gameState.duration_data,
      totalLives: 3,              // INITIAL budget — player started with 3 lives. Remaining = 3 - (3 - 1) = 1.
      tries: 3                    // INTEGER counter = 1 + 2 lives lost
    },
    completedAt: Date.now(),
    previewResult: null
  }
}, '*');
```

For a 1-life standalone, `attempts.length === 1` always. `tries` is `1` if the player got it right on the first try (no life lost), or `2` if the player got it wrong and the single life was consumed (1 + 1 life lost).

### game_init.data.score and game_init.data.questionLabel

The ActionBar header is **state-driven by `game_init` only**. The denominator (`y` in `x/y`) and the question label are locked at boot and cannot be mutated at runtime by game code.

| Field | Type | Default | Notes |
|---|---|---|---|
| `data.score` | `'X/Y'` string OR `{ x: number, y: number }` | `'0/3'` (or `'0/' + totalRounds` if you set `y`) | Initial baseline of `#previewScore`. **`y` is locked for the session** — `show_star` increments only the numerator `x`. Set `y` to the maximum stars achievable (typically `3`). |
| `data.questionLabel` | `string` matching `/^Q\d+$/` | `'Q1'` | Initial label of `#previewQuestionLabel`. Format is enforced (validator `GEN-QUESTION-LABEL-FORMAT`) — game-internal vocabulary like "Level N" / "Round N" / "Stage N" goes in `#gameContent`, never in the platform header. |
| `data.showStar` | `boolean` | `true` | Visibility of `#previewStar`. |

Games MUST NOT call `previewScreen.setScore(...)` or `previewScreen.setQuestionLabel(...)` — these methods are not part of the public API. Validator rules `GEN-ACTIONBAR-STARS-IMMUTABLE` and `GEN-QUESTION-LABEL-IMMUTABLE` block any such calls statically.

### show_star (PART-040) — intra-frame star-award animation

A game-triggered postMessage consumed by the ActionBar in the **same window** (not the host). Fires the flying-star animation, plays the award chime, upgrades the static `#previewStar` image to the awarded tier, and **increments the `#previewScore` numerator by `count`** after the 1 s animation finishes (so the celebration visibly precedes the number change).

```javascript
// 1 yellow star — numerator goes from x → x+1
window.postMessage({ type: 'show_star', data: { count: 1 } }, '*');

// 3 yellow stars at end-of-game — numerator goes from x → x+3 (clamped at y)
window.postMessage({ type: 'show_star', data: { count: 3 } }, '*');
```

| Field | Type | Default | Notes |
|---|---|---|---|
| `data.count` | `1 \| 2 \| 3` | `1` | Tier of the awarded star image. **Also the increment applied to `#previewScore` numerator** after the animation ends. The numerator is clamped at the denominator `y` (set by `game_init.data.score`). |
| `data.variant` | `'yellow' \| 'blue'` | `'yellow'` | Palette family. |
| `data.silent` | `boolean` | `false` | Skip the success chime. |

**Target matters.** `show_star` uses `window.postMessage(...)` because the ActionBar listens in the same frame as the game. `game_complete` / `next_ended` / `WORKSHEET_BACK` use `window.parent.postMessage(...)` because they target the host. Mixing the two targets is the most common mistake:

| Message | Target | Consumer |
|---|---|---|
| `game_ready` | `window.parent` | host iframe harness — emit per canonical boot order, see [PART-008 § Boot ordering](../../../parts/PART-008.md#boot-ordering). |
| `game_complete` | `window.parent` | host iframe harness |
| `next_ended` | `window.parent` | host iframe harness |
| `WORKSHEET_BACK` | `window.parent` | host iframe harness |
| `game_init` | `window` (same frame) | PreviewScreen / ActionBar |
| `show_star` | `window` (same frame) | ActionBar |

ActionBar dedupes identical payloads within 500 ms and queues distinct ones (up to 3 deep), so over-firing is safe.

**Default trigger points (generator-emitted).** The generator fires `show_star` automatically at PART-050's end-of-game spot — before `floatingBtn.setMode('next')` in standalone, inside `transitionScreen.onDismiss` in multi-round. Set `spec.autoShowStar: false` to suppress the default and fire it manually at a custom beat (e.g. from a button's `action()` callback).

**Stars contract.** Stars in the ActionBar represent overall game performance, not running progress. Default firing pattern: ONE `show_star` at end-of-game with `count` = 0–3 derived from `getStars()`. Multi-beat awards (e.g., one star per cleared phase) are allowed but each fire still increments the same locked-denominator counter.

### previewResult field (PART-039)

The `data` object in `game_complete` SHOULD include `previewResult: gameState.previewResult || null`. Required when the preview was interactive (any `setPreviewData()` call during the preview phase). Shape:

```javascript
previewResult: {
  duration: number,           // ms the preview was visible
  skippedRepeat?: boolean,    // true if show() was called a second time and auto-skipped
  interactions?: object       // key/value bag populated via setPreviewData()
}
```

Populate in `startGameAfterPreview(previewData)` by `gameState.previewResult = previewData`, then include in the payload built by `postGameComplete`. See PART-039.
