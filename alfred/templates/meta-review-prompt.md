# Multi-Persona Review Prompt

Use this prompt to run a completeness review on any document or artifact. Replace `{{ARTIFACT_PATH}}` and `{{ARTIFACT_DESCRIPTION}}`.

---

## The Prompt

~~~
Run a multi-persona completeness review on {{ARTIFACT_PATH}}.

This is: {{ARTIFACT_DESCRIPTION}}

Spawn 10 reviewer agents in parallel, each with a different persona. Each reviewer reads the artifact and reports: gaps, overlaps, missing questions, and a verdict — in under 600 words.

## Personas

### 1. CEO
Prove completeness. For each section: why this and not something else? Why not fewer? Why not more? Can sub-items decompose further? Can any be removed without creating a gap? What decisions does a user make, and does the artifact handle each one (including defaults for when they decide nothing, and validation for when they decide wrong)? What would make you NOT ship this?

### 2. Domain Expert
(Adapt to artifact domain — e.g., pedagogy expert for education, security expert for infra, etc.)
Are all domain-specific patterns, taxonomies, and standards covered? What's missing from the domain knowledge? What's the state of the art that this artifact doesn't reflect?

### 3. End User
(Adapt to actual user — e.g., student, game creator, developer, etc.)
Walk through the actual experience of using this. What's confusing? What's missing from your perspective? What pain points exist? What would make you not use this?

### 4. Systems Architect
Feedback loops, coupling, failure domains, emergence, stocks and flows, leverage points. Is this a checklist or a system? What properties does the system have that no individual part has? Where would a small change produce the biggest improvement?

### 5. Platform/Infra Engineer
Are all technical components mapped? Are integration contracts correct? What runtime failure modes aren't covered? What are the single points of failure?

### 6. QA/Test Engineer
Can every item be verified? What's specified but untestable? What's tested but not specified? What would be flaky to test?

### 7. Data Analyst
Is the data/metrics sufficient? What questions should be answerable that can't be? What signals are missing?

### 8. Experience Designer
Interaction patterns, microinteractions, emotional arc, device-specific UX. What does the moment-to-moment experience look like? What's the lifecycle of each interaction (idle → active → feedback → reset)?

### 9. Game/Product Designer
(Adapt to artifact — game designer for games, product designer for products, etc.)
Are all patterns/types/variants listed? Is any list incomplete? What archetypes exist? What's the "feel" dimension that's missing?

### 10. Competitor/Industry Analyst
How does this compare to the best in the industry? What do Khan Academy, Duolingo, or the market leader do that this doesn't? What's table stakes that's missing?

### 11. Simple Language Reviewer (Plain English / First Principles)
You are a smart non-expert reading this for the first time. You hate jargon. You want first-principles reasoning that builds from basic intuition. Ask:
- Could a smart non-expert understand this in one read?
- What unexplained terms/acronyms appear? (list them)
- Where does the doc skip a step in reasoning? (where did "therefore" come too fast?)
- Is the structure: problem → first principle → conclusion? Or does it start in the middle?
- Are tables used where comparison is needed? (or is everything paragraphs?)
- Does each claim build on a more basic claim that was already established?
- Would a 30-second skim convey the main point? (where is the TL;DR?)
- For each major claim, is there a concrete example?

Verdict format:
- **Jargon count:** N terms unexplained
- **Reasoning gaps:** list places that need more steps
- **Missing tables:** list places where prose should be a table
- **First-principles score:** 0-10 (does it build from basics?)
- **Skim test:** can you get the point in 30 seconds? Y/N

## Instructions for each reviewer

1. Read the artifact thoroughly
2. Read any related docs referenced in the artifact
3. Report in this structure:
   - **Gaps** — what's missing (with evidence)
   - **Overlaps** — what's redundant or has unclear boundaries
   - **Missing questions** — for each gap, one key question
   - **Verdict** — one-line summary
4. Under 600 words per reviewer
5. Be harsh. Find everything.

## After all reviews complete

Synthesize into:
1. **Review doc** — `{{ARTIFACT_PATH}}-review.md` with all findings grouped by theme
2. **Updated artifact** — incorporate findings into the original, adding missing items, questions, and structural improvements
3. **Summary** — gap count, strongest quote per reviewer, top 5 leverage points
~~~

## How to use

1. Copy the prompt between `~~~` markers
2. Replace `{{ARTIFACT_PATH}}` with the file path (e.g., `skills-taxonomy.md`)
3. Replace `{{ARTIFACT_DESCRIPTION}}` with a one-line description (e.g., "Skills the pipeline needs for reliable game generation")
4. Adapt persona descriptions to match the artifact's domain (e.g., swap "Pedagogy Expert" for "Security Expert" if reviewing infra docs)
5. Paste into Claude Code
