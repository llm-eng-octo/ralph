# Pattern 2: Tap-Select (Sequential Chain)

### Description

Student taps elements in a specific order to build a chain. Wrong tap breaks and resets the chain. Multiple chains per round.

### Identification

- Multiple taps to build a sequence
- "find the chain", "tap in order", "build a sequence"

### Interaction Flow

```
Student sees grid of elements
  ↓
Student taps first tile
  ↓ must match a valid chain start
  → Valid: .selected, chain begins, fire-and-forget tap SFX
  → Invalid: handleIncorrect(), life lost, chain doesn't start
  ↓
Student taps next tile
  ↓ must match expected next element in chain
  → Correct: add to chain (.selected), fire-and-forget correct SFX + sticker
  → Wrong: entire chain resets (.wrong flash), life lost, fire-and-forget wrong SFX
  ↓
Repeat until chain complete
  ↓
Chain complete → .completed on all chain tiles
  ↓
More chains to find? → start next chain
All chains found? → awaited all_correct SFX → next round
```

### State Machine

```
IDLE (no chain active)
  ↓ tap valid start tile
BUILDING (chain in progress)
  ↓ tap correct next tile → stay BUILDING (chain grows)
  ↓ tap wrong tile → IDLE (chain resets, life lost)
  ↓ chain complete → CHAIN_DONE
CHAIN_DONE
  ↓ more chains → IDLE
  ↓ all chains → ROUND_COMPLETE
```

### Event Handling

```javascript
function renderGrid(round) {
  var grid = document.getElementById('game-grid');
  grid.innerHTML = '';
  round.tiles.forEach(function(tile, i) {
    var el = document.createElement('div');
    el.className = 'grid-tile';
    el.textContent = tile.value;
    el.dataset.index = i;
    el.addEventListener('click', function() {
      handleTileTap(i);
    });
    grid.appendChild(el);
  });
}

function handleTileTap(tileIndex) {
  if (!gameState.isActive || gameState.isProcessing) return;
  if (gameState.phase !== 'playing') return;
  if (gameState.completedTiles.has(tileIndex)) return;

  if (gameState.currentChainIndex === -1) {
    // No chain active — check if this is a valid start
    var chainIdx = findChainStartingWith(tileIndex);
    if (chainIdx === -1) {
      handleIncorrect(tileIndex);
      return;
    }
    gameState.currentChainIndex = chainIdx;
    gameState.selectedTiles = [tileIndex];
    highlightTile(tileIndex, 'selected');
    FeedbackManager.sound.play('sound_bubble_select', { sticker: CORRECT_STICKER }).catch(function() {});
  } else {
    // Chain active — check if this is the expected next tile
    var chain = getChain(gameState.currentChainIndex);
    var expectedIndex = chain.indices[gameState.selectedTiles.length];
    if (tileIndex === expectedIndex) {
      gameState.selectedTiles.push(tileIndex);
      highlightTile(tileIndex, 'selected');
      FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER }).catch(function() {});
      if (gameState.selectedTiles.length === chain.indices.length) {
        chainComplete();
      }
    } else {
      handleIncorrect(tileIndex);
    }
  }
}
```

### Chain Reset on Error

```javascript
function handleIncorrect(wrongTileIndex) {
  gameState.isProcessing = true;

  // Flash all selected tiles + the wrong tile
  gameState.selectedTiles.forEach(function(idx) {
    highlightTile(idx, 'wrong');
  });
  if (wrongTileIndex !== undefined) {
    highlightTile(wrongTileIndex, 'wrong');
  }

  // Life lost
  if (gameState.totalLives > 0) {
    gameState.lives--;
    syncDOM();
    if (progressBar) progressBar.update(gameState.currentRound + 1, Math.max(0, gameState.lives));
  }

  // Fire-and-forget SFX
  FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});

  // Reset chain after brief delay
  setTimeout(function() {
    gameState.selectedTiles.forEach(function(idx) {
      clearHighlight(idx);
    });
    if (wrongTileIndex !== undefined) clearHighlight(wrongTileIndex);
    gameState.selectedTiles = [];
    gameState.currentChainIndex = -1;
    gameState.isProcessing = false;

    if (gameState.totalLives > 0 && gameState.lives <= 0) {
      endGame('game_over');
    }
  }, 600);
}
```

### CSS

```css
.grid-tile {
  min-height: 44px; min-width: 44px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px;
  border: 2px solid var(--mathai-border-gray);
  background: var(--mathai-white);
  font-size: var(--mathai-font-size-body);
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.grid-tile.selected { background: var(--selected-bg, #fff9e0); border-color: var(--selected-border, #e8d98a); }
.grid-tile.completed { background: var(--mathai-light-green); border-color: var(--mathai-green); pointer-events: none; }
.grid-tile.wrong { background: var(--mathai-light-red); border-color: var(--mathai-red); animation: shake 500ms; }
```
