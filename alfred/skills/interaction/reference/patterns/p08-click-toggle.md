# Pattern 8: Click-to-Toggle

### Description

Student clicks cells to cycle through states. Board evaluated against constraints on every toggle. Click again to undo.

### Identification

- "place/remove", "toggle on/off", "fill cells", puzzle with constraints

### Event Handling

```javascript
function renderBoard() {
  var grid = document.getElementById('game-grid');
  grid.innerHTML = '';
  for (var r = 0; r < gameState.gridSize; r++) {
    for (var c = 0; c < gameState.gridSize; c++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      if (gameState.lockedCells[r][c]) {
        cell.classList.add('cell-locked');
        cell.textContent = gameState.grid[r][c];
      } else {
        cell.addEventListener('click', (function(row, col) {
          return function() { handleCellToggle(row, col); };
        })(r, c));
      }

      grid.appendChild(cell);
    }
  }
}

function handleCellToggle(row, col) {
  if (!gameState.isActive || gameState.isProcessing || gameState.solved) return;

  // Toggle state
  if (gameState.grid[row][col] === null) {
    gameState.grid[row][col] = gameState.toggleValue; // e.g., 'queen', 1, true
    getCellElement(row, col).classList.add('cell-filled');
    getCellElement(row, col).textContent = gameState.toggleDisplay;
  } else {
    gameState.grid[row][col] = null;
    getCellElement(row, col).classList.remove('cell-filled');
    getCellElement(row, col).textContent = '';
  }

  // Check constraints
  var violations = checkConstraints();
  clearAllViolations();
  violations.forEach(function(v) {
    getCellElement(v.row, v.col).classList.add('constraint-violation');
  });

  // Check win condition
  if (violations.length === 0 && checkWinCondition()) {
    handlePuzzleSolved();
  }
}

async function handlePuzzleSolved() {
  gameState.isProcessing = true;
  gameState.solved = true;
  gameState.score++;
  syncDOM();

  recordAttempt({ /* puzzle attempt data */ });
  trackEvent('answer_submitted', { round: gameState.currentRound, isCorrect: true });

  try {
    await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER });
    await FeedbackManager.playDynamicFeedback({
      audio_content: 'Puzzle solved!',
      subtitle: 'Puzzle solved!',
      sticker: CORRECT_STICKER
    });
  } catch (e) {}

  gameState.isProcessing = false;
  gameState.currentRound++;
  if (gameState.currentRound >= gameState.totalRounds) {
    endGame('victory');
  } else {
    loadRound();
  }
}
```

### CSS

```css
.grid-cell {
  display: flex; align-items: center; justify-content: center;
  min-height: 44px; min-width: 44px;
  border: 1px solid var(--mathai-border-gray);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.2s;
}
.cell-filled { background: var(--mathai-blue); color: white; }
.cell-locked { background: var(--mathai-light-gray); pointer-events: none; opacity: 0.8; font-weight: bold; }
.constraint-violation { background: var(--mathai-light-red); border-color: var(--mathai-red); }
```
