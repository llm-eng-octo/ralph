# Screens: Add List with Adjustment Strategy — The Compensation Workout

## Screen Inventory

Every screen below is a required render target — game-building MUST NOT omit one and MUST NOT add an unlisted one.

- Preview (data-phase="start", PreviewScreenComponent / PART-039)
- Welcome (TransitionScreen)
- Round Intro × 9 (TransitionScreen, no buttons, auto-advancing — Round 1 / Round 2 / … / Round 9)
- Game (data-phase="gameplay") — single template; only the per-round addend pair and per-stage visual surface differ
- Round-Complete feedback overlay (in-place on Game; correct / wrong-with-lives / wrong-last-life branches)
- Game Over (TransitionScreen — only reachable when lives = 0 mid-session)
- Victory (TransitionScreen)
- Motivation ("Ready to improve") (TransitionScreen)
- Stars Collected (TransitionScreen, persist:true, buttons:[])
- Answer Carousel (AnswerComponent / PART-051, revealed over Stars Collected backdrop)

---

## Preview (data-phase="start")

### Layout

```
+-----------------------------+
|        [Preview area]       |
|                             |
|  The Compensation Workout   |  <- title (bold)
|                             |
|  You'll see two awkward     |
|  two-digit numbers to add.  |
|  Use the + and − buttons    |
|  on each box to nudge them  |
|  into a friendlier pair     |
|  (like 60 + 70).            |
|                             |
|  Then type the sum and tap  |
|  Next Round.                |
|                             |
|  Tip: what you add to one   |
|  box, you can subtract from |
|  the other — the sum stays  |
|  the same!                  |
|                             |
|  9 rounds. 3 lives.         |
|  No timer.                  |
|                             |
|  🔊 [Audio plays auto on    |
|      mount: previewAudio]   |
|                             |
|       [    Start    ]       |  <- PreviewScreen primary CTA
+-----------------------------+
```

`showGameOnPreview: false` — the +/- mechanic is novel; the preview overlay should NOT show the game state until the audio explains it.

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header (avatar / question label / score / star) | top, fixed | Persistent fixture — owned by PreviewScreenComponent | no |
| Title | top-center | "The Compensation Workout" | no |
| Body paragraphs | center | `previewInstruction` HTML — five short paragraphs (see Preview-screen content in spec) | no |
| Audio | (auto, onMounted) | `previewAudio` (TTS-generated at deploy time from `previewAudioText`) | no |
| CTA 1 | bottom | "Start" → Welcome | tap |

### Entry condition

Iframe loads. PART-004 init bootstraps. PreviewScreenComponent constructs, paints the preview overlay, plays `previewAudio` on mount.

### Exit condition

Player taps `Start`. PreviewScreen overlay dismisses (PreviewScreen object stays mounted as the persistent header). `showWelcome()` fires.

---

## Welcome (TransitionScreen)

### Layout

