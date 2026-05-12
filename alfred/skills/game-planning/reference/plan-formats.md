Exact output format for all 5 plan documents -- each section below is the template that game-building.md consumes.

## 1. game-flow.md Format

```markdown
# Game Flow: [Game Title]

## One-liner
[What the player does in one sentence. Must name the math topic, the action verb, and the end goal.]

## Flow Diagram

[ASCII diagram copied VERBATIM from reference/default-flow.md (Shape 2) or reference/shapes.md (Shape 1 / Shape 3), with any additive customization deltas from reference/flow-gallery.md applied in place.]

Rules:
- Must match the canonical diagram from default-flow.md or shapes.md. Hand-invented flows are not allowed.
- Customizations appear as ADDITIVE edits only: inserted steps, added conditional branches, or a single relabeled transition — never a wholesale rewrite.
- Every screen that exists in the game appears in this diagram.
- Every transition is labeled with what triggers it (tap, timer expiry, lives=0, all rounds done).
- Loops (replay) are shown explicitly.
- If the archetype has game_over, it appears as a branch.

## Shape

**Shape:** [Shape 1 Standalone | Shape 2 Multi-round | Shape 3 Sectioned]

## Changes from default

- [List every delta applied from flow-gallery.md, one per bullet. If none, write "None — canonical diagram copied verbatim."]

## Stages

| Stage | Rounds | Difficulty | Content description |
|-------|--------|------------|---------------------|
| Easy | 1-3 | L1 recall / simple values | [what the student sees] |
| Medium | 4-6 | L2 application / moderate values | [what the student sees] |
| Hard | 7-9 | L3 multi-step / tricky distractors | [what the student sees] |

Notes:
- Round count and stage breakdown come from the spec. If the spec is silent, use archetype defaults.
- "Content description" is concrete: "single-digit multiplication" not "easier problems."
```

## 2. screens.md Format

```markdown
# Screens: [Game Title]

## Screen Inventory

List every screen with its data-phase value:
- start (data-phase="start")
- gameplay (data-phase="gameplay")
- results (data-phase="results")
- game_over (data-phase="game_over") -- only if lives > 0

## [Screen Name] (data-phase="[value]")

### Layout

+-----------------------------+
|  [element]        [element] |  <- describe position and content
|                             |
|        [element]            |  <- centered element
|                             |
|  [element]  [element]       |  <- grouped elements
|                             |
|        [element]            |  <- bottom element
+-----------------------------+

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| [name] | top-left | [what it shows] | no / tap / drag |

**Required rows for every TransitionScreen-backed screen** (welcome, round_intro, section_intro, motivation, victory, game_over, stars_collected, any custom transition):

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Sticker / Icon | top-center | exact emoji string (e.g. `😔`) OR named sticker (e.g. `alfred_sad`) — the icons[] array passed to transitionScreen.show | no |
| Title | center | **exact quoted string** — the `title` passed to transitionScreen.show | no |
| Subtitle | center | **exact quoted string** (omit row if no subtitle) — the `subtitle` passed to transitionScreen.show | no |
| Audio | (auto, onMounted) | **sound id + sticker** — pulled from the per-screen Screen Audio table below; fired by onMounted via `await safePlaySound(id, { sticker })` followed by `await playDynamicFeedback({audio_content: ttsText, ...})` (see Screen Audio table) | no |
| CTA 1 | bottom | **exact quoted button label** → which screen / function it routes to | tap |
| CTA 2 | bottom (if multiple) | **exact quoted button label** → which screen / function it routes to | tap |

These strings are the **contract** between planning and building. Game-building MUST copy title / subtitle / sticker / audio id / button labels VERBATIM from this table into `transitionScreen.show({...})`. Content drift (inventing a different title, adding stars to the subtitle, renaming a button) is blocked by `test/content-match.test.js` and static rule `5f-CONTENT-MATCH`.

### Screen Audio (resolved by game-planning)

A single per-game table at the top of `screens.md` lists the resolved SFX id, sticker, and TTS narration text for every prescribed TS. Game-planning generates this table by walking the prescribed TS list for the game shape (see `default-transition-screens.md` § Game shape table), pulling canonical templates from `default-transition-screens.md` § Default narration strings, and merging any `creatorScreenAudio` overrides from the spec.

```markdown
## Screen Audio

