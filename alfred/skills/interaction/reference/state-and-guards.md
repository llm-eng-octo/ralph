# State Management & Guards

How each interaction pattern manages selection state, blocks input, handles undo/reset, and prevents corruption.

---

## Universal Guards

Every interaction handler MUST start with these three checks:

```javascript
function handleInteraction() {
  if (!gameState.isActive) return;      // Game not started or already ended
  if (gameState.isProcessing) return;   // Input blocked during feedback/animation
  if (gameState.gameEnded) return;      // endGame already called
  // ... proceed
}
```

**Missing any guard causes:**
- `isActive` missing → interactions before game starts or after game ends
- `isProcessing` missing → double-tap, double-submit, double recordAttempt, **answer mutates during awaited feedback audio**
- `gameEnded` missing → interactions after endGame triggers game_complete postMessage

---

## Interaction Lifecycle — Canonical Matrix

**This section is the single source of truth** for when interaction is disabled and re-enabled across every game shape and every event. All other skill files defer to this matrix. If you find a per-handler timing rule elsewhere in the docs that conflicts with this section, this section wins.

### Mechanism authority — which lock is load-bearing per modality

When a handler opens an awaited-feedback window, multiple disable mechanisms are set in concert. Only one is load-bearing per modality; the others document intent or guard fast-path edge cases.

| Modality | Sole functional lock | Defensive hygiene (NOT load-bearing alone) |
|---|---|---|
| **Tap / click / select** (P1, P2, P3, P8, P9, P10, P11, P12, P14, P15, P16) | `if (gameState.isProcessing) return;` as the handler's first line — handlers are direct DOM listeners, the JS guard is the actual block | — |
| **Continuous drag (path)** (P5) | `isProcessing` guard on `pointerdown` — same model as tap; the `pointermove`/`pointerup` re-checks abort an in-flight drag | — |
| **Drag-and-drop (P6, `@dnd-kit/dom`)** | **`.dnd-disabled` CSS class** on the board wrapper, applying `pointer-events: none` to draggables. The browser stops delivering pointer events to the cells, so `@dnd-kit/dom`'s PointerSensor cannot activate. This is the only mechanism that prevents new drags. | `dragstart` monitor listener with `isProcessing` check + `event.preventDefault()`. The monitor `dragstart` event is a synthetic post-activation notification — `preventDefault()` on it is a no-op. The listener documents intent and catches the narrow case where a drag was already in flight when `isProcessing` flipped, but it does **not** prevent new drags. Skipping the CSS class while keeping the JS guard ships the failure mode where drags succeed during feedback audio. |
| **Directional drag (constrained)** (P13) | `isProcessing` guard on `pointerdown` — direct listener, same model as tap | — |
| **Text / number input** (P7) | `isProcessing` guard on `keydown` (Enter) + `click` (Submit) | Optional `input.disabled = true` for visual affordance |
| **Voice input** (P17) | **`voiceInput.disable()`** — the CDN's documented disable method. The `isProcessing` guard alone doesn't block the microphone toggle. | `isProcessing` guard + optional `.is-processing` class on `#gameContent` (workaround for CDN VoiceInput bug where `.disable()` only blocks the textarea, not the mic toggle) |
| **FloatingButton (Submit / Retry)** ([PART-050](../../../parts/PART-050.md)) | `floatingBtn.setSubmittable(false)` while processing; submit auto-hides on tap. | `isProcessing` guard inside the registered handler |
| **TimerComponent expiry** ([PART-006](../../../parts/PART-006.md)) | `timer.pause()` at every site that flips `isProcessing = true` — stops the clock from ticking through awaited feedback. `timer.resume()` at the matching re-enable site. | — |

**Why P6 is special.** Every other modality uses direct DOM listeners — the JS guard runs first and is the actual block. `@dnd-kit/dom` reverses this: the library's PointerSensor consumes the `pointerdown` event before any game code runs, and the `dragstart` monitor event is fired AFTER the operation has already started. The only way to prevent activation is to block at the browser layer, which is what `pointer-events: none` does. Treat the JS `dragstart` guard as defensive hygiene; treat the CSS class as the lock.

### Lifecycle matrix — (game shape × event)

Cells specify, in this order: **(1)** pre-await actions (BEFORE any `await`); **(2)** awaited audio shape; **(3)** post-audio handler actions; **(4)** where the re-enable actually fires; **(5)** load-bearing mechanism.

