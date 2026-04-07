Exact output format for all 5 plan documents -- each section below is the template that game-building.md consumes.

## 1. game-flow.md Format

```markdown
# Game Flow: [Game Title]

## One-liner
[What the player does in one sentence. Must name the math topic, the action verb, and the end goal.]

## Flow Diagram

[Screen] -> transition -> [Screen] -> transition -> [Screen]
     ^                                                  |
     +----------------------------------------------------+

Rules:
- Every screen that exists in the game appears in this diagram
- Every transition is labeled with what triggers it (tap, timer expiry, lives=0, all rounds done)
- Loops (replay) are shown explicitly
- If the archetype has game_over, it appears as a branch

## Stages

| Stage | Rounds | Difficulty | Content description |
|-------|--------|------------|---------------------|
| Easy | 1-3 | L1 recall / simple values | [what the student sees] |
| Medium | 4-6 | L2 application / moderate values | [what the student sees] |
| Hard | 7-9 | L3 multi-step / tricky distractors | [what the student sees] |

Notes:
- Round count and stage breakdown come from the spec. If the spec is silent, use archetype defaults.
- "Content description" is concrete: "single-digit multiplication" not "easier problems."
```

## 2. screens.md Format

```markdown
# Screens: [Game Title]

## Screen Inventory

List every screen with its data-phase value:
- start (data-phase="start")
- gameplay (data-phase="gameplay")
- results (data-phase="results")
- game_over (data-phase="game_over") -- only if lives > 0

## [Screen Name] (data-phase="[value]")

### Layout

+-----------------------------+
|  [element]        [element] |  <- describe position and content
|                             |
|        [element]            |  <- centered element
|                             |
|  [element]  [element]       |  <- grouped elements
|                             |
|        [element]            |  <- bottom element
+-----------------------------+

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| [name] | top-left | [what it shows] | no / tap / drag |

### Entry condition
How the player arrives at this screen.

### Exit condition
What the player does to leave this screen and where they go.

[Repeat for EVERY screen]

## Round Presentation Sequence

Within the gameplay screen, each round follows this sequence:
1. **Question preview** -- question text + any images render. Options NOT yet visible.
2. **Instructions** (conditional) -- shown on first round or when round type changes.
3. **Media** (conditional) -- audio/video plays if present. Skippable.
4. **Gameplay reveal** -- options/inputs fade in (350ms). Input unblocks.
```

**ASCII wireframe rules:**
- Draw a wireframe for EVERY screen, not just gameplay
- Show actual content examples (real question text, real option text), not placeholders
- Show element positions: top-left, top-center, top-right, center, bottom
- Show relative sizing: a progress bar is wide and thin, a question is large text centered
- Use box-drawing characters for the mobile viewport (375x667 proportions)
- Include the round presentation sequence for gameplay screens

## 3. round-flow.md Format

```markdown
# Round Flow: [Game Title]

## Round Types

List every distinct round type.

## Round Type: [Name]

### Step-by-step

1. **Round starts** -- [what renders]
2. **Student sees** -- [question preview content, instruction if applicable]
3. **Student acts** -- [tap option / type number / drag item / click cell]
4. **Correct path:**
   a. Selected option gets `.selected-correct` styling
   b. `playFeedback('correct', '[subtitle]')` fires
   c. `gameState.isProcessing = true` blocks input
   d. Score increments, score display bounces (scoreBounce 400ms)
   e. After 1500ms: current round fades out (300ms), next round fades in (350ms)
   f. `gameState.isProcessing = false`, input unblocks
5. **Wrong path:**
   a. Selected option gets `.selected-wrong` styling
   b. Correct option gets `.selected-correct` styling
   c. `.correct-reveal` shows "Answer: [correct answer]"
   d. `playFeedback('incorrect', '[subtitle]')` fires
   e. `gameState.isProcessing = true` blocks input
   f. [If lives game: life decremented, heart-break animation 600ms]
   g. [If lives = 0: transition to game_over screen after 2000ms]
   h. After 2000ms: current round fades out, next round fades in
   i. `gameState.isProcessing = false`, input unblocks
6. **Last round complete:**
   a. `playFeedback('victory', '[topic-specific praise]')` fires
   b. After 2000ms: transition to results screen

### State changes per step

| Step | gameState fields changed | DOM update |
|------|------------------------|------------|
| Round starts | currentRound incremented | syncDOM() called |
| Correct answer | score++, streak++ | score display, progress bar |
| Wrong answer | streak=0, lives-- (if applicable) | lives display, correct reveal |
| Last round | phase='results' | screen transition |
```

