# REVIEW — Platform Engineer + QA Engineer

Two-persona review of `alfred/concerns/01-08`. PE = Platform Engineer (infra, CDN, APIs, scale, security). QA = QA/Test Engineer (testability, evals, regression).

---

## 01 — Why Skills, Not Script

- **PE:** (1) "One edit, every future game immune" assumes all skills are re-read fresh each run — no caching layer, no versioning of skill-at-build-time. If CDN PART changes mid-build, half a game references the old part. (2) No rate-limit/token-budget math: orchestrator doing 3-5 skill reads + sub-agents per build at 10x scale will hit Anthropic tier limits. (3) Megaprompt retirement implies tight MCP availability SLA — no fallback if Playwright/Core API MCP is down.
- **QA:** (1) "Log₂ vs N² bug scaling" is an assertion, not a measurement — no baseline metric defined. (2) The `CDN_CONSTRAINTS_BLOCK` contradiction story is untestable from the skill side because the eval framework doesn't yet detect rule-conflicts across skills. (3) Non-determinism mitigation ("eval.md is the regression layer") assumes evals exist — coverage is 35%.

## 02 — v0 Completion Checklist

- **PE:** (1) Phase 3 Deploy is marked PARTIAL/UNVERIFIED — Core API auth, GCP bucket perms, idempotency, and retries have never been exercised; this is the single largest infra unknown. (2) No post-deploy rollback story if registration succeeds but content set upload fails (orphan state). (3) "Single-creator, single-machine" explicitly excludes concurrency — first second creator will race on `warehouse/templates/` dir.
- **QA:** (1) Step 6 "didn't actually run the full 5-category harness" means v0 is being called 70% done against an untested definition of done. (2) No acceptance criteria for "one proven end-to-end deploy" — what makes it proven? Health check only? Student play? (3) Evals missing for 5 of the skills on the critical path; checklist treats them as secondary but they gate everything.

## 03 — Reliability

- **PE:** (1) Sub-agent MCP gap is called a "norm enforced by a prompt, not runtime" — this IS an infrastructure bug, not a reliability nuance; it will silently green-light broken games. (2) "Post-deploy health checks" are listed for the future — production has zero liveness monitoring today. (3) No SLO/SLI defined (availability, first-attempt success rate, time-to-recover).
- **QA:** (1) 6/17 eval coverage (35%) while claiming "reliable enough to ship today" is contradictory. (2) Every metric in §7 is "Manual, per session" — no trend, no regression detection, no CI. (3) "Visual review is a checklist not a diff" — acknowledged gap but no interim detection (e.g., DOM bounding box assertions).

## 04 — Iteration

- **PE:** (1) Content-only swap depends on Gameplay Data MCP + Core API both present; neither has an availability target or failure mode documented. (2) Gauge SQL templates reference schema fields (`misconception_tag`, `response_time_ms`) nobody has confirmed exist in the live DB — will 500 on first real query. (3) No content-set versioning → rollback of a bad content swap is undefined.
- **QA:** (1) "Minimum 30 sessions" is a hard-coded threshold with no test for low-sample warning surfacing in output. (2) Iteration skill file does not exist — cannot be evaluated. (3) No regression test that a content-only swap preserves behavior on unchanged rounds.

## 05 — Update Mechanism

- **PE:** (1) "Grep for duplication" as a manual workflow step will not hold at 100+ skills — needs tooling. (2) PART sync from warehouse is described as a process, not a mechanism; no CI hook, no diff alarm. (3) No concurrent-edit story — two slots editing same reference file produces merge conflicts with no owner.
- **QA:** (1) "Run the eval" is listed as manual step 5 — at scale, nobody will. (2) No test that the decision tree itself is followed (orphan detection, duplicate detection, link-check). (3) Deletion triggers are free-text; no automation to check if the trigger condition fired.

## 06 — Per-Skill Concerns

- **PE:** (1) `deployment` skill admits "no transactional rollback, no idempotency" — this will create orphaned GCP uploads and Core API zombies on first real failure. (2) `feedback` skill has no version pin against CDN PART-017 — a CDN bump silently breaks every live game. (3) `orchestration` has no crash-recovery / resume-from-step — if Claude context drops at Step 8, rerun starts from Step 1.
- **QA:** (1) `game-testing` can both test AND fix — no assertion-silencing detector means a bug-masking fix passes eval. (2) `visual-review` is "LLM gestalt" with no measurable metric — untestable by definition. (3) `game-planning` produces 5 freeform markdown docs with no schema → no consistency validator possible today.

## 07 — Timeline

- **PE:** (1) 17-day v0 assumes zero Core API surprises — historically every first-real integration eats 3-5 days minimum. (2) No buffer for CDN regressions during the 5-game validation week. (3) "Non-engineer creator drives pipeline" implies packaging/distribution work (install, auth, Claude Code setup) that isn't in the plan.
- **QA:** (1) Eval backfill in 3 days (9 skills) = 3 hours/skill including P0 cases — aggressive if each case needs a fixture HTML. (2) Eval runner in 2 days assumes judge tiers work first try — LLM-judge prompt tuning typically eats days. (3) No regression baseline captured before eval runner ships → can't detect drift.

## 08 — Reasoning Proof

- **PE:** (1) "Files on disk" is the proof layer but there's no retention, no structured log store, no query layer — debug requires SSH + grep. (2) No audit trail of WHICH skill version produced WHICH artifact. (3) LLM-judge assertions require API budget that is not sized.
- **QA:** (1) "Reproducible by hand" is not reproducibility — two humans will tick boxes differently on `[LLM]` assertions. (2) Checklist assertions tagged `auto` have no implementation — the regex matchers don't exist. (3) No golden-artifact corpus → regressions on "did Claude reason well?" are detectable only by eye.

---

## Top 3 Infrastructure Gaps

1. **Deploy path is entirely unverified and non-transactional.** Core API + GCP + content sets have no rollback, idempotency, or health monitoring. First real failure produces orphan state.
2. **Sub-agent MCP inheritance is a runtime bug enforced only by prompt convention.** Playwright/Core API silently unavailable in delegated steps = false greens.
3. **No CDN version pinning, no dependency-sync mechanism, no liveness monitoring on shipped games.** A PART-017 bump breaks every live game with zero alerting.

## Top 3 Testability Gaps

1. **Eval coverage is 35% while the system is called ship-ready.** 9 critical skills have zero P0 cases.
2. **Eval runner does not exist.** Every assertion is human-ticked; regressions are undetectable between sessions.
3. **Visual review and final review are LLM gestalt with no measurable anchors** (bounding boxes, contrast ratios, golden screenshots). Inter-rater reliability is untested.

## Day-1 Production Issues

1. **First real deploy will orphan a GCP upload or Core API record** — no idempotent retry, no rollback.
2. **Gauge skill will 500 on the first real query** — schema assumptions (`misconception_tag`, `response_time_ms`) are unverified against the live Gameplay Data MCP.
3. **Concurrent creator = corrupted `warehouse/templates/` dir** — architecture explicitly single-creator, no lock.
4. **A sub-agent will silently skip Playwright testing and report green** — no runtime guard.
5. **First CDN PART bump will break every live game** with no alerting and no version pin.
