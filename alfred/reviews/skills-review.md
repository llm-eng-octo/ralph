# Pipeline Skills Review

10 persona-based reviews conducted 2026-04-06. Each reviewer read `skills-taxonomy.md` and reported gaps from their perspective.

---

## Reviewers

| Persona | Focus area |
|---------|-----------|
| Game Creator | Can I express my intent? Will the output match my vision? |
| Platform Engineer | Are all PARTs mapped? Are integration contracts correct? Runtime failure modes? |
| QA/Test Engineer | Can every skill be tested? Are there tested behaviors not in the doc? |
| Student (Class 7, India) | Does it load, make sense, feel fair, teach me something, make me want to come back? |
| Data Analyst | Is the data sufficient to answer the questions that matter? |
| Systems Architect | Feedback loops, coupling, emergence, leverage points |
| CEO | Completeness proof, decision coverage, defaults, dependency ordering |
| Pedagogy Expert | Learning design patterns, Bloom completeness, assessment validity, NCERT alignment |
| Experience Designer | Interaction lifecycle, microinteractions, emotional arc, mobile UX |
| Game Designer | Game structure/interaction completeness, game feel, difficulty tuning, archetype profiles |

---

## A. Missing Skill Domains

Entire domains absent from the skills doc — not sub-skills, but categories of capability.

### A.1 Hints, scaffolding, retry mechanics

**Found by:** Game Creator

Creator cannot express "show hint after 2 wrong attempts" or "allow one retry per round" or "show answer after 3 attempts then move on." These are common pedagogical patterns with no place in the spec or the skills taxonomy.

**Key questions:**

- What hint primitives can a spec invoke?
- How does hint usage affect scoring?
- How does a creator express "allow N retries per round before moving on"?
- What scaffolding patterns exist across Bloom levels?

### A.2 Accessibility

**Found by:** Game Creator, Student

No WCAG target. No screen reader skill. No keyboard navigation. No color-blind safe palettes. No reduced motion preferences. This is an entire missing domain, not a sub-skill of visual design.

**Key questions:**

- What WCAG level is the target?
- Which assistive technologies must work?
- Is keyboard-only play required?
- Are there games where accessibility is harder (drag-and-drop, canvas-based)?

### A.3 Localization and language

**Found by:** Game Creator, Student

Hindi/English switching, reading level, RTL layout, number formatting, locale-dependent content — completely absent. Indian students switch between English and Hindi constantly. "Samkon tribhuj" vs "right triangle."

**Key questions:**

- What is the string externalization mechanism?
- Which languages must every game support at launch?
- What is the reading level of game text, and does it match students' English proficiency?
- How do we handle math terms that students know in one language but not another?

### A.4 Motivation and retention

**Found by:** Student

No streaks, no personal bests, no progress across sessions. The game ends, sends game_complete, and that is it. No reason to play twice. No social proof — "my friend got 7/9, can I see that?"

**Key questions:**

- What reason does the student have to open this game a second time?
- Should scores persist across sessions?
- Can students compare scores?
- Is there a progression system across games (not just within a game)?

### A.5 Emotional design

**Found by:** Student

"Game Over" after 2 wrong math questions makes a 13-year-old feel stupid. The tone of failure matters enormously. No skill addresses the emotional experience of losing, the language on end screens, or whether the game punishes vs encourages.

**Key questions:**

- Does the game-over screen make the student feel encouraged or defeated?
- What language is used for failure states?
- Is "Game Over" the right framing, or should it be "Let's try again"?
- How does feedback tone differ across Bloom levels?

### A.6 Session continuity

**Found by:** Game Creator, Student

No cross-game session flow. No progress persistence. No resume after tab close. No prerequisite dependencies between games. Creator can describe one game but not a sequence of games (warm-up then practice then assessment).

**Key questions:**

- How does a creator express a sequence of games as a single learning unit?
- If a student closes the browser and comes back, is progress gone?
- Can a session adapt based on performance in earlier games?
- What spaced repetition mechanisms exist?

### A.7 Analytics readiness

**Found by:** Data Analyst

No skill ensures the game produces data that is actually analyzable. Games ship as analytics black boxes — you can tell pass/fail but nothing actionable.

**Key questions:**

