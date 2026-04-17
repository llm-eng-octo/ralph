# Feedback: Matching Doubles

## Bloom Level

**L2 Understand.** Wrong-answer feedback is intentionally **non-scaffolded mid-game** (no dynamic TTS, no misconception-specific spoken explanation). Per-tile misconception info is captured in `recordAttempt` for analytics, not surfaced as in-game coaching. This matches the spec's "fluency/speed practice" framing: the lives mechanic + time-based stars create urgency without pausing the flow for explanation. Awaited feedback with dynamic TTS appears only at round-complete, victory, and game-over — the three moments where the game stops progressing.

## Feedback Moment Table

Every moment below maps 1:1 to a branch in `game-flow.md` and a step in `rounds.md`. Column `FeedbackManager CASE #` references the 17 behavioral cases in `skills/feedback/SKILL.md`.

| # | Moment | Trigger | CASE # | FeedbackManager call | Subtitle / dyn text | Blocks input? | Await? | postMessage ordering | What happens after |
|---|--------|---------|--------|----------------------|---------------------|---------------|--------|----------------------|--------------------|
| 1 | Preview audio | Preview screen mounts | CASE 1 (preview) | `PreviewScreenComponent` plays `previewAudio` (or TTS of `previewAudioText` at deploy) | `previewAudioText` — "Match the doubles! Tap a number on the left, then tap its double on the right. Finish all nine rounds before you lose your three lives. The faster you finish, the more stars you earn." | Soft (Start button visible, interrupts) | Yes (but Start button interrupts) | n/a | On Start / audio end / 5s skip → Welcome transition |
| 2 | Welcome VO | Welcome TransitionScreen mounts | CASE 3 (welcome) | `await FeedbackManager.sound.play('sound_welcome', { sticker: STICKER_MOTIVATE })` then `await FeedbackManager.playDynamicFeedback({ audio_content: "Let's double some numbers!", subtitle: "Let's double some numbers!", sticker: STICKER_MOTIVATE })` | "Let's double some numbers!" | CTA visible (interrupts) | Yes (sequential, CTA interrupts) | n/a | CTA tap stops all audio → Round 1 gameplay |
| 3 | Round-N intro (auto) | round_intro transition mounts for Rounds 2–9 | CASE 4 (round transition, auto) | `await FeedbackManager.sound.play('sound_rounds', { sticker: STICKER_MOTIVATE })` | — (no dynamic TTS; title "Round N" is the visible content) | No CTA | Yes (sequential); `waitForSound: true` | n/a | Auto-dismiss after sound → Round N gameplay |
| 4 | Left tile select | Student taps an unselected left tile | CASE 9 (tile-select SFX) | `FeedbackManager.sound.play('sound_tile_select', { sticker: null }).catch(() => {})` | — | No | No (fire-and-forget) | n/a | Tile highlights; student continues |
| 5 | Left tile deselect | Student re-taps the currently selected left tile | CASE 9 (tile-deselect SFX) | `FeedbackManager.sound.play('sound_tile_deselect', { sticker: null }).catch(() => {})` | — | No | No (fire-and-forget) | n/a | Highlight removed; student continues |
| 6 | Correct match (mid-round, multi-step) | Second tap = right tile whose value = `pairs[selectedLeft]` | CASE 5 (correct, multi-step) | `FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE }).catch(() => {})` | — (no dynamic TTS per multi-step rule) | No | No (fire-and-forget) | n/a | Pair locks green (scale pulse 200ms); `recordAttempt({ is_correct: true })`; student continues immediately |
| 7 | Wrong match (mid-round, multi-step) | Second tap = right tile whose value ≠ `pairs[selectedLeft]`, AND resulting `lives > 0` | CASE 7 (wrong, multi-step) | `FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD }).catch(() => {})` | — (no dynamic TTS, no subtitle per multi-step rule) | No | No (fire-and-forget) | n/a | Both tiles shake + red flash (600ms); life decrements; heart-break anim (600ms); `recordAttempt({ is_correct: false, misconception_tag })`; tiles deselect after 600ms; student retries |
| 8 | Last-life wrong (lives → 0) | Wrong match that makes `lives === 0` | CASE 8 (game-over overrides wrong SFX) | **Skip wrong SFX.** Instead: (1) render game_over screen, (2) send `game_complete` postMessage, (3) then onMounted fires `FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD })` then `await FeedbackManager.playDynamicFeedback({ audio_content: "Good try — let's practice those doubles again!", subtitle: "Good try — let's practice those doubles again!", sticker: STICKER_SAD })` | "Good try — let's practice those doubles again!" | CTA "Try Again" visible immediately (interrupts) | Yes (sequential, CTA interrupts) | **Screen FIRST → postMessage → audio** | CTA tap stops all audio → motivation screen |
| 9 | Round complete | Last pair in round locks (step 7 of rounds.md) | CASE 6 (round-complete, awaited) | `await FeedbackManager.sound.play('all_correct', { sticker: STICKER_CELEBRATE })` then `await FeedbackManager.playDynamicFeedback({ audio_content: "Round complete!", subtitle: "Round complete!", sticker: STICKER_CELEBRATE })` | "Round complete!" | Yes (`isProcessing = true`) | Yes (sequential) | n/a | Unblock input; N<9 → Round-(N+1) intro; N=9 → Victory |
| 10 | Victory | Round 9 cleared with `lives ≥ 1` | CASE 11 (victory) | `await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })` then `await FeedbackManager.playDynamicFeedback({ audio_content: <tier VO>, subtitle: "Completed in {s}s — all {n} pairs matched!", sticker: STICKER_CELEBRATE })` | Tier VO — 3★: "Lightning fast doubling!" / 2★: "Nice work!" / 1★: "You finished — let's get faster next time!" | CTA visible immediately (interrupts) | Yes (sequential, CTA interrupts) | **Screen FIRST → postMessage → audio** | CTA tap (`Play Again` or `Claim Stars`) stops all audio → motivation OR stars_collected |
| 11 | Claim Stars (stars_collected) | Tap "Claim Stars" on Victory | CASE 13 (stars collected) | `FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE })` (non-awaited — screen has `duration: 2500`) | — | No CTA | No (duration-driven) | After hide → `postMessage({ type: 'game_exit' }, '*')` | Screen auto-dismisses after 2500ms; `game_exit` postMessage fires |
| 12 | Motivation | Mount after Try Again (game_over) or Play Again (victory < 3★) | CASE 12 (motivation) | `FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE })` | — (title "Ready to improve your score? ⚡" carries the message) | CTA visible (interrupts) | No (fire-and-forget; CTA can interrupt at any time) | n/a | CTA "I'm ready! 🙌" tap stops audio → `restartToRound1()` |
| 13 | Visibility hidden | `document.visibilityState === 'hidden'` during any non-end screen | CASE 14 (pause) | `FeedbackManager.pauseAll()` — no new sound plays | — | — | — | n/a | "Game Paused" overlay mounts; timer pauses; no audio plays |
| 14 | Visibility restored | `document.visibilityState === 'visible'` after a hidden | CASE 15 (resume) | `FeedbackManager.resumeAll()` | — | — | — | n/a | Overlay dismisses; timer resumes; audio resumes from pause point |

