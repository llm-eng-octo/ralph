# Pattern 15: Cell Select → Number Picker

### Description

Student taps a grid cell to select it, then taps a number from a picker to place it.

### Used by: Futoshiki, Kakuro, Killer Sudoku

### Event Handling

```javascript
var selectedCell = null;

function handleCellTap(row, col) {
  if (gameState.isProcessing || gameState.solved) return;
  if (gameState.lockedCells[row][col]) return; // Pre-filled clue

  // If same cell tapped — clear it
  if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
    if (gameState.grid[row][col] !== null) {
      gameState.grid[row][col] = null;
      renderCell(row, col);
      selectedCell = null;
      hidePicker();
      checkConstraints();
      return;
    }
  }

  // Deselect previous
  if (selectedCell) {
    getCellElement(selectedCell.row, selectedCell.col).classList.remove('cell-selected');
  }

  // Select new
  selectedCell = { row: row, col: col };
  getCellElement(row, col).classList.add('cell-selected');
  showPicker(row, col);
  FeedbackManager.sound.play('tap_sound').catch(function() {});
}

function handlePickerSelect(number) {
  if (!selectedCell || gameState.isProcessing) return;

  gameState.grid[selectedCell.row][selectedCell.col] = number;
  renderCell(selectedCell.row, selectedCell.col);
  getCellElement(selectedCell.row, selectedCell.col).classList.remove('cell-selected');
  hidePicker();

  FeedbackManager.sound.play('tap_sound').catch(function() {});

  // Check constraints
  var violations = checkConstraints();
  highlightViolations(violations);

  // Auto-validate if grid is fully filled
  if (isGridComplete() && violations.length === 0) {
    selectedCell = null;
    handlePuzzleSolved();
    return;
  }

  selectedCell = null;
}

function showPicker(row, col) {
  var picker = document.getElementById('number-picker');
  picker.innerHTML = '';
  for (var n = 1; n <= gameState.gridSize; n++) {
    var btn = document.createElement('button');
    btn.className = 'picker-btn';
    btn.textContent = n;
    btn.addEventListener('click', (function(num) {
      return function() { handlePickerSelect(num); };
    })(n));
    picker.appendChild(btn);
  }
  picker.classList.remove('hidden');
  positionPicker(picker, row, col);
}

// Dismiss picker on outside tap
document.addEventListener('click', function(e) {
  if (!e.target.closest('.grid-cell') && !e.target.closest('#number-picker')) {
    hidePicker();
    if (selectedCell) {
      getCellElement(selectedCell.row, selectedCell.col).classList.remove('cell-selected');
      selectedCell = null;
    }
  }
});
```

### CSS

```css
.grid-cell {
  min-height: 44px; min-width: 44px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--mathai-border-gray);
  font-size: 20px; font-weight: bold;
  cursor: pointer;
  touch-action: manipulation;
}
.cell-selected { background: var(--mathai-light-blue); border-color: var(--mathai-blue); }
.cell-locked { background: var(--mathai-light-gray); pointer-events: none; color: var(--mathai-black); }
.cell-violation { background: var(--mathai-light-red); border-color: var(--mathai-red); }

#number-picker {
  display: flex;
  background: var(--mathai-white);
  border: 2px solid var(--mathai-border-gray);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 4px;
  z-index: 50;
  position: absolute;
}
.picker-btn {
  min-height: 44px; min-width: 44px;
  border: none; background: transparent;
  font-size: 18px; font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  touch-action: manipulation;
}
.picker-btn:active { background: var(--mathai-light-blue); }
.hidden { display: none !important; }

/* Inequality signs between cells (Futoshiki) */
.inequality {
  font-size: 14px; color: var(--mathai-gray);
  display: flex; align-items: center; justify-content: center;
}
```
