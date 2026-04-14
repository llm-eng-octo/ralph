# Pattern 9: Stepper (Increment/Decrement)

### Description

Student taps +/− buttons to adjust numeric values, then submits an answer. Values may be linked (adjusting one changes another inversely).

### Used by: Adjustment Strategy

### Interaction Flow

```
Student sees two linked numbers with +/− buttons + an input field
  ↓
Student taps + on number A → A increments, B decrements (linked)
Student taps − on number A → A decrements, B increments (linked)
  ↓ (fire-and-forget tap SFX per press)
Student types the sum into the input field
  ↓
Student presses Check/Submit
  ↓
Evaluate: does typed sum = A + B?
  ↓
Correct → awaited SFX + TTS → next round
Wrong → awaited wrong SFX + TTS → life lost, retry
```

### Event Handling

```javascript
function renderStepper(round) {
  var valueA = round.initialA;
  var valueB = round.initialB;

  document.getElementById('btn-plus-a').addEventListener('click', function() {
    if (gameState.isProcessing || valueA >= round.maxA) return;
    valueA++;
    valueB--;
    updateDisplay();
    FeedbackManager.sound.play('tap_sound').catch(function() {});
  });

  document.getElementById('btn-minus-a').addEventListener('click', function() {
    if (gameState.isProcessing || valueA <= round.minA) return;
    valueA--;
    valueB++;
    updateDisplay();
    FeedbackManager.sound.play('tap_sound').catch(function() {});
  });

  document.getElementById('submit-btn').addEventListener('click', function() {
    handleSubmit(valueA, valueB);
  });

  document.getElementById('answer-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(valueA, valueB);
    }
  });
}

async function handleSubmit(valueA, valueB) {
  var input = document.getElementById('answer-input');
  var answer = input.value.trim();
  if (!answer || gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;
  input.blur();

  var isCorrect = parseInt(answer) === valueA + valueB;
  // ... recordAttempt, visual feedback, SFX → TTS (awaited), advance ...
  gameState.isProcessing = false;
}
```

### CSS

```css
.stepper-btn {
  min-height: 44px; min-width: 44px;
  font-size: 24px; font-weight: bold;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 50%;
  background: var(--mathai-white);
  touch-action: manipulation;
  cursor: pointer;
}
.stepper-btn:disabled { opacity: 0.4; pointer-events: none; }
.stepper-value {
  font-size: 32px; font-weight: bold;
  min-width: 60px; text-align: center;
}
```
