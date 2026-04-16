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
- `isProcessing` missing → double-tap, double-submit, double recordAttempt
- `gameEnded` missing → interactions after endGame triggers game_complete postMessage

---

## `isProcessing` — When to Block

`isProcessing` is the single gatekeeper for input blocking. Set it `true` before any operation that should be uninterruptible, set `false` after.

### By Pattern

| Pattern | When `isProcessing = true` | When `isProcessing = false` | Duration |
|---------|--------------------------|----------------------------|----------|
| **Tap-Select (Single)** | Before evaluation + audio | After all audio completes | Full SFX + TTS duration (~2-4s) |
| **Sequential Chain** | During chain-complete celebration; during incorrect flash | After celebration audio; after wrong flash clears | 600ms (wrong) or SFX duration (complete) |
| **Two-Phase Match** | During right-click evaluation | After evaluation + wrong flash | Brief (~100ms correct, 600ms wrong) |
| ~~**Tap + Swipe**~~ **DEPRECATED** | — | — | Use P1 tap-only |
| **Continuous Drag** | During puzzle-complete; during reset | After audio; after reset animation | SFX + TTS (complete) or 300ms (reset) |
| **Drag-and-Drop** | During drop evaluation | After evaluation + snap-back | Brief (~100ms correct, 600ms wrong) |
| **Text/Number Input** | Before evaluation + audio | After all audio completes | Full SFX + TTS duration (~2-4s) |
| **Click-to-Toggle** | During puzzle-solved celebration | After audio completes | SFX + TTS duration |

### Key Rule

**Single-step patterns (1, 7):** `isProcessing` blocks for the FULL audio duration (SFX + TTS, both awaited).

**Multi-step patterns (2, 3, 4, 5, 6, 8):** `isProcessing` blocks only briefly during animations/evaluations, NOT during fire-and-forget SFX. The student must be able to interact immediately after the brief block.

**Exception in multi-step:** Round-complete and puzzle-complete moments DO block for the full awaited SFX duration — these are terminal moments, not mid-round.

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