## Subtitle Examples (3 per type using actual spec content)

### Correct match (mid-round) — **no subtitle, no TTS** (multi-step rule)
Spec deliberately suppresses per-match subtitles to preserve the tap-tap-tap rhythm. No examples to show.

### Wrong match (mid-round) — **no subtitle, no TTS** (multi-step rule)
Same as above — no in-game wrong-match subtitle. Misconception info goes to `recordAttempt` only.

### Round complete — "Round complete!" (fixed — no dynamic injection)
1. After Round 1 (3 pairs matched): "Round complete!"
2. After Round 6 (4 pairs matched): "Round complete!"
3. After Round 9 (5 pairs matched) — this one is replaced by victory VO, not "Round complete!"

### Victory (tier VO)
1. Student finished in 45s with 3 lives left (3★): "Lightning fast doubling!"
2. Student finished in 78s with 2 lives left (2★): "Nice work!"
3. Student finished in 112s with 1 life left (1★): "You finished — let's get faster next time!"

### Game Over
1. Lost last life on Round 3: "Good try — let's practice those doubles again!"
2. Lost last life on Round 7: "Good try — let's practice those doubles again!"
3. Lost last life on Round 9 before final pair: "Good try — let's practice those doubles again!"

(Game-over VO is fixed across all rounds. Spec does not request round-contextual game-over messaging.)

## Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Tile select highlight | Left tile tap (first tap) | `.tile-selected` (accent border) | persistent until deselect / match |
| Locked pair pulse | Correct match | `.locked-pair` + `@keyframes pulse-lock` | 200ms (then persists green) |
| Shake wrong | Wrong match | `.shake-wrong` | 500–600ms |
| Red flash | Wrong match | `.tile-wrong-flash` (background red, fades) | 600ms |
| Heart break | Life lost | `.heart-break` (on the just-emptied heart) | 600ms |
| Fade in | New round's tiles appear | `.fade-in` | 350ms |
| Star pop | Victory stars render | `.star-earned` | 400ms (per star, staggered 100ms) |
| Pause overlay fade | `visibilitychange → hidden` | `.pause-overlay` (fade-in 200ms) | 200ms in, 200ms out |

