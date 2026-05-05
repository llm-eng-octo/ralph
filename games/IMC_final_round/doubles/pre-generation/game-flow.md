# Game Flow: Doubles — Doubling Speed Challenge

## One-liner

The student sees "Double of N" and taps the correct double from three pill-shaped MCQ options as fast as possible across 15 rounds (3 stages × 5 rounds), chasing a sub-2-second `avgCorrectMs` for 3 stars while keeping 3 dark hearts alive — a count-up PART-006 stopwatch ticks in the header for self-pacing only (no countdown game-over).

## Shape

**Shape:** Shape 2 Multi-round (15 rounds per session, drawn from the active set's slice; restart cycles A → B → C → A through `fallbackContent.rounds.length === 45`).

## Changes from default

- **Insert an inter-stage breather TransitionScreen between Round 5 and Round 6, and between Round 10 and Round 11** (Stage 1 → Stage 2, Stage 2 → Stage 3). Each breather is a `TransitionScreen` titled `"Stage N complete"`, `buttons: [{ text: "I'm ready", action: advanceToNextStageRoundIntro }]` (default Round-N transition contract per spec), `subtitle` is dynamically rendered from the live `gameState.avgCorrectMs` plus a 2-second target reminder. Maps to `flow-gallery.md` row 11 ("Stats + intro after each section"). The breather fires on the auto-advance arrow back to "Round N intro" — i.e. between the correct-feedback completion of R5/R10 and the Round-N intro for R6/R11.
- **Lives display in the progress bar uses dark hearts (color override) instead of the default red hearts.** Triggered by spec line "Lives are dark hearts, not the usual red." — visual-only override; mechanic unchanged. ProgressBar's heart row keeps its 3-life count and 1-life-per-wrong decrement; only the fill colour is overridden.
- **Add a count-up PART-006 stopwatch to the platform header** beside the existing PreviewScreen header fixtures. Format `mm:ss`. Starts on first paint of Round 1's gameplay body. Pauses on visibility-hidden, on round-feedback (correct + wrong), and on end-of-game; resumes on next round prompt-paint. The stopwatch is informational ONLY — drives `gameState.responseMsByRound[N]` capture (per-round `Date.now()` delta from prompt paint to tap), not a countdown / game-over trigger.
- **Single-tap MCQ interaction (P1).** No PART-050 FloatingButton in `'submit'` mode — taps commit immediately. The PART-050 FloatingButton is mounted ONLY for the canonical end-of-game `'next'` mode (per PART-050 sub-rule "Next button at end-of-game"). It first appears alongside the AnswerComponent carousel after Stars Collected.
- **Wrong-tap CASE 7 feedback overlays the gameplay screen** — input blocked (`gameState.isProcessing = true`); tapped pill turns red (`.selected-wrong`); correct pill simultaneously turns green (`.selected-correct`); one heart dims (`progressBar.update(currentRound, gameState.lives - 1)` BEFORE any await — memory `progress_bar_round_complete`); awaited `incorrect_sound_effect` + sad sticker; awaited `playDynamicFeedback({audio_content: round.wrongTTS, subtitle: round.wrongSubtitle, sticker})`; auto-advance.
- **Correct-tap CASE 4 feedback** — input blocked; tapped pill turns green; awaited `correct_sound_effect` + celebration sticker; awaited `playDynamicFeedback({audio_content: round.correctTTS, subtitle: round.correctSubtitle, sticker})`; round response time recorded into `gameState.responseMsByRound[currentRound]`; `progressBar.update(currentRound, gameState.lives)` FIRST; auto-advance.
- **Last-life-lost CASE 8** — wrong-answer SFX + dynamic TTS sequence (~1.5 s floor) plays in full BEFORE Game Over transition renders (so the student sees the violated correct answer and hears the explanation). `game_complete` postMessage fires before end-of-game audio per CASE 8 contract.
- **AnswerComponent (PART-051) reveals after Stars Collected** as 15 slides — one per played round. Each slide renders the round's `prompt` text, the three pill row in solved state (correct chip highlighted green via `correctIndex`, others dimmed and non-interactive), and `explanation` as the slide caption ("Double of N is 2N").
- **Round-set cycling A → B → C → A** on `restartGame()` — `gameState.setIndex` increments BEFORE `resetGameState()` is called inside `restartGame()`, then the round list is re-sliced from `fallbackContent.rounds` filtered by `set === SETS[setIndex]`.
- **Star formula uses time-based thresholds (NOT the default 90/66/33 percentage).** Computed from `avgCorrectMs = mean(responseMsByRound where correct === true)` and `correctCount`. See § Scoring forward-reference and scoring.md.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌────────────────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Game (round N)         │
│          │        │ (trans.) │        │ (trans.,     │ (after  │ • header: PART-006     │
│ 🔊 prev  │        │ 🔊 welc. │        │  no buttons) │  sound) │   stopwatch (count-up) │
│   audio  │        │    VO    │        │ 🔊 "Round N" │         │ • progress bar (round  │
│ (PART-039)        │ [Start]  │        │   sequential │         │   N/15 + 3 dark hearts)│
└──────────┘        └──────────┘        └──────────────┘         │ • prompt: "Double of N"│
                                                ▲                │ • 3 pill MCQ buttons   │
                                                │                │   (single tap, no      │
                                                │                │    submit; P1 pattern) │
                                                │                └──────────┬─────────────┘
                                                │                           │ player taps a pill
                                                │                           ▼
                                                │             ┌──────────────────────────────┐
                                                │             │ Per-tap feedback (in-place   │
                                                │             │ on Game screen — NOT a       │
                                                │             │ separate screen).            │
                                                │             │                              │
                                                │             │ CORRECT path (CASE 4):       │
                                                │             │ • isProcessing = true        │
                                                │             │ • tapped pill .selected-     │
                                                │             │   correct (green)            │
                                                │             │ • progressBar.update(N,      │
                                                │             │   lives) [FIRST]             │
                                                │             │ • record responseMs into     │
                                                │             │   responseMsByRound[N]       │
                                                │             │ • await sound_correct +      │
                                                │             │   STICKER_CELEBRATE          │
                                                │             │ • await playDynamicFeedback({│
                                                │             │     audio_content:           │
                                                │             │       round.correctTTS,      │
                                                │             │     subtitle:                │
                                                │             │       round.correctSubtitle})│
                                                │             │ • stopwatch pauses during    │
                                                │             │   feedback                   │
                                                │             │                              │
                                                │             │ WRONG path (CASE 7, lives>0):│
                                                │             │ • isProcessing = true        │
                                                │             │ • tapped pill .selected-     │
                                                │             │   wrong (red flash)          │
                                                │             │ • correct pill .selected-    │
                                                │             │   correct (green highlight)  │
                                                │             │ • lives -= 1                 │
                                                │             │ • progressBar.update(N,      │
                                                │             │   lives) [FIRST] — heart dims│
                                                │             │ • await sound_life_lost +    │
                                                │             │   STICKER_SAD                │
                                                │             │ • await playDynamicFeedback({│
                                                │             │     audio_content:           │
                                                │             │       round.wrongTTS,        │
                                                │             │     subtitle:                │
                                                │             │       round.wrongSubtitle})  │
                                                │             │ • wrong-round responseMs     │
                                                │             │   NOT pushed into avg pool   │
                                                │             │                              │
                                                │             │ WRONG path (CASE 8, lives=0):│
                                                │             │ • Same red+green flash       │
                                                │             │ • lives -= 1 → 0             │
                                                │             │ • progressBar.update(N, 0)   │
                                                │             │ • FULL wrong SFX + TTS       │
                                                │             │   AWAITED FIRST              │
                                                │             │ • THEN postMessage           │
                                                │             │   {game_complete}            │
                                                │             │ • THEN endGame(false) →      │
                                                │             │   showGameOver()             │
                                                │             └─────────┬────────────────────┘
                                                │                       │
                              ┌─────────────────┴─────┬─────────────────┴───────────────────┐
                              │                       │                                     │
                        wrong AND lives = 0   correct AND more rounds         correct AND last round (R15)
                              │                       │                                     │
                              ▼                       ▼                                     ▼
                   ┌────────────────────┐   (loops back to Round N+1                ┌────────────────────┐
                   │ Game Over          │    intro;                                 │ Victory            │
                   │ (TransitionScreen) │    AFTER R5 and R10 the                   │ (TransitionScreen, │
                   │ Title:             │    INTER-STAGE BREATHER                   │  persist:true)     │
                   │ "Game Over"        │    fires BEFORE the next                  │ Title:             │
                   │ Sticker:           │    Round-N intro — see                    │ "Victory 🎉"       │
                   │   STICKER_SAD      │    BREATHER block below)                  │ Subtitle:          │
                   │ Subtitle:          │                                           │   per-star tier    │
                   │   "You got         │                                           │   (see screens.md  │
                   │   ${score}/15 —    │                                           │   victory subtitles│
                   │   try again."     │                                           │   table)           │
                   │ Stars: 0           │                                           │ Stars: 0–3 from    │
                   │ Buttons:           │                                           │   getStars()       │
                   │   [Try Again]      │                                           │ Buttons:           │
                   │ onMounted:         │                                           │  • <3★ → [Play     │
                   │  • postMessage     │                                           │    Again, Claim    │
                   │    {game_complete} │                                           │    Stars]          │
                   │    if not posted   │                                           │  • 3★  → [Claim    │
                   │    yet             │                                           │    Stars]          │
                   │  • await sound_    │                                           │ onMounted:         │
                   │    game_over +     │                                           │  • postMessage     │
                   │    STICKER_SAD     │                                           │    {game_complete} │
                   │  • await dynamic   │                                           │  • await sound_    │
                   │    TTS (game_over  │                                           │    game_victory +  │
                   │    Screen Audio    │                                           │    STICKER_CELE-   │
                   │    row)            │                                           │    BRATE           │
                   └─────────┬──────────┘                                           │  • await dynamic   │
                             │ tap "Try Again"                                      │    TTS (vo_victory │
                             ▼                                                      │    _stars_N from   │
                   ┌──────────────────┐                                             │    Screen Audio    │
                   │ "Ready to        │                                             │    table)          │
                   │  improve your    │                                             └──────┬─────┬───────┘
                   │  score?"         │                                                    │     │
                   │ (TransitionScreen,                                       "Play Again" │     │ "Claim Stars"
                   │  tap)            │                                       (only if     │     │ (always)
                   │ 🔊 motivation VO │                                        0–2★)       ▼     ▼
                   │ [I'm ready]      │                              ┌──────────────────┐  ┌──────────────────────┐
                   │ onMounted:       │                              │ "Ready to        │  │ "Yay! 🎉             │
                   │  progressBar.    │                              │  improve your    │  │  Stars collected!"   │
                   │  update(0, 3)    │                              │  score?"         │  │ (TransitionScreen,   │
                   │  (restart-path   │                              │ (TransitionScreen│  │  persist:true,       │
                   │   reset; 3 dark  │                              │  tap)            │  │  buttons:[])         │
                   │   hearts)        │                              │ 🔊 motivation VO │  │ onMounted:           │
                   │  await sound_    │                              │ [I'm ready]      │  │  • await sound_      │
                   │    motivation +  │                              │ onMounted:       │  │    stars_collected   │
                   │    STICKER_      │                              │  progressBar.    │  │  • postMessage       │
                   │    MOTIVATE      │                              │  update(0, 3)    │  │    {type:'show_star',│
                   └────────┬─────────┘                              │  (restart-path   │  │    stars: gameState. │
                            │ tap                                    │   reset)         │  │      stars}          │
                            ▼                                        │  await sound_    │  │  • setTimeout(~1500) │
                   restartGame()                                     │    motivation +  │  │    showAnswerCarou-  │
                   • setIndex = (setIndex + 1) % 3                   │    STICKER_      │  │    sel()             │
                   • resetGameState()                                │    MOTIVATE      │  │ (does NOT call       │
                     (lives = 3, score = 0,                          └────────┬─────────┘  │  transitionScreen.   │
                      stars = 0, attempts = [],                               │ tap        │  hide() — terminal   │
                      responseMsByRound = {},                                 ▼            │  celebration backdrop│
                      currentRound = 1,                              restartGame()         │  per default-trans-  │
                      isProcessing = false)                          (skips Preview +      │  ition-screens.md)   │
                   • re-slice rounds for                              Welcome; round-set   └──────────┬───────────┘
                     SETS[setIndex]                                   cycles A→B→C→A)                │ auto handoff
                   • renderRoundIntro(1) (skips Preview + Welcome)                                   │ (TS persists
                                                                                                     │  as backdrop)
                                                                                                     ▼
                                                                                          ┌──────────────────────────┐
                                                                                          │ Correct Answers carousel │
                                                                                          │ (PART-051,                │
                                                                                          │  AnswerComponent)         │
                                                                                          │ • 15 slides (one per      │
                                                                                          │   played round in active  │
                                                                                          │   set's slice)            │
                                                                                          │ • each slide renders      │
                                                                                          │   prompt + 3 pills in     │
                                                                                          │   solved state            │
                                                                                          │   (correctIndex chip      │
                                                                                          │   .selected-correct,      │
                                                                                          │   others dimmed,          │
                                                                                          │   non-interactive) +      │
                                                                                          │   explanation caption     │
                                                                                          │ • FloatingButton          │
                                                                                          │   .setMode('next')        │
                                                                                          │   appears alongside       │
                                                                                          └──────────┬────────────────┘
                                                                                                     │ tap Next
                                                                                                     ▼  (single-stage)
                                                                                          answerComponent.destroy()
                                                                                          previewScreen.destroy()
                                                                                          floatingBtn.destroy()
                                                                                          postMessage{type:'next_ended'}
                                                                                                     │
                                                                                                     ▼
                                                                                                    exit
```

### Inter-stage breather block (R5↔R6 and R10↔R11)

The breather inserts BEFORE the next stage's Round-N intro on the auto-advance arrow above. It is a TransitionScreen — NOT a re-render of the gameplay screen.

```
... R5 correct/wrong feedback completes ─▶ ┌──────────────────────────┐ ─▶ Round 6 intro
... R10 correct/wrong feedback completes ─▶│ Stage N complete          │ ─▶ Round 11 intro
                                            │ (TransitionScreen)        │
                                            │ Title:                    │
                                            │   "Stage 1 complete"      │
                                            │   / "Stage 2 complete"    │
                                            │ Subtitle (rendered live): │
                                            │   "Average so far:        │
                                            │   ${avgSoFar} seconds.    │
                                            │   Aim for under           │
                                            │   2 seconds for 3 stars." │
                                            │ Sticker: STICKER_LEVEL    │
                                            │ Buttons:                  │
                                            │   [{text: "I'm ready",    │
                                            │     action: advance}]     │
                                            │ onMounted:                │
                                            │  • compute avgSoFar from  │
                                            │    gameState.responseMs   │
                                            │    ByRound (correct only) │
                                            │  • await sound_level_     │
                                            │    transition +           │
                                            │    STICKER_LEVEL          │
                                            │  • await playDynamic-     │
                                            │    Feedback({audio_       │
                                            │    content: subtitle,     │
                                            │    subtitle, sticker})    │
                                            └──────────────────────────┘
```

Triggers (precise):
- After R5's correct-path or wrong-path feedback resolves AND `gameState.lives > 0`, instead of advancing directly to Round 6's intro, render the Stage-1-complete breather. Tapping `[I'm ready]` (or, if creator approves CTA-less variant, auto-advance after TTS completes per CASE 2 Variant A) advances to the Round 6 intro.
- After R10's feedback resolves AND `gameState.lives > 0`, render the Stage-2-complete breather. Same advance contract.
- The breather is SKIPPED if `gameState.lives === 0` — Game Over takes precedence (the wrong-path on R5/R10 that drops lives to 0 routes directly to Game Over per the CASE 8 chain in the main diagram).

Retry / branch paths covered:
- **Try Again** after Game Over — routes through "Ready to improve your score?" motivation transition → `restartGame()` → restart from Round 1, **skipping Preview + Welcome**. Round-set cycles A → B → C → A. Lives reset to 3.
- **Play Again** after a Victory with fewer than 3★ — routes through "Ready to improve your score?" motivation transition → `restartGame()` → restart from Round 1, skipping Preview + Welcome. Round-set cycles.
- **Claim Stars** after any Victory (including the special-case 0★, which is unreachable in this game because Victory is reached only by completing all 15 rounds with ≥0 lives ≥ 1; 0★ requires `correctCount === 0` which is itself only reachable via Game Over) — routes through "Yay! Stars collected!" → AnswerComponent carousel → Next → exit.

## Stages

| Stage | Rounds | Difficulty | Content description |
|-------|--------|------------|---------------------|
| Stage 1 — Easy doubles | R1–R5 | L1 fact retrieval, small-friendly N | N drawn from {6, 7, 8, 9, 10, 11, 12}. Distractor families: off-by-one (`2N ± 1`), off-by-two (`2N ± 2`). No cross-decade doubles. Set A: N = 6, 8, 10, 11, 12. Set B: N = 7, 9, 6, 12, 10. Set C: N = 8, 11, 9, 7, 12. |
| Stage 2 — Medium doubles | R6–R10 | L1 fact retrieval, mid-range N, +10 misconception introduced | N drawn from {13, 14, 15, 16, 17}. Distractor families: off-by-one, off-by-two, **added-10-instead-of-doubled (`N + 10`)**. Some doubles cross a decade (e.g. `2 × 16 = 32`). Set A: N = 13, 14, 15, 16, 17. Set B: N = 14, 15, 16, 17, 13. Set C: N = 15, 13, 17, 14, 16. |
| Stage 3 — Harder doubles | R11–R15 | L1 fact retrieval, larger N, mostly cross-decade | N drawn from {18, 19, 20, 21, 22, 23, 24, 25}. All three distractor families used. Most doubles cross a decade (`2 × 18 = 36`, `2 × 23 = 46`, `2 × 25 = 50`). Set A: N = 18, 19, 21, 23, 25. Set B: N = 19, 20, 22, 24, 18. Set C: N = 20, 22, 24, 21, 23. |

Notes:
- **Round-set cycling axis.** `fallbackContent.rounds.length === 45` (Sets A, B, C × 15 rounds each). Per session, only 15 rounds are active — the slice for `set === SETS[gameState.setIndex]`. First play: Set A. After Try Again / Play Again: Set B (different N within the same stage band, parallel difficulty). Third play: Set C. Fourth play: back to Set A. Validator `GEN-ROUNDSETS-MIN-3` passes (3 distinct sets).
- **Same stage and same distractor profile across sets per round-K.** Set A's R1, Set B's R1, Set C's R1 share Stage 1 difficulty and the same misconception-family profile (off-by-one + off-by-two), but use different N values so a Try Again replay is fresh practice rather than memorisation.
- **Inter-stage breather narration is dynamically generated.** The subtitle/TTS string `"Average so far: ${avgSoFar} seconds. Aim for under 2 seconds for three stars."` is rendered at `onMounted` time from the live `avgCorrectMs` (in seconds, 1 decimal place). If no correct rounds yet (`correctCount === 0`), the subtitle falls back to `"No correct answers yet — aim for under 2 seconds for three stars."`.

## Screen inventory (forward reference for screens.md)

This game-flow.md enumerates the screens that screens.md MUST wireframe. Every entry below is a required render target — game-building MUST NOT omit one and MUST NOT add an unlisted one.

| # | Screen | data-phase / component | Notes |
|---|--------|------------------------|-------|
| 1 | Preview | `start` (PreviewScreenComponent, PART-039) | `previewInstruction` HTML (2 paragraphs from spec), `previewAudioText` TTS, `showGameOnPreview: false`. Tap Start → Welcome. |
| 2 | Welcome | TransitionScreen | Game-specific welcome VO (default narration template — see Screen Audio table in screens.md). Single CTA → first Round Intro. |
| 3 | Round Intro × 15 (R1, R2, …, R15) | TransitionScreen, no buttons (CASE 2 Variant A — auto-advancing after TTS) | Title `"Round N"` (literal `Round 1` … `Round 15`). Sequential audio: `rounds_sound_effect` SFX awaited → `playDynamicFeedback({audio_content: 'Round N'})` awaited. Then auto-advance to Game (Round N). |
| 4 | Game (Round N) | `gameplay` | Persistent fixtures: PreviewScreen header (top, fixed) WITH a PART-006 stopwatch in the header, ProgressBar (below header — round counter + 3 dark-heart row). Body: prompt `"Double of N"` (large text, upper-middle), three pill MCQ buttons (lower 60%, ≥44×44 px, ≥8 px gaps). |
| 5 | Per-tap feedback (in-place on Game screen) | overlay state on `gameplay` | Correct: green flash on tapped pill. Wrong (lives remain): red flash on tapped pill + green highlight on correct pill + heart dim. NOT a separate screen — just the `gameplay` screen's terminal state for round N. |
| 6 | Stage 1 complete breather | TransitionScreen with `[I'm ready]` CTA | Fires BETWEEN R5 feedback completion and R6 intro (only if `lives > 0`). Title `"Stage 1 complete"`. Subtitle dynamic: `"Average so far: ${avgSoFar}s. Aim for under 2 seconds for 3 stars."`. Sticker `STICKER_LEVEL`. Awaits `sound_level_transition` then dynamic TTS. |
| 7 | Stage 2 complete breather | TransitionScreen with `[I'm ready]` CTA | Fires BETWEEN R10 feedback completion and R11 intro (only if `lives > 0`). Title `"Stage 2 complete"`. Same subtitle pattern. |
| 8 | Game Over | TransitionScreen | Reached when `gameState.lives === 0`. Title `"Game Over"`. Subtitle `"You got ${score}/15 — try again."`. Stars 0. Sticker `STICKER_SAD`. Single CTA `"Try Again"` → `showMotivation()`. `onMounted` posts `game_complete` (if not posted in the CASE 8 chain), awaits `sound_game_over` + dynamic TTS. |
| 9 | Motivation ("Ready to improve your score?") | TransitionScreen | Reached via Try Again from Game Over OR Play Again on a <3★ Victory. Title `"Ready to improve your score?"`. Single CTA `"I'm ready"` → `restartGame()`. `onMounted` calls `progressBar.update(0, 3)` (restart-path reset to round 0 with full 3 dark hearts), awaits `sound_motivation` + STICKER_MOTIVATE. |
| 10 | Victory | TransitionScreen, persist:true | Reached when round 15 correct-or-wrong feedback completes AND `lives > 0`. Title `"Victory 🎉"`. Subtitle per-star (default narration: `"You averaged ${avgSec}s. Brilliant!"` for 3★, `"You averaged ${avgSec}s — try again to break 2 seconds!"` for 2★, `"Great run!"` for 1★). Stars 1–3 from `getStars()`. Buttons: `[Play Again, Claim Stars]` if stars < 3, `[Claim Stars]` if 3★. `onMounted` posts `game_complete` and awaits `sound_game_victory` + `vo_victory_stars_N`. |
| 11 | Stars Collected | TransitionScreen, persist:true, buttons:[] | Title `"Yay! 🎉\nStars collected!"`. `onMounted` plays `sound_stars_collected` (awaited), fires `show_star` postMessage with `gameState.stars`, `setTimeout(~1500)` → `showAnswerCarousel()`. Does NOT call `transitionScreen.hide()` in onMounted — terminal celebration backdrop. |
| 12 | Answer Carousel | AnswerComponent (PART-051), revealed over Stars Collected backdrop | 15 slides (one per played round in active set). Each slide renders prompt + 3 pills in solved state (correctIndex chip green, others dimmed/non-interactive) + explanation caption. FloatingButton `.setMode('next')` fires alongside `answerComponent.show(...)`. |

## Round-set cycling logic (canonical reference)

`gameState` carries:
- `setIndex: 0 | 1 | 2` — index into `SETS = ['A', 'B', 'C']`. Initial value: `0` (Set A on first play).
- `activeRounds: round[]` — the 15 round objects from `fallbackContent.rounds.filter(r => r.set === SETS[setIndex])`. Recomputed inside `resetGameState()` after `setIndex` is set.
- `currentRound: 1..15` — index into `activeRounds` (1-based for display; convert to 0-based for array access).
- `lives: 0..3` — starts at 3 (3 dark hearts), -1 per wrong tap.
- `score: 0..15` — count of correct taps in this session.
- `responseMsByRound: { [roundNumber]: number }` — per-round `Date.now()` delta from prompt-paint to tap. Populated for every round (correct AND wrong); `getAvgCorrectMs()` filters to only correct entries.
- `attempts: AttemptRecord[]` — for the data contract.
- `stars: 0..3` — computed at `endGame()` from `getStars()`.
- `isProcessing: boolean` — input-block flag during feedback.
- `stopwatch: TimerComponent` — PART-006 instance.

`restartGame()` (called from Motivation's `[I'm ready]` button) MUST execute in this order:
1. `gameState.setIndex = (gameState.setIndex + 1) % 3`. **This MUST happen BEFORE `resetGameState()`** so the new round-slice is in place.
2. `resetGameState()` — sets `currentRound = 1`, `lives = 3`, `score = 0`, `stars = 0`, `attempts = []`, `responseMsByRound = {}`, `isProcessing = false`; recomputes `activeRounds` from the new `setIndex`; resets `stopwatch` to 0 (paused).
3. `progressBar.update(0, 3)` — safety-net reset (Motivation's `onMounted` already did this; idempotent).
4. `renderRoundIntro(1)` — paints Round 1 intro directly. **Skips Preview + Welcome** per the default flow's restart path.

A 4th play wraps `setIndex` from `2 → 0` (Set C → Set A). Validator `GEN-ROUNDSETS-MIN-3` passes because `rounds.length === 45` and 3 distinct sets exist.

## Stopwatch (PART-006) — control rules

- **Component:** `TimerComponent` (PART-006), instantiated once at game-build time, mounted in the platform header (inside `.mathai-preview-header-center` per memory `timer_preview_integration`). Format `mm:ss`. Count-up (no `targetMs`).
- **Lifecycle:**
  - **Created** during game-build with mode `count-up`, paused initial state.
  - **First start** when Round 1's gameplay body paints (after the Round-1 intro auto-advances). `stopwatch.start()` is called from `renderRound(1)`.
  - **Pauses on:**
    - Per-round feedback rendering (correct + wrong) — `stopwatch.pause()` called inside both feedback handlers BEFORE the awaited SFX/TTS.
    - Inter-stage breather entry (R5↔R6, R10↔R11) — `stopwatch.pause()` on breather mount.
    - Visibility hidden — VisibilityTracker auto-pauses (memory `feedback_timer_resume_visibility_bug` — DO NOT pass `fromVisibilityTracker: true` on resume; that flag is dead code).
    - End-of-game (Victory or Game Over) — final `stopwatch.pause()` on `endGame(...)` entry.
  - **Resumes on:**
    - Next round's gameplay body paint — `stopwatch.resume()` called from `renderRound(N)`.
    - Visibility restored — VisibilityTracker calls `resume()` (without the dead `fromVisibilityTracker` flag).
    - Inter-stage breather exit (tap `[I'm ready]`) — DOES NOT directly resume; resumes when the next Round-N's `renderRound(N)` paints the gameplay body.
- **Per-round response-time capture:**
  - `gameState.roundStartMs = Date.now()` is set inside `renderRound(N)` AFTER the prompt + pills paint and the stopwatch resumes.
  - On tap: `gameState.responseMsByRound[currentRound] = Date.now() - gameState.roundStartMs`.
  - `getAvgCorrectMs()` reads `responseMsByRound` filtered to rounds where `attempts[i].is_correct === true`, returns `mean` in ms.
- **NOT a countdown.** Stopwatch overflow / wraparound is irrelevant — sessions are designed for sub-5-minute completion. There is NO time-up game-over branch.
- **Header presentation:** mount inside `.mathai-preview-header-center`, override TimerComponent's default 320×41 inline styles per memory `timer_preview_integration`, hide `#previewTimerText` (empty), do NOT mirror via `PreviewScreen.timerInstance` (per memory).

## Lives handling

- `gameState.lives = 3` on first session and after every `restartGame()`.
- ProgressBar's heart row renders 3 dark hearts (color override per spec line "Lives are dark hearts, not the usual red.") — visual override only, mechanic unchanged.
- Each wrong tap: `gameState.lives -= 1` BEFORE `progressBar.update(currentRound, gameState.lives)` — so the dimmed heart appears in the visible bump (memory `progress_bar_round_complete`).
- `lives === 0` → CASE 8 chain: full wrong-SFX + dynamic TTS awaited FIRST → `postMessage{game_complete}` → `endGame(false)` → `showGameOver()`.
- ProgressBar state is preserved through Game Over (student sees prior round count + 0 hearts). Reset to `(0, 3)` happens on Motivation's `onMounted` (restart-path reset).

## Scoring logic (forward reference for scoring.md)

| Trigger | Effect |
|---------|--------|
| Round N correct tap | `gameState.score += 1`; `responseMsByRound[N]` recorded; `attempts.push({ ..., is_correct: true })` |
| Round N wrong tap (lives > 0 after) | `gameState.lives -= 1`; `responseMsByRound[N]` recorded but NOT counted in `getAvgCorrectMs()`; `attempts.push({ ..., is_correct: false, misconception_tags: [round.misconception_tags[tappedValue]] })` |
| Round N wrong tap (lives → 0) | Same as above PLUS CASE 8 chain → Game Over |
| All 15 rounds completed (lives > 0 throughout) | `endGame(true)` → `gameState.stars = getStars()` |

**Star formula (from spec, NOT default 90/66/33 percentage):**

```
correctCount = number of rounds where attempts[i].is_correct === true
avgCorrectMs = mean of responseMsByRound[i] for rounds where is_correct === true

if correctCount === 0          → 0★ (only reachable via Game Over with no correct in between)
else if avgCorrectMs < 2000    → 3★
else if avgCorrectMs ≤ 3500    → 2★
else                            → 1★    (covers avgCorrectMs > 3500 AND the spec's "any other completed run with ≥1 correct" disjunct)
```

scoring.md will repeat this formula and document the data-contract field mapping.

## Feedback patterns per outcome (forward reference for feedback.md)

The build step uses these patterns verbatim. Every entry maps a player-visible event to a FeedbackManager / DOM action.

| Event | Trigger | Action |
|-------|---------|--------|
| **Round prompt paints** | `renderRound(N)` paints prompt + pills | `FeedbackManager.sound.play('tap_sound', { sticker: null }).catch(()=>{})` — fire-and-forget ambient (CASE 17 default for new content). `gameState.roundStartMs = Date.now()`. `stopwatch.resume()`. `gameState.isProcessing = false`. NO round-start TTS (the visual prompt is self-evident; round-start TTS would slow down speed-fluency play). |
| **Correct tap** (CASE 4) | Pill `onclick` resolves `tappedValue === round.correctValue` AND `gameState.isProcessing === false` | 1) `gameState.isProcessing = true`; 2) `stopwatch.pause()`; 3) `gameState.responseMsByRound[currentRound] = Date.now() - roundStartMs`; 4) tapped pill gets `.selected-correct` (green); 5) `gameState.score += 1`; 6) **`progressBar.update(currentRound, gameState.lives)` FIRST** (memory `progress_bar_round_complete`); 7) `await FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE })`; 8) `await FeedbackManager.playDynamicFeedback({ audio_content: round.correctTTS, subtitle: round.correctSubtitle, sticker: STICKER_CELEBRATE })`; 9) Push attempt with `is_correct: true`; 10) Auto-advance: if `currentRound === 5 || currentRound === 10` → `showStageBreather(currentRound + 1)`; else if `currentRound < 15` → `currentRound += 1; renderRoundIntro(currentRound)`; else `endGame(true)`. |
| **Wrong tap, lives remain** (CASE 7) | Pill `onclick` resolves `tappedValue !== round.correctValue` AND `gameState.lives > 1` (i.e. `lives` will be ≥ 1 after decrement) | 1) `gameState.isProcessing = true`; 2) `stopwatch.pause()`; 3) `gameState.responseMsByRound[currentRound] = Date.now() - roundStartMs`; 4) tapped pill gets `.selected-wrong` (red flash); 5) correct pill gets `.selected-correct` (green highlight); 6) `gameState.lives -= 1`; 7) **`progressBar.update(currentRound, gameState.lives)` FIRST** (heart dims in same frame as bump); 8) `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD })`; 9) `await FeedbackManager.playDynamicFeedback({ audio_content: round.wrongTTS, subtitle: round.wrongSubtitle, sticker: STICKER_SAD })`; 10) Push attempt with `is_correct: false` and `misconception_tags: [round.misconception_tags[String(tappedValue)]]`; 11) Auto-advance: if `currentRound === 5 || currentRound === 10` → `showStageBreather(currentRound + 1)`; else if `currentRound < 15` → `currentRound += 1; renderRoundIntro(currentRound)`; else `endGame(false)` → Victory (since lives > 0). Wrong-round responseMs is NOT counted in `getAvgCorrectMs()`. |
| **Wrong tap, lives → 0** (CASE 8) | `tappedValue !== round.correctValue` AND `gameState.lives === 1` before decrement | 1) Same red+green flash + state mutations as CASE 7 (lives -= 1 → 0; progressBar.update(currentRound, 0) FIRST); 2) `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD })`; 3) `await FeedbackManager.playDynamicFeedback({ audio_content: round.wrongTTS, subtitle: round.wrongSubtitle, sticker: STICKER_SAD })`; 4) `window.parent.postMessage({ type: 'game_complete', data: metrics() }, '*')` BEFORE end-of-game audio (CASE 8 contract); 5) `endGame(false)` → `showGameOver()`. Game Over's `onMounted` does NOT re-post `game_complete`. |
| **Round transition (auto-advance, R2..R15 intro)** | `renderRoundIntro(N)` called from previous round's tap handler OR from breather's `[I'm ready]` action | TransitionScreen with `title: "Round N"`, `buttons: []` (CASE 2 Variant A — no CTA). `onMounted`: `await FeedbackManager.sound.play('rounds_sound_effect', { sticker: STICKER_ROUND })` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round N', subtitle: 'Round N' })`. After both audio steps complete: `transitionScreen.hide(); renderRound(N);`. |
| **Stage 1 complete breather** (after R5) | R5's tap handler (correct OR wrong with lives > 0) calls `showStageBreather(6)` instead of `renderRoundIntro(6)` | TransitionScreen with `title: "Stage 1 complete"`, dynamic `subtitle`, sticker `STICKER_LEVEL`, `buttons: [{ text: "I'm ready", action: () => { transitionScreen.hide(); renderRoundIntro(6); } }]`, `persist: true`. `onMounted`: compute `avgSoFar = (getAvgCorrectMs() / 1000).toFixed(1)`; if `correctCount === 0`, override subtitle to fallback string; `await FeedbackManager.sound.play('sound_level_transition', { sticker: STICKER_LEVEL })`; `await FeedbackManager.playDynamicFeedback({ audio_content: subtitle, subtitle, sticker: STICKER_LEVEL })`. |
| **Stage 2 complete breather** (after R10) | R10's tap handler (correct OR wrong with lives > 0) calls `showStageBreather(11)` | Same shape as Stage 1 breather, with `title: "Stage 2 complete"` and advance to `renderRoundIntro(11)`. |
| **Last round complete → Victory** | `endGame(true)` called from R15's tap handler (correct OR wrong with lives > 0) | 1) `gameState.stars = getStars()`; 2) `window.parent.postMessage({ type: 'game_complete', data: metrics() }, '*')`; 3) `transitionScreen.show({ title: 'Victory 🎉', subtitle: <per-star-tier>, stars: gameState.stars, buttons: <per-stars>, persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE }); await FeedbackManager.playDynamicFeedback({ audio_content: <subtitle>, subtitle: <subtitle>, sticker: STICKER_CELEBRATE }); } })`; 4) `buttons` is `[{ text: 'Play Again', type: 'secondary', action: showMotivation }, { text: 'Claim Stars', type: 'primary', action: showStarsCollected }]` if `stars < 3`, else `[{ text: 'Claim Stars', type: 'primary', action: showStarsCollected }]`. |
| **Last round wrong with lives → 0** (R15 CASE 8) | R15 tap with `tappedValue !== correctValue` AND `lives === 1` | Same CASE 8 chain as above (mid-game CASE 8) — full wrong SFX + TTS awaited → `postMessage{game_complete}` → `endGame(false)` → `showGameOver()`. Even though it's the last round, Game Over takes precedence over Victory because `lives === 0`. |
| **Tap Try Again** (Game Over) | TransitionScreen `Try Again` button | Routes to `showMotivation()` (same Motivation transition as Play Again — single shared screen). |
| **Tap Play Again** (Victory, 0–2★ only) | TransitionScreen `Play Again` button | Routes to `showMotivation()`: `transitionScreen.show({ title: "Ready to improve your score?", buttons: [{ text: "I'm ready", type: 'primary', action: restartGame }], persist: true, onMounted: async () => { progressBar.update(0, 3); await FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE }); } })`. Tap CTA → `restartGame()` (cycles set, resets state including lives to 3, skips Preview + Welcome). |
| **Tap Claim Stars** (Victory) | TransitionScreen `Claim Stars` button | Routes to `showStarsCollected()`: `transitionScreen.show({ title: 'Yay! 🎉\nStars collected!', buttons: [], persist: true, styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }, onMounted: async () => { await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE }); window.parent.postMessage({ type: 'show_star', stars: gameState.stars }, '*'); setTimeout(() => showAnswerCarousel(), 1500); } })`. **Does NOT call `transitionScreen.hide()` in `onMounted`** (terminal celebration backdrop). |
| **Show Answer Carousel** | `showAnswerCarousel()` fires from Stars Collected `onMounted`'s setTimeout | `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` — 15 slides, one per played round in `gameState.activeRounds`, each `{ render(container) { renderAnswerSlide(container, gameState.activeRounds[i].answer); } }`. Then `floatingBtn.setMode('next')`. AnswerComponent appears OVER the still-mounted Stars Collected backdrop. |
| **Tap Next** (FloatingButton 'next' mode, after Answer Carousel revealed) | `floatingBtn.on('next', () => { ... })` | Single-stage exit: `answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*');`. Iframe tears down. Handler is registered as `floatingBtn.on('next', ...)` — NOT `floatingBtn.on('submit', ...)` (memory: bodmas-blitz 2026-04-23 regression). |
| **Visibility hidden / tab switch** (CASE 14) | Browser `visibilitychange` event with `document.hidden === true` | FeedbackManager pauses any in-flight audio. `stopwatch.pause()` (auto via VisibilityTracker). **VisibilityTracker's built-in PopupComponent renders the pause overlay automatically** (memory `feedback_pause_overlay` — never custom-build a pause overlay div). Customize ONLY via VisibilityTracker's `popupProps` if needed. |
| **Visibility restored** (CASE 15) | `visibilitychange` with `document.hidden === false` | FeedbackManager resumes audio. `stopwatch.resume()` (no `fromVisibilityTracker` flag — memory `feedback_timer_resume_visibility_bug`). VisibilityTracker dismisses its own popup. Gameplay continues. |
| **Audio failure** (CASE 16) | Any `FeedbackManager.sound.play(...)` or `playDynamicFeedback(...)` throws | All audio calls are try/catch wrapped (or `.catch(()=>{})` on fire-and-forget). Visual feedback (red/green pill flash, heart dim, stage breather text) renders regardless. Game advances normally. |

