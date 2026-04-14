# Pattern 11: Same-Grid Pair Selection

### Description

Student taps two items from the same grid that form a valid pair. Unlike P3 (Two-Phase Match), both items come from one pool.

### Used by: Bubbles Pairs, Speedy Taps, Identify Pairs List

### Interaction Flow

```
Student sees a grid of numbers
  ↓
Student taps first number → highlights .selected
  ↓ (fire-and-forget tap SFX)
Student taps second number → evaluate pair
  ↓
Valid pair (e.g., sum = target) → both removed/matched, fire-and-forget correct SFX
Invalid pair → flash .wrong, fire-and-forget wrong SFX, deselect first
  ↓
Repeat until all pairs found or time/lives run out
```

### State Machine

```
NO_SELECTION
  ↓ tap item
FIRST_SELECTED (item A highlighted)
  ↓ tap same item → NO_SELECTION (deselect)
  ↓ tap matched/removed item → ignored
  ↓ tap different item → EVALUATING

EVALUATING
  ↓ valid pair → both .matched/.removed → NO_SELECTION
  ↓ invalid pair → B flashes .wrong → NO_SELECTION
```

### Event Handling

```javascript
var selectedIndex = null;

function handleItemTap(index) {
  if (gameState.isProcessing || !gameState.isActive) return;
  if (gameState.removedItems.has(index)) return;

  if (selectedIndex === null) {
    // First selection
    selectedIndex = index;
    getItem(index).classList.add('selected');
    FeedbackManager.sound.play('sound_bubble_select').catch(function() {});
  } else if (selectedIndex === index) {
    // Deselect
    getItem(index).classList.remove('selected');
    selectedIndex = null;
    FeedbackManager.sound.play('sound_bubble_deselect').catch(function() {});
  } else {
    // Second selection — evaluate
    var valueA = getItemValue(selectedIndex);
    var valueB = getItemValue(index);
    var isMatch = valueA + valueB === gameState.target;

    if (isMatch) {
      getItem(selectedIndex).classList.remove('selected');
      getItem(selectedIndex).classList.add('matched');
      getItem(index).classList.add('matched');
      gameState.removedItems.add(selectedIndex);
      gameState.removedItems.add(index);
      gameState.score++;
      FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER }).catch(function() {});

      if (gameState.removedItems.size >= gameState.totalItems) {
        roundComplete();
      }
    } else {
      getItem(index).classList.add('wrong');
      FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER }).catch(function() {});
      if (gameState.totalLives > 0) {
        gameState.lives--;
        syncDOM();
      }
      setTimeout(function() {
        getItem(index).classList.remove('wrong');
      }, 600);
    }

    getItem(selectedIndex).classList.remove('selected');
    selectedIndex = null;
  }
}
```
