# 08 — How Do We Prove Claude Is Actually Reasoning?

## TL;DR (skim in 30 seconds)

- **An LLM pipeline that can't show its work is indistinguishable from a demo.** The supervisor's challenge is fair.
- **Three layers of proof, stacked:** (1) traceability via skill-mandated artifacts, (2) every step writes a file, (3) eval gates with checkbox assertions.
- **Reasoning is the artifact.** If the artifact is missing a section, the reasoning didn't happen.
- **Honest gaps:** evals are human-runnable not machine-runnable (~5–6 days to automate). Visual + final review have no objective anchors — pure LLM gestalt.

---

## First Principles: What Counts as Proof?

### Step 1 — Why is "Claude said so" not enough?
Because chain-of-thought is ephemeral. A model can produce a confident-looking rationale that's wrong. We need something a human can open later and check.

### Step 2 — What's the simplest form of proof?
A file on disk + a checklist that judges it. If both exist and the checklist passes, the reasoning happened. If either is missing, it didn't.

### Step 3 — How do we wire this through 12 steps?
Each skill mandates an artifact shape. The shape forces the reasoning to be visible. Each skill also has an `eval.md` with checkbox assertions. The shape + the checklist = the proof.

---

## The Three Layers

| Layer | What it provides | Where it lives |
|-------|-----------------|---------------|
| 1. Traceability | Reasoning materialized as structured artifact | Skill-mandated section shapes |
| 2. Artifacts at every stage | A file or block per step | spec.md, plan/, index.html, REVIEW_RESULT, TEST_RESULTS, VERDICT, SCORE |
| 3. Eval gates | Checkbox assertions per case | `skills/<skill>/eval.md` with P0/P1 cases |

**Proof = (instructions Claude was told to follow) + (artifact Claude produced) + (checklist that judges the artifact).**

---

## Layer 1 — Traceability via Skill-Mandated Shape

The reasoning isn't in chain-of-thought; it's in the **structure of the file**. Required sections force visible reasoning:

| Artifact | Required structure | If hand-waved |
|----------|-------------------|---------------|
| spec.md | Bloom level, archetype, Misconception Taxonomy table with tags, Round Schemas as JSON, 10 sample rounds with `distractor_tag` | Tags missing → structurally detectable |
| plan/ | 5 docs cross-validated against each other (6 cross-checks) | Inconsistency → caught in review |
| index.html | data-contract patterns (gameState, syncDOMState, recordAttempt, game_complete) | Static validators fail |
| TEST_RESULTS | per-category scores + ISSUES_FIXED log | Block missing → step failed |
| Visual review | Screenshots per phase + VERDICT | Missing screenshot → step failed |
| Final review | SCORE % + per-check pass/fail table | Missing → can't ship |

---

## Layer 2 — Artifacts From This Session

Every one of these is `cat`-able, `diff`-able, `grep`-able. Nothing is ephemeral.

| Artifact | Path |
|----------|------|
| Scale It Up spec | `games/scale-it-up/spec.md` (95 lines, 3-stage breakdown) |
| Match Up spec | `games/ratio-match-up/spec.md` (misconception taxonomy lines 109-117, round schemas 122-159, 10 rounds 163-219) |
| Match Up HTML | `games/ratio-match-up/index.html` |
| REVIEW_RESULT blocks | inline session log |
| TEST_RESULTS / ISSUES_FIXED | inline per fix iteration |
| Visual review screenshots | `/tmp/*.png` |
| Final review SCORE | inline session log |

---

## Layer 3 — Eval Gates with Checkbox Assertions

`alfred/skills/spec-creation/eval.md` defines 10 cases. Each case has an **Expect** checklist — checkboxes, not prose:

| Assertion | Tag | Judged by |
|-----------|-----|----------|
| Archetype identified as Lives Challenge | auto | regex grep |
| 10 rounds explicitly listed with stage assignments | auto | count |
| Lives = 3 | auto | grep |
| Additive trap explicitly named as misconception | [LLM] | rubric |

**P0 cases MUST PASS for ship-readiness.** Converts "did Claude reason well?" from opinion to a per-assertion binary.

---

## Concrete Proof From This Session

| Event | Proof |
|-------|-------|
| Scale It Up v1 spec review | BLOCKED, 2 FAIL + 10 WARN — eval gate caught structural gaps before HTML |
| Match Up spec review | BLOCKED, 5 FAIL including missing misconception tags — drove v2 content |
| Both games tested in Playwright | Bugs found → fixed → re-tested with ISSUES_FIXED naming each |
| Standalone fallback bug | Appeared 2/2 → fed back to `game-building.md` as new rule + eval case |

