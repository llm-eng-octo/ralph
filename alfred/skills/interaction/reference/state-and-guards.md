# State Management & Guards

How each interaction pattern manages selection state, blocks input, handles undo/reset, and prevents corruption.

---

## The guard contract (single source of truth)

This is the only canonical description of input gating in the interaction skill. Other files (SKILL.md cross-cutting rules, per-pattern files, tap-interaction.md) reference this section — they do not restate it.

### The three universal guards

Every interaction handler MUST start with these three checks, in this order:

```javascript
function handleInteraction() {
  if (!gameState.isActive) return;      // Game not started or already ended
  if (gameState.isProcessing) return;   // Input blocked during feedback/animation
  if (gameState.gameEnded) return;      // endGame already called
  // ... proceed
}
```

**Missing any guard causes:**
- `isActive` missing → interactions before game starts or after game ends.
- `isProcessing` missing → double-tap, double-submit, double `recordAttempt`, **answer mutates during awaited feedback audio**.
- `gameEnded` missing → interactions after `endGame` triggers `game_complete` postMessage.

The three guards apply to **every input modality** — tap, raw-pointer drag (P5, P13), `@dnd-kit/dom` drag (P6), text input (P7), voice input (P17). The single `isProcessing` flag blocks every channel uniformly.

### Per-modality entry points

The guards run from the handler's first line, but each modality has its own entry point:

| Modality | Pattern(s) | Where the guards run |
|---|---|---|
| Tap / click / select | P1, P2, P3, P8, P9, P10, P11, P12, P14, P15, P16 | The handler's first line on the option/cell/button `click` |
| Continuous drag (path) | P5 | First line on `pointerdown`; re-check inside `pointermove` / `pointerup` so an in-flight drag aborts cleanly |
| Drag-and-drop (pick & place) | P6 | `@dnd-kit/dom` `manager.monitor` `dragstart` handler — call `event.preventDefault()` when any guard fails. Pair with `.dnd-disabled` class on the board (sets `pointer-events: none` on draggables) for visual affordance. |
| Directional drag (constrained) | P13 | First line on `pointerdown`; re-check inside `pointermove` / `pointerup` |
| Text / number input | P7 | First line on `keydown` (Enter) + `click` (Submit); input element retains focus but submit is rejected |
| Voice input | P17 | First line on the Submit click. Around the awaited window: `voiceInput.disable()` + explicit `textarea.disabled = true; textarea.readOnly = true; textarea.blur()` (defensive bundle — `disable()` alone does NOT reliably block typing). Matching re-enable in `renderRound()`, NOT in the submit handler. |

### When to set `isProcessing` true / false

