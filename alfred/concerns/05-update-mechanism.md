# 05 — How Do We Update Alfred?

## TL;DR (skim in 30 seconds)

- **Every change has exactly one home**, decided by what kind of knowledge it is.
- **Identify the kind → open that file → edit → add an eval case → done.** No file owns more than one concept; no concept lives in more than one file.
- **Single source + pointers** is the rule. Duplication = drift = rot.
- **Today: enforced by author discipline.** No tooling backs the convention. ~4 days of script work would convert it to a guardrail.
- **The lesson loop has run exactly once.** Defined and demonstrated, not yet habitual.

---

## First Principles: Why This Matters

### Step 1 — What goes wrong without rules?
Same fix gets applied to 3 files because nobody knows which is canonical. The 3 files drift apart. The 4007-line `lib/prompts.js` is the worst-case version of this.

### Step 2 — What's the simplest rule that prevents drift?
Knowledge lives in **one** place. Everything else points to it. If two files describe the same thing, one is wrong (or about to be).

### Step 3 — How do we know where a change goes?
Match the **kind** of change to the **kind** of file. The decision tree below.

---

## The Update Decision Tree

(PART = a CDN platform component, e.g. `ProgressBarComponent`. SKILL = a procedure for using parts together.)

| Kind of change | Home file |
|---|---|
| Platform component change (CDN package, new method) | `parts/PART-NNN.md` |
| Procedure change (how to use components together) | `skills/<skill>/SKILL.md` |
| New constraint / pattern / edge case for a skill | `skills/<skill>/reference/<topic>.md` |
| Pedagogy / Bloom / curriculum / misconceptions | `skills/pedagogy/reference/` |
| Strategic / architectural decision | `design/` |
| Governing principle | `principles/knowledgebase.md` |
| Test case for a skill | `skills/<skill>/eval.md` |

**If a change seems to belong in two places, it belongs in one** — the more specific one — and the other links to it.

---

## Concrete Examples

| Change | Home |
|--------|------|
| ProgressBarComponent got a new method | `parts/PART-023.md` (no skill touched) |
| New gen rule from build failure | `skills/game-building/reference/code-patterns.md` |
| New Bloom mapping | `skills/pedagogy/reference/bloom-mapping.md` |
| New misconception discovered | `skills/pedagogy/reference/misconceptions.md` |
| New game archetype | `skills/game-archetypes/SKILL.md` + eval case |
| Standalone fallback bug (today) | `code-patterns.md` + eval case |

---

## The Lesson Loop

Every bug closes a loop:

| Step | Question / action |
|------|------------------|
| 1 | Which skill would have prevented this? Pick one. (None = a finding.) |
| 2 | Update that skill — rule, example, constraint, or PART reference |
| 3 | Add an eval case to `eval.md` so it can never recur silently |
| 4 | Run the eval against a sample HTML to confirm it catches the regression |

**Today's example:** standalone fallback bug → `game-building/reference/code-patterns.md` + P0 eval case. Run count: 1.

---

## The Two Principles

### Principle 1 — Single Source

| Thing | Lives in | Everywhere else |
|-------|----------|----------------|
| Constructor signatures | `parts/PART-NNN.md` | "Per PART-023" |
| Bloom mappings | `pedagogy/reference/bloom-mapping.md` | Link only |
| Misconception tags | `pedagogy/reference/misconceptions.md` | Link only |

**If you find yourself copying text between files, stop. Link instead.**

### Principle 12 — Owned

Every SKILL.md has:

| Field | Purpose |
|-------|--------|
| `## Owner` | Named accountable slot or person |
| Deletion trigger | Condition under which knowledge stops being true |

**Unowned knowledge rots regardless of other principles.**

| File class | Owner |
|-----------|-------|
| `parts/PART-NNN.md` | Platform sync process |
| `skills/<name>/` | Named slot (Gen Quality, Test Eng, Education...) |
| `design/` | Architecture discussion that produced it |
| `principles/knowledgebase.md` | Proposer + supervisor review |

---

## The Workflow

| # | Action |
|---|--------|
| 1 | Identify right file via decision tree |
| 2 | Make change inline with rationale + priority (CRITICAL/STANDARD/ADVISORY) |
| 3 | Grep for duplication; delete restatements or link |
| 4 | Add/update eval case in matching `eval.md` |
| 5 | Run eval against real artifact |

---

## What We Don't Want

| Anti-pattern | Why bad |
|-------------|--------|
| Scattered updates (same fix in 3 files) | Drift |
| Duplication across files | Drift |
| Files growing forever | Reference > 500 lines = split; SKILL > 300 lines = leaked PART knowledge |
| Bug fixes without eval cases | Silent regression |
| Orphan files | If not linked from `alfred/README.md`, doesn't exist |

---

## Honest Gaps

### Gap 1 — No tooling enforces the decision tree

"Grep for duplication" is a manual workflow step that won't survive ~100 files. There is no script that flags restated knowledge, no link checker for orphan refs, no detector for stale `Per PART-NNN` after a rename, no pre-commit hook refusing duplicate constructor signatures.

**Today: convention + author discipline + reviewer attention.** That is exactly the discipline assumption Doc 01 attacks elsewhere. We should not exempt ourselves.

### Gap 2 — The lesson loop has one data point

| Status | Value |
|--------|-------|
| Times the full loop has executed | 1 (standalone fallback) |
| Distinct bug classes the loop has handled | 1 |
| Required for "habitual" | 5+ |

**Defined and demonstrated. Not habitual.**

---

## Tooling We Would Build (~4 days total)

| # | Script | Effort | What it catches |
|---|--------|--------|----------------|
| 1 | `check-links.js` | 1d | Orphan + stale `Per PART-NNN` references |
| 2 | `check-duplication.js` | 1d | Restated canonical concepts |
| 3 | `check-reachability.js` | 0.5d | Files not reachable from README |
| 4 | `lesson-loop-audit.js` | 1d | Resolved BUG without skill change + eval case |
| 5 | Pre-commit hook wiring 1–4 | 0.5d | Refuses bad commits |
| 6 | CI job (same checks on PRs) | 0.5d | Hook can't be bypassed |

**Until these exist, this doc's claims rest on author discipline.**

---

## Review Response

All three reviewer panels approved. Two concessions tracked above:

| Reviewer | Finding | Resolution |
|----------|---------|-----------|
| Eng/QA | "No tooling backs the convention" | Gap 1 + Tooling table (~4 days work) |
| Systems | "Lesson loop has run once" | Gap 2 — 1/5+ for habitual |

### What still stands

| Fact | Status |
|------|--------|
| Decision tree is the right mental model | Accepted |
| Single-source principle is the right rule | Accepted |
| Enforcement requires tooling | Not yet built |
