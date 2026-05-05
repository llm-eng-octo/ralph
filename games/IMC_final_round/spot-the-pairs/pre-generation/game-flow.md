# Pre-Generation Plan: Spot the Pairs — Friendly Pairs Sum Challenge

This is the consolidated build contract that Step 4 (Build) reads. It covers screen flow, round-by-round breakdown, scoring/lives logic, and feedback patterns per the orchestration prompt's reference to `pre-generation/game-flow.md`.

## One-liner

Across 4 levels alternating between target sums of 10 and 20, the student taps every pill on an 8-pill board whose two numbers add to the target — earning a fast-tap star for each pill tapped within 2.0 s of the level becoming interactive (capped at 10 stars), while sharing 3 lives across all 4 levels.

## Archetype + Shape

- **Archetype:** Lives Challenge (#3) adapted for multi-correct-per-round.
- **Shape:** Multi-round (Shape 2) with 4 rounds (= 4 levels), 3 shared lives, and a yellow Next-Round CTA gating each inter-level transition.
- **Round-set count:** 3 sets (A / B / C). Set cycles A → B → C → A on every restart.

## Components in use (with PART ids)

| Component | PART | Purpose |
|-----------|------|---------|
| ScreenLayout | PART-001 | Slot orchestration; `slots.floatingButton: true`, `slots.transitionScreen: true`, `slots.progressBar: true`, `slots.previewScreen: true`. |
| PreviewScreen | PART-039 | Persistent fixed header + initial Preview screen. `previewInstruction` + `previewAudioText` provided in `fallbackContent`. |
| ProgressBar | PART-005 | `currentRound / 4` + 3 hearts. Bumps FIRST in every level-complete handler. |
| TransitionScreen | PART-024 | Welcome, Round-N intros, Game Over, Motivation, Victory, Stars Collected. |
| FloatingButtonComponent | PART-050 | Yellow Next-Round CTA between levels (`setMode('next')`) AND end-of-game Next (after AnswerComponent). MANDATORY because spec describes an explicit Next CTA. |
| TimerComponent | PART-006 | Count-up, mounted in PreviewScreen header center. Used solely to compute `tapTime - levelInteractiveStart`. Pauses on visibility-hidden / level-complete / victory / game-over. |
| FeedbackManager | PART-017 | Multi-step archetype feedback (fire-and-forget mid-round, awaited level-complete / victory / game-over). |
| VisibilityTracker | PART-016 | CASE 14/15 pause overlay (built-in popup; never custom). |
| AnswerComponent | PART-051 | End-of-game Correct Answers carousel (4 slides, 1 per cleared level). Default-enabled. |

## Screen Flow

### Screen Inventory

| Screen | Phase | TransitionScreen-backed? | Notes |
|--------|-------|--------------------------|-------|
| Preview | `start` | No (PreviewScreen) | Initial how-to-play card (own component). |
| Welcome | `start` | Yes | "Let's play Spot the Pairs!" — short tap-to-advance card. |
| Round-N Intro (×4) | `gameplay` | Yes | "Round 1 of 4" … "Round 4 of 4". Auto-resolves after audio. |
| Board N (×4) | `gameplay` | No (in-game DOM) | The 8-pill board the student taps. |
| Game Over | `game_over` | Yes | Reached if `lives === 0` mid-game. |
| Motivation | `start` | Yes | "Ready to improve your score? ⚡" Routes to `restartToRound1`. |
| Victory | `results` | Yes | Shown only if all 4 levels cleared with `lives > 0`. |
| Stars Collected | `results` | Yes | Terminal celebration backdrop; persist. |
| AnswerComponent (Correct Answers!) | `results` | No (PART-051 carousel) | Renders 4 slides — solved board per cleared level. Stays mounted over Stars Collected. |

### Flow diagram (canonical Shape 2 + spec deltas)

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Board N    │
│ 🔊 prev  │        │ 🔊 welc. │        │ (trans.,     │ (after  │ banner +   │
│   audio  │        │    VO    │        │  no buttons) │  sound) │ pills      │
│  (full   │        │ [Let's   │        │ 🔊"Round N"  │         │ + count-up │
│   page)  │        │   go!]   │        │              │         │   timer    │
└──────────┘        └──────────┘        └──────────────┘         └─────┬──────┘
                                                                       │ player taps pill
                                                                       ▼
                                                            ┌─────────────────────┐
                                                            │ Tap evaluated       │
                                                            │ ✓ correct: purple,  │
                                                            │   fade out, fast?   │
                                                            │   fastTapStars++    │
                                                            │ ✗ wrong: shake red, │
                                                            │   life--            │
                                                            └──────┬──────────────┘
                                                                   │
                                                  ┌────────────────┼─────────────────┐
                                                  │                │                 │
                                            all correct        lives == 0       more correct
                                            pills found             │           pills remain
                                                  │                 ▼                 │
                                                  ▼          ┌────────────────────┐   │
                              ┌──────────────────────┐       │ Game Over (0★)     │   │
                              │ ProgressBar bumps    │       │ 🔊 sound_game_over │   │
                              │  FIRST → awaited     │       │ "Try Again"        │◀──┘ stay on Board
                              │  all_correct SFX +   │       └─────────┬──────────┘   N if lives > 0
                              │ "Level cleared!"     │                 │ tap "Try Again"
                              │ → Next-Round CTA     │                 ▼
                              │  enabled (yellow,    │          ┌──────────────────┐
                              │  bottom-right via    │          │ Motivation       │
                              │  FloatingButton      │          │ "Ready to        │
                              │  setMode('next'))    │          │  improve your    │
                              └──────────┬───────────┘          │  score? ⚡"      │
                                         │ tap CTA              │ 🔊 motivation VO │
                                         ▼                      │ [I'm ready! 🙌]  │
                              ┌──────────────────────┐          └────────┬─────────┘
                              │ N < 4 → next Round   │                   │ tap
                              │ N == 4 → Victory     │                   ▼
                              └──────────┬───────────┘            restartToRound1()
                                         │                        (skips Preview + Welcome)
                                         ▼
                                  N == 4 → Victory chain
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │ Victory (0–3★)      │
                              │ 🔊 sound_game_      │
                              │   victory → vo      │
                              │ stars=N             │
                              └──┬───────────┬──────┘
                  "Play Again"   │           │ "Claim Stars"
                  (only 0–2★)    ▼           ▼
                          ┌────────────┐  ┌──────────────────────┐
                          │ Motivation │  │ Stars Collected      │
                          │ → restart  │  │ "Yay! 🎉             │
                          └────────────┘  │  Stars collected!"   │
                                          │ persist, buttons:[]  │
                                          │ onMounted:           │
                                          │   sound_stars_       │
                                          │   collected SFX      │
                                          │   (silent — canon    │
                                          │   exception: no TTS) │
                                          │   show_star post     │
                                          │   setTimeout(~1500)  │
                                          │   → showAnswer       │
                                          │     Carousel()       │
                                          └──────────┬───────────┘
                                                     │ TS stays mounted as backdrop
                                                     ▼
                                          ┌──────────────────────┐
                                          │ AnswerComponent      │
                                          │ (Correct Answers!)   │
                                          │ 4 slides, one per    │
                                          │ cleared level —      │
                                          │ solved board with    │
                                          │ correct pills purple │
                                          │ + targetSum banner   │
                                          │ FloatingButton in    │
                                          │ 'next' mode revealed │
                                          └──────────┬───────────┘
                                                     │ tap Next (single-stage)
                                                     ▼
                                          answerComponent.destroy()
                                          postMessage({type:'next_ended'})
                                          previewScreen.destroy()
                                          floatingBtn.destroy()
                                          → exit
```

**Changes from canonical default-flow.md:**
- Add conditional Wrong-Tap → Game Over branch when `lives === 0` (Lives-Challenge add-on).
- Replace the canonical "auto-advance after correct sound" arrow at level boundaries with a player-gated Next-Round CTA (FloatingButton `setMode('next')`). Audio still resolves before the CTA enables.
- Multi-correct-per-round: a level only ends when every `correctPills[i]` has been tapped, not after a single correct tap. `currentRound++` fires only on Next-Round CTA tap, never inside the per-tap correct handler.
- Stars Collected Screen Audio is **silent — canon exception (TTS skipped); SFX still plays**. Per default-transition-screens.md row, `ttsText: null` for `starsCollected`.

### Screen Audio (resolved by game-planning)

| Screen          | sfxId                       | sticker             | ttsText                                           | source   |
|-----------------|-----------------------------|---------------------|---------------------------------------------------|----------|
| welcome         | sound_level_transition      | STICKER_LEVEL       | Let's play Spot the Pairs!                        | default  |
| roundIntro      | rounds_sound_effect         | STICKER_ROUND       | Round ${n} of ${N}                                | default  |
| victory         | sound_game_victory          | STICKER_CELEBRATE   | Victory! You got ${score} out of ${totalRounds}!  | default (3★) |
| victory (<3★)   | sound_game_victory          | STICKER_CELEBRATE   | Great work! You got ${score} out of ${totalRounds}! | default |
| gameOver        | sound_game_over             | STICKER_SAD         | You completed ${score} of ${totalRounds}. Let's try again! | default |
| motivation      | sound_motivation            | STICKER_MOTIVATE    | Ready to improve your score?                      | default  |
| starsCollected  | sound_stars_collected       | STICKER_CELEBRATE   | (silent — canon exception)                        | silent   |

`${score}` is the count of cleared levels (= `currentRound` reached at end). Build resolves interpolation tokens at runtime; planner does not pre-substitute.

### Wireframe — Preview (PreviewScreen full page)

```
+-----------------------------------------+
|  [avatar]   Q1   00            ★ 0/3    |  <- ActionBar (preview header)
|         [#timer-container — 0:00]       |  <- TimerComponent inside .mathai-preview-header-center
+-----------------------------------------+
|                                         |
|        SPOT THE PAIRS!                  |
|                                         |
|   Tap every pill where the two          |
|   numbers add up to the target shown    |
|   at the top.                           |
|                                         |
|   Tap each pair in under 2 seconds      |
|   to earn a fast-tap star — collect     |
|   up to 10!                             |
|                                         |
|   You have 3 lives across all 4         |
|   levels. Don't tap a wrong pill!       |
|                                         |
|         [ Start (PART-039 CTA) ]        |
+-----------------------------------------+
```

`previewInstruction` (HTML) + `previewAudioText` (TTS) both provided in `fallbackContent`. PreviewScreen plays preview audio onMounted and exposes the Start CTA.

### Wireframe — Welcome TransitionScreen

```
+-----------------------------------------+
|  [avatar]   Q1   00            ★ 0/3    |
|              0:00 (timer)               |
+-----------------------------------------+
|  [progressBar — 0/4 ♥ ♥ ♥]              |
+-----------------------------------------+
|              STICKER_LEVEL              |
|                                         |
|         Let's play Spot the Pairs!      |
|                                         |
|             [ Let's go! ]               |
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `0/4` + 3 hearts | no |
| Sticker / Icon | top-center | `STICKER_LEVEL` | no |
| Title | center | `"Let's play Spot the Pairs!"` | no |
| Audio | onMounted | `sound_level_transition` + `STICKER_LEVEL` → TTS `"Let's play Spot the Pairs!"` | no |
| CTA 1 | bottom | `"Let's go!"` → showRoundIntro(1) | tap |

FloatingButton on entry: `setMode('hidden')`.

### Wireframe — Round-N Intro TransitionScreen (auto)

```
+-----------------------------------------+
|  [avatar]   Q[N]  00           ★ 0/3    |
|              0:00 (timer)               |
+-----------------------------------------+
|  [progressBar — (N-1)/4 ♥ ♥ ♥]          |
+-----------------------------------------+
|              STICKER_ROUND              |
|                                         |
|             Round N of 4                |
|                                         |
|        (no buttons — auto-advance)      |
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture (Q label = `Q${currentRound}`) | no |
| Progress bar | below header | `(N-1)/4`, hearts = current `lives` | no |
| Sticker / Icon | top-center | `STICKER_ROUND` | no |
| Title | center | `"Round ${n} of ${N}"` | no |
| Audio | onMounted | `rounds_sound_effect` + `STICKER_ROUND` → TTS `"Round ${n} of ${N}"` | no |
| Auto-advance | (auto) | After audio resolves → renderBoard(N) | n/a |

FloatingButton on entry: `setMode('hidden')`.

### Wireframe — Board N (gameplay screen)

375×667 viewport. The board uses CSS grid (3-col rows 1–2, 2 centered pills row 3) — never flex `gap`.

```
+-----------------------------------------+
|  [avatar]   Q[N]  00           ★ 0/3    |
|              0:01 (count-up timer)      |
+-----------------------------------------+
|  [progressBar — (N-1)/4 ♥ ♥ ♥]          |
+-----------------------------------------+
|        ┌───────────────────────┐        |  <- level banner
|        │     Make Sum 10       │        |
|        └───────────────────────┘        |
|                                         |
|     ⚡ 0 / 10                           |  <- fast-tap counter (top of #gameContent)
|                                         |
|   ╭──────╮   ╭──────╮   ╭──────╮        |  <- pill row 1 (3 pills)
|   │ 6+4  │   │ 5+4  │   │ 2+8  │        |
|   ╰──────╯   ╰──────╯   ╰──────╯        |
|                                         |
|   ╭──────╮   ╭──────╮   ╭──────╮        |  <- pill row 2 (3 pills)
|   │ 7+2  │   │ 5+5  │   │ 4+7  │        |
|   ╰──────╯   ╰──────╯   ╰──────╯        |
|                                         |
|       ╭──────╮   ╭──────╮               |  <- pill row 3 (2 pills, centered)
|       │ 6+5  │   │ 8+4  │               |
|       ╰──────╯   ╰──────╯               |
|                                         |
|                                         |
|              [ floating slot ]          |  <- FloatingButton (hidden mid-level)
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | `Q${currentRound}` + ActionBar score (0 mid-game) | no |
| Timer | inside header center | count-up `m:ss` (TimerComponent) | no |
| Progress bar | below header | `(N-1)/4` + hearts | no |
| Level banner | top of `#gameContent` | `"Make Sum 10"` or `"Make Sum 20"` | no |
| Fast-tap counter | below banner, top of `#gameContent` | `"⚡ X / 10"` | no |
| Pills 1–8 | grid 3+3+2 | per-pill `${a} + ${b}`, ≥44×44 px, ≥8 px gap | tap |
| FloatingButton slot | fixed-bottom | hidden mid-level; `setMode('next')` after level cleared | tap (when next mode) |

Round Presentation Sequence:
1. **Question preview:** Round-N Intro TransitionScreen plays. Board hidden.
2. **Instructions:** none on this screen — owned by PreviewScreen and shown ONCE before Round 1. No instruction text panel on Board N.
3. **Media:** Round-N audio plays inside TransitionScreen `onMounted`.
4. **Gameplay reveal:** TransitionScreen auto-resolves → Board N fades in (350 ms). `levelInteractiveStart = performance.now()` is recorded the moment the fade-in completes; pills become tap-interactive at that point.

### Wireframe — Game Over

```
+-----------------------------------------+
|  [avatar]   Q[N]  00           ★ 0/3    |
+-----------------------------------------+
|  [progressBar — last (N-1)/4, ♥ × 0]    |  <- preserved through Game Over
+-----------------------------------------+
|                  😔                     |
|                                         |
|             Game Over                   |
|         You ran out of lives!           |
|                                         |
|             [ Try Again ]               |
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | last attempted round, 0 lives | no |
| Sticker / Icon | top-center | `😔` | no |
| Title | center | `"Game Over"` | no |
| Subtitle | center | `"You ran out of lives!"` | no |
| Audio | onMounted | `sound_game_over` + `STICKER_SAD` → TTS `"You completed ${score} of ${totalRounds}. Let's try again!"` | no |
| CTA 1 | bottom | `"Try Again"` → showMotivation | tap |

FloatingButton on entry: `setMode('hidden')`.

### Wireframe — Motivation

```
+-----------------------------------------+
|  [avatar]   Q1   00            ★ 0/3    |
+-----------------------------------------+
|  [progressBar — 0/4 ♥ ♥ ♥]              |  <- reset on this screen's onMounted
+-----------------------------------------+
|                                         |
|     Ready to improve your score? ⚡     |
|                                         |
|             [ I'm ready! 🙌 ]           |
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | reset to `0/4` + 3 hearts (in onMounted) | no |
| Title | center | `"Ready to improve your score? ⚡"` | no |
| Audio | onMounted | `progressBar.update(0, 3)` → `sound_motivation` + `STICKER_MOTIVATE` → TTS `"Ready to improve your score?"` | no |
| CTA 1 | bottom | `"I'm ready! 🙌"` → restartToRound1 | tap |

FloatingButton on entry: `setMode('hidden')`.

### Wireframe — Victory

```
+-----------------------------------------+
|  [avatar]   Q4   00            ★ N/3    |  <- ActionBar shows tier after show_star
+-----------------------------------------+
|  [progressBar — 4/4 ♥ × livesLeft]      |
+-----------------------------------------+
|              ★ ★ ★                      |  <- stars row (0–3 filled)
|                                         |
|              Victory 🎉                 |
|       Pairs found: 14/14                |
|       Fast-tap stars: X/10              |
|                                         |
|   [ Play Again ]   [ Claim Stars ]      |  <- 2 buttons if stars < 3
|         OR                              |
|         [ Claim Stars ]                 |  <- 1 button if stars === 3
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | `4/4`, hearts = livesLeft | no |
| Stars | top-center | `gameState.stars` (0–3) | no |
| Title | center | `"Victory 🎉"` | no |
| Subtitle | center | `"Pairs found: ${score}/14 · Fast-tap stars: ${fastTapStars}/10"` (game-specific) | no |
| Audio | onMounted | `postGameComplete()` BEFORE audio → `sound_game_victory` + `STICKER_CELEBRATE` → TTS per Screen Audio table | no |
| CTA 1 (stars < 3) | bottom-left | `"Play Again"` → showMotivation | tap |
| CTA 2 / sole CTA | bottom-right | `"Claim Stars"` → showStarsCollected | tap |

FloatingButton on entry: `setMode('hidden')` BEFORE `transitionScreen.show(...)` (canonical Victory pattern).

### Wireframe — Stars Collected

```
+-----------------------------------------+
|  [avatar]   Q4   00            ★ N/3    |
+-----------------------------------------+
|  [progressBar — 4/4 ♥ × livesLeft]      |
+-----------------------------------------+
|                                         |
|                Yay! 🎉                  |
|            Stars collected!             |
|                                         |
|   (TS persists; AnswerComponent +       |
|    FloatingButton 'next' mount over it  |
|    after setTimeout(~1500))             |
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Preview header | top, fixed | persistent fixture | no |
| Progress bar | below header | preserved | no |
| Title | center | `"Yay! 🎉\nStars collected!"` (whiteSpace pre-line) | no |
| Audio | onMounted | `sound_stars_collected` + `STICKER_CELEBRATE` (SFX only — TTS skipped per canon) | no |
| (no buttons) | — | — | — |
| Then: | onMounted (after SFX) | `postMessage({type:'show_star', count: starTier})` → `setTimeout(1500)` → `showAnswerCarousel()` | n/a |

FloatingButton on entry: hidden. Set to `'next'` ONLY inside `showAnswerCarousel()` after `answerComponent.show(...)`.

### Wireframe — AnswerComponent (Correct Answers!)

Stars Collected TS stays mounted underneath. AnswerComponent overlays.

```
+-----------------------------------------+
|  [avatar]   Q4   00            ★ N/3    |
+-----------------------------------------+
|  [progressBar — 4/4 ♥ × livesLeft]      |
+-----------------------------------------+
|        Correct Answers!                 |
|                                         |
|   ┌───────────────────────────────┐     |
|   │       Make Sum 10             │     |  <- per-slide banner
|   │                               │     |
|   │   ╭──────╮  ╭──────╮  ╭─────╮ │     |
|   │   │ 6+4  │  │ 2+8  │  │ 5+5 │ │     |  <- only correct pills,
|   │   ╰──────╯  ╰──────╯  ╰─────╯ │     |     in their final purple
|   │                               │     |     locked state
|   │     (1 / 4)                   │     |
|   └───────────────────────────────┘     |
|       ◀  Slide nav  ▶                   |
|                                         |
|         [ FloatingButton: Next ]        |  <- single-stage exit
+-----------------------------------------+
```

| Element | Position | Content | Interactive? |
|---------|----------|---------|-------------|
| Slide banner | top of slide | `round.targetSum` → `"Make Sum 10"` / `"Make Sum 20"` | no |
| Correct pills | grid (matching layout, 3+3+2 arrangement compressed) | `correctPills` from `round.answer` rendered as locked-purple pills with `${a} + ${b}` | no |
| Slide indicator | bottom of slide | `(i / 4)` | no |
| Nav arrows | left/right | prev / next slide (auto-disabled at boundaries; 4 slides total) | tap |
| FloatingButton | fixed-bottom | `setMode('next')` — single-stage exit | tap |

Per-slide `render(container)` callback shape:
```text
slide.render(container):
  banner ← "Make Sum " + round.answer.targetSum
  for each pillId in round.answer.correctPills:
    render a locked-purple pill with text `${pill.a} + ${pill.b}`
  no draggables, no distractor pills, no input handlers
```

### FloatingButton lifecycle (decision-confirmation)

| Moment | Mode | Visible? | Reason |
|--------|------|----------|--------|
| Preview screen visible | n/a (not mounted yet) | no | PART-039 owns its own Start CTA. |
| Welcome TS shown | `'hidden'` | no | TS owns `[Let's go!]` button. |
| Round-N intro TS shown | `'hidden'` | no | TS auto-resolves; no CTA. |
| Board N — pills tappable, level in progress | `'hidden'` | no | All input is direct pill taps; no submit. |
| Board N — level cleared, awaited level-complete SFX done | `'next'` (label `"Next"`) | yes | Yellow Next-Round CTA per spec. |
| Next-Round CTA tapped (N < 4) | `'hidden'` (transitions to next Round-N intro) | no | TS auto-advance flow. |
| Next-Round CTA tapped (N == 4) | `'hidden'` | no | Victory chain takes over via TS buttons. |
| Game Over TS shown | `'hidden'` | no | TS owns `[Try Again]` button. |
| Motivation TS shown | `'hidden'` | no | TS owns `[I'm ready! 🙌]` button. |
| Victory TS shown | `'hidden'` (set BEFORE `transitionScreen.show(...)`) | no | TS owns `Play Again` / `Claim Stars` buttons. |
| Stars Collected TS shown | `'hidden'` | no | TS persists; no buttons. |
| AnswerComponent revealed (`showAnswerCarousel()`) | `'next'` (label `"Next"`) | yes | Single-stage end-of-game exit. |
| Final Next tap | destroyed | gone | `answerComponent.destroy()` + `postMessage('next_ended')` + `previewScreen.destroy()` + `floatingBtn.destroy()`. |

### Handler registration

- `floatingBtn.on('next', ...)` is registered TWICE during the game:
  1. **Mid-game (level cleared, N < 4):** handler advances `currentRound++`, stops audio, calls `showRoundIntro(currentRound + 1)`.
  2. **Mid-game (level cleared, N === 4):** handler stops audio, calls `showVictory()`.
  3. **End-of-game (after AnswerComponent revealed):** handler destroys AnswerComponent, posts `next_ended`, destroys preview + floating button.

   The build agent uses the same `on('next')` slot but re-registers the handler each time `setMode('next')` is called. (FloatingButton's mode-handler dispatch is `_handlers[_mode]` per memory — registration via `on('next')` is correct for every `setMode('next')` state in this game.)
- `on('submit')` and `on('retry')` are **NEVER** registered in this game (no Submit CTA, no Try Again FloatingButton mode — Try Again here is a TS button on Game Over routing to Motivation).

## Round-by-round breakdown

This game has 1 round type (Type A — "Tap all friendly pairs"). Below covers all 4 rounds × 3 round-sets (12 boards). Per-round content is fully enumerated in `spec.md` § Content Structure.

### Round Type A — "Tap all friendly pairs"

#### Step-by-step (single round)

1. **Round starts (entry):** Round-N Intro TS shown. ProgressBar reads `(N-1)/4`. Sticker `STICKER_ROUND`, title `"Round ${n} of ${N}"`, no buttons. `onMounted` plays `rounds_sound_effect` + TTS sequentially. Audio resolves → TS auto-resolves.
2. **Board renders:**
   - `gameState.currentRound = N`
   - `gameState.correctPillsFoundThisLevel = 0`
   - `gameState.totalCorrectPillsThisLevel = round.correctPills.length` (3 for L1/L2; 4 for L3/L4)
   - Render level banner `round.levelTitle`.
   - Render fast-tap counter `⚡ ${gameState.fastTapStars} / 10`.
   - Render 8 pills in 3+3+2 grid (CSS grid; never flex `gap`). Each pill carries `data-pill-id="${pill.id}"` and text `${pill.a} + ${pill.b}`.
   - Soft `new_cards` SFX fires fire-and-forget (CASE 17).
   - Apply `.fade-in` (350 ms) to the pill grid.
   - On animation-end (or after 350 ms), set `levelInteractiveStart = performance.now()` and unblock pill taps.
3. **Student acts:** Taps a pill. Each tap is its own attempt; no selection, no submit.
4. **Correct path (multi-step archetype, fire-and-forget):**
   a. Resolve `pill = round.pills.find(p => p.id === pillId)`. Verify `pill.a + pill.b === round.targetSum`.
   b. Apply `.pill-correct` (purple lock + 200 ms scale-pulse). Set the pill's `data-state="correct"`. Disable further taps on this pill.
   c. `FeedbackManager.sound.play('correct_sound_effect', { sticker: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-95.gif' }).catch(() => {})` — **fire-and-forget**, no `await`.
   d. Compute `tapDelta = performance.now() - levelInteractiveStart`. If `tapDelta <= 2000`, `gameState.fastTapStars = Math.min(10, gameState.fastTapStars + 1)`. Update the on-screen `⚡ X / 10` counter.
   e. `gameState.points += 1`.
   f. `recordAttempt({ round_id: round.id, is_correct: true, misconception_tag: null, response_time_ms: tapDelta, is_retry: false })`.
   g. After 250 ms fade-out, remove the pill from the DOM (or keep with `.faded` class — implementation detail).
   h. `gameState.correctPillsFoundThisLevel += 1`.
   i. **If `correctPillsFoundThisLevel === totalCorrectPillsThisLevel`:** trigger Level-Complete handler (next section). Else: student keeps tapping.
5. **Wrong path (multi-step archetype, fire-and-forget):**
   a. Resolve `pill`. Verify `pill.a + pill.b !== round.targetSum`.
   b. Apply `.pill-wrong` (red flash + 600 ms shake CSS keyframe). Disable taps on this pill for 600 ms.
   c. `FeedbackManager.sound.play('incorrect_sound_effect', { sticker: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-99.gif' }).catch(() => {})` — fire-and-forget.
   d. `gameState.lives -= 1`. Update heart icon (`progressBar.update(currentRound - 1, gameState.lives)` — does NOT bump round count; only refreshes hearts). Apply `.heart-break` 600 ms animation to the lost heart.
   e. `recordAttempt({ round_id: round.id, is_correct: false, misconception_tag: round.misconception_tags[pillId], response_time_ms: tapDelta, is_retry: false })`.
   f. After 600 ms shake, re-enable the pill so the student can keep playing.
   g. **If `gameState.lives === 0`:** trigger Game-Over handler (see "Last life lost" below). Else: student keeps tapping.

#### Level-Complete handler (final correct pill of the level tapped)

The order here is critical — ProgressBar must bump FIRST per project memory.

1. **`progressBar.update(currentRound, Math.max(0, gameState.lives))`** — FIRST action, bumps progress to `N/4`.
2. Disable any remaining pill taps (distractors).
3. `await FeedbackManager.sound.play('all_correct', { sticker: <round-transition-celebration-sticker> })` — awaited (CASE 6 short level-complete cue, ~1 s).
4. `await FeedbackManager.playDynamicFeedback({ audio_content: 'Level cleared!', subtitle: 'Level cleared!', sticker: <round-transition-celebration-sticker> }).catch(() => {})` — awaited; subtitle visible during the cue.
5. After audio resolves, register handler: `floatingBtn.on('next', onLevelCompleteNext)` then `floatingBtn.setMode('next')`. Yellow Next-Round CTA appears bottom-right.
6. Game waits for student tap (no auto-advance).

#### Next-Round CTA tap handler (`onLevelCompleteNext`)

```text
function onLevelCompleteNext():
  FeedbackManager.sound.stopAll()        // both static + stream
  floatingBtn.setMode('hidden')          // hide before TS
  if currentRound < 4:
    currentRound++
    showRoundIntro(currentRound)         // → next Round-N Intro TS → renderBoard
  else:                                  // currentRound === 4
    showVictory()                        // canonical Victory chain
```

#### Last life lost (lives → 0) handler

Triggered inside the Wrong path step (g) when `gameState.lives === 0`.

1. Disable all pill taps immediately.
2. `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: <sad-sticker> })` — re-played awaited so the student hears the loss feedback before transition (CASE 8 + 12; ~1 s minimum). This is in addition to the fire-and-forget incorrect SFX from step 5c — re-played here in awaited mode.
3. `endGame(false)` is called → `showGameOver()`.

#### `showGameOver()` (game_complete with stars=0; no Victory, no AnswerComponent)

```text
function showGameOver():
  postGameComplete({ stars: 0, ... })       // BEFORE audio (data-contract)
  floatingBtn.setMode('hidden')
  transitionScreen.show({
    icons: ['😔'],
    title: 'Game Over',
    subtitle: 'You ran out of lives!',
    buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }],
    persist: true,
    onMounted: async () => {
      await safePlaySound('sound_game_over', { sticker: STICKER_SAD })
      try {
        await FeedbackManager.playDynamicFeedback({
          audio_content: `You completed ${cleared} of ${totalRounds}. Let's try again!`,
          subtitle: `You completed ${cleared} of ${totalRounds}. Let's try again!`,
          sticker: STICKER_SAD
        })
      } catch (e) {}
    }
  })
```

**Game Over branch — no Victory, no AnswerComponent.** `game_complete` is sent with `stars: 0`. `Try Again` routes to Motivation → `restartToRound1()`. AnswerComponent is NOT shown on the Game-Over branch.

#### Last round complete (Level 4 cleared) — Victory chain

Inside `onLevelCompleteNext()` when `currentRound === 4`:

1. `FeedbackManager.sound.stopAll()`.
2. Compute final star tier:
   ```text
   if gameState.lives <= 0:        stars = 0      // unreachable here (Level 4 only reached if lives>0)
   else if fastTapStars >= 8:      stars = 3
   else if fastTapStars >= 5:      stars = 2
   else if fastTapStars >= 1:      stars = 1
   else:                           stars = 0
   gameState.stars = stars
   ```
3. `showVictory()` (canonical chain — see PART-024 + default-transition-screens.md):
   ```text
   floatingBtn.setMode('hidden')
   transitionScreen.show({
     stars: gameState.stars,
     title: 'Victory 🎉',
     subtitle: `Pairs found: ${gameState.points}/14 · Fast-tap stars: ${gameState.fastTapStars}/10`,
     buttons: stars === 3
       ? [{ text: 'Claim Stars', type: 'primary', action: showStarsCollected }]
       : [
           { text: 'Play Again',  type: 'secondary', action: showMotivation },
           { text: 'Claim Stars', type: 'primary',   action: showStarsCollected }
         ],
     persist: true,
     onMounted: async () => {
       postGameComplete({ stars: gameState.stars, ... })  // BEFORE audio
       await safePlaySound('sound_game_victory', { sticker: STICKER_CELEBRATE })
       try { await playDynamicFeedback({ audio_content: ttsText, subtitle: ttsText, sticker: STICKER_CELEBRATE }) } catch (e) {}
     }
   })
   ```
4. Player taps `Claim Stars` → `showStarsCollected()`.
5. `showStarsCollected()`:
   ```text
   transitionScreen.show({
     title: 'Yay! 🎉\nStars collected!',
     buttons: [],
     persist: true,
     styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } },
     onMounted: async () => {
       try { await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE }) } catch (e) {}
       window.parent.postMessage({ type: 'show_star', count: gameState.stars }, '*')
       setTimeout(() => { showAnswerCarousel() }, 1500)
       // Do NOT call transitionScreen.hide() here — TS stays mounted as backdrop.
     }
   })
   ```
6. `showAnswerCarousel()`:
   ```text
   const slides = buildAnswerSlidesForAllRounds()
   answerComponent.show({ slides })
   floatingBtn.on('next', onFinalNext)
   floatingBtn.setMode('next')
   ```
7. `onFinalNext()` (single-stage exit):
   ```text
   answerComponent.destroy()
   window.parent.postMessage({ type: 'next_ended' }, '*')
   previewScreen.destroy()
   floatingBtn.destroy()
   ```

#### `buildAnswerSlidesForAllRounds()` — slide-builder placement

Defined at module scope. Reads from `gameState.playedRounds` (an array push of every cleared round's data, populated in step 4 entry of round-flow above). Returns an array of `{ render(container) {...} }` callbacks — one per cleared level (4 if Victory).

Each `render(container)`:
1. Creates a banner div with text `"Make Sum " + round.answer.targetSum`.
2. Iterates `round.answer.correctPills`, finds the matching `pill` in `round.pills`, and renders a locked-purple pill `<div class="pill pill-locked">${pill.a} + ${pill.b}</div>` per correct entry — preserving the 3+3+2 grid (or compressed to a tight grid since distractors are absent).
3. No draggables, no input handlers, no distractor pills. Self-contained — uses only `round` data captured at level-clear, NEVER live `#gameContent` DOM (which has been torn down).

