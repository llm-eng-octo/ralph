# Skill: Feedback

## Purpose

Define exactly how games respond to student actions -- audio, visual, text feedback, timing, emotional design, and micro-animations -- so every game feels consistent, encouraging, and alive.

## When to use

When implementing correct/wrong answer handling, emotional arc, micro-animations, or round transitions. Consult before writing any playDynamicFeedback call or answer handler.

## Owner

Maintainer: Gen Quality slot (reviews feedback rules) + Education slot (reviews pedagogical tone).
Deletion trigger: retire when FeedbackManager is replaced by a new CDN feedback system -- update this skill to match the new API surface.

## Reads

- `skills/game-archetypes.md` -- archetype determines pacing defaults -- **ALWAYS**
- `skills/pedagogy/SKILL.md` -- Bloom level determines feedback depth -- **ALWAYS**
- `skills/data-contract/` -- recordAttempt fields, syncDOM contract, game_complete schema -- **ON-DEMAND** (load when implementing answer submission sequence)
- `skills-taxonomy.md` sections 3.3, 3.4, 8.2, 8.3, 8.9 -- source requirements -- **ON-DEMAND**
- CDN FeedbackManager API (PART-017) -- **ALWAYS**

## Input

- Bloom level (L1-L4)
- Game archetype (MCQ Quiz, Lives Challenge, etc.)
- Spec-defined feedback overrides (if any)
- PART-017 flag (YES = FeedbackManager available)

## Output

Feedback behavior specification consumed by `game-building.md`. Defines: what fires, when, for how long, what the student sees and hears, and what happens next.

## Reference Files

| File | Contents |
|------|----------|
| [feedbackmanager-api.md](reference/feedbackmanager-api.md) | FeedbackManager calls, wrapper function, PART-017 handling |
| [timing-and-blocking.md](reference/timing-and-blocking.md) | All timing values, auto-advance, input blocking, data contract integration |
| [emotional-arc.md](reference/emotional-arc.md) | Pacing rhythm, streak celebration, failure recovery, game-over tone |
| [juice-animations.md](reference/juice-animations.md) | 7 CSS keyframe definitions, animation application, round presentation sequence |

## Quick-Reference Event Table

| Event | Feedback call | Duration | Input blocked | What happens after |
|-------|--------------|----------|---------------|--------------------|
| Correct answer | `playFeedback('correct', ...)` | 1500ms | Yes | Auto-advance to next round |
| Wrong answer | `playFeedback('incorrect', ...)` | 2000ms | Yes | Show correct answer, then auto-advance (or game over if lives=0) |
| Streak 3+ correct | `playFeedback('correct', ...)` | 1500ms | Yes | Auto-advance + streak CSS animation |
| Game complete (score > 0) | `playFeedback('victory', ...)` | 2000ms | Yes | Transition to results screen |
| Game over (lives = 0) | `playFeedback('gameover', ...)` | 2000ms | Yes | Transition to game-over screen |
| Hint shown | No FeedbackManager call | Until dismissed | No | Student continues round |
| Round complete (multi-step) | No separate feedback | 0ms | No | Next step in round |

## Procedure

### 1. Determine FeedbackManager availability

Check PART-017 flag. If YES, use `playFeedback()` wrapper (see [feedbackmanager-api.md](reference/feedbackmanager-api.md)). If NO, use CSS-only feedback (`.selected-correct`, `.selected-wrong`).

### 2. Define feedback per Bloom level

Subtitle text and depth change by Bloom level. See [feedbackmanager-api.md](reference/feedbackmanager-api.md) section "Feedback Per Bloom Level" for templates:
- **L1 (Remember):** Short, immediate. "That's right!" / "Not quite. It's [answer]."
- **L2 (Understand):** Brief explanation. "Right! [why]." / "It's [answer]. [why]."
- **L3 (Apply):** Approach hint. "Correct approach!" / "Try [method]. The answer is [answer]."
- **L4 (Analyze):** Metacognitive. "Good analysis!" / "What could you check? The answer is [answer]."

### 3. Wire up timing and input blocking

All timing values in [timing-and-blocking.md](reference/timing-and-blocking.md). Every `playFeedback` call requires `gameState.isProcessing = true` before and a `setTimeout` clearing it after.

### 4. Implement wrong answer handling

Always show the correct answer via `.correct-reveal`. Mark wrong selection with `.selected-wrong`, correct option with `.selected-correct`. See [timing-and-blocking.md](reference/timing-and-blocking.md) for the answer submission call sequence.

### 5. Shape the emotional arc

Streak celebration at 3+ correct, failure recovery at 3+ consecutive wrong. Game-over tone is encouraging, never punitive. See [emotional-arc.md](reference/emotional-arc.md).

### 6. Add juice animations

7 required animations ship with every game. See [juice-animations.md](reference/juice-animations.md) for keyframes, CSS classes, and application code.

### 7. Define round presentation sequence

Each round has 4 phases: question preview, instructions (conditional), media (conditional), gameplay reveal. See [juice-animations.md](reference/juice-animations.md) section "Round Presentation Sequence."

## Constraints

1. **CRITICAL -- Never build custom feedback overlays.** FeedbackManager owns the overlay layer. Games add `.correct-reveal` for answer text only.
2. **CRITICAL -- Never fire-and-forget feedback.** Every `playFeedback` must be followed by a `setTimeout` handling the next state transition.
3. **CRITICAL -- Never skip feedback.** Even obvious answers need confirmation.
4. **CRITICAL -- Never show negative scores.** Score >= 0 always. Wrong answers cost lives or nothing.
5. **STANDARD -- Never use the word "wrong" in student-facing text.** Use "Not quite," "Close," "Almost."
6. **CRITICAL -- Input must be blocked during feedback.** `gameState.isProcessing` is the single gatekeeper.
7. **STANDARD -- Subtitle under 60 characters.** FeedbackManager renders in a small area.
8. **STANDARD -- Always await FeedbackManager readiness.** Call `waitForFeedback()` before first round.

## Defaults

| Parameter | Default value | Override source |
|-----------|--------------|-----------------|
| Bloom level | L2 (Understand) | Spec `bloomLevel` field |
| Correct feedback duration | 1500ms | Spec can increase, never decrease below 1000ms |
| Wrong feedback duration | 2000ms | Spec can increase, never decrease below 1500ms |
| Show correct answer on wrong | Always | No override |
| Streak threshold | 3 consecutive correct | Spec can increase |
| Failure recovery threshold | 3 consecutive wrong | Spec can decrease |
| Game-over subtitle | "Keep practicing [topic]!" | Spec `gameOverMessage` field |
| Victory subtitle | "Amazing [topic] skills!" | Spec `victoryMessage` field |

## Anti-patterns

1. **Custom overlays instead of FeedbackManager.** Building `<div class="feedback-overlay">` that conflicts with FeedbackManager's overlay layer.
2. **Silent wrong answers.** Decrementing lives without calling `playFeedback('incorrect')`.
3. **Immediate advance on wrong.** `advanceRound()` with 0ms delay -- student never sees correct answer.
4. **Punitive language.** "WRONG!", "You failed!", "0 stars - try harder." Be kind.
5. **Feedback without input blocking.** `playFeedback()` without `gameState.isProcessing = true`.
6. **Hardcoded subtitle text.** Same "Good job!" every round instead of using round's `feedbackCorrect` field.
7. **Custom audio.** `new Audio('ding.mp3')` bypasses FeedbackManager's preloading and mute state.
8. **Blocking initialization on FeedbackManager.** Game must proceed without it after 5s timeout.