## End-of-game beat (canonical sequence)

The end-of-game chain is the AnswerComponent multi-round chain (Step 2e of game-planning/SKILL.md) — celebration FIRST, AnswerComponent AFTER:

1. **Final round (R15) tap handler** evaluates correct/wrong → either `endGame(true)` (Victory, lives > 0) or `endGame(false)` (CASE 8 fired before, Game Over already routed). Game Over branch ends here (Try Again → Motivation → restartGame). Victory branch continues:
2. **`endGame(true)`** computes `gameState.stars = getStars()`, posts `game_complete` with metrics, then calls `showVictory()`.
3. **Victory transition** renders with `title: 'Victory 🎉'`, subtitle per `gameState.stars`, `stars: gameState.stars`, conditional buttons array, `persist: true`. `onMounted` plays `sound_game_victory` (awaited) → victory VO (awaited).
4. **`Claim Stars` button action calls `showStarsCollected()`** — never `showAnswerCarousel()` directly. (`Play Again` only on <3★ → `showMotivation()` → `restartGame()`.)
5. **Stars Collected transition** renders with `title: 'Yay! 🎉\nStars collected!'`, `buttons: []`, `persist: true`. `onMounted`: awaits `sound_stars_collected`, fires `show_star` postMessage, `setTimeout(1500) → showAnswerCarousel()`. **Does NOT call `transitionScreen.hide()` in onMounted** — backdrop persists.
6. **`showAnswerCarousel()`** calls `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` (15 slides), THEN `floatingBtn.setMode('next')`. Carousel and Next button appear OVER the Stars Collected backdrop.
7. **Single-stage Next exit:** `floatingBtn.on('next', () => { answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*'); })`.