### Round-by-round content tour (all 4 rounds × 3 sets)

The 12 round objects are enumerated in `spec.md`. The build embeds them verbatim as `fallbackContent.rounds`. Per-round counters:

| Set / Round | targetSum | correctPills | distractors | totalCorrectPillsThisLevel | maxFastTapsAchievableThisLevel |
|-------------|-----------|--------------|-------------|---------------------------|--------------------------------|
| A · R1 (warmup-10) | 10 | p1 p3 p5 | 5 | 3 | 3 |
| A · R2 (switch-20) | 20 | p1 p3 p5 | 5 | 3 | 3 |
| A · R3 (dense-10)  | 10 | p1 p3 p5 p7 | 4 | 4 | 4 |
| A · R4 (fluency-20) | 20 | p1 p3 p5 p7 | 4 | 4 | 4 |
| B · R1 (warmup-10) | 10 | p1 p3 p5 | 5 | 3 | 3 |
| B · R2 (switch-20) | 20 | p1 p3 p5 | 5 | 3 | 3 |
| B · R3 (dense-10)  | 10 | p1 p3 p5 p7 | 4 | 4 | 4 |
| B · R4 (fluency-20) | 20 | p1 p3 p5 p7 | 4 | 4 | 4 |
| C · R1 (warmup-10) | 10 | p1 p3 p5 | 5 | 3 | 3 |
| C · R2 (switch-20) | 20 | p1 p3 p5 | 5 | 3 | 3 |
| C · R3 (dense-10)  | 10 | p1 p3 p5 p7 | 4 | 4 | 4 |
| C · R4 (fluency-20) | 20 | p1 p3 p5 p7 | 4 | 4 | 4 |

