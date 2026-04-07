# 06 — Per-Skill Concerns

## TL;DR (skim in 30 seconds)

- **Each of 15 skills has a weakest point**, named honestly below.
- **3 critical skills** (orchestration, game-building, data-contract) carry the largest blast radius.
- **9 standard skills**, each with a real but bounded gap.
- **3 advisory skills** (visual-review, final-review, gauge) all suffer from "LLM gestalt with no objective anchor."
- **Cross-skill concern: `data-contract` is the single point of failure for 6+ downstream skills.** Half a day of work would convert silent coupling to loud coupling. It is the single most leveraged fix in the pack.

(Skill = a Markdown procedure file Claude reads. PART = a CDN platform component referenced by skills. SPOF = single point of failure.)

---

## First Principles: Why Per-Skill Concerns?

### Step 1 — Why not list one big concern?
Because skills have different blast radii. A bug in `data-contract` breaks 6 downstream skills. A bug in `mobile` breaks one phase of one game. Treating them equally is wrong.

### Step 2 — How to read this doc?
Each skill has 4 fields: **Purpose, Biggest concern, Failure mode, Gap.** Read CRITICAL section first; the other two only if you're deciding what to ship next.

---

## CRITICAL Skills

### orchestration

| Field | Value |
|-------|-------|
| Purpose | Drives 12-step pipeline; routes steps to sub-agent vs main context |
| Biggest concern | Sub-agents don't inherit MCP — Playwright steps MUST run in main context |
| Failure mode | Orchestrator delegates Playwright to sub-agent; sub-agent fakes results; pipeline marches on with false "pass" |
| Mitigation | Step Execution Mode table in SKILL.md (MAIN vs SUB) |
| Gap | Table is convention not guardrail. No runtime enforcement. No crash-recovery / resume-from-step. |

### game-building

| Field | Value |
|-------|-------|
| Purpose | LLM-generates entire self-contained HTML from spec + plan + archetype |
| Biggest concern | Single monolithic LLM call. Every shipped bug traces here. Fix loops do NOT rescue bad gens. |
| Failure mode | Silent contract violation, white-screen init failure, or correct-looking HTML failing untested category |
| Mitigation | ALWAYS-loaded data-contract/mobile/feedback/archetypes; static validators; T1 checks |
| Gap | Generation quality is the only lever and is non-deterministic. No structured decomposition. Cross-skill prompt coherence unaudited. |

### data-contract

| Field | Value |
|-------|-------|
| Purpose | Canonical schemas: gameState, recordAttempt, game_complete, postMessage, syncDOM, trackEvent |
| Biggest concern | Ground truth for analytics + tests + platform simultaneously. Any drift silently breaks all three. |
| Failure mode | Schema change not propagated → games deploy + record wrong data + gauge reports junk → nobody notices for weeks |
| Mitigation | Referenced ALWAYS by 6+ skills. Validation rule IDs (GEN-PHASE-INIT etc.) |
| Gap | No schema versioning, no changelog, no consumer notification. Validation rules in separate file → drift possible. |

### game-testing

| Field | Value |
|-------|-------|
| Purpose | Run Playwright MCP, fix issues inline, emit structured category results |
| Biggest concern | Both tests AND fixes. Buggy fix can mask real gen-quality bug → ship broken as "all green" |
| Failure mode | Test author silences flaky assertion instead of flagging gen bug; Gen Quality slot never sees signal; bug recurs |
| Mitigation | TEST_RESULTS / CATEGORY_DETAIL / ISSUES_FIXED blocks force traceability |
| Gap | No rule against "never silence assertion." HTML-bug vs test-bug classification is pure LLM judgment. |

---

## STANDARD Skills

| Skill | Purpose | Biggest concern | Failure mode | Gap |
|-------|---------|----------------|--------------|-----|
| spec-creation | NL desc → structured spec | Input is messy NL, mixed Hindi/English | Hallucinated Bloom level / vague rounds → wasted build | No reject-and-clarify path |
| spec-review | Cheapest gate before compute | Threshold sets pipeline cost | Passes subtle misconception bug → teaches wrong thing | No tracking which checks catch real bugs |
| game-archetypes | 10 validated structural profiles | Coverage gap forces bad fits | Novel spec squeezed into wrong archetype → tests pass on wrong baseline | No new-archetype proposal workflow |
| game-planning | 5 plan docs (flow/screens/round/feedback/scoring) | Cross-doc inconsistency | scoring.md says 3 lives, round-flow.md says infinite → game-building picks one | No cross-doc validator |
| pedagogy | Bloom, misconceptions, scaffolding | Most external-knowledge dependent → highest hallucination risk | Wrong misconception entry propagates to every spec | No citation requirement, no teacher review loop |
| feedback | FeedbackManager API + emotional arc | Tightly coupled to CDN PART-017 | CDN API shift → silent audio failure | No version pin or compat check at build time |
| mobile | Budget Android constraints | Constraint set, not verifier | Touch target shrinks to 32px unnoticed | No automated mobile lint, no real-device step |
| deployment | GCP upload + Core API + content sets + health check | Multi-step external chain | Partial failure → orphan content set, 404 link | No transactional rollback, no idempotency |

