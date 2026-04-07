# Alfred Concerns Review — CEO + Skeptical Engineer

Two personas, one verdict per doc. Ruthless.

---

## 01 — Why Skills, Not Script

**CEO: Approve-with-conditions.** The O(N) vs O(N^2) story is compelling and the prompts.js contradiction example (setTimeout destroy vs never destroy) is a board-ready anecdote. But I'm betting the company on an architecture argument backed by N=2 games in one session.

CEO concerns:
1. No cost/latency numbers. "Per-build cost is higher" is hand-waved with "budgets are dominated by generation tokens." Prove it.
2. The steel-man refutation leans on "the working pipeline is not working" — but it does ship games. I need a head-to-head: same spec, script vs skills, measured.
3. Loss of determinism is framed as a feature for variety; that's spin. For regression it's a real liability and "eval.md acts as the regression layer" is aspirational (see doc 08: evals are manual).

Skeptic findings:
1. "Grows logarithmically" — unsupported. Skills can also accrete; no evidence the 300-line cap holds under 176+ lessons.
2. "One edit, one owner, one deletion trigger" assumes discipline that no codebase sustains. Where's the enforcement?
3. prompts.js contradiction claim: cited but not quoted in situ with line numbers for both clauses. Could be misread.

---

## 02 — v0 Completion Checklist

**CEO: Approve-with-conditions.** Honest self-assessment. "70% there" with explicit TODOs is the kind of doc I want. But 70% is the most dangerous number in software.

CEO concerns:
1. Phase 3 (deploy) and Phase 4 (gauge) are UNVERIFIED — that's not 70%, that's 50%. Deploy has never run. Gauge has never seen data.
2. "Testing was exploratory" — the 5-category harness, the core reliability claim, was not exercised this session. So reliability claims in doc 03 have no basis.
3. No definition of "reliably" — v0 says "reliably take a game to deployed" with zero success-rate target.

Skeptic findings:
1. Two games "worked" — but Scale It Up needed a revision pass and neither was deployed. "Worked" means "compiled and looked OK locally."
2. "Data contract wiring correct without fixup" — unverified against live analytics DB.
3. PARTIAL is used as a euphemism for "skill file exists but procedure untested."

---

## 03 — Reliability

**CEO: Reject (as written).** Title promises reliability; body admits it is not reliable unattended. Do not put this in front of the board.

CEO concerns:
1. N=2 games is not evidence of reliability; it's an anecdote. The "correct shape" framing is rhetorical cover.
2. Eval coverage 35%, manual runner, no CI — every listed mitigation is aspirational.
3. "Sub-agents silently lose Playwright MCP" is an existential failure mode mitigated by a prompt convention. That is not a mitigation.

Skeptic findings:
1. "Layered gates, each independent" — doc 06 shows game-testing both tests AND fixes, collapsing two gates into one biased actor.
2. Metrics table lists 5 metrics with "Current source: Manual, per session." No metric is actually being tracked.
3. "Repeat-bug rate" is the key metric; N=2 and one repeat (standalone fallback) = 50% repeat rate. Nobody says this out loud.

---

## 04 — Iteration

**CEO: Approve-with-conditions.** Conceptually the strongest doc — three-tier iteration by cost is the right mental model.

CEO concerns:
1. "Has never been exercised end-to-end with real student data." Without the loop closed, this is a design doc, not a capability.
2. Gauge SQL templates query a schema "nobody has confirmed" exists. That is a landmine.
3. No A/B or versioning — spec tweak mutates in place. How do we know an iteration helped?

Skeptic findings:
1. "Minutes" for content swap is unmeasured.
2. Scale It Up concrete example is fabricated (no real data cited).
3. 30-session minimum for gauge is arbitrary; no power calculation.

---

## 05 — Update Mechanism

**CEO: Approve.** Cleanest doc. Decision tree is usable.

