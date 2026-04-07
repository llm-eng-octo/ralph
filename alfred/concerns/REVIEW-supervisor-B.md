# Review: 01-why-skills-not-script.md — Supervisor B (Senior Eng)

I read the doc. It is honest where it concedes structure != correctness. But as a production case for swapping runtimes, it is unshippable. There are zero numbers in a document arguing for an architecture change. That alone is a fail. Below: the questions you must answer before I sign off.

## 1. Cost ($/game)
Doc cites no $/game for either system. Pipeline-v2's `agent.js` already tracks `total_cost_usd`, `input_tokens`, `output_tokens`, `cache_read_input_tokens` per step (lines 248-251). The data exists. **Run 5 builds on each, paste the table.** Until then, "smaller context" is a vibe.

## 2. Latency
No wall-clock per step. CLAUDE.md says builds are "~25-35 min." Alfred's orchestration prompt has 12 steps with multiple HUMAN GATES — that is **not** a comparable number. Is Alfred's autonomous wall-time 10 min or 90 min? Unknown. Measure it.

## 3. Token usage
The doc's central claim is "knowledge loaded per build... only the relevant skills via progressive disclosure." **Show the input token delta.** Pipeline-v2 logs it per step. Alfred needs the same instrumentation. My prior: progressive skill loading eats most savings via Read tool round-trips, and `game-building/SKILL.md` alone is ~260 lines + it pulls 4 skills "ALWAYS" + `code-patterns.md` + `html-template.md` + `css-reference.md`. That is not small. Profile it.

## 4. Run rate
Doc admits "Two end-to-end (Scale It Up v2, Match Up)" for Alfred vs "Many" for pipeline-v2. CLAUDE.md mentions 176+ lessons and a populated `games/` dir. **N=2 is not a comparison, it is anecdote.** No claim survives this gap.

## 5. Concurrency
Pipeline-v2 has BullMQ + worker.js + GCP + Sentry. Alfred's orchestration SKILL.md literally says *"Run this step directly in the main orchestrator context"* and *"Sub-agents cannot access Playwright MCP."* That is **a single-tenant, human-in-the-loop, local-Claude-Code workflow.** What happens when 5 creators run it? Nothing — because they can't. The doc concedes this in the "what pipeline-v2 has" table but does not address it.

## 6. Failure modes / observability
Pipeline-v2: BullMQ retries, Sentry, Slack threads, GCP transcripts, `data/builds.db`. Alfred: a markdown chat log in someone's terminal. Where do Alfred failures go? Who gets paged? **No answer in doc.**

## 7. Migration path
Doc says *"the realistic path is to keep pipeline-v2's runtime and migrate its knowledge into Alfred's skill files."* Good — but then **the title of the doc is wrong**. It is not "Skills vs Script." It is "reorganize prompts.js into a skills directory that pipeline-v2 loads." Write THAT doc. Define: who owns the loader, which skill loads at which step, how `buildGeneratePrompt` becomes `loadSkills(['game-building','data-contract',...])`. Without this, you are proposing parallel systems with no decider.

## 8. The lib/prompts.js contradiction
Doc cites lines 51, 93, 1541 — three statements about `progressBar.destroy` setTimeout. **Has this contradiction caused a real failed build?** Cite the build number. If not, it is a code-smell, not a P0. Real bug → fix it in 10 min with an Edit. Reorganizing 4007 lines into 108 files to prevent this is a $50k solution to a $50 problem unless you can show it recurs.

## 9. Markdown isn't free
14+ skill files loaded via Read tool = 14+ tool round trips, each consuming output tokens to call Read and input tokens to receive content. **One concatenated prompt is one cache hit.** Anthropic's prompt caching favors stable big prefixes. Progressive disclosure may be *worse* on cached cost. Profile before claiming the win.

## 10. Outer loop / gauge
Doc lists `gauge` and `iterate` skills as the killer differentiator. The acknowledged limitations table says: *"Outer loop never run on real student data."* **Then it is not a differentiator. It is vapor.** Pull it from the comparison table or label it ROADMAP. Listing unimplemented capability as an advantage is how engineering orgs lose trust.

---

## Verdict
**Reject as written. Conditional accept on:**
1. A measurement table (cost/latency/tokens, n=5 builds each).
2. Drop "skills vs script" framing — reframe as "refactor prompts.js into loadable skill modules within pipeline-v2 runtime."
3. Delete gauge/outer-loop from the differentiator table until it has run on real data.
4. State the migration plan: kill date for `lib/prompts.js`, ownership, rollback.
5. Answer the concurrency + observability gap explicitly.

The structural argument (findability, grep-ability, smaller files) is correct and worth doing. But it is a refactor, not a new runtime. Stop selling it as the latter.
