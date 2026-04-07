# Skill: Game Building

## Purpose

Transform a game spec + pre-generation plan + archetype profile into a single self-contained HTML file that is a playable, tested, platform-compliant math game for Indian Class 5-10 students on budget Android phones.

## When to use

When generating HTML from an approved spec + plan. The main generation step.

## Owner

**Maintainer:** Gen Quality slot
**Deletion trigger:** When game generation moves to a template engine that does not use LLM-based HTML generation.

## Reads

- `skills/game-archetypes.md` -- archetype profile (structure, interaction, scoring, screens, PART flags, defaults) -- **ALWAYS**
- `skills/data-contract.md` -- gameState schema, recordAttempt schema, game_complete postMessage schema, syncDOM contract, trackEvent schema, handlePostMessage/game_ready protocol, validation rules -- **ALWAYS**
- `skills/mobile/SKILL.md` -- viewport, touch targets, typography, safe areas, keyboard, orientation, gestures, performance, cross-browser, CSS variables -- **ALWAYS**
- `skills/feedback.md` -- FeedbackManager API, per-event feedback, Bloom-level subtitles, timing, wrong-answer handling, emotional arc, micro-animations, round presentation -- **ALWAYS**

## Input

1. **Spec** (`spec.md`) -- game description, rounds schema, misconception taxonomy, Bloom level, scoring rules, screen descriptions, content set structure
2. **Pre-generation plan** (`pre-generation/`) -- screen flow, round presentation sequence, interaction breakdown, state management plan, archetype confirmation
3. **Archetype profile** -- looked up from `game-archetypes.md` based on the plan's archetype field

## Output

A single file: `index.html`

- Self-contained: all CSS and JS inline (no external files except CDN scripts)
- Under 500KB total file size
- Passes `validate-static.js` (all GEN-* rules)
- Passes Playwright test suite (all 5 categories: game-flow, mechanics, level-progression, edge-cases, contract)

---

## Procedure

### Step 1: Read and Internalize

1. Read the **spec** completely. Extract: gameId, title, Bloom level, totalRounds, totalLives, timer, interaction type, round schema, misconception taxonomy, scoring rules, feedback overrides.
2. Read the **pre-generation plan**. Extract: archetype, screen flow, round presentation sequence, state management notes, any deviations from archetype defaults.
3. Look up the **archetype profile** from `game-archetypes.md`. Note the structure, interaction, scoring, feedback, screen state machine, PART flags, and defaults.
4. Identify any **spec overrides** of archetype defaults (e.g., different round count, added timer, custom star thresholds).

### Step 2: Build the HTML Shell

Write the document structure following [html-template.md](html-template.md). This covers the DOCTYPE, head, CDN scripts, CSS sections, body, and `#app` element with initial data attributes.

### Step 3: Build the JavaScript

Follow the exact function order from [code-patterns.md](code-patterns.md). All 24 code sections must be implemented with the exact signatures and behaviors documented there. Key sections: gameState, syncDOM, handlePostMessage, recordAttempt, trackEvent, endGame, playFeedback, getRounds, getStars, startGame, resetGame, answer handler, init sequence.

### Step 4: Write the Fallback Content

The `fallbackContent.rounds` array is the game's offline dataset. It must:

- Contain at least `totalRounds` round objects
- Follow the exact round schema from the spec
- Include every field the answer handler and recordAttempt read (id, answer, options, difficulty, misconception tags, feedbackCorrect, feedbackWrong, etc.)
- Progress in difficulty (easy -> medium -> hard, or per spec stages)
- Have stable `id` fields (e.g., `'r1_topic_detail'`) for cross-session comparison

### Step 5: Implement the Answer Handler

The answer handler is the core game loop. See the full pattern in [code-patterns.md](code-patterns.md) Section 17. It must follow the exact 11-step sequence: guard -> evaluate -> recordAttempt -> trackEvent -> update state -> syncDOM -> visual feedback -> playFeedback -> animations -> auto-advance with setTimeout.

### Step 6: Implement Keyboard Handling (Input-Based Games)

If the game uses text/number input instead of MCQ, see the keyboard handling pattern in [code-patterns.md](code-patterns.md) Section 18.