| Screen          | sfxId                  | sticker             | ttsText                                              | source   |
|-----------------|------------------------|---------------------|------------------------------------------------------|----------|
| welcome         | sound_level_transition | STICKER_LEVEL       | Let's play Cross-Logic!                              | default  |
| roundIntro      | rounds_sound_effect    | STICKER_ROUND       | Puzzle ${n} of ${N}                                  | default  |
| victory         | sound_game_victory     | STICKER_CELEBRATE   | Brilliant deduction! You solved them all.            | creator  |
| gameOver        | sound_game_over        | STICKER_SAD         | You completed ${score} of ${totalRounds}. Try again! | default  |
| motivation      | sound_motivation       | STICKER_MOTIVATE    | Ready to improve your score?                         | default  |
| starsCollected  | sound_stars_collected  | STICKER_CELEBRATE   | (silent — canon exception)                           | silent   |
```

Rules:
- Game-planning MUST include one row per prescribed TS for the game's shape (see default-transition-screens.md § Game shape).
- `ttsText` interpolation tokens (`${n}`, `${N}`, `${score}`, `${totalRounds}`, `${gameTitle}`, `${primaryMetric}`) are resolved at runtime by the build agent, not by game-planning.
- `source: 'default'` — `ttsText` came from the default narration template.
- `source: 'creator'` — `ttsText` came from `spec.creatorScreenAudio.<screen>.audioText`.
- `source: 'silent'` — TTS is intentionally skipped on this screen. `ttsText` displays `(silent — ...)` for human readability; build emits SFX only. Allowed for Stars Collected always, and for any other screen where `spec.creatorScreenAudio.<screen>.silent: true`.
- The build agent reads ONLY this table for TS audio decisions. It does not consult default-transition-screens.md or `spec.creatorScreenAudio` directly.

### Entry condition
How the player arrives at this screen.

### Exit condition
What the player does to leave this screen and where they go.

[Repeat for EVERY screen]

## Round Presentation Sequence

Within the gameplay screen, each round follows this sequence:
1. **Question preview** -- question text + any images render. Options NOT yet visible.
2. **Instructions** (conditional) -- **NOT an on-screen text block.** The "how to play" copy is delivered ONCE by the PreviewScreenComponent (`previewInstruction` + `previewAudioText`) before Round 1 starts. Gameplay screens MUST NOT re-render the same instruction text in a static panel. Only render a per-round **prompt / question** if it is semantically different from the preview instruction (e.g. "Which tile shows the answer?" — a per-item prompt, not the global how-to-play). When a round type changes, convey the change via a **Round-N intro transition screen**, not by injecting an instruction banner into gameplay.
3. **Media** (conditional) -- audio/video plays if present. Skippable.
4. **Gameplay reveal** -- options/inputs fade in (350ms). Input unblocks.
```

**ASCII wireframe rules:**
- Draw a wireframe for EVERY screen, not just gameplay
- Show actual content examples (real question text, real option text), not placeholders
- Show element positions: top-left, top-center, top-right, center, bottom
- Show relative sizing: a progress bar is wide and thin, a question is large text centered
- **Progress bar is drawn at the TOP of every non-Preview wireframe** (below the preview header, above gameplay content). Never at the bottom.
- **Persistent fixtures are drawn on every non-Preview wireframe:** (a) preview header (avatar, question label, score, star) at the very top — owned by PreviewScreenComponent and visible in both preview + game states; (b) progress bar below the header (Shape 2 Multi-round and Shape 3 Sectioned only — hidden for Shape 1 Standalone).
- Use box-drawing characters for the mobile viewport (375x667 proportions)
- Include the round presentation sequence for gameplay screens

## 3. round-flow.md Format

