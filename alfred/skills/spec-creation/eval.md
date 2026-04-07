# Eval: Spec Creation

Tests for `skills/spec-creation.md` — the skill that generates a game spec from a creator's game description.

## Version

v2 — 2026-04-06 — added priority tags, checklist format, judge types, setup, edge/negative cases

## Setup

Context files that must be loaded before running:

- `skills/game-archetypes.md` (10 archetype profiles)
- `skills/pedagogy/SKILL.md` (Bloom mapping, misconception design)
- `skills-taxonomy.md` (creator defaults table)

## Success Criteria

A spec passes when ALL of the following are true:

1. **Maps to an archetype.** The spec clearly corresponds to one of the 10 game archetype profiles.
2. **All required sections present.** Game identity, mechanics, rounds/progression, scoring, feedback, content structure.
3. **Defaults applied when input is vague.** Flagged as defaulted.
4. **Educationally sound.** Bloom level appropriate. Distractors target named misconceptions.
5. **Buildable.** No ambiguous phrases. An engineer can build from the spec without guessing.
6. **Data-ready.** Content includes misconception tags. Round structure supports per-round analytics.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Clear, complete input

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Make a game called "Scale It Up" for Grade 5 ratio intuition.
Kid sees a ratio (e.g., "for every 2 spoons tea, 1 spoon sugar"),
then predicts the missing number when quantities scale up.
Two round types: fill-in-the-blank (type a number) and
"will it work?" (yes/no then explain why).
10 rounds, 3 lives, 3 stages of difficulty.
```

**Expect:**

- [ ] Archetype identified as Lives Challenge (rounds + lives + mixed input)
- [ ] Interaction types include number input (Type A) AND MCQ binary + follow-up (Type B)
- [ ] 10 rounds explicitly listed with stage assignments (Stage 1: R1-3, Stage 2: R4-7, Stage 3: R8-10 or similar)
- [ ] Scoring defined: +1 per correct, stars at 9-10 / 6-8 / 1-5
- [ ] Lives = 3
- [ ] Each Type B round specifies: original ratio, changed scenario, correct answer, two explanation options
- [ ] Difficulty progression across stages (easy ratios → harder ratios → full prediction)
- [ ] [LLM] Additive trap explicitly named as a misconception
- [ ] Feedback behavior specified per round type

**Why:** Happy path — creator gives enough detail. Tests correct structuring.

---

### Case 2: Vague input, defaults must fill gaps

**Priority:** P0
**Type:** default-behavior
**Judge:** llm

**Input:**

```
Make a math game about fractions for Class 6.
```

**Expect:**

- [ ] Archetype defaults to MCQ Quiz
- [ ] Bloom level defaults to L2 Understand
- [ ] Interaction defaults to MCQ single
- [ ] Rounds defaults to 9 (3 per stage)
- [ ] Lives defaults to 0 (no-penalty, because L2)
- [ ] Scoring defaults to +1 per correct, stars at 90/66/33%
- [ ] Timer defaults to none
- [ ] Output contains a "Defaults applied" section or flag listing what was assumed
- [ ] [LLM] Content is fraction-related (not generic math)
- [ ] [LLM] Fallback content rounds are educationally reasonable for Class 6 fractions

**Why:** Tests default application and transparency about assumptions.

---

### Case 3: Input contradicts guidelines

**Priority:** P0
**Type:** error-handling
**Judge:** llm

**Input:**

```
Make a drag-and-drop sorting game about classifying triangles.
It should be timed (30 seconds per round), have 5 lives, and
use Bloom L1 Remember. 20 rounds.
```

**Expect:**

- [ ] Archetype = Sort/Classify
- [ ] Timer = 30 seconds (creator's value, not overridden)
- [ ] Lives = 5 (creator's value, not overridden to default 3)
- [ ] Bloom = L1 Remember (creator's value preserved)
- [ ] WARNING present about Bloom-interaction mismatch (sorting is typically L2, not L1)
- [ ] WARNING present about 20 rounds exceeding default 9
- [ ] WARNING present about 5 lives being unusual with L1
- [ ] [LLM] Spec respects creator intent — does NOT silently override choices

**Why:** Tests that the skill warns but doesn't override. Creator authority respected.

---

### Case 4: Non-standard interaction type

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Make a number line estimation game. Student sees a fraction like 3/4
and drags a marker to the right spot on a number line from 0 to 1.
Scored by distance from correct position. 8 rounds.
```

**Expect:**

