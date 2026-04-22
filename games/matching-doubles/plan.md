# Game Plan: Matching Doubles

**Archetype:** Memory Match (#5), adapted to column-pair matching (tiles face-up). Overrides default `lives: 0` to `lives: 3` and adds `game_over` screen.
**Shape:** Multi-round (Shape 2).
**Rounds:** 9 (3 per stage).
**Interaction:** Tap-left → tap-right = one match attempt (multi-step, mid-round matches fire-and-forget).
**Star rating:** Time-only. 3* <= 60s, 2* <= 90s, 1* > 90s OR lives == 0.

---

## 1. Screen Flow

All screens render inside the persistent `PreviewScreenComponent` wrapper (`mathai-preview-slot`). The preview header (avatar, question label, score, star) is visible on every screen EXCEPT the initial `preview` overlay itself. The gameplay screen uses a `ProgressBarComponent` showing `round i/9` on the left and 3 hearts on the right. The same progress bar persists across round-complete and game-over / victory screens (state preserved).

### Screen list and transitions

| Screen name (id) | Type | Enter from | Exit via | CDN component |
|---|---|---|---|---|
| `preview` | PreviewScreenComponent overlay | `DOMContentLoaded` -> `setupGame()` -> `previewScreen.show()` | 5s timer OR "Skip" button -> `onComplete` -> `startGameAfterPreview()` | `PreviewScreenComponent` (PART-039, mandatory) |
| `round-intro` | TransitionScreen (auto-advance, no CTA) | `startGameAfterPreview()` (for Round 1) OR `nextRound()` (Rounds 2-9) | Audio sequence finishes -> `hide()` -> `renderRound()` | `TransitionScreenComponent` |
| `gameplay` | Game body inside `#gameContent` | `renderRound()` | All pairs locked -> `onRoundComplete()` OR lives==0 -> `endGame('game_over')` | `ProgressBarComponent` (with hearts) |
| `round-complete` | Inline awaited SFX+VO on gameplay screen | All pairs locked | Audio finishes -> `nextRound()` OR `endGame('victory')` | `FeedbackManager` overlay (no separate screen) |
| `game_over` | TransitionScreen (persist, CTA) | lives reaches 0 mid-round | "Try Again" tap -> `showMotivation()` | `TransitionScreenComponent` |
| `motivation` | TransitionScreen (persist, CTA) | "Try Again" on `game_over` OR "Play Again" on <3* Victory | "I'm ready!" tap -> `restartToRound1()` (skips preview + welcome) | `TransitionScreenComponent` |
| `victory` | TransitionScreen (persist, CTA) | Round 9 last pair locked AND lives >= 1 | `stars === 3`: "Claim Stars" -> `stars_collected`. `stars < 3`: "Play Again" -> `motivation` OR "Claim Stars" -> `stars_collected` | `TransitionScreenComponent` (uses `stars` slot) |
| `stars_collected` | TransitionScreen (auto-dismiss) | "Claim Stars" on victory | 2500ms duration -> `postMessage({type:'game_exit'})` | `TransitionScreenComponent` |
| `paused` | Inline overlay (visibility change) | `visibilitychange` hidden | `visibilitychange` visible -> resume | Overlay managed in game code (CASE 14/15) |

### Component usage per screen

- **PreviewScreenComponent (PART-039, MANDATORY):**
  - Constructed once at init: `new PreviewScreenComponent({ slotId: 'mathai-preview-slot' })`
  - `show({ instruction: fallbackContent.previewInstruction, audioUrl: fallbackContent.previewAudio, showGameOnPreview: false, timerConfig: { type: 'decrease', startTime: 5, endTime: 0 }, timerInstance: timer, onComplete: startGameAfterPreview })` is called EXACTLY ONCE during `setupGame()` on first session start.
  - Preview wrapper remains mounted for the entire session. All subsequent screens (round intro, gameplay, game over, victory, motivation, stars collected) render INSIDE `#gameContent` without ever hiding, re-parenting, or destroying the wrapper.
  - `restartGame()` / `restartToRound1()` MUST NOT call `previewScreen.show()` again (PART-039 invariant).
  - `previewScreen.destroy()` is called EXACTLY ONCE from the single terminal `endGame()` cleanup function.

- **TransitionScreenComponent:**
  - One shared instance used for round intros, game over, motivation, victory, stars collected.
  - Round-intro variant: `transitionScreen.show({ title: 'Round ' + N, subtitle: <stage label>, persist: false })`, with NO buttons -> auto-advances after awaited SFX + VO sequence completes.
  - End-game variants copy defaults verbatim from `reference/default-transition-screens.md` with game-specific subtitle overrides per spec (see Section 4).

- **ProgressBarComponent (with lives/hearts):**
  - Initialised once at game start with `{ totalRounds: 9, showHearts: true, totalLives: 3 }`.
  - **First-param semantic per PART-023 + PART-026: rounds COMPLETED (0-indexed), NOT `currentRound`.** So at round 1 we pass `0` (zero rounds completed → CDN shows `Round 0/9`). After round 1 is locked, we pass `1`. Final victory paint: `9`.
  - Call sites:
    - Init (right after `new ProgressBarComponent(...)`): `progressBar.update(0, gameState.totalLives)` — MANDATORY per PART-023.
    - Round advance (renderRound): `progressBar.update(gameState.currentRound - 1, gameState.lives)` (rounds-completed = previous round index; at round 1 → 0/9, at round 9 → 8/9).
    - **Round complete** (FIRST thing in `onRoundComplete`, BEFORE round-complete SFX/subtitle and BEFORE any awaited feedback): `progressBar.update(gameState.currentRound, Math.max(0, gameState.lives))` — bumps rounds-completed to N immediately when the last pair locks, so the bar fills in sync with the visual lock. **Required on Round 9** so the victory screen shows 9/9 with fully-filled bar, otherwise it sticks at 8/9.
    - Wrong match (decrement lives): `progressBar.update(gameState.currentRound - 1, Math.max(0, gameState.lives))` — clamp lives per PART-023 rule 51 (`LP-PROGRESSBAR-CLAMP`).
    - Restart: `progressBar.update(0, 3)`.
  - Persists across game-over and motivation screens (state preserved, resets only on entering Round 1 of the restart path).

---

## 2. Round-by-Round Breakdown

Each round uses `fallbackContent.rounds[N-1]`. The student sees:
- Left column (tappable tiles) with `left.length` numbers
- Right column (tappable tiles) with `right.length` numbers (pairs count + distractors in Stage 3)
- Progress bar: `round i/9` + hearts
- Timer: running, count-up
- Prompt at top of gameplay body: `"Match each number to its double"` (static, same every round; distinct from preview instruction)

**Success:** Every left-column tile is correctly paired with its double on the right (all pairs locked green). Auto-advance to next round intro or victory.

| # | Stage | Pairs | Left values | Right values (distractors flagged) | What the student sees | Success condition |
|---|---|---|---|---|---|---|
| 1 | 1 (Warm-up) | 3 | 3, 5, 8 | 16, 6, 10 | 3x3 tile grid (3 left, 3 right); small single-digit numbers | All 3 pairs locked green |
| 2 | 1 | 3 | 4, 7, 9 | 18, 8, 14 | Same layout, new numbers | All 3 pairs locked |
| 3 | 1 | 3 | 2, 6, 9 | 18, 4, 12 | Same layout | All 3 pairs locked |
| 4 | 2 (Standard) | 4 | 6, 11, 15, 22 | 44, 12, 30, 22 | 2x4 tile grid (4 left, 4 right); mix of 1- and 2-digit numbers; Tile "22" appears on both columns -- different tile instances (left=base 22, right=double of 11) | All 4 pairs locked |
| 5 | 2 | 4 | 9, 13, 18, 25 | 36, 18, 50, 26 | Same layout; "18" appears on both columns (left=base 18, right=double of 9) | All 4 pairs locked |
| 6 | 2 | 4 | 8, 14, 20, 27 | 28, 40, 54, 16 | Same layout; no repeats | All 4 pairs locked |
| 7 | 3 (Confusability) | 5 | 15, 18, 21, 24, 30 | 36, **17** [add-instead, tag `double-add-instead`], 42, 60, 30, 48 | 2x5-ish grid (5 left, 6 right); "17" is a near-miss distractor for 15 (15+2) | All 5 correct doubles locked; the distractor tile "17" is never successfully paired |
| 8 | 3 | 5 | 17, 23, 28, 35, 40 | 46, **29** [next-number, tag `double-next-number`], 56, 80, 70, 34, **55** [off-by-one, tag `double-off-by-one`] | 5 left, 7 right; 2 distractors ("29" = 28+1, "55" = 2*28-1) | All 5 correct doubles locked |
| 9 | 3 | 5 | 19, 26, 33, 42, 50 | 38, 52, **44** [add-instead, tag `double-add-instead`], 66, 84, 100, **51** [next-number, tag `double-next-number`] | 5 left, 7 right; 2 distractors ("44" = 42+2, "51" = 50+1) | All 5 correct doubles locked (last round -> victory) |

**Distractor behaviour:** In Stage 3, tapping a left tile + a distractor right tile = wrong match. Distractor tiles are NOT disabled after a failed attempt (they stay interactive) so students can keep getting pulled. Each wrong attempt decrements lives and records the `misconception_tag` from `round.misconception_tags[distractor_value]`.

**Grid layout:** Two columns, vertical. Each tile is >= 44x44px with >= 8px spacing (mobile rule). Left and right columns center-justified, gap between columns >= 16px. Tiles scale down in font-size for large numbers (Stage 3 up to 100) to fit in 44x44 target.

---

## 3. Scoring & Lives Logic

### Lives

| Aspect | Value |
|---|---|
| Start | 3 |
| Decrement | Each wrong match -> `gameState.lives -= 1` (fires BEFORE awaited wrong SFX, per data-contract order) |
| UI update | `progressBar.update(gameState.currentRound - 1, Math.max(0, gameState.lives))` immediately after decrement -> hearts re-render. First arg = rounds completed per PART-023; second arg clamped per PART-023 `LP-PROGRESSBAR-CLAMP` |
| End-game rule | If `gameState.lives === 0` after a decrement -> skip wrong SFX, jump straight to `endGame('game_over')` (feedback CASE 8) |
| Reset (restart path) | `gameState.lives = 3` before Round 1 renders |

### Timer

| Aspect | Value |
|---|---|
| Type | `TimerComponent` count-up, no limit |
| Start | `timer.start()` inside `startGameAfterPreview()` (AFTER preview dismissed, BEFORE Round 1 intro audio) |
| Resets between rounds? | NO -- timer runs continuously |
| Pause triggers | (a) visibility hidden (`timer.pause({ fromVisibilityTracker: true })`), (b) `endGame('victory')` on Round 9 success, (c) `endGame('game_over')` on lives==0 |
| Resume triggers | visibility visible -> `timer.resume({ fromVisibilityTracker: true })` |
| Final value read | `gameState.finalTimeSeconds = timer.getElapsedSeconds()` inside `endGame()` BEFORE star calculation |

### Star tier computation

Executed inside `endGame(reason)` before rendering victory/game-over screen. Source of truth: `gameState.finalTimeSeconds` (rounded to seconds) and `gameState.lives`.

```
if (reason === 'game_over' || gameState.lives === 0) {
  gameState.stars = 1;
} else if (gameState.finalTimeSeconds <= 60) {
  gameState.stars = 3;
} else if (gameState.finalTimeSeconds <= 90) {
  gameState.stars = 2;
} else {
  gameState.stars = 1;
}
```

### `recordAttempt` payload (fires on every match attempt, BEFORE feedback audio)

```json
{
  "round": <1..9>,
  "round_type": "A",
  "stage": <1|2|3>,
  "is_correct": <boolean>,
  "misconception_tag": <string | null>,
  "attempt_number": <1+, per round>,
  "left_tile_value": <number>,
  "right_tile_value": <number>,
  "lives_remaining": <number>,
  "elapsed_ms": <timer.getElapsedMs()>
}
```

- `is_correct: true` when `right_tile_value === left_tile_value * 2`
- `misconception_tag: null` on correct matches
- `misconception_tag: round.misconception_tags[right_tile_value] || null` on wrong matches (only Stage 3 tiles have non-null tags; wrong matches in Stages 1-2 record `null`)
- Called synchronously in the match handler; must complete BEFORE `await FeedbackManager.sound.play(...)`

### `game_complete` payload (fires ONCE in `endGame()`, BEFORE end-game audio)

```json
{
  "type": "game_complete",
  "gameId": "matching-doubles",
  "reason": <"victory" | "game_over">,
  "stars": <1|2|3>,
  "finalTimeSeconds": <number>,
  "totalRoundsCompleted": <0..9>,
  "totalPairsMatched": <number>,
  "totalWrongMatches": <number>,
  "livesRemaining": <0..3>,
  "roundsData": [
    { "round": 1, "attempts": <n>, "wrongAttempts": <n>, "misconceptions": [<tag>, ...] },
    ...
  ],
  "previewResult": <gameState.previewResult || null>
}
```

- Sent via `window.parent.postMessage({...}, '*')` BEFORE victory/game-over SFX + VO
- Lives and stars decouple (3* possible with 1-2 lives remaining, per spec)

---

## 4. Feedback Patterns (per event)

All feedback uses `FeedbackManager` (no custom overlays). Multi-step archetype rule: mid-round matches are FIRE-AND-FORGET with 1500ms minimum duration wrap (PART-017 FEEDBACK-MIN-DURATION is for awaited answer-feedback; fire-and-forget does not need the Promise.all wrap but wrong-match wrap for awaited case IS required per spec/skill). Round-complete and end-game are AWAITED.

### SFX ids used

- `sound_select` -> tile select (soft bubble) [reuse existing correct_tap low-pitch or domain-default]
- `sound_deselect` -> tile deselect
- `sound_correct` -> correct match
- `sound_life_lost` -> wrong match
- `sound_round_complete` -> all pairs matched in a round
- `sound_game_victory` -> Round 9 victory onMounted
- `sound_game_over` -> game over onMounted
- `sound_motivation` -> motivation screen onMounted
- `sound_stars_collected` -> stars collected onMounted
- `sound_rounds` -> round intro transition

### Sticker ids used (from feedback/reference/feedbackmanager-api.md)

- `STICKER_CELEBRATE` -> correct matches, round complete, victory, stars collected
- `STICKER_SAD` -> wrong match, game over
- `STICKER_MOTIVATE` -> motivation screen
- `STICKER_ROUND` -> round intro

### Event-by-event feedback

| Event | Pattern | SFX | Sticker | TTS / Subtitle | Awaited? | Timing |
|---|---|---|---|---|---|---|
| Left tile tapped (select) | Tile adds `.selected` class (accent border). Fire-and-forget `FeedbackManager.sound.play('sound_select', {}).catch(...)`. No block. | `sound_select` | None | None | No | Immediate |
| Left tile re-tapped (deselect) | Remove `.selected`. Fire-and-forget `sound.play('sound_deselect', {}).catch(...)`. | `sound_deselect` | None | None | No | Immediate |
| Right tile tapped (no left selected) | No-op; no audio, no state change. | - | - | - | - | - |
| Right tile tapped -> correct match | 1. Mark both tiles `.locked` (green + `disabled`). 2. CSS pulse 200ms. 3. `recordAttempt({is_correct: true, misconception_tag: null, ...})`. 4. Fire-and-forget: `FeedbackManager.sound.play('sound_correct', { sticker: STICKER_CELEBRATE }).catch(e=>{})`. 5. Do NOT block input; student can start next pair immediately. 6. Check if all pairs locked -> if yes, enter round-complete handler. | `sound_correct` | `STICKER_CELEBRATE` | None | No (fire-and-forget) | Immediate; audio runs in parallel with next interaction |
| Right tile tapped -> wrong match | 1. Both tiles get `.wrong` (red + shake CSS keyframe, 600ms). 2. `gameState.lives -= 1`. 3. `progressBar.update(currentRound, gameState.lives)` -> heart re-renders. 4. `recordAttempt({is_correct: false, misconception_tag: round.misconception_tags[rightVal] \|\| null, ...})`. 5. If `gameState.lives === 0` -> SKIP wrong SFX entirely, call `endGame('game_over')` (feedback CASE 8). 6. Else: fire-and-forget `FeedbackManager.sound.play('sound_life_lost', { sticker: STICKER_SAD }).catch(e=>{})`. 7. After 600ms setTimeout: remove `.wrong`, deselect both tiles (clear `gameState.selectedLeft`/`selectedRight`). Input never fully blocked -- rapid click handler gated only by `isProcessing` during the 600ms flash for the specific two tiles. | `sound_life_lost` (skipped if lives==0) | `STICKER_SAD` | None | No (fire-and-forget) | 600ms visual flash; audio in parallel |
| All pairs matched (Round complete) | 1. `gameState.isProcessing = true` (block input during awaited audio). 2. Await `Promise.all([FeedbackManager.sound.play('sound_round_complete', { sticker: STICKER_CELEBRATE, subtitle: 'Round complete!' }), new Promise(r => setTimeout(r, 1500))])`. 3. Set `isProcessing = false`. 4. If `currentRound < 9` -> `nextRound()`. 5. If `currentRound === 9` -> `endGame('victory')`. | `sound_round_complete` | `STICKER_CELEBRATE` | Subtitle: `"Round complete!"` (no dynamic TTS) | YES (awaited) | ~1500ms min |
| Round intro (Rounds 1-9, auto-advance no CTA) | 1. Cleanup block (`FeedbackManager.sound.stopAll()`, `stream.stopAll()`) BEFORE state mutation. 2. `transitionScreen.show({ title: 'Round ' + N, subtitle: stageLabel(N), persist: false })`. 3. Sequential awaited: `await FeedbackManager.sound.play('sound_rounds', { sticker: STICKER_ROUND })` -> `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round ' + N, subtitle: 'Round ' + N, sticker: STICKER_ROUND })`. 4. Hide transition, render round. | `sound_rounds` + TTS "Round N" | `STICKER_ROUND` | Subtitle `"Round N"`; dynamic TTS same text | YES sequential (both awaited in order) | Audio-duration driven |
| Game Over (lives -> 0) | 1. `if (gameState.gameEnded) return; gameState.gameEnded = true;`. 2. Cleanup: `FeedbackManager.sound.stopAll(); FeedbackManager.stream.stopAll();`. 3. `gameState.isActive = false; timer.pause();`. 4. Compute stars (forced 1). 5. `window.parent.postMessage(game_complete)` (BEFORE audio). 6. `transitionScreen.show({ icons: ['😔'], title: 'Game Over', subtitle: 'You ran out of lives! You matched ' + totalPairs + ' of ' + totalPossible + ' pairs', buttons: [{text:'Try Again', type:'primary', action: showMotivation }], persist: true, onMounted: async () => { try { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); if (audioStopped) return; await FeedbackManager.playDynamicFeedback({ audio_content: 'Good try! Let\\'s practice those doubles again!', subtitle: 'Good try!', sticker: STICKER_SAD }); } catch(e){} } })`. 7. CTA interrupts via `audioStopped` flag. | `sound_game_over` -> VO | `STICKER_SAD` | Subtitle + TTS: `"Good try! Let's practice those doubles again!"` | YES sequential (CTA can interrupt) | Audio-duration driven |
| Victory (Round 9 complete, lives >= 1) | 1. `gameState.gameEnded = true`. 2. Cleanup: `sound.stopAll(); stream.stopAll();`. 3. `gameState.isActive = false; timer.pause();`. 4. Compute stars from `finalTimeSeconds`. 5. `postMessage(game_complete)`. 6. Tier-specific VO text: `stars===3: "Lightning fast doubling!"`, `stars===2: "Nice work!"`, `stars===1: "You finished -- let's get faster next time!"`. 7. Subtitle: `"Completed in " + finalTimeSeconds + "s"`. 8. Buttons: conditional per default-transition-screens.md (3*: [Claim Stars]; <3*: [Play Again, Claim Stars]). 9. `onMounted` plays sequential `sound_game_victory` -> VO with `audioStopped` flag. | `sound_game_victory` -> VO (tier-specific) | `STICKER_CELEBRATE` | Subtitle: `"Completed in Xs"`; TTS tier-specific | YES sequential (CTA interrupts) | Audio-duration |
| Motivation (after Try Again or <3* Play Again) | Copy defaults from `default-transition-screens.md` Motivation row verbatim. Title: `"Ready to improve your score? ⚡"`, button: `"I'm ready! 🙌"` -> `action: restartToRound1` (skips preview + welcome). `onMounted`: `FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE })`. | `sound_motivation` | `STICKER_MOTIVATE` | None | Fire-and-forget onMounted | - |
| Stars Collected (after Claim Stars) | Copy defaults verbatim. Title: `"Yay! 🎉\nStars collected!"`, `duration: 2500`, no buttons. `onMounted`: `sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE })`. After hide: `postMessage({type:'game_exit'})`. | `sound_stars_collected` | `STICKER_CELEBRATE` | None | Fire-and-forget onMounted | 2500ms auto |
| Visibility change (tab hidden) | `timer.pause({fromVisibilityTracker: true})`; `FeedbackManager.sound.pause(); FeedbackManager.stream.pauseAll();`. Show inline "Game Paused" overlay (CASE 14). | None | None | None | - | Immediate |
| Visibility restored | `timer.resume({fromVisibilityTracker: true})`; `FeedbackManager.sound.resume(); FeedbackManager.stream.resumeAll();`. Dismiss overlay. | None | None | None | - | Immediate |

### Note on fire-and-forget correct/wrong SFX and PART-017 FEEDBACK-MIN-DURATION

PART-017 `FEEDBACK-MIN-DURATION` applies to answer-feedback `sound.play()` calls -- in multi-step archetypes with fire-and-forget, the correct/wrong SFX are NOT awaited (they play in parallel with the next interaction) so the 1500ms `Promise.all` wrap does NOT apply. The validator rule is scoped to `await sound.play(...)` calls on answer events. Round-complete and end-game audios ARE awaited and DO use the `Promise.all([sound.play, setTimeout(1500)])` pattern (round-complete) or the sequential SFX->VO `audioStopped` pattern (end-game) as documented above.

---

## 5. Key Implementation Notes

### Component usage

- **PreviewScreenComponent (PART-039 MANDATORY pattern):**
  - One `new PreviewScreenComponent(...)` at init; `ScreenLayout.inject({ slots: { previewScreen: true, progressBar: true, timer: true, ... }})`
  - Call `previewScreen.show({ instruction: fallbackContent.previewInstruction, audioUrl: fallbackContent.previewAudio, showGameOnPreview: false, timerConfig: { type: 'decrease', startTime: 5, endTime: 0 }, timerInstance: timer, onComplete: startGameAfterPreview })` EXACTLY ONCE on session start.
  - Wrapper `mathai-preview-slot` + `.game-stack` + `#gameContent` persist until the single terminal `endGame` cleanup calls `previewScreen.destroy()`.
  - `restartToRound1()` must NOT call `show()` again (would auto-skip) and must NOT call `destroy()`.
  - `DOMContentLoaded` standalone fallback, if present, must guard on `if (previewScreen && previewScreen.isActive && previewScreen.isActive()) return;`.
  - `gameState.startTime` is set in `startGameAfterPreview()`, not before.

- **TransitionScreenComponent:**
  - Single shared instance.
  - Round-intro calls: `transitionScreen.show({ title: 'Round ' + N, subtitle: stageLabel, persist: false })`. Before each call: `FeedbackManager.sound.stopAll(); FeedbackManager.stream.stopAll();`.
  - End-game calls copy `reference/default-transition-screens.md` verbatim; only overrides are: victory subtitle (`"Completed in Xs"`), game-over subtitle (`"You ran out of lives! You matched X of Y pairs"`), onMounted sequential audio with `audioStopped` flag.

- **ProgressBarComponent (with lives/hearts):**
  - `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 9, totalLives: 3, showLives: true })` per PART-023 API.
  - `progressBar.update(roundsCompleted, Math.max(0, livesRemaining))` — first arg is rounds COMPLETED (0-indexed) per PART-023/PART-026, NOT `currentRound`. Called on: init (`update(0, totalLives)`), round advance (`update(currentRound - 1, lives)`), wrong-match decrement (same, lives clamped), and restart (`update(0, 3)`).
  - Persists across game-over, motivation, victory; resets only on entering Round 1 of the restart path.

- **TimerComponent:**
  - `new TimerComponent({ mode: 'count-up', ... })`; started in `startGameAfterPreview()`, paused in `endGame()` and on visibility hidden.

- **FeedbackManager:**
  - `FeedbackManager.init({...})`
  - Preload list (called inside `setupGame()` BEFORE `previewScreen.show()`):
    - `sound_select`, `sound_deselect`, `sound_correct`, `sound_life_lost`, `sound_round_complete`, `sound_rounds`, `sound_game_victory`, `sound_game_over`, `sound_motivation`, `sound_stars_collected` (URLs from `feedback/reference/feedbackmanager-api.md`)

### `window.gameState` model

```js
window.gameState = {
  // Phase + lifecycle
  phase: 'start_screen',          // 'start_screen' | 'round_intro' | 'gameplay' | 'round_complete' | 'results' | 'gameover' | 'paused'
  isActive: false,                // true from startGameAfterPreview() until endGame()
  isProcessing: false,            // true during awaited round-complete / end-game audio
  gameEnded: false,               // re-entry guard for endGame()

  // Round state
  currentRound: 1,                // 1..9
  rounds: fallbackContent.rounds, // array of 9 round objects
  lockedPairs: {},                // { "<leftValue>": <rightValue>, ... } — pairs locked in CURRENT round only
  selectedLeft: null,             // currently-selected left tile value (or null)
  selectedRight: null,            // currently-selected right tile value (or null, transient during match check)

  // Lives + scoring
  lives: 3,
  stars: 0,                       // set in endGame()
  totalPairsMatched: 0,           // cumulative across all rounds, recorded in game_complete
  totalWrongMatches: 0,           // cumulative

  // Timer
  startTime: null,                // ms, set in startGameAfterPreview()
  finalTimeSeconds: null,         // set in endGame()

  // Analytics
  roundsData: [],                 // [{ round, attempts, wrongAttempts, misconceptions: [tag, ...] }, ...]
  previewResult: null             // set by previewScreen onPreviewInteraction
};
```

### Round advancement logic

```
onPairMatched():
  if (all pairs in currentRound are locked):
    await round-complete audio (with 1500ms min-duration Promise.all wrap)
    if (currentRound < 9):
      nextRound()
    else:
      endGame('victory')

nextRound():
  // FIRST statement — cleanup BEFORE state mutation (feedback CROSS-CUTTING 10 + PART-017)
  try { FeedbackManager.sound.stopAll(); } catch(e) {}
  try { FeedbackManager.stream.stopAll(); } catch(e) {}
  // clear any custom feedback DOM (textContent = '', remove show/correct/incorrect classes)

  gameState.currentRound += 1;
  gameState.lockedPairs = {};
  gameState.selectedLeft = null;
  gameState.selectedRight = null;
  gameState.isProcessing = false;
  progressBar.update(Math.max(0, gameState.currentRound - 1), Math.max(0, gameState.lives));  // rounds-completed semantic (PART-023)

  await showRoundIntro(gameState.currentRound);   // TransitionScreen + sequential audio
  renderRound(gameState.currentRound);            // build tiles into #gameContent

endGame(reason):
  if (gameState.gameEnded) return;
  gameState.gameEnded = true;

  // Cleanup FIRST, before state mutation
  try { FeedbackManager.sound.stopAll(); } catch(e) {}
  try { FeedbackManager.stream.stopAll(); } catch(e) {}

  gameState.isActive = false;
  timer.pause();
  gameState.finalTimeSeconds = Math.floor(timer.getElapsedMs() / 1000);
  gameState.phase = (reason === 'victory') ? 'results' : 'gameover';
  syncDOMState();

  // Compute stars
  if (reason === 'game_over' || gameState.lives === 0) gameState.stars = 1;
  else if (gameState.finalTimeSeconds <= 60) gameState.stars = 3;
  else if (gameState.finalTimeSeconds <= 90) gameState.stars = 2;
  else gameState.stars = 1;

  // postMessage BEFORE audio
  window.parent.postMessage({ type: 'game_complete', ...payload }, '*');

  // Render screen (screen first, audio after)
  if (reason === 'victory') showVictoryScreen();
  else showGameOverScreen();

restartToRound1():
  // Action callback on Motivation CTA — must NOT call previewScreen.show() or destroy()
  try { FeedbackManager.sound.stopAll(); } catch(e) {}
  try { FeedbackManager.stream.stopAll(); } catch(e) {}
  gameState.currentRound = 1;
  gameState.lives = 3;
  gameState.lockedPairs = {};
  gameState.selectedLeft = null;
  gameState.selectedRight = null;
  gameState.totalPairsMatched = 0;
  gameState.totalWrongMatches = 0;
  gameState.roundsData = [];
  gameState.gameEnded = false;
  gameState.isActive = true;
  gameState.phase = 'round_intro';
  timer.reset();
  timer.start();
  progressBar.update(0, 3);  // rounds-completed = 0 at restart (PART-023: "NOT 1")
  showRoundIntro(1);
  renderRound(1);
```

### Edge cases to handle

1. **Rapid clicks on the same tile:** Handler must check `if (tile.classList.contains('locked')) return;` and `if (gameState.isProcessing) return;` before acting. Lock is permanent for correct matches; wrong flash is transient (600ms).

2. **Rapid clicks on two different left tiles:** Tapping a second left tile while another left is selected should either (a) deselect the first and select the second (simpler) or (b) no-op. **Chosen:** deselect first, select second — matches natural UX. `sound_select` plays on the new selection, `sound_deselect` fires on the prior.

3. **Double-selection of same column (two lefts in a row, or two rights before a left):**
   - Two lefts: handled above (swap selection).
   - Right-before-left: no-op, ignore the right tap. No audio.

4. **Pair already locked:** Tile has `.locked` class + `disabled` attribute. Handler early-returns. No audio, no state change.

5. **Distractor tile repeated taps:** Distractor tiles (Stage 3) are NEVER locked (they are never the correct pair for any left value). They remain tappable across multiple attempts. Each wrong-match attempt decrements lives and records misconception; the tile re-renders to normal state after the 600ms flash so the student can (incorrectly) try it again — but lives protection + the 3-life cap bounds total wrong attempts.

6. **Lives reach 0 during the wrong-match handler:** Per CASE 8, SKIP the wrong SFX entirely. Do NOT play `sound_life_lost`. Call `endGame('game_over')` directly after the visual flash (or immediately, per spec).

7. **`endGame()` re-entry:** Re-entry guard `if (gameState.gameEnded) return; gameState.gameEnded = true;` prevents double postMessage / double audio if two concurrent events both trigger endGame.

8. **Restart while audio still playing:** `restartToRound1()` calls `sound.stopAll()` + `stream.stopAll()` as its FIRST statement before any state mutation (PART-017 CLEANUP-BETWEEN-ROUNDS / feedback CROSS-CUTTING 10).

9. **Visibility change during awaited round-complete audio:** Timer pauses, audio pauses. On resume, audio resumes from pause position; awaited promise continues once audio plays to completion. `isProcessing` stays true throughout.

10. **Preview fallback timing:** If `waitForPackages()` timeout fires and preview is still active, the standalone fallback MUST guard with `if (previewScreen && previewScreen.isActive && previewScreen.isActive()) return;` so Round 1 audio doesn't fire on top of preview audio (PART-039 Standalone-fallback gate).

11. **Stage 3 value collision with correct doubles:** Confirmed by walking the spec's right arrays — no distractor in Stage 3 accidentally equals a correct double for any left value in the same round. Safe.

12. **Tile value "22" / "18" appearing on both columns (Rounds 4, 5):** Render uses separate DOM nodes per column; the left-column "22" tile is a different node from the right-column "22" tile. Match logic compares by `leftValue * 2 === rightValue`, not by node identity.

13. **FeedbackManager audio URL hallucination:** Builder MUST read `skills/feedback/reference/feedbackmanager-api.md` at generation time to get exact CDN SFX URLs and sticker GIFs. No invented URLs.
