# Pattern 4: Tap + Swipe

### Description

Student taps a piece to select it, then swipes to slide it in a direction. Two-phase gesture: tap for selection, swipe for action.

### Identification

- "slide", "push", "swipe to move", grid with movable pieces

### Event Handling

```javascript
var SWIPE_THRESHOLD = 30;
var swipeStartX = 0;
var swipeStartY = 0;

function attachGridListeners() {
  if (gridListenersAttached) return;
  gridListenersAttached = true;

  var grid = document.getElementById('game-grid');

  grid.addEventListener('pointerdown', function(e) {
    e.preventDefault();
    var cell = e.target.closest('.grid-cell');
    if (!cell) return;
    var r = parseInt(cell.dataset.row);
    var c = parseInt(cell.dataset.col);
    handleCellTap(r, c);
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
  });

  document.addEventListener('pointerup', function(e) {
    if (!gameState.isActive || gameState.isProcessing || gameState.solved) return;
    if (!gameState.selectedPiece) return;

    var dx = e.clientX - swipeStartX;
    var dy = e.clientY - swipeStartY;

    // Below threshold — just a tap (selection only)
    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    // Determine direction
    var direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }
    handleSwipe(direction);
  });
}

function handleCellTap(row, col) {
  if (!gameState.isActive || gameState.isProcessing || gameState.solved) return;

  var piece = gameState.grid[row][col];
  if (!piece) return; // Empty cell

  // Toggle selection
  if (gameState.selectedPiece &&
      gameState.selectedPiece.row === row &&
      gameState.selectedPiece.col === col) {
    gameState.selectedPiece = null;
    clearAllSelections();
    return;
  }

  gameState.selectedPiece = { row: row, col: col };
  clearAllSelections();
  getCell(row, col).classList.add('selected');
  FeedbackManager.sound.play('tap_sound').catch(function() {});
}

function handleSwipe(direction) {
  var piece = gameState.selectedPiece;
  if (!piece) return;

  // Save undo state
  gameState.moveHistory.push({
    grid: cloneGrid(gameState.grid),
    moveCount: gameState.moveCount
  });

  // Compute destination (slide until blocked)
  var dest = computeSlideDestination(piece.row, piece.col, direction);

  // Execute move
  gameState.grid[dest.row][dest.col] = gameState.grid[piece.row][piece.col];
  gameState.grid[piece.row][piece.col] = null;
  gameState.moveCount++;
  gameState.selectedPiece = null;

  // Handle merge if applicable
  if (dest.merged) {
    gameState.grid[dest.row][dest.col] = null;
    gameState.isProcessing = true;
    renderGrid();
    setTimeout(function() {
      gameState.isProcessing = false;
      checkSolved();
    }, 400);
  } else {
    renderGrid();
    checkSolved();
  }

  // Update undo button
  updateUndoButton();
}
```

### Undo / Reset

```javascript
function undoMove() {
  if (gameState.moveHistory.length === 0) return;
  var prev = gameState.moveHistory.pop();
  gameState.grid = prev.grid;
  gameState.moveCount = prev.moveCount;
  gameState.selectedPiece = null;
  gameState.solved = false;
  renderGrid();
  updateUndoButton();
}

function resetPuzzle() {
  gameState.grid = cloneGrid(gameState.originalGrid);
  gameState.moveCount = 0;
  gameState.moveHistory = [];
  gameState.selectedPiece = null;
  gameState.solved = false;
  renderGrid();
  updateUndoButton();
}
```

### CSS

```css
.grid-cell {
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--mathai-border-gray);
  min-height: 44px; min-width: 44px;
  cursor: pointer;
}
.grid-cell.selected { outline: 3px solid var(--mathai-blue); }
.grid-cell.has-piece { cursor: pointer; }
.grid-cell.empty { cursor: default; }
.jelly-piece { width: 80%; height: 80%; border-radius: 50%; }
.jelly-piece.merging { animation: mergeFlash 400ms ease-out; }

@keyframes mergeFlash {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(0); opacity: 0; }
}
```
