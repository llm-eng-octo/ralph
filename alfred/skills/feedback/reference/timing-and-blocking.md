All timing values, auto-advance mechanics, input blocking, wrong answer handling, and the data contract integration sequence for the feedback system.

## Timing Rules

Every timing value in the feedback system. No ambiguity.

| Timing | Value | Priority | Notes |
|--------|-------|----------|-------|
| Correct feedback duration | 1500ms | CRITICAL | Time from `playFeedback('correct')` to `advanceRound()` |
| Wrong feedback duration | 2000ms | CRITICAL | Extra 500ms for student to read correct answer |
| L4 correct feedback duration | 2000ms | STANDARD | Analysis problems deserve acknowledgment |
| Victory/gameover overlay | 2000ms | STANDARD | Time before transitioning to results/game-over screen |
| Correct answer reveal (on wrong) | Shown immediately, visible for full 2000ms | CRITICAL | Appears in `.correct-reveal` element below the question |
| Round content fade-out | 300ms | ADVISORY | CSS `opacity 0.3s ease` |
| Round content fade-in | 350ms | ADVISORY | CSS `opacity 0.35s ease` with `translateY(12px)` |
| Score bounce animation | 400ms | ADVISORY | CSS `starPop` keyframe: scale(0) -> scale(1.3) -> scale(1) |
| Shake animation (wrong) | 500ms | ADVISORY | CSS `shake` keyframe on the wrong option |
| Input block start | Immediate | CRITICAL | `gameState.isProcessing = true` set BEFORE `playFeedback` call |
| Input block end | After feedback duration | CRITICAL | Cleared inside `setTimeout` callback |
| FeedbackManager poll interval | 100ms | STANDARD | Maximum 50 attempts (5s total wait) |

## Auto-Advance Definition

"Auto-advance" means: after the feedback duration timeout fires, the game (1) fades out current round content, (2) increments `gameState.currentRound`, (3) calls `syncDOM()`, (4) renders the next round, (5) fades in new content, and (6) unblocks input. The student does NOT tap "Next" -- it happens automatically.

**What auto-advance is NOT:**
- It is not instant (there is always a 300ms fade transition)
- It is not interruptible (student cannot skip feedback by tapping)
- It does not skip feedback (FeedbackManager overlay always plays its full duration)

## Auto-Advance Sequence

1. Feedback overlay appears (FeedbackManager renders it)
2. Game CSS animations fire simultaneously (score bounce, shake, etc.)
3. After duration elapses, game fades out current round content (300ms CSS transition)
4. Next round content fades in (300ms CSS transition)
5. Input unblocks when new round is fully visible

## Input Blocking Implementation

```javascript
// Set before calling playFeedback:
gameState.isProcessing = true;

// Clear inside the setTimeout that fires after feedback duration:
setTimeout(function() {
  gameState.isProcessing = false;
  advanceRound();
}, 1500); // or 2000 for incorrect
```

All input handlers must check `gameState.isProcessing` and return immediately if true. This prevents double-submission during feedback.

## Wrong Answer Handling

Wrong answers are the most pedagogically important moments. Handle them carefully.

**Always show the correct answer.** Every wrong answer reveals the correct answer, regardless of Bloom level or game type.

### Correct Answer Reveal Pattern

```html
<div id="correct-reveal" class="correct-reveal hidden"></div>
```

```javascript
// After wrong answer:
var revealEl = document.getElementById('correct-reveal');
if (revealEl) {
  revealEl.textContent = 'Answer: ' + correctAnswer;
  revealEl.classList.remove('hidden');
}
```

```css
.correct-reveal {
  font-size: 15px;
  font-weight: 600;
  color: var(--mathai-green);
  text-align: center;
  margin-top: 8px;
  animation: fadeIn 0.35s ease;
}

.correct-reveal.hidden {
  display: none;
}
```

**Reveal timing:** Appears immediately on wrong answer. Stays visible for the full 2000ms. Cleared when next round renders.

### Visual Marking of Selected Option

```css
.selected-wrong {
  background: var(--mathai-red-light, #fde8e8);
  border-color: var(--mathai-red, #e53935);
  color: var(--mathai-red);
}

.selected-correct {
  background: var(--mathai-green-light, #e8f5e9);
  border-color: var(--mathai-green, #43a047);
  color: var(--mathai-green);
}
```

When the student picks a wrong option: (1) mark their selection with `.selected-wrong`, (2) mark the correct option with `.selected-correct`, (3) show `.correct-reveal` with the answer text. All three happen simultaneously.

### Misconception-Specific Explanation

When the spec provides misconception tags for distractors, the wrong-answer subtitle should address the specific misconception:

```
Generic:     "Not quite. It's {correctAnswer}."
Misconception: "You {misconceptionDescription}. It's {correctAnswer}."
```

Examples:
- "You added instead of multiplying. It's 24."
- "You used the wrong ratio order. It's 3:5, not 5:3."
- "That's the perimeter, not the area. It's 36 sq cm."

The spec's `feedbackWrong` field per round is the primary source. Fall back to generic template if not provided.

## Data Contract Integration

When an answer is submitted, the game must execute these steps in exact order. Skipping or reordering breaks either data integrity or user experience.

**Answer submission call sequence -- CRITICAL:**

```
1. recordAttempt(attemptData)    -- log the attempt to the parent app
2. Update score/lives            -- gameState.score++ or gameState.lives--
3. syncDOM()                     -- push updated gameState to data-* attributes
4. playFeedback(type, subtitle)  -- trigger FeedbackManager overlay
5. Wait (setTimeout)             -- 1500ms correct / 2000ms wrong
6. advanceRound() or endGame()   -- move to next round or results screen
```

**Why this order matters:**
- `recordAttempt` fires BEFORE score update so the attempt captures pre-update state.
- `syncDOM` fires BEFORE feedback so that test harness assertions see the updated state during the feedback window.
- `playFeedback` fires BEFORE the wait so the overlay is visible for the full duration.

**recordAttempt payload** -- see `skills/data-contract/` for the full field schema. Minimum required fields:

```javascript
window.parent.postMessage({
  type: 'recordAttempt',
  data: {
    questionIndex: gameState.currentRound,
    isCorrect: isCorrect,
    studentAnswer: selectedAnswer,
    correctAnswer: correctAnswer,
    timeTaken: roundTimeTaken
  }
}, '*');
```

**End-of-game sequence** -- after the last round's feedback completes:

```
1. Calculate final metrics (score, accuracy, time)
2. syncDOM() with data-phase="game_complete" or data-phase="game_over"
3. playFeedback('victory', ...) or playFeedback('gameover', ...)
4. Wait 2000ms
5. Render results/game-over screen
6. Post game_complete message to parent
```

See `skills/data-contract/postmessage-schema.md` for `game_complete` postMessage schema.
