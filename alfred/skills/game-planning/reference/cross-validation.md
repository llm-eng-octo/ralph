Step 7 cross-validation checks that catch inconsistencies between the 5 plan documents before they reach game-building.

## Cross-Validation Checklist

### 1. Screen consistency
Every screen in game-flow.md has a wireframe in screens.md and is reachable.

### 2. Round consistency
Every round type in round-flow.md appears in screens.md's gameplay wireframe.

### 3. Feedback consistency
Every feedback moment in feedback.md corresponds to a step in round-flow.md.

### 4. Scoring consistency
The scoring formula in scoring.md matches the state changes in round-flow.md (e.g., if round-flow says score++ on correct, scoring.md must say +1 per correct).

### 5. Lives/game_over consistency
If scoring.md defines lives, then:
- game-flow.md must have a game_over screen
- screens.md must have a game_over wireframe
- round-flow.md must have the lives=0 branch
- feedback.md must have the gameover moment

### 6. Data contract consistency
Fields in scoring.md match what data-contract requires for recordAttempt and game_complete.

---

## Good vs Bad Plan Examples

### Vague wireframes

**Bad:**
```
The start screen has a title, a subtitle, and a play button.
```

**Good:**
```
+-----------------------------+
|                             |
|                             |
|      "Ratio Explorer"       |  <- title, centered, large
|   "Identify equivalent      |
|    ratios in 9 rounds"      |  <- subtitle, centered, smaller
|                             |
|                             |
|      [ Let's Go! ]          |  <- button, centered, primary style
|                             |
|                             |
+-----------------------------+
```

Why: The bad version forces game-building to decide element positions. The good version eliminates all layout guessing.

### Missing the wrong path

**Bad:**
```
Round flow:
1. Question appears
2. Student taps an option
3. Feedback plays
4. Next round
```

**Good:**
```
Round flow:
1. Question appears with 4 options
2. Student taps an option
3a. CORRECT: .selected-correct on option, await FeedbackManager.sound.play('correct_sound_effect', {sticker}), score++, auto-advance
3b. WRONG: .selected-wrong on tap, .selected-correct on correct option, .correct-reveal shows answer, await FeedbackManager.sound.play('incorrect_sound_effect', {sticker}), stay on round
4. Next round fades in (350ms)
```

Why: The bad version has one path. The good version has two. Every interaction has at least two outcomes, and both must be fully specified.

### Prose instead of tables

**Bad:**
```
The game awards one point for each correct answer. Stars are given based on the percentage score, with three stars for 90% or higher, two stars for 66% or higher, and one star for 33% or higher.
```

**Good:**

| Action | Points |
|--------|--------|
| Correct answer | +1 |
| Wrong answer | 0 |

| Stars | Threshold |
|-------|-----------|
| 3 | >= 90% |
| 2 | >= 66% |
| 1 | >= 33% |
| 0 | < 33% |

Why: Tables are scannable. Prose requires re-reading to extract values. game-building.md parses tables, not paragraphs.

### Copying the spec instead of deriving from it

**Bad:** Pasting spec sections into plan docs and reformatting them.

**Good:** Reading the spec, identifying the archetype, applying the archetype's structural skeleton, overriding with spec-specific values, and producing a plan that is structurally consistent with the archetype.

Why: The spec describes intent. The plan describes structure. If the plan reads like the spec, it has not added any value.

### Omitting the round presentation sequence

**Bad:** Jumping straight from "question appears" to "student taps option" with no mention of what loads first, whether options are visible during preview, or how the round transitions in.

**Good:** Documenting all 4 phases (preview, instructions, media, gameplay reveal) with which phases apply to each round type, what is visible during each phase, and whether input is blocked.

Why: The round presentation sequence determines the rhythm of the game. It is the #1 source of "the game feels off" feedback.

### Inventing feedback not in the spec

**Bad:** Adding hints, encouragement popups, tutorial overlays, or "Did you know?" cards that the spec never mentioned.

**Good:** Implementing exactly the feedback moments that the archetype and spec define. If the spec has no hints, the plan has no hints.

Why: Every added feature is a potential build failure. Plans implement the spec, period.

### Ambiguous timing

**Bad:** "After the feedback plays, advance to the next round."

**Good:** "After 1500ms (correct) or 2000ms (wrong), fade out current round (300ms), fade in next round (350ms), unblock input."

Why: "After the feedback plays" could be 500ms or 5000ms. Exact millisecond values eliminate this class of bug entirely.