- Does every distractor have a misconception tag?
- Does recordAttempt include round_number, question_id, correct_answer, response_time?
- Does game_complete include per-round breakdown (not just aggregates)?
- Do incomplete sessions emit a game_abandoned event?

### A.8 Replay cleanup

**Found by:** Platform Engineer, QA

setInterval leaks, event listener accumulation, and incomplete state reset on replay. No single skill owns "everything that must happen when the student taps Play Again."

**Key questions:**

- What is the complete list of things that must be reset on replay?
- Are intervals and timeouts tracked for cleanup?
- Are event listeners removed before re-registration?
- Does SignalCollector reset on replay?

---

## B. Data Capture Gaps

These gaps block the gauge step — the creator + Claude MCP conversation about what is working.

| Field missing from recordAttempt | Why it matters |
|----------------------------------|---------------|
| `round_number` | Can't identify which question is hard |
| `question_id` | Can't link attempts to specific questions across sessions |
| `correct_answer` | Can't do post-hoc analysis of what was asked |
| `misconception_tag` | Can't answer "why did they fail?" — biggest single gap |
| `response_time_ms` (per question) | Can't distinguish thinking from guessing |
| `difficulty_level` / `stage` | Can't verify difficulty curve is correct |
| `is_retry` | Can't distinguish first attempt from retries |

| Field missing from game_complete | Why it matters |
|----------------------------------|---------------|
| Per-round accuracy breakdown | Can't detect fatigue or difficulty spikes |
| Student/class/session identifier | Can't aggregate across students or compare cohorts |
| Concept/topic tags | Can't compare games teaching the same concept |
| Abandonment event (beforeunload) | Students who quit are invisible |

---

## C. Unmapped PARTs

8 warehouse PARTs with no skill mapping.

| PART | Name | Should map to |
|------|------|---------------|
| PART-016 | StoriesComponent | New: 1.1 (story-only game structure) |
| PART-018 | CaseConverter | 4.x (platform utility) |
| PART-019 | Results screen construction | 3.1 (screen layout) or 1.2 (end states) |
| PART-027 | Play area construction | 3.1 (screen layout) |
| PART-032 | AnalyticsManager | New: 4.12 (analytics readiness) |
| PART-035 | Test plan generation | Pipeline-internal, not a game skill |
| PART-037 | Playwright testing | Pipeline-internal, not a game skill |
| PART-038 | InteractionManager | 2.1 (input types) |

Additionally, critical integration patterns undocumented:

- FeedbackManager.init() blocking popup when PART-017=NO (100% test failure)
- ScreenLayout.inject() requires `{ slots: {...} }` wrapper (blank page without it)
- TimerComponent loads ~554ms after ScreenLayout (race condition)
- CDN packages have no version pinning (update breaks all live games)

---

## D. Testability Gaps

| Skill | Issue | Found by |
|-------|-------|----------|
| 4.6 Signal collection | No test category covers SignalCollector | QA |
| 4.7 Visibility tracking | No tab-switch simulation in tests | QA |
| 6.2 Cross-browser | Pipeline tests Chromium only | QA |
| 6.3 Performance | No performance budget assertion | QA |
| 3.3 Feedback timing | Inherently flaky (500ms animation window) | QA |
| 5.3 Educational correctness | Requires human or LLM judgment, not automatable | QA |
| 5.4 Curriculum alignment | Bloom level verification is subjective | QA |

Tested by pipeline but not in skills doc:

- Debug function existence (debugGame, debugAudio) — asserted as mandatory in tests
- syncDOM data-* attributes — tests enforce but doc treats as unresolved question
- Memory cleanup (no runaway setInterval) — tests assert but no skill owns it
- FeedbackManager API surface (sound.preload, playDynamicFeedback method calls)

---

## E. System-Level Gaps

### E.1 Skills are flat, not a DAG

Skills have dependencies (4.2 init requires 4.1 CDN loading requires 7.1 deployment) but these are implicit. No ordering, no interfaces, no defined outputs.

**Key question:** What does each skill produce that the next skill consumes?

### E.2 No skill-level metrics

Can't measure "how often does Skill 2.3 fail across builds?" Learning is anecdotal (lessons-learned.md as prose) not data-driven.

**Key question:** What is the success metric for each skill?

### E.3 No valid PART combination profiles