Game shapes:
- **STD** = Standalone (`totalRounds: 1`, `totalLives > 1`).
- **MR-P** = Multi-round, predicate-driven retry (default for `totalRounds > 1`). No explicit retry button; the next interaction re-shows Submit via the predicate.
- **MR-B** = Multi-round, explicit retry-button (opt-in via spec flag `roundRetryButton: true`). Wrong-with-lives shows an explicit Retry button via `setMode('retry')`.
- **GC** = Global-Countdown (single global timer; game ends when the timer expires regardless of round progress).

| Event | STD | MR-P | MR-B | GC |
|---|---|---|---|---|
| **round-load** | (1) — (2) — (3) handler body initializes round (4) `isProcessing = false`, `.dnd-disabled` remove, `voiceInput.enable()` here (5) `renderRound()` / `loadRound()` is load-bearing | same as STD | same as STD | same as STD; `timer.start()` on first round only |
| **submit-correct** | (1) `isProcessing = true`, `.dnd-disabled` add (P6), `voiceInput.disable()` (P17), `timer.pause()` (PART-006 present) (2) SFX awaited (1.5s floor) + TTS awaited (CASE 4) (3) Score++; `endGame(success)` (4) Not re-enabled — terminal (5) `endGame()` teardown destroys listeners | (1) same as STD (2) SFX awaited + TTS **fire-and-forget** (CASE 4 single-step) (3) Score++; advance to next round (4) `renderRound()` of next round — handler does NOT flip `isProcessing` (5) `renderRound()` | same as MR-P | same as MR-P; `timer.pause()` skipped if game continues without round transition |
| **submit-wrong-lives-remain** | (1) `isProcessing = true`, `.dnd-disabled` add, `voiceInput.disable()`, `timer.pause()` (2) SFX awaited + TTS awaited (CASE 7) (3) Lives--; `setMode('retry')` (4) Re-enabled in the `on('retry')` handler — see § Exception patterns (5) Retry handler is load-bearing | (1) same as STD (2) SFX awaited + TTS fire-and-forget (3) Lives--; `setMode(null)` (4) `renderRound()` of same round — handler does NOT flip `isProcessing` (5) `renderRound()` | (1) same as STD (2) SFX awaited + TTS fire-and-forget (3) Lives--; `setMode('retry')` (4) Re-enabled in the `on('retry')` handler OR in the next-iteration `renderRoundAndWaitForSubmit(i)` — pick one per the template in flow-implementation.md (5) Retry handler / `renderRound()` | same as MR-P |
| **submit-wrong-last-life** | (1) same as STD submit-wrong (2) SFX awaited + TTS awaited (3) Lives = 0; `endGame(failure)` (4) Not re-enabled — terminal (5) `endGame()` teardown | (1) same (2) same (3) Lives = 0; `endGame(failure)` (4) Not re-enabled (5) `endGame()` | same as MR-P | same as MR-P |
| **retry-tap** | (1) — (2) — (3) Clear input/feedback UI per `retryPreservesInput` flag; `isProcessing = false`; `.dnd-disabled` remove; `voiceInput.enable()`; `timer.resume()`; `setMode(null)`; **NEVER** call `setSubmittable(...)` (validator `GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE`); **NEVER** reset `gameState.lives` (validator `GEN-FLOATING-BUTTON-RETRY-LIVES-RESET`) (4) Re-enabled in this handler body (5) Retry handler body | n/a (predicate-driven, no retry tap) | (1) — (2) — (3) Trigger same-round re-render (call `renderRound(currentRound)` or equivalent); the re-render flips `isProcessing = false` and removes `.dnd-disabled` (4) `renderRound()` is load-bearing — the retry handler delegates (5) `renderRound()` | n/a |
| **per-round-timer-expiry** | (1) `onEnd` callback: `isProcessing = true`, `.dnd-disabled` add (P6), `voiceInput.disable()` (P17). (No `timer.pause()` — the timer already fired.) (2) "Time's up" SFX awaited (1.5s floor) + TTS awaited (mirrors wrong-answer CASE 7) (3) Lives-- (if lives shape) or score-bookkeeping (if no-lives shape); decide continue vs game-over (4) If continue → re-enabled in `on('retry')` handler (if retry offered) or in `endGame()` teardown otherwise (5) Retry handler or `endGame()` | (1) same as STD (2) same (3) Lives-- (if lives shape); advance to next round if continuing (4) `renderRound()` of next round if game continues; `endGame()` teardown if terminal (5) `renderRound()` / `endGame()` | (1) same as MR-P (2) same (3) Lives--; show retry button if continuing (4) Retry handler / `renderRound()` (5) Retry handler / `renderRound()` | n/a (Global-Countdown uses a single session timer, not per-round) |
| **global-timer-expiry** | n/a | n/a | n/a | (1) `onEnd` callback: `isProcessing = true`, `.dnd-disabled` add, `voiceInput.disable()` (2) "Time's up" SFX awaited + TTS awaited (3) `endGame('time_up')` (4) **Not re-enabled** — `.dnd-disabled` stays through end-game UI to prevent post-expiry input; `endGame()` teardown removes listeners (5) `endGame()` |
| **api-failure** (LLM eval / network) | (1) Already in submit handler with `isProcessing = true` (2) Fetch / SFX may have partially run (3) `catch` branch: `isProcessing = false`, `.dnd-disabled` remove, `voiceInput.enable()`, `timer.resume()`, surface error UI (4) Re-enabled in the catch branch (5) Handler catch block — this is one of two documented "re-enable in handler" exceptions | same as STD | same as STD | same as STD; if expiry happens during error recovery, the `onEnd` path wins |
| **terminal-game-over** | (1) `endGame(failure)` invoked — flow already inside the handler (2) Optional game-over SFX/TTS awaited (3) `endGame()` teardown: destroy DnD instances, hide FloatingButton, show Game Over TS (4) Before teardown: remove `.dnd-disabled` from `#gameContent` so the Game Over TS's Try Again button is reachable (CSS class on the wrapper would otherwise block it transitively if scoped too broadly) (5) `endGame()` is load-bearing | same as STD | same as STD | same as STD |

