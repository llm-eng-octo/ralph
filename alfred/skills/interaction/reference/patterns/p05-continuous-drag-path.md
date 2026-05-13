# Pattern 5: Continuous Drag (Path)

### Description

Student draws a continuous path by pressing and dragging across grid cells. Path builds in real-time. Backtrack by dragging backwards.

### Identification

- "draw a path", "connect all cells", "trace a route", "Hamiltonian path"

### Event Handling

```javascript
function attachDragListeners() {
  if (gridListenersAttached) return;
  gridListenersAttached = true;

  var grid = document.getElementById('game-grid');

  grid.addEventListener('pointerdown', function(e) {
    // Universal guards — a drag is a gameplay interaction, so ALL three must pass
    if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;
    e.preventDefault();
    var cell = e.target.closest('.grid-cell');
    if (!cell) return;
    var r = parseInt(cell.dataset.row);
    var c = parseInt(cell.dataset.col);
    handleDragStart(r, c);
  });

  document.addEventListener('pointermove', function(e) {
    if (!gameState.isDragging) return;
    // Re-check isProcessing/gameEnded — awaited feedback may have started mid-drag
    // (handlePuzzleComplete sets isProcessing=true before the awaited SFX, and the dynamic TTS is also awaited per
    // feedback-skill canonical rule + validator GEN-FEEDBACK-TTS-AWAIT). Cancel the drag in-flight so the student
    // can't keep drawing while the win audio plays.
    if (gameState.isProcessing || gameState.gameEnded) {
      gameState.isDragging = false;
      return;
    }
    e.preventDefault();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    var cell = el.closest('.grid-cell');
    if (!cell) return;
    var r = parseInt(cell.dataset.row);
    var c = parseInt(cell.dataset.col);
    handleDragMove(r, c);
  });

  document.addEventListener('pointerup', function(e) {
    handleDragEnd();
  });

  document.addEventListener('pointercancel', function(e) {
    handleDragEnd();
  });
}

function handleDragStart(row, col) {
  // Universal guards — ALL three, not just isActive/isProcessing
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;

  if (gameState.path.length === 0) {
    // Must start on start cell
    if (row !== gameState.startCell.row || col !== gameState.startCell.col) return;
    gameState.isDragging = true;
    addToPath(row, col);
  } else {
    // Resume — must press on path head
    var head = gameState.path[gameState.path.length - 1];
    if (row === head.row && col === head.col) {
      gameState.isDragging = true;
    }
  }
}

function handleDragMove(row, col) {
  if (!gameState.isDragging || gameState.isProcessing || gameState.gameEnded) return;
  var head = gameState.path[gameState.path.length - 1];
  if (row === head.row && col === head.col) return; // Same cell

  // Backtrack — moving to second-to-last cell
  if (gameState.path.length >= 2) {
    var prev = gameState.path[gameState.path.length - 2];
    if (row === prev.row && col === prev.col) {
      removeFromPath();
      return;
    }
  }

  // Forward — must be adjacent (Manhattan distance = 1)
  if (Math.abs(row - head.row) + Math.abs(col - head.col) !== 1) return;

  // Must not already be in path
  if (isInPath(row, col)) return;

  addToPath(row, col);
  FeedbackManager.sound.play('tap_sound').catch(function() {});

  // Check win condition
  if (row === gameState.endCell.row && col === gameState.endCell.col) {
    if (gameState.path.length === gameState.totalCells) {
      handlePuzzleComplete();
    }
  }
}

function handleDragEnd() {
  if (!gameState.isDragging) return;
  gameState.isDragging = false;

  // Dead-end detection
  if (gameState.path.length > 0 && gameState.path.length < gameState.totalCells) {
    var head = gameState.path[gameState.path.length - 1];
    if (!hasValidAdjacentMoves(head.row, head.col)) {
      getCellElement(head.row, head.col).classList.add('dead-end');
    }
  }
}

function addToPath(row, col) {
  // Remove path-head from current head
  if (gameState.path.length > 0) {
    var oldHead = gameState.path[gameState.path.length - 1];
    getCellElement(oldHead.row, oldHead.col).classList.remove('path-head');
  }
  gameState.path.push({ row: row, col: col });
  var cellEl = getCellElement(row, col);
  cellEl.classList.add('path');
  cellEl.classList.add('path-head');
  cellEl.classList.remove('dead-end');
}

function removeFromPath() {
  var removed = gameState.path.pop();
  var cellEl = getCellElement(removed.row, removed.col);
  cellEl.classList.remove('path', 'path-head', 'dead-end');

  // New head
  if (gameState.path.length > 0) {
    var newHead = gameState.path[gameState.path.length - 1];
    getCellElement(newHead.row, newHead.col).classList.add('path-head');
  }
}
```

### Input Blocking During Awaited Feedback

The awaited feedback sequence in P5 fires on puzzle-complete: **awaited SFX → awaited dynamic TTS** (feedback-skill canonical rule + validator `GEN-FEEDBACK-TTS-AWAIT`). `handlePuzzleComplete` must set `gameState.isProcessing = true` before the first `await FeedbackManager.sound.play(...)` and keep it set across both awaits; clear `isProcessing` in `renderRound()` / `loadRound()` (single source of truth), not in the handler. The three guards above (on `pointerdown`, `pointermove`, and inside `handleDragMove`) are what turn that flag into real input blocking — without them, the student can keep dragging across cells while the puzzle-complete audio is playing, which invalidates the "solved" state the audio is celebrating. Per-tile tap SFX inside `handleDragMove` is fire-and-forget, so it intentionally does not block further drag input while it plays.

### Reset (Costs Life)

```javascript
function handleReset() {
  if (gameState.isProcessing) return;
  gameState.isProcessing = true;

  gameState.lives--;
  syncDOM();
  if (progressBar) progressBar.update(gameState.progress, Math.max(0, gameState.lives));

  FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});

  // Clear path visually
  gameState.path.forEach(function(p) {
    var el = getCellElement(p.row, p.col);
    el.classList.remove('path', 'path-head', 'dead-end');
    el.classList.add('resetting');
  });

  setTimeout(function() {
    document.querySelectorAll('.resetting').forEach(function(el) {
      el.classList.remove('resetting');
    });
    gameState.path = [];
    gameState.isDragging = false;
    gameState.isProcessing = false;

    if (gameState.lives <= 0) {
      endGame('game_over');
    }
  }, 300);
}
```

### Styling

Touch target size, drag-surface gesture CSS, and base grid layout are owned by the mobile skill. P5 only requires semantic classes for path state: `.path`, `.path-head`, `.start-cell`, `.end-cell`, `.dead-end`, `.resetting`, and `.complete`.