Total per set: 3 + 3 + 4 + 4 = **14 correct pills**, 5 + 5 + 4 + 4 = **18 distractor pills**, 14 + 18 = **32 pill instances** spread across 4 boards × 8 pills.

The build picks one set per game (default A; cycles to B → C → A on each restart). `recordAttempt.round_id` carries the set-prefixed id (e.g. `A_r1_make10_warmup`).

### State changes table

| Step | gameState mutation | DOM update |
|------|--------------------|------------|
| Preview Start tapped | `phase = 'gameplay'` | PreviewScreen hides body content; header persists |
| Welcome `Let's go!` tapped | `phase = 'gameplay'` | TS hides; routes to RoundIntro(1) |
| Round-N intro audio resolves | `currentRound = N` (already set), `levelInteractiveStart = performance.now()` (after 350 ms fade-in) | TS hides; Board N grid fades in |
| Correct pill tap | `correctPillsFoundThisLevel++`, `points++`, `fastTapStars = min(10, +1)` if `tapDelta ≤ 2000` ms; push to `playedRounds` only on level-clear | Pill purple-locks, 250 ms fade out; `⚡ X / 10` counter updates |
| Wrong pill tap | `lives--` | Pill red-shake 600 ms; heart icon updates immediately with `.heart-break` |
| Level cleared (final correct tap) | `playedRounds.push(round)` | `progressBar.update(currentRound, lives)` FIRST, then `all_correct` SFX + "Level cleared!" subtitle |
| Next-Round CTA tapped (N < 4) | `currentRound++` | TS RoundIntro(N+1) shown |
| Next-Round CTA tapped (N === 4) | `stars = computeStars(fastTapStars, lives)` | Victory TS shown (after `setMode('hidden')`) |
| Wrong tap with `lives === 0` | `phase = 'game_over'` | `incorrect_sound_effect` re-played awaited → Game Over TS shown |
| Game Over `Try Again` | `phase = 'gameplay'` | Motivation TS shown |
| Motivation `I'm ready` | `lives = 3, currentRound = 1, points = 0, fastTapStars = 0, playedRounds = [], correctPillsFoundThisLevel = 0, roundSet = next of (A→B→C→A)` | RoundIntro(1) shown directly (skips Preview + Welcome) |
| Victory `Claim Stars` | (no mutation) | StarsCollected TS shown |
| StarsCollected onMounted setTimeout | (no mutation) | AnswerComponent mounted over StarsCollected TS; FloatingButton `setMode('next')` |
| Final `Next` tapped | (no mutation) | All components destroyed; `next_ended` posted |

