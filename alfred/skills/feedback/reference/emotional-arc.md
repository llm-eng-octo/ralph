# Emotional Arc

The emotional arc shapes the student's journey — every design choice serves one goal: the student finishes feeling capable, even if they got questions wrong.

## Pacing Rhythm (The Core Loop)

```
Question appears (curiosity)
    → Student thinks (tension)
        → Answer submitted (commitment)
            → Feedback plays (reward or recovery)
                → Brief pause (processing)
                    → Next round fades in (reset + renewed curiosity)
```

This cycle takes 5–8 seconds for L1 recall, 8–12 seconds for L3 application, and 12–20 seconds for L4 analysis. The feedback phase is what makes the difference between "exam" and "game."

## Streak Celebration (3+ Consecutive Correct)

- Subtitle escalates: "3 in a row!", "4 in a row! On fire!", "5 in a row! Unstoppable!"
- Score area gets a brief glow/pulse animation (CSS `streak-glow`)
- No extra delay — celebration is overlaid on normal correct feedback timing
- Streak counter resets to 0 on any wrong answer (no partial credit)

## Failure Recovery (3+ Consecutive Wrong Answers)

When a student gets 3+ wrong answers in a row, their confidence is collapsing. The feedback system must intervene:

1. **Soften language:** Switch from "Not quite" to "This is a tough one" and "Let's look at this together"
2. **Add approach hints:** Even at L1/L2, add a brief method hint to the subtitle
3. **Auto-hint trigger:** If the spec defines hints and the game supports them, automatically show the hint before the student's next attempt
4. **Never escalate tone:** The feedback never becomes more stern, impatient, or terse. Each wrong answer gets the same warmth as the first.

## Game-Over Tone

The game-over screen is NOT punitive. It is the moment the student is most vulnerable.

- The screen renders FIRST, then game-over SFX + VO play after
- Title: "Game Over" with sad emoji (😔)
- Subtitle shows what they achieved: "You completed 2 rounds" — not just the failure
- In some games, the game-over VO is contextual — different audio per number of rounds completed
- "Try Again" button is prominent and inviting
- The visible text and VO tone are encouraging, forward-looking: "Keep practicing!" not "You failed"
- Student can tap "Try Again" while game-over audio is still playing — audio stops, game restarts

## Victory Tone

- Results screen renders FIRST with stars and metrics, then victory SFX + VO play after
- Different audio and stickers per star tier:
  - **3★:** Victory SFX (big celebration sticker) → Victory VO
  - **2★:** Game complete SFX (moderate sticker) → 2-star VO
  - **1★:** Game complete SFX (moderate sticker) → 1-star VO
- Subtitle references the specific topic: "Amazing ratio skills!" not just "Great job!"
- Stars display with pop-in animation
- "Play Again" / "Retry for more stars" button visible immediately
- Student can tap CTA while victory audio plays — audio stops, game restarts

## Language Rules

| Do | Don't |
|----|-------|
| "Not quite" | "Wrong" |
| "Close!" | "Incorrect" |
| "Almost!" | "You failed" |
| "This is a tough one" | "Try harder" |
| "Keep practicing!" | "0 stars" |
| "Let's look at this together" | "That's not right" |
| "You completed 2 rounds" | "You only finished 2" |