**How to read a cell.** "Re-enabled in `renderRound()`" means the handler MUST NOT flip the flags itself — leave them, let the next `renderRound()` clear them. "Re-enabled in the handler" means the opposite — flip them in source order, in the handler body, after the last awaited audio resolves. The two "exceptions" (retry-tap, api-failure) re-enable in the handler because there is no `renderRound()` call between submit and the next playable state.

### Fire-and-forget vs awaited — what triggers `isProcessing`

Multi-step mid-round SFX (correct match on pair game, per-drop SFX on DnD, per-move SFX on directional drag, per-cell tap on continuous drag) is **fire-and-forget**, so `isProcessing` is NOT set. The student continues interacting through these micro-feedback moments.

`isProcessing = true` is reserved for **awaited-feedback windows**:
- Submit-correct / Submit-wrong evaluation (single-step patterns 1, 7).
- Round-complete celebration (every shape).
- Puzzle-complete celebration (P5, P8).
- Timer expiry (per-round or global).
- API-failure (a defensive instance — the catch path needs to re-enable cleanly).
- End-game transitions (Victory / Game Over TS).

If a handler does not `await` a feedback-shaped Promise, it does not flip `isProcessing`.

### Exception patterns — handler templates

These are the documented sites where the handler itself re-enables (instead of deferring to `renderRound()`). Each is a single code block, source-ordered.

**Standalone Try Again — `on('retry')` handler.** Standalone has no `renderRound()` between submit and retry; the handler is the source of truth.

```javascript
floatingBtn.on('retry', function () {
  // Clear input / feedback UI per spec.retryPreservesInput (default: clear)
  if (!RETRY_PRESERVES_INPUT) clearInputState();
  clearFeedbackUI();

  // Re-enable in source order. NEVER reset gameState.lives.
  // NEVER call setSubmittable(...) — the submit predicate re-shows it on next interaction.
  gameState.isProcessing = false;
  if (boardEl) boardEl.classList.remove('dnd-disabled');   // P6
  if (voiceInput) voiceInput.enable();                      // P17
  if (timer) timer.resume();                                // PART-006
  floatingBtn.setMode(null);
});
```

**Multi-round explicit retry-button — `on('retry')` handler.** The retry handler may delegate to `renderRound(currentRound)`; either is canonical. Pick one and template it consistently for the game.

```javascript
// Delegating variant (recommended — renderRound is the existing source of truth):
floatingBtn.on('retry', function () {
  clearFeedbackUI();
  floatingBtn.setMode(null);
  renderRound(gameState.currentRound);  // re-renders SAME round; flips isProcessing, removes .dnd-disabled inside
});

// In-handler variant (when same-round re-render is too heavy):
floatingBtn.on('retry', function () {
  clearInputState();
  clearFeedbackUI();
  gameState.isProcessing = false;
  if (boardEl) boardEl.classList.remove('dnd-disabled');
  if (voiceInput) voiceInput.enable();
  if (timer) timer.resume();
  floatingBtn.setMode(null);
});
```

