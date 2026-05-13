# Pattern 7: Text/Number Input

### Description

Student types an answer and submits via Enter key or Submit button.

### Mandatory companion reading

**Every P7 game must also implement the behaviors in [p07-input-behaviors.md](./p07-input-behaviors.md):**

1. **Auto-focus + scroll-into-view** on click and on round transitions (with virtual-keyboard avoidance)
2. **Auto-growing input width** — starts at `MIN_W` (72px), grows with content, caps at `MAX_W` (300px), shrinks on delete

These are required, not optional. The base pattern below covers Enter/Submit and audio wiring; `p07-input-behaviors.md` points to the mobile-owned input UX contract.

### Identification

- "type your answer", "enter the number", "fill in the blank"

### Event Handling

> **`autoSubmit: true` fork.** If the spec declares `autoSubmit: true` ([PART-050 § `autoSubmit` spec flag](../../../../parts/PART-050.md#top-level-spec-flag--autosubmit)), the Enter/Submit handler shown below is REPLACED by an internal commit path (timer `onEnd`, drag-drop drop, canvas commit). Input handlers mutate `gameState` only — no `setSubmittable`, no `setMode('submit')`, no Submit button. See [code-patterns.md § `autoSubmit: true` input listener](../../../game-building/reference/code-patterns.md) for the canonical template. Validator: `GEN-AUTOSUBMIT-NO-SUBMITTABLE`.

> The `handleSubmit` body below is the **canonical single-step submit-handler shape**. P17 (Voice Input) and P6 submit-variants (Math Crossword, Equation Grid, Kakuro) reference this same body and only apply the per-pattern deltas described in their files.
>
> Input element creation, mobile attributes, auto-focus, auto-growing width, and virtual-keyboard scroll behavior are mobile-owned. This example assumes the game already rendered `#answer-input` and `#submit-btn`.

```javascript
function attachP7SubmitHandlers(input, submitBtn) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  });

  submitBtn.addEventListener('click', function() {
    handleSubmit();
  });
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

  // Data-contract owns the attempt fields built inside recordAttempt().
  recordAttempt(gameState.currentRound, value, isCorrect, {
    question_id: round.id,
    correct_answer: round.answer
  });
  trackEvent('answer_submitted', { round: gameState.currentRound, isCorrect: isCorrect });

  // Audio — SINGLE-STEP: awaited SFX → awaited dynamic TTS.
  // Canonical rule lives in feedback skill SKILL.md + validator GEN-FEEDBACK-TTS-AWAIT.
  // The next round only advances after the awaited TTS resolves (or returns a package failure status).
  try {
    if (isCorrect) {
      await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER });
      try {
        await FeedbackManager.playDynamicFeedback({
          audio_content: round.feedbackCorrect,
          subtitle: round.feedbackCorrect,
          sticker: CORRECT_STICKER
        });
      } catch (e) { console.error('TTS error:', e.message); }
    } else {
      if (gameState.totalLives > 0 && gameState.lives <= 0) {
        // Game-over path is a terminal state, not a round transition — it handles its own re-enable.
        gameState.isProcessing = false;
        endGame('game_over');
        return;
      }
      await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: INCORRECT_STICKER });
      try {
        await FeedbackManager.playDynamicFeedback({
          audio_content: round.feedbackWrong || 'The answer is ' + round.answer,
          subtitle: round.feedbackWrong || 'The answer is ' + round.answer,
          sticker: INCORRECT_STICKER
        });
      } catch (e) { console.error('TTS error:', e.message); }
    }
  } catch (e) {}

  // Inputs stay disabled until loadRound() re-enables them for the next round.
  // loadRound() is the single source of truth for re-enabling (sets isProcessing=false, resets button state, etc.).
  input.value = '';
  input.classList.remove('input-correct', 'input-wrong');

  // Progress bar bump — AFTER feedback resolves (above), ONLY on round resolution,
  // BEFORE the round-change UI. The text-input pattern shown here is the default
  // no-retry flow — wrong always advances (or hits Game Over via the lives check
  // upstream of this snippet). For retry-flow variants, gate the bump on
  // resolution: skip the bump when the spec defines retry-on-wrong and lives > 0
  // (call floatingBtn.setMode('retry') instead and return). See PART-023 § Bump
  // timing + flow-implementation.md § Round loop.
  gameState.progress++;
  if (progressBar) progressBar.update(gameState.progress, Math.max(0, gameState.lives));

  gameState.currentRound++;
  if (gameState.currentRound >= gameState.totalRounds) {
    endGame('victory');
  } else {
    loadRound();
  }
}
```

### Styling

Input sizing, Safari zoom prevention, appearance reset, spacing, and keyboard/viewport rules are owned by the mobile skill. This pattern only requires semantic state classes such as `.input-correct` and `.input-wrong`; use the mobile skill for the actual CSS values.
