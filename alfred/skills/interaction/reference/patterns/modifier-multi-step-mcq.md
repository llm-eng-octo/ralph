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

  // Visual feedback, recordAttempt, awaited SFX + fire-and-forget TTS (L-VI-002).
  // Never await playDynamicFeedback — the step advance must not block on TTS.
  // ...

  gameState.isProcessing = false;

  if (isCorrect) {
    gameState.currentStep++;
    if (gameState.currentStep >= gameState.totalSteps) {
      // All steps done — round RESOLVES (correct outcome).
      // Progress bar bump — AFTER feedback resolves, ONLY on round resolution,
      // BEFORE round-change UI. Default policy: each resolved round = +1.
      // Inter-step transitions (loadStep below) are NOT round resolutions —
      // no bump there. See PART-023 § Bump timing + flow-implementation.md § Round loop.
      gameState.progress++;
      if (progressBar) progressBar.update(gameState.progress, Math.max(0, gameState.lives));
      gameState.currentRound++;
      if (gameState.currentRound >= gameState.totalRounds) {
        endGame('victory');
      } else {
        loadRound();
      }
    } else {
      loadStep(); // Next step in same round — no progress bump (round not resolved yet)
    }
  } else {
    // Wrong — depends on game rules:
    // - Retry same step (Sequence Builder)
    // - Move to next step (Expression Completer)
    // - Life lost
  }
}
```
