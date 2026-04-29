# Next Steps: Ship Games to Students

## Architecture

The pipeline is not a server. The pipeline is Claude Code running locally (or remotely via triggers), reading skills (.md files), spawning agents, and using MCPs to act on the world.

```
Creator: "Make a ratio game for Grade 5"
    ↓
Claude Code (orchestrator)
    ├── reads skills (.md)      ← knowledge: guidelines, patterns, contracts
    ├── spawns agents           ← workers: each step is an agent
    └── uses MCPs               ← hands: browser, API, DB, file system
         ├── Playwright MCP     ← test in real browser
         ├── Core API MCP       ← register game, create content sets
         ├── Gameplay Data MCP  ← query student data for gauging
         └── file system        ← read/write specs, HTML, schemas
```

**There is no server, no queue, no worker, no BullMQ, no Redis.** Claude Code is the orchestrator. Skills are the guidelines. MCPs are the integrations. Agents are the workers.

---

## What a "Skill" is

A skill is an .md file that Claude reads before doing a task. It contains:
- What to do (the procedure)
- What constraints to follow (the guidelines from pipeline-skills.md)
- What to check (validation criteria)
- What to output (expected format)

Skills reference each other. Skills reference MCPs. The orchestration prompt chains skills together.

---

## What Needs to Be Built

### Layer 1: Design Decisions (human work, no code)

These are answers to questions in `skills-taxonomy.md`. They become the content of skills.

| Decision | Where it goes | Who |
|----------|--------------|-----|
| Creator decision defaults (the defaults table) | `skills/spec-creation.md` | Mithilesh |
| Game archetype profiles (which PART flags, which structure) | `skills/game-archetypes.md` | Mithilesh |
| Data capture fields (day-1 vs post-launch) | `skills/data-contract.md` | Mithilesh |
| 5 key gauge questions | `skills/gauge.md` | Mithilesh |
| Bloom-to-structure mapping | `skills/pedagogy/SKILL.md` | Mithilesh |
| Mobile UX rules (thumb zone, safe area, orientation) | `skills/mobile/SKILL.md` | Mithilesh |
| Feedback patterns per Bloom level | `skills/feedback.md` | Mithilesh |

**This is the critical path. Everything downstream reads these skills.**

### Layer 2: Skills (.md files)

Each skill is a document Claude reads before performing a step. Skills encode the pipeline-skills.md knowledge into actionable instructions.

| Skill file | What it does | Reads from pipeline-skills.md |
|-----------|-------------|-------------------------------|
| `skills/spec-creation.md` | Generate a structured spec from a game description. Enforce defaults when creator doesn't specify. Output a spec that maps to an archetype. | Creator defaults table, 1.1 structures, 2.1 interactions, archetype profiles |
| `skills/spec-review.md` | Validate a spec against guidelines. Check: does it map to an archetype? Are required decisions present? Flag ambiguities. | All of pipeline-skills.md (the checklist) |
| `skills/game-archetypes.md` | The 10 archetype profiles. For each: structure, interaction, scoring, feedback, PART flags, screen state machine, round progression. | Archetype profiles table, 1.x Pattern, 4.x Platform |
| `skills/game-planning.md` | Generate the pre-generation plan (game-flow, screens, round-flow, feedback, scoring) in structured format. | 1.2 state machine, 1.3 progression, 3.2 round presentation sequence, 3.4 feedback |
| `skills/game-building.md` | Generate the HTML game. All CSS/JS inline. Follow the archetype skeleton. Wire all required PARTs. | 3.x Presentation, 4.x Platform (all PARTs), 6.x Device |
| `skills/game-testing.md` | Test the game using Playwright MCP. 5 categories: game-flow, mechanics, level-progression, edge-cases, contract. Fix issues found. | 2.x Interaction, 4.x Platform contracts |
| `skills/game-review.md` | Visual + spec compliance review. Screenshots of every screen. Verify round presentation sequence. | 3.x Presentation, 8.x Experience |
| `skills/deployment.md` | Upload to GCP, register with Core API, create content sets, run health check. | 7.x Deployment, 4.12 analytics readiness |
| `skills/data-contract.md` | The exact recordAttempt schema, game_complete schema, required fields. | 9.x Data, 4.5 data capture |
| `skills/gauge.md` | Query gameplay data via MCP. Answer the 5 key questions. Produce actionable insights. | 9.x Data, 5.x Content |
| `skills/iteration.md` | Take an insight, decide: update content set OR update spec + rebuild. Execute. | All (iteration touches everything) |
| `skills/mobile/SKILL.md` | Mobile-specific constraints: viewport, touch targets, thumb zone, keyboard, safe areas, orientation, gesture suppression. | 6.x Device, 8.10 mobile UX |
| `skills/feedback.md` | FeedbackManager patterns per Bloom level. Correct/wrong/streak/failure-recovery. Timing. | 3.4 feedback, 8.2 emotional safety, 8.3 learning from mistakes, 8.9 game feel |
| `skills/pedagogy/SKILL.md` | Bloom-to-structure mapping. Misconception-aware design. Scaffolding patterns. Difficulty tuning. | 1.6 scaffolding, 5.3 correctness, 5.4 alignment |