```
+-----------------------------+
| [Preview header (top-fixed: avatar, "Question 1/9", score, star)]
|-----------------------------|
| [ProgressBar — 0/9, 3 hearts]
|-----------------------------|
|                             |
|        [👋 sticker]         |
|                             |
|  Welcome to The             |
|  Compensation Workout!      |  <- title
|                             |
|  Two awkward numbers —      |
|  nudge them friendly. The   |  <- subtitle
|  sum stays the same.        |
|                             |
|  🔊 sound_welcome + welcome |
|     VO (awaited onMounted)  |
|                             |
|     (tap anywhere to        |
|      continue)              |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | 0/9 segments filled, 3 hearts | no |
| Sticker / Icon | top-center | `STICKER_WAVE` / 👋 | no |
| Title | center | "Welcome to The Compensation Workout!" | no |
| Subtitle | center | "Two awkward numbers — nudge them friendly. The sum stays the same." | no |
| Audio | (auto, onMounted) | `sound_welcome` SFX awaited → `playDynamicFeedback` welcome VO awaited | no |
| Tap-anywhere | full screen | (no visible CTA; component dismisses on tap) | tap |

### Entry condition

Player tapped `Start` on Preview.

### Exit condition

Player taps anywhere on the screen. `transitionScreen.hide()` fires; `renderRoundIntro(1)` fires next.

---

## Round Intro × 9 (TransitionScreen, no buttons, auto-advancing — CASE 2 Variant A)

### Layout (one wireframe — same template for R1 through R9)

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — (N-1)/9,     |
|  3 hearts (or live count)]  |
|-----------------------------|
|                             |
|       [⭐ sticker]          |
|                             |
|         Round N             |  <- title (large)
|                             |
|  🔊 sound_rounds (awaited   |
|     onMounted) → "Round N"  |
|     VO (awaited)            |
|                             |
|  (no buttons — auto-advances|
|   after both audio steps    |
|   complete)                 |
|                             |
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `(N-1)/9` segments filled, current `gameState.lives` hearts | no |
| Sticker / Icon | top-center | `STICKER_NEUTRAL` / ⭐ | no |
| Title | center | "Round 1" | "Round 2" | … | "Round 9" (`'Round ' + N`) | no |
| Audio | (auto, onMounted) | `sound_rounds` SFX awaited → `playDynamicFeedback({ audio_content: 'Round ' + N, subtitle: 'Round ' + N })` awaited | no |
| (no CTAs) | — | auto-advances after both audio steps complete via `transitionScreen.hide(); renderRound(N);` | — |

### Entry condition

Either the Welcome → R1 path (after Welcome tap) OR the in-game R(N-1) → R(N) path (auto-advance after correct feedback completes).

### Exit condition

Both audio steps complete (sequential awaited). `transitionScreen.hide()` is called automatically, then `renderRound(N)` fires.

---

## Game (data-phase="gameplay") — round N

### Layout (single template; only the per-round addend pair and per-stage visual surface differ)

Stage 1 (R1–R3) — default grey borders, font-weight 500:

```
+-----------------------------+
| [Preview header (avatar, "Question N/9", score, star)]
|-----------------------------|
| [ProgressBar — (N-1)/9      |
|  segments, 3 hearts (or     |
|  current lives)]            |
|-----------------------------|
|                             |
|     [−]            [−]      |  <- soft pink minus buttons (~44×44), above each box
|                             |
|  ┌──────┐  +  ┌──────┐     |
|  │  58  │     │  72  │     |  <- addend boxes (~104×80), live A1Display / A2Display
|  └──────┘     └──────┘     |     bold black "+" operator (~32px) between
|                             |
|     [+]            [+]      |  <- soft green plus buttons (~44×44), below each box
|                             |
|        [ ↺ Reset ]          |  <- reset pill (~120×44) below workspace
|                             |
|        ┌─────────┐          |
|        │   ?     │          |  <- numeric input (~140×56), font-size 24, centered
|        └─────────┘          |
|                             |
|  🔊 round prompt TTS plays  |
|     once on render          |
|     (fire-and-forget)       |
|                             |
+-----------------------------+
| [FloatingButton "Next       |  <- fixed-bottom FloatingButton (PART-050, submit mode)
|  Round" — disabled until    |     `.mathai-fb-btn-primary`
|  input.value.length > 0]    |
+-----------------------------+
```

Stage 2 (R4–R6) — soft blue border on addend boxes:

```
... same as Stage 1 except:
  ┌══════┐  +  ┌══════┐       <- 2 px solid soft blue (--mathai-color-info) border
  │  62  │     │  68  │
  └══════┘     └══════┘