33 PART flags create 2^33 theoretical combinations. Most are invalid. No document defines the ~8-10 valid game archetypes.

**Key question:** What are the valid PART profiles, and what happens when an invalid combination is generated?

### E.4 Generation prompt has no outflow

100KB prompt grows (new lessons) but never shrinks (no pruning). Context rot degrades LLM quality.

**Key question:** What is the rule for archiving stale gen rules?

### E.5 Fix loop is broken

Every approved game had iterations=0. The fix loop has never rescued a bad generation.

**Key question:** Should the fix loop be replaced with something else (surgical edits, regeneration, best-of-N)?

### E.6 No consistency guarantee

Same spec can produce structurally different games. No reference implementation per game type.

**Key question:** What makes two games "consistent"? Same contract? Same visual language? Same interaction patterns?

### E.7 CDN has no versioning

CDN package update breaks all live games simultaneously. No canary. No rollback.

**Key question:** How do we test a CDN update against existing games before it goes live?

---

## F. Leverage Points (ranked)

From Systems Architect, validated by all reviewers:

1. **Template the CDN/init/state infrastructure** — eliminates the single largest failure domain (Platform Engineer confirms: 4.1-4.4 are a single coupled failure domain)
2. **Add misconception tags to data capture** — transforms data from pass/fail to actionable (Data Analyst: "the only question that matters")
3. **Define valid PART combination profiles** — eliminates combinatorial generation errors (Systems Architect: ~8-10 archetypes cover all current games)
4. **Add skill-level metrics to Learn layer** — makes improvement data-driven instead of anecdotal
5. **Close student-data-to-generation loop** — shifts from "factory that produces games" to "factory that produces learning"

---

## Strongest Quote Per Reviewer

> **Game Creator:** "There is zero mention of hints. The doc covers what happens when the student is wrong, but not what happens when the student is *stuck*."

> **Platform Engineer:** "When PART-017=NO but someone calls FeedbackManager.init(), it shows a blocking popup that causes 100% test failure."

> **QA Engineer:** "Games could ship with broken signal collection and no test would catch it."

> **Student:** "The document is thorough for making games that do not crash. It is not thinking about making games that a kid on a bus in Pune actually wants to play twice."

> **Data Analyst:** "The current data capture answers 'did the student pass?' but cannot answer 'why did they fail?'"

> **Systems Architect:** "The gen prompt is a stock with inflow but no outflow — it will eventually poison the system."

> **CEO:** "The skills doc tells you what the pipeline must know; it does not tell you what the pipeline must do when a decision is ambiguous."

---

## G. CEO Review: Completeness Proof

### G.1 Domain exhaustiveness verdict

The 9 domains are defensible. Boundaries are mostly crisp. Pattern vs Interaction is clean (structure vs agency). Experience vs Content is the weakest boundary — "misconception-specific feedback" lives in both 8.3 and 5.3.

**One domain candidate not fully absorbed:** Session continuity (cross-game sessions, resume after tab close, prerequisite chains). Appears nowhere as an explicit skill. Recommendation: add as 8.8 under Experience or as a new Platform sub-skill.

### G.2 Sub-skill structural issues

- **Platform (domain 4) is bloated at 18 sub-skills.** 4.13 (Results screen) and 4.14 (Play area) are presentation concerns shoved into Platform because they have PART numbers. "Has a PART number" is not the same as "is a platform skill."
- **Content (domain 5) is thin at 4 sub-skills.** Missing: content difficulty calibration, content-round count mismatch validation, distractor quality assessment.
- **4.5 (Data capture) and 4.6 (Signal collection) overlap.** SignalCollector IS a data capture mechanism. Clarify boundary: 4.5 = structured attempts, 4.6 = unstructured signals.
- **Device (domain 6) is weakest.** 4 sub-skills, all questions, zero answers. Could be folded into Platform and Deployment without loss, but keeping it as a physical-world-constraints reminder has value.

### G.3 Three things that block shipping

**1. No defaults for creator decisions.**

A creator who specifies nothing gets an undefined game. Of 12 key creator decisions, only content set compatibility (5.2) has both a default and validation. Every other decision has neither.

