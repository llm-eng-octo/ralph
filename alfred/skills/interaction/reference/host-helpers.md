# Host helpers — symbols used in interaction code examples

The interaction skill's code examples reference identifiers that are NOT defined here. Each one lives elsewhere in the game scaffolding, a CDN package, another skill, or a test harness. Use the canonical implementation from the owning source — never invent a replacement.

This file is the authoritative pointer table for interaction-skill examples. For audio / FeedbackManager / lifecycle helpers also referenced here, the **canonical source is** [`alfred/skills/feedback/reference/host-helpers.md`](../../feedback/reference/host-helpers.md) — the table below only adds interaction-specific entries.

## Helpers also documented by the feedback skill

These are referenced in interaction code examples but are not interaction-owned. See the feedback host-helpers table for the authoritative entry:

`renderRound` / `loadRound` / `nextRound` / `scheduleNextRound` / `endGame` / `restartGame` / `syncDOMState` / `gameState.isProcessing` / `waitForPackages` / `postGameComplete` / `FeedbackManager` / `progressBar` / `transitionScreen` / `floatingBtn` / `previewScreen` / `voiceInput` / `signalCollector` / `recordAttempt`.

## Telemetry

| Symbol | Purpose | Owning skill |
|---|---|---|
| `recordAttempt(roundIndex, userInput, correct, metadata)` | Per-attempt telemetry. MUST fire BEFORE any awaited audio. The canonical signature and attempt object construction live in [`alfred/skills/data-contract/schemas/attempt-schema.md`](../../data-contract/schemas/attempt-schema.md). | data-contract |
| `trackEvent(name, payload)` | Lightweight analytics event (`'answer_submitted'`, `'round_started'`, etc.). Fires alongside `recordAttempt`. | data-contract / game scaffolding |

## Sticker constants

| Symbol | What it is | Owning source |
|---|---|---|
| `CORRECT_STICKER` / `INCORRECT_STICKER` | String URL constants for the per-game correct/wrong sticker assets. Defined at the top of every game's `index.html` as `var CORRECT_STICKER = 'https://…'`. The string URL is the canonical sticker parameter shape (see feedback skill `feedbackmanager-api.md`). | Per-game template constants |

## Interaction-pattern game-local helpers

These appear in pattern code examples and are implemented per-game (the names are conventional — pick semantically equivalent names if your game uses different terminology, but keep the contract). They are NOT part of any CDN or shared scaffolding.

| Symbol | Pattern | Contract |
|---|---|---|
| `checkAnswer(value, expected)` | P7, P17 | Returns boolean. For subjective (textarea) answers it may delegate to an LLM call. |
| `getRounds()` | All | Returns the array of round descriptors for the current game session (`rounds[gameState.currentRound]` is the active round). |
| `getCellElement(row, col)` | P5, P8, P14, P15 | Returns the DOM element for a grid cell — `document.querySelector('[data-row="' + r + '"][data-col="' + c + '"]')` or equivalent. |
| `getCellSize()` | P13 | Returns the pixel size of one grid cell — used to convert pointer delta into a row/column delta. |
| `clampHorizontal(block, delta)` / `clampVertical(block, delta)` | P13 | Clamp a candidate move delta against grid bounds and adjacent-block collisions for the block's locked axis. |
| `captureState()` | P13 | Snapshot the current block positions for the undo stack. |
| `renderGrid()` | P13, P14, P15 | Re-paint the grid after a state mutation (placement, toggle, move). |
| `checkWinCondition()` | P5, P8, P13, P14, P15 | Evaluate whether the current board state satisfies the round's success criterion. Trigger `handlePuzzleComplete()` if true. |
| `hasValidAdjacentMoves(row, col)` | P5 | Returns true if any of the four neighbours of `(row, col)` are reachable and not already in the path. Used to flag dead-ends. |

## Test-harness helpers (Playwright)

| Symbol | What it is | Owning source |
|---|---|---|
| `solveRound()` | Test-harness helper that fast-forwards a round to its solved state by directly mutating `gameState` and calling `handlePuzzleComplete()`. **Bypasses the pointer/click flow** — useful for setting up an end-state to assert against, but NOT for verifying drag / tap input. P6 tests that exercise the full drag flow MUST use real CDP `Input.dispatchMouseEvent` / `Input.dispatchTouchEvent` (or Playwright's `mouse.down`/`move`/`up`), not `solveRound()`. | Per-game Playwright suite — defined at the top of the spec file or in a shared `tests/helpers.js`. |

## Rules

- **When using any symbol above**, follow the canonical contract from the owning source. Don't invent a parallel implementation (`safePlayFeedback`, `awaitedSubmit`, custom `recordAttempt` shape, etc.).
- **Do not write inline `recordAttempt({ /* fields */ })` placeholders or invent a parallel attempt shape.** Use the canonical data-contract signature: `recordAttempt(roundIndex, userInput, correct, metadata)`.
- **Game-local helpers (Interaction-pattern table)** are conventions, not contracts. If your game's naming differs, keep the contract — the validator rules don't depend on the exact symbol name, only on the behaviour.
