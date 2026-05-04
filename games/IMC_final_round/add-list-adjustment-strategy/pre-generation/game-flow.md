# Game Flow: Add List with Adjustment Strategy — The Compensation Workout

## One-liner

The student nudges two awkward two-digit addends (e.g. `58 + 72`) toward a friendlier multiple-of-10 pair using +/- buttons mounted on each addend box, then types the sum into a numeric input and taps the **Next Round** FloatingButton — across 9 rounds (Stage 1 ±1–4, Stage 2 ±2–4 mixed-direction, Stage 3 ±3–5 wider gaps), with 3 lives, **no timer**, and a **retry-same-round on wrong** twist that re-presents the same pair after the addends reset and the input clears.

## Shape

**Shape:** Shape 2 Multi-round (9 rounds per session, three stages of three rounds each, rotating round-set A → B → C → A on Try Again / Play Again).

## Changes from default

- **Retry-same-round on wrong (lives remain) — non-default for archetype #3.** The standard Lives Challenge advances to the next round on wrong (with a life decrement); this game STAYS on the same round and re-presents it after addends reset, input clears and a heart dims. `currentRound` MUST NOT be incremented on wrong-with-lives. Implementation: a `resetRoundForRetry()` helper repaints the same round (resets `addend1Display` / `addend2Display` to the round's `addend1Start` / `addend2Start`, clears `inputEl.value`, sets `floatingBtn.setSubmittable(false)`, sets `gameState.isProcessing = false`, increments `gameState.attemptsOnThisRound`).
- **Custom +/- nudge UI inside the PART-027 Play Area.** Two addend boxes side by side with a big bold `+` operator between them; each box has a soft pink `−` button **above** and a soft green `+` button **below** (~44 × 44 px each); a `↺ Reset` pill below the workspace returns both addends to their starting values. The +/- taps mutate display-only `addend1Display` / `addend2Display` state (NOT graded, NOT life-deducting). Plain HTML buttons with click handlers; NOT a CDN component. Step 4 (Build) runs as `[SUB-AGENT]` — no MCP-fetched library required.
- **Free-text numeric input (P2)** is the answer-commit affordance — `<input type="text" inputmode="numeric" pattern="[0-9]*">` mounted below the workspace with a `?` placeholder, sized for a 3-digit answer, `font-size: 24px` (well above Mobile rule #28's 16 px Safari auto-zoom threshold). Enter key submits (Mobile rule #16). No CDN library beyond the standard CDN core.
- **PART-050 FloatingButton in `'submit'` mode**, anchored fixed-bottom (`.mathai-fb-btn-primary`), labelled `"Next Round"`. `floatingBtn.setSubmittable(false)` initially; re-evaluated on every `oninput` event. **Mode flips to `'next'` ONLY inside `showAnswerCarousel()`** AFTER `answerComponent.show(...)` has rendered — never inside `endGame()`.
- **Star rubric uses `firstTryCorrect`, not `score` / percentage.** `getStars()` reads `gameState.firstTryCorrect` (count of rounds solved on first submit) and `gameState.lives`, NOT a percentage of `score / totalRounds`. The default 90/66/33 thresholds DO NOT apply.
- **Round-set cycling A → B → C → A** on `restartGame()`. `gameState.setIndex` increments BEFORE `resetGameState()` is called inside `restartGame()`; `activeRounds` is then re-sliced from `fallbackContent.rounds` filtered by `set === SETS[setIndex]`. `setIndex` persists across in-session restarts; resets to 0 only on fresh page load. **`setIndex` MUST NOT appear in `resetGameState()`'s reset list.**
- **AnswerComponent (PART-051) reveals after Stars Collected** as 9 slides (one per played round); each slide renders a SOLVED, non-interactive view (starting addend pair → friendly pair → correct sum + strategy statement banner). No +/- buttons, no input, no Reset, no hearts, no progress bar on the answer slides.
- **No timer (PART-006 NOT included).** Creator explicitly says "Speed isn't graded." Validator rule `TIMER-MANDATORY-WHEN-DURATION-VISIBLE` does NOT trip — `getStars()` reads only `firstTryCorrect` and `lives`, and the preview text says "No timer".
- **Stage visual differentiator (no text, no transition).** Stage 1 uses default grey borders on the addend boxes. Stage 2 uses a soft blue border (`--mathai-color-info`). Stage 3 returns to default grey borders but uses `font-weight: 700` on the addend digits (vs `font-weight: 500` in stages 1–2). The stage break is felt visually, NOT narrated by a per-stage transition screen.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌──────────────────────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Game (round N)               │
│ 🔊 prev  │        │ 🔊 welc. │        │ (trans.,     │ (after  │ 🔊 round prompt TTS          │
│   audio  │        │    VO    │        │  no buttons) │  sound) │   "Add A1 and A2."           │
│(PART-039)│        │          │        │ 🔊 "Round N" │         │   (fire-and-forget, CASE 3)  │
└──────────┘        └──────────┘        └──────────────┘         │ • [box1: A1Display] +       │
                                                ▲                │   [box2: A2Display]          │
                                                │                │   (− above / + below each)   │
                                                │                │ • ↺ Reset pill               │
                                                │                │ • numeric input "?"           │
                                                │                │ • FloatingBtn "Next Round"   │
                                                │                │   (submit, disabled until    │
                                                │                │    input ≥1 digit)           │
                                                │                └──────────┬───────────────────┘
                                                │                           │ tap "Next Round" / Enter
                                                │                           │   (input non-empty)
                                                │                           ▼
                                                │             ┌──────────────────────────────────┐
                                                │             │ Submit handler (in-place on Game)│
                                                │             │ ── recordAttempt BEFORE audio ── │
                                                │             │ CORRECT path:                    │
                                                │             │  • input pill green              │
                                                │             │  • addend boxes animate          │
                                                │             │    Start → Friendly + green tick │
                                                │             │  • progressBar.update(N, lives)  │
                                                │             │    [FIRST]                       │
                                                │             │  • score += 1; if attemptsOn-    │
                                                │             │    ThisRound === 0 then          │
                                                │             │    firstTryCorrect += 1          │
                                                │             │  • await sound_correct +         │
                                                │             │    celebrate sticker (≥1500 ms)  │
                                                │             │  • await TTS round.successAudio  │
                                                │             │    (e.g. "Nice! 58 + 72 = 60 +   │
                                                │             │     70 = 130.")                  │
                                                │             │ WRONG-with-lives (RETRY-SAME):   │
                                                │             │  • input pill red flash + shake  │
                                                │             │    (~600 ms)                     │
                                                │             │  • progressBar.update(N,         │
                                                │             │    lives - 1) [FIRST]            │
                                                │             │  • lives -= 1 (heart dims)       │
                                                │             │  • addend boxes animate back to  │
                                                │             │    Start values (~300 ms)        │
                                                │             │  • input clears                  │
                                                │             │  • await sound_incorrect + sad   │
                                                │             │    sticker (≥1500 ms)            │
                                                │             │  • await TTS round.failAudio     │
                                                │             │    "Not quite — sum of A1 and A2 │
                                                │             │     is CORRECT."                 │
                                                │             │  • attemptsOnThisRound += 1      │
                                                │             │  • resetRoundForRetry() —        │
                                                │             │    SAME currentRound re-renders  │
                                                │             │ WRONG-last-life (CASE 8):        │
                                                │             │  • Same as wrong-with-lives 1–7  │
                                                │             │    (CASE 8 — wrong feedback      │
                                                │             │     MUST play before game-over)  │
                                                │             │  • THEN endGame(false) → Game    │
                                                │             │    Over                          │
                                                │             └─────────┬────────────────────────┘
                                                │                       │
                              ┌─────────────────┴─────┬────────┬────────┴──────────────┐
                              │                       │        │                       │
                       wrong AND lives = 0    correct AND      correct AND           wrong AND
                              │                more rounds   last round (R9)        lives > 0
                              ▼                  │            won                  (RETRY-SAME-
                   ┌────────────────────┐        │             │                    ROUND;
                   │ Game Over          │        ▼             ▼                    currentRound
                   │ (TransitionScreen) │   loop to     ┌────────────────────┐      NOT bumped)
                   │ Title "Game Over"  │   Round N+1   │ Victory (status)   │       │
                   │ Subtitle: "You ran │   intro       │ 0–3★               │       │ stay on Game,
                   │  out of lives!"    │   (NEXT round)│ 🔊 sound_game_     │       │ player retries
                   │ Sticker 😔        │                │   victory →        │       │ same pair
                   │ 🔊 sound_game_over │                │   vo_victory_      │       ▼
                   │ buttons:[Try Again]│                │   stars_N          │  (loop back to
                   └─────────┬──────────┘                │ buttons:           │   Game on same
                             │ tap "Try Again"           │  • <3★ → [Play     │   round)
                             ▼                           │    Again, Claim    │
                   ┌──────────────────┐                  │    Stars]          │
                   │ "Ready to        │                  │  • 3★  → [Claim    │
                   │  improve your    │                  │    Stars]          │
                   │  score? ⚡"      │                  └──────┬─────┬───────┘
                   │ (trans., tap)    │                         │     │
                   │ 🔊 motivation VO │            "Play Again" │     │ "Claim Stars"
                   │ [I'm ready! 🙌]  │            (only if 0-2★)│     │ (always)
                   │ onMounted:       │                          ▼     ▼
                   │  progressBar.    │                ┌────────────────┐  ┌─────────────────────┐
                   │  update(0, 3)    │                │ "Ready to      │  │ "Yay!               │
                   │  (restart-path   │                │  improve your  │  │  Stars collected!"  │
                   │   reset)         │                │  score? ⚡"    │  │ (trans., persist,   │
                   └────────┬─────────┘                │ (trans., tap)  │  │  buttons:[])        │
                            │ tap                      │ 🔊 motiv. VO   │  │ onMounted:          │
                            ▼                          │ [I'm ready! 🙌]│  │  • await sound_     │
                   restartGame()                       │ onMounted:     │  │    stars_collected  │
                   • setIndex = (setIndex+1) % 3       │  progressBar.  │  │  • postMessage      │
                     [BEFORE resetGameState]            │  update(0, 3)  │  │    {type:'show_     │
                   • resetGameState()                  └───────┬────────┘  │     star',stars}    │
                     (lives=3, score=0,                       │ tap        │  • setTimeout(~1500)│
                      currentRound=1,                          ▼           │    showAnswer       │
                      firstTryCorrect=0,             restartGame()         │    Carousel()       │
                      attemptsOnThisRound=0,         (same as Game-Over    │  • DOES NOT call    │
                      activeRounds = filter set,      Try Again above)     │    transitionScreen │
                      attempts = [])                                       │    .hide() in       │
                   • progressBar.update(0, 3)                              │    onMounted        │
                   • renderRoundIntro(1)                                   └──────────┬──────────┘
                     (skips Preview + Welcome)                                        │ auto handoff
                                                                                      │ (TS persists
                                                                                      │  as backdrop)
                                                                                      ▼
                                                                       ┌────────────────────────────┐
                                                                       │ Correct Answers carousel   │
                                                                       │ (PART-051,                  │
                                                                       │  AnswerComponent)           │
                                                                       │ • 9 slides (1 per round)    │
                                                                       │ • each slide: starting pair │
                                                                       │   → friendly pair + green   │
                                                                       │   tick + correct sum +      │
                                                                       │   strategy statement banner │
                                                                       │ • FloatingButton            │
                                                                       │   .setMode('next') fires    │
                                                                       │   alongside                 │
                                                                       │   answerComponent.show()    │
                                                                       └──────────┬──────────────────┘
                                                                                  │ tap Next
                                                                                  ▼ (single-stage)
                                                                  answerComponent.destroy()
                                                                  previewScreen.destroy()
                                                                  floatingBtn.destroy()
                                                                  postMessage{type:'next_ended'}
                                                                                  │
                                                                                  ▼
                                                                                 exit
```

Retry / branch paths covered:
- **Try Again** after Game Over (lives = 0) — routes through "Ready to improve your score? ⚡" motivation transition → `restartGame()` → restart from Round 1 of the NEXT round-set (A → B → C → A), **skipping Preview + Welcome**.
- **Play Again** after a Victory with fewer than 3★ — routes through the SAME motivation transition → `restartGame()` → restart from Round 1 of the NEXT round-set, **skipping Preview + Welcome**.
- **Claim Stars** after any Victory (0★ included) — routes through "Yay! Stars collected!" → AnswerComponent carousel → Next → exit.
- **Wrong-with-lives RETRY-SAME-ROUND** — does NOT exit Game; loops back to render the same round again with addends reset, input cleared, life decremented, `attemptsOnThisRound++`. The student keeps trying until they submit correct OR lives reach 0.

## Stages

| Stage | Rounds | Difficulty | Content description |
|-------|--------|------------|---------------------|
| Stage 1 (Easy benchmarks) | R1–R3 | L3 entry — single benchmark, ±1–4 from a multiple of 10, unambiguous nearest benchmark, sum 110–140. Default grey borders. | Each addend within ±4 of a multiple of 10 (e.g. `58 + 72 = 60 + 70 = 130`, `61 + 69 = 60 + 70 = 130`, `47 + 73 = 50 + 70 = 120`). Compensation work: 1–4 +/- taps each; direct mental compute also feasible. Expected first-attempt solve rate ~85%. |
| Stage 2 (Tighter adjustments) | R4–R6 | L3 mid — opposite-direction nudges, ±2–4 mixed, sum 110–140. **Soft blue border on addend boxes.** | Each addend within ±2 to ±4 of a multiple of 10 with directional thinking required (e.g. `62 + 68 = 60 + 70 = 130`, `53 + 77 = 50 + 80 = 130`, `38 + 82 = 40 + 80 = 120`). Compensation work: 2–4 +/- taps total with "this addend up, that addend down" pattern. Expected first-attempt solve rate ~70%. |
| Stage 3 (Wider gaps) | R7–R9 | L3 mastery — twin pairs, ±3–5 each, larger total adjustments, sum 120–150. **Default grey borders + font-weight 700 on addend digits.** | Each addend within ±3 to ±5 of a benchmark; often a "twin" target like `70 + 70 = 140` (e.g. `66 + 74 = 70 + 70 = 140`, `64 + 76 = 70 + 70 = 140`). Round 9 of each set lands on a non-multiple-of-10 friendly pair (e.g. `43 + 78 = 40 + 81 = 121`). Compensation work: 3–5 +/- taps per addend (6–10 total). Expected first-attempt solve rate ~55%. |

Notes:
- **All 9 rounds use the same Type A "adjust-and-add" mechanic.** Only the addend pairs and the per-stage visual surface differ. There is no per-stage transition screen — the stage break is felt visually.
- **Round-set cycling axis.** The spec ships `rounds.length === 27` (Sets A, B, C × 9 rounds each, 3 per stage per set). Per session, only 9 rounds are active — the slice for `set === SETS[gameState.setIndex]`. First play: Set A. After Try Again / Play Again: Set B. After second Try Again / Play Again: Set C. Fourth play: back to Set A. Validator `GEN-ROUNDSETS-MIN-3` passes.
- **Stage-3 R9 friendly pair is non-multiple-of-10** in each set (A: `40 + 81 = 121`, B: `50 + 73 = 123`, C: `40 + 85 = 125`). This is intentional for Stage-3 mastery; the compensation invariant still holds (`addend1Friendly + addend2Friendly === correct === addend1Start + addend2Start`).

## Screen inventory (forward reference for screens.md)

This game-flow.md enumerates the screens that screens.md MUST wireframe. Every entry below is a required render target — game-building MUST NOT omit one and MUST NOT add an unlisted one.

| # | Screen | data-phase / component | Notes |
|---|--------|------------------------|-------|
| 1 | Preview | `start` (PreviewScreenComponent, PART-039) | `previewInstruction` HTML (5 paragraphs from spec), `previewAudioText` TTS, `showGameOnPreview: false` (the +/- mechanic is novel; preview overlay should not show the game state until the audio explains it). Tap Start → Welcome. |
| 2 | Welcome | TransitionScreen | Title `"Welcome to The Compensation Workout!"`. Subtitle: `"Two awkward numbers — nudge them friendly. The sum stays the same."`. Single tap-anywhere advance. Game-specific welcome VO awaited in `onMounted`. → first Round Intro. |
| 3 | Round Intro × 9 (R1…R9) | TransitionScreen, no buttons (CASE 2 Variant A — auto-advancing) | Title `"Round N"` (1..9). Sequential audio: `sound_rounds` SFX awaited → `playDynamicFeedback` "Round N" VO awaited. Then auto-advance to Game (Round N). |
| 4 | Game (Round N) | `gameplay` | Persistent fixtures: PreviewScreen header (top, fixed) — avatar / question label / score / star — and a row of three PART-023 hearts; ProgressBar (9 segments, below header). Workspace centred on the play area: two addend boxes side by side with a big black `+` between them; soft pink `−` button above each box, soft green `+` button below each box; `↺ Reset` pill below workspace; numeric input below Reset. FloatingButton "Next Round" (fixed bottom, primary slot, disabled until ≥1 digit). |
| 5 | Round-Complete feedback (in-place on Game screen) | overlay state on `gameplay` | Input pill flash (green / red), addend-box reveal animation Start → Friendly with green tick badge between, optional shake + addend-reset on wrong — NOT a separate screen, just the `gameplay` screen's terminal state for round N before auto-advance (correct) or retry (wrong-with-lives) or game-over (wrong-last-life). |
| 6 | Game Over | TransitionScreen | Title `"Game Over"`. Subtitle `"You ran out of lives!"`. Sticker `😔`. Audio: `sound_game_over` awaited in `onMounted`. CTAs: `[{ text: 'Try Again', type: 'primary', action: showMotivation }]`. Reachable ONLY when `gameState.lives === 0` after the wrong-feedback chain has fully played (CASE 8). |
| 7 | Victory | TransitionScreen | Title `"Victory 🎉"`. Subtitle game-specific by `gameState.stars`: 3★ → `"Perfect compensation — all 9 first try!"`; 2★ → `"Great work! N of 9 first try."` (where N is `firstTryCorrect`); 1★ → `"You finished — keep practising!"`; 0★ unreachable from Victory (game-over branch fires instead). Stars row from `gameState.stars`. Buttons conditional on `gameState.stars`. |
| 8 | Motivation ("Ready to improve") | TransitionScreen | Reached via Try Again (Game Over) OR Play Again (Victory < 3★). Title `"Ready to improve your score? ⚡"`. Single CTA `"I'm ready! 🙌"` → `restartGame()`. `onMounted` calls `progressBar.update(0, 3)` (restart-path reset to full lives display) AND plays `sound_motivation`. |
| 9 | Stars Collected | TransitionScreen, persist:true, buttons:[] | Title `"Yay! 🎉\nStars collected!"`. Two-line title via `styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }`. `onMounted` plays `sound_stars_collected` (awaited), fires `show_star` postMessage, `setTimeout(~1500)` → `showAnswerCarousel()`. **DOES NOT call `transitionScreen.hide()` in `onMounted`** — stays mounted as the celebration backdrop while AnswerComponent + Next appear over it. Both tear down together on the single-stage Next click. |
| 10 | Answer Carousel | AnswerComponent (PART-051), revealed over Stars Collected backdrop | 9 slides (one per played round); each slide renders the SOLVED view of that round (starting pair → friendly pair → correct sum + strategy statement banner). FloatingButton's `setMode('next')` fires alongside `answerComponent.show(...)`. |

## Round-set cycling logic (canonical reference)

`gameState` carries:
- `setIndex: 0 | 1 | 2` — index into `SETS = ['A', 'B', 'C']`. **Initial value: `0` (Set A on fresh page load only).** `setIndex` persists across in-session restarts.
- `activeRounds: round[]` — the 9 round objects from `fallbackContent.rounds.filter(r => r.set === SETS[setIndex])`. Recomputed inside `resetGameState()` after `setIndex` is set.
- `currentRound: 1..9` — index into `activeRounds` (1-based for display; convert to 0-based for array access).
- `lives: 0..3` — starts at 3, decremented on each wrong submit.
- `score: 0..9` — count of rounds where the student eventually submitted the correct sum. Increments on every correct submit (first-try OR retry).
- `firstTryCorrect: 0..9` — count of rounds solved on the FIRST submit attempt (`attemptsOnThisRound === 0` when correct). Drives the star tier. NOT incremented on correct-on-retry.
- `attemptsOnThisRound: 0..N` — incremented on every wrong submit within the current round; reset to 0 on round-advance (correct OR last-life endGame). NEVER reset inside `resetRoundForRetry()` — that helper KEEPS the counter so a subsequent correct on the same round is NOT counted as first-try.
- `stars: 0..3` — computed by `getStars()` at endGame; see scoring.md.
- `attempts: Attempt[]` — `recordAttempt`-style records pushed on every submit.
- `isProcessing: boolean` — guards re-entry on submit; set TRUE before any await, cleared FALSE inside `resetRoundForRetry()` (wrong path) or inside the next round's `renderRound()` (correct path).
- `addend1Display: int` / `addend2Display: int` — display-only scratchpad state (NOT graded). Reset to `addend1Start` / `addend2Start` on round entry, on Reset tap, and on wrong-submit feedback.

`restartGame()` (called from Motivation's `[I'm ready! 🙌]` button — reachable from Game Over's Try Again OR Victory's Play Again) MUST execute in this order:

1. `gameState.setIndex = (gameState.setIndex + 1) % 3`. **This MUST happen BEFORE `resetGameState()`** so the new round-slice is in place.
2. `resetGameState()` — sets `currentRound = 1`, `lives = 3`, `score = 0`, `stars = 0`, `firstTryCorrect = 0`, `attemptsOnThisRound = 0`, `attempts = []`, `isProcessing = false`; recomputes `activeRounds` from the new `setIndex`; resets `addend1Display` / `addend2Display` to `activeRounds[0].addend1Start` / `addend2Start`. **`setIndex` MUST NOT be in this reset list** — it is bumped in step 1 and must persist.
3. `progressBar.update(0, 3)` — safety-net reset (Motivation's `onMounted` already did this; idempotent).
4. `renderRoundIntro(1)` — paints the Round 1 Intro transition directly. **Skips Preview + Welcome** per the default flow's restart path. The Round Intro auto-advances into `renderRound(1)`.

A 4th play wraps `setIndex` from `2 → 0` (Set C → Set A). Validator `GEN-ROUNDSETS-MIN-3` passes because `rounds.length === 27` and 3 distinct sets exist.

## Lives handling

This game has `totalLives: 3`. Lives decrement once on each wrong submit. **Reset taps and +/- nudges DO NOT cost lives.**

| Trigger | Lives effect |
|---------|--------------|
| Tap "Next Round" with non-empty input → typed value === `round.correct` | No change (correct). |
| Tap "Next Round" with non-empty input → typed value !== `round.correct` AND `lives > 1` | `gameState.lives -= 1`. Heart dims via `progressBar.update(currentRound, lives - 1)` BEFORE await. RETRY-SAME-ROUND fires after audio. |
| Tap "Next Round" with non-empty input → typed value !== `round.correct` AND `lives === 1` | `gameState.lives -= 1` (CASE 8 — wrong feedback completes BEFORE Game Over). Lives reach 0 → `endGame(false)` → `showGameOver()`. |
| Press Enter on input → same logic as Next Round tap | Same. |
| Tap +/- nudge button | NO change. |
| Tap Reset pill | NO change. |

When `gameState.lives === 0` after the decrement, the wrong-feedback chain MUST complete (await SFX → await TTS, CASE 8) BEFORE Game Over renders. `game_complete` is posted before `sound_game_over` plays in the Game Over `onMounted`. The Game Over CTA `Try Again` routes to Motivation, which routes to `restartGame()`.

## Scoring logic (forward reference for scoring.md)

| Trigger | Score effect |
|---------|--------------|
| Round N "Next Round" with typed value === `round.correct` AND `attemptsOnThisRound === 0` | `gameState.score += 1`; `gameState.firstTryCorrect += 1`. |
| Round N "Next Round" with typed value === `round.correct` AND `attemptsOnThisRound > 0` | `gameState.score += 1`. **`firstTryCorrect` is NOT incremented.** |
| Round N "Next Round" with typed value !== `round.correct` (lives remain) | NO score change. `attemptsOnThisRound += 1`. RETRY-SAME-ROUND. |
| Round N "Next Round" with typed value !== `round.correct` (last life) | NO score change. `lives -= 1` → 0 → `endGame(false)`. |

**Star formula (creator-specified — first-try-correct count drives stars):**

```js
function getStars() {
  if (gameState.lives <= 0) return 0;            // game-over branch
  if (gameState.firstTryCorrect >= 9) return 3;  // perfect run
  if (gameState.firstTryCorrect >= 7) return 2;  // 7-8 first-try
  return 1;                                       // finished with 5-6 first-try
}
```

| `firstTryCorrect` (at endGame) | `lives` at end | `stars` | Routed via |
|-------------------------------|----------------|---------|------------|
| 9 | 3 | 3 | Victory |
| 7 or 8 | 1 or 2 | 2 | Victory |
| 5 or 6 | ≥1 | 1 | Victory (structurally rare per Star Generosity Audit) |
| any | 0 (mid-session) | 0 | Game Over |

Default 90/66/33 percentage thresholds DO NOT apply — the spec defines `firstTryCorrect`-driven thresholds. `score` (count of completed rounds) is recorded for the data-contract surface but does NOT drive stars.

## AnswerComponent (PART-051) — stars-collected → carousel chain

**End-of-game chain (multi-round, with Victory + Stars Collected):**

The celebration beat plays FIRST. AnswerComponent appears AFTER. Single-stage Next exits.

1. **Final-round (R9) "Next Round" handler** evaluates correct → either auto-advance from R8 to R9 occurred and R9's submit fires, or R9's wrong-last-life path fires. Either way, after feedback completes, `gameState.score` / `gameState.firstTryCorrect` / `gameState.lives` are finalized and `endGame(success)` is called.
2. **`endGame(success)`** computes `gameState.stars = getStars()`, posts `game_complete` with metrics (`{ score: gameState.score, totalQuestions: 9, stars: gameState.stars, accuracy: gameState.firstTryCorrect / 9 * 100, timeSpent }`). If `gameState.lives === 0` → `showGameOver()`. Otherwise → `showVictory()`.
3. **Victory transition** renders with `title: 'Victory 🎉'`, subtitle per `gameState.stars`, `stars: gameState.stars`, conditional buttons array, `persist: true`. `onMounted` plays `sound_game_victory` (awaited) → `vo_victory_stars_N` VO (awaited).
4. **`Claim Stars` button action calls `showStarsCollected()`** — never `showAnswerCarousel()` directly. (`Play Again` only on <3★ → `showMotivation()`.) **NEVER call `answerComponent.show(...)` from Victory's Claim Stars action — it skips the celebration beat.**
5. **Stars Collected transition** renders with `title: 'Yay! 🎉\nStars collected!'`, `buttons: []`, `persist: true`, `styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }`. `onMounted`: awaits `sound_stars_collected`, fires `show_star` postMessage with `stars: gameState.stars`, then `setTimeout(1500) → showAnswerCarousel()`. **DOES NOT call `transitionScreen.hide()` in `onMounted`** — stays mounted as backdrop. (Memory: `feedback_pause_overlay` — terminal celebration surface persists.)
6. **`showAnswerCarousel()`** calls `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` (9 slides, one per played round; each slide's `render(container)` repaints a SOLVED view of that round using `gameState.activeRounds[i].answer`), THEN `floatingBtn.setMode('next')` and registers `floatingBtn.on('next', ...)`. Carousel and Next button appear OVER the Stars Collected backdrop. **This is the ONLY place `answerComponent.show(...)` is called.**
7. **Single-stage Next exit:** `floatingBtn.on('next', () => { answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*'); })`. The Stars Collected TransitionScreen tears down with the AnswerComponent. Single-stage — NO branching on a `starsCollectedShown` flag, NO two-stage handler.

**Game Over branch (lives = 0 mid-session):** `showGameOver()` renders `transitionScreen.show({ title: 'Game Over', subtitle: 'You ran out of lives!', icons: ['😔'], buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }], persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); } })`. `game_complete` is posted BEFORE `showGameOver()` is called (inside `endGame()`), so the host harness sees metrics regardless of which terminal screen renders. Tap Try Again → Motivation → `restartGame()` (cycles set, resets state, full 3 lives, skips Preview + Welcome). **The AnswerComponent does NOT ship from the Game Over branch; only Victory → Stars Collected → Carousel reveals it.**

**`buildAnswerSlidesForAllRounds()`** returns an array of 9 slide objects, each shaped:

```
{ render(container) { renderAnswerForRound(gameState.activeRounds[i], container); } }
```

`renderAnswerForRound(round, container)` paints, for that round:
- Two starting addend boxes side by side showing `round.answer.addend1Start` and `round.answer.addend2Start` with a faint `→` arrow.
- A second pair of boxes below showing the **friendly values** `round.answer.addend1Friendly` and `round.answer.addend2Friendly`.
- A green tick badge with the **correct sum** `round.answer.correct` below the friendly pair.
- A short strategy statement banner above: e.g. `"58 + 72 = 60 + 70 = 130. Add 2 to one, subtract 2 from the other — the sum stays the same."` sourced from `round.answer.strategyStatement`.
- No +/- buttons, no Reset, no input box, no hearts, no progress bar.

Each `render(container)` is self-contained and uses ONLY `gameState.activeRounds[i].answer` plus DOM utilities — no references to live game-area DOM that may have been destroyed by feedback rendering.

The carousel has 9 slides (one per round). Slide titles: `Round 1`, `Round 2`, …, `Round 9`. Header label stays at default `Correct Answers!`. The component shows the active set's rounds (whichever set was played in the just-finished session — A, B, or C).

## PreviewScreen (PART-039) integration — destroy timing

PreviewScreen is mounted at game-build time as the persistent header (avatar / question label / score / star) and persists through the entire flow. **It is NOT destroyed in `endGame()`.** Destruction happens inside the FloatingButton `'next'` handler AFTER the player taps Next on the AnswerComponent — alongside `answerComponent.destroy()`, `floatingBtn.destroy()`, and the `next_ended` postMessage. The slot wiring is `slots: { previewHeader: true, floatingButton: true }`. The header remains visible on every non-Preview screen (Welcome, Round Intro, Game, Game Over, Victory, Motivation, Stars Collected, Answer Carousel) until the iframe tears down.

## "Next Round" FloatingButton (PART-050) — control rules

- **Component:** `FloatingButtonComponent` (PART-050), instantiated once at game-build time, mounted in `ScreenLayout`'s floating-button slot (`slots: { floatingButton: true }`).
- **Test selector:** `.mathai-fb-btn-primary`.
- **Initial mode:** `floatingBtn.setMode('submit')`. Label: `"Next Round"` (override default 'Submit' label via the component's label-customisation API).
- **Initial submittable state:** `floatingBtn.setSubmittable(false)`.
- **Visibility predicate:** `setSubmittable(input.value.trim().length > 0)` is re-evaluated on every `oninput` event on the numeric input. Re-evaluated on `resetRoundForRetry()` (input cleared → `setSubmittable(false)`). Re-evaluated on round entry (input cleared → `setSubmittable(false)`).
- **Submit handler:** registered ONCE: `floatingBtn.on('submit', async () => { if (gameState.isProcessing) return; await handleSubmit(); })`.
- **Per-round lifecycle:** between rounds (after auto-advance to `renderRound(N+1)`), the input is cleared, `floatingBtn.setSubmittable(false)` is called explicitly to disable the button for the new round. Mode remains `'submit'` until `endGame(...)` chain flips it to `'next'` inside `showAnswerCarousel()`.
- **End-of-game lifecycle:** mode flips to `'next'` ONLY inside `showAnswerCarousel()` AFTER `answerComponent.show(...)` has rendered. **Never inside `endGame()` directly.** `floatingBtn.on('next', ...)` is registered ONCE alongside `setMode('next')`. Tap fires the single-stage exit handler above. **Use `on('next', ...)` for the Next click — NOT `on('submit', ...)` after `setMode('next')`.**
- **Destroy timing:** inside the `on('next', ...)` handler — alongside `answerComponent.destroy()` and `previewScreen.destroy()` and the `next_ended` postMessage. **Never destroyed in `endGame()`.**

## Cross-checks (Step 7)

- ✅ Every screen named in the diagram (Preview, Welcome, Round Intro × 9, Game, Game Over, Victory, Motivation, Stars Collected, Answer Carousel) has a row in the screen inventory and will get a wireframe in screens.md.
- ✅ Every feedback event (preview, welcome, round-intro, round-prompt, +/- nudge tap, Reset tap, type-digit, enter, submit-correct, submit-wrong-with-lives, submit-wrong-last-life, round-transition, last-round-victory, game-over, play-again, try-again, claim-stars, show-answer, tap-next, visibility-hide, visibility-restore, audio-failure) has a FeedbackManager call signature documented and will get a row in feedback.md.
- ✅ Every wrong-answer dispatch (compensation-applied-only-to-addend1, compensation-applied-only-to-addend2, wrong-direction-compensation, arithmetic-error-on-friendly-pair, tens-only-no-ones-add, off-by-ten-place-value-slip, whole-rule-mismatch) has a documented candidate-value table and TTS payload. Misconception tags are pre-computed in each round's `misconception_tags` keyed by candidate integer.
- ✅ Scoring formula matches state changes: `score += 1` on each correct submit (first or retry); `firstTryCorrect += 1` only when `attemptsOnThisRound === 0` AND correct; `stars = getStars()` reads `firstTryCorrect` and `lives` (NOT percentage). 0★ ⇔ Game Over, all other tiers route through Victory + Stars Collected + AnswerComponent.
- ✅ ProgressBar bumps FIRST inside submit handler (memory: `progress_bar_round_complete`) — `progressBar.update(currentRound, lives | lives-1)` precedes any awaited SFX/TTS so the final round shows 9/9 (not 8/9) at Victory time.
- ✅ AnswerComponent reveals AFTER Stars Collected celebration — `answerComponent.show(...)` is called ONLY from `showAnswerCarousel()`, never from `endGame()` or from a Victory `Claim Stars` action that bypasses Stars Collected.
- ✅ Pause overlay = VisibilityTracker's PopupComponent (memory: `feedback_pause_overlay` — never custom-built).
- ✅ PreviewScreen destroy is INSIDE the FloatingButton `'next'` handler AFTER `next_ended` is posted — NEVER in `endGame()`.
- ✅ `setIndex` rotation increments BEFORE `resetGameState()` inside `restartGame()`, and `setIndex` is NOT in `resetGameState()`'s reset list.
- ✅ FloatingButton in `'submit'` mode for "Next Round" (PART-050 mandatory per game-archetypes constraint #8); flips to `'next'` mode ONLY inside `showAnswerCarousel()` AFTER `answerComponent.show(...)`.
- ✅ Next click handler is `on('next', ...)` not `on('submit', ...)` after `setMode('next')` (avoiding the bodmas-blitz 2026-04-23 regression).
- ✅ No `function loadRound() { ... }` declarations (memory: `feedback_window_loadround_shadow` — use `renderRound`).
- ✅ Free-text numeric input uses `type="text" inputmode="numeric" pattern="[0-9]*"` with `font-size: 24px` (Mobile rules #13, #28). Enter key submits (Mobile rule #16). No auto-focus on round entry (Mobile rule #17). `visualViewport` keyboard listener keeps the workspace visible (Mobile rule #14). FeedbackManager overlays remain visible above the keyboard (Mobile rule #15).
- ✅ `rounds.length === 27 === totalRounds (9) × 3 sets`. Every round has a `set` key. Validator `GEN-ROUNDSETS-MIN-3` passes.
- ✅ Build-time invariants: for every round, `addend1Start + addend2Start === addend1Friendly + addend2Friendly === correct`; `Math.abs(addend1Start - addend1Friendly) === Math.abs(addend2Start - addend2Friendly)`.
- ✅ No timer (PART-006 NOT used). `getStars()` reads `firstTryCorrect` + `lives` (no duration). Validator `TIMER-MANDATORY-WHEN-DURATION-VISIBLE` does NOT trip.
- ✅ Retry-same-round on wrong-with-lives: `currentRound` NOT incremented; `resetRoundForRetry()` re-renders the same round; `attemptsOnThisRound` increments to suppress `firstTryCorrect` on subsequent correct.
