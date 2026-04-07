# 03 — How Reliable Is Alfred?

## TL;DR (skim in 30 seconds)

- **Sample size: N=2 games.** Anything beyond "anecdote" is unsupported.
- **Reliable enough to ship "attended"** — meaning a human plays end-to-end and signs off before any student touches the game.
- **NOT reliable** unattended, NOT reliable pedagogically, NOT measured on most dimensions.
- **One known repeat bug** (standalone fallback) appeared in BOTH games = **50% repeat-bug rate at N=2**, not "near zero."
- **The lesson loop has run exactly once.** Existence proof, not track record.

---

## First Principles: What Does "Reliable" Mean Here?

### Step 1 — What is the job?
Turn a game description into a deployed math game that students can play without bugs, that teaches what it claims to teach.

### Step 2 — What can fail?

| Failure type | Example | Caught by |
|--------------|---------|-----------|
| Code bug | White screen, broken click | Playwright tests |
| Contract bug | Wrong recordAttempt shape | Static validators |
| Visual bug | Overlapping buttons | Visual review (gestalt) |
| Pedagogy bug | Teaches wrong concept | Nothing currently |
| Deploy bug | 404, orphaned upload | Health check (unwritten) |

### Step 3 — Reliability = (failures caught before student) / (failures total)
We don't know either number with N=2. We only know the gates structurally exist.

---

## What "Attended Ship" Means (Precisely)

Every game, before a student sees it, must pass:

| Gate | Requirement |
|------|-------------|
| 1 | Human plays the deployed HTML end-to-end on mobile viewport (not screenshot, not description) |
| 2 | Named human reviewer signs off in writing in `games/<name>/index.md` |
| 3 | Human can reject and re-queue at zero cost |

**If any gate is skipped, Alfred makes no reliability claim about that game.**

---

## The Evidence (and Its Limits)

| Game | Built | Bugs caught at Step 6 | Repeat bugs |
|------|-------|----------------------|-------------|
| Scale It Up v2 | YES | 12 | standalone-fallback |
| Ratio Match Up | YES | 1 critical | standalone-fallback |

**N=2 is an anecdote, not a distribution.** Any claim "Alfred reliably…" needs N ≥ 20+ from games not built by the same operator in the same session.

---

## Where Reliability *Does* Come From

These are **necessary conditions** for reliability — not reliability itself.

| Source | What it gives us |
|--------|-----------------|
| Versioned skills with evals | Knowledge is testable, not vibes |
| Foundation skills are deterministic specs | data-contract enumerates every field |
| Multi-stage gates | Bug must slip through 5 layers to reach student |
| Single source + pointers | One fix propagates on next read |

These caught 13 bugs across 2 games before any human saw them. That is necessary, not sufficient.

---

## What Is NOT Reliable Yet (Explicit)

| # | Area | Why not reliable |
|---|------|------------------|
| 1 | **Pedagogy** | No metric for misconception-hit, hint efficacy, transfer. Game can be playable + wrong-teaching. |
| 2 | **Eval coverage** | 6/17 skills (35%). Two-thirds of system unverified by the mechanism we cite as the verifier. |
| 3 | **Sub-agent MCP gap** | Sub-agents don't inherit Playwright. Mitigated by a *string in a markdown file*. Unmitigated risk. |
| 4 | **`game-building` SPOF** | One monolithic LLM call. Fix loops do NOT rescue bad gens. Every other skill capped by this. |
| 5 | **No CI / no eval runner** | Metrics collected by hand when somebody remembers. |
| 6 | **Visual + final review** | LLM gestalt. No bounding boxes, no contrast checks, no golden screenshots. |
| 7 | **Deploy verification** | Phase 3 has never run. Reliability = 0/0. |

---

## Reliability Metrics We Don't Have

| Metric | Why it matters | Status |
|--------|---------------|--------|
| First-attempt build success rate (N≥20) | True base rate | Not collected |
| Repeat-bug rate (rolling window) | Lesson loop compounding | 50% on N=2 |
| Misconception-hit rate per spec | Pedagogy reliability | Not collected |
| Transfer-task success | Does game teach? | Not collected |
| Sub-agent MCP availability per build | Detect silent skips | Not collected |
| Eval pass rate per skill across versions | Regression detection | Not collected |
| Time-to-detect regression | How long bad code lives | Undefined |
| Inter-rater reliability on visual/final | Are gestalt reviews stable? | Not measured |

**Until these exist, every reliability claim is qualitative.**

---

## Reliability Roadmap (Priority Order)

| # | Item | Why this order |
|---|------|---------------|
| 1 | Eval runner (automate manual walkthroughs) | Unblocks every other metric |
| 2 | Close sub-agent MCP gap structurally | Eliminates silent green builds |
| 3 | Decompose `game-building` per-section | Removes single point of failure |
| 4 | Pedagogy gate (citations + teacher review) | Closes biggest unmitigated gap |
| 5 | Visual regression baseline screenshots | Replaces gestalt with diff |
| 6 | Eval coverage 35% → 100% on core skills | Required for "ship-ready" claim |
| 7 | Deploy dry-run (Core API + GCP + rollback) | Required for any Phase 3 claim |

**Until items 1–3 are done, Alfred is a reliable assistant for an attentive operator on N=2. Nothing more.**

---

## Review Response

| Reviewer | Finding | Resolution |
|----------|---------|-----------|
| CEO/Skeptic | "N=2 is not evidence; 50% repeat hand-waved" | TL;DR + evidence section state N=2 and 50% explicitly. All "reliable today" language removed. |
| Skeptic | "'Attended' undefined" | "Attended ship" defined in 3 concrete gates. |
| Eng/QA | "35% eval coverage contradicts 'reliable'" | Listed as not-reliable item #2; roadmap items #1–2 address. |
| Pedagogy | "Could ship games that teach wrong things" | Listed as not-reliable item #1 (top); roadmap item #4. |
| Systems | "`game-building` is unaddressed SPOF" | Listed as item #4; roadmap item #3 commits to decomposition. Acknowledged won't land in v0. |

### What still stands

| Limitation | Status |
|-----------|--------|
| Lesson loop on N=1 | Need more games |
| Decomposition of game-building won't land in v0 | Mitigation = attended ship + Step 6 |
| No head-to-head measurement vs script pipeline | TODO |