**API-failure recovery.** Inside the submit handler's catch branch, after surfacing user-facing error UI.

```javascript
try {
  await llmEvaluate(answer);   // or any awaited feedback
} catch (e) {
  // Surface error UI (toast, inline message, etc.)
  showApiErrorBanner(e);

  // Re-enable in source order — the player must be able to retry their submit
  gameState.isProcessing = false;
  if (boardEl) boardEl.classList.remove('dnd-disabled');
  if (voiceInput) voiceInput.enable();
  if (timer) timer.resume();
  return;   // do NOT advance round; do NOT decrement lives for an infra failure
}
```

**Terminal game-over.** Before `endGame()` runs its teardown (DnD destroy, FloatingButton hide, TS show), remove the board-level `.dnd-disabled` so end-game UI (Try Again on Game Over TS) remains tappable.

```javascript
function endGame(reason) {
  if (gameState.gameEnded) return;
  gameState.gameEnded = true;

  // Remove the board-level interaction lock BEFORE teardown so end-game UI is reachable.
  // (Per-cell .cell.locked or similar STAYS — those are puzzle state, not interaction state.)
  if (boardEl) boardEl.classList.remove('dnd-disabled');

  destroyDndForRound();
  if (timer) timer.pause();        // stop the clock per PART-006 § Mandatory rules
  if (voiceInput) voiceInput.disable();   // mic stays disabled through end-game

  postGameComplete(reason === 'success');
  if (reason === 'success') showVictory();
  else showGameOver();
}
```

**TimerComponent `onEnd` (per-round expiry).** The clock-driven equivalent of a submit handler. Same disable contract as submit.

```javascript
function onTimerEnd() {
  if (gameState.isProcessing || gameState.gameEnded) return;

  // First three lines: same as submit handler
  gameState.isProcessing = true;
  if (boardEl) boardEl.classList.add('dnd-disabled');     // P6
  if (voiceInput) voiceInput.disable();                    // P17
  // (timer already fired — no pause() needed)

  await playTimeUpFeedback();   // SFX 1.5s floor + TTS per feedback CASE 7

  gameState.lives--;
  if (gameState.lives <= 0) {
    endGame('time_up');
    return;
  }
  // Continue to next round (MR-P / MR-B) — renderRound clears isProcessing + .dnd-disabled
  gameState.currentRound++;
  renderRound(gameState.currentRound);
}
```

### Per-pattern when-to-block summary

For quick reference. Detailed timing per cell lives in the matrix above; this table is a fast lookup of "is this a single-step (awaited) or multi-step (fire-and-forget) pattern?"

| Pattern | `isProcessing` behavior | Re-enable source-of-truth |
|---|---|---|
| **Tap-Select Single** (P1) | Set true before evaluation + SFX. Single-step / awaited. | `renderRound()` next round, or retry/api-failure exception |
| **Sequential Chain** (P2) | Set true during chain-complete celebration + during wrong flash. Multi-step otherwise. | After celebration audio; after wrong flash clears |
| **Two-Phase Match** (P3) | Set true during right-click evaluation only. Brief. | After evaluation resolves |
| **Continuous Drag** (P5) | Set true during puzzle-complete + during reset. | After complete audio; after reset animation |
| **Drag-and-Drop** (P6) | Set true during drop evaluation (multi-step) and submit evaluation (single-step submit-variants). | `renderRound()` next round, or retry/api-failure exception |
| **Text/Number Input** (P7) | Set true before evaluation + SFX. Single-step / awaited. | `renderRound()` next round, or retry/api-failure exception |
| **Click-to-Toggle** (P8) | Set true during puzzle-solved celebration. | After audio resolves |
| **Directional Drag** (P13) | Set true during puzzle-complete + during reset. Same as P5. | After complete audio; after reset animation |
| **Voice Input** (P17) | Set true before evaluation; `voiceInput.disable()` in same pre-await block. | `renderRound()` next round + `voiceInput.enable()` there (or retry exception) |

---

## Selection State Machines

Each pattern that has a selection phase (not just immediate evaluation) follows a state machine.

### Pattern 2: Sequential Chain