---

## What We Can Show the Supervisor

| # | Evidence |
|---|---------|
| 1 | REVIEW_RESULT / TEST_RESULTS / VERDICT blocks from session |
| 2 | ISSUES_FIXED logs listing every bug + fix |
| 3 | v1 vs v2 skill diffs as lesson-loop evidence |
| 4 | `games/ratio-match-up/spec.md` lines 109-117 — direct evidence the FAIL drove structural change |
| 5 | `spec-creation/eval.md` Case 1 (Scale It Up was the literal eval input) |

---

## Worked Replay (anyone can repeat in < 5 min)

Match Up spec was reviewed against `spec-creation/eval.md` Case 1.

| Assertion | Where in spec | Judged | Result |
|-----------|--------------|--------|--------|
| Archetype = Lives Challenge | line 14: "Archetype: Lives Challenge" | auto: grep `^Archetype:` | PASS |
| 10 rounds with stage assignments | lines 163-219 | auto: count `^### Round` | PASS |
| Lives = 3 | line 27: "Lives: 3" | auto: grep `^Lives:` | PASS |
| Additive trap named as misconception | line 110: `MISC-RATIO-01 additive scaling` | [LLM]: rubric | PASS |

**4/4 P0. SHIP-READY for Case 1.** Items 1–3 will reproduce exactly. Item 4 carries inter-rater risk without a tighter rubric.

---

## Honest Gaps

### Gap 1 — Evals are human-runnable, not machine-runnable

**What "human-runnable" means today:**

| # | Step |
|---|------|
| 1 | Reviewer opens `eval.md` and reads Case 1 |
| 2 | Manually copies Input into fresh Claude conversation with skill loaded |
| 3 | Pastes Claude's output into scratch buffer |
| 4 | Reads Expect checklist, ticks `- [ ]` by eye (auto by grep, [LLM] by judgment) |
| 5 | Writes PASS/FAIL into session note. No file updated. No history. |

Two reviewers may disagree on `[LLM]` items.

**What automation requires (~5–6 days, not 2):**

| Component | Effort | Purpose |
|-----------|--------|--------|
| Test harness (Node script) | 1d | Load skill, call Claude API, capture output |
| Auto-assertion runner | 1d | Regex matchers for `auto`-tagged assertions |
| LLM-judge runner | 2d | Second Claude call per `[LLM]` with rubric; measure inter-rater |
| Regression diff | 1d | Compare current PASS/FAIL vs prior, surface P0 regressions |
| CI hook | 0.5d | Run on every skill edit |

**The doc 07 timeline allocated 2 days. That estimate was wrong.**

### Gap 2 — Visual + final review have no objective anchors

| Gate | Weakness | Mitigation needed |
|------|----------|------------------|
| visual-review | Pure LLM gestalt — "does the layout look broken?" Two reviewers can disagree. Inter-rater unmeasured. | Pixel-diff vs golden screenshot, computed bbox assertions, WCAG contrast checks |
| final-review | Aggregates prior pass signals → biased toward agreement. No objective anchor. | Blind-review mode OR held-out test reviewer runs from scratch |

**Until both exist, "final review APPROVED" carries less independent signal than doc 03 implies.**

---

## What Holds, What Doesn't

| Layer | Status |
|-------|--------|
| Layer 1 (traceability via shape) | SOLID |
| Layer 2 (artifacts on disk) | SOLID |
| Layer 3 (eval gates) | STRUCTURAL but human-shaped, bias-prone |

**The structural proof holds. The semantic proof is currently human-shaped. "Reproducible-by-hand" is weaker than CI but stronger than vibes — and every artifact from this session is a replay fixture for the future runner.**

---

## Review Response

| Reviewer | Finding | Resolution |
|----------|---------|-----------|
| QA | "Eval framework is human-runnable — be specific" | Gap 1 spells out the procedure + 5–6 day automation cost |
| Skeptic | "Reproducible-by-hand not actually reproduced — show example" | Worked Replay table |
| QA + Skeptic | "Visual + final review have no objective anchors" | Gap 2 acknowledges as known weakness with mitigation requirements |

### What still stands

| Fact | Status |
|------|--------|
| Layers 1 + 2 are real proof | Accepted |
| Layer 3 is structural but bias-prone | Acknowledged |
| Doc 07 timeline for eval runner was wrong (2d → 5–6d) | Corrected |