## 4. feedback.md Format

```markdown
# Feedback: [Game Title]

## Bloom Level: [L1/L2/L3/L4]

## Feedback Moment Table

| Moment | Trigger | FeedbackManager call | Subtitle template | Blocks input? | Duration | What happens after |
|--------|---------|---------------------|-------------------|---------------|----------|--------------------|
| Correct answer | Student selects correct option | `playFeedback('correct', subtitle)` | [from Bloom level] | Yes | 1500ms | Auto-advance |
| Wrong answer | Student selects wrong option | `playFeedback('incorrect', subtitle)` | [from Bloom level] | Yes | 2000ms | Show correct, auto-advance |
| Streak (3+) | 3+ consecutive correct | `playFeedback('correct', 'N in a row!')` | escalating | Yes | 1500ms | Auto-advance + streak glow |
| Victory | All rounds complete, score > 0 | `playFeedback('victory', subtitle)` | "Amazing [topic] skills!" | Yes | 2000ms | Results screen |
| Game over | Lives reach 0 | `playFeedback('gameover', subtitle)` | "Keep practicing [topic]!" | Yes | 2000ms | Game_over screen |

## Subtitle Examples

3 concrete examples per type using actual spec content.

## Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Score bounce | Correct answer | `.score-bounce` | 400ms |
| Shake | Wrong answer | `.shake-wrong` | 500ms |
| Heart break | Life lost | `.heart-break` | 600ms |
| Streak glow | 3+ streak | `.streak-glow` | 600ms |
| Star pop | Results star earned | `.star-earned` | 400ms |
| Fade in | New round appears | `.fade-in` | 350ms |

## Wrong Answer Handling

- Show correct answer: always
- Misconception-specific feedback: [yes/no]
- Failure recovery (3+ consecutive wrong): soften language, add hints

## Emotional Arc Notes

[Game-specific notes]
```

## 5. scoring.md Format

```markdown
# Scoring: [Game Title]

## Points

| Action | Points | Notes |
|--------|--------|-------|
| Correct answer | +1 | Per round |
| Wrong answer | 0 | No point penalty |

## Formula

score = number of correct answers
maxScore = total rounds
percentage = (score / maxScore) * 100

## Star Thresholds

| Stars | Threshold | Displayed as |
|-------|-----------|-------------|
| 3 stars | >= 90% | Three filled stars |
| 2 stars | >= 66% | Two filled, one empty |
| 1 star | >= 33% | One filled, two empty |
| 0 stars | < 33% | Three empty stars |

## Lives (if applicable)

| Parameter | Value |
|-----------|-------|
| Starting lives | [N] |
| Lives lost per wrong answer | 1 |
| Game over condition | lives = 0 |
| Lives display | [hearts/icons at top-right] |
| Life loss animation | heartBreak 600ms |

## Progress Bar

| Parameter | Value |
|-----------|-------|
| Tracks | Round number (currentRound / totalRounds) |
| Position | Bottom of gameplay screen |
| Style | Filled bar, left-to-right |
| Updates | After each round completes |

## Data Contract Fields

| Field | Source | Example value |
|-------|--------|---------------|
| score | gameState.score | 7 |
| totalQuestions | gameState.totalRounds | 9 |
| stars | calculated from percentage | 2 |
| accuracy | percentage | 78 |
| timeSpent | Date.now() - gameState.startTime | 45000 |
```
