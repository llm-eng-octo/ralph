# Skill: Feedback

## Purpose

Define the default feedback behavior for every generated game: what plays, when it blocks, when it stops, and how audio, subtitle, and sticker stay synchronized.

## When to use

Every game generation. This skill is not optional unless PART-017 / FeedbackManager is unavailable.

## Reads

- `skills/game-archetypes/SKILL.md` — archetype determines single-step vs multi-step pacing — **ALWAYS**
- `skills/pedagogy/SKILL.md` — Bloom level determines explanation depth — **ALWAYS**
- `skills/data-contract/` — attempt / `game_complete` schemas — **ON-DEMAND**
- PART-017 / FeedbackManager package contract — **ALWAYS**

## Reference Files

**Always read during code generation:** [feedbackmanager-api.md](reference/feedbackmanager-api.md). It owns CDN URL, exact SFX IDs/URLs, sticker URLs, API examples, status objects, monitoring tags, and package failure behavior.

| File | Contents | When to read |
|---|---|---|
| [feedbackmanager-api.md](reference/feedbackmanager-api.md) | Exact FeedbackManager API, URLs, preload, play calls, status/fallback, monitoring | **ALWAYS during code generation** |
| [timing-and-blocking.md](reference/timing-and-blocking.md) | Detailed await vs fire-and-forget rules, input blocking, cleanup, pause/resume | **ALWAYS when implementing submit/transition/round-boundary code** |
| [composition-anti-patterns.md](reference/composition-anti-patterns.md) | Examples of forbidden custom feedback DOM / composition drift | ON-DEMAND when adding UI around feedback |
| [what-plays-when.md](reference/what-plays-when.md) | Expanded moment matrix | ON-DEMAND for review/debug |
| [emotional-arc.md](reference/emotional-arc.md) | Tone, streaks, recovery, victory/game-over feel | ON-DEMAND |
| [juice-animations.md](reference/juice-animations.md) | CSS feedback animation snippets | ON-DEMAND |
| [host-helpers.md](reference/host-helpers.md) | Glossary for non-FeedbackManager symbols | ON-DEMAND when a symbol is unfamiliar |
| [validator-map.md](reference/validator-map.md) | Full validator/status map | ON-DEMAND for validator drift |

---

## Builder Report Requirement

