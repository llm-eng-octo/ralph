# Eval: Feedback

Tests for `skills/feedback.md` -- the skill that defines audio, visual, text feedback, timing, emotional design, and micro-animations for student interactions.

## Version

v1 -- 2026-04-04 -- initial eval with priority tags, checklist format, judge types

## Setup

Context files that must be loaded before running:

- `skills/feedback.md` (FeedbackManager API, Bloom-level feedback, timing rules, emotional arc)
- `skills/game-archetypes.md` (archetype determines pacing defaults)
- `skills/pedagogy/SKILL.md` (Bloom level determines feedback depth)

## Success Criteria

A feedback specification passes when ALL of the following are true:

1. **FeedbackManager API used correctly.** playDynamicFeedback called with valid type, subtitle under 60 characters.
2. **Every event has a response.** No student action is silent -- correct, wrong, streak, victory, gameover all handled.
3. **Timing is exact.** Correct = 1500ms, wrong = 2000ms, L4 correct = 2000ms, victory/gameover = 2000ms.
4. **Input blocked during feedback.** isProcessing set before playFeedback, cleared in setTimeout callback.
5. **Emotional safety maintained.** No punitive language, wrong answers always show correct answer, game-over is encouraging.
6. **Auto-advance implemented.** Feedback -> fade out -> next round -> fade in -> unblock, with no "Next" button.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Standard MCQ correct/wrong feedback flow

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: MCQ Quiz
Bloom: L2 Understand
Topic: Classifying triangles
PART-017: YES

Round: "A triangle has sides 5cm, 5cm, 8cm. What type is it?"
Correct answer: Isosceles
Student selects: Equilateral (wrong)
```

**Expect:**

- [ ] playFeedback('incorrect', ...) called with L2 subtitle format: "It's Isosceles. Two sides are equal, not three."
- [ ] Subtitle is under 60 characters
- [ ] isProcessing = true set BEFORE playFeedback call
- [ ] Wrong option marked with .selected-wrong CSS class
- [ ] Correct option marked with .selected-correct CSS class
- [ ] .correct-reveal element shows "Answer: Isosceles"
- [ ] Duration = 2000ms (wrong answer)
- [ ] After 2000ms: fade out (300ms) -> next round renders -> fade in (350ms) -> isProcessing = false
- [ ] [LLM] Subtitle explains WHY (L2 requirement), not just WHAT

**Why:** Tests the complete wrong-answer feedback chain for the most common game type and Bloom level.

---

### Case 2: Missing PART-017 -- graceful degradation

**Priority:** P0
**Type:** error-handling
**Judge:** llm

**Input:**

```
Archetype: MCQ Quiz
Bloom: L1 Remember
PART-017: NO (FeedbackManager not available)

Student answers correctly.
```

**Expect:**

- [ ] playFeedback wrapper called -- try/catch silently skips FeedbackManager
- [ ] Game does NOT crash or show an error
- [ ] Visual-only feedback: .selected-correct CSS class applied
- [ ] No custom overlay built (constraint 1: never build custom feedback overlays)
- [ ] Timing still enforced: 1500ms before auto-advance
- [ ] isProcessing still set and cleared on schedule
- [ ] [LLM] Game remains fully playable without FeedbackManager

**Why:** Tests graceful degradation when the CDN package is unavailable -- a real production scenario.

---

### Case 3: Bloom L4 Analyze feedback -- metacognitive prompting

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: Board Puzzle
Bloom: L4 Analyze
Topic: Comparing data representations
PART-017: YES

Student submits an incorrect analysis.
```

**Expect:**

- [ ] playFeedback('incorrect', ...) called
- [ ] Subtitle uses L4 template: "What could you check? [reflective prompt]. The answer is [answer]."
- [ ] Duration = 2000ms (L4 wrong AND L4 correct both use 2000ms)
- [ ] Feedback includes a metacognitive question before revealing the answer
- [ ] [LLM] Tone is analytical ("What could you check?"), not punitive
- [ ] [LLM] Subtitle does NOT just show the answer (L4 requires reasoning path)
- [ ] Scaffolding after 1st wrong = metacognitive prompt, not answer reveal

**Why:** Tests L4-specific feedback behavior which differs significantly from L1-L3 (ask-back pattern, longer duration for correct, analytical tone).

---

### Case 4: Streak celebration and failure recovery

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Archetype: Lives Challenge
Bloom: L3 Apply
PART-017: YES

Sequence: 4 correct answers in a row, then 3 wrong answers in a row.
```

**Expect:**

- [ ] After 3rd consecutive correct: subtitle includes streak message ("3 in a row!" or similar)
- [ ] After 4th consecutive correct: escalated streak ("4 in a row! On fire!")
- [ ] Streak glow animation (.streak-glow CSS class) applied to score area
- [ ] Streak counter resets to 0 on first wrong answer
- [ ] After 3rd consecutive wrong: subtitle softens ("This is a tough one. ...")
- [ ] Language never escalates in severity -- 3rd wrong is as warm as 1st wrong
- [ ] [LLM] Failure recovery does NOT change the game mechanics (no auto-hints unless spec supports them)
- [ ] [LLM] consecutiveWrongs counter tracked correctly

**Why:** Tests the emotional arc mechanics -- streak celebration and failure recovery are the key differentiators between "exam" and "game."

---

### Case 5: Cross-skill -- feedback timing compatible with data-contract

**Priority:** P1
**Type:** cross-skill
**Judge:** llm

**Input:**

```
Archetype: MCQ Quiz
Bloom: L2 Understand
PART-017: YES

Student answers correctly on round 3.
```

**Expect:**

- [ ] recordAttempt called with correct = true (data-contract schema)
- [ ] recordAttempt includes response_time_ms (time from question display to submission)
- [ ] playFeedback('correct', ...) called after recordAttempt
- [ ] syncDOM() called after score increment (data-contract requirement)
- [ ] trackEvent('answer_submitted', ...) fired with round and correct fields
- [ ] isProcessing blocks any additional taps during 1500ms feedback window
- [ ] [LLM] Sequence is: record attempt -> update score -> syncDOM -> play feedback -> wait 1500ms -> advance round
- [ ] [LLM] No data-contract field is stale during the feedback window

**Why:** Tests that feedback timing and data-contract obligations work together -- recordAttempt must fire before feedback, syncDOM must reflect score during feedback.

---

## Eval Scoring

| Result | Meaning |
|--------|---------|
| PASS | All assertions in Expect checklist pass |
| PARTIAL | Some assertions fail -- note which ones |
| FAIL | Critical assertions fail or output is fundamentally wrong |

## Ship Gate Check

| Case | Priority | Required result |
|------|----------|----------------|
| Case 1: MCQ correct/wrong flow | P0 | PASS |
| Case 2: Missing PART-017 | P0 | PASS |
| Case 3: Bloom L4 feedback | P0 | PASS |
| Case 4: Streak and recovery | P1 | PASS or PARTIAL |
| Case 5: Cross-skill timing | P1 | PASS or PARTIAL |