### Step 7: Write the CSS

Follow the complete CSS reference in [css-reference.md](css-reference.md). This covers `--mathai-*` variables, mobile viewport/layout, touch targets, gesture suppression, landscape lock overlay, micro-animations, wrong-answer visual feedback, and disabled states.

### Step 8: Self-Validate

Before outputting, verify against every check:

**Static validation (GEN-* rules):**
- [ ] GEN-PM-001: `game_complete` postMessage uses exact type string
- [ ] GEN-PM-DUAL-PATH: `game_complete` fires on both victory AND game-over paths
- [ ] GEN-PM-READY: `game_ready` postMessage exists
- [ ] GEN-PHASE-INIT: `#app` initial `data-phase` matches `gameState.phase` init
- [ ] GEN-PHASE-SEQUENCE: endGame sets phase BEFORE syncDOM
- [ ] GEN-PHASE-MCQ: At least 3 syncDOM calls exist
- [ ] GEN-DATA-LIVES-SYNC: syncDOM writes `data-lives` (lives games)
- [ ] GEN-SYNCDOMSTATE-ALLATTRS: syncDOM writes `data-round` and `data-score`
- [ ] GEN-SHOWRESULTS-SYNC: showResults calls syncDOM after phase assignment
- [ ] GEN-RESTART-RESET: resetGame resets phase, currentRound, score, attempts, events
- [ ] GEN-CORRECT-ANSWER-EXPOSURE: `gameState.correctAnswer` set each round

**Mobile checklist (from mobile.md):**
- [ ] Viewport meta tag present with `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- [ ] `max-width: var(--mathai-game-max-width)` on `#app` (480px)
- [ ] Uses `100dvh`, never bare `100vh`
- [ ] `overflow-x: hidden` on `html`, `body`
- [ ] All buttons 44x44px minimum
- [ ] 8px minimum spacing between touch targets
- [ ] Interactive elements in lower 60% of screen
- [ ] `var(--mathai-font-family)` on body
- [ ] No font below 14px; inputs 16px+
- [ ] Line height 1.4+ on text blocks
- [ ] All colors use `--mathai-*` variables
- [ ] `env(safe-area-inset-*)` padding on outer container
- [ ] `inputmode="numeric"` with `type="text"` for number inputs
- [ ] `visualViewport` resize listener (input games)
- [ ] Enter key triggers submit (input games)
- [ ] Landscape overlay present
- [ ] `overscroll-behavior: none` on `html` and `body`
- [ ] `touch-action: manipulation` on all interactive elements
- [ ] `-webkit-touch-callout: none` on game wrapper
- [ ] HTML under 500KB
- [ ] No continuous CSS animations during gameplay
- [ ] No flexbox `gap` (use margins)
- [ ] No optional chaining (`?.`) or nullish coalescing (`??`)
- [ ] Every `-webkit-` has standard fallback
- [ ] Inputs have `-webkit-appearance: none; appearance: none`
- [ ] Total DOM under 500 elements (render one round at a time)

**Feedback checklist:**
- [ ] `playFeedback('correct', ...)` on correct answer
- [ ] `playFeedback('incorrect', ...)` on wrong answer
- [ ] `playFeedback('victory', ...)` on game complete
- [ ] `playFeedback('gameover', ...)` on lives exhausted
- [ ] `gameState.isProcessing = true` BEFORE playFeedback
- [ ] `gameState.isProcessing = false` inside setTimeout AFTER feedback duration
- [ ] Correct answer revealed on wrong (`.correct-reveal` element)
- [ ] Auto-advance after 1500ms (correct) / 2000ms (wrong)
- [ ] Subtitles under 60 characters, Bloom-level-appropriate
- [ ] Score bounce animation on correct
- [ ] Shake animation on wrong
- [ ] Heart break animation on life lost (lives games)
- [ ] No custom overlays (FeedbackManager owns overlays)

### Step 9: Output

Write the complete `index.html` file. No placeholder comments. No TODO markers. Every function fully implemented. Every fallback round fully populated with real math content matching the spec.

---

## Constraints

### From data-contract.md