---

## ADVISORY Skills

All three suffer from the same root issue: **LLM gestalt with no objective anchor.**

| Skill | Purpose | Failure mode | Gap |
|-------|---------|-------------|-----|
| visual-review | Screenshot audit per phase | Lets through layout bug or rejects fine layout aesthetically | No reference screenshots, no contrast/bbox checks |
| final-review | Compare built vs spec; APPROVE/REJECT | Rubber-stamps after seeing prior pass signals | No blind-review mode, no spec-compliance score |
| gauge | Query gameplay MCP, recommend changes | Recommends from < 30 sessions; treats noise as signal | No confidence intervals, no A/B comparison |

---

## Priority Ranking — Today Blockers vs Later

### TODAY blockers — must address before v0 ship

| # | Item | Why blocking |
|---|------|-------------|
| 1 | orchestration sub-agent MCP gap | Single failure mode that produces silent green builds. Needs runtime preflight, not table. |
| 2 | game-building decomposition | Source of every shipped bug. Fix loops don't help. Until decomposed, all reliability is capped. |
| 3 | data-contract schema versioning | See cross-skill section — largest blast radius in the pack |
| 4 | deployment rollback + idempotency | First failure produces orphan GCP/Core API state |
| 5 | gauge schema fields verified vs live DB | Will 500 on first real query. 30-min check, not done. |

### Soon-after — first week post-ship

| # | Item |
|---|------|
| 6 | game-testing "never silence assertion" rule + eval |
| 7 | pedagogy citation requirement on misconceptions |
| 8 | feedback CDN PART-017 version pin |
| 9 | final-review blind mode or compliance score |

### Nice-to-haves

10. spec-creation reject-and-clarify
11. spec-review historical check tracking
12. game-archetypes new-archetype workflow
13. game-planning cross-doc validator
14. mobile automated lint + real-device
15. visual-review reference screenshots + measurable metrics

---

## Cross-Skill Concern: `data-contract` Is a Single Point of Failure for 6+ Skills

| Downstream skill | How it depends |
|------------------|---------------|
| game-building | Generates HTML to match shapes |
| game-testing | Asserts shapes in tests |
| deployment | Reads inputSchema |
| gauge | Queries by field name |
| feedback | Reads recordAttempt shape |
| spec-creation | References field names |

**Failure mode:** Schema change not propagated → games generate fine + tests pass on old shape + deployment succeeds + gauge reports junk that nobody flags because data *exists*, just wrong.

### Concrete gaps

| Gap | Why it bites |
|-----|-------------|
| No `schema_version` field | Consumer can't ask "what version am I reading?" |
| No CHANGELOG.md | Reader can't diff yesterday vs today |
| No automated consumer notification | Editing SKILL.md doesn't flag any of 6 skills |
| Validation rules in separate file | Rules can drift from shape without check |

### Minimum mitigation: ~half a day

| # | Task |
|---|------|
| 1 | Add `schema_version` field |
| 2 | Add `CHANGELOG.md` to data-contract dir |
| 3 | Add CI check: SKILL.md touched without CHANGELOG.md = fail |

**This converts silent coupling into loud coupling. It is the single most leveraged fix in the pack and is the most likely source of a multi-week undetected regression. Worth fixing before v0 ships.**

---

## Review Response

All three reviewer panels approved. Shared note: per-skill honesty is the doc's value; no reviewer asked to soften.

| Finding | Where addressed |
|---------|----------------|
| Flat CRITICAL/STANDARD/ADVISORY understates urgency | Priority Ranking section: TODAY blockers vs later |
| Cross-skill concern (data-contract) larger than any single-skill gap | Promoted to its own section with mitigation cost |

### What still stands

| Fact | Status |
|------|--------|
| Each skill's weakest point named honestly | Accepted |
| 5 TODAY blockers must land before v0 | Accepted |
| data-contract mitigation is the highest-leverage half-day in the system | Accepted |
