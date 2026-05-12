# Eval: Feedback

Tests for `skills/feedback/SKILL.md` — the skill that defines all feedback behavior: what plays, when, in what sequence, when to wait, when to stop, and what to prioritise.

## Version

v2 — 2026-04-07 — rewritten to match production patterns from 5 shipped games

## Setup

Context files that must be loaded before running:

- `skills/feedback/SKILL.md` (behavioral cases, cross-cutting rules, priority, await/fire-and-forget)
- `skills/feedback/reference/feedbackmanager-api.md` (actual API surface)
- `skills/feedback/reference/timing-and-blocking.md` (await patterns, input blocking, stop triggers)
- `skills/game-archetypes/SKILL.md` (archetype determines pacing defaults)
- `skills/pedagogy/SKILL.md` (Bloom level determines subtitle depth)

## Success Criteria

A feedback implementation passes when ALL of the following are true:

1. **Correct FeedbackManager API used.** `FeedbackManager.sound.play(id, {sticker: <URL>})` for static audio (sticker is a string URL; package wraps internally), `FeedbackManager.playDynamicFeedback({audio_content, subtitle, sticker})` for TTS. Never a custom `playFeedback()` wrapper.
2. **Every event has a response.** No student action is silent — correct, wrong, round complete, victory, game over all handled.
3. **Await/fire-and-forget rules followed.** Single-step submit-handler SFX **and** TTS are both awaited (validators `5e0-FEEDBACK-MIN-DURATION` + `GEN-FEEDBACK-TTS-AWAIT`); multi-step mid-round partial-match SFX is fire-and-forget.
4. **Input blocking correct.** `isProcessing` set BEFORE any await; cleared by `renderRound()` / `loadRound()`, never in the submit handler. Never set for fire-and-forget micro-interactions.
5. **Priority rules respected.** Last-life wrong SFX plays (with 1500ms floor) BEFORE the game-over screen renders. CTA stops audio via `sound.stopAll()` + `stream.stopAll()`. Game-over/results screen renders BEFORE end-game audio.
6. **recordAttempt before audio.** Data captured before FeedbackManager plays.
7. **Emotional safety maintained.** No punitive language, game-over is encouraging, failure recovery at 3+ consecutive wrong.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Correct answer — single-step game (awaited feedback)

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: MCQ Quiz
Bloom: L2 Understand
Topic: Classifying triangles
PART-017: YES

Round: "A triangle has sides 5cm, 5cm, 8cm. What type is it?"
Correct answer: Isosceles
Student selects: Isosceles (correct)
```

**Expect:**

- [ ] `gameState.isProcessing = true` set BEFORE any await (disable voice / buttons at the same point)
- [ ] Correct option gets green CSS class (`.correct` / `.selected-correct`)
- [ ] `recordAttempt({...correct: true})` called BEFORE audio
- [ ] `progressBar.update(round, lives)` called
- [ ] Correct SFX played via `safePlaySound('correct_sound_effect', { sticker: <URL> })` — string URL only; FeedbackManager wraps internally. SFX is awaited with `Promise.all` 1500ms minimum floor (PART-017 Minimum Feedback Duration, validator `5e0-FEEDBACK-MIN-DURATION`)
- [ ] `FeedbackManager.playDynamicFeedback({...})` is AWAITED inside `try { ... } catch(e){}` — explanation MUST finish before round advance; validator `GEN-FEEDBACK-TTS-AWAIT`. Package bounds at 3s API / 60s streaming so it cannot freeze the game
- [ ] Advance to next round via `renderRound()` / `loadRound()` — which clears `gameState.isProcessing = false` and re-enables inputs (single source of truth). Submit handler does NOT clear `isProcessing` itself
- [ ] [LLM] No `setTimeout` used to pace audio — SFX duration + 1500ms floor IS the timing; no `Promise.race` wrapping FeedbackManager calls

**Why:** Tests the core correct-answer flow with proper await pattern and production API.

---

### Case 2: Wrong answer — lives remaining (stay on round)

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: MCQ Quiz
Bloom: L2 Understand
PART-017: YES

Student answers incorrectly. Lives: 3 → 2.
```

**Expect:**

- [ ] `gameState.isProcessing = true` set BEFORE any await (disable voice / buttons at the same point)
- [ ] Wrong option gets red CSS class (`.wrong` / `.incorrect`)
- [ ] Life decremented: `gameState.lives--`
- [ ] `progressBar.update(round, lives)` called immediately (student sees lost heart)
- [ ] `recordAttempt({...correct: false})` called BEFORE audio
- [ ] Wrong SFX played via `safePlaySound('incorrect_sound_effect', { sticker: <URL> })` — string URL only; SFX awaited with `Promise.all` 1500ms minimum floor (validator `5e0-FEEDBACK-MIN-DURATION`)
- [ ] `FeedbackManager.playDynamicFeedback({...})` is AWAITED inside `try { ... } catch(e){}` — explanation MUST finish before retry/advance; validator `GEN-FEEDBACK-TTS-AWAIT`
- [ ] Red flash clears after ~600ms
- [ ] Retry path: `renderRound()` / `loadRound()` clears `gameState.isProcessing = false` and re-enables inputs (single source of truth). Submit handler does NOT clear `isProcessing` itself
- [ ] **Student stays on the same round** — not auto-advanced
- [ ] [LLM] Wrong option is either deselected (retry freely) or permanently disabled

**Why:** Tests that wrong answers don't advance the round and follow the correct await + blocking pattern.

---

### Case 3: Wrong answer — last life lost (wrong SFX plays, then game over)

**Priority:** P0
**Type:** edge-case
**Judge:** llm

**Input:**