1. **CRITICAL** -- Every field marked Required in data-contract.md MUST be present. Omitting a required field is a contract violation.
2. **CRITICAL** -- All timestamps are epoch milliseconds (`Date.now()`), never ISO strings, never seconds.
3. **CRITICAL** -- `accuracy` in `game_complete` is integer 0-100, not decimal 0.0-1.0.
4. **CRITICAL** -- `round_number` in recordAttempt is 1-indexed. `currentRound` in gameState is 0-indexed.
5. **CRITICAL** -- `gameState` MUST be assigned to `window.gameState` -- test harness reads it directly.
6. **CRITICAL** -- `syncDOM` MUST target `#app` -- test harness reads `#app[data-phase]`. Never use `document.body`.
7. **CRITICAL** -- `gameState.phase = 'playing'` must be the VERY FIRST LINE in the `game_init` handler.
8. **CRITICAL** -- `game_ready` MUST be sent AFTER the message listener is registered. Sending it before means `game_init` is lost.
9. **CRITICAL** -- `game_complete` MUST fire on BOTH victory and game-over paths.
10. **CRITICAL** -- `completedAt` is a sibling of `metrics` inside `data`, not nested inside `metrics`.
11. **ADVISORY** -- Games may add extra fields (forward compatibility). Required fields must never be omitted.
12. **STANDARD** -- `question_id` must be stable across sessions for the same question content.
13. **STANDARD** -- `misconception_tag` values come from the spec's misconception taxonomy.

### From mobile.md

