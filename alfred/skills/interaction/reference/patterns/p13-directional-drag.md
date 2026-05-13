# Pattern 13: Directional Drag (Constrained Axis)

### Description

Student drags blocks along their allowed axis (horizontal or vertical only) to rearrange a grid. Rush Hour / sliding block puzzle.

### Used by: Free the Key

### Event Handling

```javascript
function handleBlockDragStart(block, e) {
  // Universal guards — a drag is a gameplay interaction, so ALL three must pass
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;
  if (gameState.solved) return;
  e.preventDefault();

  gameState.dragBlock = block;
  gameState.dragStartX = e.clientX;
  gameState.dragStartY = e.clientY;
  gameState.dragOrigCol = block.col;
  gameState.dragOrigRow = block.row;
  block.element.classList.add('dragging');
}

document.addEventListener('pointermove', function(e) {
  if (!gameState.dragBlock) return;
  // Re-check isProcessing/gameEnded — awaited feedback may have started mid-drag
  if (gameState.isProcessing || gameState.gameEnded) {
    // Cancel the drag in-flight: clear transform, drop the block ref, no move committed
    var b = gameState.dragBlock;
    b.element.classList.remove('dragging');
    b.element.style.transform = '';
    gameState.dragBlock = null;
    gameState.dragDelta = 0;
    return;
  }
  e.preventDefault();

  var block = gameState.dragBlock;
  var cellSize = getCellSize();

  if (block.orientation === 'horizontal') {
    var dx = e.clientX - gameState.dragStartX;
    var colDelta = Math.round(dx / cellSize);
    // Clamp to valid range (no overlapping other blocks, within grid)
    colDelta = clampHorizontal(block, colDelta);
    block.element.style.transform = 'translateX(' + (colDelta * cellSize) + 'px)';
    gameState.dragDelta = colDelta;
  } else {
    var dy = e.clientY - gameState.dragStartY;
    var rowDelta = Math.round(dy / cellSize);
    rowDelta = clampVertical(block, rowDelta);
    block.element.style.transform = 'translateY(' + (rowDelta * cellSize) + 'px)';
    gameState.dragDelta = rowDelta;
  }
});

document.addEventListener('pointerup', function(e) {
  if (!gameState.dragBlock) return;
  // If awaited feedback started mid-drag, drop without committing the move
  if (gameState.isProcessing || gameState.gameEnded) {
    var b = gameState.dragBlock;
    b.element.classList.remove('dragging');
    b.element.style.transform = '';
    gameState.dragBlock = null;
    gameState.dragDelta = 0;
    return;
  }

  var block = gameState.dragBlock;
  var delta = gameState.dragDelta || 0;

  if (delta !== 0) {
    // Save undo state
    gameState.moveHistory.push(captureState());
    gameState.moveCount++;

    // Apply move
    if (block.orientation === 'horizontal') {
      block.col += delta;
    } else {
      block.row += delta;
    }

    FeedbackManager.sound.play('tap_sound').catch(function() {});
  }

  block.element.classList.remove('dragging');
  block.element.style.transform = '';
  gameState.dragBlock = null;
  gameState.dragDelta = 0;

  renderGrid();
  checkWinCondition();
});
```

### Input Blocking During Awaited Feedback

The awaited feedback sequence in P13 is puzzle-complete: **awaited SFX → awaited dynamic TTS** (feedback-skill canonical rule + validator `GEN-FEEDBACK-TTS-AWAIT`). Before the first `await FeedbackManager.sound.play(...)`, set `gameState.isProcessing = true` and keep it set across both awaits; clear `isProcessing` in `renderRound()` / `loadRound()` (single source of truth), not in the handler. The three guards above (on `dragstart`, `pointermove`, `pointerup`) are what turn that flag into real input blocking — without them, the student can still slide a block while the puzzle-complete audio is playing, which invalidates the "solved" state the audio is celebrating.

### Styling

Base block layout, touch-target sizing, and gesture CSS are owned by the mobile skill. P13 only requires semantic classes for interaction state and orientation: `.block`, `.dragging`, `.horizontal`, `.vertical`, `.key-block`, `.regular`, and `.exit-marker`.
```
