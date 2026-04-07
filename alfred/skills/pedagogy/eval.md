# Eval: Pedagogy

Tests for `skills/pedagogy/SKILL.md` -- the skill that determines Bloom level, scaffolding, misconception-aware distractors, difficulty calibration, and emotional safety for a game spec.

## Version

v1 -- 2026-04-04 -- initial eval with priority tags, checklist format, judge types

## Setup

Context files that must be loaded before running:

- `skills/pedagogy/SKILL.md` (Bloom mapping, misconception taxonomy, difficulty tuning, scaffolding)
- `skills/game-archetypes.md` (archetype profiles referenced by Bloom mapping)
- `skills-taxonomy.md` (creator defaults, structure types)

## Success Criteria

A pedagogy output passes when ALL of the following are true:

1. **Bloom level correct.** Matches the spec's stated level, or correctly inferred from verbs.
2. **Bloom-to-game mapping followed.** Structure, scoring, feedback, scaffolding, lives, pacing all match the Bloom level's lookup table.
3. **Misconception distractors are real.** Every distractor maps to a named misconception -- no random wrong numbers.
4. **Difficulty curve is progressive.** Stage N+1 is harder than Stage N on exactly one dimension.
5. **Emotional safety respected.** No punitive language. Feedback tone matches Bloom level.
6. **Indian curriculum aligned.** Content appropriate for the specified Class level and NCERT/state board scope.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Clear L3 Apply game -- full Bloom mapping

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Game: "Find the Area"
Topic: Area of triangles
Class: 7
Bloom: L3 Apply
Student solves: given base and height, calculate area.
9 rounds, 3 stages, 3 lives.
```

**Expect:**

- [ ] Bloom level = L3 Apply (explicitly stated)
- [ ] Recommended structure includes Lives Challenge (L3 table)
- [ ] Lives = 3 (L3 default)
- [ ] Scoring = +1 per correct, -1 life per wrong, stars at 90/66/33%
- [ ] Feedback style = corrective with procedural hint ("The area of a triangle is (base x height) / 2")
- [ ] Scaffolding = nudge after 1st wrong, first step after 2nd, full solution after 3rd
- [ ] Pacing = 15-30 seconds per question
- [ ] [LLM] Distractors include MISC-GEO-02 (forgets to halve: base x height without /2)
- [ ] [LLM] Difficulty progression: Stage 1 = integer base/height, Stage 2 = decimal values or larger numbers, Stage 3 = composite shapes or unfamiliar context

**Why:** Tests the complete L3 Apply mapping with a geometry topic that has well-known misconceptions.

---

### Case 2: No Bloom level stated -- verb inference required

**Priority:** P0
**Type:** default-behavior
**Judge:** llm

**Input:**

```
Game: "Name the Shape"
Topic: Identifying 2D shapes
Class: 5
Student sees a shape, picks its name from 4 options.
```

**Expect:**

- [ ] Bloom level inferred as L1 Remember (verbs: "identify", "name")
- [ ] Recommended structure = MCQ Quiz or No-Penalty Explorer
- [ ] Lives = 0 (L1: no lives)
- [ ] Feedback = immediate, show correct answer, no explanation needed
- [ ] Scaffolding = show answer immediately after wrong (no hint system)
- [ ] Pacing = 3-5 seconds per question (fast drill)
- [ ] [LLM] Star thresholds at 90/70/40% (L1 values, not default 90/66/33)
- [ ] [LLM] Explanation for inference: "identify" and "name" are L1 verbs

**Why:** Tests Bloom inference from spec verbs when no explicit level is given. Critical for specs that omit Bloom level.

---

### Case 3: Misconception-aware distractor design

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Game: "Add Fractions"
Topic: Adding fractions with unlike denominators
Class: 6
Bloom: L3 Apply
Sample question: What is 2/3 + 1/4?
Correct answer: 11/12
Generate 3 distractors.
```

**Expect:**