| Context | Set true | Set false | Notes |
|---|---|---|---|
| **Single-step submit handler** (P1, P7, P17, P9 submit, P10 submit) | BEFORE any await (LLM eval / awaited SFX / awaited dynamic TTS) | In `renderRound()` / `loadRound()` for the next round — NEVER in the submit handler | Both SFX and dynamic TTS are awaited (feedback-skill canonical rule + validator `GEN-FEEDBACK-TTS-AWAIT`). The full awaited-feedback window is blocked. Exceptions: API-failure path (can't advance) and terminal game-over re-enable in-handler. |
| **Multi-step round-complete / puzzle-complete** (P2, P3, P5, P6, P8, P10, P11, P12, P13, P14, P15, P16) | BEFORE the awaited SFX / TTS in the completion handler | In the next `renderRound()` / `loadRound()` | Same rule as single-step submit — round-complete is a terminal moment, not mid-round. |
| **Multi-step mid-round** (per-tap, per-drop, per-move, per-match SFX) | Do NOT set | n/a | Mid-round SFX is fire-and-forget; the student must continue interacting through it. Setting `isProcessing` here is anti-pattern #11 in `SKILL.md`. |
| **Transition sequence** (round-intro, level-intro, end-game with CTA) | Inside the transition handler, before its awaited audio | After the last awaited audio resolves — the `transitionScreen` owns its own lifecycle | Different from submit handlers because `transitionScreen` owns the re-enable surface, not `renderRound()`. |
| **Brief animation / evaluation block** (P3 wrong flash, P6 invalid-drop return) | When the animation starts | When the animation clears (~100 ms correct, 600 ms wrong) | Short-lived; not coupled to audio. |

**Why the in-handler clear is forbidden for submit:** if `isProcessing` re-enables before `renderRound()` paints the next round, the student can submit again on the *current* round's still-rendered buttons during the brief window before the next round paints. The next round's render is the only moment where re-enabling is safe.

**Why the answer mustn't mutate during awaited audio:** `recordAttempt` captured one answer, but if the student can still interact, `gameState` may end up reflecting another. Scoring drifts from telemetry, double-submits fire, and feedback audio contradicts the current screen.

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

### Invalid Drop Return (Pattern 6)

P6 uses `@dnd-kit/dom`; do not implement a manual pointer fallback. On invalid drop, return the tag DOM element to its game-controlled origin slot (`locations[tagId]`) and let the library/end-of-drag cleanup clear transient drag styles. See `p06-drag-and-drop.md` R2/R4 and validator `GEN-DND-KIT`.

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
| Drag-and-Drop | `@dnd-kit/dom` `manager.monitor` `dragstart` runs the universal guards and calls `event.preventDefault()` to cancel the drag; subsequent guards: location-tracking entry exists, droppable not already occupied (per spec), tag not already `.matched`. `pointercancel` is handled inside `@dnd-kit/dom` — do not bolt on a manual handler. |
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

  // Pattern-specific reset (examples — keep only the lines a pattern in this game uses)
  gameState.currentChainIndex = -1;       // P2 Chain
  gameState.selectedTiles = [];            // P2 Chain
  gameState.completedTiles = new Set();    // P2 Chain
  gameState.selectedLeftIndex = null;      // P3 Match
  gameState.matchedPairs = new Set();      // P3 Match
  gameState.moveHistory = [];              // P13 directional drag (undo stack)
  gameState.moveCount = 0;                 // P13 directional drag
  gameState.solved = false;               // Puzzle
  gameState.path = [];                    // P5 drag path
  gameState.isDragging = false;           // P5 drag path
  gameState.flippedCards = [];            // P3 memory variant
  gameState.placedItems = 0;              // P6 DnD
  gameState.locations = {};               // P6 DnD — game-controlled tag-id → 'bank'|'zone-N' map (replaces the old dragItem field)
  // P6 DnD lifecycle: destroy previous manager + draggables + droppables here, then create new ones for this round.

  syncDOM();
  renderRound();
}
```

**Missing any of these resets causes stale state from the previous round to corrupt the new round.** This is the most common bug in multi-step games.

---

## State Reset on Restart — pattern-specific fields

`restartGame()` must reset all mutable state. The **universal half** (`phase`, `currentRound`, `score`, `attempts`, `events`, `isActive`, `isProcessing`, `gameEnded`, `startTime`, `duration_data`, `lives`) is owned by the game-building lifecycle / PART-005 — see `skills/game-building/reference/code-patterns.md` and `alfred/parts/PART-005.md` for the canonical universal-reset block. **Do not duplicate it here.**

The interaction skill only owns the **pattern-specific** half — reset only the fields the patterns in your game actually use:

```javascript
function resetGame() {
  // ... universal reset block (PART-005 / game-building) ...

  // Pattern-specific state — keep only the lines relevant to your game's patterns
  gameState.currentChainIndex = -1;            // P2
  gameState.selectedTiles = [];                 // P2
  gameState.completedTiles = new Set();         // P2
  gameState.completedChainIndices = new Set();  // P2
  gameState.chainsFound = 0;                    // P2
  gameState.selectedLeftIndex = null;           // P3
  gameState.matchedPairs = new Set();           // P3
  gameState.flippedCards = [];                  // P3 memory variant
  gameState.matchedCards = new Set();           // P3 memory variant
  gameState.path = [];                          // P5
  gameState.isDragging = false;                 // P5
  gameState.placedItems = 0;                    // P6
  gameState.locations = {};                     // P6 — tag-id → 'bank'|'zone-N'
  // P6 also: destroy + recreate @dnd-kit/dom manager + draggables + droppables on restart.
  gameState.moveHistory = [];                   // P13
  gameState.moveCount = 0;                      // P13
  gameState.solved = false;                     // puzzle patterns (P5, P8, P13, P14, P15)
}
```

Wire-up (`window.restartGame = resetGame`, `syncDOM()`, `render()` ordering) is universal — see the game-building lifecycle.

---

## `gameState.phase` — canonical value list

`phase` is a shared field with multiple owners. The values below are the only ones any handler in this skill checks against:

| Value | Set by | What it gates |
|---|---|---|
| `'start_screen'` | game-building lifecycle (initial state, restart) | All gameplay handlers return early |
| `'observing'` | observe-modifier `startObservePhase()` | Every interaction handler returns early (P1, P3, P7, P8, P16 inside an observe wrapper) |
| `'responding'` | observe-modifier when observe completes | Normal handlers run |
| `'gameplay'` | game-building when the first round renders | Normal handlers run |
| `'results'` / `'gameover'` | feedback skill `endGame(reason)` | All gameplay handlers return early; `transitionScreen` owns the surface |

If a game introduces a new phase, document it in its spec and add an explicit guard. Do NOT reuse `gameState.phase` as a generic state machine for pattern-internal sub-modes — use a pattern-specific field (`gameState.currentStep`, `gameState.selectedLeftIndex`, etc.) instead, so phase remains a stable, cross-skill enum.

---

## In-flight drag colliding with `loadRound()` / `endGame()`

When awaited feedback triggers a round/end transition while a P5 or P13 drag is in flight, the document-level `pointermove` / `pointerup` listeners survive the DOM re-render (they're on `document`, not on the grid). The `pointerdown` listener may be lost when `innerHTML` is replaced. The transition handler MUST:

1. Clear the in-flight drag state BEFORE mutating round state:
   - P5: `gameState.isDragging = false; gameState.path = [];`
   - P13: `gameState.dragBlock = null; gameState.dragDelta = 0;` and clear `transform` on any block element with `.dragging`.
2. After `loadRound()` re-renders the grid, call `attachGridListeners()` (or equivalent) — but the listener guard (`gridListenersAttached`) ensures document-level listeners are NOT re-stacked.
3. The next `pointerdown` on the new grid is the only entry point back into the drag flow — and it is now gated by `gameState.isProcessing` (cleared in `loadRound()` after this in-flight cleanup).

For P6, `@dnd-kit/dom` is destroyed + recreated per round (rule `GEN-DND-DESTROY-PER-ROUND`); the library handles its own in-flight cleanup as part of `manager.destroy()`.

---

## P17 voice recording during pause / `visibilitychange`

The feedback skill `SKILL.md` § Pause/Resume + `VisibilityTracker` cover audio pause for static SFX and dynamic TTS. The microphone recording owned by the VoiceInput CDN package is a separate stream and needs its own rule:

- On tab hide (`document.hidden === true` or `VisibilityTracker` pause event): call `voiceInput.disable()` if `voiceInput.isRecording === true`. The CDN package aborts the in-flight recording, fires the standard `mic-off` SFX, and closes the drawer.
- On tab return: do NOT auto-resume recording. The student must tap the mic again. Auto-resume would surprise the student with an already-running mic.
- If the round's evaluation was already in flight when the tab was hidden, `gameState.isProcessing === true` and the universal guard blocks any user-initiated re-record until `renderRound()` clears it.

The same applies to `transitionScreen.show()` callbacks and any other moment that takes focus away from gameplay — disable the mic, never auto-resume.

---

## Multi-Step MCQ + Observe modifier — combined behaviour

When both modifiers apply to one game (an Observe phase that gates the start of a Multi-Step MCQ round, e.g. a memorize-then-answer-three-questions design):

1. `gameState.phase = 'observing'` for the observe window — every handler (including the per-sub-step handler) returns early.
2. After observe completes, set `gameState.phase = 'responding'` AND initialize `gameState.currentStep = 0` in the same handler.
3. Sub-step taps advance `currentStep` per the Multi-Step MCQ modifier; phase stays `'responding'` throughout.
4. Round completion (all sub-steps done) is the moment to fire round-complete audio + bump progress (per the Multi-Step MCQ modifier's "round RESOLVES" branch).
5. If the game requires a re-observe between sub-steps (rare — currently no game does this), set `phase = 'observing'` for the re-observe window. The Multi-Step handler must re-check `phase` after every step transition.

Modifier docs treat phase and `currentStep` independently because they DO compose cleanly — but only if the universal guard for `phase === 'observing'` is on the same handler that runs `currentStep` updates.

---

## Fallback / failure-recovery cases

When something out of the interaction layer's control fails, what does the student see? The interaction skill enforces graceful degradation, not error recovery — recovery lives in the feedback / data-contract / mobile skills. The table below lists the interaction-layer behaviour for each known failure:

| Failure | Interaction-layer behaviour |
|---|---|
| `voiceInput.value` is `undefined` (CDN package failed to load) | `handleSubmit` early-returns on empty/missing value (existing guard `if (!value) return;`). No telemetry mutation, no audio, no advance — the student can re-tap submit when the package recovers. Surface a load-failure banner via game scaffolding, not here. |
| `FeedbackManager.sound.play()` rejects synchronously during a mid-drag tap SFX | `.catch(function(){})` suppresses it (fire-and-forget). The drag continues uninterrupted. No `isProcessing` flip. |
| `manager.monitor.addEventListener` throws because `@dnd-kit/dom` partially loaded | The game's `waitForPackages()` should not have completed — round render is gated on a successful library load. If the throw happens after a successful initial load (rare), wrap the per-round setup in `try/catch` and surface a banner; do not silently no-op. |
| `pointercancel` fires during a P5/P13 drag (OS interruption) | Same cleanup as `pointerup`; no telemetry mutation, no audio. Student can re-press to resume (P5) or re-grab the block (P13). |
| Awaited dynamic TTS rejects mid-handler | The submit handler's `try { await ... } catch (e) { console.error(...) }` block catches it; round advance proceeds via `renderRound()` (TTS failure does NOT block flow per feedback-skill canonical rule, but does NOT mutate scoring either). |
| Round transition fires while a drag is in flight | See § "In-flight drag colliding with `loadRound()` / `endGame()`" above. |

The above is intentionally short — feedback skill's audit added a comprehensive fallback table for the audio system. Interaction-layer failures are dominated by "guard rejected the action; nothing happened", which is the desired behaviour.

---

## Visual-state classes appear together / disappear together

Every visual state class listed in `tap-interaction.md` §1.4 (`.selected`, `.matched`, `.completed`, `.disabled`, `.cell-filled`, `.cell-selected`, `.cell-locked`, `.constraint-violation`, `.palette-active`, `.flash`, `.correct`, `.wrong`, `.input-correct`, `.input-wrong`, etc.) must be cleared as part of round/end-game cleanup. The invariant:

- A class added during round N must be cleared before round N+1 renders.
- `renderRound()` / `loadRound()` removes every transient class added during the previous round (typically via `document.querySelectorAll(...).forEach(el => el.classList.remove(...))` or by re-rendering the grid's `innerHTML`).
- A class added as part of a *terminal* state (`.matched`, `.completed`, `.cell-locked`) is cleared only on `restartGame()` and on the start of the next round (since the next round's items are fresh).
- `.constraint-violation` MUST clear when the violating cell is corrected — do NOT leave it stuck until next round. (Anti-pattern: stale `.constraint-violation` painting a now-valid cell red.)

This pairs with the feedback skill's "cleanup between rounds" rule for audio/subtitle/sticker. Together they form the user-POV invariant: **the previous round's visual + audio state is gone before the next round paints.**

---

## Telemetry / interaction-layer monitoring

Most telemetry lives in the data-contract skill (`recordAttempt`, `signalCollector`, `postGameComplete`). The interaction layer adds a few signals worth logging when builders need to debug interaction-specific bugs:

| Event | When to log | Tag |
|---|---|---|
| Drag cancelled by OS / palm rejection | `pointercancel` fires while `isDragging === true` | `console.warn('interaction: pointercancel during drag', { pattern, path })` |
| Drag started during awaited feedback (guard caught it) | `pointerdown` / `dragstart` returned because `isProcessing === true` | `console.warn('interaction: drag blocked by isProcessing', { pattern })` |
| Double-tap rejected | A tap handler returned because `isProcessing === true` within < 100 ms of the previous tap | `console.warn('interaction: double-tap rejected', { pattern, ms })` |
| Voice input value submitted while CDN package unavailable | `voiceInput.value === undefined` at submit | `console.error('interaction: voiceInput not loaded', { round })` |

These are advisory — they help post-mortem a bug, not gate a build. No validator enforces them. Game scaffolding can route them to a real telemetry pipe if desired.
