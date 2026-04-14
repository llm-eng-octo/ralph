# Pattern 10: Multi-Select + Submit

### Description

Student taps items to toggle their selected state (checkbox-style), then presses Submit to evaluate all selections at once.

### Used by: MCQ Multi-Select, Hidden Sums, Make-X, Hide-Unhide, Truth Tellers & Liars, Visual Memory

### Interaction Flow

```
Student sees items (options, grid cells, numbers)
  ↓
Student taps item → toggles .selected on/off
  ↓ (fire-and-forget tap SFX per toggle)
  ↓ (optional: live running sum/count updates)
Student taps Submit/Check
  ↓
Evaluate all selections at once
  ↓
Correct → awaited SFX + TTS → next round
Wrong → highlight correct/wrong items → awaited wrong SFX + TTS → life lost
```

### Variant: Auto-Check (Make-X)

```
Student taps numbers → running sum updates
  ↓
Sum equals target → AUTO-CORRECT (no submit needed)
Sum exceeds target → AUTO-INCORRECT (deselect all, life lost)
Sum below target → keep selecting
```

### Event Handling

```javascript
var selectedItems = new Set();

function renderItems(round) {
  round.items.forEach(function(item, i) {
    var el = document.createElement('div');
    el.className = 'selectable-item';
    el.textContent = item.value;
    el.dataset.index = i;
    el.addEventListener('click', function() {
      handleItemToggle(i, item.value);
    });
    container.appendChild(el);
  });

  document.getElementById('submit-btn').addEventListener('click', function() {
    handleSubmitSelections();
  });
}

function handleItemToggle(index, value) {
  if (gameState.isProcessing || gameState.gameEnded) return;

  var el = getItem(index);
  if (selectedItems.has(index)) {
    selectedItems.delete(index);
    el.classList.remove('selected');
  } else {
    selectedItems.add(index);
    el.classList.add('selected');
  }

  FeedbackManager.sound.play('tap_sound').catch(function() {});

  // Update running sum (if applicable)
  updateRunningSum();

  // Auto-check variant (Make-X)
  if (gameState.autoCheck) {
    var sum = getSelectedSum();
    if (sum === gameState.target) {
      handleCorrect();
    } else if (sum > gameState.target) {
      handleExceeded();
    }
  }
}

async function handleSubmitSelections() {
  if (gameState.isProcessing || selectedItems.size === 0) return;
  gameState.isProcessing = true;

  var isCorrect = evaluateSelections(selectedItems);

  // Visual feedback — highlight correct/wrong items
  // recordAttempt, SFX → TTS (awaited)
  // ...

  gameState.isProcessing = false;
}
```

### CSS

```css
.selectable-item {
  min-height: 44px; padding: 10px 14px;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 8px;
  background: var(--mathai-white);
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.selectable-item.selected {
  background: var(--mathai-light-blue);
  border-color: var(--mathai-blue);
}
.selectable-item.correct-reveal {
  background: var(--mathai-light-green);
  border-color: var(--mathai-green);
}
.selectable-item.wrong-reveal {
  background: var(--mathai-light-red);
  border-color: var(--mathai-red);
}
.running-sum { font-size: 20px; font-weight: bold; }
```
