# Session Plan: Statistics — Bloom-Ladder Session (Class 9/10)

**Session ID:** `stats-class9-20260323-4k2mxp`
**Generated:** 2026-03-23
**Concept:** statistics — measures of central tendency
**Grade level:** Class 9 / Class 10
**Estimated total time:** 43 minutes
**Bloom range:** L1 → L4
**Research complete:** Yes

---

## Standard Statement

> CBSE Class 9 Mathematics Chapter 14 "Statistics" — Students should be able to find mean, median, and mode of ungrouped data and select the appropriate measure for a given real-world context. Corresponds to NCERT Class 9 Ch 14 §14.2–§14.4 (Mean, Median, Mode of Ungrouped Data) and NCERT Class 10 Ch 14 §14.4 (relationship between Mean, Median and Mode; appropriate use by context). Grouped data mode formula (Class 10 Ch 13 §13.3) addressed in stats-mode Hard tier.

## Curriculum Chapter

**NCERT Class 9 Chapter 14 — Statistics** (primary anchor for Games 1–4)

Sections:
- §14.1 Introduction — why we collect data; differences between data types
- §14.2 Mean of Ungrouped Data — direct method: Mean = Σxi / n
- §14.3 Median of Ungrouped Data — sort, middle value rule; even-n averaging
- §14.4 Mode of Ungrouped Data — most frequent value; bimodal datasets
- Empirical formula: 3 × Median = Mode + 2 × Mean (Class 10 Ch 14 also)

**NCERT Class 10 Chapter 13 §13.3 — Mode of Grouped Data** (Hard tier of stats-mode)

Grouped mode formula: `Mode = L + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × h`

**NCERT Class 10 Chapter 14 §14.4 — When to Use Each Measure** (terminal game stats-which-measure)

## Prerequisite Chain

- Class 6 — Basic arithmetic: addition, division of whole numbers
- Class 7 — Introduction to data handling: tally marks, bar graphs, frequency tables
- Class 8 — Data handling: mean of small datasets (pre-exposure), pie charts
- Class 9 §14.2 — Mean (direct method) → §14.3 Median → §14.4 Mode
- Class 10 §13.3 — Grouped data mode formula (prerequisite for stats-mode Hard tier only)

## Game Sequence

| Position | Game ID | Bloom L | Bloom Label | Title | Misconception Targeted | Minutes |
|----------|---------|---------|-------------|-------|------------------------|---------|
| 1 | stats-identify-class | L1 | Remember | Which Measure? | Using mean for all data types regardless of outliers or data level | 6 min |
| 2 | stats-mean-direct | L2–L3 | Understand + Apply | Mean Machine | Forgetting to divide by n; dividing by wrong n; selecting mode/median instead of mean | 8 min |
| 3 | stats-median | L3 | Apply | Middle Ground | Finding middle value without sorting first; even-n — picking one middle value instead of averaging | 8 min |
| 4 | stats-mode | L3 | Apply | Most Common | Mean-mode confusion; missing second mode in bimodal data; formula variable substitution errors (grouped) | 8 min |
| 5 | stats-which-measure | L4 | Analyze | Measure Selector | Defaulting to mean regardless of context; ignoring outliers; using mean for categorical data | 13 min |

**Total:** 5 games, 43 minutes

---

## Pedagogical Rationale for Game Sequence

### Why this order

The session follows a strict prerequisite–complexity ladder:

1. **stats-identify-class (L1 Remember) comes first** — before any computation is attempted, students must understand *what each measure is for*. This activates schema for all three measures simultaneously and prevents the most damaging misconception: treating mean as the universal default. The worked-example panel (Measure Selector reference card) on first wrong attempt gives students a reference they will recall during later computation games.

2. **stats-mean-direct (L2–L3) before median** — Mean is the simplest algorithm (sum ÷ count). NCERT presents it first (§14.2). Students who can reliably compute mean have the prerequisite for understanding why median is preferred when mean is distorted by outliers — the contrast is only pedagogically visible after mean is fluent.

3. **stats-median (L3) before mode** — Median requires sorting, which is a precondition for understanding mode in sorted lists. Presenting median second makes the sorting habit automatic before it is needed (but not for mode selection, since mode is about frequency, not position).

4. **stats-mode (L3) before the synthesis game** — Mode is the final computational skill. Hard-tier rounds introduce the grouped data formula (Class 10 §13.3) as the most algebraically demanding step in the session. Placing this before the synthesis game ensures all three measures are fluent before students are asked to choose between them analytically.

