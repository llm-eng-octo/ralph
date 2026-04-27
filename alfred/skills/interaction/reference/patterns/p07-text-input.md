# Pattern 7: Text/Number Input

### Description

Student types an answer and submits via Enter key or Submit button.

### Mandatory companion reading

**Every P7 game must also implement the behaviors in [p07-input-behaviors.md](./p07-input-behaviors.md):**

1. **Auto-focus + scroll-into-view** on click and on round transitions (with virtual-keyboard avoidance)
2. **Auto-growing input width** — starts at `MIN_W` (72px), grows with content, caps at `MAX_W` (300px), shrinks on delete

These are required, not optional. The base pattern below covers Enter/Submit and audio wiring; `p07-input-behaviors.md` covers the interactive UX.

### Identification

- "type your answer", "enter the number", "fill in the blank"

### Event Handling

```javascript
function renderInput() {
  var html = '<input type="text" inputmode="numeric" pattern="[0-9]*" '
    + 'id="answer-input" placeholder="Type your answer" '
    + 'autocomplete="off" style="font-size: 16px;">'
    + '<button class="game-btn btn-primary" id="submit-btn">Submit</button>';
  document.getElementById('input-area').innerHTML = html;

  document.getElementById('answer-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  });

  document.getElementById('submit-btn').addEventListener('click', function() {
    handleSubmit();
  });

  // Keyboard visibility — keep question visible
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() {
      var input = document.activeElement;
      if (input && input.tagName === 'INPUT') {
        var question = document.querySelector('.question-text');
        if (question) {
          question.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }
}

async function handleSubmit() {
  var input = document.getElementById('answer-input');
  var value = input.value.trim();
  if (!value) return;
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;

  gameState.isProcessing = true;
  input.blur(); // Dismiss keyboard

  var round = getRounds()[gameState.currentRound];
  var isCorrect = value === String(round.answer);

  // Visual feedback
  input.classList.add(isCorrect ? 'input-correct' : 'input-wrong');

  // State + data
  if (isCorrect) gameState.score++;
  else if (gameState.totalLives > 0) gameState.lives--;
  syncDOM();
  if (progressBar) progressBar.update(gameState.progress, Math.max(0, gameState.lives));

  recordAttempt({ /* 12 fields */ });
  trackEvent('answer_submitted', { round: gameState.currentRound, isCorrect: isCorrect });

  // Audio — SINGLE-STEP: SFX awaited (short, predictable), TTS fire-and-forget.
  // Game flow MUST NOT depend on TTS completion — if the network stalls, the next round still loads.
  try {
    if (isCorrect) {
      await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER });
      FeedbackManager.playDynamicFeedback({
        audio_content: round.feedbackCorrect,
        subtitle: round.feedbackCorrect,
        sticker: CORRECT_STICKER
      }).catch(function(e) { console.error('TTS error:', e.message); });
    } else {
      if (gameState.totalLives > 0 && gameState.lives <= 0) {
        // Game-over path is a terminal state, not a round transition — it handles its own re-enable.
        gameState.isProcessing = false;
        endGame('game_over');
        return;
      }
      await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER });
      FeedbackManager.playDynamicFeedback({
        audio_content: round.feedbackWrong || 'The answer is ' + round.answer,
        subtitle: round.feedbackWrong || 'The answer is ' + round.answer,
        sticker: INCORRECT_STICKER
      }).catch(function(e) { console.error('TTS error:', e.message); });
    }
  } catch (e) {}

  // Inputs stay disabled until loadRound() re-enables them for the next round.
  // loadRound() is the single source of truth for re-enabling (sets isProcessing=false, resets button state, etc.).
  input.value = '';
  input.classList.remove('input-correct', 'input-wrong');

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
#answer-input {
  font-size: 16px; /* Prevents iOS zoom */
  padding: 12px 16px;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 8px;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
}
#answer-input:focus { border-color: var(--mathai-blue); outline: none; }
.input-correct { border-color: var(--mathai-green); background: var(--mathai-light-green); }
.input-wrong { border-color: var(--mathai-red); background: var(--mathai-light-red); }
```