## Scoring and Lives logic

### Internal state

```text
gameState = {
  phase: 'preview' | 'gameplay' | 'game_over' | 'results',
  currentRound: 1..4,
  totalRounds: 4,
  lives: 0..3,                              // starts 3, shared across all 4 levels
  totalLives: 3,
  points: 0..14,                            // +1 per correct pill tapped
  fastTapStars: 0..10,                      // +1 per correct pill tapped within 2.0s; capped at 10
  stars: 0..3,                              // computed at Victory only
  correctPillsFoundThisLevel: 0..4,
  totalCorrectPillsThisLevel: 3 | 4,
  levelInteractiveStart: number | null,     // performance.now() recorded post fade-in
  playedRounds: Round[],                    // pushed at each level-clear; consumed by AnswerComponent
  attempts: Attempt[],                      // recordAttempt sink
  roundSet: 'A' | 'B' | 'C',                // cycles A→B→C→A on each restart
}
```

### Points

| Action | Effect | Notes |
|--------|--------|-------|
| Correct pill tap | `points += 1` | Internal-only; drives `recordAttempt`, NOT the star tier directly. |
| Wrong pill tap | no `points` change | But `lives -= 1` (see Lives below). |
| Final `points` | sum of correct taps across all 4 levels | Max 14 (3+3+4+4). |

