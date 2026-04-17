# Screens: Matching Doubles

## Screen Inventory

Every screen is a required render target. Buttons are the contract — copy `title`, `subtitle`, `icons`, audio id, and button labels verbatim into `transitionScreen.show({...})` or `PreviewScreen` props. Nothing added, nothing renamed.

- `preview` (data-phase="start") — PART-039 preview overlay with `previewInstruction` + `previewAudio` + auto-skip after 5s.
- `welcome` (transition; data-phase="gameplay" while mounted, before Round 1 intro) — "Round 1" welcome intro.
- `round_intro` (transition; data-phase="gameplay") — Per-round "Round N" intro (N = 1..9). Auto-advance (no CTA), `waitForSound: true`.
- `gameplay` (data-phase="gameplay") — The tap-to-match grid. One template, re-rendered per round.
- `paused` (overlay on top of gameplay; data-phase unchanged) — CASE 14 "Game Paused" overlay. Dismisses on visibility restore.
- `game_over` (data-phase="game_over") — Lives reached 0 mid-round.
- `motivation` (data-phase="gameplay" during transition) — "Ready to improve your score?". Routes to Round 1 restart (skips Preview + Welcome).
- `victory` (data-phase="results") — All 9 rounds cleared with ≥1 life remaining.
- `stars_collected` (data-phase="results") — Auto-dismiss celebration after Claim Stars. Emits `game_exit` postMessage.

Persistent fixtures present on EVERY non-Preview screen:
- **Preview header** (top; owned by PreviewScreenComponent) — avatar, question label, score slot, star slot.
- **Progress bar** (below header; Shape 2 requirement) — shows `round N / 9` + a **lives row** of 3 hearts (one filled per remaining life). Required on welcome, round_intro, gameplay, paused, game_over, motivation, victory, stars_collected.

---

## preview (data-phase="start")

### Layout

