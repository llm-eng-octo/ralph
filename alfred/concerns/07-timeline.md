# 07 — Timeline to Ship

## TL;DR (skim in 30 seconds)

- **v0 ships when 5 gates are green, NOT on a date.** Previous "17-day" claim was rejected as fantasy.
- **Realistic window: 4–6 weeks (50% confidence).** 80% confidence by 2026-06-01. Worst case 10 weeks. Best case 3.
- **Gate 1 (deploy) and Gate 4 (gauge) are HIGH RISK** — first-real-integration unknowns, likely 3–10 days each.
- **Three things we need from supervisor:** approval to chase gates not dates, Core API credentials this week, confirmation v0 = "5 gates green."

---

## First Principles: What Does "Ship" Mean?

### Step 1 — What is shipping?
Not "the architecture is done." Not "the docs look complete." **A non-engineer creator drives a deployed, student-ready game through this pipeline unattended.**

### Step 2 — What blocks that?
Five gates. All five must be green. They can be worked in any order, on any timeline.

### Step 3 — Why no calendar date?
Because two of the five gates have **never been touched** (deploy, gauge schema). First-real-integration is the historical eater of estimates. Promising a date is promising a guess.

---

## Where We Are Today (2026-04-07)

| Metric | Value |
|--------|-------|
| Files | 95 |
| Lines | ~12,500 |
| PARTs | 38 |
| Skills | 15 |
| Skill evals | 6 |
| Games built end-to-end locally | 2 (Scale It Up v2, Ratio Match Up) |
| Games deployed via Alfred | 0 |
| Skill → eval coverage | 40%, all manual |

---

## The 5 Gates

v0 ships when ALL five are green. Order does not matter.

### Gate 1 — One game deployed end-to-end through Core API

| Field | Value |
|-------|-------|
| Effort | 3–10 days |
| Risk | HIGH |
| Why range so wide | Core API integration has never been touched |
| Dependencies | Auth, GCP perms, content-set schema, idempotent retry |
| Done = | Health check green, reachable URL, one real student session recorded |

### Gate 2 — Working eval runner

| Field | Value |
|-------|-------|
| Effort | 4–7 days |
| Risk | MEDIUM |
| Why | LLM-judge tuning + inter-rater reliability unmeasured |
| Dependencies | P0 cases for the 9 missing skills (3–5 days, partially parallel) |
| Done = | One command runs all evals, diffs prior, exits non-zero on regression |

### Gate 3 — Sub-agent MCP gap structurally fixed

| Field | Value |
|-------|-------|
| Effort | 2–5 days |
| Risk | MEDIUM |
| Options | (a) preflight runtime check refusing if Playwright unreachable, OR (b) main-context-only routing |
| Why range | Option (b) may need pipeline restructure |
| Done = | No code path can silently false-green; eval case proves it |

### Gate 4 — One closed gauge → iterate → re-gauge cycle on real data

| Field | Value |
|-------|-------|
| Effort | 5–10 days |
| Risk | HIGH |
| Why | Schema assumptions (`misconception_tag`, `response_time_ms`) untested; will likely 500 on first query |
| Dependencies | Gate 1 first; real student attempts; Gameplay MCP confirmed |
| Done = | Insight from real data → content swap → re-gauge shows directional improvement |

### Gate 5 — Pedagogy skill grounded in cited sources

| Field | Value |
|-------|-------|
| Effort | 3–5 days |
| Risk | LOW–MEDIUM |
| Why | Mostly research/curation; deterministic |
| Dependencies | NCERT chapter access, Khan Academy mapping, learning-science citations |
| Done = | Every Bloom claim and misconception cites an external source |

---

## Per-Gate Blockers

| Gate | Blocker | Day impact |
|------|---------|-----------|
| 1 | Core API auth not provisioned | +3–7 |
| 1 | GCP bucket perms / orphan cleanup | +2–5 |
| 1 | CDN PART version drift mid-deploy | +1–3 |
| 2 | LLM judge non-determinism | +2–4 |
| 2 | P0 case authoring slower than 3hr/skill | +2–4 |
| 3 | Pipeline restructure if option (b) | +3–7 |
| 4 | Gauge schema fields don't exist in live DB | +2–5 |
| 4 | Insufficient real attempts → wait for traffic | +1–3 weeks |
| 5 | NCERT alignment surfaces curriculum gaps | +2–4 |

### Stacked scenarios

| Scenario | Total |
|----------|-------|
| Worst-case stacked | ~10 weeks |
| Best-case stacked | ~3 weeks |
| Typical (50% confidence) | 4–6 weeks |
| 80% confidence ceiling | ~8 weeks |

**The 4–6 week window assumes typical friction and partial parallelization (Gates 2, 3, 5 run concurrently with Gate 1).**

---

## What We Are NOT Promising

| Claim | Status |
|-------|--------|
| A specific ship date | Refused |
| Deploy works first try | No |
| Gauge schema matches our assumptions | No |
| Eval coverage reaches 100% before v0 | P0-only is the bar |
| First deployed game = third built | Could be fifth or sixth after debugging |

---

## v1 (Post-v0)

4–8 weeks after v0. Eval runner on every commit, visual review via screenshot diffing, skill ↔ PART sync, 50+ games shipped, gauge loop driving Loop B, session design (Loop E) wired in.

---

## What We Need From Supervisor

| # | Ask |
|---|-----|
| 1 | Approval to chase 5 gates in priority order, not a calendar |
| 2 | Core API credentials + sandbox content-set provisioned this week (unblocks Gate 1) |
| 3 | Confirm v0 = "5 gates green," not "calendar date hit" |

---

## Review Response

The CEO+Skeptic reviewer rejected the prior 17-day claim as fantasy. This rewrite accepts that verdict in full.

| Finding | Resolution |
|---------|-----------|
| 17-day fantasy | Dropped entirely. No calendar replaces it. |
| No risk acknowledgment | Per-gate effort/risk/dependencies; per-blocker day impact |
| False precision | 50%/80% bands instead of single-point estimate |
| Untested deploy buried | Gate 1 marked HIGH risk with explicit "never touched" note |
| Day-1 Eng/QA blockers ignored | Folded into per-gate blocker table |
| "5 games in week 2" plan unrealistic | Removed |

### What still stands

| Fact | Status |
|------|--------|
| 5 gates are the right framing | Accepted |
| Parallelization is possible across Gates 2, 3, 5 | Accepted |
| Range bands honest, not false precision | Accepted |