### Lives

| Action | Effect | Animation |
|--------|--------|-----------|
| Game start | `lives = 3` | Heart icons rendered in ProgressBar. |
| Wrong pill tap (`lives > 1`) | `lives -= 1` | `.heart-break` 600 ms on the lost heart. |
| Wrong pill tap (`lives === 1`, becomes 0) | `lives = 0` | `.heart-break` 600 ms, then `incorrect_sound_effect` awaited (~1 s), then Game Over TS. |
| Lives reach 0 mid-game | trigger Game Over | No further pill taps; no Victory. |
| Restart from Motivation | `lives = 3` | ProgressBar resets via `progressBar.update(0, 3)` in Motivation `onMounted`. |

### Fast-tap star counter (10-star, in-game)

Independent of star tier and ActionBar.

| Action | Effect | Cap |
|--------|--------|-----|
| Correct pill tap with `tapDelta <= 2000 ms` | `fastTapStars = Math.min(10, fastTapStars + 1)` | 10 (even though 14 fast-taps are arithmetically possible across 4 levels). |
| Correct pill tap with `tapDelta > 2000 ms` | no change | — |
| Wrong pill tap | no change | — |

`tapDelta = performance.now() - levelInteractiveStart`. `levelInteractiveStart` is reset on every Board-N entry (after fade-in), and is paused during VisibilityTracker pauses (TimerComponent owns the count-up + pause/resume; the build reads its `.elapsedMs` to compute deltas, OR holds its own `performance.now()` baseline that is patched on visibility events to subtract paused time).