5. **stats-which-measure (L4 Analyze) as terminal game** — The L4 Analyze game requires students to *decompose* a scenario into data type + distribution shape + outlier presence and map those properties to the correct tool. This is only possible when all three computations are fluent. Timer is 60 seconds (vs 45 for computation games) to allow the multi-step reasoning the task requires. This game mirrors the trig session's `real-world-problem` as the L4 cap.

### Bloom-ladder rationale

The session implements the same principle as the trig session: each game advances exactly one Bloom level or consolidates the previous level. Students who cannot pass L1 classification will be exposed to the same decision framework (Measure Selector reference card) they will see again in Game 5 — creating a pedagogical bracket.

| Session position | Bloom purpose |
|------------------|---------------|
| L1 (Game 1) | Activate all three schemas; establish decision vocabulary (outliers, categorical, skew) |
| L2–L3 (Game 2) | Build computational fluency for mean; three-tier difficulty ensures transfer beyond rote recall |
| L3 (Game 3) | Sorting habit + even-n averaging rule — two most common median errors eliminated |
| L3 (Game 4) | Mode from lists; bimodal; grouped formula — complete the three-measure toolkit |
| L4 (Game 5) | Synthesize: analyze scenario properties → select correct tool with justified reasoning |

### Why no timer for Game 1

stats-identify-class omits the TimerComponent deliberately. Measure classification is a conceptual-recall task — time pressure contradicts the goal of the worked-example panel (which is designed to be *read*, not skipped under pressure). Games 2–4 use 45-second timers (computation: fast enough to be learnable, tight enough to require automatic recall). Game 5 uses 60 seconds (reasoning task: decompose scenario properties before selecting).

---

## Per-Game Learning Objective + Misconception Targeted

### Game 1 — stats-identify-class (L1 Remember, 10 rounds, no timer)

**Learning objective:** Given a real-world dataset and context description, identify whether Mean, Median, or Mode is the most appropriate measure of central tendency.

**Misconceptions targeted (4 documented):**
1. **always-use-mean** — Students default to mean regardless of context. Sources: Cazorla et al. (2023) ERIC EJ1408809 document this as "mechanical algorithm use without conceptual understanding." Addressed by all 10 rounds requiring explicit justification selection.
2. **mean-ignores-outlier** — Students use mean for salary/house-price data despite large outliers (e.g., monthly salary dataset where one CEO salary is 20× median). Addressed by rounds R2 (employee salary) and R7 (house prices).
3. **mean-for-categorical** — Students attempt to compute a mean of shoe sizes or blood groups. Addressed by rounds R3 (shoe sizes) and R8 (blood groups — nominal, mode is only valid measure).
4. **mode-vs-median-ordered** — Students confuse "most common" with "middle" for ordinal data. Addressed by round R4/R7 contrast (district areas vs house prices).

**Interaction:** 3-button MCQ (Mean / Median / Mode). First wrong attempt: worked-example panel slides in showing Measure Selector reference card with correct reasoning highlighted. Second wrong attempt: life deducted, game advances. Star threshold: ≥8/10 first-attempt correct = 3★.

### Game 2 — stats-mean-direct (L2–L3 Understand+Apply, 9 rounds, 45s timer)

**Learning objective:** Compute the arithmetic mean of a small dataset (5–7 numbers) using the direct method (Mean = Σxi / n) and select the correct answer from 4 MCQ options.

**Misconceptions targeted (4 documented, each is a specific distractor):**
1. **M-no-divide** — Select raw sum (forgot to divide by n). Present in every round as D1. Source: Cambridge Assessment "Common Errors in Mathematics" — "candidates often divided incorrectly."
2. **M-wrong-n** — Divide by n±1 (off-by-one count). Present in every round as D2.
3. **M-mode-confusion** — Select the mode when repeated values are present (rounds 7–9 Hard tier). Source: Pollatsek, Lima & Well (1981) — students treat computation as rote algorithm without grasping what the mean represents.
4. **M-median-confusion** — Select the median (middle value after sorting) instead of the mean. Source: Cambridge Assessment; Cai (1998).

**Difficulty tiers:** Easy (rounds 1–3: whole numbers, sum ≤ 50, n=5), Medium (rounds 4–6: larger values, n=5–6), Hard (rounds 7–9: repeated values, real-world contexts — cricket scores, plant counts — requiring algorithm transfer).

### Game 3 — stats-median (L3 Apply, 9 rounds, 45s timer)

**Learning objective:** Find the median of a dataset (5–7 numbers) by sorting into ascending order and identifying the middle value (or averaging the two middle values for even n).