## Cross-checks (Step 7)

- ✅ Every screen named in the diagram (Preview, Welcome, Round Intro × 15, Game, Stage-1-complete breather, Stage-2-complete breather, Game Over, Motivation, Victory, Stars Collected, Answer Carousel) has a row in the screen inventory and will get a wireframe in screens.md.
- ✅ Every feedback event (round-prompt-paint, correct-tap, wrong-tap-lives-remain, wrong-tap-last-life, round-transition, stage-1-breather, stage-2-breather, last-round-victory, last-round-CASE-8, try-again, play-again, claim-stars, show-answer, tap-next, visibility-hide, visibility-restore, audio-failure) has a FeedbackManager call signature documented above and will get a row in feedback.md.
- ✅ Scoring formula uses time-based thresholds (NOT default 90/66/33%): 3★ < 2000 ms, 2★ 2000–3500 ms, 1★ > 3500 ms OR any completed run with ≥1 correct, 0★ only on Game Over with `correctCount === 0`. Matches spec § Scoring verbatim.
- ✅ Lives = 3 (dark hearts), -1 per wrong tap, Game Over at 0 lives. ProgressBar bumps FIRST inside both correct and wrong tap handlers (memory `progress_bar_round_complete`) — heart-dim animation co-occurs with the visible bump.
- ✅ AnswerComponent reveals AFTER Stars Collected celebration (memory `feedback_pause_overlay` — celebration plays first, then carousel; `answerComponent.show(...)` is called ONLY from `showAnswerCarousel()`, never from `endGame()` or from a Victory `Claim Stars` action that bypasses Stars Collected).
- ✅ Pause overlay = VisibilityTracker's PopupComponent (memory `feedback_pause_overlay` — never custom-built).
- ✅ Set rotation increments `setIndex` BEFORE `resetGameState()` inside `restartGame()` so the new round-slice is in place before round 1 renders.
- ✅ FloatingButton (PART-050) is mounted ONLY for the canonical end-of-game `'next'` mode — there is NO submit-mode (P1 single-tap MCQ). Validator `GEN-FLOATING-BUTTON-MISSING` does NOT fire because the spec's flow does not describe a Submit CTA; PART-050's "Next button at end-of-game" sub-rule still applies and is honoured.
- ✅ Next click handler is `on('next', ...)` not `on('submit', ...)` (avoiding the bodmas-blitz 2026-04-23 regression).
- ✅ Stopwatch (PART-006) is count-up, mounted in the platform header (memory `timer_preview_integration`), pauses on visibility-hidden / round-feedback / end-of-game; resume omits the dead `fromVisibilityTracker` flag (memory `feedback_timer_resume_visibility_bug`).
- ✅ Inter-stage breather inserts BEFORE the next stage's Round-N intro on the auto-advance arrow — fires after R5 and R10 only when `lives > 0` (Game Over takes precedence). Maps to `flow-gallery.md` row 11 ("Stats + intro after each section").
- ✅ Try Again (Game Over) and Play Again (<3★ Victory) BOTH route through the shared "Ready to improve your score?" Motivation transition → `restartGame()` → restart from Round 1 (skipping Preview + Welcome). Round-set cycles A → B → C → A.
- ✅ No `function loadRound() { ... }` declarations (memory `feedback_window_loadround_shadow` — use `renderRound`).
- ✅ Plan honours the spec exactly — no scope drift. Every spec field (15 rounds across 3 stages of 5; 3 dark hearts; PART-006 count-up stopwatch; star formula `< 2000 / 2000–3500 / > 3500`; A/B/C round-set cycling; per-round correctTTS/correctSubtitle/wrongTTS/wrongSubtitle; misconception-family distractors; PART-051 AnswerComponent with 15 slides; PART-039 Preview; CASE 4 / 7 / 8 feedback patterns; inter-stage breather between R5↔R6 and R10↔R11) is reflected above. No invented features; no scope additions; the four "Suggestions" in the spec (read-aloud round-start TTS, Hindi bilingual TTS append, streak SFX, fastest-round on Victory) are NOT applied because they require explicit creator approval per spec § Suggestions.
