# Round Flow: Add List with Adjustment Strategy — The Compensation Workout

## Round Types

The game has ONE round type — `'adjust-and-add'` — used by all 9 rounds across all 3 sets (A / B / C). Per-stage visual surface differs (default grey / soft blue / bolder weight), and per-round addend pairs differ, but the round-flow logic is identical.

## Round Type: adjust-and-add (single-step P2 + custom +/- nudge)

### Step-by-step (single-step single-step + retry-same-round)

1. **Round starts** — `renderRound(N)` fires.
   - Read `round = gameState.activeRounds[N - 1]`.
   - Set `gameState.addend1Display = round.addend1Start`; `gameState.addend2Display = round.addend2Start`.
   - Set `gameState.attemptsOnThisRound = 0`.
   - Apply per-stage visual surface based on `round.stage` (1: grey / weight 500; 2: blue border / weight 500; 3: grey / weight 700).
   - Repaint the workspace DOM: addend boxes (with `addend1Display` / `addend2Display`), +/- buttons, Reset pill, numeric input.
   - Clear `inputEl.value`. **Do NOT auto-focus** (Mobile rule #17).
   - Call `floatingBtn.setSubmittable(false)`.
   - Set `gameState.isProcessing = false`.
   - Fire round prompt TTS: `FeedbackManager.playDynamicFeedback({ audio_content: 'Add ' + round.addend1Start + ' and ' + round.addend2Start + '.', subtitle: 'Add ' + round.addend1Start + ' and ' + round.addend2Start + '.' }).catch(() => {})` — fire-and-forget (CASE 3).

2. **Student sees** — two addend boxes side by side showing the round's starting values, with a big bold `+` between them; pink `−` button above each box, green `+` button below each box; `↺ Reset` pill below the workspace; numeric input with `?` placeholder below Reset; FloatingButton "Next Round" at the bottom (disabled). The per-stage visual differentiator is visible (grey / blue / bolder).

3. **Student acts** — three independent affordances:
   - **Tap `+` or `−` button** on either addend box → mutate `addend1Display` / `addend2Display` by ±1 (clamp `>= 0` defensively); soft tick SFX fire-and-forget; 100 ms scale-down (0.92) ambient feedback animation; box display updates instantly. NO grading, NO life loss, NO `recordAttempt`. Unbounded — students can tap as many times as they want.
   - **Tap `↺ Reset` pill** → animate both addend boxes back to `round.addend1Start` / `round.addend2Start` over ~300 ms (a smooth count animation if technically feasible; otherwise instant snap with a fade); soft confirm SFX fire-and-forget. **`inputEl.value` is NOT cleared** (per spec Decision-Point #4 / Reset semantics). NO grading, NO life loss.
   - **Tap the numeric input field** to focus → system numeric keypad opens (per `inputmode="numeric"`). Type a whole number (digits only — `oninput` listener strips non-digits defensively). After every keystroke: `floatingBtn.setSubmittable(input.value.trim().length > 0)`. NO SFX on keystroke (avoid keyboard chatter).
   - **Tap "Next Round"** (or press Enter on input — Mobile rule #16) with input non-empty → submit fires.

4. **Correct path (single-step — SFX awaited + dynamic TTS awaited):**

   `handleSubmit()` runs inside `floatingBtn.on('submit', async () => { if (gameState.isProcessing) return; await handleSubmit(); })`.

   a. `gameState.isProcessing = true` (set BEFORE any await; also blocks +/- and Reset taps via the same guard).
   b. Read `typedValue = Number(inputEl.value.trim())`. Read `correct = round.correct`. Compute `isCorrect = (typedValue === correct)`.
   c. **CORRECT branch** (`isCorrect === true`):
      i. Input pill turns green (`.mathai-input-correct` or equivalent class).
      ii. Disable the +/- and Reset buttons (set `disabled = true` / opacity dim) so the player can't mutate scratchpad during feedback.
      iii. Call `progressBar.update(currentRound, gameState.lives)` **FIRST** (memory: `progress_bar_round_complete` — must precede any `await` so the bar bumps before SFX/TTS; on R9 this paints `9/9` BEFORE Victory).
      iv. `gameState.score += 1`.
      v. If `gameState.attemptsOnThisRound === 0` → `gameState.firstTryCorrect += 1`.
      vi. Push `recordAttempt`-style record: `{ round: currentRound, set: round.set, id: round.id, value: inputEl.value.trim(), is_correct: true, is_retry: gameState.attemptsOnThisRound > 0, misconception_tags: [], stage: round.stage, attempts_on_round: gameState.attemptsOnThisRound + 1 }` (record BEFORE audio).
      vii. **Friendly-pair reveal animation:** animate `addend1Display` from current value → `round.addend1Friendly` and `addend2Display` from current value → `round.addend2Friendly` over ~500 ms (smooth count anim). Fade in a green tick badge between the boxes.
      viii. `await FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE, minDuration: 1500 })` (CASE 4 single-step — awaited with 1.5 s floor).
      ix. `await FeedbackManager.playDynamicFeedback({ feedback_type: 'correct', audio_content: round.successAudio, subtitle: round.successSubtitle, sticker: STICKER_CELEBRATE })` (e.g. *"Nice! 58 plus 72 is the same as 60 plus 70, which is 130."*).
      x. **Auto-advance:** if `currentRound < 9` → `currentRound += 1; renderRoundIntro(currentRound);` else `endGame(true)`. The next `renderRound(N+1)` is the single source of truth for re-enabling input (`isProcessing = false`, `floatingBtn.setSubmittable(false)` reset, etc.). Do NOT re-enable in this handler.

5. **Wrong path (single-step — SFX awaited + dynamic TTS awaited; lives remain):**

   `handleSubmit()` continues:

   a. `gameState.isProcessing = true` (already set in step 4a).
   b. **WRONG branch** (`isCorrect === false`) AND `gameState.lives > 1`:
      i. Input pill flashes red and shakes (~600 ms keyframe animation: `-6 px → +6 px → -6 px → +6 px → 0`, 4 cycles). `await new Promise(r => setTimeout(r, 600))`.
      ii. Disable +/- and Reset buttons.
      iii. Call `progressBar.update(currentRound, gameState.lives - 1)` **FIRST** (decrements heart visually before audio).
      iv. `gameState.lives -= 1`.
      v. Resolve misconception via `resolveMisconception(round, typedValue)` — see "Wrong-answer evaluator" section below.
      vi. Push `recordAttempt`: `{ round: currentRound, set: round.set, id: round.id, value: inputEl.value.trim(), is_correct: false, is_retry: gameState.attemptsOnThisRound > 0, misconception_tags: [resolvedTag], stage: round.stage, attempts_on_round: gameState.attemptsOnThisRound + 1 }`.
      vii. After the input shake, animate addend boxes back to `round.addend1Start` / `round.addend2Start` over ~300 ms.
      viii. Clear `inputEl.value` (after the shake — order matters so the student SEES the wrong number flash red before it disappears).
      ix. `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD, minDuration: 1500 })` (CASE 7 — awaited with 1.5 s floor).
      x. `await FeedbackManager.playDynamicFeedback({ feedback_type: 'incorrect', audio_content: round.failAudio, subtitle: round.failSubtitle, sticker: STICKER_SAD })` (e.g. *"Not quite — the sum of 58 and 72 is 130."*).
      xi. `gameState.attemptsOnThisRound += 1` (so a subsequent correct on this round is NOT counted as first-try).
      xii. **`resetRoundForRetry()`**: this is the SAME-round retry helper. It does:
         1. Re-read `round = gameState.activeRounds[currentRound - 1]` (currentRound NOT incremented).
         2. Set `gameState.addend1Display = round.addend1Start`; `gameState.addend2Display = round.addend2Start` (defensive — should already be reset by step 5b vii).
         3. Repaint addend boxes with the starting values.
         4. Re-enable +/- and Reset buttons.
         5. `inputEl.value = ''` (defensive; already cleared in step 5b viii).
         6. `floatingBtn.setSubmittable(false)` (input is empty).
         7. `gameState.isProcessing = false` (RE-ENABLES input — single source of truth for the wrong-with-lives path).
         8. Re-attach `oninput` / `onkeydown` listeners if they were removed (they shouldn't be — listeners persist for the input element).
         9. **`gameState.attemptsOnThisRound` is NOT reset.** It KEEPS the bump from step 5b xi.
         10. Round prompt TTS does NOT replay (the student already heard it; CASE 3 fire-and-forget already fired once on round entry).

6. **Wrong path (last life — CASE 8):**

   `handleSubmit()` continues:

   a. `gameState.isProcessing = true` (already set).
   b. **WRONG-LAST-LIFE branch** (`isCorrect === false` AND `gameState.lives === 1`):
      i. Same as step 5b i–x (input flash + shake, progressBar update, lives decrement to 0, addends reset, input clear, awaited SFX with 1.5 s floor, awaited TTS announcing correct sum) — **wrong feedback MUST play before game-over** (CASE 8).
      ii. After audio completes: `endGame(false)`.
      iii. `endGame(false)` checks `gameState.lives === 0` → routes to `showGameOver()`.

7. **Last round complete — Victory (R9 correct):**

   After step 4c x with `currentRound === 9`:
   a. `endGame(true)` is called.
   b. Compute `gameState.stars = getStars()`.
   c. Send `game_complete` postMessage with metrics (`{ score: gameState.score, totalQuestions: 9, stars: gameState.stars, accuracy: (gameState.firstTryCorrect / 9) * 100, timeSpent: Date.now() - gameState.startTime }`) **BEFORE** `showVictory()` audio plays.
   d. `showVictory()` renders the Victory transition with title `"Victory 🎉"`, subtitle per stars tier, `stars: gameState.stars`, conditional buttons.

8. **Last round complete — Game Over (R9 wrong-last-life):**

   After step 6b ii with `currentRound === 9` AND `gameState.lives === 0`:
   a. `endGame(false)` is called.
   b. Compute `gameState.stars = 0`.
   c. Send `game_complete` postMessage with metrics — `{ score, totalQuestions: 9, stars: 0, ... }` — **BEFORE** Game Over audio plays.
   d. `showGameOver()` renders the Game Over transition.

### State changes per step

| Step | gameState fields changed | DOM update |
|------|--------------------------|------------|
| Round starts (`renderRound(N)`) | `addend1Display = round.addend1Start`; `addend2Display = round.addend2Start`; `attemptsOnThisRound = 0`; `isProcessing = false` | Workspace DOM repainted; per-stage visual surface applied; input cleared; FloatingButton disabled |
| +/- nudge tap | `addend1Display` OR `addend2Display` ± 1 (clamp ≥ 0) | Box display updates; 100 ms scale-down on tapped button |
| Reset tap | `addend1Display = round.addend1Start`; `addend2Display = round.addend2Start` | Boxes animate back over ~300 ms; input value preserved |
| Type digit | (none) | `oninput` strips non-digits; `floatingBtn.setSubmittable(input.value.trim().length > 0)` |
| Correct submit | `isProcessing = true`; `score += 1`; if attemptsOnThisRound === 0 then `firstTryCorrect += 1`; `attempts.push({...is_correct:true})` | Input pill green; addend boxes animate to friendly pair + green tick (~500 ms); progressBar bumps to N/9 FIRST; SFX + TTS awaited |
| Wrong submit (lives remain) | `isProcessing = true`; `lives -= 1` (after progressBar update); `attemptsOnThisRound += 1` (after audio); `attempts.push({...is_correct:false, misconception_tags:[tag]})` | Input pill red flash + shake (~600 ms); progressBar dims one heart FIRST; addends animate back to start (~300 ms); input clears; SFX + TTS awaited; `resetRoundForRetry()` re-renders same round; `isProcessing = false` |
| Wrong submit (last life) | Same as wrong-with-lives except `lives -= 1` brings it to 0 | Same as wrong-with-lives except after audio: `endGame(false)` → `showGameOver()` |
| Round transition (auto, correct) | `currentRound += 1`; round-intro audio queues | TransitionScreen "Round N+1" auto-advances after sequential audio |
| Last round complete (R9 correct) | `stars = getStars()`; `game_complete` posted | `showVictory()` renders |
| Last round complete (R9 wrong-last-life) | `stars = 0`; `game_complete` posted | `showGameOver()` renders |
| `restartGame()` | `setIndex = (setIndex + 1) % 3` (BEFORE reset); `lives = 3`; `score = 0`; `firstTryCorrect = 0`; `attemptsOnThisRound = 0`; `currentRound = 1`; `attempts = []`; `activeRounds = filter set`; `addend1Display`/`addend2Display = activeRounds[0].addend1Start`/`addend2Start` | progressBar reset (idempotent); `renderRoundIntro(1)` paints |

## Wrong-answer evaluator

The wrong-answer evaluator computes whether the student's submitted value matches one of the named misconception families pre-computed in `round.misconception_tags`. Each round object's `misconception_tags` is keyed by the candidate integer that the named misconception would produce.

```js
function resolveMisconception(round, typedValue) {
  const key = String(typedValue);
  if (round.misconception_tags[key]) return round.misconception_tags[key];
  return 'whole-rule-mismatch';
}
```

The 7 named misconception tags in this game:

| Tag | Definition (per spec) |
|-----|------------------------|
| `compensation-applied-only-to-addend1` | Student nudged addend1 to a friendly value but kept addend2 unchanged, then summed the new pair (e.g. `58 → 60`, kept `72`, typed `132`). |
| `compensation-applied-only-to-addend2` | Student nudged addend2 to a friendly value but kept addend1 unchanged (e.g. kept `58`, `72 → 70`, typed `128`). |
| `wrong-direction-compensation` | Student added to BOTH addends (or subtracted from both) — wrong-direction nudge on one side. |
| `arithmetic-error-on-friendly-pair` | Student correctly applied compensation to reach the friendly pair but mis-added it (e.g. types `120` or `140` instead of `130` for `60 + 70`). |
| `tens-only-no-ones-add` | Student added the tens digits and forgot the ones (e.g. `5 + 7 = 12 → 120` for `58 + 72`). |
| `off-by-ten-place-value-slip` | Student misread / typed one of the addends with a tens-digit slip (e.g. read `58` as `48` and typed `120` for `58 + 72`). |
| `whole-rule-mismatch` | Default fallback — student's typed value matches none of the above. |

The TTS payload for wrong submits is `round.failAudio` regardless of which misconception tag matched (per spec: wrong-feedback content reveals the correct sum verbatim, not a per-misconception script). The misconception tag flows ONLY to `recordAttempt.misconception_tags[0]` for the gauge / signal-collector phase.

## "Next Round" FloatingButton (PART-050) — control rules

- **Component:** `FloatingButtonComponent` (PART-050), instantiated once at game-build time, mounted in `ScreenLayout`'s floating-button slot (`slots: { floatingButton: true }`).
- **Test selector:** `.mathai-fb-btn-primary`.
- **Initial mode:** `floatingBtn.setMode('submit')`. Label override: `"Next Round"`.
- **Initial submittable:** `floatingBtn.setSubmittable(false)`.
- **Visibility predicate:** the input's `oninput` listener calls `floatingBtn.setSubmittable(input.value.trim().length > 0)` after stripping non-digits.
- **Submit handler:** registered ONCE — `floatingBtn.on('submit', async () => { if (gameState.isProcessing) return; await handleSubmit(); })`.
- **Per-round lifecycle (correct path):** `renderRound(N+1)` clears the input AND calls `floatingBtn.setSubmittable(false)` to disable for the new round. Mode remains `'submit'`.
- **Per-round lifecycle (wrong-with-lives path):** `resetRoundForRetry()` clears the input AND calls `floatingBtn.setSubmittable(false)` to disable. Same `'submit'` mode persists.
- **End-of-game lifecycle:** mode flips to `'next'` ONLY inside `showAnswerCarousel()` AFTER `answerComponent.show(...)` has rendered. `floatingBtn.on('next', ...)` is registered once alongside `setMode('next')`. **Use `on('next', ...)` for the Next click — NOT `on('submit', ...)` after `setMode('next')`.**
- **Next click handler (single-stage exit):**
  ```
  floatingBtn.on('next', () => {
    answerComponent.destroy();
    previewScreen.destroy();
    floatingBtn.destroy();
    window.parent.postMessage({ type: 'next_ended' }, '*');
  });
  ```
- **Destroy timing:** inside the `on('next', ...)` handler — NEVER inside `endGame()`.

## End-game chain (multi-round, with Victory + Stars Collected + AnswerComponent)

The celebration beat plays FIRST. AnswerComponent appears AFTER. Single-stage Next exits.

1. **Final-round (R9) `handleSubmit()`** evaluates → either correct (step 4) or wrong-last-life (step 6). After feedback:
   - Correct R9: `endGame(true)` is called from step 4c x.
   - Wrong-last-life R9: `endGame(false)` is called from step 6b ii.

2. **`endGame(success)`** computes `gameState.stars = getStars()`, posts `game_complete` (BEFORE end-game audio), then routes:
   - `gameState.lives === 0` → `showGameOver()`.
   - else → `showVictory()`.

3. **`showVictory()`** renders Victory TransitionScreen with `title: 'Victory 🎉'`, subtitle by `gameState.stars`, `stars: gameState.stars`, conditional `buttons` array, `persist: true`. `onMounted` plays `sound_game_victory` (awaited) → `vo_victory_stars_N` VO (awaited). The `buttons` array is:
   - `stars === 3` → `[{ text: 'Claim Stars', type: 'primary', action: showStarsCollected }]`.
   - `stars < 3` → `[{ text: 'Play Again', type: 'secondary', action: showMotivation }, { text: 'Claim Stars', type: 'primary', action: showStarsCollected }]`.

4. **`showStarsCollected()`** (called from Victory's `Claim Stars` action — NEVER directly from `endGame()` or from any path that skips Stars Collected):
   ```
   transitionScreen.show({
     title: 'Yay! 🎉\nStars collected!',
     buttons: [],
     persist: true,
     styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } },
     onMounted: async () => {
       await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE });
       window.parent.postMessage({ type: 'show_star', stars: gameState.stars }, '*');
       setTimeout(() => showAnswerCarousel(), 1500);
       // DO NOT call transitionScreen.hide() here — TS persists as backdrop.
     }
   });
   ```

5. **`showAnswerCarousel()`**:
   ```
   answerComponent.show({ slides: buildAnswerSlidesForAllRounds() });
   floatingBtn.setMode('next');
   floatingBtn.on('next', () => {
     answerComponent.destroy();
     previewScreen.destroy();
     floatingBtn.destroy();
     window.parent.postMessage({ type: 'next_ended' }, '*');
   });
   ```
   This is the **only place** `answerComponent.show(...)` is called.

6. **`buildAnswerSlidesForAllRounds()`** returns 9 slide objects:
   ```
   function buildAnswerSlidesForAllRounds() {
     return gameState.activeRounds.map((round, i) => ({
       render(container) {
         renderAnswerForRound(round, container);
       }
     }));
   }
   ```
   Each `render(container)` is self-contained — uses ONLY `round.answer` (`addend1Start`, `addend2Start`, `addend1Friendly`, `addend2Friendly`, `correct`, `strategyStatement`) plus DOM utilities. NO references to live game-area DOM (which may have been destroyed by feedback rendering).

7. **`renderAnswerForRound(round, container)`** paints, for that round:
   - Two starting-value boxes side by side showing `round.answer.addend1Start` and `round.answer.addend2Start`.
   - A faint `↓` chevron / arrow.
   - Two friendly-value boxes side by side showing `round.answer.addend1Friendly` and `round.answer.addend2Friendly`.
   - A green tick badge with `round.answer.correct` below the friendly pair.
   - A strategy statement banner with `round.answer.strategyStatement` above or below.
   - No +/- buttons, no Reset, no input box, no hearts, no progress bar.

   Slide titles: `Round 1`, `Round 2`, ..., `Round 9`.

**Game Over branch:** `showGameOver()` renders `transitionScreen.show({ title: 'Game Over', subtitle: 'You ran out of lives!', icons: ['😔'], buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }], persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); } })`. **The AnswerComponent does NOT ship from the Game Over branch.** Tap `Try Again` → `showMotivation()` → `restartGame()`.

**`showMotivation()`**:
```
transitionScreen.show({
  title: "Ready to improve your score? ⚡",
  buttons: [{ text: "I'm ready! 🙌", type: 'primary', action: restartGame }],
  persist: true,
  onMounted: async () => {
    progressBar.update(0, 3);  // restart-path reset
    await FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE });
  }
});
```

**`restartGame()`** (called from Motivation's `[I'm ready! 🙌]` CTA):
```
function restartGame() {
  // STEP 1 — increment setIndex BEFORE resetGameState (so new slice is in place).
  gameState.setIndex = (gameState.setIndex + 1) % 3;

  // STEP 2 — resetGameState (DOES NOT reset setIndex).
  resetGameState();

  // STEP 3 — safety-net reset (idempotent).
  progressBar.update(0, 3);

  // STEP 4 — render Round 1 Intro (skips Preview + Welcome).
  renderRoundIntro(1);
}

function resetGameState() {
  gameState.currentRound = 1;
  gameState.lives = 3;
  gameState.score = 0;
  gameState.firstTryCorrect = 0;
  gameState.attemptsOnThisRound = 0;
  gameState.attempts = [];
  gameState.isProcessing = false;
  gameState.activeRounds = fallbackContent.rounds.filter(r => r.set === SETS[gameState.setIndex]);
  gameState.addend1Display = gameState.activeRounds[0].addend1Start;
  gameState.addend2Display = gameState.activeRounds[0].addend2Start;
  // setIndex MUST NOT appear here — it is bumped in restartGame's step 1 and persists.
}
```

## Round Presentation Sequence

Within the gameplay screen, each round follows this sequence (matches screens.md):

1. **Question preview** — boxes, +/- buttons, Reset, input, FloatingButton paint as a single unit on round entry. Per-stage visual surface applied. Input shows `?` placeholder, FloatingButton disabled.
2. **Instructions** — NO on-screen instruction text on the gameplay screen. The how-to-play copy is delivered ONCE by PreviewScreenComponent (`previewInstruction` + `previewAudioText`) before Round 1. Round-N intro transitions convey only the round number.
3. **Media** — round prompt TTS (`'Add ' + addend1Start + ' and ' + addend2Start + '.'`) plays fire-and-forget on render (CASE 3). Does NOT block input.
4. **Gameplay reveal** — workspace + input + FloatingButton are immediately interactive on render. `gameState.isProcessing = false` is set inside `renderRound()` so input is unblocked from the first tap.

## ProgressBar update timing rule

`progressBar.update(N, lives)` MUST be the FIRST action inside the round-complete handler — BEFORE any `await` (memory: `progress_bar_round_complete`).

- Correct: `progressBar.update(currentRound, gameState.lives)` BEFORE awaited correct SFX/TTS. On R9 this paints `9/9` BEFORE Victory renders.
- Wrong-with-lives: `progressBar.update(currentRound, gameState.lives - 1)` BEFORE awaited wrong SFX/TTS. The decrement is to `lives - 1` because `gameState.lives -= 1` happens AFTER this call (defensive ordering — the visual update reflects the post-decrement state).
- Wrong-last-life: same as wrong-with-lives — `progressBar.update(currentRound, 0)` BEFORE the awaited wrong SFX/TTS.

If progressBar update happens AFTER the awaited audio, the final round's Victory shows `8/9` instead of `9/9` — a known bug pattern this rule prevents.

## Re-entry guard

`gameState.isProcessing` guards `handleSubmit()` so a double-tap on FloatingButton OR a second Enter keypress during feedback is a no-op:

```
floatingBtn.on('submit', async () => {
  if (gameState.isProcessing) return;
  await handleSubmit();
});

input.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') {
    if (gameState.isProcessing) return;
    await handleSubmit();
  }
});
```

`isProcessing = true` is set as the FIRST line inside `handleSubmit()` (BEFORE the typed-value read, so a re-entrant call during the value-read window is also blocked). It's cleared FALSE inside `renderRound()` (correct path) or `resetRoundForRetry()` (wrong-with-lives path).

The +/- and Reset buttons ALSO check `isProcessing`:

```
plusBtn1.addEventListener('click', () => {
  if (gameState.isProcessing) return;
  gameState.addend1Display += 1;
  repaintBox1();
  FeedbackManager.sound.play('soft_tick_sfx', {}).catch(() => {});
});
```

This prevents the player from mutating scratchpad state while feedback is playing.

## Visibility (CASE 14 / 15)

- **CASE 14 — visibility hidden:** Browser fires `visibilitychange` with `document.hidden === true`. FeedbackManager pauses all in-flight audio (static + dynamic). **VisibilityTracker's built-in PopupComponent** renders the pause overlay automatically (memory: `feedback_pause_overlay` — never custom-build a pause overlay div). NO timer to pause (PART-006 not used in this game).
- **CASE 15 — visibility restored:** `visibilitychange` with `document.hidden === false`. FeedbackManager resumes audio. VisibilityTracker dismisses its own popup. Gameplay continues exactly where it was: `inputEl.value` preserved, `addend1Display` / `addend2Display` preserved, `attemptsOnThisRound` preserved.

## Audio failure (CASE 16)

All audio calls are try/catch wrapped (`await sound.play(...)` inside an outer try/catch in `handleSubmit()`, `playDynamicFeedback(...)` likewise) OR `.catch(() => {})` on fire-and-forget calls (round prompt, +/- tick SFX, Reset confirm SFX). Visual feedback (red shake, friendly-pair reveal, green tick, heart dim) renders regardless. Game advances normally.

## Cross-checks

- ✅ Both correct and wrong paths fully specified for every round.
- ✅ State changes table covers all gameState mutations and DOM updates.
- ✅ `isProcessing = true` set BEFORE any `await`.
- ✅ ProgressBar update is FIRST in round-complete handler.
- ✅ Wrong-with-lives RETRY-SAME-ROUND: `currentRound` NOT incremented; `attemptsOnThisRound` incremented; `firstTryCorrect` suppressed for retry-correct.
- ✅ Wrong-last-life: wrong feedback completes BEFORE Game Over (CASE 8).
- ✅ Single-step P2 + custom button-nudge: dynamic TTS awaited per single-step contract.
- ✅ FloatingButton mode `'submit'` throughout gameplay; flips to `'next'` ONLY inside `showAnswerCarousel()`.
- ✅ `restartGame()`: `setIndex++` BEFORE `resetGameState()`; `setIndex` NOT in reset list; persists across restarts.
- ✅ `resetRoundForRetry()` does NOT reset `attemptsOnThisRound` — that bump persists so subsequent correct on same round is NOT first-try.
- ✅ Audio failure (CASE 16) handled via try/catch.
- ✅ Visibility (CASE 14/15) handled by VisibilityTracker + FeedbackManager (no custom pause overlay).