```

Stage 3 (R7–R9) — default grey borders, font-weight 700 on addend digits:

```
... same as Stage 1 except:
  ┌──────┐  +  ┌──────┐
  │ **66** │   │ **74** │     <- bolder digits (font-weight: 700)
  └──────┘     └──────┘
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header (avatar, "Question N/9", score, star) | top, fixed | persistent fixture | no |
| Progress bar | below header | `(N-1)/9` segments filled (bumps to `N/9` FIRST in correct round-complete handler, before SFX); current lives hearts | no |
| Addend box 1 | left of workspace centre | `gameState.addend1Display` (display-only scratchpad) | no (display-only) |
| Big "+" operator | between boxes | `+` glyph, `font-size: 32px`, `font-weight: 700`, dark, `pointer-events: none` | no |
| Addend box 2 | right of workspace centre | `gameState.addend2Display` (display-only scratchpad) | no (display-only) |
| Minus button (box 1) | above addend box 1 | `−` glyph, soft pink (`#FCDDE0` bg / `#E63946` text), ~44×44, `touch-action: manipulation` | tap → `addend1Display -= 1` (no min clamp specified beyond `>= 0` — clamp at 0 defensively); tick SFX fire-and-forget; no grading; no life loss |
| Plus button (box 1) | below addend box 1 | `+` glyph, soft green (`#D4EFDF` bg / `#2A9D8F` text), ~44×44, `touch-action: manipulation` | tap → `addend1Display += 1`; tick SFX fire-and-forget |
| Minus button (box 2) | above addend box 2 | `−` glyph, soft pink (same style), ~44×44 | tap → `addend2Display -= 1` (clamp at 0); tick SFX fire-and-forget |
| Plus button (box 2) | below addend box 2 | `+` glyph, soft green (same style), ~44×44 | tap → `addend2Display += 1`; tick SFX fire-and-forget |
| Reset pill | below workspace, centred | `↺ Reset` label (icon left of text), light grey background, ~120×44, PART-022 secondary | tap → both addend displays animate (~300 ms ease) back to `round.addend1Start` / `round.addend2Start`; soft confirm SFX fire-and-forget; **input.value NOT cleared**; no grading; no life loss |
| Numeric input | below Reset, centred | `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" autocomplete="off" autocorrect="off" autocapitalize="off">`, `font-size: 24px`, `text-align: center`, `?` placeholder, white background, 1 px border, 12 px radius, ~140×56 | tap → focus, system numeric keypad opens; type → `oninput` strips non-digits, calls `floatingBtn.setSubmittable(input.value.trim().length > 0)`; Enter → submits (Mobile rule #16) |
| Round prompt TTS | (auto, on round render) | `playDynamicFeedback({ audio_content: 'Add ' + addend1Start + ' and ' + addend2Start + '.', subtitle: 'Add ' + addend1Start + ' and ' + addend2Start + '.' }).catch(()=>{})` — fire-and-forget (CASE 3) | no |
| FloatingButton "Next Round" | bottom (fixed slot, `.mathai-fb-btn-primary`) | PART-050 in `'submit'` mode, label `"Next Round"`. Disabled (`setSubmittable(false)`) until input has ≥1 digit. | tap → `floatingBtn.on('submit', handleSubmit)`. Enter on input has same effect. |

### Round Presentation Sequence

Within the gameplay screen, each round follows this sequence:

1. **Question preview** — addend boxes, +/- buttons, Reset pill, numeric input, FloatingButton paint as a single unit on round entry. The "?" placeholder shows in the input. Addend boxes show `addend1Start` / `addend2Start`. FloatingButton is disabled. The big "+" is non-interactive.
2. **Instructions** — NO on-screen text block on the gameplay screen. The how-to-play copy is delivered ONCE by the PreviewScreenComponent (`previewInstruction` + `previewAudioText`) before Round 1 starts. The Round-N intro transition conveys the round number; gameplay does NOT re-render any instruction banner. The per-round prompt TTS *"Add A1 and A2."* is the only round-level audio.
3. **Media** — round prompt TTS (`'Add ' + addend1Start + ' and ' + addend2Start + '.'`) plays fire-and-forget on render (CASE 3). Does NOT block input; student can tap +/- or start typing immediately.
4. **Gameplay reveal** — the workspace + input + FloatingButton are immediately interactive on render. No fade-in / opacity gate beyond the round-intro auto-advance.

### Entry condition

`renderRound(N)` fires from one of:
- The Round-N intro `transitionScreen.hide()` callback (auto-advance).
- The previous round's correct-feedback handler (`renderRoundIntro(N+1)` → `renderRound(N+1)`).
- `restartGame()` → `renderRoundIntro(1)` → `renderRound(1)`.

`renderRound(N)` does:
1. Read `round = gameState.activeRounds[N - 1]` (active set's N-th round).
2. Set `gameState.addend1Display = round.addend1Start`; `gameState.addend2Display = round.addend2Start`.
3. Set `gameState.attemptsOnThisRound = 0` (fresh round).
4. Apply per-stage visual surface (default grey / soft blue / bolder weight) based on `round.stage`.
5. Repaint the workspace DOM (boxes, +/- buttons, Reset, input).
6. Clear `inputEl.value`. Do NOT auto-focus (Mobile rule #17).
7. Call `floatingBtn.setSubmittable(false)`.
8. Set `gameState.isProcessing = false`.
9. Fire round prompt TTS fire-and-forget.

### Exit condition

Player taps `Next Round` (or presses Enter on input) with non-empty input → `handleSubmit()` runs. The handler routes to one of:

- **Correct path:** auto-advances to next Round Intro (or Victory after R9).
- **Wrong-with-lives path:** stays on the SAME Game screen; `resetRoundForRetry()` repaints same round.
- **Wrong-last-life path:** routes to Game Over after wrong-feedback completes (CASE 8).

---

## Round-Complete feedback overlay (in-place on Game screen)

Not a separate screen — three terminal states overlaid on the `gameplay` screen.

### Correct overlay (typed value === `round.correct`)

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — N/9 BUMPED   |
|  FIRST, current lives]      |
|-----------------------------|
|                             |
|  ┌──────┐  +  ┌──────┐     |  <- boxes animate from
|  │  60  │  ✓  │  70  │     |     A1Display / A2Display
|  └──────┘     └──────┘     |     to addend1Friendly /
|                             |     addend2Friendly
|        [ ↺ Reset ]          |     (~500 ms count anim);
|                             |     green tick badge fades
|        ┌─────────┐          |     in between them
|        │  130 ✓  │          |  <- input pill green
|        └─────────┘          |
|                             |
|  🔊 sound_correct +         |
|     STICKER_CELEBRATE       |
|     (≥1500 ms floor) →      |
|     awaited                 |
|  🔊 TTS round.successAudio  |
|     "Nice! 58 + 72 = 60 +   |
|      70 = 130." → awaited   |
|                             |
+-----------------------------+
| [FloatingButton "Next Round"|  <- still visible during feedback,
|  inert during feedback;     |     setSubmittable(false) so taps
|  next round auto-advances]  |     are no-ops
+-----------------------------+
```

### Wrong-with-lives overlay (typed value !== `round.correct`, lives > 1)

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — (N-1)/9,     |
|  lives - 1 hearts BUMPED    |
|  FIRST]                     |
|-----------------------------|
|                             |
|  ┌──────┐  +  ┌──────┐     |  <- boxes shake briefly,
|  │  60  │  X  │  70  │     |     then animate back to
|  └──────┘     └──────┘     |     A1Start / A2Start
|                             |     (~300 ms ease) AFTER
|        [ ↺ Reset ]          |     the input shake
|                             |
|        ┌─────────┐          |  <- input pill flashes red
|        │ ❌ 132 ❌│          |     and shakes (~600 ms),
|        └─────────┘          |     then clears
|                             |
|  🔊 sound_incorrect +       |
|     STICKER_SAD             |
|     (≥1500 ms floor) →      |
|     awaited                 |
|  🔊 TTS round.failAudio     |
|     "Not quite — sum of 58  |
|      and 72 is 130."        |
|     → awaited               |
|                             |
+-----------------------------+
| [FloatingButton "Next Round"|  <- after audio: input cleared,
|  re-enabled by              |     setSubmittable(false), same
|  resetRoundForRetry() once  |     round re-renders. Player
|  player types again]        |     tries again on SAME pair.
+-----------------------------+
```

### Wrong-last-life overlay (typed value !== `round.correct`, lives === 1)

Same wireframe as Wrong-with-lives — but after audio completes (CASE 8), `endGame(false)` fires and routes to Game Over. The retry does NOT happen. **Wrong feedback MUST play before Game Over.**

### Elements (overlay states)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Input pill | (existing position) | green (correct) OR red flash (wrong) ~600 ms shake | no during feedback (`isProcessing = true`) |
| Addend box reveal | (existing position) | correct: animate A1Display/A2Display → addend1Friendly/addend2Friendly + green tick (~500 ms); wrong: animate back to A1Start/A2Start (~300 ms) AFTER input shake | no |
| ProgressBar update | (existing position) | correct: `progressBar.update(currentRound, lives)` FIRST; wrong-with-lives: `progressBar.update(currentRound, lives - 1)` FIRST | no |
| Audio (correct) | (auto) | `await sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE, minDuration: 1500 })` → `await playDynamicFeedback({ feedback_type: 'correct', audio_content: round.successAudio, subtitle: round.successSubtitle, sticker: STICKER_CELEBRATE })` | no |
| Audio (wrong) | (auto) | `await sound.play('incorrect_sound_effect', { sticker: STICKER_SAD, minDuration: 1500 })` → `await playDynamicFeedback({ feedback_type: 'incorrect', audio_content: round.failAudio, subtitle: round.failSubtitle, sticker: STICKER_SAD })` | no |

### Entry condition

`handleSubmit()` runs (Next Round tap OR Enter on input) with non-empty input.

### Exit condition

- Correct: After awaited audio chain completes, auto-advance: if `currentRound < 9` → `currentRound += 1; renderRoundIntro(currentRound);` else `endGame(true)`.
- Wrong-with-lives: After awaited audio chain completes, `resetRoundForRetry()` → same round repaints → player retries.
- Wrong-last-life: After awaited audio chain completes, `endGame(false)` → `showGameOver()`.

---

## Game Over (TransitionScreen)

### Layout

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — (N-1)/9,     |
|  0 hearts]                  |
|-----------------------------|
|                             |
|         [😔]                |  <- icon
|                             |
|        Game Over            |  <- title
|                             |
|  You ran out of lives!      |  <- subtitle
|                             |
|  🔊 sound_game_over         |
|     (awaited onMounted) +   |
|     STICKER_SAD             |
|                             |
+-----------------------------+
| [FloatingButton hidden;     |
|  Try Again is the           |
|  TransitionScreen CTA, not  |
|  the floating slot]         |
+-----------------------------+
|       [  Try Again  ]       |  <- TransitionScreen primary CTA
+-----------------------------+
```

### Elements (canonical from `default-transition-screens.md` — verbatim)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `(N-1)/9` segments filled (last attempted round), 0 hearts | no |
| Sticker / Icon | top-center | `😔` (passed via `icons: ['😔']`) | no |
| Title | center | "Game Over" | no |
| Subtitle | center | "You ran out of lives!" | no |
| Audio | (auto, onMounted) | `sound_game_over` + `STICKER_SAD` | no |
| CTA 1 | bottom | "Try Again" → `showMotivation` | tap |

### Entry condition

`endGame(false)` is called with `gameState.lives === 0`. `game_complete` postMessage is sent BEFORE `showGameOver()` is invoked. The wrong-feedback chain MUST have already completed (CASE 8).

### Exit condition

Player taps `Try Again`. `showMotivation()` fires.

---

## Victory (TransitionScreen)

### Layout

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — 9/9,         |
|  current lives]             |
|-----------------------------|
|                             |
|        ⭐ ⭐ ⭐              |  <- stars row (gameState.stars)
|                             |
|        Victory 🎉            |  <- title
|                             |
|  Perfect compensation —     |
|  all 9 first try!           |  <- subtitle (3★ example;
|                             |     varies by stars)
|  🔊 sound_game_victory      |
|     (awaited onMounted) →   |
|     vo_victory_stars_N      |
|     (awaited)               |
|                             |
+-----------------------------+
|  [Play Again]   [Claim      |  <- 2 buttons if stars < 3,
|                  Stars]     |     1 button (Claim Stars)
|                             |     if stars === 3
+-----------------------------+
```

### Elements

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | 9/9 segments filled, current lives hearts | no |
| Stars row | center | `gameState.stars` of 3 filled stars (passed via `stars: gameState.stars`) — do NOT pass `icons` | no |
| Title | center | "Victory 🎉" | no |
| Subtitle | center | game-specific by `gameState.stars`: 3★ → `"Perfect compensation — all 9 first try!"`; 2★ → `"Great work! ${firstTryCorrect} of 9 first try."`; 1★ → `"You finished — keep practising!"` | no |
| Audio | (auto, onMounted) | `await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })` → `await playDynamicFeedback({ audio_content: <subtitle>, subtitle: <subtitle>, sticker: STICKER_CELEBRATE })` | no |
| CTA 1 (only if stars < 3) | bottom-left | "Play Again" → `showMotivation` | tap |
| CTA 2 (always) | bottom-right (or full-width if stars === 3) | "Claim Stars" → `showStarsCollected` | tap |

### Entry condition

`endGame(true)` is called from R9 with `gameState.lives > 0`. `game_complete` postMessage sent BEFORE `showVictory()`.

### Exit condition

Player taps `Play Again` → `showMotivation()` (only on 0–2★) OR `Claim Stars` → `showStarsCollected()`.

---

## Motivation ("Ready to improve") (TransitionScreen)

### Layout

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — 0/9, 3       |
|  hearts (RESET on           |
|  onMounted)]                |
|-----------------------------|
|                             |
|  Ready to improve your      |
|  score? ⚡                  |  <- title (with ⚡ inline)
|                             |
|  🔊 sound_motivation +      |
|     STICKER_MOTIVATE        |
|     (awaited onMounted)     |
|                             |
|  onMounted ALSO:            |
|    progressBar.update(0, 3) |  <- restart-path reset
|                             |
+-----------------------------+
|       [I'm ready! 🙌]       |  <- TransitionScreen primary CTA
+-----------------------------+
```

### Elements (canonical from `default-transition-screens.md`)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | RESET to 0/9 segments, 3 hearts (reset by onMounted's `progressBar.update(0, 3)`) | no |
| Title | center | "Ready to improve your score? ⚡" | no |
| Audio | (auto, onMounted) | `sound_motivation` + `STICKER_MOTIVATE` AND `progressBar.update(0, 3)` (restart-path reset) | no |
| CTA 1 | bottom | "I'm ready! 🙌" → `restartGame` | tap |

### Entry condition

Player tapped `Try Again` on Game Over OR `Play Again` on a < 3★ Victory.

### Exit condition

Player taps `I'm ready! 🙌`. `restartGame()` fires (cycles `setIndex`, resets state, skips Preview + Welcome, jumps directly to `renderRoundIntro(1)`).

---

## Stars Collected (TransitionScreen, persist:true, buttons:[])

### Layout

```
+-----------------------------+
| [Preview header]            |
|-----------------------------|
| [ProgressBar — 9/9,         |
|  current lives]             |
|-----------------------------|
|                             |
|        Yay! 🎉              |  <- title line 1
|     Stars collected!         |  <- title line 2 (rendered via
|                             |     `whiteSpace: 'pre-line'`)
|                             |
|  🔊 sound_stars_collected + |
|     STICKER_CELEBRATE       |
|     (awaited onMounted)     |
|                             |
|  postMessage{               |
|    type:'show_star',        |
|    stars: gameState.stars   |
|  }                          |
|  ✨ star animation fires    |
|     in host                 |
|                             |
|  setTimeout(1500) →         |
|    showAnswerCarousel()     |
|                             |
|  (NO transitionScreen.hide  |
|   in onMounted — TS stays   |
|   mounted as backdrop)      |
|                             |
+-----------------------------+
| (no buttons; FloatingButton |
|  setMode('next') fires      |
|  inside showAnswerCarousel  |
|  AFTER answerComponent.show)|
+-----------------------------+
```

### Elements (canonical from `default-transition-screens.md`)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | 9/9 segments filled, current lives hearts | no |
| Title | center | "Yay! 🎉\nStars collected!" (newline rendered via `styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }`) | no |
| Audio | (auto, onMounted) | `await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE })`, then `window.parent.postMessage({ type: 'show_star', stars: gameState.stars }, '*')`, then `setTimeout(() => showAnswerCarousel(), 1500)` | no |
| (no CTAs) | — | persist:true, buttons:[]; AnswerComponent reveals OVER this backdrop | — |

**Critical:** the `onMounted` callback DOES NOT call `transitionScreen.hide()` — Stars Collected is the terminal celebration surface and stays mounted as the backdrop while AnswerComponent + Next appear over it. Both tear down together on the single-stage Next click inside `floatingBtn.on('next', ...)`.

### Entry condition

Player tapped `Claim Stars` on Victory.

### Exit condition

`setTimeout(1500)` fires `showAnswerCarousel()`. The Stars Collected TransitionScreen does NOT auto-dismiss — it persists as the backdrop. Final exit happens inside `floatingBtn.on('next', ...)` after the Carousel's Next tap.

---

## Answer Carousel (AnswerComponent / PART-051)

Revealed OVER the Stars Collected backdrop by `showAnswerCarousel()`.

### Layout (single slide template — 9 slides total, navigable left/right within the carousel)

```
+-----------------------------+
| [Preview header still       |
|  visible at top]            |
|-----------------------------|
|  Correct Answers!           |  <- AnswerComponent header label
|                             |     (default; not overridden)
|       ◀  Round N  ▶         |  <- per-slide title; carousel nav
|                             |     arrows (component-owned)
|                             |
|   ┌──────┐    ┌──────┐     |
|   │  58  │    │  72  │     |  <- starting addend pair
|   └──────┘    └──────┘     |     (round.answer.addend1Start /
|                             |      .addend2Start)
|         ↓                   |  <- faint arrow / chevron
|                             |
|   ┌──────┐    ┌──────┐     |
|   │  60  │    │  70  │     |  <- friendly addend pair
|   └──────┘    └──────┘     |     (round.answer.addend1Friendly /
|                             |      .addend2Friendly)
|                             |
|       ✓  130                |  <- green tick badge + correct sum
|                             |     (round.answer.correct)
|                             |
|  ─────────────────────────  |
|  58 + 72 = 60 + 70 = 130.   |
|  Add 2 to one, subtract 2   |  <- strategy statement banner
|  from the other — the sum   |     (round.answer.strategyStatement)
|  stays the same.            |
|  ─────────────────────────  |
|                             |
|  (no +/- buttons, no Reset, |
|   no input, no hearts, no   |
|   progress bar in the slide |
|   contents)                 |
|                             |
+-----------------------------+
| [FloatingButton "Next"      |  <- PART-050 setMode('next') fires
|  (set inside                |     inside showAnswerCarousel()
|  showAnswerCarousel())]     |     AFTER answerComponent.show().
+-----------------------------+     `.mathai-fb-btn-primary`
```

### Elements (per slide)

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture (still visible) | no |
| Carousel header label | top of card | "Correct Answers!" (default) | no |
| Slide title | top of slide | "Round N" (1..9) | no |
| Carousel nav arrows | left / right | `◀` / `▶` (component-owned, navigates between 9 slides) | tap |
| Starting pair (top boxes) | upper-center | `round.answer.addend1Start` and `round.answer.addend2Start`, side by side | no |
| Arrow / chevron | between rows | `↓` faint | no |
| Friendly pair (bottom boxes) | mid-center | `round.answer.addend1Friendly` and `round.answer.addend2Friendly`, side by side | no |
| Green tick + correct sum | below friendly pair | `✓ ${round.answer.correct}` | no |
| Strategy statement banner | bottom of slide | `round.answer.strategyStatement` (e.g. "58 + 72 = 60 + 70 = 130. Add 2 to one, subtract 2 from the other — the sum stays the same.") | no |
| FloatingButton "Next" | bottom (`.mathai-fb-btn-primary`) | PART-050 in `'next'` mode (set inside `showAnswerCarousel()` AFTER `answerComponent.show()`) | tap → single-stage exit |

### Entry condition

`showAnswerCarousel()` fires from Stars Collected `onMounted`'s `setTimeout(1500)`. It calls `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })`, then `floatingBtn.setMode('next')`, then registers `floatingBtn.on('next', ...)` once.

### Exit condition

Player taps `Next`. Single-stage exit: `answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*');`. Iframe tears down.

---

## Round Presentation Sequence (gameplay screen)

Within the gameplay screen, each round follows this sequence:

1. **Question preview** — addend boxes (with starting values), +/- buttons, Reset pill, numeric input (showing `?` placeholder), and FloatingButton (disabled) all render at once on round entry. The big `+` operator sits between the boxes. Per-stage visual surface (default grey / soft blue / bolder weight) is applied.
2. **Instructions** — NOT rendered on the gameplay screen. The how-to-play copy is delivered ONCE by PreviewScreenComponent (`previewInstruction` + `previewAudioText`) before Round 1 starts. Round-N intro transition screens convey only the round number; gameplay does NOT include any static instruction panel.
3. **Media** — round prompt TTS (`'Add ' + addend1Start + ' and ' + addend2Start + '.'`) plays fire-and-forget on render (CASE 3). Does NOT block input; student can tap +/- or start typing immediately.
4. **Gameplay reveal** — the workspace + input + FloatingButton are immediately interactive on render (no fade-in / opacity gate beyond the round-intro auto-advance). `gameState.isProcessing = false` is set inside `renderRound()` so input is unblocked from the first tap.

---

## ASCII wireframe rules

- Every screen has a wireframe.
- Persistent fixtures (preview header at top, ProgressBar below header) appear on EVERY non-Preview wireframe.
- Mobile portrait viewport 375 × 667 proportions assumed throughout.
- Real content used in wireframes: actual addend pair `58 + 72` (Round 1 Set A) for the Game wireframe; actual round numbers (1, 9) for the Round Intro and Victory wireframes.
- The big `+` operator is non-interactive and sits between the two addend boxes (~32 px font, dark, `pointer-events: none`).
- The `-` and `+` buttons are `~44 × 44 px` with ≥ 8 px spacing per Mobile rule #10. `−` (pink) is above each box, `+` (green) is below — visually mapping "down = lower the number, up = raise the number".
- Numeric input is `~140 × 56 px`, `font-size: 24px` (above Mobile rule #28's 16 px Safari auto-zoom threshold), `text-align: center`.
- FloatingButton "Next Round" is fixed-bottom in the floating slot (`.mathai-fb-btn-primary`) — NOT inline under the input.
- Total workspace width on a 375 px viewport: 104 + 44 + 40 + 44 + 104 = 336 px (fits in the 343 px content area with 16 px margins).
