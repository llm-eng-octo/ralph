# Supervisor Brief — Alfred Checkpoint

**Date:** 2026-04-07
**Decision needed:** Freeze the approach (skills + Claude orchestrator)?
**Recommendation:** **Conditional approve.** Approach is correct. Timeline is optimistic. Specific gates required before declaring v0 ship-ready.

---

## The Question

Why is skills + Claude as orchestrator the BEST approach? Why is a script the WRONG way?

## The Answer (one paragraph)

The current `lib/prompts.js` is a **4007-line monolithic script** that contradicts itself (e.g., setTimeout-destroy clause directly contradicts GEN-PROGRESSBAR-DESTROY) and grows forever as new lessons are bolted on. Alfred is **14 SKILL.md files ≤300 lines each**, plus reference files loaded on demand, plus 38 individual PART files. When a bug is found, we update **one skill once** and every future game is immune. This session proved it: the standalone-fallback bug appeared in BOTH games we built (Scale It Up v2 and Match Up) → we fixed the SKILL once → the next game won't have it. With the script approach, the same bug would have to be fixed in every prompt-builder path.

---

## What We Built Today

| What | Result |
|------|--------|
| Scale It Up v2 (rebuild) | Built end-to-end. 12 issues caught and fixed. Playable. |
| Ratio Match Up | Built end-to-end. 1 critical bug caught (game_init handler missing standalone fallback). Playable. |
| Lesson loop | Bug found in both games → fed back into `skills/game-building/reference/code-patterns.md` once → future games immune |
| Concerns folder | 8 detailed answer docs + 3 multi-persona reviews |

---

## The 8 Concern Docs

| # | Question | Answer (TL;DR) |
|---|----------|---------------|
| 1 | Why skills not script? | Script is 4007 lines and self-contradicting; skills compose, scale, self-correct |
| 2 | V0 completion? | ~70% there. 3 skills missing. 5 critical gaps. |
| 3 | Reliability? | Reliable enough to ship attended. Lesson loop works. Repeat-bug rate matters most. |
| 4 | Iteration? | 3 levels: content swap (minutes), spec tweak (hours), full rebuild |
| 5 | How to update? | Decision tree by knowledge type. Single source per concept. Lesson loop closes cycle. |
| 6 | Per-skill concerns? | game-building is dominant non-determinism risk. data-contract has no versioning. |
| 7 | Timeline? | v0 in ~17 days (target 2026-04-24). Critical: 5-day pause to backfill evals + runner. |
| 8 | Claude reasoning proof? | 3 layers: artifact traceability, per-stage outputs, eval checklists. |

---

## Reviewer Verdicts (6 personas)

### Approve (with conditions): 4 of 8 docs
- 01 (Why skills) — Convincing, well-evidenced
- 02 (V0 checklist) — Honest gap inventory
- 04 (Iteration) — Conceptually sound
- 08 (Claude reasoning) — Three-layer proof framework is solid

### Approve outright: 2 of 8 docs
- 05 (How to update) — Clear, actionable
- 06 (Per-skill concerns) — Brutally honest

### Reject: 2 of 8 docs
- 03 (Reliability) — N=2 is not enough evidence; 50% repeat-bug rate (1 of 2) unstated
- 07 (Timeline) — 17 days to v0 is fantasy given unverified deploy + unbuilt eval runner

---

## The 5 Things That Block "Ship Approval"

From CEO/Skeptic, Pedagogy/Systems, and Eng/QA reviewers — these are the gates:

1. **One real deployed game.** Not "built locally and tested in Playwright" — actually deployed via Core API, accessible to a real student.
2. **Working eval runner.** Currently evals are markdown checklists run by hand. Need automated runner with judge tiers.
3. **Structural fix for sub-agent MCP gap.** Currently game-testing falls back to silent code analysis when sub-agents can't access Playwright. This is a prompt-only guardrail — needs runtime enforcement.
4. **One closed gauge → iterate cycle.** Synthetic data doesn't count. Need to query real student data, derive insight, change content, redeploy, observe improvement.
5. **Pedagogy grounding.** Pedagogy skill is LLM-authored with no citations to NCERT, Khan Academy, or learning science literature. Highest hallucination risk in the stack. Needs external source-of-truth.

---

## Top 3 Hidden Risks

From all 6 reviewers:

1. **Pedagogy hallucinations compounding.** No external ground truth means Alfred can confidently generate pedagogically wrong content. Risk grows with every game.
2. **data-contract is a single point of failure with no versioning.** Six skills depend on it. Any change silently couples all of them.
3. **Repeat-bug rate is the real reliability metric.** N=2 is too small to claim reliability. Need N=10+ before any reliability claims hold.

---

## Day-1 Production Issues

Things that will break the moment Alfred goes live:

- Orphaned GCP/Core API records on first failed deploy (no transactional safety)
- Concurrent creators corrupting the warehouse directory (no locking)
- First CDN PART version bump breaking all live games (no version pinning)
- Silent sub-agent false-greens in testing (the silent fallback is unguarded)
- Gauge SQL queries failing on unverified schema

---

## Recommended Decision

**Freeze the approach. Skills + Claude orchestrator is correct.**
**Do NOT freeze the timeline. v0 in 17 days is unsupported.**

**Conditions for v0 ship:**
1. One game deployed to production (not local Playwright)
2. Eval runner working with at least the 6 existing eval files
3. Sub-agent MCP gap resolved (either main-context-only routing or runtime enforcement)
4. One closed gauge→iterate cycle on real data
5. Pedagogy skill grounded in cited sources (NCERT chapter references at minimum)

**Estimated time to meet all 5 gates: 4-6 weeks, not 17 days.**

---

## How to Read This Folder

- Want the honest gaps? Read [02-v0-completion-checklist.md](02-v0-completion-checklist.md) and [06-per-skill-concerns.md](06-per-skill-concerns.md)
- Want the defense of the approach? Read [01-why-skills-not-script.md](01-why-skills-not-script.md)
- Want the harshest critique? Read [REVIEW-ceo-skeptic.md](REVIEW-ceo-skeptic.md)
- Want the systemic risks? Read [REVIEW-pedagogy-systems.md](REVIEW-pedagogy-systems.md)
- Want the production blockers? Read [REVIEW-engineering-qa.md](REVIEW-engineering-qa.md)
- Want the index? Read [README.md](README.md)
