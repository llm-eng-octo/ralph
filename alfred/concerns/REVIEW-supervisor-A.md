# Review: 01-why-skills-not-script.md

Reviewer: Technical Director. Verdict: **Not approved as-is.** The doc improved but still oversells organization as architecture and dodges the only question that matters: does Alfred ship better games, faster, than pipeline-v2?

## 1. Oversold / hand-wavy claims (quoted)

- "Alfred is **structurally** better at three things." — Three of those things (findability, lesson capture, progressive disclosure) are **file layout choices**, not structure. `mkdir` is not architecture.
- "Knowledge loaded per build... Only the relevant skills via progressive disclosure" — Unverified. No numbers. How many skill files actually load on a typical build? What is the token delta vs pipeline-v2's prompt? Show me bytes.
- "Anthropic alignment... pattern Anthropic explicitly recommends against for complex agents" — Citation? Link? This is an appeal to authority with no link.
- "108 small markdown files" — Count without sizes, without load frequency, without duplication audit. 108 files can hide the same 4007 lines plus overhead.
- "Updating one rule means touching one small file vs scrolling a giant blob" — Discipline claim dressed as a structural one. Nothing stops a rule from being duplicated across 4 skill files.

## 2. Questions a director asks that this doc cannot answer

- How many skill files load on the median build? Total tokens? Compare to `lib/prompts.js` concatenation.
- Of the 108 files, how many were touched in the last 30 days? How many are dead?
- What is the time-to-update for a new lesson in Alfred vs pipeline-v2 — measured, not asserted?
- Pipeline-v2 has shipped many games. Alfred has shipped 2. What is Alfred's first-attempt approval rate on those 2? Pipeline-v2's is in the DB.
- When two skill files contradict, what catches it? Name the tool.

## 3. "Built" vs "hoped to build" — still mixed

- Outer loop / `gauge` skill: doc says "Outer loop never run on real student data... unverified at scale." Then the comparison table lists `gauge` as a feature Alfred has and pipeline-v2 lacks. **Either it works or it's vapor.** Pick one.
- "Migration plan needed" is in the limitations table while the conclusion talks as if migration is decided.

## 4. Discipline masquerading as structure

- "Principle 1 (single source of truth) is enforced by file boundaries, not by hope." False. File boundaries enforce **locality**, not uniqueness. Two files can both define `progressBar.destroy` rules. The doc even admits this two paragraphs later: "It does not prevent a human from writing a self-contradictory rule." Then don't call it enforcement.
- "Tree structure → ownership and locality" — There is no CODEOWNERS, no per-skill owner field, no review gate. That's aspiration.

## 5. Missing numbers

- File count breakdown by skill, median/p95 file size, total bytes vs `lib/prompts.js` (4007 lines ≈ ?KB).
- Tokens loaded per pipeline step in each system.
- Builds run via Alfred, pass rate, iterations-to-approval.
- Time-to-add-a-lesson, measured on a stopwatch, both systems, same lesson.
- Number of duplicated rules across skills today (grep audit).

## 6. The dodged question

**"If we refactor `lib/prompts.js` into 108 small files tomorrow, what is left of Alfred?"** The doc never answers this. By its own logic, the answer is: only `gauge` and the outer loop — and gauge is admitted unverified. So the honest pitch is "we want to add a gauge step and split a big file." That's a 2-week task, not a new system.

## 7. Counterfactual: pipeline-v2 with small files

The doc cannot say what is left. Question 6 = question 7. Address it head-on or the proposal collapses.

## 8. "Inner loop only" claim — verified, mostly true but misleading

`pipeline-v2/pipeline.js` has STEPS: GENERATE → VALIDATE → TEST_FIX → VISUAL_REVIEW → FINAL_REVIEW → REJECTION_FIX. All build-time. **Confirmed: no gauge, no post-deploy loop.** But pipeline-v2 also has session resume across steps (`agent.js` line 125 `queryOptions.resume = sessionId`) — the agent carries full context across the inner loop. Alfred's doc never mentions whether skills preserve cross-step context or re-load cold each step. That is a real architectural difference the doc misses.

## 9. Concrete experiment to prove/disprove

Pick 5 unbuilt specs. Build each twice: once via pipeline-v2, once via Alfred. Measure: (a) iterations-to-approval, (b) wall-clock, (c) token cost, (d) human-edit count post-ship, (e) time to integrate one new lesson mid-experiment. If Alfred does not win (a)+(e), the proposal is rejected.

## 10. What gets a "no" from me

- No numbers in section 5.
- `gauge` listed as a feature while admitted unverified.
- Discipline claims still dressed as structural ones.
- No answer to question 6.
- No experimental plan with kill criteria.

Fix these or this is a refactor proposal, not a new system.
