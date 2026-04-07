The emotional arc shapes the student's journey through the game -- every design choice serves one goal: the student finishes feeling capable, even if they got questions wrong.

## Pacing Rhythm (The Core Loop)

```
Question appears (curiosity)
    -> Student thinks (tension)
        -> Answer submitted (commitment)
            -> Feedback plays (reward or recovery)
                -> Brief pause (processing)
                    -> Next round fades in (reset + renewed curiosity)
```

This cycle takes 5-8 seconds for L1 recall, 8-12 seconds for L3 application, and 12-20 seconds for L4 analysis. The feedback phase is what makes the difference between "exam" and "game."

## Streak Celebration (3+ Consecutive Correct)

- Subtitle escalates: "3 in a row!", "4 in a row! On fire!", "5 in a row! Unstoppable!"
- Score area gets a brief glow/pulse animation (CSS `streak-glow`)
- No extra delay -- celebration is overlaid on normal correct feedback timing
- Streak counter resets to 0 on any wrong answer (no partial credit)

```css
@keyframes streakGlow {
  0% { box-shadow: 0 0 0 rgba(255, 193, 7, 0); }
  50% { box-shadow: 0 0 16px rgba(255, 193, 7, 0.5); }
  100% { box-shadow: 0 0 0 rgba(255, 193, 7, 0); }
}

.streak-glow {
  animation: streakGlow 0.6s ease;
}
```

## Failure Recovery (3+ Consecutive Wrong Answers)

When a student gets 3+ wrong answers in a row, their confidence is collapsing. The feedback system must intervene:

1. **Soften language:** Switch from "Not quite" to "This is a tough one" and "Let's look at this together"
2. **Add approach hints:** Even at L1/L2, add a brief method hint to the subtitle
3. **Auto-hint trigger:** If the spec defines hints and the game supports them, automatically show the hint before the student's next attempt
4. **Never escalate tone:** The feedback never becomes more stern, impatient, or terse. Each wrong answer gets the same warmth as the first.

Implementation:

```javascript
// Track consecutive wrongs:
if (!isCorrect) {
  gameState.consecutiveWrongs = (gameState.consecutiveWrongs || 0) + 1;
} else {
  gameState.consecutiveWrongs = 0;
}

// Modify subtitle for struggling students:
if (gameState.consecutiveWrongs >= 3) {
  subtitle = "This is a tough one. " + subtitle;
}
```

## Game-Over Tone

The game-over screen is NOT punitive. It is the moment the student is most vulnerable.

- FeedbackManager call: `playFeedback('gameover', 'Keep practicing [topic]!')`
- Subtitle tone: encouraging, forward-looking. "Keep practicing!" not "Game Over."
- The data-phase attribute is set to `game_over` but the VISIBLE text never says "Game Over" in isolation -- it is always paired with encouragement.
- Results screen shows what they got right (not just what they got wrong)
- "Play Again" button is prominent and inviting, not a consolation prize

## Victory Tone

- FeedbackManager call: `playFeedback('victory', 'Amazing [topic] skills!')`
- Subtitle references the specific topic: "Amazing ratio skills!" not just "Great job!"
- Stars display (3 stars at 90%+, 2 at 66%+, 1 at 33%+) gives tangible achievement
- Results screen shows score and stars with a pop-in animation