### Layer 3: MCPs

MCPs are how Claude acts on the world. Some exist, some need building.

| MCP | Status | What it does |
|-----|--------|-------------|
| **Playwright** | Exists | Open game in browser, click, type, screenshot, read console |
| **Core API** | Needs building or extending | Register game, create content sets, query game metadata, upload artifact |
| **Gameplay Data** | Exists (verify coverage) | Query attempts, events, per-round data, misconceptions, abandonment |
| **GCP Storage** | Needs building or wrapping | Upload HTML to bucket, verify URL is reachable, manage versions |
| **File System** | Built-in to Claude Code | Read/write specs, HTML, schemas, skills |

### Layer 4: Agent Orchestration

The "pipeline" is an orchestration prompt that chains skills and agents. Each step spawns an agent with a specific skill.

Education design is iterative. The creator doesn't write a spec and throw it over the wall. They go back and forth — refining intent before generation, and refining the artifact after generation. The human is in the loop at every transition.

**Three phases, each iterative:**

```
PHASE 1: NAIL THE INTENT (pre-generation, human-in-the-loop)

Creator: "Make a ratio game for Grade 5"
    ↓
Agent: Draft Spec
    Skill: spec-creation.md
    Output: draft spec
    ↓
◆ HUMAN REVIEWS SPEC ◆
    Creator reads. Adjusts. "Make it lives-based, not no-penalty."
    "Add an additive-trap distractor for skill 5."
    "Round 7 should be the hardest, not round 9."
    ↓
Agent: Revise Spec
    Reads creator feedback + original draft
    Output: revised spec
    ↓
◆ HUMAN REVIEWS AGAIN ◆ (repeat until satisfied)
    ↓
Agent: Review Spec (automated check)
    Skill: spec-review.md
    Output: pass/fail + warnings
    ↓
Agent: Plan Game
    Skill: game-planning.md
    Output: pre-generation/ (game-flow, screens, rounds, feedback, scoring)
    ↓
◆ HUMAN REVIEWS PLAN ◆
    Creator reads the screen wireframes, round-by-round breakdown.
    "The Type B follow-up question should come BEFORE the explanation, not after."
    "The start screen needs to say what topic this is."
    ↓
Agent: Revise Plan (repeat until satisfied)
    ↓
Creator: "OK, build it."


PHASE 2: BUILD + REVIEW (generation, human gates the output)

Agent: Build Game
    Input: spec + plan + archetype profile
    Skill: game-building.md + mobile.md + data-contract.md
    Output: index.html
    ↓
Agent: Test Game
    Skill: game-testing.md
    MCP: Playwright
    Output: test results + fixes applied
    ↓
◆ HUMAN PREVIEWS GAME ◆
    Creator plays through the game.
    "The font is too small on the ratio statement."
    "Wrong answer feedback doesn't explain the misconception."
    "Round 4 Type B is confusing — the changed scenario isn't clear."
    ↓
Agent: Fix (targeted)
    Reads creator feedback
    Fixes specific issues
    MCP: Playwright (verify fix)
    ↓
◆ HUMAN PREVIEWS AGAIN ◆ (repeat until satisfied)
    ↓
Agent: Final Review (automated)
    Skill: game-review.md
    MCP: Playwright (screenshots of every screen)
    Output: verdict + spec compliance score
    ↓
Creator: "Approved. Deploy."
    ↓
Agent: Deploy
    Skill: deployment.md
    MCP: Core API, GCP Storage
    Output: game URL + content set links + health check


PHASE 3: GAUGE + ITERATE (post-launch, continuous)

Students play the game
    ↓
Data flows to DB (attempts, misconceptions, timing)
    ↓
Creator: "How are students doing on scale-it-up?"
    ↓
Agent: Gauge
    Skill: gauge.md
    MCP: Gameplay Data
    Output: per-round accuracy, top misconceptions, abandonment, recommendations
    ↓
◆ HUMAN DECIDES WHAT TO CHANGE ◆
    "Students are picking the additive distractor 70% of the time in round 7.
     Add a scaffolding hint before round 4 that explains multiplicative scaling."
    ↓
    Two paths:
    ├── Content change only → Agent creates new content set via Core API (fast, no rebuild)
    └── Game logic change → Back to Phase 1 with updated spec (full cycle)
    ↓
◆ HUMAN PREVIEWS + APPROVES ◆ (repeat)
    ↓
Deploy updated game or content set
    ↓
Students play the improved game
    ↓
Gauge again... (the loop never ends)
```

