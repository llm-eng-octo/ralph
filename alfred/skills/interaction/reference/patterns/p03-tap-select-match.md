# Pattern 3: Tap-Select (Two-Phase Match)

### Description

Student taps item from group A, then taps matching item from group B. Two taps = one evaluation. Multiple pairs per round.

### Identification

- "match pairs", "find the double", "connect left to right", "flip cards"

### State Machine

```
NO_SELECTION
  ↓ tap group A item
FIRST_SELECTED (group B enabled)
  ↓ tap different group A item → stay FIRST_SELECTED (re-select)
  ↓ tap group B item → EVALUATING
EVALUATING
  ↓ correct → both .matched, return to NO_SELECTION
  ↓ wrong → B flashes .wrong, life lost, return to NO_SELECTION
```

### Event Handling

```javascript
function renderMatchGrid(round) {
  round.leftItems.forEach(function(item, i) {
    var cell = createCell(item, 'left');
    cell.onclick = function() { handleLeftClick(i); };
    leftContainer.appendChild(cell);
  });
  round.rightItems.forEach(function(item, i) {
    var cell = createCell(item, 'right');
    cell.classList.add('disabled');
    cell.onclick = function() { handleRightClick(i); };
    rightContainer.appendChild(cell);
  });
}

function handleLeftClick(leftIndex) {
  if (!gameState.isActive) return;
  if (gameState.matchedPairs.has(leftIndex)) return;

  FeedbackManager.sound.play('tap_sound').catch(function() {});

  // Clear previous selection
  document.querySelectorAll('.left-cell.selected').forEach(function(el) {
    el.classList.remove('selected');
  });

  // Select new
  var cell = getLeftCell(leftIndex);
  cell.classList.add('selected');
  gameState.selectedLeftIndex = leftIndex;
  enableRightCells();
}

function handleRightClick(rightIndex) {
  if (!gameState.isActive || gameState.isProcessing) return;
  if (gameState.selectedLeftIndex === null) return;
  if (gameState.matchedPairs.has(rightIndex + '_right')) return;

  gameState.isProcessing = true;
  var leftValue = getLeftValue(gameState.selectedLeftIndex);
  var rightValue = getRightValue(rightIndex);
  var isCorrect = checkMatch(leftValue, rightValue);

  if (isCorrect) {
    getLeftCell(gameState.selectedLeftIndex).classList.remove('selected');
    getLeftCell(gameState.selectedLeftIndex).classList.add('matched');
    getRightCell(rightIndex).classList.add('matched');
    gameState.matchedPairs.add(gameState.selectedLeftIndex);

    FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER }).catch(function() {});

    if (gameState.matchedPairs.size >= totalPairs) {
      roundComplete();
      return;
    }
  } else {
    getRightCell(rightIndex).classList.add('wrong');
    if (gameState.totalLives > 0) {
      gameState.lives--;
      syncDOM();
      if (progressBar) progressBar.update(gameState.currentRound + 1, Math.max(0, gameState.lives));
    }
    FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});

    setTimeout(function() {
      getRightCell(rightIndex).classList.remove('wrong');
    }, 600);

    if (gameState.totalLives > 0 && gameState.lives <= 0) {
      gameState.isProcessing = false;
      endGame('game_over');
      return;
    }
  }

  // Clear selection
  getLeftCell(gameState.selectedLeftIndex).classList.remove('selected');
  gameState.selectedLeftIndex = null;
  disableRightCells();
  gameState.isProcessing = false;
}
```

### Variant: Memory Match (Card Flip)

```javascript
function handleCardTap(cardIndex) {
  if (!gameState.isActive || gameState.isProcessing) return;
  if (gameState.flippedCards.includes(cardIndex)) return;
  if (gameState.matchedCards.has(cardIndex)) return;

  // Flip card
  flipCard(cardIndex);
  gameState.flippedCards.push(cardIndex);

  if (gameState.flippedCards.length === 1) {
    // First card — wait for second
    FeedbackManager.sound.play('tap_sound').catch(function() {});
    return;
  }

  // Second card — evaluate
  gameState.isProcessing = true;
  var first = gameState.flippedCards[0];
  var second = gameState.flippedCards[1];
  var isMatch = checkCardsMatch(first, second);

  if (isMatch) {
    gameState.matchedCards.add(first);
    gameState.matchedCards.add(second);
    getCard(first).classList.add('matched');
    getCard(second).classList.add('matched');
    FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER }).catch(function() {});
    gameState.flippedCards = [];
    gameState.isProcessing = false;

    if (gameState.matchedCards.size >= totalCards) {
      roundComplete();
    }
  } else {
    FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});
    setTimeout(function() {
      unflipCard(first);
      unflipCard(second);
      gameState.flippedCards = [];
      gameState.isProcessing = false;
    }, 1000);
  }
}
```

### CSS

```css
.left-cell, .right-cell {
  min-height: 44px; padding: 10px 14px;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 8px; cursor: pointer;
  touch-action: manipulation;
  transition: background 0.2s, border-color 0.2s;
}
.selected { background: var(--selected-bg, #fff9e0); border-color: var(--selected-border, #e8d98a); }
.matched { background: var(--mathai-light-green); border-color: var(--mathai-green); pointer-events: none; }
.wrong { background: var(--mathai-light-red); border-color: var(--mathai-red); }
.disabled { opacity: 0.6; pointer-events: none; }

/* Memory match card flip */
.card { perspective: 1000px; }
.card-inner { transition: transform 0.5s; transform-style: preserve-3d; }
.card.flipped .card-inner { transform: rotateY(180deg); }
.card-front, .card-back { backfill-visibility: hidden; position: absolute; width: 100%; height: 100%; }
.card-back { transform: rotateY(180deg); }
```
