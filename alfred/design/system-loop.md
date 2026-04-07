# Ship → Capture → Gauge → Iterate

## The Loop

```
Game Creator (human intent)
      ↓
  Pipeline (factory)
      ↓
  Artifact (game at a URL — reliable, available, monitored)
      ↓
  Student plays on phone
      ↓
  Data captured (events, attempts, signals)
      ↓
  Game Creator + Claude via MCP ("what's working, what's not")
      ↓
  Update game, re-publish through pipeline
      ↓
  ...
```

Every piece of work either closes a link in this loop or it doesn't matter.

---

## Link 1: Game Creator → Pipeline

Creator has intent. Pipeline turns it into a game.

**Exists:** Pipeline (v1 + v2). GAME_PROMPT.md template.

**Gap:** Skills aren't written. Pipeline can't enforce what doesn't exist. Intent goes in, problems are discovered downstream instead of prevented upstream.

### What needs to be done

**1.1 Write the skills**

Categories identified. Individual details need to be filled in per category.

| Category | Constrains |
|----------|------------|
| Mobile/Device | Viewport, touch, fonts, load time, cross-browser |
| Game Flow | Screen states, transitions, dead-ends, error recovery |
| Mechanics | Interaction types, input handling, difficulty progression |
| Feedback | FeedbackManager patterns, timing, blocking |
| Scoring | Stars, lives, formulas, progress |
| Data Contract | gameState, attempt schema, postMessage, signal capture |
| Pedagogy | Bloom alignment, misconceptions, scaffolding |
| Visual | Layout patterns, spacing, accessibility |

**Questions:**

- What are the non-negotiable constraints in each category vs nice-to-haves?
- Which skills are universal (apply to every game) vs conditional (apply only to certain game types)?
- For each skill, what goes wrong when it's violated? What does the student experience?
- Are there skills we think we know but haven't validated with real student usage?
- What's the minimum set of skills that, if followed, guarantees a playable game?
- Which skills conflict with each other? (e.g., "rich feedback" vs "fast load time")

**1.2 Enforce skills in pipeline (plan step)**

Plan step today outputs freeform markdown. It should output a structured format that encodes constraints so the build step can validate before generating HTML.

**Questions:**

- What is the structured output format of the plan step? What fields are required?
- At what point does each skill get checked — spec time, plan time, build time, or test time?
- Which skills can be checked automatically vs which require human judgment?
- What happens when a skill check fails — block the build, warn, or log?
- How do we validate that the plan step's structured output is actually used by the build step (not ignored)?
- How do we add new skills without breaking existing ones?

**1.3 Pipeline architecture consistency**

Pipeline must follow skills coherently and produce artifacts consistent with constraints and intention.

**Questions:**

- What does "consistent" mean for two different games? Same contract? Same visual language? Same interaction patterns?
- How do we know an artifact matches the creator's intention — not just the spec, but the WHY behind the spec?
- When the pipeline produces something unexpected, how does the creator know? Preview? Diff? Summary?
- What's the feedback loop between "artifact doesn't match intention" and "fix it"? How fast is it?

---

## Link 2: Pipeline → Deployed Artifact

Pipeline produces an HTML game. That game must be reliable, available, cross-browser, monitored, tested, error-handled.

**Exists:** GCP upload, Core API registration, content sets.

**Gap:** The deployed artifact's runtime reliability.

### What needs to be done

**2.1 Cross-browser reliability**

Games must work on the browsers students actually use.

**Questions:**

- What browsers and versions do our students actually use? Do we have data?
- What are the known package edge cases Sammit is finding? Is there a pattern (e.g., Safari-specific, old Android WebView)?
- When a game breaks on a specific browser, how do we find out? Who gets alerted?
- What's our testing matrix — which browser/device combinations do we test against?
- Are we testing on real devices or emulators? Does it matter for the bugs we're seeing?

**2.2 Availability and monitoring**

Games are at URLs. Those URLs must work.

**Questions:**

- What happens when GCP is down or slow? Does the student see a white screen or an error message?
- Is there a health check after deploy? How do we know a deployed game is actually reachable?
- How do we detect if a CDN package update breaks a live game?
- What's our SLA expectation — 99%? 99.9%? Does it matter at current scale?
- Who gets paged when something breaks? Is there an oncall process?

**2.3 Error handling in the artifact**

The game itself must handle failures gracefully.

**Questions:**

- What happens when FeedbackManager CDN fails to load? Does the game still work?
- What happens when postMessage to parent fails? Does data get lost silently?
- What happens when a student loses network mid-game? Is progress lost?
- What errors do we swallow silently vs surface to the student vs report to us?
- Do we have error reporting from live games (Sentry, logging)?