### 2.0 s fast-tap timer lifecycle

| Event | Timer behavior |
|-------|----------------|
| Preview shown | TimerComponent mounted, NOT started. Display `0:00`. |
| Welcome shown | Idle. |
| Round-N intro shown | Idle. |
| Round-N intro audio resolves + 350 ms board fade-in | `timer.start()` → count-up begins. `levelInteractiveStart = performance.now()`. |
| Correct pill tapped | Compute `tapDelta`. If `≤ 2000 ms`, increment `fastTapStars`. Timer keeps running. |
| Final correct pill tapped (level cleared) | `timer.pause()` while level-complete SFX awaits + while Next-Round CTA awaits user tap. |
| Next-Round CTA tapped | (timer already paused) → `timer.reset()` before next Board-N entry. New `levelInteractiveStart` set after next fade-in. |
| Wrong pill tap | Timer keeps running (the 2 s window applies cumulatively from `levelInteractiveStart`, not per-tap). |
| Lives → 0 | `timer.pause()` then `timer.stop()`. |
| Victory chain | `timer.pause()` + `timer.stop()` before TS shows. |
| Visibility hidden | `timer.pause({ fromVisibilityTracker: true })` per VisibilityTracker integration. Audio pauses. |
| Visibility restored | `timer.resume()` (no `fromVisibilityTracker` flag — the package bug per project memory means we must NOT pass that flag on resume). |
| Game complete | `timer.destroy()` after `next_ended` post. |

**Decision-confirmation:** `levelInteractiveStart` is held in `gameState`, NOT inside the TimerComponent. The TimerComponent provides the visible count-up display + pause-on-visibility behavior; `levelInteractiveStart` baselines for fast-tap computation are managed by the game using `performance.now()` adjusted by the timer's pause-elapsed when needed. (Simpler alternative: read `timer.getElapsedMs()` at fade-in to set the baseline, then again at each tap to compute the delta — both are valid; build picks one.)

### Star tier (final, Victory only)

```text
function computeStars():
  if gameState.lives <= 0:        return 0          // (only reachable via Game Over, where Victory isn't shown)
  if gameState.fastTapStars >= 8: return 3
  if gameState.fastTapStars >= 5: return 2
  if gameState.fastTapStars >= 1: return 1
  return 0
```

| Tier | Threshold | Victory shown? | ActionBar `show_star` |
|------|-----------|----------------|----------------------|
| 3★ | `lives > 0` AND `fastTapStars >= 8` | yes | `count: 3` |
| 2★ | `lives > 0` AND `5 <= fastTapStars <= 7` | yes | `count: 2` |
| 1★ | `lives > 0` AND `1 <= fastTapStars <= 4` | yes | `count: 1` |
| 0★ | `lives > 0` AND `fastTapStars === 0` | yes (still Victory because all 4 levels cleared) | `count: 0` |
| — | `lives === 0` | no — Game Over shown instead | none |