| Decision | Default? | Validation? |
|----------|----------|-------------|
| Game type | No | No |
| Interaction type | No | No |
| Scoring model | No | No |
| Difficulty curve | No | No |
| Rounds | No | No |
| Lives | No | No |
| Timer | No | No |
| Feedback style | FeedbackManager default | No |
| Content | Fallback content | Schema validation |
| Bloom level | No | No |
| Language | English implied | No |
| Accessibility | None stated | No |

**Key question:** For each decision, what does the pipeline assume when the creator says nothing?

**2. Data capture is aspirational, not real.**

Attempt schema (9.1) lists 12 required fields including misconception_tag, response_time_ms, question_id. Zero shipped games populate these. The gauge step cannot function.

**Key question:** Which fields must be populated BEFORE launch vs which can be added post-launch?

**3. No skill DAG or dependency ordering.**

Skills have dependencies (4.1 CDN → 4.2 init → 4.3 state) but no ordering. Without this, the doc is a checklist not an architecture. The pipeline needs to know what must succeed before what.

**Key question:** What is the dependency graph of skills? What is the critical path?

### G.4 Additional findings

- **Gauge step has no skill.** Data domain (9) covers what data is produced. No skill covers how data becomes insight. The creator + Claude + MCP conversation is a capability the system needs but doesn't define.
- **Loop is not self-correcting.** No skill detects "data quality is degrading" or "the gauge step is producing no actionable insights." Silent degradation is the expected failure mode.
- **Organization is correct for completeness, not for operations.** Domain-based organization proves nothing is missing. For telling the pipeline what to generate, you need the skill DAG.

### G.5 Overall verdict

The skills doc is an excellent enumeration (80% complete). The missing 20% is concentrated in the exact places that determine whether the loop actually closes: defaults, data implementation, and skill ordering.

---

## H. Pedagogy Expert Review

### H.1 Learning design gaps

**Covered patterns:** Direct instruction (worked example), guided practice (scaffolding 1.6), independent practice (rounds), formative assessment (attempt recording). These are implicit, not first-class.

**Missing patterns:**

| Pattern | Status | Impact |
|---------|--------|--------|
| Diagnostic assessment | Absent | Can't detect prerequisite gaps (student fails ratios because they don't know fractions) |
| Spaced retrieval / interleaving | 8.7 asks questions, zero implementation | No long-term retention mechanism |
| Productive failure | Absent | Can't present harder problem first to provoke thinking |
| Prerequisite checking | Absent | Single largest pedagogical gap |
| Misconception-aware design | Partial (5.3 + 9.1) | No skill for DESIGNING distractors from known misconceptions or routing feedback based on which misconception was triggered |
| Cognitive load management | Absent | No limit on information density per screen |
| Transfer | Absent | No skill for same concept in new context |

### H.2 Bloom completeness

- L5 (Evaluate) and L6 (Create) are absent. Significant gap for Class 8+.
- No Bloom-to-structure mapping: an L1 recall game and an L4 analysis game are structurally identical in the pipeline.
- Difficulty curves are educationally flat: linear stepped progression is the weakest curve for retention.

### H.3 Assessment validity

- No construct validity skill (is the game measuring what it claims?)
- No item analysis skill (which questions are too easy, too hard, or non-discriminating?)
- No distractor analysis (a distractor nobody picks is wasted)

### H.4 Indian curriculum specifics

- No NCERT chapter/exercise alignment verification
- Regional board variations (Maharashtra SSC, Karnataka SSLC) not addressed
- Bilingual mathematical vocabulary ("karna" = "hypotenuse") not supported

> **Summary:** "The pipeline can reliably produce a game that *works*; it cannot yet reliably produce a game that *teaches*."

---

## I. Experience Designer Review

### I.1 Interaction pattern gaps

- Missing input types: long-press, swipe, pinch-zoom, drawing/tracing
- No interaction lifecycle: idle → focused → active → disabled → error states not specified
- No error state handling: tap registers nothing, keyboard covers question, drag dropped outside valid zone

### I.2 Microinteraction gaps

| Gap | Impact |
|-----|--------|
| Loading states | No skeleton screen or spinner standard; student sees white screen during CDN load |
| Empty states | No spec for what happens when content is empty |
| Transition polish | No easing curves, no interruptibility rules, no mid-transition visual state |
| Haptic feedback | Zero mention; `navigator.vibrate()` is free on Android |
| Pull-to-refresh suppression | Browser gesture can reload game mid-round |

