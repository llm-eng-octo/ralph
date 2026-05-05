# Feedback: Add List with Adjustment Strategy — The Compensation Workout

## Bloom Level: L3 (Apply)

The student APPLIES the compensation transformation (a procedure with a conserved invariant) to compute a sum mentally. Bloom L3 calls for context-aware explanations on correct AND on wrong — the dynamic TTS demonstrates the strategy on the round's specific numbers (e.g. *"Nice! 58 plus 72 is the same as 60 plus 70, which is 130."*) and on wrong it announces the correct sum (e.g. *"Not quite — the sum of 58 and 72 is 130."*). Subtitles mirror the audio. Wrong-feedback handling does NOT name the matched misconception family — the misconception tag flows only to `recordAttempt` for the gauge / signal-collector phase.

## Feedback Moment Table

| Moment | Trigger | FeedbackManager call | Subtitle template | Blocks input? | Await? | What happens after |
|--------|---------|---------------------|-------------------|---------------|--------|--------------------|
| Preview audio | PreviewScreen mount | `previewAudio` (TTS-generated at deploy time from `previewAudioText`) — played by PreviewScreenComponent on mount | full preview HTML rendered | Preview overlay covers play area; `Start` CTA visible | per-component (sequential within preview) | Player taps `Start` to advance to Welcome |
| Welcome transition | TransitionScreen `onMounted` | `await FeedbackManager.sound.play('sound_welcome', { sticker: STICKER_WAVE })` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Welcome to The Compensation Workout. Two awkward numbers — nudge them friendly. The sum stays the same.', subtitle: 'Welcome to The Compensation Workout!' })` | "Welcome to The Compensation Workout!" | Tap-anywhere visible | Yes (sequential, tap interrupts) | Player taps anywhere → Round 1 Intro |
| Round N intro (auto) | TransitionScreen `onMounted` (no buttons; CASE 2 Variant A) | `await FeedbackManager.sound.play('sound_rounds', { sticker: STICKER_NEUTRAL })` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round ' + N, subtitle: 'Round ' + N })` | "Round 1" / "Round 2" / … / "Round 9" | No CTA | Yes (sequential) | Auto-advance: `transitionScreen.hide()` then `renderRound(N)` |
| Round prompt (round entry, fire-and-forget) | Inside `renderRound(N)`, after the play area paints | `FeedbackManager.playDynamicFeedback({ audio_content: 'Add ' + round.addend1Start + ' and ' + round.addend2Start + '.', subtitle: 'Add ' + round.addend1Start + ' and ' + round.addend2Start + '.' }).catch(() => {})` | "Add 58 and 72." (varies per round) | No (fire-and-forget — student can tap +/- or type immediately) | No (fire-and-forget; CASE 3) | Continue playing |
| +/- nudge tap (any of 4 buttons) | Click on `−` or `+` button next to either addend box | `FeedbackManager.sound.play('soft_tick_sfx', {}).catch(() => {})` (no sticker, no TTS) | — | No (no input block; nudge mutates display-only state) | No (fire-and-forget; CASE 9 ambient) | `gameState.addend1Display` or `addend2Display` ± 1; box repaints; 100 ms scale-down (0.92) on tapped button |
| Reset pill tap | Click on `↺ Reset` pill | `FeedbackManager.sound.play('soft_confirm_sfx', {}).catch(() => {})` (no sticker, no TTS) | — | No | No (fire-and-forget) | Both addend boxes animate back to `addend1Start` / `addend2Start` (~300 ms ease); **`inputEl.value` NOT cleared**; FloatingButton state unchanged |
| Type into numeric input | `oninput` on `<input>` | (no SFX — avoids keyboard chatter) | — | No | No | Strip non-digits defensively; `floatingBtn.setSubmittable(input.value.trim().length > 0)` |
| Press Enter on input | `onkeydown` with `event.key === 'Enter'` AND `input.value.trim().length > 0` | (no audio at this stage — proceeds straight into `handleSubmit()`) | — | — | — | Same as tapping `Next Round` (Mobile rule #16 — Enter MUST submit) |
| Submit, input empty | FloatingButton tap with `floatingBtn._submittable === false` | (no-op; FloatingButton was disabled, predicate prevents the tap from firing the handler) | — | — | — | No-op |
| Correct submit (single-step) | `floatingBtn.on('submit')` evaluator: `Number(input.value.trim()) === round.correct` | `await FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE, minDuration: 1500 })` → `await FeedbackManager.playDynamicFeedback({ feedback_type: 'correct', audio_content: round.successAudio, subtitle: round.successSubtitle, sticker: STICKER_CELEBRATE })` | round.successSubtitle (e.g. "58 + 72 = 60 + 70 = 130") | Yes (`isProcessing = true` BEFORE await) | Yes (sequential; CASE 4 single-step) | Auto-advance: if currentRound < 9 → next Round Intro; else `endGame(true)` → Victory |
| Wrong submit, lives remain (single-step) | Same evaluator returns `false`; `gameState.lives - 1 > 0` | `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD, minDuration: 1500 })` → `await FeedbackManager.playDynamicFeedback({ feedback_type: 'incorrect', audio_content: round.failAudio, subtitle: round.failSubtitle, sticker: STICKER_SAD })` | round.failSubtitle (e.g. "Sum of 58 and 72 is 130") | Yes (`isProcessing = true` BEFORE await) | Yes (sequential; CASE 7 single-step) | `resetRoundForRetry()` — same `currentRound` re-renders with addends reset and input cleared; `attemptsOnThisRound++`; `isProcessing = false` |
| Wrong submit, last life (CASE 8) | Same evaluator returns `false`; `gameState.lives - 1 === 0` | Same as wrong-with-lives — wrong SFX awaited (1.5 s floor) + wrong TTS awaited | round.failSubtitle | Yes | Yes (CASE 8 — wrong feedback MUST play before game-over) | `endGame(false)` → `showGameOver()` |
| Round transition (auto-advance after correct) | Called from correct handler when `currentRound < 9` | TransitionScreen renders with title `'Round ' + (currentRound)`, `buttons: []`. `onMounted`: `await sound.play('sound_rounds', { sticker: STICKER_NEUTRAL })` → `await playDynamicFeedback({ audio_content: 'Round ' + N, subtitle: 'Round ' + N })`. After both: `transitionScreen.hide(); renderRound(N);` | "Round N" | No CTA | Yes (sequential; CASE 2 Variant A) | Auto-advance to `renderRound(N)` |
| Last round complete → Victory | `endGame(true)` from R9 correct | `transitionScreen.show({ title: 'Victory 🎉', subtitle: <per-stars>, stars: gameState.stars, buttons: <per-stars>, persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE }); await FeedbackManager.playDynamicFeedback({ audio_content: <subtitle>, subtitle: <subtitle>, sticker: STICKER_CELEBRATE }); } })` | "Perfect compensation — all 9 first try!" (3★) / "Great work! 7 of 9 first try." (2★) / "You finished — keep practising!" (1★) | CTA visible | Yes (sequential; CTA interrupts) | CASE 11. CTA stops audio. `Play Again` (only if 0–2★) → `showMotivation`; `Claim Stars` (always) → `showStarsCollected` |
| Game Over (lives = 0 mid-session) | `endGame(false)` with `gameState.lives === 0`; wrong-feedback chain has already completed (CASE 8) | `transitionScreen.show({ title: 'Game Over', subtitle: 'You ran out of lives!', icons: ['😔'], buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }], persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); } })` | "You ran out of lives!" | CTA visible | Yes (sequential; CTA interrupts) | CASE 8. CTA stops audio. `Try Again` → `showMotivation` |
| Tap `Play Again` (Victory, 0–2★) OR `Try Again` (Game Over) | TransitionScreen primary/secondary button | `transitionScreen.show({ title: "Ready to improve your score? ⚡", buttons: [{ text: "I'm ready! 🙌", type: 'primary', action: restartGame }], persist: true, onMounted: async () => { progressBar.update(0, 3); await FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE }); } })` | "Ready to improve your score? ⚡" | CTA visible | Yes (sequential; CTA interrupts) | CASE 13. Tap `I'm ready! 🙌` → `restartGame()` (cycles set, resets state, skips Preview + Welcome) |
| Tap `Claim Stars` (Victory) | TransitionScreen `Claim Stars` button | `transitionScreen.show({ title: 'Yay! 🎉\nStars collected!', buttons: [], persist: true, styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }, onMounted: async () => { await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE }); window.parent.postMessage({ type: 'show_star', stars: gameState.stars }, '*'); setTimeout(() => showAnswerCarousel(), 1500); } })` | "Yay! 🎉 / Stars collected!" | No CTA (persist:true, buttons:[]) | Yes (sequential) — `transitionScreen.hide()` is **NOT** called inside onMounted; TS persists as backdrop | After 1500 ms: `showAnswerCarousel()` is invoked. AnswerComponent appears OVER the still-mounted Stars Collected backdrop. |
| Show Answer Carousel | `showAnswerCarousel()` fires from Stars Collected `onMounted`'s `setTimeout` | `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })`; then `floatingBtn.setMode('next'); floatingBtn.on('next', () => { answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*'); })` | (slide title) "Round N" | No (carousel is interactive) | No | Player navigates slides; taps `Next` to exit |
| Tap `Next` (FloatingButton 'next' mode) | `floatingBtn.on('next', ...)` after AnswerComponent reveal | (no audio at this stage) | — | — | — | Single-stage exit: `answerComponent.destroy()`, `previewScreen.destroy()`, `floatingBtn.destroy()`, `postMessage({type: 'next_ended'})`. Iframe tears down. |
| Visibility hidden / tab switch (CASE 14) | Browser `visibilitychange` event with `document.hidden === true` | (FeedbackManager pauses internally; no manual call needed) | — | All audio pauses | — | **VisibilityTracker's built-in PopupComponent** renders the pause overlay automatically (memory: `feedback_pause_overlay` — never custom-build a pause overlay div). |
| Visibility restored (CASE 15) | `visibilitychange` with `document.hidden === false` | (FeedbackManager resumes internally) | — | Audio resumes | — | VisibilityTracker dismisses its own popup. Gameplay continues exactly where it was (input value preserved, addend display preserved). |
| Audio failure (CASE 16) | Any `FeedbackManager.sound.play(...)` or `playDynamicFeedback(...)` throws | All awaited audio calls in `handleSubmit()` are wrapped in try/catch; fire-and-forget calls have `.catch(() => {})`. | — | Visual feedback (red shake, addend reveal, green tick, heart dim) renders regardless | — | Game advances normally |

## Subtitle Examples

3 concrete examples per type using actual spec content (Set A rounds):

### Correct subtitles (`round.successSubtitle`)

- R1 (`58 + 72`): `"58 + 72 = 60 + 70 = 130"` — audio: *"Nice! 58 plus 72 is the same as 60 plus 70, which is 130."*
- R5 (`53 + 77`): `"53 + 77 = 50 + 80 = 130"` — audio: *"Great! 53 plus 77 is the same as 50 plus 80, which is 130."*
- R9 (`43 + 78`): `"43 + 78 = 40 + 81 = 121"` — audio: *"Excellent! 43 plus 78 is the same as 40 plus 81, which is 121."*

### Wrong subtitles (`round.failSubtitle`)

- R1: `"Sum of 58 and 72 is 130"` — audio: *"Not quite — the sum of 58 and 72 is 130."*
- R5: `"Sum of 53 and 77 is 130"` — audio: *"Not quite — the sum of 53 and 77 is 130."*
- R9: `"Sum of 43 and 78 is 121"` — audio: *"Not quite — the sum of 43 and 78 is 121."*

### Round prompt (round-start, fire-and-forget)

- R1: `"Add 58 and 72."` — audio: *"Add 58 and 72."*
- R5: `"Add 53 and 77."` — audio: *"Add 53 and 77."*
- R9: `"Add 43 and 78."` — audio: *"Add 43 and 78."*

### Victory subtitle examples (per stars tier)

- 3★: `"Perfect compensation — all 9 first try!"` — audio: same string.
- 2★ (`firstTryCorrect === 8`): `"Great work! 8 of 9 first try."` — audio: same string.
- 2★ (`firstTryCorrect === 7`): `"Great work! 7 of 9 first try."` — audio: same string.
- 1★ (`firstTryCorrect ∈ {5, 6}`): `"You finished — keep practising!"` — audio: same string. (Structurally rare per Star Generosity Audit — finishing all 9 rounds implies `firstTryCorrect ≥ 7`.)

### Welcome / Motivation / Stars Collected / Game Over (canonical, copied from default-transition-screens.md)

- Welcome: `"Welcome to The Compensation Workout!"` — VO: *"Welcome to The Compensation Workout. Two awkward numbers — nudge them friendly. The sum stays the same."*
- Motivation: `"Ready to improve your score? ⚡"` — VO: per `sound_motivation` (no dynamic TTS by default).
- Stars Collected: `"Yay! 🎉\nStars collected!"` — VO: per `sound_stars_collected` (no dynamic TTS by default).
- Game Over: `"Game Over"` / `"You ran out of lives!"` — VO: per `sound_game_over`.

## Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Score bounce | Correct submit | `.score-bounce` | 400 ms |
| Input pill green | Correct submit | `.mathai-input-correct` (or equivalent) | persists until next round |
| Friendly-pair reveal (count animation) | Correct submit | (inline transition on addend box display values) | ~500 ms |
| Green tick badge fade-in | Correct submit | `.mathai-tick-fade-in` (or equivalent) | ~300 ms |
| Input pill red flash + shake | Wrong submit | `.mathai-input-wrong` + `.shake-wrong` (`-6 px → +6 px → -6 px → +6 px → 0`, 4 cycles) | ~600 ms |
| Addend boxes reset to start (count animation) | Wrong submit (after input shake) | (inline transition on addend box display values) | ~300 ms |
| Heart break / dim | Wrong submit (lives remain or last life) — `progressBar.update(currentRound, lives - 1)` | `.heart-break` (component-owned by ProgressBarComponent) | ~600 ms |
| +/- button scale-down | +/- nudge tap | `.button-press` (transform: scale(0.92)) | 100 ms |
| Reset pill confirm | Reset tap | (component-owned animation if any; otherwise instant) | < 100 ms |
| Star pop | Stars Collected fires `show_star` postMessage | host-owned (not in iframe) | per host |
| Fade in | New round renders (after intro auto-dismiss) | `.fade-in` | 350 ms |

## Wrong Answer Handling

- **Show correct answer:** ALWAYS — wrong-feedback TTS includes the correct sum (e.g. *"Not quite — the sum of 58 and 72 is 130."*). The addend boxes reset to start values (the friendly-pair reveal is reserved for correct only — on wrong, the student does NOT see the canonical friendly pair until they get a correct submit OR until the AnswerComponent at end-of-game).
- **Misconception-specific feedback:** NO — TTS is generic per round (announces correct sum). The misconception tag is recorded in `recordAttempt.misconception_tags[0]` for the gauge / signal-collector phase but does NOT change the audible feedback. Per spec: *"the wrong-answer evaluator computes candidate values for each named misconception family and matches the student's submitted value against the set; on a match, that tag goes into recordAttempt"* — the TTS payload is unchanged.
- **Failure recovery (3+ consecutive wrong on same round):** Each wrong on the same round costs 1 life. With 3 lives, a single round can absorb at most 3 wrong submits before triggering Game Over (CASE 8 — wrong feedback for the final-life answer plays first, THEN Game Over renders). There is no soft-language escalation or hint affordance; the spec explicitly excludes hints (the +/- nudge mechanic IS the hint).
- **Failure recovery (across rounds):** N/A. Lives reset only on `restartGame()` via the Try Again / Play Again path, which cycles `setIndex` so the next session uses a different addend pair set.

## Wrong-answer evaluator (misconception dispatch)

The wrong-answer evaluator dispatches by `String(typedValue)` against `round.misconception_tags`:

```
function resolveMisconception(round, typedValue) {
  const key = String(typedValue);
  if (round.misconception_tags[key]) return round.misconception_tags[key];
  return 'whole-rule-mismatch';
}
```

The 7 named misconception tags (per spec):

| Tag | Definition | Sample candidate (R1 Set A: 58 + 72 = 130) |
|-----|------------|--------------------------------------------|
| `compensation-applied-only-to-addend1` | Nudged addend1 friendly, kept addend2 unchanged | `132` (60 + 72) |
| `compensation-applied-only-to-addend2` | Kept addend1, nudged addend2 friendly | `128` (58 + 70) |
| `wrong-direction-compensation` | Added (or subtracted) on BOTH addends | `134` (60 + 74) |
| `arithmetic-error-on-friendly-pair` | Reached friendly pair correctly but mis-added | `120` or `140` |
| `tens-only-no-ones-add` | Added tens digits only | `120` (5 + 7 = 12 → 120) |
| `off-by-ten-place-value-slip` | Tens-digit slip on one addend | varies |
| `whole-rule-mismatch` | Default fallback — no candidate matched | any unmatched value |

The TTS payload for wrong submits is `round.failAudio` regardless of which tag matched. The tag flows ONLY to `recordAttempt.misconception_tags[0]`.

## Emotional Arc Notes

- **Reset is the "free experimentation" affordance.** The wrong-answer feedback resets the addend boxes silently (no message that "you reset"); the only verbal feedback is *"Not quite — the sum of A1 and A2 is CORRECT."* This keeps the student in flow — Reset (and the implicit reset on wrong) is non-punishing.
- **The strategy is taught by the correct TTS, not by upfront instruction.** On correct, the audio names the strategy on the round's specific numbers (e.g. *"Nice! 58 plus 72 is the same as 60 plus 70, which is 130."*). The student hears the equivalence AFTER they've earned it, reinforcing the discovery.
- **Stage-2 / Stage-3 visual differentiators (soft blue / bolder weight) are non-verbal cognitive cues** — the difficulty step is felt visually rather than narrated by a Stage-2 / Stage-3 transition screen. This is intentional per creator: "the reveal happens on the student".
- **Victory subtitle is celebratory at 3★** ("Perfect compensation — all 9 first try!") and **encouraging at lower tiers** ("Great work! N of 9 first try." / "You finished — keep practising!"). Game Over uses the canonical default ("You ran out of lives!") — the spec does not customise this.
- **Wrong-on-final-life produces wrong-feedback FIRST, THEN Game Over.** The student hears *"Not quite — the sum of A1 and A2 is CORRECT."* with the correct sum spoken aloud BEFORE the Game Over card renders. This preserves the pedagogical content even on game-over (CASE 8 enforcement).
- **AnswerComponent slides reinforce the strategy ONE LAST TIME** — each slide shows the starting pair → friendly pair → correct sum + strategy statement banner. After 9 slides (one per round), the player has seen 9 worked compensation transformations on the actual numbers they played.

## Lives display

PART-023 ProgressBar with 9 segments AND 3 hearts:
- Segments fill left-to-right as rounds complete (correct submit advances `currentRound` from N → N+1; the segment for round N fills via `progressBar.update(currentRound, lives)` BEFORE the next-round transition).
- Hearts dim from 3 → 2 → 1 → 0 on each wrong submit (the dim is via `progressBar.update(currentRound, lives - 1)` BEFORE the wrong SFX/TTS).
- Heart-break animation: ~600 ms on the heart that just dimmed.

## Sticker mapping

| Trigger | Sticker constant | Visual |
|---------|------------------|--------|
| Welcome | `STICKER_WAVE` | 👋 |
| Round Intro / Motivation neutral | `STICKER_NEUTRAL` | (e.g. ⭐ small) |
| Correct submit | `STICKER_CELEBRATE` | (e.g. 🎉 / sparkle) |
| Wrong submit | `STICKER_SAD` | (e.g. 😔) |
| Game Over | `STICKER_SAD` (in `icons: ['😔']`) | 😔 |
| Motivation | `STICKER_MOTIVATE` | ⚡ |
| Victory | `STICKER_CELEBRATE` | 🎉 (also rendered as `stars` row, NOT as `icons`) |
| Stars Collected | `STICKER_CELEBRATE` | 🎉 (inline in title) |

The exact sticker constants come from the standard PART-017 / PART-024 sticker catalog. Build step uses the project's canonical names; this table is intent only.

## Audio id mapping

| Trigger | Sound id |
|---------|----------|
| Welcome | `sound_welcome` |
| Round Intro | `sound_rounds` |
| +/- nudge tap | `soft_tick_sfx` (or project equivalent — short < 50 ms tick, no sticker) |
| Reset tap | `soft_confirm_sfx` (or project equivalent — short confirm tone) |
| Correct submit | `correct_sound_effect` |
| Wrong submit | `incorrect_sound_effect` |
| Victory | `sound_game_victory` |
| Game Over | `sound_game_over` |
| Motivation | `sound_motivation` |
| Stars Collected | `sound_stars_collected` |

The exact sound id strings come from the standard PART-017 catalog. If `soft_tick_sfx` / `soft_confirm_sfx` are not provided, the build step picks the closest project-canonical short ambient SFX (e.g. `sound_tap`, `sound_chip`, `sound_pip`) and documents the choice in the code comment.

## Cross-checks

- ✅ Every screen has a feedback row (Preview, Welcome, Round Intro, Round prompt, +/- tap, Reset, type, Enter, submit empty, correct, wrong-with-lives, wrong-last-life, Round transition, Victory, Game Over, Play Again / Try Again, Claim Stars, Show Answer Carousel, Tap Next, CASE 14, CASE 15, CASE 16).
- ✅ Single-step P2 + button-nudge: dynamic TTS awaited on correct AND wrong (CASE 4 / CASE 7).
- ✅ Wrong-last-life: CASE 8 — wrong feedback completes BEFORE Game Over.
- ✅ +/- nudge taps and Reset taps DO NOT play TTS, DO NOT block input, DO NOT decrement lives (CASE 9 ambient).
- ✅ Round prompt TTS is fire-and-forget (CASE 3) — does not block input.
- ✅ Stars Collected `onMounted` does NOT call `transitionScreen.hide()` — TS persists as backdrop (memory: `feedback_pause_overlay`).
- ✅ ProgressBar update is FIRST in correct AND wrong submit handlers (memory: `progress_bar_round_complete`).
- ✅ Pause overlay = VisibilityTracker's PopupComponent (memory: `feedback_pause_overlay` — never custom-built).
- ✅ Sticker mapping uses standard PART catalog constants.
- ✅ No misconception-specific TTS — generic correct-sum announcement on wrong.