`show_star` postMessage fires inside Stars Collected `onMounted` after the SFX, BEFORE the `setTimeout` that reveals AnswerComponent.

### ProgressBar lifecycle

| Moment | `progressBar.update(round, lives)` call | Notes |
|--------|----------------------------------------|-------|
| Game-init | `update(0, 3)` | Set in `init()` after ScreenLayout mount. |
| Welcome / Round-N intro shown | (no explicit call) | `(currentRound - 1) / 4` = `(N - 1) / 4` already correct from prior level-clear bump. |
| Wrong pill tap | `update(currentRound - 1, lives)` | Refresh hearts only. Round counter stays at the pre-completion value because the level is in progress (round-counter shows "completed levels" semantics). **This is a refresh, not a bump.** |
| Final correct pill tap (level cleared) | **`update(currentRound, lives)` — FIRST action of level-complete handler**, BEFORE awaited `all_correct` SFX | Per project memory + Cross-Cutting Rule 0. |
| Game Over | (preserved) | `update(currentRound - 1, 0)` is implicit from the last wrong-tap refresh. |
| Motivation onMounted | `update(0, 3)` | Restart-path reset per default-transition-screens.md. |
| Victory | (preserved at `4/4`) | Hearts = `lives` remaining. |

### Data contract

```text
recordAttempt({
  round_id: round.id,                         // e.g. "A_r1_make10_warmup"
  is_correct: <boolean>,
  misconception_tag: is_correct ? null : round.misconception_tags[pillId],
  response_time_ms: tapDelta,                 // performance.now() - levelInteractiveStart
  is_retry: false,                            // multi-correct-per-round; no retry semantics per pill
})
```

```text
postGameComplete({
  score: gameState.points,                    // 0..14
  totalQuestions: 14,                         // total correct pills across the played round-set
  stars: gameState.stars,                     // 0..3
  accuracy: gameState.points / 14,            // 0..1
  timeSpent: total elapsed (sum of per-level durations),
  fastTapStars: gameState.fastTapStars,       // 0..10 (custom field for analytics)
  livesRemaining: gameState.lives,            // 0..3
  roundSet: gameState.roundSet,               // 'A' | 'B' | 'C'
})
```

## Feedback patterns per answer type

Bloom L2 — recognise equivalent decompositions. Multi-step archetype (multiple correct per round) → fire-and-forget mid-round, awaited at level-complete and end-of-game per CASE 5/6/7/8/11/12.

### Feedback Moment Table

| Moment | Trigger | FeedbackManager call | Subtitle | Blocks input? | Await? | What happens after |
|--------|---------|----------------------|----------|---------------|--------|--------------------|
| Welcome shown | Welcome TS `onMounted` | `await sound.play('sound_level_transition', { sticker: STICKER_LEVEL })` → `await playDynamicFeedback({ audio_content: "Let's play Spot the Pairs!", subtitle: "Let's play Spot the Pairs!", sticker: STICKER_LEVEL })` | "Let's play Spot the Pairs!" | CTA visible | Yes (sequential, CTA interrupts) | CTA `Let's go!` stops audio + advances |
| Round-N intro shown | RoundIntro TS `onMounted` | `await sound.play('rounds_sound_effect', { sticker: STICKER_ROUND })` → `await playDynamicFeedback({ audio_content: "Round ${n} of ${N}", subtitle: "Round ${n} of ${N}", sticker: STICKER_ROUND })` | "Round 1 of 4" … "Round 4 of 4" | No CTA | Yes (sequential) | Auto-advance after both |
| Board fades in (level start) | After RoundIntro auto-resolve | `FeedbackManager.sound.play('new_cards', {}).catch(...)` (CASE 17 soft cue) | — | No | No (fire-and-forget) | Pills become tap-interactive; `levelInteractiveStart` recorded |
| Correct pill tap (not last) | Pill `pill.a + pill.b === targetSum` | `FeedbackManager.sound.play('correct_sound_effect', { sticker: <correct-sticker> }).catch(...)` | — (no subtitle, no dynamic TTS — multi-step CASE 5) | No | No (fire-and-forget) | Pill purple-locks, fades out 250 ms; counter updates; student keeps tapping |
| Wrong pill tap (lives > 0 after decrement) | Pill `pill.a + pill.b !== targetSum` | `FeedbackManager.sound.play('incorrect_sound_effect', { sticker: <sad-sticker> }).catch(...)` | — (no subtitle, no dynamic TTS — multi-step CASE 7 variant) | No | No (fire-and-forget) | Pill red-shakes 600 ms then re-enables; `lives--`, heart updates; student keeps tapping |
| Last life lost (lives reaches 0) | Wrong tap with `lives === 1` | `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD })` (re-played awaited per CASE 8 + 12; ~1 s minimum) | — | Yes | Yes | Game Over TS shown with `game_complete` posted BEFORE TS audio |
| Level cleared (final correct pill of level) | `correctPillsFoundThisLevel === totalCorrectPillsThisLevel` | (1) `progressBar.update(currentRound, lives)` FIRST, then (2) `await FeedbackManager.sound.play('all_correct', { sticker: <round-transition-celebration-sticker> })`, then (3) `await FeedbackManager.playDynamicFeedback({ audio_content: 'Level cleared!', subtitle: 'Level cleared!', sticker: <round-transition-celebration-sticker> }).catch(...)` | "Level cleared!" | Yes (no further pill taps) | Yes (sequential) | After audio: `floatingBtn.setMode('next')` enables yellow Next-Round CTA |
| Game Over shown | After awaited last-life SFX | `await sound.play('sound_game_over', { sticker: STICKER_SAD })` → `await playDynamicFeedback({ audio_content: "You completed ${score} of ${totalRounds}. Let's try again!", subtitle: same, sticker: STICKER_SAD })` | "You completed N of 4. Let's try again!" | CTA visible | Yes (sequential, CTA interrupts) | `Try Again` → Motivation |
| Motivation shown | After Game Over `Try Again` (or <3★ Victory `Play Again`) | (1) `progressBar.update(0, 3)` FIRST (restart-path reset), then (2) `await sound.play('sound_motivation', { sticker: STICKER_MOTIVATE })`, then (3) `await playDynamicFeedback({ audio_content: "Ready to improve your score?", subtitle: same, sticker: STICKER_MOTIVATE })` | "Ready to improve your score?" | CTA visible | Yes (sequential, CTA interrupts) | `I'm ready! 🙌` → `restartToRound1()` |
| Victory shown | Last level cleared, lives > 0 | (1) `postGameComplete()` FIRST (BEFORE audio), then (2) `await sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })`, then (3) `await playDynamicFeedback({ audio_content: ttsText, subtitle: ttsText, sticker: STICKER_CELEBRATE })` where `ttsText = stars === 3 ? "Victory! You got ${score} out of ${totalRounds}!" : "Great work! You got ${score} out of ${totalRounds}!"` | per star tier | CTAs visible | Yes (sequential, CTA interrupts) | `Claim Stars` → Stars Collected; `Play Again` (if <3★) → Motivation |
| Stars Collected shown | After Victory `Claim Stars` | `await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE })` (SFX only — TTS is silent canon exception) → fire `{type:'show_star', count: stars}` postMessage → `setTimeout(1500) → showAnswerCarousel()` | — | No | Partial (SFX awaited, then setTimeout) | TS persists; AnswerComponent + FloatingButton 'next' mount over it |
| Final Next tap | After AnswerComponent revealed | (no FeedbackManager call — straight teardown) | — | — | No | `answerComponent.destroy()`, post `next_ended`, destroy preview + floating |
| Visibility hidden | tab switch / screen lock | (none — VisibilityTracker built-in popup; CASE 14 `autoShowPopup: true`) | — | — | — | All audio + timer pause |
| Visibility restored | (CASE 15) | (VisibilityTracker dismisses popup automatically) | — | — | — | Audio + timer resume |