### I.3 Emotional arc

- No dynamic emotional journey specification (curiosity → flow → peak challenge → satisfaction)
- No flow state management (the zone between boredom and anxiety)
- Celebration moments underspecified: no combo/streak, no personal best detection, no "perfect round"
- Failure recovery is a question not a skill: after 3 wrong answers, child's confidence is collapsing

### I.4 Mobile-specific UX gaps

| Gap | Impact |
|-----|--------|
| Thumb zone | Interactive elements not mapped to one-handed reach zones |
| Keyboard viewport push | Number input focus may push question off screen |
| Orientation lock | No portrait lock; rotation mid-game undefined |
| Safe area / notch | No `env(safe-area-inset-*)` handling; content clipped on 40%+ of target devices |
| System interruptions | Phone call, notification dropdown don't trigger visibilitychange on mobile |

---

## J. Game Designer Review

### J.1 Game structure gaps

| Missing structure | Evidence | Priority |
|-------------------|----------|----------|
| Puzzle/board | queens-puzzle, math-cross-grid, expression-completer are all "solve the whole board" — no sequential rounds | **Add now** |
| Endless/infinite | addition-mcq-blitz, rapid-challenge are speed-runs with no fixed round count | **Clarify as timed variant** |

Branching, boss-fight, tournament, daily challenge — not needed for K-8 math now.

### J.2 Interaction type gaps

| Missing type | Evidence | Priority |
|-------------|----------|----------|
| Multi-selection (tap many) | stats-which-measure asks "which measures apply?" | **Add now** |
| Sequence ordering | Put fractions smallest-to-largest — distinct from category sorting | **Add now** |
| Construction | expression-completer, sequence-builder — build from parts | **Add now** |
| Estimation (slider/number line) | Standard math ed interaction, no current game | Future |
| Transformation (rotate/flip/scale) | Geometry middle school | Future |

### J.3 Game feel

Biggest gap in the document. Entirely missing moment-to-moment feel:

- **Juice:** No skill for micro-animations (bounce on correct, shake on wrong, confetti on victory)
- **Pacing:** No skill for the rhythm cycle (question → think → answer → feedback → next). Timing is the biggest determinant of "snappy" vs "sluggish"
- **Stakes:** No mechanics beyond lives (near-miss feedback, streak bonuses, loss aversion)
- **Surprise:** No randomized encouragement, bonus rounds, Easter eggs, visual variety

### J.4 Difficulty design

- No mention of 70-85% optimal success rate target
- No adaptive difficulty (adjust within session based on performance)
- No Zone of Proximal Development framing connecting scaffolding + difficulty + Bloom

### J.5 Proposed 10 game archetype profiles

| # | Profile | Structure | Interaction | Examples |
|---|---------|-----------|-------------|----------|
| 1 | MCQ Quiz | Rounds | MCQ single | which-ratio, geo-angle-id |
| 2 | Speed Blitz | Timed | MCQ single | addition-mcq-blitz, rapid-challenge |
| 3 | Lives Challenge | Lives | MCQ/number | find-triangle-side |
| 4 | Sort/Classify | Rounds | Drag-and-drop | geo-triangle-sort |
| 5 | Memory Match | Rounds | Click-to-match | match-the-cards, word-pairs |
| 6 | Board Puzzle | Puzzle | Click-to-select | queens-puzzle, math-cross-grid |
| 7 | Construction | Rounds | Build-from-parts | expression-completer, sequence-builder |
| 8 | Worked Example | Example/faded/practice | Step reveal + input | soh-cah-toa-worked-example |
| 9 | No-Penalty Explorer | No-penalty | MCQ | name-the-sides |
| 10 | Tracking/Attention | Rounds | Click-to-select (timed) | keep-track, total-in-flash |

---

## Strongest Quotes (Round 2)

> **Pedagogy Expert:** "The three most consequential gaps are: no prerequisite/diagnostic assessment, no misconception-driven design loop, and no Bloom-to-structure mapping. These determine whether a student learns or just plays."

> **Experience Designer:** "The doc jumps from 'what the input is' to 'is it correct' with no specification of how the input *looks and feels* during use."

> **Game Designer:** "The difference between a game students play once and one they replay is juice. No skill anywhere covers it."