1. **CRITICAL** -- Viewport meta: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no` -- exactly this.
2. **STANDARD** -- `max-width: var(--mathai-game-max-width)` (480px) on the game container.
3. **CRITICAL** -- Use `100dvh`, never bare `100vh` (with `@supports` fallback).
4. **STANDARD** -- `overflow-x: hidden` on `html`, `body`.
5. **CRITICAL** -- All touch targets minimum 44x44px.
6. **STANDARD** -- Minimum 8px spacing between adjacent targets.
7. **ADVISORY** -- Interactive elements in bottom 60% of screen (thumb zone).
8. **STANDARD** -- Font family via `var(--mathai-font-family)`, never bare custom fonts.
9. **CRITICAL** -- No font below 14px anywhere; inputs 16px+ (prevents Safari auto-zoom).
10. **ADVISORY** -- Line height 1.4+ on text blocks.
11. **STANDARD** -- All colors via `--mathai-*` variables -- no hardcoded hex.
12. **STANDARD** -- `env(safe-area-inset-*)` padding on outer container.
13. **STANDARD** -- Bottom buttons clear gesture bar via `env(safe-area-inset-bottom)`.
14. **CRITICAL** -- Number inputs: `type="text"` with `inputmode="numeric"`, not `type="number"`.
15. **STANDARD** -- `visualViewport` resize listener for keyboard handling.
16. **STANDARD** -- Enter key triggers submit on text inputs.
17. **STANDARD** -- Portrait-only: landscape overlay at `max-height: 500px`.
18. **STANDARD** -- `overscroll-behavior: none` on `html` and `body`.
19. **STANDARD** -- `touch-action: manipulation` on all interactive elements.
20. **STANDARD** -- `-webkit-touch-callout: none` and `user-select: none` on game wrapper.
21. **STANDARD** -- `user-select: text` re-enabled on inputs.
22. **CRITICAL** -- HTML file under 500KB.
23. **STANDARD** -- No continuous CSS animations during gameplay -- momentary feedback only.
24. **STANDARD** -- DOM under 500 elements -- render one round at a time.
25. **CRITICAL** -- No flexbox `gap` (use margins). Grid `gap` is allowed.
26. **CRITICAL** -- No optional chaining (`?.`), nullish coalescing (`??`), `Array.at()`, `structuredClone()`, top-level `await`.
27. **STANDARD** -- Every `-webkit-` property must have the unprefixed standard property.
28. **STANDARD** -- `-webkit-appearance: none; appearance: none` on all inputs.
29. **ADVISORY** -- Debounce resize and scroll handlers.

### From feedback.md

1. **CRITICAL** -- Never build custom feedback overlays -- FeedbackManager owns the overlay layer.
2. **CRITICAL** -- Every `playFeedback` call MUST be followed by a `setTimeout` that handles the next transition. No fire-and-forget.
3. **STANDARD** -- Never skip feedback -- even obvious answers need confirmation.
4. **STANDARD** -- Never show negative scores. Score >= 0 always.
5. **STANDARD** -- Never use the word "wrong" in student-facing text.
6. **CRITICAL** -- Input MUST be blocked during feedback (`gameState.isProcessing`).
7. **ADVISORY** -- Feedback subtitle under 60 characters.
8. **CRITICAL** -- Call `waitForPackages()` (which waits for FeedbackManager) during init before first round.
9. **STANDARD** -- Always show correct answer on wrong answer -- student must never be left wondering.
10. **STANDARD** -- Auto-advance: 1500ms correct, 2000ms wrong (2000ms for both at L4).
11. **ADVISORY** -- Streak celebration at 3+ consecutive correct.
12. **ADVISORY** -- Failure recovery (softer language) at 3+ consecutive wrong.
13. **STANDARD** -- Game-over tone is encouraging, not punitive. Never "Game Over" alone without encouragement.
14. **ADVISORY** -- Victory subtitle references the specific topic.
15. **CRITICAL** -- No custom audio -- FeedbackManager handles all audio.
16. **CRITICAL** -- Never block init on FeedbackManager failure -- it is supplementary.

---

## Defaults

When the spec does not specify:

| Parameter | Default | Source |
|-----------|---------|--------|
| Bloom level | L2 (Understand) | feedback.md |
| Total rounds | Archetype default (9 for MCQ/Lives, 6 for Sort, etc.) | game-archetypes.md |
| Lives | Archetype default (0 for MCQ, 3 for Lives Challenge) | game-archetypes.md |
| Timer | Archetype default (0 for most, 60s for Speed Blitz) | game-archetypes.md |
| Star thresholds | 3 at 90%, 2 at 60%, 1 at 1+, 0 at 0 | data-contract.md |
| `question_id` format | `'r' + roundNumber` | data-contract.md |
| `misconception_tag` | `null` for all attempts | data-contract.md |
| `difficulty_level` | `1` for all rounds | data-contract.md |
| Correct feedback duration | 1500ms | feedback.md |
| Wrong feedback duration | 2000ms | feedback.md |
| Streak threshold | 3 consecutive correct | feedback.md |
| Failure recovery threshold | 3 consecutive wrong | feedback.md |
| Game-over message | "Keep practicing {topic}!" | feedback.md |
| Victory message | "Amazing {topic} skills!" | feedback.md |
| Viewport | 375x667, portrait only | mobile.md |
| Touch targets | 44px minimum | mobile.md |
| Font | system stack via `--mathai-font-family` | mobile.md |

---

## Anti-patterns

1. No external CDN libraries -- only the three approved scripts from `storage.googleapis.com`
2. No custom feedback overlays -- FeedbackManager renders its own overlay; games only add `.correct-reveal`
3. No flat postMessage -- must use nested `data.metrics` structure, not top-level fields
4. No hardcoded colors -- all values via `--mathai-*` CSS variables
5. No bare `100vh` -- use `100dvh` with `@supports` fallback
6. No flexbox `gap` -- use margins; grid `gap` is allowed
7. No optional chaining (`?.`), nullish coalescing (`??`), `Array.at()`, `structuredClone()`, top-level `await`
8. No `type="number"` on inputs -- use `type="text"` with `inputmode="numeric"`
9. No custom audio -- FeedbackManager handles all audio via `playFeedback()`
10. No render-all-rounds -- render only the current round, never all at once
11. No sending `game_ready` before listener registration -- register `message` listener first, then send `game_ready`
12. No phase assignment after logic in `game_init` -- `gameState.phase = 'playing'` must be the FIRST LINE
13. No victory-only `game_complete` guard -- `game_complete` postMessage fires on BOTH victory and game-over
14. No skipping feedback -- always `playFeedback` then `setTimeout` for auto-advance
15. No input during feedback -- `isProcessing` guard at top of every input handler