**Key principle: the human is ALWAYS in the loop at phase transitions.**
- Spec draft → human reviews → revise (repeat)
- Plan → human reviews → revise (repeat)
- Built game → human previews → fix (repeat)
- Deployed → data comes in → human decides → iterate (repeat)

Agents do the work. The creator makes the decisions. No step auto-advances without human approval except the automated checks (lint, test, contract validation) which are safety nets, not decision-makers.

---

## Missing Loops (real-world scenarios the flow must handle)

The three phases above are the happy path. Real world has more loops.

### Loop A: Spec ↔ Pedagogy review

Before a spec enters the pipeline, a pedagogy check must happen. Is the Bloom level right? Do the distractors target real misconceptions? Is the difficulty curve sound for this grade?

```
Creator writes spec
    ↓
Agent: Pedagogy review (skill: pedagogy.md)
    "This spec claims L3 Apply but the interaction is MCQ recognition — that's L1 Remember."
    "Round 7 jumps from ×2 to ×4 with no ×3 bridge — students will hit a wall."
    "Distractor 'too much blue' doesn't map to a named misconception."
    ↓
◆ CREATOR ADJUSTS ◆
    ↓
Re-review (repeat until pedagogically sound)
```

**This loop doesn't exist today.** Specs enter the pipeline without pedagogical validation.

### Loop B: Content set ↔ Gauge

After launch, the most common iteration is changing CONTENT, not rebuilding the game. New questions, adjusted difficulty, better distractors. This is a tight loop that doesn't touch the HTML at all.

```
Gauge shows: "Round 7 has 30% accuracy, all other rounds > 70%"
    ↓
◆ CREATOR DECIDES ◆ "Round 7 is too hard. Swap in an easier question."
    ↓
Agent: Create content set variant
    MCP: Core API
    Output: new content set with adjusted round 7
    ↓
Deploy content set (no rebuild, no redeploy of HTML)
    ↓
Students get easier round 7 next time they play
    ↓
Gauge again → did it help?
```

**This is the fastest iteration loop.** Minutes, not hours. The game HTML stays the same. Only the content changes.

### Loop C: Skill learning loop

When the pipeline produces a game that fails in a new way, the SKILL that covers that area needs updating. This is how the system learns.