```
+-----------------------------+
|  [preview header — avatar,  |
|   question label, score,    |
|   star, built by Preview-   |
|   ScreenComponent]          |
+-----------------------------+
|                             |
|  "Match the doubles!" Tap   |
|  a number on the left,      |
|  then tap its double (×2)   |
|  on the right. Finish all   |
|  9 rounds before you run    |
|  out of 3 lives. The faster |
|  you finish, the more stars |
|  you earn!                  |
|                             |
|  [▶ audio playing icon]     |
|                             |
|  [ Start ]     [countdown]  |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | avatar + "Math" label + score "0" + empty star slot | no |
| previewInstruction | center | exact HTML from spec `fallbackContent.previewInstruction` — "<p><strong>Match the doubles!</strong> Tap a number on the left, then tap its <em>double</em> (×2) on the right. Finish all 9 rounds before you run out of 3 lives. The faster you finish, the more stars you earn!</p>" | no |
| previewAudio | auto on mount | TTS of `previewAudioText` ("Match the doubles! Tap a number on the left, then tap its double on the right. Finish all nine rounds before you lose your three lives. The faster you finish, the more stars you earn.") | no |
| Start button | bottom | "Start" — calls `startGameAfterPreview()` | tap |
| Auto-skip countdown | bottom-right | 5s countdown; on expiry calls `startGameAfterPreview()` | no |

### Entry condition
First render after game init. No prior screen.

### Exit condition
- Student taps **Start**, OR auto-skip timer hits 0, OR audio finishes — whichever first. → Welcome transition. `gameState.startTime` is recorded here (timer starts).

`showGameOnPreview: false` — no gameplay grid is visible behind the preview overlay.

---

## welcome (transition — TransitionScreenComponent)

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round 0 / 9  ❤❤❤]         |
+-----------------------------+
|                             |
|         🎯                  |
|                             |
|   "Round 1"                 |
|                             |
|   "Let's double some        |
|    numbers!"                |
|                             |
|                             |
|                             |
|   [ Let's go! 🚀 ]          |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | "Round 0 / 9" + 3 filled hearts | no |
| Sticker / Icon | top-center | `🎯` (single-element `icons: ['🎯']`) | no |
| Title | center | "Round 1" | no |
| Subtitle | center | "Let's double some numbers!" | no |
| Audio | (auto, onMounted) | `sound_rounds` + `STICKER_MOTIVATE` via `FeedbackManager.sound.play('sound_rounds', { sticker: STICKER_MOTIVATE })` | no |
| CTA 1 | bottom | "Let's go! 🚀" → routes to `gameplay` (Round 1 gameplay screen) | tap |

### Entry condition
Auto-shown after preview dismiss.

### Exit condition
Tap "Let's go! 🚀" → interrupts audio, mounts Round 1 gameplay.

---

## round_intro (transition template — rounds 2..9)

Shown between rounds when N ∈ {2,3,4,5,6,7,8,9}. Auto-advances (no CTA).

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round (N-1) / 9  hearts]  |
+-----------------------------+
|                             |
|         🔢                  |
|                             |
|   "Round N"                 |
|                             |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | "Round (N-1) / 9" + current hearts | no |
| Sticker / Icon | top-center | `🔢` (`icons: ['🔢']`) | no |
| Title | center | "Round N" (template — literal integer injected) | no |
| Subtitle | center | — (omitted) | no |
| Audio | (auto, onMounted) | `sound_rounds` + `STICKER_MOTIVATE`; TransitionScreen called with `waitForSound: true` | no |

### Entry condition
After round-complete SFX (awaited) for round N-1.

### Exit condition
Audio finishes → auto-dismiss → mount Round N gameplay. No tap needed.

---

## gameplay (data-phase="gameplay")

### Layout (Stage 1 example — 3 pairs)

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round N / 9   ❤❤❤]        |
+-----------------------------+
|                             |
|   "Which numbers are        |
|    doubles?"  (per-round    |
|    prompt — NOT the         |
|    preview instruction)     |
|                             |
|   ┌───────┐    ┌───────┐    |
|   │   3   │    │  16   │    |
|   └───────┘    └───────┘    |
|   ┌───────┐    ┌───────┐    |
|   │   5   │    │   6   │    |
|   └───────┘    └───────┘    |
|   ┌───────┐    ┌───────┐    |
|   │   8   │    │  10   │    |
|   └───────┘    └───────┘    |
|                             |
|   (Stage 3 adds a 4th-5th   |
|    row AND may add an extra |
|    right-column distractor  |
|    tile below.)             |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `Round N / 9` + hearts row (filled = remaining lives, empty = lost) | no |
| Per-round prompt | top of game body | "Which numbers are doubles?" (semantically distinct from the preview "how-to-play" — it is a per-item prompt, allowed by constraint #7) | no |
| Timer display | top-right of game body | count-up `mm:ss` — `TimerComponent` (CDN) bound to `gameState.startTime`. Visible on gameplay only; pauses on visibility-hidden | no |
| Left column tiles | left half, vertical stack | one tile per `round.left[i]`; 44×44px min, 8px spacing; data attribute `data-tile="left-{value}"` | tap (select / deselect) |
| Right column tiles | right half, vertical stack | one tile per `round.right[i]` (shuffled); includes distractors on Stage 3; data attribute `data-tile="right-{value}"` | tap (select / deselect) |
| Locked pair styling | on matched tiles | `.locked-pair` green background, disabled (pointer-events: none) | no |
| Feedback sticker overlay | transient, center-top of game body | small celebration or sad sticker rendered by FeedbackManager for ~600ms per fire-and-forget SFX call | no |
| Paused overlay anchor | covers entire game body when `document.hidden` | see Paused screen | no |

### Entry condition
After the round-intro transition auto-dismisses (or after Welcome for Round 1).

### Exit condition
- Last pair locked → round-complete SFX awaited → next round intro (N<9) OR Victory (N=9).
- `gameState.lives === 0` after a wrong match → Game Over.
- Visibility hidden → Paused overlay.

### Round Presentation Sequence

For this gameplay screen, each round follows:
1. **Question preview** — Round-N intro transition has already played (title = "Round N"). On gameplay mount, left and right column tiles render. Progress bar + timer visible. Grid is `.fade-in` (350ms).
2. **Instructions** — **NOT rendered on this screen.** The how-to-play copy is owned by the PreviewScreenComponent (`previewInstruction` + `previewAudioText`) and shown once before Round 1. Round-type changes (3 pairs → 4 pairs → 5 pairs + distractors) are conveyed by the Round-N intro transition, NOT by an instruction banner here. The per-round **prompt** ("Which numbers are doubles?") is allowed because it is a per-item prompt distinct from the preview's global how-to-play.
3. **Media** — no audio/video autoplay at round start. Optional: a soft "new round" chime if enabled (not specified — omit).
4. **Gameplay reveal** — options (all tiles) are interactive immediately on mount. Input is NOT blocked. `gameState.isProcessing = false`.

---

## paused (overlay on top of gameplay)

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar]             |
+-----------------------------+
|                             |
|        ⏸                    |
|                             |
|   "Game Paused"             |
|                             |
|   "Come back to finish!"    |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | frozen snapshot | no |
| Sticker / Icon | top-center | `⏸` (`icons: ['⏸']`) | no |
| Title | center | "Game Paused" | no |
| Subtitle | center | "Come back to finish!" | no |
| Audio | — | all audio paused via `FeedbackManager.pauseAll()`; no new audio plays | no |

### Entry condition
`document.visibilityState === 'hidden'` fires during any gameplay screen (feedback/SKILL.md CASE 14).

### Exit condition
`document.visibilityState === 'visible'` → call `FeedbackManager.resumeAll()`, resume timer, dismiss overlay (CASE 15). No CTA.

---

## game_over (data-phase="game_over")

Fires when `gameState.lives` decrements to 0 during a wrong match.

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round N / 9   (empty)]    |
+-----------------------------+
|                             |
|        😔                   |
|                             |
|   "Game Over"               |
|                             |
|   "You ran out of lives!"   |
|                             |
|                             |
|   [ Try Again ]             |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `Round N / 9` (last attempted round) + 3 empty hearts | no |
| Sticker / Icon | top-center | `😔` (`icons: ['😔']`) | no |
| Title | center | "Game Over" | no |
| Subtitle | center | "You ran out of lives!" | no |
| Audio | (auto, onMounted) | `sound_game_over` + `STICKER_SAD` via `FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD })` | no |
| CTA 1 | bottom | "Try Again" → routes to `motivation` | tap |

### Entry condition
A wrong-match decrements `gameState.lives` to 0. Pipeline:
1. Skip the usual wrong-match SFX (feedback CASE 8 priority — game_over overrides wrong SFX).
2. Render game_over screen FIRST.
3. Send `window.parent.postMessage({ type: 'game_complete', stars: 1, score: <pairsMatched>, totalQuestions: 9, accuracy: (pairsMatched/totalPairsSoFar)*100, timeSpent: Date.now() - gameState.startTime, gameStatus: 'game_over' }, '*')` **BEFORE** audio.
4. Mount transitionScreen → onMounted plays `sound_game_over`.
5. CTA visible immediately; tap interrupts any playing audio (`FeedbackManager.sound.stopAll()`).

### Exit condition
Tap "Try Again" → `showMotivation()`.

---

## motivation (transition)

Shown after `Try Again` on Game Over **or** after `Play Again` on a < 3★ Victory. One tap advances to Round 1 restart.

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar — reset:     |
|   Round 0 / 9   ❤❤❤]        |
+-----------------------------+
|                             |
|                             |
|   "Ready to improve         |
|    your score? ⚡"          |
|                             |
|                             |
|   [ I'm ready! 🙌 ]         |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | reset preview: `Round 0 / 9` + 3 filled hearts (snapshot of post-restart state) | no |
| Sticker / Icon | — | none (no `icons` passed) | no |
| Title | center | "Ready to improve your score? ⚡" | no |
| Subtitle | — | none | no |
| Audio | (auto, onMounted) | `sound_motivation` + `STICKER_MOTIVATE` via `FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE })` | no |
| CTA 1 | bottom | "I'm ready! 🙌" → `restartToRound1()` | tap |

### Entry condition
Tap "Try Again" on Game Over, or tap "Play Again" on Victory (stars < 3).

### Exit condition
Tap "I'm ready! 🙌" → `restartToRound1()`: lives=3, timer reset to 0, round index = 1, all audio stopped, skips Preview + Welcome, routes directly to Round 1 gameplay (no Round-1 intro re-shown per spec "Restart / Play Again" rule? — see Design Note below).

---

## victory (data-phase="results")

### Layout (3★ example)

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round 9 / 9   hearts]     |
+-----------------------------+
|                             |
|                             |
|   ⭐ ⭐ ⭐                    |
|                             |
|   "Victory 🎉"              |
|                             |
|   "Completed in 47s — all   |
|    36 pairs matched!"       |
|                             |
|   [ Claim Stars ]           |
|                             |
+-----------------------------+
```

