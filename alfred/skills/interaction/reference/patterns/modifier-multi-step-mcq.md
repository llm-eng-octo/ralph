# Multi-Step MCQ Implementation (Generic)

For games with multiple MCQ sub-steps per round:

```javascript
function loadRound() {
  var round = getRounds()[gameState.currentRound];
  gameState.currentStep = 0;
  gameState.totalSteps = round.steps.length;
  loadStep();
}

function loadStep() {
  var round = getRounds()[gameState.currentRound];
  var step = round.steps[gameState.currentStep];
  renderStepQuestion(step.question);
  renderStepOptions(step.options);
  gameState.roundStartTime = Date.now();
}

async function handleStepAnswer(selected) {
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  var round = getRounds()[gameState.currentRound];
  var step = round.steps[gameState.currentStep];
  var isCorrect = selected === step.answer;

  // Visual feedback, recordAttempt, SFX → TTS (awaited)
  // ...

  gameState.isProcessing = false;

  if (isCorrect) {
    gameState.currentStep++;
    if (gameState.currentStep >= gameState.totalSteps) {
      // All steps done — round complete
      gameState.currentRound++;
      if (gameState.currentRound >= gameState.totalRounds) {
        endGame('victory');
      } else {
        loadRound();
      }
    } else {
      loadStep(); // Next step in same round
    }
  } else {
    // Wrong — depends on game rules:
    // - Retry same step (Sequence Builder)
    // - Move to next step (Expression Completer)
    // - Life lost
  }
}
```