**Misconceptions targeted (4 documented, each is a specific distractor):**
1. **M-no-sort** — Pick the middle-*position* value from the *unsorted* list. Most common median error per AAMT Top Drawer. Targeted by all Medium and Hard rounds where data is presented unsorted.
2. **M-even-pick-one** — For even-count datasets (n=6), select one of the two middle values instead of averaging them. Targeted by Medium rounds (n=6 subset).
3. **M-off-by-one** — Pick the value at index n//2 instead of (n+1)//2 (0-indexed vs 1-indexed confusion). Targeted by Easy and Medium rounds.
4. **M-mean-confusion** — Compute the arithmetic mean instead of the median. Targeted by Hard rounds where mean ≠ median (skewed datasets with outliers). Source: AAMT Top Drawer — "students confuse median with mean in symmetric distributions."

**Difficulty tiers:** Easy (rounds 1–3: odd n=5, data already sorted — sorting step is trivial, median is 3rd value), Medium (rounds 4–6: even n=6 requiring averaging OR unsorted odd n=5), Hard (rounds 7–9: unsorted data with repeated values and/or n=7, large outlier in round 9 targets spatial-midpoint misconception per Bezuidenhout 2014).

### Game 4 — stats-mode (L3 Apply, 9 rounds, 45s timer)

**Learning objective:** Find the mode of a dataset: the most frequently occurring value (Easy/Medium: ungrouped data) or the modal class value computed from the empirical formula (Hard: grouped frequency table data).

**Misconceptions targeted (4 documented):**
1. **M-mean-confusion** — Compute arithmetic mean instead of finding most frequent value. Source: Enisoğlu (2014), METU — "inappropriate usage of averaging algorithm." Present in Easy rounds as D1.
2. **M-median-confusion** — Pick middle-positioned value (median) instead of mode. Source: IASE SERJ (2023) — "disconnection between routine and endorsed narrative." Present in all tiers as D2.
3. **M-multiple-mode** — Report only one mode in a bimodal dataset. Source: Enisoğlu (2014) — "forming incomplete data set." Targeted explicitly by Medium rounds (bimodal data).
4. **M-formula-error** — For grouped data, substitute f₀ and f₂ incorrectly (off-by-one error reading the frequency table). Targeted by Hard rounds where the table row order is the distractor mechanism. Source: NCERT Class 10 Ch 13 §13.3 Example 5/6.

**Difficulty tiers:** Easy (rounds 1–3: ungrouped n=7–9, one clear mode), Medium (rounds 4–6: bimodal datasets or careful frequency counting), Hard (rounds 7–9: grouped frequency table — NCERT Ch 13 §13.3 formula application).

### Game 5 — stats-which-measure (L4 Analyze, 6 rounds, 60s timer)

**Learning objective:** Analyze a real-world data scenario and identify the most appropriate measure of central tendency by decomposing the scenario into data type (categorical vs numerical) and distribution shape (symmetric vs skewed/outlier-containing).

**Key design distinction from Game 1:** Game 1 (L1) presents the measure name and context — recall. Game 5 (L4) presents each option as a measure *plus justification* — students must evaluate competing reasoning and choose the correct analytical argument, not just recall a label.

**Misconceptions targeted (4 documented):**
1. **MC-always-use-mean** — Default to mean regardless of data context. Addressed by all 6 rounds; rounds R1 (salaries) and R4 (house prices) most forcefully.
2. **MC-outlier-ignore** — Use mean even when outliers are acknowledged but their impact is not recognised. Source: NCERT Class 11 Ch 5 "median is preferred when data has extreme values." Rounds R1, R4, R6 (daily rainfall).
3. **MC-categorical-mean** — Attempt mean for nominal/categorical data (shoe sizes, favourite colours). Source: Laerd Statistics — "mode is the only choice for categorical/nominal data." Rounds R2 (shoe sizes) and R5 (favourite colours).
4. **MC-symmetric-median** — Use median even when distribution is symmetric and mean is the correct (more informative) choice. Rounds R3 (test scores in bell-curve distribution) and R4 (symmetric part of house price scenario).

**Scenario coverage (6 rounds):**
- R1: Monthly salaries at a company (one CEO salary = outlier) → Median
- R2: Most common shoe size stocked by a retailer → Mode
- R3: Class test scores (bell-curve, symmetric distribution) → Mean
- R4: House prices in a neighbourhood with luxury properties → Median
- R5: Favourite colour survey among students → Mode
- R6: Daily rainfall over a monsoon month (skewed, some zero-rain days) → Median