```markdown
# Round Flow: [Game Title]

## Round Types

List every distinct round type.

## Round Type: [Name]

### Step-by-step

1. **Round starts** -- [what renders]
2. **Student sees** -- [question preview content, instruction if applicable]
3. **Student acts** -- [tap option / type number / drag item / click cell]
4. **Correct path (single-step — SFX awaited + dynamic TTS fire-and-forget):**
   a. Selected option gets `.selected-correct` styling
   b. `gameState.isProcessing = true` blocks input (set BEFORE any await; also disable voice/buttons)
   c. `await FeedbackManager.sound.play('correct_sound_effect', {sticker})` — awaited (short ~1s)
   d. `FeedbackManager.playDynamicFeedback({audio_content: '[context-aware explanation]', subtitle: '[same text]', sticker}).catch(function(e){})` — FIRE-AND-FORGET, never awaited; next-round transition MUST NOT block on TTS
   e. Score increments, score display bounces (scoreBounce 400ms)
   f. Auto-advance to next round via `renderRound()` / `loadRound()` — for the default advance path, `renderRound()` is the re-enable site (`isProcessing = false`, `.dnd-disabled` remove (P6), `voiceInput.enable()` (P17), `timer.resume()` (PART-006)). DO NOT re-enable in the handler for this path. Other retry paths (Try Again, multi-round explicit retry, API-failure) re-enable elsewhere — see [interaction/reference/state-and-guards.md § Lifecycle matrix](../../interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix).
4alt. **Correct path (multi-step — SFX + sticker only):**
   a. Matched elements get `.selected-correct` styling
   b. `FeedbackManager.sound.play('correct_sound_effect', {sticker}).catch(...)` — fire-and-forget, NO dynamic TTS
   c. Student continues interacting immediately — NO input blocking
5. **Wrong path (single-step — SFX awaited + dynamic TTS fire-and-forget):**
   a. Selected option gets `.selected-wrong` styling
   b. Correct option gets `.selected-correct` styling
   c. `.correct-reveal` shows "Answer: [correct answer]"
   d. `gameState.isProcessing = true` blocks input (set BEFORE any await; also disable voice/buttons)
   e. `await FeedbackManager.sound.play('incorrect_sound_effect', {sticker})` — awaited (short ~1s)
   f. `FeedbackManager.playDynamicFeedback({audio_content: '[context-aware explanation]', subtitle: '[same text]', sticker}).catch(function(e){})` — FIRE-AND-FORGET, never awaited; retry MUST NOT block on TTS
   g. [If lives game: life decremented, progress bar updated, heart-break animation 600ms]
   h. [If lives = 0: ALWAYS play wrong SFX (awaited, Promise.all 1500ms min) BEFORE proceeding to game_over (feedback/SKILL.md Case 8) — never skip]
   i. Student stays on same round. Re-enable site depends on the retry UX pattern: `renderRound()` for multi-round predicate-driven (the default `roundRetryButton: false`), `on('retry')` handler for standalone Try Again (`Rounds: 1` + `Lives > 1`) or multi-round explicit retry button (`roundRetryButton: true`), catch branch for API-failure. Detailed per-shape × per-event timing in [interaction/reference/state-and-guards.md § Lifecycle matrix](../../interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix).
5alt. **Wrong path (multi-step — SFX + sticker only):**
   a. Wrong element flashes `.selected-wrong`
   b. `FeedbackManager.sound.play('incorrect_sound_effect', {sticker}).catch(...)` — fire-and-forget, NO dynamic TTS
   c. Life lost if applicable
   d. Student continues interacting immediately — NO input blocking
6. **Last round complete:**
   a. Results screen renders FIRST, `game_complete` postMessage sent BEFORE audio
   b. `await FeedbackManager.sound.play('victory_sound_effect', {sticker})` → `await FeedbackManager.playDynamicFeedback({audio_content: '[victory VO]', subtitle, sticker})`
   c. CTA already visible — if tapped, `FeedbackManager.sound.stopAll()`

### State changes per step

| Step | gameState fields changed | DOM update |
|------|------------------------|------------|
| Round starts | currentRound incremented | syncDOM() called; progress bar already at post-bump value from previous round |
| Correct answer (student moves past) | score++ (correct count, feeds end-of-game `getStars()`); progress++ (default policy: rounds passed); progressBar.update(progress, livesLeft) BEFORE next-round / Victory | progress bar advances |
| Wrong answer, retries available (still on same round) | lives-- (if applicable); **no progress bump**; floatingBtn.setMode('retry'); same-round re-render | heart removed; progress bar unchanged |
| Wrong answer, lives remaining > 0, NO retry / retries-exhausted (advance — student moves past) | lives--; progress++ (default policy); progressBar.update(progress, livesLeft) BEFORE next-round | progress bar advances + heart removed |
| Wrong answer, last life (`lives === 0`) — Game Over (round NOT passed) | lives-- (to 0); **no progress bump**; progressBar.update(prior progress, 0) — hearts empty visibly, progress preserved | bar reads "completed N-1, lost on N" + 0 hearts |
| Last round, correct (Victory) | phase='results' | screen transition; progress bar already at totalRounds/totalRounds from the last bump |
```

**Two counters, two purposes** (default policy): `gameState.progress` drives the progress bar (rounds passed, bumps when the student moves past); `gameState.score` feeds `getStars()` at end-of-game (rounds correct). Do NOT collapse these. **The bump fires only when the student moves PAST the round** (correct, OR retries-exhausted with lives remaining). **Game Over does NOT bump** — the student never passed the round. **Wrong-with-retry does NOT bump** — still on the same round. The ActionBar header is end-of-game-only — do NOT update it mid-round. See PART-023 § Bump timing + flow-implementation.md § Round loop pattern.

## 4. feedback.md Format