```
Game fails: "keyboard covers the question on Samsung Galaxy A12"
    ↓
Root cause: skill mobile.md doesn't mention keyboard viewport push
    ↓
◆ HUMAN UPDATES SKILL ◆ Add keyboard handling to mobile.md
    ↓
All future games read updated mobile.md → this bug class disappears
```

**This replaces the current 4000-line prompts.js.** Instead of one massive prompt that grows forever, each skill .md is updated independently. Skills can be pruned, versioned, tested.

### Loop D: Cross-game pattern loop

A fix discovered in one game should propagate to all games of the same archetype.

```
Game "scale-it-up" (Lives Challenge archetype):
    Bug: replay doesn't clear setInterval timers
    Fix: add clearAllTimers() to restartGame()
    ↓
◆ HUMAN ASKS ◆ "Do other Lives Challenge games have this bug?"
    ↓
Agent: Audit archetype
    Reads all games matching "Lives Challenge" profile
    MCP: file system (read each index.html)
    Output: 3 of 5 Lives Challenge games have the same bug
    ↓
Agent: Fix each (or update skills/game-archetypes.md to prevent it in future)
```

**This is how one fix becomes systemic.** Without this loop, the same bug appears in every new game.

### Loop E: Session design loop

Games don't exist in isolation. A teacher assigns a SESSION — a sequence of games that builds a skill progressively (L1 → L2 → L3 → L4).

```
Creator: "I need a trigonometry session for Class 10"
    ↓
Agent: Design session
    Skill: session-design.md
    Reads: existing approved games, curriculum alignment, Bloom progression
    Output: ordered list of 5 games with prerequisite dependencies
    ↓
◆ CREATOR REVIEWS ◆
    "Start with name-the-sides, but add a warm-up recognition game before which-ratio"
    ↓
Agent: Revise session
    ↓
For each missing game in the session → Phase 1 (create game)
    ↓
Session is complete → assign to students
    ↓
Gauge at session level (not just per-game):
    "Students who played name-the-sides first scored 20% higher on find-triangle-side"
    ↓
◆ CREATOR ADJUSTS SESSION ORDER/CONTENT ◆
```

**This loop is above the game level.** It's about curriculum, not individual games.

### Loop F: Live monitoring loop

After deployment, games can break without anyone touching them (CDN update, browser update, device-specific issue).

```
Health check (on cron or trigger):
    MCP: Playwright opens each deployed game URL
    Check: game_ready fires? No JS errors? Renders correctly?
    ↓
If failure detected:
    Alert → Slack / creator notification
    ↓
◆ HUMAN DECIDES ◆ "CDN update broke ScreenLayout on Safari"
    ↓
Two paths:
    ├── Rollback CDN → quick fix
    └── Update skill mobile.md + rebuild affected games
```

**Without this loop, broken games are invisible until a student reports it (they won't — they'll just leave).**

### Loop summary

| Loop | Between | Speed | Who triggers |
|------|---------|-------|-------------|
| A: Pedagogy review | Spec ↔ creator | Hours | Creator (before build) |
| B: Content iteration | Content set ↔ gauge data | Minutes | Creator (after data) |
| C: Skill learning | Bug → skill .md update | Hours | Engineer (after failure) |
| D: Cross-game propagation | One fix → all games of same archetype | Hours | Engineer/creator |
| E: Session design | Multiple games → ordered curriculum | Days | Creator (curriculum planning) |
| F: Live monitoring | Deployed game ↔ health check | Continuous | Automated (cron) |

---

## Execution Plan

### Phase 1: Foundation (this week)

| # | What | Who | Output |
|---|------|-----|--------|
| 1.1 | Answer design decisions in pipeline-skills.md | Mithilesh | Answered questions |
| 1.2 | Write `skills/game-archetypes.md` (10 profiles with PART flags) | Mithilesh + Claude | Skill file |
| 1.3 | Write `skills/data-contract.md` (recordAttempt + game_complete schemas) | Mithilesh + Claude | Skill file |
| 1.4 | Finish package edge-case fixes | Sammit | Reliable CDN packages |
| 1.5 | Define 5 key gauge questions | Mithilesh | Input for gauge skill |

