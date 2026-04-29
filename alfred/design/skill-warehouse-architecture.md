# Skill-Warehouse Architecture

**Status:** Accepted (revised 2026-04-06; **self-containment achieved 2026-04-28** — every PART, helper, and reference cited from an Alfred skill now lives at an `alfred/...` path; no skill reads `warehouse/` at runtime).
**Date:** 2026-04-04 (original), 2026-04-06 (self-contained revision), 2026-04-28 (warehouse references migrated)
**Problem:** Alfred skills restate warehouse PART knowledge. When a PART updates, skills are stale. Skills grow unbounded (code-patterns.md: 1031 lines). Contradictions emerge (PART-023 says ProgressBarComponent handles lives; code-patterns.md had a pattern for rendering inline hearts).

**Original decision:** Skills reference warehouse PARTs directly.
**Revised decision:** Alfred is SELF-CONTAINED. `alfred/parts/` holds a distilled reference of every platform PART (one file per PART). Skills reference `parts/PART-NNN.md`. Alfred never reads `warehouse/` during a build.

---

## Core Principle

**Alfred owns its knowledge.** During game creation, Alfred has zero external dependencies. Everything an agent needs is inside the `alfred/` tree.

- `alfred/parts/` is the lookup for all platform component behavior (one file per PART, indexed by `parts/README.md`).
- Skills reference `parts/PART-NNN.md` by PART ID -- never warehouse files.
- When platform PARTs update upstream (`warehouse/parts/*.md`), a sync step updates `parts/PART-NNN.md` to match. But Alfred never reads warehouse directly during a build.

---

## The Rule

`alfred/parts/` is the source of truth for platform component behavior within Alfred. Alfred skills are PROCEDURES (what to do, when, in what order) that REFERENCE PARTs by ID via `parts/PART-NNN.md` (how components work). A skill never explains a component's API, constructor, methods, or anti-patterns inline when the PART file already covers them.

**Before (wrong):**
```
### Progress & Lives Display
Use ProgressBarComponent. Constructor takes { slotId, totalRounds, totalLives }.
Call update(roundsCompleted, lives) after each round. First param is rounds
COMPLETED not current round. Call destroy() before recreating...
[40 more lines restating PART-023]
```

**After (correct):**
```
### Progress & Lives Display
Per PART-023 (see parts/PART-023.md): ProgressBarComponent renders round counter + lives.
Do NOT render progress or lives UI yourself.
```

---

## What Lives Where

### `alfred/parts/` -- Distilled Component Reference (owned by Alfred)

One file per PART (`PART-NNN.md`), indexed by `parts/README.md`. Each file is 5-10 lines:
- PART ID and component name
- One-line purpose
- Constructor signature (params only, no prose)
- Key methods (name + params, one line each)
- Critical anti-patterns (one line each)
- Category: MANDATORY / CONDITIONAL / POST_GEN / REFERENCE

**38 PARTs indexed today** (PART-001 through PART-039). Skills load only the PARTs they need.

This is NOT a copy of warehouse PARTs. It is a distilled reference -- enough for skills to generate correct code without reading anything else.

### `warehouse/parts/*.md` -- Upstream Platform Truth (owned by platform team)

The full, verbose PART documentation. Alfred does not read these during builds. They are the upstream source that `parts/PART-NNN.md` files are synced from.

**Sync process:** When a warehouse PART updates, update the corresponding `alfred/parts/PART-NNN.md` file. This is the only touchpoint between warehouse and Alfred. No skill files need editing.

### `alfred/skills/*/SKILL.md` -- Procedures (owned by skill authors)

Each skill defines a WORKFLOW that orchestrates components:
- When to use this skill (trigger condition)
- Input/output contract
- Step-by-step procedure referencing PARTs by ID (via `parts/PART-NNN.md`)
- Cross-component orchestration (e.g., "init ScreenLayout before ProgressBar because PART-023 depends on PART-025")
- Decision logic (e.g., "if game has timer, include PART-006; otherwise skip")
- Archetype-specific assembly order

Skills never contain: constructor signatures, method parameter tables, code snippets that duplicate a PART entry, or component-specific anti-patterns.

### `alfred/skills/*/reference/` -- Alfred-Only Knowledge

Content that belongs to Alfred because no PART covers it:
- **Pedagogy:** Bloom's taxonomy mapping, misconception handling, cognitive load
- **Emotional arc:** Feedback sequencing, encouragement timing, difficulty curves
- **Game archetypes:** Structural patterns (MCQ, drag-drop, open-ended) and their assembly rules
- **Cross-component orchestration patterns:** How multiple PARTs coordinate (not how any single one works)
- **Spec interpretation:** How to read a game spec and map it to PART selections

This content stays in Alfred. It is not component documentation -- it is skill-specific knowledge.

---

## Reference Format

When a skill references a PART, use this format:

```
Per PART-{NNN} (see parts/PART-{NNN}.md): {one-line summary of what it provides}.
{One-line instruction: what the skill user should/should not do}.
```

Examples:

```
Per PART-023 (see parts/PART-023.md): ProgressBarComponent renders round counter + lives.
Do NOT render progress or lives UI yourself.

Per PART-025 (see parts/PART-025.md): ScreenLayout v2 injects all screen sections.
Init ScreenLayout BEFORE any component that targets a section slot.

Per PART-026 (see parts/PART-026.md): Anti-patterns checklist covers common generation errors.
Run this checklist as a final verification pass.
```

For conditional PARTs, include the decision:

```
IF game has a countdown timer:
  Per PART-006 (see parts/PART-006.md): TimerComponent provides countdown/count-up display.
```

---

## What Gets Deleted From Skills

Any content in `alfred/skills/*/` that restates knowledge already in `parts/PART-NNN.md`:

| Content type | Example | Action |
|---|---|---|
| Constructor option tables | ProgressBarComponent({ slotId, totalRounds, ... }) | Delete. Reference parts/PART-023.md. |
| Method signature lists | update(roundsCompleted, lives), destroy() | Delete. Reference parts/PART-023.md. |
| Code snippets duplicating PART content | createProgressBar() helper pattern | Delete. Reference parts/PART-023.md. |
| Component-specific anti-patterns | "Do not pass currentRound to update()" | Delete. Already in parts/PART-023.md. |
| CSS variable tables | --primary-blue: #2563eb | Delete. Reference parts/PART-020.md. |
| Package loading sequences | waitForPackages() usage | Delete. Reference parts/PART-003.md. |
| PostMessage protocol details | handlePostMessage shape, game_ready | Delete. Reference parts/PART-008.md. |

**Estimated reduction:** code-patterns.md (1031 lines) should drop to ~200 lines of orchestration procedures + PART references. Similar reductions expected in data-contract.md and feedback.md.

---

## What Stays In Skills

| Content type | Why it stays |
|---|---|
| Archetype profiles (MCQ, drag-drop, etc.) | Cross-component assembly -- no single PART covers this |
| Screen flow procedures | Orchestration order across PARTs |
| Spec-to-PART mapping logic | Decision trees for PART selection |
| Pedagogy rules | Educational domain -- not platform components |
| Feedback emotional arc | Sequencing across FeedbackManager + game flow |
| Pre-generation planning steps | Workflow -- not component behavior |
| Game-specific patterns (e.g., "story-only games skip validation PARTs") | Cross-PART decision, not single-component knowledge |

---

## Scaling Guarantee

**Skills stay under ~300 lines** because:

1. Component details (constructors, methods, examples, anti-patterns) live in `parts/PART-NNN.md` -- not in skills.
2. A new PART does not grow existing skills. The skill adds one reference line.
3. When a PART updates upstream, only `parts/PART-NNN.md` is updated. Skills automatically get the new behavior because they point to the PART file, not a copy of its content.
4. `parts/README.md` is the index. Skills do not maintain their own component registries.

**Staleness is eliminated:** There is exactly one place within Alfred where ProgressBarComponent's API is documented (`parts/PART-023.md`). A skill that says "Per PART-023 (see parts/PART-023.md)" always gets the current version. The failure mode that created this architecture (PART-023 saying "ProgressBarComponent handles lives" while code-patterns.md had an inline hearts pattern) becomes structurally impossible.

**Self-containment is guaranteed:** During a build, the agent reads only files inside `alfred/`. No network calls to warehouse, no cross-tree file reads, no external dependencies. If `parts/` files are current, the build has everything it needs.

---

## Sync Process: Warehouse to parts/PART-NNN.md

When a platform PART updates in `warehouse/parts/`:

1. Identify the changed PART (e.g., PART-023 v1 -> v2)
2. Read the updated `warehouse/parts/PART-023-progress-bar.md`
3. Distill to 5-10 lines: ID, purpose, constructor params, key methods, critical anti-patterns
4. Update `alfred/parts/PART-023.md` (and `parts/README.md` if name/purpose changed)
5. No skill files need editing -- they reference by PART ID, resolved via `parts/PART-NNN.md`

This is the ONLY touchpoint between warehouse and Alfred.

---

## Migration Checklist

1. [x] Create `alfred/parts/` -- distill all 38 PARTs from warehouse (one file per PART, 5-10 lines each)
2. [x] Create `alfred/parts/README.md` -- index table of all PARTs
3. [ ] Audit `alfred/skills/game-building/reference/code-patterns.md` -- identify every block that restates a PART
4. [ ] Replace each restated block with a PART reference pointing to `parts/PART-NNN.md`
5. [ ] Audit `alfred/skills/game-building/SKILL.md` Reads section -- ensure it references `parts/PART-NNN.md`, not warehouse or skill-internal copies
6. [ ] Audit `alfred/skills/data-contract/` -- same treatment
7. [ ] Audit `alfred/skills/feedback/` -- same treatment
8. [ ] Update all `See warehouse/parts/PART-NNN-*.md` references to `Per PART-NNN (see parts/PART-NNN.md)`
9. [ ] Verify no skill file exceeds 300 lines after migration
10. [ ] Add a lint rule or review step: "Does this skill restate PART content? If yes, replace with reference to parts/PART-NNN.md."
11. [ ] Update `alfred/principles/knowledgebase.md` to reference this architecture doc as the enforcement mechanism for principle #1