### Layout (1★ / 2★ variant — two buttons side-by-side)

```
|   [ Play Again ] [ Claim   |
|                    Stars ] |
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `Round 9 / 9` + final hearts row | no |
| Stars | top-center | `stars` prop = `gameState.stars` (1, 2, or 3) — drives star row rendering. Do NOT pass `icons`. | no |
| Title | center | "Victory 🎉" | no |
| Subtitle | center | game-specific — template: `"Completed in {elapsedSeconds}s — all {totalPairsMatched} pairs matched!"`. Example (3★ victory): `"Completed in 47s — all 36 pairs matched!"` | no |
| Audio | (auto, onMounted) | `sound_game_victory` + `STICKER_CELEBRATE` via `FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })`, then `await FeedbackManager.playDynamicFeedback({ audio_content: <tier VO>, subtitle: <matches title/subtitle tier>, sticker: STICKER_CELEBRATE })` | no |
| CTA 1 (if stars === 3) | bottom | "Claim Stars" → `showStarsCollected()` | tap |
| CTA 1 (if stars < 3) | bottom-left | "Play Again" → `showMotivation()` | tap |
| CTA 2 (if stars < 3) | bottom-right | "Claim Stars" → `showStarsCollected()` | tap |

Tier VO examples:
- 3★ (time ≤ 60s): `"Lightning fast doubling!"`
- 2★ (60s < time ≤ 90s): `"Nice work!"`
- 1★ (time > 90s): `"You finished — let's get faster next time!"`

### Entry condition
Round 9 — all pairs matched with `lives >= 1`. Pipeline:
1. Timer pauses. `gameState.stars` computed from elapsed time (3 if ≤ 60s, 2 if ≤ 90s, else 1).
2. Victory screen renders FIRST.
3. Send `window.parent.postMessage({ type: 'game_complete', stars, score: totalPairsMatched, totalQuestions: 27, accuracy: (totalPairsMatched/27)*100, timeSpent, gameStatus: 'victory' }, '*')` **BEFORE** audio.
4. onMounted fires `sound_game_victory`, then dynamic tier VO (awaited).
5. CTA visible immediately; tap interrupts audio (`FeedbackManager.sound.stopAll()`).

### Exit condition
- Tap "Play Again" (when < 3★) → motivation.
- Tap "Claim Stars" → stars_collected.

---

## stars_collected (data-phase="results", auto-dismiss)

### Layout

```
+-----------------------------+
|  [preview header]           |
+-----------------------------+
|  [progress bar:             |
|   Round 9 / 9   hearts]     |
+-----------------------------+
|                             |
|    ✨ star burst anim ✨    |
|                             |
|   "Yay! 🎉                  |
|    Stars collected!"        |
|                             |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `Round 9 / 9` + final hearts row | no |
| Sticker / Icon | — | none | no |
| Title | center | "Yay! 🎉\nStars collected!" (two lines; `styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }`) | no |
| Subtitle | — | none | no |
| Stars | — | none | no |
| Audio | (auto, onMounted) | `sound_stars_collected` + `STICKER_CELEBRATE` via `FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE })` | no |
| Duration | (auto) | `2500` ms, then auto-hide | no |

### Entry condition
Tap "Claim Stars" on Victory.

### Exit condition
After 2500 ms → `window.parent.postMessage({ type: 'game_exit' }, '*')`.

---

## Round Presentation Sequence (canonical form)

Within the gameplay screen, each round follows this sequence:

1. **Question preview** — left and right tiles render. Options are interactive immediately (this game is multi-step; no input block).
2. **Instructions** — NOT rendered on the gameplay screen. Preview owns the how-to-play copy. Round-type changes (pairs per round, distractors appearing in Stage 3) are conveyed by the Round-N intro transition.
3. **Media** — none (no autoplay audio/video per round).
4. **Gameplay reveal** — fade-in (350ms). Input unblocked.

---

## Design Note on Restart Path

The spec says "Restart / Play Again: ... preview screen is NOT re-shown (PART-039 rule)." The canonical Shape 2 restart rule also says "skips Preview + Welcome". This plan honors both by making `restartToRound1()` route directly from motivation to the Round 1 gameplay screen (skipping the Round-1 intro transition on restart, matching the spec's intent to put the student back into the game as fast as possible). If game-building needs to show a Round-1 intro on restart for progress-bar consistency, it should use `waitForSound: true` auto-dismiss to keep the restart flow under 1.5s.
