# REVIEW — Supervisor C (Product/Process)

**Verdict: REJECT as written. Not a rewrite, a reorg — and the doc still smells like advocacy.**

I have killed many "rewrite the world" pitches. This one is more honest than most, which is why it is more dangerous: the honesty is used to launder a conclusion the author had already reached. Ten objections, none of which the doc answers.

## 1. Sunk cost is invisible
Pipeline-v2 has **54 game directories** in `games/` and months of runtime hardening (BullMQ, Sentry, GCP, Slack, webhook, worker). Alfred has 2 locally-built games, 0 deployed. The doc lists what pipeline-v2 "has that Alfred does not yet" in a small table near the bottom and never multiplies it by the cost of rebuilding it. There is no dollar/day estimate of the throwaway. **Add one or the comparison is dishonest.**

## 2. The headline metric is unfalsifiable
"Pipeline-v2 has 0% fix-loop rescue rate" is cited (via the brief, MEMORY) as the existential indictment. Alfred's rescue rate is **undefined** because Alfred has never run the loop on a production-shipped game. You cannot beat a measured number with an unmeasured one. Strike the comparison until both are measured on equal N.

## 3. Selection bias in the contradiction example
The doc finds a 3-way contradiction in `lib/prompts.js` lines 51/93/1541 and uses it as the smoking gun. **Has anyone grepped Alfred's 108 markdown files for the same class of contradiction?** Nothing in the doc says yes. Until an *independent* reviewer audits `alfred/skills/` for self-contradictions with the same rigor, the comparison is rigged. I'd bet money 108 files contain at least one cross-file contradiction today.

## 4. No migration plan exists
The doc says "the realistic path is to keep pipeline-v2's runtime and migrate its knowledge into Alfred's skill files." That is a sentence, not a plan. **Cutover or parallel-run? Who ports the 4007 lines? In what order? With what regression gate?** A migration of this size with no plan IS the risk. The 17-day → 4-6 week → "5 gates, no date" slide already shows the team can't estimate; a migration will eat the same way.

## 5. Bus factor of one
Pipeline-v2 has been touched by multiple committers (visible in `git log`). Alfred is one author's voice top to bottom — same person wrote the skills, the orchestration, the concerns docs, AND the comparison defending them. **Conflict of interest is structural.** When that author rolls off, who can correctly edit `alfred/skills/game-building/reference/cdn-components.md` without breaking the next 5 builds?

## 6. The "discipline vs structure" trap — the doc walks into it
The doc concedes "skill format does not enforce correctness" and then claims structural advantage anyway. That is incoherent. If the win is *discipline applied during a clean rewrite*, then the null hypothesis is "apply the same discipline to `lib/prompts.js`." Has anyone tried? A 1-day spike to split `prompts.js` into 20 files in place would test the structural claim for ~1% of Alfred's cost. **Run that experiment before betting the runtime.**

## 7. Comparison not independently verified
Same author, same week, same advocacy. There is no review by anyone who has shipped a game on pipeline-v2 and is hostile to a rewrite. The "REVIEW" files in this folder are all *internal personas* — synthetic, not adversarial humans. The doc needs a sign-off from whoever owns the 30+ approved games.

## 8. What pipeline-v2 does better is undercounted
The "what pipeline-v2 has" table is 6 bullets. It is missing: 54 game corpus as regression set, lessons-learned.md (176+ entries) embedded in prompts, slot architecture, build-doctor crons, the entire ops surface. Real list is 30+ items. **Make it complete or the trade study is fake.**

## 9. No rollback plan
If Alfred is 6 weeks in and Gate 1 (deploy) is still red, can the team go back to pipeline-v2 without losing the work done in the meantime? The doc doesn't say. "5 gates, no date" + "no rollback" = open-ended commitment. I do not approve open-ended commitments.

## 10. "Designed for iteration" ≠ "iterates"
The supervisor asked whether this is built for iteration. The doc shows a system-loop diagram and a gauge skill. **The loop has never run.** Gate 4 in `07-timeline.md` says "Done = insight from real data → content swap → re-gauge shows directional improvement." That gate is currently 0/1. A diagram of a loop is not a loop. Pipeline-v2's inner loop, however imperfect, *runs daily on real builds*.

---

## What I would approve

Not this. I would approve:

1. **A 1-day spike** splitting `lib/prompts.js` into N files in place, with the contradiction-grep before/after. If structure alone fixes findability, you've proven the thesis at 1% cost.
2. **Independent audit** of `alfred/skills/` by someone hostile, looking for the same cross-file contradictions cited against `prompts.js`.
3. **Migration plan with rollback gate**: parallel run for 2 weeks, head-to-head on 5 games, kill criteria defined upfront.
4. **One real deployed game via Alfred** before any further architectural commitment. Gate 1 in `07-timeline.md` is the only thing that matters; everything else is unfalsifiable until then.

Until those exist, this is a rewrite-the-world proposal dressed in honest language. The honesty is good. The conclusion is still premature.

**Recommendation: do not freeze. Run the 1-day in-place reorg spike first. Re-decide after.**