---

## NCERT References

- **Class 9 Ch 14 §14.2** — Mean of Ungrouped Data. Exercise 14.4 Q1: goals scored in 10 matches — mean = 28/10 = 2.8. Q2: marks in maths test. Standard contexts and number ranges used directly in stats-mean-direct Easy/Medium rounds.
- **Class 9 Ch 14 §14.3** — Median of Ungrouped Data. "If n is odd, median = value at position (n+1)/2. If n is even, median = average of values at positions n/2 and n/2+1." Defines both the algorithm and the even-n rule targeted in stats-median Medium rounds.
- **Class 9 Ch 14 §14.4** — Mode of Ungrouped Data. "A mode is a value among the observations which occurs most often." Defines simple mode; bimodal examples extend the definition to the M-multiple-mode misconception.
- **Class 10 Ch 13 §13.3** — Mode of Grouped Data. Formula: `Mode = L + [(f₁ − f₀) / (2f₁ − f₀ − f₂)] × h`. NCERT Examples 5 and 6 (family size and marks distributions) are the direct sources for stats-mode Hard rounds.
- **Class 10 Ch 14 §14.4** — Relationship between Mean, Median and Mode. Empirical formula 3×Median = Mode + 2×Mean confirms all three measures are taught together. "Appropriate use by context" anchors stats-which-measure (L4).
- **Class 11 Ch 5** — NCERT Statistics: "The median is the preferred measure when the data has extreme values or outliers, as it remains unaffected by them." Farmer example (Balapur land ownership) demonstrates all three measures on the same dataset — direct pedagogical anchor for stats-which-measure R1 (salaries) and R4 (house prices).

---

## Assessment Notes

### Session-level success criteria

| Metric | 3-star threshold | 2-star threshold |
|--------|-----------------|-----------------|
| stats-identify-class | ≥8/10 first-attempt correct | ≥6/10 |
| stats-mean-direct | 9/9 correct | 6–8/9 |
| stats-median | 9/9 correct | 6–8/9 |
| stats-mode | 9/9 correct | 6–8/9 |
| stats-which-measure | 6/6 correct | 4–5/6 |

### Diagnostic signal per game

- **Game 1 worked-example trigger rate** — high trigger rate on "mean-for-categorical" rounds (R3 shoe sizes, R8 blood groups) indicates the categorical/numerical distinction has not been taught explicitly. Signals need for vocabulary pre-teaching before session.
- **Game 2 timeout rate** — high timeout rate on Easy rounds indicates rote-computation fluency is not yet automatic; student is not ready for Games 3–4. Consider recommending prerequisite Class 8 data-handling review.
- **Game 3 Medium/Hard accuracy gap** — if Easy accuracy >> Medium accuracy, the unsorted-data step is the barrier (M-no-sort misconception is active). Remediation: explicit sorting-as-step-one practice.
- **Game 4 Hard accuracy** — if Hard accuracy drops sharply vs Easy/Medium, the grouped formula is the barrier, not mode concept. This is a Class 10 topic introduced in the Hard tier of a Class 9 session; the gap is curriculum-appropriate, not a misconception signal.
- **Game 5 R2/R5 errors** (categorical rounds) — if a student passes Game 1 but fails R2/R5 in Game 5, the categorical-data schema is present for isolated recognition (L1) but not yet integrated into analytical reasoning (L4). Target: worked-example panel feedback in Game 5.

### Formative use

Each game's `attempts[]` array records per-round first-attempt accuracy. Post-session analysis can segment students by:
1. Conceptual deficit: fails Game 1 + Game 5 but passes 2–4 → knows algorithms, lacks decision framework
2. Computational deficit: passes Game 1 but fails 2–4 → knows *when* to use each measure but cannot compute
3. Transfer deficit: passes 1–4 but fails Game 5 → algorithmic fluency present, analytical application not yet achieved

---

## Engineer Instructions

1. Review each `spec.md` in the per-game subdirectories before queuing.
2. **Build-in-order rule:** do not queue game N+1 until game N is APPROVED. Stats-identify-class first.
3. Queue builds using `POST /api/build`. Template specs are at `warehouse/templates/<gameId>/spec.md` — preserved via symlink.
4. stats-identify-class has NO TimerComponent — do not add one. All other games have 45s (Games 2–4) or 60s (Game 5) timers.
5. stats-which-measure has a known critical spec note: `waitForPackages maxWait MUST be 180000` — verify this before approving any build.

---

_Generated by Education slot (manual) — 2026-03-23. Session Planner v1 Phase 2 format._