---

## Link 3: Student Plays → Data Captured

Student plays, events flow into the system.

**Exists:** game_complete postMessage, recordAttempt, event tracking. Data is queryable through Claude MCP.

**Gap:** Coverage. Not all meaningful signals may be captured or exposed.

### What needs to be done

**3.1 Data schema standardization**

Every game must capture the same types of data in the same format.

**Questions:**

- What is the canonical list of fields every game MUST capture in recordAttempt?
- What goes in the `metadata` field? Is it freeform or structured? Should each game capture the same metadata fields?
- Do we capture which distractor the student picked, or just "correct/incorrect"?
- Do we capture misconception tags per attempt? If so, where do they come from — the spec? The content set?
- Do we capture timing signals — how long the student hesitated before answering? Time per round?
- What signals do we wish we had but don't capture today?
- What's the difference between data we capture for analytics vs data we capture for the learning loop?

**3.2 Signal completeness**

The data captured must be sufficient for the gauge step to produce useful insights.

**Questions:**

- If a creator asks "why are students getting Round 7 wrong?", does the data let Claude answer that?
- If a creator asks "is this game too easy?", what data answers that question?
- If a creator asks "which misconception is most common?", is that information in the data?
- What questions do we WANT to be able to answer that we CAN'T answer with current data?
- Are there signals the student produces (hesitation, re-reading, changing answers) that we should capture but don't?

---

## Link 4: Game Creator + Claude Gauge via MCP

Creator sits with Claude, queries gameplay data, understands what's working.

**Exists:** Claude MCP integration for DB. Creator can query.

**Gap:** Coverage of all data paths through MCP. Some queries may not be wired.

### What needs to be done

**4.1 MCP data coverage**

**Questions:**

- What queries can Claude run today via MCP? What's the full list of available tools/endpoints?
- What queries should Claude be able to run but can't today?
- Can Claude access per-attempt data (not just aggregates)? Can it see individual student sessions?
- Can Claude compare performance across games on the same concept?
- Can Claude identify patterns across students (e.g., "80% of students pick the additive distractor in Round 7")?
- Is the MCP schema documented? Does Claude know what tables/fields exist without being told?

**4.2 The gauge conversation**

Creator + Claude look at data together and decide what to do.

**Questions:**

- What are the 5 most important questions a creator would ask after students play a game?
- What does a "good" gauge session look like? What does the creator walk away knowing?
- How does the creator distinguish "the game is bad" from "the content set is bad" from "the student didn't try"?
- When Claude surfaces an insight, how specific does it need to be to be actionable?
- What's the gap between "data says X" and "creator knows what to change"? How do we bridge it?

---

## Link 5: Iterate — Update and Re-publish

Creator decides what to change, pipeline produces updated artifact.

**Exists:** Pipeline, targeted fix workflow, content sets.

**Gap:** None beyond pipeline reliability.

### Questions

- When a creator updates a game, does it get a new URL or replace the existing one?
- If it replaces, what happens to students mid-session on the old version?
- Can we A/B test two versions of the same game?
- When is the right response "update the content set" vs "update the game code" vs "write a new game"?
- How do we track what changed between versions and whether the change improved outcomes?
- After iterating, how quickly can the creator see if the change worked? (next day? next week? real-time?)

---

## Summary: What Needs to Be Done

| # | What | Owner | Depends on |
|---|------|-------|------------|
| 1.1 | Write skills (categories + details) | Mithilesh | Nothing — start here |
| 1.2 | Wire skills into plan step (structured format) | Mithilesh + eng | 1.1 |
| 1.3 | Pipeline architecture consistency | Both | 1.1, 1.2 |
| 2.1 | Cross-browser testing + package edge case fixes | Sammit | Nothing — in progress |
| 2.2 | Availability monitoring + health checks | Eng | 2.1 |
| 2.3 | Error handling in artifacts | Eng | 1.1 (skills define what's required) |
| 2.4 | Preview screen | Rishabh | Nothing — in progress |
| 3.1 | Standardize data schema (recordAttempt, metadata) | Mithilesh + eng | 1.1 (skills define what to capture) |
| 3.2 | Verify signal completeness for gauge step | Mithilesh | 3.1, 4.2 |
| 4.1 | Audit MCP data coverage | Eng | 3.1 |
| 4.2 | Define the gauge conversation (what questions matter) | Mithilesh | Nothing — can start now |
| 5 | Verify iterate workflow end-to-end | Both | 1-4 working |

**Critical path:** 1.1 → 1.2 → everything else benefits. Skills are the foundation.