```
State: IDLE
  Fields: currentChainIndex = -1, selectedTiles = []

  → Tap valid chain start

State: BUILDING
  Fields: currentChainIndex = N, selectedTiles = [t1, t2, ...]

  → Tap correct next tile → stay BUILDING (selectedTiles grows)
  → Tap wrong tile → IDLE (selectedTiles cleared, chain reset, life lost)
  → Chain complete (all tiles tapped) → CHAIN_DONE

State: CHAIN_DONE
  Fields: completedTiles += chain tiles, chainsFound++

  → More chains to find → IDLE
  → All chains found → ROUND_COMPLETE
```

**State fields:**
```javascript
gameState.currentChainIndex = -1;   // Which chain is being built (-1 = none)
gameState.selectedTiles = [];       // Tile indices in current chain
gameState.completedTiles = new Set(); // All tiles in completed chains
gameState.completedChainIndices = new Set();
gameState.chainsFound = 0;
```

### Pattern 3: Two-Phase Match

```
State: NO_SELECTION
  Fields: selectedLeftIndex = null
  Group B: .disabled

  → Tap group A item

State: FIRST_SELECTED
  Fields: selectedLeftIndex = N
  Group A item: .selected
  Group B: enabled (no .disabled)

  → Tap different group A item → stay FIRST_SELECTED (re-select)
  → Tap group B item → EVALUATING

State: EVALUATING
  Fields: isProcessing = true

  → Correct → both .matched → NO_SELECTION
  → Wrong → B flashes .wrong → NO_SELECTION (life lost)
```

**State fields:**
```javascript
gameState.selectedLeftIndex = null;       // Currently selected left item (null = none)
gameState.matchedPairs = new Set();       // Left indices already matched
```

**Memory Match variant:**
```javascript
gameState.flippedCards = [];              // Currently flipped (max 2)
gameState.matchedCards = new Set();       // Card indices already matched
```

### Pattern 4: ~~Tap + Swipe~~ — DEPRECATED

**DEPRECATED.** Use P1 (Tap-Select) with directional buttons instead. Convert swipe gestures to progressive tapping.

### Pattern 5: Continuous Drag

```
State: NO_PATH
  Fields: path = [], isDragging = false

  → Press on start cell

State: DRAGGING
  Fields: path = [{row,col}...], isDragging = true

  → Move to adjacent unvisited cell → path grows
  → Move to path[length-2] → path shrinks (backtrack)
  → Move to non-adjacent / already-visited → ignored
  → Lift finger → PAUSED (can resume)
  → Path reaches end cell AND covers all cells → COMPLETE

State: PAUSED
  Fields: path preserved, isDragging = false

  → Press on path head → DRAGGING (resume)
  → Press elsewhere → ignored
  → Reset button → NO_PATH (life lost)

State: COMPLETE
  Fields: isProcessing = true, all cells .complete
```

**State fields:**
```javascript
gameState.path = [];                    // Array of {row, col}
gameState.isDragging = false;           // True while finger is down
gameState.startCell = {row: 0, col: 0};
gameState.endCell = {row: N, col: M};
gameState.totalCells = N * M;
```

---

## Undo / Reset Patterns

### No Undo (Patterns 1, 7)

Tap-Select (Single) and Text Input have no undo. The action is final.

### Forced Reset on Error (Pattern 2)

Chain games don't have user-initiated undo. When a wrong tile is tapped, the entire chain is force-reset:

```javascript
// On wrong tap:
gameState.selectedTiles.forEach(function(idx) {
  clearHighlight(idx);
});
gameState.selectedTiles = [];
gameState.currentChainIndex = -1;
// Life lost
```

### Re-Select Before Commit (Pattern 3)

Two-Phase Match allows changing the first selection before the second tap:

```javascript
// In handleLeftClick:
// Remove .selected from previous
document.querySelectorAll('.left-cell.selected').forEach(function(el) {
  el.classList.remove('selected');
});
// Apply .selected to new
cell.classList.add('selected');
gameState.selectedLeftIndex = newIndex;
```

### ~~Undo Stack (Pattern 4)~~ — DEPRECATED

P4 (Tap + Swipe) is deprecated. Use P1 tap-only instead.

### Backtrack During Drag (Pattern 5)

Continuous drag allows free backtracking by dragging to the previous cell:

