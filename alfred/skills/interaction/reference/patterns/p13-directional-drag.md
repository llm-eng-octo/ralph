# Pattern 13: Directional Drag (Constrained Axis)

### Description

Student drags blocks along their allowed axis (horizontal or vertical only) to rearrange a grid. Rush Hour / sliding block puzzle.

### Used by: Free the Key

### Event Handling

```javascript
function handleBlockDragStart(block, e) {
  if (gameState.isProcessing || gameState.solved) return;
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

### CSS

```css
.block {
  position: absolute;
  border-radius: 8px;
  cursor: grab;
  touch-action: none;
  transition: left 0.15s, top 0.15s;
}
.block.dragging { cursor: grabbing; z-index: 10; transition: none; }
.block.horizontal { /* visual: wider than tall */ }
.block.vertical { /* visual: taller than wide */ }
.block.key-block { background: var(--mathai-red); /* the block to free */ }
.block.regular { background: var(--mathai-blue); }
.exit-marker { border: 2px dashed var(--mathai-green); }
```