```markdown
# Feedback: [Game Title]

## Bloom Level: [L1/L2/L3/L4]

## Feedback Moment Table

| Moment | Trigger | FeedbackManager call | Subtitle template | Blocks input? | Await? | What happens after |
|--------|---------|---------------------|-------------------|---------------|--------|--------------------|
| Level transition | Level screen shows | `await sound.play('rounds_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: 'Level N'})` | "Level N" | CTA visible | Yes (sequential, CTA interrupts) | CTA stops all audio |
| Round transition (auto) | Round screen shows | `await sound.play('rounds_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: 'Round N'})` | "Round N" | No CTA | Yes (sequential) | Auto-advance after both |
| Round transition (CTA) | Round screen shows | `await sound.play('rounds_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: 'Round N'})` | "Round N" | CTA visible | Yes (sequential, CTA interrupts) | CTA stops all audio |
| Correct (single-step) | Student selects correct option | `await sound.play('correct_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: explanation, subtitle, sticker})` | context-aware explanation | Yes | Yes (sequential) | Auto-advance |
| Correct (multi-step) | Student matches pair/chain | `FeedbackManager.sound.play('correct_sound_effect', {sticker}).catch(...)` | — | No | No (fire-and-forget) | Continue playing |
| Wrong (single-step) | Student selects wrong option | `await sound.play('incorrect_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: explanation, subtitle, sticker})` | context-aware explanation | Yes | Yes (sequential) | Stay on round, retry |
| Wrong (multi-step) | Student selects wrong match | `FeedbackManager.sound.play('incorrect_sound_effect', {sticker}).catch(...)` | — | No | No (fire-and-forget) | Continue playing |
| Last life wrong | Lives reach 0 | Skip wrong SFX → game-over | — | — | — | Game over screen |
| Round complete | All sub-actions done | `await FeedbackManager.sound.play('all_correct', {sticker})` | "All matched!" | Yes | Yes | Next round |
| Victory | All rounds complete | Screen first → `game_complete` → `await sound.play('victory_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: VO})` | per star tier | CTA visible | Yes (sequential) | CTA stops audio |
| Game over | Lives reach 0 | Screen first → `game_complete` → `await sound.play('game_over_sound_effect', {sticker})` → `await playDynamicFeedback({audio_content: VO})` | contextual | CTA visible | Yes (sequential) | CTA stops audio |

## Subtitle Examples

3 concrete examples per type using actual spec content.

## Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Score bounce | Correct answer | `.score-bounce` | 400ms |
| Shake | Wrong answer | `.shake-wrong` | 500ms |
| Heart break | Life lost | `.heart-break` | 600ms |
| Streak glow | 3+ streak | `.streak-glow` | 600ms |
| Star pop | Results star earned | `.star-earned` | 400ms |
| Fade in | New round appears | `.fade-in` | 350ms |

## Wrong Answer Handling

- Show correct answer: always
- Misconception-specific feedback: [yes/no]
- Failure recovery (3+ consecutive wrong): soften language, add hints

## Emotional Arc Notes

[Game-specific notes]
```

## 5. scoring.md Format

```markdown
# Scoring: [Game Title]

## Points

| Action | Points | Notes |
|--------|--------|-------|
| Correct answer | +1 | Per round |
| Wrong answer | 0 | No point penalty |

## Formula

score = number of correct answers
maxScore = total rounds
percentage = (score / maxScore) * 100

## Star Thresholds

| Stars | Threshold | Displayed as |
|-------|-----------|-------------|
| 3 stars | >= 90% | Three filled stars |
| 2 stars | >= 66% | Two filled, one empty |
| 1 star | >= 33% | One filled, two empty |
| 0 stars | < 33% | Three empty stars |

## Lives (if applicable)

| Parameter | Value |
|-----------|-------|
| Starting lives | [N] |
| Lives lost per wrong answer | 1 |
| Game over condition | lives = 0 |
| Lives display | [hearts/icons at top-right] |
| Life loss animation | heartBreak 600ms |

## Progress Bar

| Parameter | Value |
|-----------|-------|
| Tracks | Round number (currentRound / totalRounds) |
| Position | **Top of game body** — below the fixed preview header, above `#gameContent`. Owned by ScreenLayout + ProgressBarComponent. Visible on every screen except Preview. Do NOT place at the bottom. |
| Style | Filled bar, left-to-right |
| Updates | After each correct feedback (animates during ✓ window) |

## Data Contract Fields

| Field | Source | Example value |
|-------|--------|---------------|
| score | gameState.score | 7 |
| totalQuestions | gameState.totalRounds | 9 |
| stars | calculated from percentage | 2 |
| accuracy | percentage | 78 |
| timeSpent | Date.now() - gameState.startTime | 45000 |
```