```
Any archetype, PART-017: YES
Student answers incorrectly. Lives: 1 → 0.
```

**Expect:**

- [ ] Life decremented to 0
- [ ] **Wrong-answer SFX plays FIRST** — same SFX + sticker as Case 2 (awaited via `safePlaySound` with `Promise.all` 1500ms minimum floor)
- [ ] After wrong SFX finishes, game proceeds to the game-over flow
- [ ] Game Over screen renders FIRST (title, sad emoji, rounds completed, "Try Again" CTA)
- [ ] `game_complete` postMessage sent to parent BEFORE game-over audio
- [ ] Game-over SFX plays (with sad sticker) → game-over dynamic VO plays (sequential, wrapped in `runSequence`, both awaited)
- [ ] CTA is already visible during audio — if tapped: `sound.stopAll()` + `stream.stopAll()`, game restarts
- [ ] [LLM] The wrong-answer SFX is heard BEFORE the game-over screen appears — game-over does NOT skip or pre-empt the wrong feedback

**Why:** Tests the priority rule — wrong-answer SFX plays before the game-over screen, never skipped.

---

### Case 4: Multi-step correct match (fire-and-forget, don't block)

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: Matching game (pairs/chains)
PART-017: YES

Student matches one pair. 3 more pairs remain in the round.
```

**Expect:**

- [ ] Matched elements get green CSS class
- [ ] `FeedbackManager.sound.play('correct_sound_effect', { sticker })` called but NOT awaited (fire-and-forget with `.catch()`)
- [ ] `gameState.isProcessing` is NOT set to true — student can immediately match next pair
- [ ] `recordAttempt` called for the match
- [ ] [LLM] Student is never blocked from continuing to work while correct SFX plays

**Why:** Tests that multi-step mid-round feedback doesn't block input — critical for flow in matching/chain games.

---

### Case 5: Round complete (all sub-actions done — awaited)

**Priority:** P1
**Type:** happy-path
**Judge:** llm

**Input:**

```
Archetype: Matching game
PART-017: YES

Student matches the last pair in the round. All pairs complete.
```

**Expect:**

- [ ] "Round complete" SFX plays with sticker and subtitle (e.g., "All cards matched!")
- [ ] This audio IS awaited — input paused until it finishes
- [ ] After audio: game advances to next round transition, level transition, or end-game
- [ ] [LLM] Round-complete audio is the gate — next round does not load until it finishes

**Why:** Tests the distinction: mid-round matches are fire-and-forget, but round completion IS awaited.

---

### Case 6: Transition screen CTA stops audio

**Priority:** P1
**Type:** interaction
**Judge:** llm

**Input:**

```
Level transition screen visible. Level VO is playing with sticker.
Student taps "I'm ready!" CTA.
```

**Expect:**

- [ ] CTA action calls the **canonical stop pair**: `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()` (those also abort the ambient `runSequence` automatically)
- [ ] Transition screen hides
- [ ] Game proceeds to round transition or gameplay
- [ ] [LLM] Audio does not continue playing after CTA tap; no audio bleeds into the next screen

**Why:** Tests the cross-cutting rule: CTA always stops audio.

---

### Case 7: Victory — screen before audio, CTA interruptible

**Priority:** P1
**Type:** happy-path
**Judge:** llm

**Input:**

```
Student completes all rounds with 3 stars.
PART-017: YES
```

**Expect:**

- [ ] Timer pauses
- [ ] Results screen renders FIRST (stars, metrics, "Play Again" button visible)
- [ ] `game_complete` postMessage sent to parent BEFORE audio
- [ ] Victory SFX plays (with celebration sticker, 3-5s) — awaited
- [ ] Then victory VO plays — awaited
- [ ] If student taps "Play Again" while audio is playing: all audio stops, game restarts
- [ ] [LLM] Student never waits for a blank screen while audio plays

**Why:** Tests the end-game ordering: screen → postMessage → audio. And CTA interrupt.

---

### Case 8: Visibility hidden/restored

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```
Game is mid-round. Student switches tabs.
```

**Expect:**

- [ ] Timer pauses
- [ ] `FeedbackManager.sound.pause()` called
- [ ] `FeedbackManager.stream.pauseAll()` called
- [ ] `VisibilityTracker`'s built-in `PopupComponent` pause popup appears (default title "Resume Activity", or whatever `popupProps.title` overrides it to) — **no game-local pause overlay**
- [ ] On return: timer resumes, audio resumes, streams resume, and the `VisibilityTracker` popup dismisses itself
- [ ] Gameplay continues from exactly where it was
- [ ] No bespoke `.*pause-overlay`/`#*PauseOverlay` div in game HTML (anti-pattern — duplicates `VisibilityTracker`)

**Why:** Tests pause/resume behavior — audio must pause (not stop) so it can resume.

---

## Eval Scoring

| Result | Meaning |
|--------|---------|
| PASS | All assertions in Expect checklist pass |
| PARTIAL | Some assertions fail — note which ones |
| FAIL | Critical assertions fail or output is fundamentally wrong |

## Ship Gate Check

| Case | Priority | Required result |
|------|----------|----------------|
| Case 1: Correct answer (awaited) | P0 | PASS |
| Case 2: Wrong answer (stay on round) | P0 | PASS |
| Case 3: Last life (wrong SFX plays, then game over) | P0 | PASS |
| Case 4: Multi-step match (fire-and-forget) | P0 | PASS |
| Case 5: Round complete (awaited) | P1 | PASS or PARTIAL |
| Case 6: CTA stops audio | P1 | PASS or PARTIAL |
| Case 7: Victory screen-before-audio | P1 | PASS or PARTIAL |
| Case 8: Visibility pause/resume | P1 | PASS or PARTIAL |
