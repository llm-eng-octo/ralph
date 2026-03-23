# Session 2 — Curriculum Area Candidates

**Created:** 2026-03-23
**Author:** Education Implementation Slot
**Purpose:** Identify the highest-value next curriculum area to build a complete learning session for, following the SOH-CAH-TOA trig session.

---

## Context

Session 1 (SOH-CAH-TOA) has 6 games, Bloom L1–L4, covering NCERT Class 10 Ch 8-9. As of 2026-03-23:
- 3 games approved (name-the-sides #557, soh-cah-toa-worked-example #544, find-triangle-side #549)
- 1 active (which-ratio #561)
- 2 planned (compute-it, real-world-problem)

Session 2 should validate the Session Planner architecture in a second domain — proving that the session design methodology is not trig-specific but generalizable.

**Session Planner readiness criteria:**
- Trig session proves the pattern library. Session 2 validates it in a new domain.
- Pattern library needs: at least 3 different curriculum areas with approved session games before Session Planner becomes a real project.
- The best Session 2 candidate is one where (a) the curriculum structure is clear, (b) proven interaction patterns map directly to the learning tasks, (c) NCERT alignment is unambiguous.

---

## Top 3 Candidates

### Candidate A: Quadratic Equations (NCERT Class 10 Ch 4)

**What the learner achieves:** Given a quadratic ax² + bx + c = 0, identify the method (factorisation/completing the square/formula), apply it, and check discriminant.

**NCERT alignment:**
- Ch 4 §4.1: Standard form identification
- Ch 4 §4.2: Solution by factorisation
- Ch 4 §4.3: Completing the square
- Ch 4 §4.4: Quadratic formula (discriminant, nature of roots)

**Interaction patterns needed:**
- L1: MCQ — "Is this a quadratic equation?" (identify standard form)
- L2: MCQ + worked example — discriminant value → nature of roots (real/equal/imaginary)
- L3: Typed numeric — factorisation (find two factors whose product = c, sum = b)
- L3: Typed expression — apply quadratic formula (typed with LLM validation for expression form, or typed numeric for final root values)
- L4: Word problem — "Width of a garden path is x, area = 60 m². Find x." Map to quadratic, solve.

**Proven patterns that apply directly:**
- Worked example sub-phases (example→faded→practice) — proven in soh-cah-toa-worked-example #544
- Typed numeric input — proven in find-triangle-side #549
- MCQ + worked example on wrong — proven pattern from which-ratio
- Word-problem-three-step — being proven in real-world-problem

**New pattern required:** Typed expression validation (factored form: "(x+2)(x-3)") — requires PART-014 function validation or PART-015 LLM validation. PART-014 can handle numeric root values. Factored form string matching is harder. Workaround: ask for the two roots as separate typed inputs (avoids expression parsing entirely).

**Estimated session:** 5 games, ~20 minutes, Bloom L1→L4.

**Risk:** Medium. The factorisation step requires recognising factor pairs — this cannot be done by MCQ alone at L3 without trivializing it. The workaround (two separate typed numeric roots) is feasible but needs a spec decision.

---

### Candidate B: Statistics — Mean, Median, Mode (NCERT Class 10 Ch 14)

**What the learner achieves:** Given a data set or frequency table, compute mean/median/mode; choose the right measure of central tendency for a given data description.

**NCERT alignment:**
- Ch 14 §14.1: Mean of grouped data (direct method, assumed mean, step deviation)
- Ch 14 §14.2: Median of grouped data (cumulative frequency, formula)
- Ch 14 §14.3: Mode of grouped data (modal class, formula)
- Ch 14 §14.4: Empirical relationship between the three

**Interaction patterns needed:**
- L1: MCQ — identify the modal class from a frequency table
- L2: Adjuster or typed numeric — compute class mark (midpoint) from class interval
- L3: Typed numeric — direct method mean from a frequency table (Σfx / Σf)
- L3: Typed numeric — median from cumulative frequency (l + ((n/2 - cf)/f) × h)
- L3: Typed numeric — mode from modal class (l + ((f₁-f₀)/(2f₁-f₀-f₂)) × h)
- L4: MCQ analysis — "Which measure is most appropriate here?" (skewed vs symmetric data)

**Proven patterns that apply directly:**
- Typed numeric — proven in multiple games
- MCQ — proven everywhere
- Worked example sub-phases — proven in soh-cah-toa-worked-example

**New pattern required:** Table rendering (frequency distribution table). Current CDN has no table component. A frequency table displayed as inline HTML (a `<table>` element rendered in the play area from inputSchema data) is achievable without new CDN parts — it is just inline HTML. The data entry interaction (clicking a row to select it, or reading a value from a specific cell) requires no drag-and-drop — the learner reads the table and types. This is feasible.

**Estimated session:** 5-6 games, ~25 minutes, Bloom L1→L4.

**Risk:** Low-medium. The core interaction (read table, compute, type answer) is well within the current CDN's capabilities. The main risk is table rendering complexity in HTML generation — a frequency table with 6 rows and 4 columns must be rendered dynamically from inputSchema, which requires careful spec'ing of the data structure.

**Prerequisite:** Basic arithmetic (fractions, multiplication) assumed. No trig prereqs. Available to a broader learner population than trig.

---

### Candidate C: Linear Equations in Two Variables (NCERT Class 9 Ch 4 / Class 10 Ch 3)

**What the learner achieves:** Plot a linear equation, identify solutions from a graph, solve a pair of simultaneous equations by substitution and elimination, interpret the solution geometrically.

**NCERT alignment:**
- Class 9 Ch 4: Solutions of linear equations, graphing (two variables)
- Class 10 Ch 3 §3.1-3.2: Pair of linear equations — graphical and algebraic solution
- Class 10 Ch 3 §3.3-3.4: Substitution, elimination, cross-multiplication
- Class 10 Ch 3 §3.5: Consistency and number of solutions

**Interaction patterns needed:**
- L1: MCQ — "Is (2, 3) a solution of 2x + y = 7?"
- L2: Typed numeric — find the y-intercept or x-intercept of a given equation
- L3: Two-step MCQ + typed — method selection (substitution/elimination) + solve
- L3: Typed numeric (two inputs) — find x and y for a simultaneous system
- L4: Word problem — "5 pens and 7 notebooks cost ₹79. 7 pens and 5 notebooks cost ₹77. Find each price."
- (Optional) L2: Graph reading — read a coordinate off a graph image (requires coordinate plane CDN — NOT available without new PART)

**Proven patterns that apply directly:**
- MCQ — proven
- Typed numeric — proven
- Word-problem-three-step — being proven in real-world-problem

**New pattern required:** Graph reading (tap a coordinate on a plotted line). This requires a Canvas or SVG coordinate plane — not available in current CDN (see interaction-patterns.md "Patterns Requiring New CDN Parts"). Without this, the graphing sub-session cannot be built. The algebraic sub-session (substitution + elimination + word problems) is buildable without graphs.

**Risk:** Medium-high. The full session requires graphing interaction that the CDN cannot support. A reduced session (algebraic methods only, no graphing) is buildable but incomplete from a NCERT alignment perspective.

**Estimated session (algebraic only):** 4 games, ~18 minutes, Bloom L1→L3.

---

## Rationale Summary

| | Candidate A (Quadratics) | Candidate B (Statistics) | Candidate C (Linear Equations) |
|--|--|--|--|
| Pattern coverage with current CDN | High (minor workaround for factored form) | High (table rendering feasible in HTML) | Medium (graphing blocked) |
| NCERT alignment completeness | Full (Ch 4) | Full (Ch 14) | Partial without graphing |
| Bloom L4 achievable? | Yes (word problem) | Yes (measure selection) | Yes for algebra, no for graphing |
| Prerequisite breadth (wider audience) | Medium (algebra prereq) | High (any Class 9+ learner) | Medium (algebra prereq) |
| Validates session architecture? | Yes — same structure as trig | Yes — and tests table-rendering pattern | Yes — but blocked area reduces generalizability |
| Session Planner value | High | High | Medium |

---

## Recommendation: Candidate B — Statistics (Mean, Median, Mode)

**Rationale:**

1. **No new CDN parts required.** The frequency table is rendered as inline HTML from inputSchema — this is a data representation challenge, not a CDN challenge. Every interaction (read value, compute, type answer) uses proven parts. The trig session already has one word-problem game; Statistics adds a table-reading pattern that is genuinely new interaction coverage without infrastructure risk.

2. **Broadest prerequisite coverage.** Statistics (Class 10 Ch 14) requires only basic arithmetic. It is accessible to every Class 9-10 learner, not just those who have completed trig. This maximizes the learner population the session can serve.

3. **Tests a different formula application pattern.** The trig session tests ratio selection then computation. Statistics tests formula selection (which of three measures to compute) and then multi-step arithmetic (Σfx/Σf requires summing products, not just one multiplication). This is genuinely new cognitive territory.

4. **Validates the Session Planner's generalisation claim.** The Session Planner thesis requires the architecture to work across curriculum areas, not just trig. Statistics uses tables, not triangles. The interaction patterns are the same (worked example, typed numeric, MCQ analysis) but the domain is completely different. If the session architecture holds in Statistics, it is not trig-specific.

5. **L4 is achievable without new CDN.** "Which measure is most appropriate?" (skewed data → median; categorical data → mode; symmetric data → mean) is an L4 Analyze question that can be answered with MCQ + worked-example-on-wrong — the same pattern proven by which-ratio.

**Estimated interaction patterns needed:**

| Pattern | Status |
|---------|--------|
| MCQ (frequency table reading, modal class identification) | Proven |
| Typed numeric (class mark, mean, median, mode computation) | Proven |
| Worked example sub-phases (direct method mean) | Proven |
| Inline HTML frequency table (rendered from inputSchema) | New — but achievable inline, no CDN part |
| MCQ + worked example on wrong (measure appropriateness) | Proven (which-ratio) |

**One new pattern this session would prove:** Inline tabular data rendered dynamically from inputSchema. This is high value for the pattern library — many NCERT topics (probability, polynomials, coordinate geometry exercises) involve tabular data.

**Prerequisite alignment:**
- NCERT Class 10 Ch 14 follows Class 9 Ch 14 (basic statistics: mean/median/mode of ungrouped data). The Session 2 games can assume ungrouped data concepts are known.
- No trig or geometry prereqs.
- Arithmetic prereq: multiplication, division, fractions — assumed from Class 7-8.

**Estimated session:** 5-6 games, ~22 minutes, Bloom L1→L4.

| Game # | Game ID (proposed) | Bloom Level | Interaction Type |
|--------|-------------------|-------------|-----------------|
| 1 | `stats-identify-class` | L1 Remember | MCQ — identify modal class, class width, class mark |
| 2 | `stats-mean-direct` | L2–L3 Understand→Apply | Worked example (direct method mean from frequency table) |
| 3 | `stats-median` | L3 Apply | Typed numeric — median from cumulative frequency formula |
| 4 | `stats-mode` | L3 Apply | Typed numeric — mode from modal class formula |
| 5 | `stats-which-measure` | L4 Analyze | MCQ + worked example on wrong — choose appropriate measure given data description |

**Next step:** Write spec for Game 1 (`stats-identify-class`) — the lowest-Bloom game in the sequence, following the strict build-in-order rule.

---

## Stats Session 2 Spec Quality Review — 2026-03-23

**Reviewed by:** Education Implementation Slot
**Review date:** 2026-03-23
**Specs reviewed:** stats-identify-class, stats-mean-direct, stats-median, stats-mode

### Summary Table

| Spec | Bloom | Misconceptions | CDN | postMessage | Mechanics | restartGame | Status |
|------|-------|----------------|-----|-------------|-----------|-------------|--------|
| stats-identify-class | L1 — PASS | PASS (4 tagged misconceptions, worked-example on wrong) | WARN (maxWait=10000) | FLAG (missing duration + attempts fields; stars use 0–5 scale) | FLAG (3 internal contradictions — see below) | PASS | NEEDS FIX |
| stats-mean-direct | L2+L3 — PASS | PASS (sum-not-divide, off-by-one-n, median-confusion, mode-confusion) | PASS | PASS | PASS | PASS | READY |
| stats-median | L3 — PASS | PASS (M-no-sort, M-even-n-one-middle, M-off-by-one-index, M-use-mean) | PASS | PASS | PASS | PASS | READY |
| stats-mode | L3 — PASS | PASS (M-mean-confusion, M-median-confusion, M-multiple-mode, M-formula-error) | PASS | PASS | PASS | PASS | READY |

**Result: 3 READY, 1 NEEDS FIX (stats-identify-class)**

---

### Per-Criterion Notes

#### Bloom Level Alignment

- **stats-identify-class (L1 Remember):** Correct. The mechanic is pure classification — given a dataset and context, pick Mean/Median/Mode. No computation required. MCQ with 3 options. Bloom L1 recognition is the right level for this game's role as session entry point.
- **stats-mean-direct (L2 Understand + L3 Apply):** Correct. The learner reads numbers, applies the sum-divide algorithm, and selects from 4 options. L2/L3 dual-label is accurate — early easy rounds are Understand (recognising the algorithm), hard rounds with real-world context are Apply (transferring the algorithm to a new setting, per Cai 1998).
- **stats-median (L3 Apply):** Correct. The learner must actively sort the data and pick the middle position or average two middle values. Unsorted Medium/Hard rounds enforce the procedural Apply demand.
- **stats-mode (L3 Apply):** Correct. Easy/Medium rounds require frequency counting (apply counting routine); Hard rounds require applying the grouped-data formula with specific formula substitution. All L3.

#### Misconception Distractors

All four specs use research-grounded misconception tags from cited peer-reviewed sources (NCERT, AAMT, Cambridge Assessment, IASE SERJ, METU study). No random wrong-number distractors — every option has an explicit misconception annotation (`misconceptionTags` field). PASS for all four.

Standout examples:
- stats-mean-direct: every hard round places the dataset sum as D4 (forgot-to-divide) and the mode as D3 when repeated values exist — both documented failure modes.
- stats-mode: Hard rounds include `M-formula-error` targeting misreading f₀/f₂ positions in the grouped-data formula — directly from NCERT Class 10 worked examples.

#### CDN Compliance

- **TransitionScreen API:** All four specs explicitly state "NEVER use transitionScreen.show('string') — CDN has NO string-mode support" and show object-form calls throughout. PASS for all four.
- **PART-003 waitForPackages timeout:**
  - stats-identify-class: Section 7.2 shows `maxWait = 10000` (10 seconds). This is too short for CDN cold-load on a slow connection — the established requirement from pipeline lessons is `180000ms`. FLAG.
  - stats-mean-direct, stats-median, stats-mode: PART-003 row in the Parts table specifies the required package list but does NOT show a waitForPackages implementation code block. The 180000ms timeout constraint is not mentioned in the spec body. These specs rely on the LLM using the warehouse PART-003 template which sets 180000ms — acceptable but should be explicit. LOW risk (template handles it).
- **FeedbackManager.init() ban:** All four specs carry the CRITICAL banner at the top. PASS.
- **window.gameState at module scope:** All four specs specify this correctly. PASS.
- **window.endGame / window.restartGame:** All four specs specify mandatory window assignments. stats-identify-class also requires `window.nextRound` and `window.loadRound` — these are correct for this game's mechanics.

#### GAME_COMPLETE postMessage Payload

- **stats-mean-direct:** `{ type, gameId, score, stars, correctAnswers, incorrectAnswers, totalRounds, accuracy, roundsCompleted, livesRemaining, isVictory, duration, attempts }` — comprehensive, matches scoring logic. PASS.
- **stats-median:** Identical payload structure to stats-mean-direct. PASS.
- **stats-mode:** Identical payload structure. PASS.
- **stats-identify-class:** `{ type, gameId, score, stars, firstAttemptAccuracy, roundsCompleted, livesRemaining, isVictory }` — missing `duration` (Date.now() - gameState.startTime) and `attempts` (gameState.attempts array) which the other 3 specs include. Also uses `firstAttemptAccuracy` instead of `accuracy` (inconsistent naming across session). The star scale is 0–5 (not 0–3 like the other 3 specs) — inconsistent session-level scoring. FLAG.

#### Mechanics Specification

- **stats-mean-direct, stats-median, stats-mode:** All three clearly define: (a) correct answer = string equality `selectedOption === round.correctAnswer`, (b) scoring = `correctAnswers` counter incremented on correct, (c) wrong answer = life deducted, show correct button highlighted, advance after 1200ms delay. Timer starts in `loadQuestion()` (not `startGame()`) — correct. PASS for all three.
- **stats-identify-class:** Three internal contradictions make the spec ambiguous for the LLM:

  **Contradiction 1 — Round count mismatch:** The pedagogical design note and game description say "9 rounds", PART-011 says "No game-over state (no lives system)", and star logic in the description section says "≥7/9 first-attempt correct = 3★". But `totalRounds: 10` and ProgressBar `totalRounds: 10` are set, and Section 4 defines 10 content rounds (R1–R10). The advanceRound() logic calls `endGame(true)` when `currentRound >= 10`. The actual round count is **10**. The "9 rounds" references are stale from a prior draft. FLAG — needs cleanup so "9" is removed or the round count is reduced to 9.

  **Contradiction 2 — Lives system exists vs "no lives system":** Anti-pattern rule #5 says "Do NOT deduct lives — this game has no lives system. Never call `progressBar.loseLife()`. The game always ends in victory after 9 rounds." But Section 3 says "This game HAS 3 lives" and the handleWorkedExampleSkip() flow calls `progressBar.loseLife()` and `endGame(false)` on zero lives. The game clearly has a lives system. Anti-pattern rule #5 is leftover text from an earlier no-lives design. FLAG — the anti-pattern rule must be removed or corrected; it will cause the LLM to suppress life deduction logic.

  **Contradiction 3 — Star scale 0–5 vs PART-011 implied 0–3:** PART-011 in the parts table states "No game-over state (no lives system)" — but the game does have a game-over state. Additionally the star scale defined in endGame (0/1/2/3/4/5 stars) is a 6-level system inconsistent with the ProgressBar 3-star system used by all other games in the session. FLAG — if a lives system and game-over screen exist, PART-011 must reflect that; the star scale should be normalised to 0–3 for session consistency.

#### Timer Specification

- stats-mean-direct, stats-median, stats-mode: `timer.start()` is called inside `loadQuestion()` (Section 7.2 in mean-direct, confirmed in median and mode). Never called in `startGame()` or `setupGame()`. PASS.
- stats-identify-class: No timer (PART-006 = NO). N/A.

#### restartGame() State Reset

- stats-identify-class: Resets currentRound=0, lives=3, score=0, totalFirstAttemptCorrect=0, gameEnded=false, isActive=false, isProcessing=false, attemptsThisRound=0, wrongFirstAttempt=0, events=[], attempts=[], startTime=null. All game-specific fields covered. PASS.
- stats-mean-direct: Calls `startGame()` which resets lives=3, currentRound=0, score=0, correctAnswers=0, incorrectAnswers=0, attempts=[], events=[], gameEnded=false, isProcessing=false. Additionally destroys + recreates timer before calling startGame(). All fields covered. PASS.
- stats-median: Identical structure to stats-mean-direct. PASS.
- stats-mode: Identical structure. PASS.

#### NCERT/Curriculum Alignment

- stats-identify-class: 10 rounds covering Mean (R1/R5/R8), Median (R2/R4/R7/R10), Mode (R3/R6/R9) with Indian Class 10 contexts. Sources A-E are cited with specific chapter/exercise references. NCERT Ch 14 alignment confirmed. PASS.
- stats-mean-direct: NCERT Class 9 Ch 14 Ex 14.4 Q1/Q2 contexts (marks, cricket scores). Class 9 ungrouped data is the correct prerequisite entry point for Class 10 grouped data. PASS.
- stats-median: NCERT Class 10 Ch 14 Section 14.3 (ungrouped median). Source A cites NCERT definition. PASS.
- stats-mode: NCERT Class 10 Ch 13 (new syllabus numbering) / Ch 14 (old numbering) Section on grouped-data mode. NCERT Examples 5 and 6 are reproduced exactly as round prototypes. PASS. NOTE: Spec cites "Ch 13" in the description but "Ch 14" in the NCERT source citation — likely a syllabus edition numbering difference (2024-25 NCERT renumbered). Acceptable given context; spec should add a note clarifying which edition.

---

### Issues and Required Fixes — stats-identify-class

**FIX-1 (BLOCKING): Remove anti-pattern rule #5 / fix lives contradiction**
- Location: Section 8 (Anti-Patterns), item #5
- Current text: "Do NOT deduct lives — this game has no lives system. Never call `progressBar.loseLife()`. The game always ends in victory after 9 rounds."
- Problem: Directly contradicts Section 3 ("This game HAS 3 lives"), handleWorkedExampleSkip() logic, and the existence of a game_over path in endGame(). The LLM reading this rule will suppress life deduction and skip/break the game-over path.
- Fix: Replace with: "DO deduct a life on the second wrong attempt (Skip) — call `progressBar.loseLife()` and decrement `gameState.lives`. Call `endGame(false)` when lives reach 0. The FIRST wrong attempt shows the explanation panel with no life deduction."

**FIX-2 (BLOCKING): Fix round count — resolve "9 rounds" vs totalRounds=10 contradiction**
- Locations: Pedagogical design note ("9 rounds"), PART-011 ("≥7/9"), game description ("9 rounds"), star logic in endGame ("≥7/9 first-attempt correct = 3★; ≥5/9 = 2★")
- Current: totalRounds=10, 10 content rounds defined, ProgressBar totalRounds=10, but description says "9 rounds" and star thresholds use /9.
- Fix: The content rounds are 10 (R1-R10 are all defined). The star thresholds and description should reference 10 rounds. Change all "9 rounds" references in the description and PART-011 row to "10 rounds". Change star logic to: ≥8/10 = 3★; ≥6/10 = 2★; <6 = 1★ (keeping same proportional thresholds).

**FIX-3 (BLOCKING): Align star scale to 0–3 (not 0–5)**
- Location: Section 6.8 endGame star logic (0/1/2/3/4/5 stars)
- Problem: All other session games use a 0–3 star scale. A 6-level 0–5 scale is inconsistent and will cause the ProgressBar to display incorrectly if it is wired to expect 0–3.
- Fix: Replace the 6-level scale with: 9–10 first-attempt correct = 3★; 6–8 = 2★; 0–5 = 1★. (Or keep 0 as 1★ minimum for a learning game.)

**FIX-4 (MODERATE): Add missing postMessage fields — duration and attempts**
- Location: Section 6.8 endGame postMessage block
- Problem: Stats-mean-direct, stats-median, and stats-mode all include `duration: Date.now() - gameState.startTime` and `attempts: gameState.attempts`. Stats-identify-class omits both, causing inconsistent session analytics.
- Fix: Add `duration: Date.now() - gameState.startTime` and `attempts: gameState.attempts` to the game_complete payload.

**FIX-5 (LOW): PART-003 waitForPackages maxWait**
- Location: Section 7.2 waitForPackages code block
- Problem: `maxWait = 10000` (10s). Pipeline lessons require 180000ms to survive CDN cold-load.
- Fix: Change `const maxWait = 10000` to `const maxWait = 180000`.

---

### Verdict

| Spec | Fixes required | Can be queued? |
|------|---------------|----------------|
| stats-identify-class | 5 fixes (3 blocking) | READY (fixes applied 2026-03-23) |
| stats-mean-direct | None | YES |
| stats-median | None | YES |
| stats-mode | None | YES |

**Build order when ready:** stats-identify-class must be approved first (lowest Bloom, session prerequisite per Rule 5 in docs/education/README.md). The other 3 specs are ready but should not be queued until Game 1 is approved.