```javascript
// In handleDragMove:
if (gameState.path.length >= 2) {
  var prev = gameState.path[gameState.path.length - 2];
  if (row === prev.row && col === prev.col) {
    // Backtrack — remove head from path
    removeFromPath();
    return;
  }
}
```

Reset button clears the entire path (costs life):

```javascript
function handleReset() {
  gameState.lives--;
  // Clear path, reset state
  gameState.path = [];
  gameState.isDragging = false;
}
```

### Snap-Back on Invalid Drop (Pattern 6)

Drag-and-drop items return to their origin if dropped outside a valid zone:

```javascript
function snapBack(item) {
  item.style.transition = 'transform 300ms ease';
  item.style.transform = 'translate(0, 0)';
  setTimeout(function() {
    item.style.transition = '';
    item.style.transform = '';
  }, 300);
}
```

### Toggle (Pattern 8)

Click-to-Toggle has built-in undo — click the same cell again:

```javascript
if (gameState.grid[row][col] === null) {
  gameState.grid[row][col] = value;  // Fill
} else {
  gameState.grid[row][col] = null;   // Unfill (undo)
}
```

Optional reset button restores the board to its initial state (free, no life cost).

---

## Pattern-Specific Guards

Beyond the universal three, each pattern has additional guards:

| Pattern | Additional guards |
|---------|------------------|
| Sequential Chain | `completedTiles.has(tileIndex)`, `phase !== 'playing'` |
| Two-Phase Match | `selectedLeftIndex === null` (for right click), `matchedPairs.has(index)`, `.disabled` class |
| ~~Tap + Swipe~~ | **DEPRECATED** |
| Continuous Drag | `isDragging` (for pointermove), `isInPath(row, col)` (prevent revisit) |
| Drag-and-Drop | `dragItem` exists (for pointermove/up), item already `.placed` |
| Text Input | `value.trim() === ''` (empty input) |
| Click-to-Toggle | `solved`, `lockedCells[r][c]` (pre-filled clue cells) |

---

## State Reset on Round Advance

When advancing to the next round, ALL pattern-specific state must be reset:

```javascript
function loadRound() {
  // Universal reset
  gameState.isProcessing = false;
  gameState.isActive = true;
  gameState.roundStartTime = Date.now();

  // Pattern-specific reset (examples)
  gameState.currentChainIndex = -1;       // Chain
  gameState.selectedTiles = [];            // Chain
  gameState.completedTiles = new Set();    // Chain
  gameState.selectedLeftIndex = null;      // Match
  gameState.matchedPairs = new Set();      // Match
  gameState.selectedPiece = null;          // Swipe
  gameState.moveHistory = [];              // Swipe
  gameState.moveCount = 0;                 // Swipe
  gameState.solved = false;               // Puzzle
  gameState.path = [];                    // Drag path
  gameState.isDragging = false;           // Drag path
  gameState.flippedCards = [];            // Memory
  gameState.placedItems = 0;              // DnD
  gameState.dragItem = null;              // DnD

  syncDOM();
  renderRound();
}
```

**Missing any of these resets causes stale state from the previous round to corrupt the new round.** This is the most common bug in multi-step games.

---

## State Reset on Restart

`restartGame` must reset ALL mutable state — both universal and pattern-specific:

```javascript
function resetGame() {
  // Universal state
  gameState.phase = 'start_screen';
  gameState.currentRound = 0;
  gameState.score = 0;
  gameState.attempts = [];
  gameState.events = [];
  gameState.isActive = false;
  gameState.isProcessing = false;
  gameState.gameEnded = false;
  gameState.startTime = null;
  gameState.duration_data = { startTime: null, pausedTime: 0, lastPauseStart: null };
  if (gameState.totalLives > 0) gameState.lives = gameState.totalLives;

  // Pattern-specific state (reset ALL of these)
  gameState.currentChainIndex = -1;
  gameState.selectedTiles = [];
  gameState.completedTiles = new Set();
  gameState.completedChainIndices = new Set();
  gameState.chainsFound = 0;
  gameState.selectedLeftIndex = null;
  gameState.matchedPairs = new Set();
  gameState.flippedCards = [];
  gameState.matchedCards = new Set();
  gameState.selectedPiece = null;
  gameState.moveHistory = [];
  gameState.moveCount = 0;
  gameState.solved = false;
  gameState.path = [];
  gameState.isDragging = false;
  gameState.placedItems = 0;
  gameState.dragItem = null;

  syncDOM();
  render();
}
window.restartGame = resetGame;
```