Note: **No `.score-bounce`** — this game has no visible score counter. The `recordAttempt` field is analytics-only.
Note: **No `.streak-glow`** — the spec does not define a streak mechanic (time-based stars make streak bonus redundant).

## Wrong Answer Handling

- **Show correct answer: No.** The spec does NOT reveal the correct double on a wrong match. The student is expected to re-attempt or let elimination clarify the pairing. This is a deliberate difference from single-step MCQ games where the correct answer is revealed.
- **Misconception-specific feedback: No (in-game).** The tag (`double-add-instead`, `double-next-number`, `double-off-by-one`) is attached to `recordAttempt` for analytics only. No in-game spoken feedback distinguishes between misconception types.
- **Failure recovery (3+ consecutive wrong):** Not implemented. The lives system is the implicit recovery — after 3 wrongs, the game ends and the student is routed through motivation → restart, which is softer language by design.

## Priority and Ordering Rules (critical)

1. **Game-over overrides wrong SFX (CASE 8).** When `lives` reaches 0 on a wrong match, the wrong SFX from CASE 7 is **skipped entirely**. The wrong match's shake + red flash animation still plays (it's DOM-level), but no `incorrect_sound_effect` fires. Instead, the game-over transition mounts and fires `sound_game_over`.
2. **Screen renders BEFORE `game_complete` postMessage BEFORE audio.** For both Victory and Game Over, the order is: (1) mount transition screen (so host sees final state), (2) `window.parent.postMessage({ type: 'game_complete', ... }, '*')`, (3) `onMounted` fires the end-game SFX + VO. This ordering is enforced by `test/results-ordering.test.js`.
3. **CTA interrupts awaited audio.** On Welcome, Round-complete → next-round, Victory, and Game Over, the CTA is visible during audio playback. Tapping the CTA calls `FeedbackManager.sound.stopAll()` before routing — so a student who has read the title can advance immediately.
4. **Fire-and-forget calls MUST use `.catch(() => {})`** on the Promise to suppress unhandled rejection warnings during rapid interaction. This is a hard rule from `skills/feedback/SKILL.md` and caught by `test/feedback-unhandled-rejection.test.js`.
5. **Visibility pause is stronger than any mid-game feedback.** Even mid-fire-and-forget SFX, `FeedbackManager.pauseAll()` on `visibilitychange → hidden` halts audio cleanly and the paused overlay replaces any UI state.

## Emotional Arc Notes

- **Preview → Welcome:** energizing ("Match the doubles!", "Let's double some numbers!"). Sets the speed-practice tone.
- **Stage 1 (Rounds 1–3):** rapid wins, continuous green locks. No wrong answers expected → celebratory SFX loop. Sticker: `STICKER_CELEBRATE` repeated.
- **Stage 2 (Rounds 4–6):** larger numbers, same no-distractor grid → slight cognitive load, but correct path still dominant. First wrong matches often appear here (misreading 2-digit tiles).
- **Stage 3 (Rounds 7–9):** misconception distractors in play. Wrong matches expected → heart loss drama + shake + red flash. Stakes feel real. Students slow down to verify.
- **Round complete (every round):** awaited "Round complete!" creates a mini-victory rhythm — the one pause in the flow where dynamic TTS speaks. Intentional breathing space between tap-tap-tap rounds.
- **Victory (3★):** Lightning fast framing rewards fluency, not correctness alone. A student with 1 life left and 45s still earns 3★ — the spec's explicit decoupling of stars from accuracy.
- **Game Over:** soft, encouraging VO ("Good try — let's practice those doubles again!"). Consistent with Class 6-8 at L2 — the goal is to bring the student back for another run, not to scold.

## Sticker Catalog Used

| Sticker constant | Used in moments | Intent |
|------------------|-----------------|--------|
| `STICKER_MOTIVATE` | Welcome VO, Round-N intro, motivation | forward-looking energy |
| `STICKER_CELEBRATE` | Correct match, Round complete, Victory, Stars Collected | reward |
| `STICKER_SAD` | Wrong match, Game Over, Game Over VO | empathetic failure |
| `null` | Tile select / deselect | neutral UI feedback (no sticker overlay for micro-interactions) |
