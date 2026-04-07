# Eval: Game Archetypes

Tests for `skills/game-archetypes.md` -- the skill that identifies the correct archetype profile from a game description.

## Version

v1 -- 2026-04-04 -- initial eval with priority tags, checklist format, judge types

## Setup

Context files that must be loaded before running:

- `skills/game-archetypes.md` (10 archetype profiles + decision tree)
- `skills-taxonomy.md` (structure types, input types, PART flags)

## Success Criteria

An archetype match passes when ALL of the following are true:

1. **Correct archetype selected.** The output names the right profile from the 10 defined archetypes.
2. **All profile fields present.** archetype, structure, interaction, scoring, feedback, screens, part_flags, defaults, confidence, notes.
3. **Screen state machine matches the profile.** Screens listed are exactly those required by the profile (plus any spec-justified additions).
4. **PART flags are complete.** Every flag required by the profile is listed. No extraneous flags unless spec-justified.
5. **Defaults applied correctly.** Spec values override archetype defaults. Silent fields use archetype defaults.
6. **Confidence level accurate.** HIGH for exact match, MEDIUM for close match with deviations, CUSTOM for no match.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Clear MCQ Quiz input

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
A quiz game about identifying types of angles (acute, right, obtuse)
for Class 6. Show an angle diagram, student picks the type from 4 options.
9 rounds, 3 stages of difficulty.
```

**Expect:**

- [ ] Archetype = MCQ Quiz (#1)
- [ ] Confidence = HIGH
- [ ] Interaction = MCQ single-select
- [ ] Rounds = 9, Lives = 0, Timer = 0
- [ ] Screen state machine = start -> gameplay -> results (no game_over)
- [ ] PART-006 (timer) is NOT included
- [ ] PART-017 (FeedbackManager) IS included
- [ ] Stars thresholds at 90%/66%/33%
- [ ] [LLM] Notes section is empty or minimal (no deviations needed)

**Why:** Canonical MCQ Quiz -- tests the most common archetype path.

---

### Case 2: Ambiguous input requiring decision tree

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
A fraction game where students solve problems like "What is 2/3 + 1/4?"
They type their answer. 3 lives, 9 rounds, Class 7.
```

**Expect:**

- [ ] Archetype = Lives Challenge (#3)
- [ ] Confidence = HIGH
- [ ] Interaction includes number input
- [ ] Lives = 3, Rounds = 9
- [ ] Screen state machine includes game_over screen (lives > 0)
- [ ] PART flags include all Lives Challenge required flags
- [ ] [LLM] Decision tree correctly prioritizes lives presence over MCQ default

**Why:** Tests the lives-detection branch of the decision tree. Number input + lives = Lives Challenge, not MCQ Quiz.

---

### Case 3: Missing key details -- defaults must fill gaps

**Priority:** P0
**Type:** default-behavior
**Judge:** llm

**Input:**

```
A game about classifying triangles by their sides.
```

**Expect:**

- [ ] Archetype identified (Sort/Classify or No-Penalty Explorer -- both defensible)
- [ ] Rounds defaults applied (6 for Sort/Classify, 9 for Explorer)
- [ ] Lives = 0 (default for both)
- [ ] Timer = 0 (default)
- [ ] Bloom level inferred as L2 (classify verb)
- [ ] Confidence = MEDIUM (insufficient detail for HIGH)
- [ ] Notes explain which signals were missing and what was assumed
- [ ] [LLM] Output does NOT leave any field blank or unspecified

**Why:** Tests graceful handling of minimal input with transparent default application.

---

### Case 4: Multi-archetype ambiguity (Sort/Classify vs Construction)

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Students see number cards (1-9) and drag them into slots to build
a valid equation like ___ + ___ = ___. 6 rounds, Class 5.
```

**Expect:**

- [ ] Archetype = Construction (#7), NOT Sort/Classify
- [ ] [LLM] Disambiguated correctly: student builds something from parts (Construction), not categorizes existing items (Sort/Classify)
- [ ] PART-033 (drag interaction) included
- [ ] Rounds = 6 (spec value overrides default)
- [ ] Confidence = HIGH
- [ ] Screen state machine = start -> gameplay -> results

**Why:** Tests the Sort/Classify vs Construction disambiguation rule: "Sort = items exist, student categorizes. Construction = student builds something new from parts."

---

### Case 5: Cross-skill compatibility -- output feeds spec-creation

**Priority:** P1
**Type:** cross-skill
**Judge:** llm

**Input:**

```
A speed game where students identify if a number is prime or composite.
60 second timer, as many as possible. Class 7.
```

**Expect:**

- [ ] Archetype = Speed Blitz (#2)
- [ ] Timer = 60 (spec value)
- [ ] Rounds = 0 (unlimited -- timer is the constraint)
- [ ] PART-006 (timer) IS included
- [ ] Scoring mentions streak bonus
- [ ] Feedback delay = 0.5s (Speed Blitz pacing)
- [ ] [LLM] Output contains all fields needed by spec-creation.md: archetype, structure, interaction, scoring, feedback, screens, part_flags, defaults
- [ ] [LLM] No downstream skill would need to guess or re-derive any structural decision

**Why:** Tests that the archetype output is complete enough for the next skill in the chain (spec-creation) to consume without gaps.

---

### Case 6: No-match input -- custom archetype procedure

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
A game where students watch a short animation of a ball rolling down
ramps of different slopes, then predict where the ball will stop using
estimation. They draw a line on screen to mark their prediction.
No rounds -- one continuous simulation. Class 9 physics-math crossover.
```

**Expect:**

- [ ] Confidence = CUSTOM (no archetype matches)
- [ ] Closest archetype identified (Board Puzzle or Tracking/Attention)
- [ ] Every deviation from closest profile is documented
- [ ] Screen state machine derived from scratch (not copied from closest profile)
- [ ] PART flags derived from first principles
- [ ] Warning present: downstream skills must apply extra validation
- [ ] [LLM] Output does NOT force the game into a standard archetype

**Why:** Tests the custom archetype procedure -- the skill must recognize when no profile fits and follow the documented fallback process.

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
| Case 1: Clear MCQ Quiz | P0 | PASS |
| Case 2: Ambiguous lives input | P0 | PASS |
| Case 3: Missing details | P0 | PASS |
| Case 4: Sort vs Construction | P1 | PASS or PARTIAL |
| Case 5: Cross-skill output | P1 | PASS or PARTIAL |
| Case 6: Custom archetype | P1 | PASS or PARTIAL |