### Phase 2: Core Skills (next)

| # | What | Who | Output |
|---|------|-----|--------|
| 2.1 | Write `skills/spec-creation.md` | Mithilesh + Claude | Skill file |
| 2.2 | Write `skills/game-building.md` | Mithilesh + Claude | Skill file |
| 2.3 | Write `skills/game-testing.md` | Mithilesh + Claude | Skill file |
| 2.4 | Write `skills/deployment.md` | Eng | Skill file |
| 2.5 | Build/extend Core API MCP | Eng | MCP server |
| 2.6 | Verify Gameplay Data MCP coverage | Eng | Coverage report |

### Phase 3: Orchestration (then)

| # | What | Who | Output |
|---|------|-----|--------|
| 3.1 | Write orchestration prompt (chains skills + agents) | Mithilesh + Claude | The "pipeline prompt" |
| 3.2 | Write `skills/gauge.md` | Mithilesh + Claude | Skill file |
| 3.3 | Write `skills/iteration.md` | Mithilesh + Claude | Skill file |
| 3.4 | Build post-deploy health check | Eng | Script or MCP tool |

### Phase 4: Proof (finally)

| # | What | Who | Output |
|---|------|-----|--------|
| 4.1 | One game end-to-end: create → build → deploy → student plays → gauge → iterate | Both | Working loop |

---

## What Dies

The following components from the current architecture become unnecessary:

| Component | Why it dies |
|-----------|-----------|
| server.js (Express) | No server. Claude Code is the entry point. |
| worker.js (BullMQ consumer) | No queue. Agents are the workers. |
| BullMQ / Redis | No job queue. Claude manages its own agents. |
| ralph.sh (bash pipeline) | Replaced by orchestration prompt + skills. |
| lib/pipeline.js (v1 orchestrator) | Replaced by orchestration prompt. (legacy -- not in alfred/) |
| pipeline-v2/pipeline.js (v2 orchestrator) | Replaced by orchestration prompt + skills. (legacy -- not in alfred/) |
| pipeline-v2/agent.js (SDK wrapper) | Claude Code IS the agent. No wrapper needed. (legacy -- not in alfred/) |
| lib/prompts.js (4000-line prompt builder) | Replaced by skill .md files. Each skill is a focused, maintainable doc. (legacy -- not in alfred/) |
| systemd services | No services. Runs locally or via Claude Code triggers. |
| GCP server (34.93.153.206) | Potentially — depends on whether triggers need a server or can be serverless. |

**What survives:**

| Component | Why it survives |
|-----------|----------------|
| alfred/scripts/validate-static.js | Lint rules documented in `skills/game-building/reference/static-validation-rules.md` |
| alfred/scripts/validate-contract.js | Contract checks documented in `skills/data-contract/schemas/validation-rules.md` |
| parts/ (PART-NNN.md files, indexed by README.md) | These become the source material for skills |
| games/ (specs, HTML, content) | Game artifacts still live on disk |
| skills-taxonomy.md | The master knowledge base that skills are derived from |

---

## Summary

**The pipeline is a prompt. Skills are .md files. MCPs are the hands. Agents are the workers.**

| Count | What |
|-------|------|
| ~14 skill files | Knowledge the pipeline reads |
| ~4 MCPs | Playwright, Core API, Gameplay Data, GCP Storage |
| ~7 agents per game creation | Spec → Review → Plan → Build → Test → Review → Deploy |
| ~2 agents per gauge cycle | Gauge → Iterate |
| 0 servers, 0 queues, 0 workers | Claude Code is the infrastructure |

**Phase 1 (foundation) is all human decisions. Phase 2 (skills) is writing .md files. Phase 3 (orchestration) is one prompt that chains them. Phase 4 (proof) is one game end-to-end.**
