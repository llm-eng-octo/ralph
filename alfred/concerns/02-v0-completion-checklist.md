# Alfred v0 Completion Checklist

## TL;DR (skim in 30 seconds)

- **v0 = one human + Claude Code can take a game idea to a deployed, gauged, iterated game** without ad-hoc work.
- **Honest completion: ~45%, not 70%.** Phases 1+2 (spec → plan → build) work end-to-end. Phases 3 (deploy) and 4 (gauge/iterate) have **never run on a real game**.
- **5 hard blockers** remain: 3 missing skill files, 1 unproven deploy, 1 unrun test harness.
- **Critical unknowns:** Core API, GCP upload, gauge schema — all assumed, none verified.

---

## First Principles: What Is "v0 Done"?

### Step 1 — What is Alfred trying to do?
Take a 1-sentence game idea from a creator and produce a deployed math game that students can play, with data flowing back so the creator can improve it.

### Step 2 — What are the phases?

| Phase | Job | Output |
|-------|-----|--------|
| 1. Plan | Spec creation, review, planning | spec.md + 5 plan docs |
| 2. Build | Generate HTML, test, fix, review | working index.html |
| 3. Deploy | Upload, register, content sets, health check | live URL |
| 4. Iterate | Gauge student data, decide changes, ship | improved game |

### Step 3 — When is v0 "done"?
When a single creator can drive **one game through all 4 phases** without falling back to manual work, and the orchestration prompt holds at every gate.

---

## Scope: In and Out

| In v0 | Out of v0 |
|-------|-----------|
| Single creator, single machine | Multi-game parallelism |
| One game at a time | Automated cron / queueing |
| Human gates every phase | Cross-game propagation (Loop D) |
| Local Playwright testing | Session design (Loop E) |
| Manual deploy via MCP | Live monitoring (Loop F) |
| Basic gauge via MCP | Visual regression baselines |
| Content-only iteration | Skill self-editing automation |

---

## Functionality Status (by Phase)

### Phase 1 — Spec + Plan

| Step | Skill | Status | "Done" means |
|------|-------|--------|--------------|
| 1 | spec-creation | DONE | Archetype-mapped spec with all sections |
| 2 | spec-review | PARTIAL | PASS/FAIL/WARN — no eval file |
| 3 | game-planning | DONE | 5 plan docs produced |
| — | Human gates wired | DONE | Orchestration enforces stop-and-wait |
| — | spec-review eval | TODO | No file |
| — | game-planning eval | TODO | No file |

### Phase 2 — Build + Test + Review

| Step | Skill | Status | Note |
|------|-------|--------|------|
| 4 | game-building | DONE | Both games built as inline HTML |
| 5 | validate-static + contract | DONE | Legacy validators work |
| 6 | game-testing | PARTIAL | 5-category harness NOT run; testing was ad-hoc |
| 7 | visual-review | TODO-SKILL | **File not written** |
| 8 | final-review | TODO-SKILL | **File not written** |
| 9 | Human preview gate | DONE | Manual play |

### Phase 3 — Deploy

| Item | Status | Risk |
|------|--------|------|
| Deploy skill exists | PARTIAL | Never executed |
| Core API MCP wired | UNVERIFIED | Zero touches |
| GCP upload path | UNVERIFIED | Zero touches |
| Post-deploy health check | TODO | No automated check |

### Phase 4 — Gauge + Iterate

| Item | Status | Risk |
|------|--------|------|
| gauge skill | PARTIAL | Depends on real student plays |
| Gameplay Data MCP | UNVERIFIED | Schema fields ASSUMED |
| iteration skill | TODO-SKILL | **File not written** |
| Content-only fast loop | TODO | Never proven |

---

## Honest Completion Matrix

| Dimension | Done | Total | % |
|-----------|------|-------|---|
| Skills with SKILL.md written | 12 | 15 | 80% |
| Skills with eval.md (any P0) | 6 | 15 | 40% |
| Phases proven end-to-end on real game | 2 | 4 | 50% |
| Deploy steps verified vs live Core API + GCP | 0 | 4 | 0% |
| Gauge queries verified vs live DB schema | 0 | 5 | 0% |
| Iteration loop closed (gauge → iterate → re-gauge) | 0 | 1 | 0% |
| Games deployed via Alfred end-to-end | 0 | 1 | 0% |

**Weighted by criticality (deploy + gauge are gating): ~45% v0-complete.** The original "70%" was optimistic by ~25 points.

---

## CRITICAL UNVERIFIED PATH (Phases 3 + 4)

> **Zero deploy steps have run against live Core API or GCP.** Zero gauge SQL templates have run against the live DB. Schema fields (`misconception_tag`, `response_time_ms`, `round_number`, `session_metrics.rounds_played`) are **assumed**, not verified. The first real attempt will likely surface schema mismatches, auth failures, idempotency gaps, or orphan-state bugs. **No estimate exists for how many days this debugging takes** because no surface area has been touched.

This is the single biggest v0 risk and was previously buried in PARTIAL/UNVERIFIED cells.

---

## What This Session Actually Built

| Game | Phase reached | Worked | Didn't |
|------|---------------|--------|--------|
| Scale It Up v2 | Phase 2 (local) | Spec → plan → HTML on revision pass | Step 6 5-cat harness skipped |
| Ratio Match Up | Phase 2 (local) | First-try HTML, contract correct | Steps 7, 8 ad-hoc; not deployed |

### Shortcuts Taken (and impact)

| Shortcut | Impact |
|----------|--------|
| 5-category Playwright harness skipped | Reliability claims = "looked OK in browser" not "passed structured suite" |
| visual-review skill not written | Future visual regressions undetected |
| final-review skill not written | Rejection-fix loop has never run |
| Deploy never executed | "Alfred can deploy" is unsupported |
| Gauge never executed | Iteration loop is design, not capability |

---

## The 5 Critical Things Missing for v0

| # | Missing | Why blocking |
|---|---------|--------------|
| 1 | `visual-review.md` skill | Step 7 has no procedure |
| 2 | `final-review.md` skill + rejection loop | Step 8 prompt-only |
| 3 | `iteration.md` skill | Phase 4 has no decision procedure |
| 4 | One proven end-to-end deploy | Phase 3 unproven on real game |
| 5 | One real 5-category test run | Step 6 never actually exercised |

**Secondary (not blocking, close behind):** Evals for spec-review, game-planning, game-building, game-testing, deployment.

---

## Review Response

### Reviewer findings addressed

| Reviewer | Finding | Where addressed |
|----------|---------|----------------|
| CEO | "70% there is a feeling, not a measurement" | Completion matrix → 45% honest |
| Eng | "Deploy and gauge never tested — don't bury it" | Promoted to top-level CRITICAL UNVERIFIED PATH callout |
| QA | "Ad-hoc shortcuts need concrete impact" | Shortcuts table with per-item impact |

### What still stands

| Fact | Status |
|------|--------|
| Phases 1 + 2 worked end-to-end on 2 games | Real |
| Orchestration stop-at-gate held | Real |
| Phase 3 + 4 are designs not capabilities | Acknowledged |
