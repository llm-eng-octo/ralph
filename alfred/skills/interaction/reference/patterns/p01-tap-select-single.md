# Pattern 1: Tap-Select (Single)

## Description

Student taps exactly one element to make a choice. One tap = one evaluation = round over. The most common pattern.

## Identification

- 1 interaction completes the round
- MCQ (tap 1 of N options), tap a grid cell, select one correct answer

## Archetype Match

MCQ Quiz, Speed Blitz, Lives Challenge (MCQ variant), No-Penalty Explorer, Tracking/Attention, Position Maximizer.

## Interaction Flow

```
Student sees options
  ↓
Student taps one option
  ↓
Guard check (isProcessing, isActive, gameEnded)
  ↓ passes
isProcessing = true
  ↓
Evaluate (correct or wrong)
  ↓
recordAttempt → trackEvent → syncDOM → progressBar.update
  ↓
Visual feedback (.selected-correct / .selected-wrong / .correct-reveal)
  ↓
await SFX (with sticker) → await dynamic TTS (with sticker)
  ↓
isProcessing = false
  ↓
Correct → advance to next round
Wrong → stay on round (if lives game) or advance (if no-lives)
```

## Event Handling

```javascript
// MCQ option buttons
function renderOptions(round) {
  var optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  round.options.forEach(function(option, i) {
    var btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.dataset.value = option;
    btn.addEventListener('click', function() {
      handleAnswer(option);
    });
    optionsContainer.appendChild(btn);
  });
}

// Grid cells (e.g., Position Maximizer)
function renderGrid() {
  cells.forEach(function(cell, i) {
    if (cell.isEmpty) {
      cell.element.addEventListener('click', function() {
        handleCellTap(i);
      });
    }
  });
}
```

## Answer Handler

```javascript
async function handleAnswer(selected) {
  if (!gameState.isActive || gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  var round = getRounds()[gameState.currentRound];
  var isCorrect = selected === round.answer;

  // Visual feedback
  var options = document.querySelectorAll('.option-btn');
  options.forEach(function(btn) {
    if (btn.dataset.value === selected) {
      btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
    }
    if (!isCorrect && btn.dataset.value === round.answer) {
      btn.classList.add('selected-correct');
    }
    btn.disabled = true;
  });

  // State + data
  if (isCorrect) {
    gameState.score++;
  } else if (gameState.totalLives > 0) {
    gameState.lives--;
  }
  syncDOM();
  if (progressBar) progressBar.update(gameState.currentRound + 1, Math.max(0, gameState.lives));

  recordAttempt({
    question: round.question,
    selected_answer: selected,
    correct_answer: round.answer,
    is_correct: isCorrect,
    response_time_ms: Date.now() - gameState.roundStartTime,
    // ... all 12 fields
  });
  trackEvent('answer_submitted', { round: gameState.currentRound, isCorrect: isCorrect });

  // Audio — SINGLE-STEP: SFX → TTS, both awaited
  try {
    if (isCorrect) {
      await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER });
      await FeedbackManager.playDynamicFeedback({
        audio_content: round.feedbackCorrect || 'Correct!',
        subtitle: round.feedbackCorrect || 'Correct!',
        sticker: CORRECT_STICKER
      });
    } else {
      // Last life → skip wrong SFX, go to game over
      if (gameState.totalLives > 0 && gameState.lives <= 0) {
        gameState.isProcessing = false;
        endGame('game_over');
        return;
      }
      await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER });
      await FeedbackManager.playDynamicFeedback({
        audio_content: round.feedbackWrong || 'Not quite. The answer is ' + round.answer,
        subtitle: round.feedbackWrong || 'Not quite. The answer is ' + round.answer,
        sticker: INCORRECT_STICKER
      });
    }
  } catch (e) {}

  gameState.isProcessing = false;
  trackEvent('round_complete', { round: gameState.currentRound });

  // Advance
  if (isCorrect || gameState.totalLives === 0) {
    gameState.currentRound++;
    if (gameState.currentRound >= gameState.totalRounds) {
      endGame('victory');
    } else {
      loadRound();
    }
  }
  // Wrong + lives game: stay on same round (options already disabled, student sees correct answer)
}
```

## CSS

```css
.option-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
  border-radius: var(--mathai-border-radius-card, 12px);
  border: 2px solid var(--mathai-border-gray, #e0e0e0);
  background: var(--mathai-white);
  font-size: var(--mathai-font-size-body);
  touch-action: manipulation;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.option-btn:disabled { opacity: 0.6; pointer-events: none; }
.selected-correct { background: var(--mathai-light-green); border-color: var(--mathai-green); }
.selected-wrong { background: var(--mathai-light-red); border-color: var(--mathai-red); }
.correct-reveal { background: var(--mathai-light-green); border-color: var(--mathai-green); font-weight: bold; }
```

## Undo

None. Tap is final.