- [ ] Distractor 1 maps to MISC-FRAC-01 (adds numerators and denominators: 3/7)
- [ ] Distractor 2 maps to MISC-FRAC-02 (finds LCD but doesn't convert numerators: 3/12)
- [ ] Distractor 3 maps to MISC-FRAC-03 (converts only one fraction: 9/12 or 8/12)
- [ ] Each distractor has: misconception_tag, misconception_name, misconception_explanation
- [ ] No distractor is a random wrong number
- [ ] No distractor duplicates another misconception
- [ ] [LLM] Explanations are pedagogically correct and address the specific error
- [ ] [LLM] No distractor uses "none of the above"

**Why:** Tests the core misconception-aware distractor design process against the documented taxonomy.

---

### Case 4: Bloom level contradicts interaction type

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Game: "Quick Recall Fractions"
Topic: Equivalent fractions
Class: 6
Bloom: L1 Remember
Interaction: drag-and-drop sorting (sort fractions into "equivalent to 1/2" and "not equivalent")
```

**Expect:**

- [ ] WARNING: Bloom L1 + sorting interaction is a mismatch (sorting is typically L2 Understand)
- [ ] Skill does NOT silently override the stated Bloom level
- [ ] Output uses the L1 Remember parameters (no lives, fast pacing, show-answer feedback)
- [ ] Notes explain the mismatch and recommend the creator consider L2
- [ ] [LLM] Scaffolding follows L1 rules (immediate reveal) despite sort interaction
- [ ] [LLM] The warning is constructive, not blocking

**Why:** Tests that the skill warns about Bloom-interaction mismatches but respects creator intent, matching the spec-creation skill's philosophy.

---

### Case 5: Cross-skill -- pedagogy output feeds spec-creation

**Priority:** P1
**Type:** cross-skill
**Judge:** llm

**Input:**

```
Game: "Ratio Scaler"
Topic: Scaling ratios proportionally
Class: 6
Bloom: L2 Understand
9 rounds, no lives, MCQ format.
```

**Expect:**

- [ ] Output contains all fields needed by spec-creation: Bloom level, structure recommendation, scaffolding pattern, lives/scoring policy, feedback style, difficulty curve, misconception map
- [ ] Feedback style = corrective with brief explanation (L2)
- [ ] Difficulty progression defined with exactly one dimension changing per stage
- [ ] Misconception map includes at least: additive reasoning (MISC-RATIO-01 or similar)
- [ ] [LLM] Pacing recommendation (8-15 sec) is compatible with MCQ Quiz archetype
- [ ] [LLM] Stars at 90/66/33% (L2 values)
- [ ] [LLM] Output is structured enough that spec-creation can consume it without re-deriving any pedagogical decision

**Why:** Tests that pedagogy output is complete and structured for downstream consumption by spec-creation.

---

### Case 6: Difficulty tuning -- 70-85% target validation

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Game: "Algebra Basics"
Topic: Solving one-step linear equations (x + 3 = 7)
Class: 7
Bloom: L3 Apply
Analytics data: current pass rate = 45% (too hard)
```

**Expect:**

- [ ] Pass rate flagged as below 70% threshold
- [ ] Recommendation to reduce difficulty OR add scaffolding
- [ ] Specific suggestions: simpler numbers in Stage 1, add hint system, reduce to 2 stages
- [ ] Target stage rates cited: Stage 1 = 90%, Stage 2 = 75%, Stage 3 = 60%
- [ ] [LLM] Does NOT recommend removing lives or changing Bloom level (those are creator decisions)
- [ ] [LLM] Suggestions address difficulty dimensions, not structural changes

**Why:** Tests the difficulty calibration feedback loop -- when analytics show a game is too hard, the skill must provide actionable tuning recommendations.

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
| Case 1: L3 Apply mapping | P0 | PASS |
| Case 2: Bloom inference | P0 | PASS |
| Case 3: Distractor design | P0 | PASS |
| Case 4: Bloom-interaction mismatch | P1 | PASS or PARTIAL |
| Case 5: Cross-skill output | P1 | PASS or PARTIAL |
| Case 6: Difficulty tuning | P1 | PASS or PARTIAL |