- [ ] Interaction flagged as "estimation" (non-standard, not one of the 10 types)
- [ ] Scoring defined as distance-based with explicit thresholds (what counts as correct?)
- [ ] Partial credit addressed (close but not exact)
- [ ] Rounds = 8
- [ ] [LLM] Content progresses from easy (1/2, 1/4) to hard (3/7, 5/8)
- [ ] Spec does NOT force it into MCQ or reject it

**Why:** Tests adaptation to interaction types beyond the standard set.

---

### Case 5: Worked example archetype

**Priority:** P1
**Type:** happy-path
**Judge:** llm

**Input:**

```
Make a worked example game for solving quadratic equations using
the quadratic formula. Show the full solution first, then fade
steps, then student does it independently. Class 10.
```

**Expect:**

- [ ] Archetype = Worked Example
- [ ] Structure = 3 phases (example → faded → practice)
- [ ] Bloom = L2 Understand
- [ ] No lives (worked examples are learning, not testing)
- [ ] No timer
- [ ] [LLM] Quadratic formula steps explicitly listed (identify a/b/c → substitute → discriminant → solve)
- [ ] Feedback defined per-step, not per-round

**Why:** Tests non-MCQ archetype with fundamentally different structure.

---

### Case 6: Session-level input (not a single game)

**Priority:** P2
**Type:** cross-skill
**Judge:** llm

**Input:**

```
Make a trigonometry session for Class 10. Start with identifying sides,
then recognizing ratios, then a worked example, then independent practice
finding sides, then real-world word problems.
```

**Expect:**

- [ ] Recognized as a session, NOT a single game
- [ ] FLAG present: "This describes a session of 5 games"
- [ ] Session plan produced with ordered list of games
- [ ] [LLM] Bloom progression logical (L1 → L2 → L2 → L3 → L4)
- [ ] Each game has: suggested archetype, interaction type, Bloom level
- [ ] [LLM] Prerequisite dependencies noted

**Why:** Tests session-vs-game detection and handoff.

---

### Case 7: Mixed language input (Hindi/English)

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Mean, median, mode ke liye ek game banao. Class 9 ke liye.
Student ko data set dikhao aur unse mean calculate karwao.
```

**Expect:**

- [ ] Spec generated in English
- [ ] Content about mean/median/mode for Class 9
- [ ] FLAG about Hindi input detected
- [ ] [LLM] Content appropriate for Indian Class 9 statistics curriculum
- [ ] Suggestion to consider bilingual math vocabulary support

**Why:** Real Indian creators mix Hindi and English.

---

### Case 8: Empty input

**Priority:** P0
**Type:** negative
**Judge:** auto

**Input:**

```
```

**Expect:**

- [ ] Does NOT produce a spec
- [ ] Asks for more information
- [ ] Does NOT crash or produce empty/placeholder output

**Why:** Defensive case — skill must handle empty input gracefully.

---

### Case 9: Impossible scope

**Priority:** P1
**Type:** negative
**Judge:** llm

**Input:**

```
Make a single game that teaches all of Class 10 mathematics
including algebra, geometry, trigonometry, statistics, and
probability. It should cover 200 concepts in 10 rounds.
```

**Expect:**

- [ ] Does NOT produce a 200-concept game
- [ ] Pushes back on scope: "This is too broad for a single game"
- [ ] [LLM] Suggests breaking into multiple games or a session
- [ ] [LLM] Offers to focus on one concept/chapter as a starting point

**Why:** Tests that the skill refuses unreasonable requests constructively.

---

### Case 10: Non-math input

**Priority:** P1
**Type:** negative
**Judge:** auto

**Input:**

```
Make a game about the history of the Mughal Empire for Class 7.
```

**Expect:**

- [ ] FLAGS that this is not a math game
- [ ] Either refuses or asks for clarification
- [ ] Does NOT silently produce a history game spec

**Why:** Pipeline is for math games. Non-math input should be caught.

---

## Eval Scoring

| Result | Meaning |
|--------|---------|
| PASS | All assertions in Expect checklist pass |
| PARTIAL | Some assertions fail — note which ones |
| FAIL | Critical assertions fail or output is fundamentally wrong |

## Ship Gate Check

| Case | Priority | Required result |
|------|----------|----------------|
| Case 1: Clear input | P0 | PASS |
| Case 2: Vague input | P0 | PASS |
| Case 3: Contradicts guidelines | P0 | PASS |
| Case 8: Empty input | P0 | PASS |
| Case 4: Non-standard interaction | P1 | PASS or PARTIAL |
| Case 5: Worked example | P1 | PASS or PARTIAL |
| Case 7: Mixed language | P1 | PASS or PARTIAL |
| Case 9: Impossible scope | P1 | PASS or PARTIAL |
| Case 10: Non-math | P1 | PASS or PARTIAL |
| Case 6: Session input | P2 | Any |