### Subtitle examples (3 concrete instances per type)

**Level cleared (CASE 6):**
- After Level 1 (Make Sum 10): subtitle `"Level cleared!"` (generic; the level banner already named the target).
- After Level 2 (Make Sum 20): subtitle `"Level cleared!"`.
- After Level 4 (Make Sum 20, fluency push): subtitle `"Level cleared!"` then immediate Victory chain.

**Game Over (CASE 12):**
- 0 levels cleared: subtitle `"You completed 0 of 4. Let's try again!"`.
- 1 level cleared: subtitle `"You completed 3 of 4 pairs (1 level). Let's try again!"` *(simplification — build resolves `${score}` to `gameState.points` per the canonical template; subtitle reads `"You completed ${score} of ${totalRounds}. Let's try again!"`)*. Default canonical template renders `"You completed 3 of 4. Let's try again!"` if `${score}=cleared levels` is preferred — pick `score = clearedLevels` for symmetry with `totalRounds=4`.
- 2 levels cleared: `"You completed 2 of 4. Let's try again!"`.

**Decision-confirmation:** in this game, `${score}` for the Game Over template = number of fully-cleared levels (0–3), NOT `gameState.points`. This keeps `score / totalRounds` semantically aligned with the level count (0/4, 1/4, 2/4, 3/4). The `points` value (0–14) is reported separately as `recordAttempt` data and as Victory-card content; it is NOT the Game-Over narration's `${score}`.

**Victory (CASE 11):**
- 3★, all fast: `"Victory! You got 4 out of 4!"`.
- 2★, mostly fast: `"Great work! You got 4 out of 4!"`.
- 1★, slow but cleared: `"Great work! You got 4 out of 4!"`.

(`${score}` = cleared levels = 4 here always, since Victory only fires after Level 4 clears. The card subtitle (`"Pairs found: 14/14 · Fast-tap stars: X/10"`) is the game-specific differentiator — see screens.md Victory wireframe.)

**Motivation (CASE 9):**
- After any Game Over: `"Ready to improve your score?"`.
- After 0★ Victory `Play Again`: `"Ready to improve your score?"`.
- After 1–2★ Victory `Play Again`: `"Ready to improve your score?"`.

### Animations table

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Pill purple lock + scale-pulse | Correct tap | `.pill-correct` (transform: scale 1.0→1.08→1.0) | 200 ms |
| Pill fade-out | After correct lock | `.pill-fade-out` (opacity 1→0) | 250 ms |
| Pill red-shake | Wrong tap | `.pill-wrong` + `.shake` (translateX keyframe ±6 px) | 600 ms |
| Heart break | Life lost | `.heart-break` (scale + opacity keyframe) | 600 ms |
| Board fade-in | New level entry | `.fade-in` | 350 ms |
| Fast-tap counter bump | Fast-tap awarded | `.counter-bounce` (scale 1.0→1.15→1.0) | 250 ms |
| Star pop (results) | Victory star row | `.star-earned` (built into TransitionScreen) | 400 ms (built-in) |
| Show-star animation | Stars Collected onMounted | (host harness handles via `show_star` postMessage) | host-controlled |

### Wrong-answer handling

- **Show correct answer:** No mid-round (multi-step archetype). The AnswerComponent at end-of-game shows every level's correct pills as the per-round "answer slide".
- **Misconception-specific feedback:** No mid-round narration; misconception is captured silently in `recordAttempt.misconception_tag` (sum-off-by-one-under / over, sum-off-by-two-under / over). Telemetry-only at this Bloom level.
- **Failure recovery:** Pills re-enable after the 600 ms shake so the student can keep trying. No softening language. Lives loss is the consequence — Game Over after 3 wrong taps.

### Emotional arc notes

- Levels 1–2 (Stages 1–2): warm-up + target-switch. 3 correct pills, 5 distractors. Friendly pacing — most students should clear without losing a life.
- Level 3 (Stage 3): denser target field (4 correct, 4 distractors). Cognitive-load checkpoint — wrong-tap rate may rise; lives system creates tension here.
- Level 4 (Stage 4): fluency push (4 correct, 4 distractors, teen + single-digit). Victory feels earned.
- The 2.0 s fast-tap window adds positive pressure (reward, not penalty) — kids feel "fast = star" without "slow = punished".
- Game Over triggered before Level 4 → Motivation softens the loss with `"Ready to improve your score?"` and a fresh round-set on retry (set cycles A → B → C → A so familiar boards don't dull the second attempt).

### VisibilityTracker integration (CASE 14/15)

- `VisibilityTracker` mounted with `autoShowPopup: true`. Default popup, no `popupProps` overrides.
- Tab switch / screen lock → built-in pause overlay shown by VisibilityTracker. NEVER author a custom overlay (project memory).
- All `FeedbackManager.sound.*` calls + `TimerComponent` pause/resume on the tracker's events. Resume MUST NOT pass `fromVisibilityTracker: true` (project memory — package bug; flag is dead code on resume).

## Cross-validation

- Every screen in the flow diagram (Preview, Welcome, Round-N intro × 4, Board × 4, Game Over, Motivation, Victory, Stars Collected, AnswerComponent) has a wireframe above. ✔
- Every feedback moment has a `FeedbackManager` call (or explicit "no FeedbackManager — VisibilityTracker built-in" entry). ✔
- Scoring formula matches state-change table — `points` increments on correct tap, `lives` decrements on wrong tap, `stars` is computed only at Victory. ✔
- ProgressBar bumps FIRST in level-complete handler (project memory, Cross-Cutting Rule 0). ✔
- FloatingButton `'hidden'` BEFORE every TransitionScreen.show. ✔
- AnswerComponent end-game chain matches PART-051 — Stars Collected celebration plays first, AnswerComponent revealed via `setTimeout` from Stars Collected `onMounted`, single-stage Next exit. ✔
- No `on('submit')` after `setMode('next')` (project memory + bodmas-blitz regression). ✔
- TransitionScreen with `buttons: []` ONLY for Stars Collected (per default-transition-screens.md row); Victory uses `buttons: [Play Again, Claim Stars]` or `[Claim Stars]` — never empty. ✔
- Game Over branch posts `game_complete` with `stars: 0`, no Victory, no AnswerComponent. ✔
- 2.0 s fast-tap window is bonus-only — never decrements lives, never fails the level (per spec Warning). ✔
- Multi-pill-per-round: `currentRound++` only on Next-Round CTA tap, never inside per-tap correct handler (per spec Warning). ✔
- 8-pill grid uses CSS grid, never flex `gap` (mobile rule 23 + spec). ✔
- Round-set cycles A → B → C → A on each restart (GEN-ROUNDSETS-MIN-3). ✔
