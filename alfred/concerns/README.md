# Concerns

Answers to the supervisor's checkpoint questions about Alfred. Written 2026-04-07 ahead of the 12pm freeze decision.

**Start here:** [SUPERVISOR-BRIEF.md](SUPERVISOR-BRIEF.md) — 2-minute executive summary across all concerns + reviews.

## Index

| # | Question | Doc |
|---|----------|-----|
| 1 | Why is skills + Claude orchestrator the BEST approach? Why is a script the WRONG way? | [01-why-skills-not-script.md](01-why-skills-not-script.md) |
| 2 | What's the v0 completion checklist? What's done, what's pending? | [02-v0-completion-checklist.md](02-v0-completion-checklist.md) |
| 3 | How reliable is Alfred? What are the failure modes? | [03-reliability.md](03-reliability.md) |
| 4 | How does iteration work? What happens when a creator wants to change a game? | [04-iteration.md](04-iteration.md) |
| 5 | How and where do we update Alfred? | [05-update-mechanism.md](05-update-mechanism.md) |
| 6 | What are the concerns for each skill? | [06-per-skill-concerns.md](06-per-skill-concerns.md) |
| 7 | What's the timeline to v0 and v1? | [07-timeline.md](07-timeline.md) |
| 8 | How do we PROVE Claude's reasoning works at every step? | [08-claude-reasoning-proof.md](08-claude-reasoning-proof.md) |

## Reviews

Multi-persona reviews of all concern docs (CEO, Skeptic, Pedagogy Expert, Systems Architect, Platform Engineer, QA):

| File | Reviewers |
|------|-----------|
| [REVIEW-ceo-skeptic.md](REVIEW-ceo-skeptic.md) | CEO, Skeptical Engineer |
| [REVIEW-pedagogy-systems.md](REVIEW-pedagogy-systems.md) | Pedagogy Expert, Systems Architect |
| [REVIEW-engineering-qa.md](REVIEW-engineering-qa.md) | Platform Engineer, QA Engineer |

## TL;DR Across All Concerns

- **Approach:** Skills + Claude orchestrator beats script because skills compose, scale, and self-correct via the lesson loop. Evidence: lib/prompts.js is 4007 lines and contradicts itself; Alfred is 14 SKILL.md files ≤300 lines each.
- **V0 Status:** ~70% there. 2 games built end-to-end today (Scale It Up v2, Ratio Match Up). 5 critical gaps remain: visual-review skill, final-review skill, iteration skill, real deploy via Core API, real Playwright 5-category test run.
- **Reliability:** Reliable enough to ship attended (human in loop). Not yet unattended. Same bug appearing twice → fed back into skill once → future games immune.
- **Iteration:** 3 levels (content swap = minutes, spec tweak = hours, full rebuild = full pipeline). Gauge step exists, MCP integration not yet exercised on real student data.
- **Updates:** Decision tree by knowledge type. Single source of truth per concept. Lesson loop closes when bug → skill update → eval case.
- **Per-skill concerns:** game-building is the dominant non-determinism risk. data-contract has no versioning. game-testing conflates test+fix. Visual/final review have no objective anchors.
- **Timeline:** v0 in ~17 days (target: 2026-04-24). v1 late May / early June. Critical ask: 5-day pause to backfill evals + build runner.
- **Reasoning proof:** Three layers — artifact traceability, per-stage outputs, eval checklists. Honest gap: evals are human-runnable, automated runner is target.