CEO concerns:
1. Enforcement is by convention. No linter, no pre-commit, no CI.
2. "Grep for duplication" as a workflow step will not survive scale.
3. 500-line split rule is arbitrary.

Skeptic findings:
1. "Every file must be reachable from README.md" — untested, no check.
2. Owner rotation process undefined.
3. No metric for "did this skill actually get updated after the last bug?"

---

## 06 — Per-Skill Concerns

**CEO: Approve.** Best artifact in the pack — explicitly names the gap for every skill.

CEO concerns:
1. game-building "single monolithic LLM generation" + "fix loops do NOT rescue bad generations" = generation quality is the entire bet. That's not hedged anywhere.
2. data-contract has no versioning — silent schema drift is the doomsday scenario for analytics.
3. final-review reviewer-bias problem (sees prior pass signals) is unmitigated.

Skeptic findings:
1. Every mitigation is "ALWAYS-loaded skill" — which is exactly the context-rot pattern doc 01 attacks.
2. visual-review gap: "purely visual gestalt" — not a gate.
3. deployment has no rollback; called out, not fixed.

---

## 07 — Timeline

**CEO: Reject.** 17-day v0 with deploy + gauge unverified, eval runner unbuilt, 9 skills without evals, and one architectural blocker (sub-agent MCP) is fantasy.

CEO concerns:
1. Day 8–10 "Deploy + Gauge live tests" allocates 3 days to two unverified integrations. Doc 07's own risks section budgets "2–3 extra days" for Core API alone.
2. "5 more games, one per archetype" in week 2 = 1 game/day, when current rate is 2 games/session with shortcuts. Unrealistic.
3. No buffer for the unknowns the current session already surfaced.

Skeptic findings:
1. "~17 days" is false precision.
2. Eval-runner-in-2-days assumes judge tiers, diffing, and regression tracking — easily 5 days.
3. "Standalone fallback carries over" is the assumption being tested — can't be both the plan and the hypothesis.

---

## 08 — Claude Reasoning Proof

**CEO: Approve-with-conditions.** "The reasoning is the artifact" is a good frame.

CEO concerns:
1. Layer 3 (eval gates) is the load-bearing layer and it's manual. Without a runner, proof is "reproducible-by-hand" = not reproducible at scale.
2. No adversarial testing — can Claude fabricate a plausible artifact that passes the checklist?
3. Session evidence cherry-picks successes (REVIEW_RESULT BLOCKED as proof gate works) without reporting false-pass rate.

Skeptic findings:
1. "Structurally detectable" hand-waving — structure can be filled with hallucinated tags that look valid.
2. LLM-judge assertions are themselves non-deterministic; no inter-rater reliability data.
3. "Every artifact is a replay fixture" — only if the runner ever exists.

---

## Overall Verdict: CONDITIONAL — Do not ship v0 on Apr 24. Ship v0 when the five conditions below are met.

Alfred is the right architecture. The concern docs are honest enough that I trust the authors. But today Alfred is a well-documented demo with N=2, no deploy, no gauge data, no eval runner, and one unmitigated structural failure (sub-agent MCP). Shipping now is selling a prototype as a product.

## The 5 things that turn NO into YES

1. **One game live end-to-end through Alfred.** Deployed via Core API, registered, content set attached, health check green, reachable URL. Until this exists, Phase 3 is vapor.
2. **Eval runner executing automatically** on the 6 core skills with P0 green and a regression diff against a prior run. Manual evals are not proof.
3. **Sub-agent MCP gap closed structurally** — preflight that refuses to proceed if Playwright is unreachable, not a prompt convention.
4. **One completed gauge → iterate → re-gauge cycle** on real or realistic synthetic data, proving the loop compounds rather than just exists.
5. **Head-to-head measurement vs the script pipeline** on the same spec: first-attempt pass rate, cost, latency, repeat-bug rate. Without numbers, the architecture argument is rhetoric.

Hit these five and I defend Alfred to the board. Miss any one and v0 is premature.