Before writing feedback DOM, map every feedback moment in the spec to a row in [Composition With Screen Primitives](#composition-with-screen-primitives) and paste the filled mapping into the Step 4 build report.

| Spec moment | Composition row used | Custom DOM? |
|---|---|---|
| (one row per feedback moment) | | must be `no` |

If a moment does not match a row, ask the human before inventing a new composition. Auto-approval counts as rejection; fall back to the closest existing row.

---

## Feedback Types

| Type | API | Plays alone? |
|---|---|---|
| Static SFX | `FeedbackManager.sound.play(id, {sticker, subtitle})` after `sound.preload([{id,url}])` | Yes |
| Voiceover (VO) | Static creator audio via `sound.play`, or dynamic TTS via `playDynamicFeedback` | Yes |
| Dynamic TTS | `FeedbackManager.playDynamicFeedback({audio_content, subtitle, sticker})` | Yes |
| Sticker | `sticker` URL on either audio API | Never alone |
| Subtitle | `subtitle` on either audio API | Never alone |

No custom subtitle/sticker DOM. FeedbackManager owns the overlay layer.

---

## Default By Game Type

| Game type | How to identify | Default feedback |
|---|---|---|
| Single-step | One interaction completes the round: MCQ, tap one option, type answer, select one | Correct and wrong both use awaited SFX -> awaited dynamic TTS with subtitle + sticker. This applies to all rounds, including standalone games. |
| Multi-step | Multiple interactions complete a round: matching, chains, sorting, dragging multiple items | Mid-round partial feedback is fire-and-forget SFX + sticker only. Round-complete awaits SFX; add awaited TTS only when the spec includes Bloom L2+ explanation text. |

Single-step submit handlers must not advance, show retry/next, or render end screen until the awaited TTS has resolved or returned a package failure status. `renderRound()` / `loadRound()` is the normal place to re-enable inputs.

Standalone end-game uses the PART-050 five-step orchestrator: SFX awaited -> feedback panel + `game_complete` -> TTS awaited -> `show_star` -> delayed Next mode.

---

## Behavioral Cases

### CASE 1: Level Transition Screen

TransitionScreen shows level title/progress and optional CTA. Audio runs inside `FeedbackManager.runSequence`: level SFX awaited -> level VO/TTS awaited. CTA calls `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()` and proceeds.

### CASE 2: Round Transition Screen

Auto-advance: show "Round N", await round SFX -> await round VO/TTS, then start gameplay.

With CTA: same sequence in `runSequence`; CTA stops sound + stream and loads the round. If audio finishes first, the screen remains until tapped.

### CASE 3: Round Start

Gameplay renders and input is available. Optional question TTS is fire-and-forget and does not block input.

- Multi-round default: allowed when the round has `questionTTS`.
- Standalone default: off unless spec opts in with `roundMountNarration: true`.
- Student interaction during round-start TTS stops the TTS first.

### CASE 4: Correct Answer (Single-Step)

Set `gameState.isProcessing = true` and disable inputs before any await. Apply the green visual cue, record attempt, update UI state, then await correct SFX -> await dynamic TTS. Advance only after TTS resolves. Subtitle must be paired with the same round-authored content as `audio_content`, not a generic literal.

### CASE 5: Correct Match (Multi-Step Mid-Round)

Green visual cue. Correct SFX + sticker fire-and-forget. No dynamic TTS, no subtitle, no input block.

### CASE 6: All Sub-Actions Complete

Round-complete SFX + sticker/subtitle is awaited. Add awaited dynamic TTS only when the spec includes a Bloom L2+ explanation for the round. Then advance.

### CASE 7: Wrong Answer (Lives Remaining)

Single-step: set `isProcessing`, disable inputs, red flash, update lives/progress, record attempt, then await wrong SFX -> await dynamic TTS. Retry/advance only after TTS resolves. Subtitle uses the paired `*Subtitle` field for the TTS content.

Multi-step: red flash + wrong SFX fire-and-forget; no dynamic TTS/subtitle; input continues unless the game-specific interaction says otherwise.

### CASE 8: Wrong Answer (Last Life)

Wrong SFX + sad sticker plays before game-over screen. After the awaited wrong SFX resolves or returns a failure status, render Game Over.

### CASE 9: Tile Select / Deselect

Micro SFX only; fire-and-forget; no sticker, no subtitle, never blocks input. Stop any current dynamic TTS before handling the tap.

### CASE 10: Partial Progress

Chain/progress SFX + sticker fire-and-forget. Update the visible progress label. No mid-chain TTS/VO/subtitle; any narration waits for round-complete.

### CASE 11: Victory

Final answer/round feedback finishes first. Then results/victory screen renders and `game_complete` posts. End-game SFX -> VO/TTS plays after the screen is visible; CTA can interrupt.

### CASE 12: Game Over

Final wrong SFX finishes first. Then Game Over screen renders and `game_complete` posts. Game-over SFX -> VO/TTS plays after the screen is visible; CTA can interrupt.

### CASE 13: Restart / Replay

First stop sound + stream, reset state, then render the first screen. Optional restart VO is allowed after render.

### CASE 14: Pause

On tab hide / screen lock: pause static sound and streams, pause timer, and rely on VisibilityTracker's built-in popup. Do not build a custom pause overlay.

### CASE 15: Resume

On return: resume static sound and streams from their paused positions, resume timer, and let VisibilityTracker dismiss its popup. Subtitle/sticker remain visible during pause and finish after resumed audio completes.

### CASE 16: Audio Blocked / Failed

Game continues. The package resolves expected audio failures with status objects; game code calls FeedbackManager directly inside `try/catch` and does not add `Promise.race`, helper wrappers, or minimum-duration floors. Subtitle/sticker overlays do not render when paired audio never starts.

---

## Composition With Screen Primitives

| Moment | FeedbackManager call | TransitionScreen? | FloatingButton | Case |
|---|---|---|---|---|
| Cell-tap micro SFX | `FeedbackManager.sound.play('sound_bubble_select' / 'sound_bubble_deselect' / 'tap_sound')` fire-and-forget | no | unchanged | 9 |
| Single-step correct | await correct SFX -> await `playDynamicFeedback({audio_content, subtitle, sticker})` | no | set after TTS | 4 |
| Single-step wrong | await wrong SFX -> await `playDynamicFeedback({audio_content, subtitle, sticker})` | no | retry/end after TTS/SFX | 7/8 |
| Multi-step partial | SFX + sticker fire-and-forget | no | unchanged | 5/10 |
| Multi-step round-complete | await `all_correct`; optional awaited TTS if Bloom L2+ | no | next after feedback | 6 |
| Welcome / level / round intro | `runSequence`: await SFX -> await VO/TTS; CTA stops sound + stream | yes | hidden or disabled | 1/2 |
| Victory / game complete | screen first, `game_complete`, then await end SFX -> VO/TTS | yes | visible after required reveal timing | 11 |
| Game over | screen first, `game_complete`, then await end SFX -> VO/TTS | yes | TS restart button | 12 |
| Answer-review carousel | silent; audio belongs to prior end-game step | no | next | PART-051 |
| Pause overlay | `sound.pause()` + `stream.pauseAll()`; VisibilityTracker popup | no custom overlay | unchanged | 14/15 |

If a new moment is not listed, ask the user for a new row. Never roll custom DOM as fallback.

---

## Priority

| Conflict | Winner |
|---|---|
| Last-life wrong feedback vs game-over | Wrong SFX first, then game-over screen |
| Student interaction vs round-start TTS | Interaction; stop TTS |
| CTA tap vs any audio | CTA; stop sound + stream |
| New screen vs old feedback | Stop old feedback before rendering new phase |
| Final answer feedback vs results/end screen | Final feedback first, then results/end screen |
| `game_complete` vs end-game audio | `game_complete` posts before end-game audio |
| Round-complete audio vs next round | Round-complete audio first |

---

## Student-Visible Invariants

1. Audio, subtitle, and sticker appear together, remain paired, pause/resume together, and disappear together.
2. Subtitle and sticker never appear without paired audio; dynamic explanatory audio must have a paired subtitle.
3. Only one feedback moment plays at a time; new feedback cuts old audio/subtitle/sticker cleanly.
4. Rapid double input must not double-play feedback; `gameState.isProcessing` is the submit-handler gatekeeper.
5. No previous audio/subtitle/sticker is visible or audible when a new round or end screen paints.
6. Pause preserves audio position; on resume, audio continues from where it stopped.
7. CTA always interrupts audio and prevents bleed onto the next screen.
8. Audio failure never stalls flow; failure paths are package-bounded and playing audio is not truncated.

---

## Constraints

1. Never build custom feedback overlays.
2. Single-step submit feedback blocks input; multi-step mid-round feedback does not.
3. Never skip correct/wrong confirmation feedback.
4. Never show negative scores.
5. `recordAttempt` fires before audio.
6. Subtitle renders the full string; <=60 chars is an authoring target, not a clamp.
7. Avoid "wrong" in student-facing text; use "Not quite", "Close", or "Almost".
8. Directly call `FeedbackManager.sound.play(...)` and `FeedbackManager.playDynamicFeedback(...)` inside `try/catch`; no `safePlaySound`, `safeTTS`, `audioRace`, `Promise.race`, or minimum-duration floor.
9. Any body with 2+ awaited audio calls wraps in `FeedbackManager.runSequence(async () => { ... })`; no `audioStopped` flag.

---

## Anti-Patterns

1. Custom feedback overlay/subtitle/sticker DOM.
2. Silent wrong answers or skipped last-life wrong SFX.
3. Mid-round multi-step TTS that kills pacing.
4. Two audios played simultaneously instead of awaited sequentially.
5. Submit-handler `playDynamicFeedback(...)` fire-and-forget.
6. Re-enabling inputs in the submit handler instead of `renderRound()` / `loadRound()`.
7. Advancing, showing retry/next, or rendering end screen before awaited TTS resolves.
8. End-game audio before results/game-over screen.
9. `game_complete` after end-game audio.
10. Cleanup after state mutation; cleanup must happen before new phase render.
11. `new Audio()` or invented sound IDs/URLs.
12. Custom pause overlay instead of VisibilityTracker popup.
