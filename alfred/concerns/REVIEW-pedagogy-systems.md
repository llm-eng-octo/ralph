# REVIEW: Pedagogy Expert + Systems Architect

Two-persona review of all 8 concern docs. Findings are critical on purpose — the docs already state their strengths.

---

## 01 — Why Skills, Not a Script

**Pedagogy Expert**
- Entire argument is framed around *engineering* entropy (4007-line megaprompt). Not a single sentence asks whether sharded skills produce *better learning*. The win condition is "fewer bugs," not "more kids understand ratio."
- "One edit, one owner" is great for platform parts; dangerous for pedagogy. A misconception taxonomy update should trigger re-review of every dependent spec, not silently propagate.

**Systems Architect**
- O(N) vs O(N²) claim assumes perfect skill routing. Trigger-scoping is itself a stochastic decision — skill-miss is a new failure mode that replaces prompt-contradiction, not eliminates it.
- Single point of failure moved from `prompts.js` to the orchestrator's skill-selection logic. Unmodeled.

---

## 02 — v0 Completion Checklist

**Pedagogy Expert**
- v0 explicitly excludes gauge against real students. Shipping "v0" with zero evidence games teach anything is a category error — this is a code-factory checklist, not a learning-factory checklist.
- "Done" for spec-creation = "archetype-mapped with all required sections." No pedagogy gate. A spec can be structurally complete and pedagogically incoherent.

**Systems Architect**
- 5 critical missing items + 9 missing evals + unverified deploy + unverified gauge = v0 is ~40% there, not 70%. Self-assessment is optimistic by roughly double.
- Phase 3 and Phase 4 both "UNVERIFIED" — these are the only phases that close feedback loops. Declaring v0 without them means shipping an open-loop system.

---

## 03 — Reliability

**Pedagogy Expert**
- "Reliability" metrics are all engineering (pass rate, spec→playable time). Zero metrics for *learning reliability*: misconception-hit rate, hint efficacy, re-engagement after failure.
- "Bugs caught by gates vs reaching human" treats the human as the last line of defense. The real last line is the student, and no metric exists for that cohort.

**Systems Architect**
- §4 lists 7 known failure modes; §5 mitigates 2 of them. Gap is implicit.
- "Sub-agents silently lose Playwright MCP" is enforced by a prompt, not runtime. This is the single fragility multiplier — one prompt edit from shipping green-but-untested builds.

---

## 04 — Iteration

**Pedagogy Expert**
- Three levels are cost-ordered, not pedagogy-ordered. A content-only swap is "fastest" but can mask the real problem (wrong scaffolding) and make the next cohort the control group for a bad hypothesis.
- Gauge's 5 questions are behavioral proxies. None measure *transfer* — whether the student can apply the concept outside the game. The loop closes on engagement, not learning.

**Systems Architect**
- The iteration skill file doesn't exist yet (§9). The single-most-leverage loop has no playbook.
- No spec/skill versioning means iteration mutates state in place — no rollback, no A/B, no causal attribution of which change moved which metric. The loop is lossy by design.

---

## 05 — Update Mechanism

**Pedagogy Expert**
- Decision tree routes pedagogy updates to `skills/pedagogy/reference/` with no review gate. A single LLM-authored misconception entry propagates to every downstream spec with no teacher sign-off.
- "Run the eval" as step 5 assumes evals exist for pedagogy content. They mostly don't.

**Systems Architect**
- "Grep for duplication" is a human-run integrity check. At 95 files and growing, this stops scaling around file 200.
- No mechanism to detect *orphaned references* — a skill referencing PART-023 after PART-023 is deleted/renamed. Reference graph is unverified.

---

## 06 — Per-Skill Concerns

**Pedagogy Expert**
- `pedagogy` skill's own "biggest concern" is that it's LLM-authored with no citation requirement. This is the foundation every spec rests on, and it's admitted to be the highest hallucination risk. Should be the #1 priority, not grouped under STANDARD.
- `spec-review` gap: "no tracking of which checks historically catch real bugs." Without this, the rubric drifts toward whatever the last reviewer cared about.

**Systems Architect**
- `game-building` is flagged as a single monolithic LLM call with no decomposition fallback AND every bug traces back to it AND fix-loops don't rescue it. This is the single point of failure for the entire pipeline and it's acknowledged in writing.
- `data-contract` has no schema versioning. When it drifts, it silently corrupts game-building, game-testing, deployment, and gauge simultaneously — a four-way coupling with no change detection.

---

## 07 — Timeline

**Pedagogy Expert**
- 17-day v0 ship allocates zero days to teacher review, curriculum alignment check, or real-student piloting. "Ship" is defined as "non-engineer creator can drive the pipeline," not "a student learned something."
- Week 2's "5 more games, one per archetype" is stress-testing the factory, not the pedagogy. No learning-outcome gate on any of them.

**Systems Architect**
- Timeline is sequential on a critical path with known risk (sub-agent MCP, Core API integration) but no buffer beyond 2–3 days per risk. First real deploy surprise eats the whole slack.
- 6/15 → 15/15 eval coverage in 5 days while also building a runner. Historical skill-writing velocity not cited; this is a guess dressed as a plan.

---

## 08 — Claude Reasoning Proof

**Pedagogy Expert**
- "Proof" = structural completeness of artifacts (misconception tags present, Bloom level named). Presence is not correctness. A spec can list MISC-RATIO-01 and have it wrong.
- LLM-judged assertions marked `[LLM]` delegate pedagogy judgment to the same class of model being judged. Reviewer and reviewee share failure modes.

**Systems Architect**
- Eval runner is manual. Proof is "reproducible-by-hand" — which means proof that scales with human attention, which means no proof at steady state.
- No audit log of which evals were actually run against which skill versions. Claim of "ship-ready" is unfalsifiable without it.

---

## The Leverage Points (top 3)

1. **Close the gauge → iterate loop on one real game with real students.** Every other concern ranks itself high, but this is the only loop that converts engineering velocity into learning velocity. Until it runs once, Alfred is an open-loop HTML generator.
2. **Make `game-building` decomposable.** It is the single point of failure, it is acknowledged as such, and every improvement elsewhere is capped by its non-determinism. A structured-output + per-section validation pass would compound across every future game.
3. **Eval runner automation + pedagogy citation requirement.** These are two chores that together convert the entire skill knowledge base from "trusted because written down" to "verified on every change." This is the O(N²) → O(N) move that the architecture claims but hasn't delivered.

## The Hidden Risks (top 3)

1. **Pedagogy hallucination compounding silently.** LLM-authored misconceptions → referenced by specs → tested against by eval cases written by the same LLM → shipped to students. No external ground truth anywhere in the chain. This can run for months before a teacher catches it.
2. **Sub-agent MCP gap is a prompt-enforced guardrail.** One sloppy orchestration edit ships green-looking builds that were never actually tested. The failure is silent, the incentive to delegate is constant, and the catch is manual.
3. **Technical debt stock: eval coverage.** 6/15 today, with velocity pressure to build more games and more skills. Evals are the only mechanism that makes the architecture's core claim (compounding reliability) true. If coverage slips below ~50% while the skill count grows, Alfred regresses to the same megaprompt entropy problem it was built to escape — just distributed across more files.
