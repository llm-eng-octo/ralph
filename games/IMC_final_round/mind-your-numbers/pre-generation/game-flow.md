# Game Flow: Mind Your Numbers

## One-liner

The student studies two worked "flower" clusters whose centres are filled in, infers the single arithmetic rule that turned each cluster's four outer petals into its centre, then types the missing centre on a third cluster and taps **CHECK** to verify their hypothesis — across 3 rounds (Pairs rule → All-four-minus-K rule → Extremes rule), with 3 lives and a per-round countdown timer (60 / 60 / 75 s).

## Shape

**Shape:** Shape 2 Multi-round (3 rounds per session, one full set; restart cycles A → B → C → A).

## Changes from default

- **Per-round timer (PART-006) added inside the gameplay loop.** Timer is created/started on each round entry (after the Round-N intro auto-dismisses) and reset to that round's `timerSeconds` (60 / 60 / 75). Timer expiry routes into the SAME wrong-feedback path as a tapped wrong submit (no separate "time-up" screen). Timer pauses on visibility loss (CASE 14) and resumes on restore (CASE 15).
- **CHECK CTA is the FloatingButton in `'submit'` mode (PART-050)**, anchored fixed-bottom (`.mathai-fb-btn-primary`). Disabled (`floatingBtn.setSubmittable(false)`) until the input has at least one digit, then enabled. Re-evaluated on every `oninput` event.
- **Free-text numeric input (P2)** is the input model — `<input type="text" inputmode="numeric" pattern="[0-9]*">` mounted INSIDE the target cluster's centre circle, replacing the `?` glyph. Enter key submits (Mobile rule #16). No CDN library; Step 4 (Build) runs as `[SUB-AGENT]` per CLAUDE.md routing table.
- **No in-round retry on a wrong answer.** Wrong submits (or timer expiry) record the round as failed, decrement `gameState.lives`, run the wrong-feedback chain (red flash → reveal correct centre in green → SFX → TTS naming the rule), then auto-advance to the next round. There is no "Try again on the same question" — the round closes either way.
- **Game Over branch IS reachable** when `gameState.lives === 0` mid-session (3 wrong submits / timer-expiries). Wrong-feedback for the final-life answer MUST complete (CASE 8) BEFORE Game Over renders.
- **AnswerComponent (PART-051) reveals after Stars Collected** as 3 slides (one per played round); each slide renders a SOLVED, non-interactive view of that round (two worked clusters with centres filled, target cluster with the correct centre in green, rule statement banner above). No input box, no CHECK button, no timer, no lives on the answer slides.
- **Round-set cycling A → B → C → A** on `restartGame()` — `gameState.setIndex` increments BEFORE `resetGameState()` is called inside `restartGame()`, then the round list is re-sliced from `fallbackContent.rounds` filtered by `set === SETS[setIndex]`.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌──────────────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Game (round N)       │
│ 🔊 prev  │        │ 🔊 welc. │        │ (trans.,     │ (after  │ 🔊 round prompt TTS  │
│   audio  │        │    VO    │        │  no buttons) │  sound) │   (fire-and-forget)  │
│(PART-039)│        │          │        │ 🔊 "Round N" │         │ • 2 worked clusters  │
└──────────┘        └──────────┘        └──────────────┘         │ • 1 target w/ ? input│
                                                ▲                │ • Per-round timer    │
                                                │                │   (60/60/75 s)       │
                                                │                │ • CHECK (FloatingBtn │
                                                │                │   submit, disabled   │
                                                │                │   until ≥1 digit)    │
                                                │                └──────────┬───────────┘
                                                │                           │ tap CHECK / Enter
                                                │                           │   OR timer = 0
                                                │                           ▼
                                                │             ┌──────────────────────────────┐
                                                │             │ Feedback (in-place on Game)  │
                                                │             │ ── timer.pause() FIRST ──    │
                                                │             │ CORRECT path:                │
                                                │             │  • input pill green          │
                                                │             │  • centre shows typed value  │
                                                │             │    + green tick              │
                                                │             │  • progressBar.update(N,     │
                                                │             │    lives) [FIRST]            │
                                                │             │  • await sound_correct +     │
                                                │             │    celebrate sticker         │
                                                │             │    (≥1500 ms floor)          │
                                                │             │  • await TTS rule statement  │
                                                │             │ WRONG path (lives remain):   │
                                                │             │  • input pill red flash      │
                                                │             │    (~600 ms)                 │
                                                │             │  • centre reveals correct    │
                                                │             │    value in green tick       │
                                                │             │  • progressBar.update(N,     │
                                                │             │    lives - 1) [FIRST]        │
                                                │             │  • lives -= 1 (heart dims)   │
                                                │             │  • await sound_incorrect +   │
                                                │             │    sad sticker (≥1500 ms)    │
                                                │             │  • await TTS rule + correct  │
                                                │             │    centre (per misconception │
                                                │             │    family if matched)        │
                                                │             │ TIMER-EXPIRY path:           │
                                                │             │  • same as WRONG; TTS        │
                                                │             │    prefixes "Time's up! "    │
                                                │             │ WRONG-LAST-LIFE path (CASE   │
                                                │             │ 8): same as WRONG, then     │
                                                │             │ Game Over after audio       │
                                                │             │ completes.                  │
                                                │             └─────────┬────────────────────┘
                                                │                       │
                              ┌─────────────────┴─────────┬──────────────┼─────────────────┐
                              │                           │                                │
                       wrong AND lives = 0       correct OR wrong-      correct OR wrong-  │
                              │                  with-lives AND more    with-lives AND     │
                              ▼                  rounds                  last round done    │
                   ┌────────────────────┐        (loop to Round N+1     │                   │
                   │ Game Over          │         intro)                 ▼                  │
                   │ (TransitionScreen) │                       ┌────────────────────┐      │
                   │ Title "Game Over"  │                       │ Victory (status)   │      │
                   │ 🔊 sound_game_over │                       │ 0–3★               │      │
                   │ buttons:[Try Again]│                       │ 🔊 sound_game_     │      │
                   └─────────┬──────────┘                       │    victory →       │      │
                             │ tap "Try Again"                  │    vo_victory_     │      │
                             ▼                                  │    stars_N         │      │
                   ┌──────────────────┐                         │ buttons:           │      │
                   │ "Ready to        │                         │  • <3★ → [Play     │      │
                   │  improve your    │                         │    Again, Claim    │      │
                   │  score? ⚡"      │                         │    Stars]          │      │
                   │ (trans., tap)    │                         │  • 3★  → [Claim    │      │
                   │ 🔊 motivation VO │                         │    Stars]          │      │
                   │ [I'm ready! 🙌]  │                         └──────┬─────┬───────┘      │
                   │ onMounted:       │                                │     │              │
                   │  progressBar.    │                  "Play Again"  │     │ "Claim Stars"│
                   │  update(0, 3)    │                  (only if 0-2★)│     │ (always)     │
                   │  (restart-path   │                                ▼     ▼              │
                   │   reset)         │                       ┌────────────────┐  ┌─────────────────────┐
                   └────────┬─────────┘                       │ "Ready to      │  │ "Yay!               │
                            │ tap                             │  improve your  │  │  Stars collected!"  │
                            ▼                                 │  score? ⚡"    │  │ (trans., persist,   │
                   restartGame()                              │ (trans., tap)  │  │  no buttons)        │
                   • setIndex = (setIndex + 1) % 3            │ 🔊 motiv. VO   │  │ onMounted:          │
                   • resetGameState()                         │ [I'm ready! 🙌]│  │  • await sound_     │
                     (lives=3, score=0, currentRound=1,       │ onMounted:     │  │    stars_collected  │
                      activeRounds = filter set)              │  progressBar.  │  │  • postMessage      │
                   • progressBar.update(0, 3)                 │  update(0, 3)  │  │    {type:'show_     │
                   • renderRoundIntro(1) (skips Preview       └───────┬────────┘  │     star',stars}    │
                     and Welcome)                                     │ tap       │  • setTimeout(~1500)│
                                                                      ▼           │    showAnswer       │
                                                              restartGame()       │    Carousel()       │
                                                              (same as above)     └──────────┬──────────┘
                                                                                             │ auto handoff
                                                                                             │ (TS persists
                                                                                             │  as backdrop)
                                                                                             ▼
                                                                                  ┌──────────────────────────┐
                                                                                  │ Correct Answers carousel │
                                                                                  │ (PART-051,                │
                                                                                  │  AnswerComponent)         │
                                                                                  │ • 3 slides (1 per round)  │
                                                                                  │ • each slide: 2 worked +  │
                                                                                  │   target with green       │
                                                                                  │   centre + rule banner    │
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

Retry / branch paths covered:
- **Try Again** after Game Over (lives = 0) — routes through "Ready to improve your score? ⚡" motivation transition → `restartGame()` → restart from Round 1 of the NEXT round-set (A→B→C→A), **skipping Preview + Welcome**.
- **Play Again** after a Victory with fewer than 3★ — routes through the SAME motivation transition → `restartGame()` → restart from Round 1 of the NEXT round-set, **skipping Preview + Welcome**.
- **Claim Stars** after any Victory (0★ included) — routes through "Yay! Stars collected!" → AnswerComponent carousel → Next → exit.

## Stages

| Stage | Round | Rule family | Difficulty | Content description |
|-------|-------|-------------|------------|---------------------|
| Stage 1 | R1 | `pair-sums` | Single binary op, two visible halves | Centre = (top petal + right petal) + (bottom petal + left petal). Outers in [1, 12]; centre in [4, 40]. Both worked-example clusters validate this rule and rule out simpler family members (raw single-pair sums, diagonal pairing). Expected first-attempt solve rate ~80 %. Time budget 60 s. |
| Stage 2 | R2 | `sum-minus-k` | Single op over all four with hidden constant K | Centre = (top + right + bottom + left) − K. K ∈ [1, 6], fixed within the round, varies across sets (Set A K=3, Set B K=5, Set C K=2). Outers in [1, 12]; centre in [4, 44]. Worked examples must rule out raw "sum of all four" and "pair-sums" simultaneously. Expected first-attempt solve rate ~60 %. Time budget 60 s. |
| Stage 3 | R3 | `extremes` | Two-step rule on `max` and `min` of four outers | Set A: centre = max − min. Set B: centre = max + min. Set C: centre = max × min. Outers in [1, 25] (higher ceiling supports the product variant while keeping `max × min ≤ 100`). Centre in [2, 100]. Worked examples must rule out all simpler Stage-1 / Stage-2 family rules. Expected first-attempt solve rate ~45 %. Time budget 75 s (slightly longer because the rule is two-step). |

Notes:
- **Distinct rule families across rounds.** R1 / R2 / R3 each test a different rule family, so a `carry-over-from-previous-round` misconception is meaningfully detectable on R2 and R3 (the previous round's rule yields a wrong number when applied to the current outers).
- **Round-set cycling axis.** The spec ships `rounds.length === 9` (Sets A, B, C × 3 rounds each). Per session, only 3 rounds are active — the slice for `set === SETS[gameState.setIndex]`. First play: Set A. After Try Again / Play Again: Set B. After second Try Again / Play Again: Set C. Fourth play: back to Set A.
- **Stage-3 rule rotates across sets** (A: `max - min`; B: `max + min`; C: `max × min`). Stages 1 and 2 keep the SAME rule family across sets (only outer numbers and K differ). This gives the round-set cycling system three distinct mastery checks at Stage 3 without changing the rule family.

## Screen inventory (forward reference for screens.md)

This game-flow.md enumerates the screens that screens.md MUST wireframe. Every entry below is a required render target — game-building MUST NOT omit one and MUST NOT add an unlisted one.

| # | Screen | data-phase / component | Notes |
|---|--------|------------------------|-------|
| 1 | Preview | `start` (PreviewScreenComponent, PART-039) | `previewInstruction` HTML (4 paragraphs from spec), `previewAudioText` TTS, `showGameOnPreview: false` (rule-induction concept needs the audio/text intro before the game state is shown). Tap Start → Welcome. |
| 2 | Welcome | TransitionScreen | Title `"Welcome to Mind Your Numbers!"`. Subtitle from spec content. Single tap-anywhere advance. Game-specific welcome VO awaited in `onMounted`. → first Round Intro. |
| 3 | Round Intro × 3 (R1, R2, R3) | TransitionScreen, no buttons (CASE 2 Variant A — auto-advancing) | Title `"Round 1"` / `"Round 2"` / `"Round 3"`. Sequential audio: `sound_rounds` SFX awaited → `playDynamicFeedback` "Round N" VO awaited. Then auto-advance to Game (Round N). |
| 4 | Game (Round N) | `gameplay` | Persistent fixtures: PreviewScreen header (top, fixed) with TimerComponent mounted in the centre slot (`#timer-container` inside `.mathai-preview-header-center`), three hearts row (lives), and round counter (`Round N/3`). ProgressBar (below header). Three-flower-cluster play area (Example 1 top-left, Example 2 top-right, Target bottom-centre with input field in centre). FloatingButton CHECK (fixed bottom, primary slot, disabled until ≥1 digit). |
| 5 | Round-Complete feedback (in-place on Game screen) | overlay state on `gameplay` | Input pill flash (green/red), target centre reveal (green tick over correct number), per-cluster animations, optional sticker overlay — NOT a separate screen, just the `gameplay` screen's terminal state for round N before auto-advance. |
| 6 | Game Over | TransitionScreen | Title `"Game Over"`. Subtitle `"You ran out of lives — let's try a fresh set."`. Sticker `STICKER_SAD`. Audio: `sound_game_over` awaited in `onMounted`. CTAs: `[{ text: 'Try Again', type: 'primary', action: showMotivation }]`. Reachable ONLY when `gameState.lives === 0` after the wrong-feedback chain has fully played (CASE 8). |
| 7 | Victory | TransitionScreen | Title `"Victory!"`. Subtitle game-specific (`"You got all 3 rules right!"` for 3★; `"You got 2 of 3 rules!"` for 2★; `"You got 1 rule right!"` for 1★; `"Great work — let's try a fresh set!"` for 0★ post-survival). Stars row from `gameState.stars`. Buttons conditional on `gameState.stars` (see Feedback table). |
| 8 | Motivation ("Ready to improve") | TransitionScreen | Reached via Try Again (Game Over) OR Play Again (Victory < 3★). Title `"Ready to improve your score? ⚡"`. Single CTA `"I'm ready! 🙌"` → `restartGame()`. `onMounted` calls `progressBar.update(0, 3)` (restart-path reset to full lives display). |
| 9 | Stars Collected | TransitionScreen, persist:true, buttons:[] | Title `"Yay!\nStars collected!"`. `onMounted` plays `sound_stars_collected` (awaited), fires `show_star` postMessage, `setTimeout(~1500)` → `showAnswerCarousel()`. Does NOT call `transitionScreen.hide()` in onMounted — stays mounted as the celebration backdrop. |
| 10 | Answer Carousel | AnswerComponent (PART-051), revealed over Stars Collected backdrop | 3 slides (one per played round); each slide renders the SOLVED view of that round (two worked clusters with centres filled, target cluster with the correct centre in green, rule statement banner above). Pool-style affordances are NOT present. FloatingButton's `setMode('next')` fires alongside `answerComponent.show(...)`. |

## Stage table → round-flow mapping

screens.md will draw ONE Game wireframe (the three-flower-cluster topology is identical across all 3 rounds — only the per-cluster numbers and the timer's initial value differ). round-flow.md will document the SAME `renderRound()` function path for all 3 rounds, parameterized by `gameState.currentRound` to:
1. Pick the right round object from the active set's slice (`gameState.activeRounds[currentRound - 1]`).
2. Repaint the three clusters with that round's `example1`, `example2`, and `target` outer values.
3. Reset the input field (cleared, focused via input.blur()/no-auto-focus per Mobile rule #17).
4. Reset and start a fresh TimerComponent with `round.timerSeconds` (60 for R1/R2, 75 for R3).

## Round-set cycling logic (canonical reference)

`gameState` carries:
- `setIndex: 0 | 1 | 2` — index into `SETS = ['A', 'B', 'C']`. Initial value: `0` (Set A on first play).
- `activeRounds: round[]` — the 3 round objects from `fallbackContent.rounds.filter(r => r.set === SETS[setIndex])`. Recomputed inside `resetGameState()` after `setIndex` is set.
- `currentRound: 1 | 2 | 3` — index into `activeRounds` (1-based for display; convert to 0-based for array access).
- `lives: 0..3` — starts at 3, decremented on each wrong submit OR timer expiry.
- `score: 0..3` — count of first-CHECK passes in this session.
- `stars: 0..3` — `score` itself (1:1 mapping; see Scoring section).
- `attempts: Attempt[]` — `recordAttempt`-style records pushed on every submit / timer-expiry.
- `isProcessing: boolean` — guards re-entry on submit / timer-expiry; set TRUE before any await, cleared FALSE before next round renders.
- `timerInstance: TimerComponent | null` — the live PART-006 instance for the current round; recreated each round.

`restartGame()` (called from Motivation's `[I'm ready! 🙌]` button — reachable from Game Over's Try Again OR Victory's Play Again) MUST execute in this order:
1. `gameState.setIndex = (gameState.setIndex + 1) % 3`. **This MUST happen BEFORE `resetGameState()`** so the new round-slice is in place.
2. `resetGameState()` — sets `currentRound = 1`, `lives = 3`, `score = 0`, `stars = 0`, `attempts = []`, `isProcessing = false`; recomputes `activeRounds` from the new `setIndex`; tears down any leftover `timerInstance` (nulls it).
3. `progressBar.update(0, 3)` — safety-net reset (Motivation's `onMounted` already did this; idempotent).
4. `renderRoundIntro(1)` — paints the Round 1 Intro transition directly. **Skips Preview + Welcome** per the default flow's restart path. The Round Intro auto-advances into `renderRound(1)`.

A 4th play wraps `setIndex` from `2 → 0` (Set C → Set A). Validator `GEN-ROUNDSETS-MIN-3` passes because `rounds.length === 9` and 3 distinct sets exist.

## Lives handling

This game has `totalLives: 3`. Lives decrement once per round on any wrong outcome (wrong submit OR timer expiry — never both for the same round, because the timer-expiry handler runs the wrong-feedback path with `isProcessing` guarded so a late tap is ignored, and the submit handler pauses the timer before evaluating).

| Trigger | Lives effect |
|---------|--------------|
| Tap CHECK with non-empty input → typed value === `round.correct` | No change (correct). |
| Tap CHECK with non-empty input → typed value !== `round.correct` | `gameState.lives -= 1`. Heart dims via `progressBar.update(currentRound, lives - 1)` BEFORE await. |
| Press Enter on input → same logic as CHECK tap | Same. |
| Timer reaches 0 (60 / 60 / 75 s budget exhausted) | `gameState.lives -= 1`. TTS prefixes `"Time's up! "` to the rule statement. CHECK button is disabled by the timer-expiry handler so a late tap is ignored. |

When `gameState.lives === 0` after the decrement, the wrong-feedback chain MUST complete (await SFX → await TTS, CASE 8) BEFORE Game Over renders. `game_complete` is posted before `sound_game_over` plays in the Game Over `onMounted`. The Game Over CTA `Try Again` routes to Motivation, which routes to `restartGame()`.

## Scoring logic (forward reference for scoring.md)

| Trigger | Score effect |
|---------|--------------|
| Round N CHECK with typed value === `round.correct` | `gameState.score += 1` (first and only CHECK per round; max +1 per round) |
| Round N CHECK with typed value !== `round.correct` | no score change (round forfeited; advance to next round) |
| Round N timer expiry | no score change (round forfeited; advance to next round) |

**Star mapping (1:1 with score, NOT percentage-based):**

```js
function getStars() {
  if (gameState.lives <= 0 && gameState.score === 0) return 0;  // game-over with no correct answers
  return gameState.score; // 0..3 maps directly to stars 0..3
}
```

| `gameState.score` | `gameState.stars` | Routed via | Victory subtitle |
|-------------------|-------------------|------------|------------------|
| 3 (lives ≥ 1) | 3 | Victory | `"You got all 3 rules right!"` |
| 2 (lives ≥ 1) | 2 | Victory | `"You got 2 of 3 rules!"` |
| 1 (lives ≥ 1) | 1 | Victory | `"You got 1 rule right!"` |
| 0 (lives ≥ 1, finished session) | 0 | Victory | `"Great work — let's try a fresh set!"` |
| 0 (lives = 0 mid-session) | 0 | Game Over | n/a (Game Over has its own subtitle) |
| 1 (lives = 0 — impossible: only 3 wrong = 0 lives, so score ≥ 1 ⇒ ≤ 2 wrong ⇒ lives ≥ 1) | n/a | Victory | n/a |

The default 90/66/33 percentage thresholds DO NOT apply — the spec defines explicit per-count star mapping. scoring.md will repeat this table.

Note: a student who finishes all 3 rounds with `lives ≥ 1` and `score === 0` (which requires 1 or 2 wrong submits + 0 correct, i.e. `lives === 1` or `lives === 2`) routes through Victory with 0★. The AnswerComponent ships either way (Victory → Stars Collected → Carousel, even at 0★).

## TimerComponent (PART-006) integration

**Mandatory because:** the spec mentions a per-round time pressure AND the visible header timer drives player-visible state (life loss on expiry). Validator rule `TIMER-MANDATORY-WHEN-DURATION-VISIBLE` is satisfied.

**Mount point:** inside the PreviewScreen header's centre slot — `#timer-container` mounted INSIDE `.mathai-preview-header-center` **visibly** (not hidden). Per memory `timer_preview_integration`: TimerComponent's default `320 × 41` inline styles MUST be overridden to fit the header centre slot; `#previewTimerText` (the empty label slot) MUST be hidden. PreviewScreen does NOT mirror the timerInstance — the TimerComponent is the source of truth.

**Per-round lifecycle:**
1. **Round entry** (after Round-N intro auto-dismisses, inside `renderRound()`):
   - Tear down any leftover `gameState.timerInstance` (`timerInstance.destroy()` if present, then `null`).
   - Construct a NEW `TimerComponent({ duration: round.timerSeconds, mode: 'countdown', container: '#timer-container', onExpire: handleTimerExpiry })`. `duration` is 60 for R1, 60 for R2, 75 for R3 — read from `gameState.activeRounds[currentRound - 1].timerSeconds`.
   - Override the component's inline styles (`width: 100%`, `height: 100%`, neutral color); hide `#previewTimerText`.
   - Call `timerInstance.start()`.
2. **Submit (CHECK tap or Enter)**: `handleCheck()` calls `timerInstance.pause()` BEFORE evaluating, so the timer doesn't tick during the awaited feedback chain.
3. **Timer expiry**: `handleTimerExpiry()` calls `timerInstance.pause()` (defensive — the component already stopped at 0), disables the CHECK button (`floatingBtn.setSubmittable(false)` + `gameState.isProcessing = true`), then runs the wrong-feedback path identically to a tapped wrong submit — except the TTS payload prefixes `"Time's up! "` to `<round.ruleStatement>`. Lives decrement once.
4. **Visibility hidden (CASE 14)**: `timerInstance.pause()` (PART-006 handles this internally via VisibilityTracker; the game does not need to call pause manually). All audio pauses. **VisibilityTracker's built-in PopupComponent** renders the pause overlay automatically (memory: `feedback_pause_overlay` — never custom-build a pause overlay div).
5. **Visibility restored (CASE 15)**: `timerInstance.resume()` (handled by VisibilityTracker). Audio resumes. VisibilityTracker dismisses its own popup.
6. **Round end** (correct, wrong, or expiry — all paths converge): Inside the auto-advance handler (after wrong/correct feedback completes), `timerInstance.destroy()` is called to release the component before the next round constructs a fresh one. `gameState.timerInstance = null`.

**Per-round `timerSeconds` source:** read directly from each round object (`round.timerSeconds === 60 | 75`). The spec defines this per round, NOT as a global constant; the build step MUST read it from the round payload, not hardcode it.

## AnswerComponent (PART-051) — stars-collected → carousel chain

**End-of-game chain (multi-round, with Victory + Stars Collected):**

The celebration beat plays FIRST. AnswerComponent appears AFTER. Single-stage Next exits.

1. **Final round CHECK / timer-expiry handler** evaluates → either correct or wrong. Either way, `gameState.score` is finalized and `endGame(success)` is called.
2. **`endGame(success)`** computes `gameState.stars = getStars()`, posts `game_complete` with metrics (`{ score: gameState.score, totalQuestions: 3, stars: gameState.stars, accuracy: gameState.score / 3 * 100, timeSpent }`). If `success === false && gameState.lives === 0` → `showGameOver()`. Otherwise → `showVictory()`.
3. **Victory transition** renders with `title: 'Victory!'`, subtitle per `gameState.stars`, `stars: gameState.stars`, conditional buttons array. `persist: true`. `onMounted` plays `sound_game_victory` (awaited) → `vo_victory_stars_N` VO (awaited).
4. **`Claim Stars` button action calls `showStarsCollected()`** — never `showAnswerCarousel()` directly. (`Play Again` only on <3★ → `showMotivation()`.)
5. **Stars Collected transition** renders with `title: 'Yay!\nStars collected!'`, `buttons: []`, `persist: true`, `styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }`. `onMounted`: awaits `sound_stars_collected`, fires `show_star` postMessage, then `setTimeout(1500) → showAnswerCarousel()`. **Does NOT call `transitionScreen.hide()` in onMounted** — stays mounted as backdrop.
6. **`showAnswerCarousel()`** calls `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` (3 slides, one per played round; each slide's `render(container)` repaints a SOLVED three-flower-cluster view of that round using `gameState.activeRounds[i].answer`), THEN `floatingBtn.setMode('next')` and registers `floatingBtn.on('next', ...)`. Carousel and Next button appear OVER the Stars Collected backdrop.
7. **Single-stage Next exit:** `floatingBtn.on('next', () => { answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*'); })`. The Stars Collected TransitionScreen tears down with the AnswerComponent (or remains until iframe destruction — runtime indistinguishable). The harness's `next_ended` listener picks up the signal.

**Game Over branch (lives = 0 mid-session):** `showGameOver()` renders `transitionScreen.show({ title: 'Game Over', subtitle: "You ran out of lives — let's try a fresh set.", stars: 0, buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }], persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); } })`. `game_complete` is posted BEFORE `showGameOver()` is called (inside `endGame()`), so the host harness sees metrics regardless of which terminal screen renders. Tap Try Again → Motivation → `restartGame()` (cycles set, resets state, full 3 lives, skips Preview + Welcome). The AnswerComponent does NOT ship from the Game Over branch; only Victory → Stars Collected → Carousel reveals it.

**`buildAnswerSlidesForAllRounds()`** returns an array of 3 slide objects, each shaped:

```js
{ render(container) { renderAnswerForRound(gameState.activeRounds[i], container); } }
```

`renderAnswerForRound(round, container)` paints, for that round:
- The two worked clusters (top-left and top-right) with their centres already filled (using `round.answer.example1` and `round.answer.example2`).
- The target cluster (bottom-centre) with the **correct** centre value rendered in green inside the centre circle (`round.answer.target.centre`).
- A short rule statement banner above the clusters (e.g. "Rule: Add the top pair, add the bottom pair, then add those two sums.") sourced from `round.answer.ruleStatement`.
- No input box, no CHECK button, no timer, no lives.

Each `render(container)` is self-contained and uses ONLY `gameState.activeRounds[i].answer` plus DOM utilities — no references to live game-area DOM that may have been destroyed by feedback rendering.

The carousel has 3 slides (one per round). Slide titles per spec: `Round 1 — Pairs rule`, `Round 2 — All-four rule`, `Round 3 — Extremes rule`. The header label stays at the default `Correct Answers!`.

## Three-flower-cluster layout

The play area has THREE flower clusters arranged in a triangle on a 375×667 mobile portrait viewport. Each cluster is geometrically identical: a centre circle plus 4 outer petals at 12 / 3 / 6 / 9 o'clock around it. Only the contents (numbers, the input field on the target's centre) differ across clusters.

**Three-cluster arrangement on the play area** (375 × ~430 px play-area region between header and FloatingButton):

```
┌────────────────────────────────── play area ───────────────────────────────────┐
│                                                                                │
│   ┌──── Example 1 ─────┐               ┌──── Example 2 ─────┐                 │
│   │       (top)        │               │       (top)        │                 │
│   │  (left)  (right)   │               │  (left)  (right)   │                 │
│   │      [centre]      │               │      [centre]      │                 │
│   │      (bottom)      │               │      (bottom)      │                 │
│   └────────────────────┘               └────────────────────┘                 │
│                                                                                │
│                       ┌──── Target ────────┐                                  │
│                       │       (top)        │                                  │
│                       │  (left)  (right)   │                                  │
│                       │  [ ? input ]       │  ← input field replaces "?"     │
│                       │      (bottom)      │                                  │
│                       └────────────────────┘                                  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Per-cluster geometry (single cluster, ~140 × 140 px bounding box):**

- **Centre circle**: 56 × 56 px at the cluster's geometric centre. Background: white with a 2 px border (round-1 / round-2 / round-3 use distinct accent border colours). Inner content: a single text glyph or a single `<input>`.
- **Top petal (12 o'clock)**: ~36 × 36 px circle, centred horizontally above the centre, ~50 px above the centre's vertical centre.
- **Right petal (3 o'clock)**: ~36 × 36 px circle, centred vertically on the centre's horizontal axis, ~50 px to the right.
- **Bottom petal (6 o'clock)**: ~36 × 36 px circle, centred horizontally below the centre, ~50 px below.
- **Left petal (9 o'clock)**: ~36 × 36 px circle, centred vertically, ~50 px to the left.

Each petal renders a single small whole number (1-12 typically; up to 25 for Round 3). Petal background is a soft pastel; the centre's background colour distinguishes the role:
- **Worked-example centres**: filled background (e.g. light teal) with the worked centre number drawn in a bold sans-serif. Tappable — but no-op (cosmetic only on worked clusters).
- **Target centre**: white background with a `?` glyph initially. Becomes editable on tap (see DOM structure below).

**DOM structure (per-cluster):**

```
<div class="myn-cluster" data-role="example1|example2|target" data-cluster-id="...">
  <div class="myn-petal myn-petal-top">    <span class="myn-petal-num">{outers.top}</span>    </div>
  <div class="myn-petal myn-petal-right">  <span class="myn-petal-num">{outers.right}</span>  </div>
  <div class="myn-petal myn-petal-bottom"> <span class="myn-petal-num">{outers.bottom}</span> </div>
  <div class="myn-petal myn-petal-left">   <span class="myn-petal-num">{outers.left}</span>   </div>
  <div class="myn-cluster-centre" data-state="filled|empty|input|correct|wrong">
    <!-- Worked example: filled with centre number -->
    <span class="myn-centre-num">{centre}</span>
    <!-- Target initial: empty with ? placeholder -->
    <span class="myn-centre-placeholder">?</span>
    <!-- Target tapped: free-text numeric input replaces the ? -->
    <input class="myn-centre-input"
           type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3"
           autocomplete="off" autocorrect="off" autocapitalize="off"
           style="font-size: 16px;" />
    <!-- Target post-correct: green tick + typed value -->
    <span class="myn-centre-num myn-centre-correct">{typed value}</span>
    <span class="myn-centre-tick">✓</span>
    <!-- Target post-wrong (reveal): green tick + correct value (NOT typed value) -->
    <span class="myn-centre-num myn-centre-correct">{round.correct}</span>
    <span class="myn-centre-tick">✓</span>
  </div>
</div>
```

**Target cluster — input field replaces the centre `?` glyph:**

1. **Initial state** (`data-state="empty"`): The centre circle shows the `?` placeholder. The `<input>` element exists in the DOM but is hidden (`display: none`) so the keyboard doesn't auto-pop on render (per Mobile rule #17 — do NOT auto-focus the input on round entry).
2. **First tap on the centre** (or anywhere on the target cluster's centre region): The `?` placeholder is hidden; the `<input>` is shown (`display: block`); `input.focus()` is called to bring up the system numeric keypad. `data-state="input"`.
3. **Typing**: `oninput` listener strips non-digit characters (defensive; `inputmode="numeric"` already filters most). After stripping, calls `floatingBtn.setSubmittable(input.value.length > 0)`. The visible input value is the typed number, rendered in the centre at `font-size: 16px` (Mobile rule #28 — Safari auto-zoom prevention).
4. **Enter key**: `onkeydown` listener for `event.key === 'Enter'` calls `handleCheck()` directly (Mobile rule #16 — Enter MUST submit).
5. **CHECK tap (correct)**: `data-state="correct"`. The `<input>` is hidden; the typed value renders as `<span class="myn-centre-num myn-centre-correct">` with a green tick badge overlay. Centre background turns light green.
6. **CHECK tap (wrong)** OR **timer expiry**: First a ~600 ms red flash on the input pill (`data-state="wrong"` with a CSS keyframe animation). Then `data-state="reveal"`: the `<input>` is hidden; the **correct** value (NOT the typed value) renders as `<span class="myn-centre-num myn-centre-correct">` with a green tick. Centre background turns light green. The student SEES the answer they should have typed.

**Target cluster — keyboard-open viewport mitigation:**

Per Mobile rule #14, the build step adds a `visualViewport` listener that scrolls the target cluster into view when the keyboard opens, so the student can see the cluster + input while typing. The FeedbackManager overlays MUST remain visible above the keyboard (Mobile rule #15) — the build step verifies this on cheap-Android viewport during Step 8 visual review.

**Cluster positions on the play area (CSS Grid or absolute positioning):**

- **Example 1**: top-left of the play area, ~12 px from the top edge, ~16 px from the left edge.
- **Example 2**: top-right, ~12 px from the top, ~16 px from the right (mirrors Example 1).
- **Target**: bottom-centre, horizontally centred, ~24 px above the FloatingButton's reserved bottom area.

Each cluster has a small text label below it: `"Example 1"`, `"Example 2"`, `"Your turn"` (the target). Labels are read by the round-prompt TTS implicitly (the TTS doesn't enumerate them — it just describes the rule-induction task).

## Feedback patterns per outcome (forward reference for feedback.md)

The build step uses these patterns verbatim. Every entry maps a player-visible event to a FeedbackManager / DOM action. The wrong-answer evaluator dispatches by `round.ruleFamily` to compute candidate misconception values; the matching named tag is recorded in `recordAttempt`.

| Event | Trigger | Action |
|-------|---------|--------|
| **Tap target's centre** (initial) | Click / tap on target cluster's centre region with `data-state="empty"` | Hide `?` placeholder, show `<input>` (`display: block`), call `input.focus()` to bring up the numeric keypad. Set `data-state="input"`. No SFX (avoid keypress chatter). |
| **Type a digit** | `oninput` on target's `<input>` | Strip non-digit chars defensively. Re-evaluate `floatingBtn.setSubmittable(input.value.length > 0)`. No SFX, no sticker, no TTS. |
| **Press Enter on input** | `onkeydown` with `event.key === 'Enter'` | Same as tapping CHECK. Mobile rule #16 — Enter MUST submit. |
| **Tap CHECK / Enter with non-empty input → CORRECT** (typed value === `round.correct`) | `floatingBtn.on('submit', ...)` evaluator: `Number(input.value.trim()) === round.correct` | 1) `gameState.isProcessing = true`; 2) `timerInstance.pause()`; 3) Set target's `data-state="correct"`; render typed value with green tick; 4) **`progressBar.update(currentRound, gameState.lives)` FIRST** (memory: `progress_bar_round_complete` — must precede any `await` so the bar bumps before SFX/TTS); 5) `gameState.score += 1`; 6) Push attempt with `is_correct: true`, `misconception_tags: []`, `value: input.value.trim()`; 7) `await FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE, minDuration: 1500 })` (CASE 4 single-step); 8) `await FeedbackManager.playDynamicFeedback({ feedback_type: 'correct', audio_content: round.ruleStatement, subtitle: round.ruleStatement, sticker: STICKER_CELEBRATE })`; 9) Tear down `timerInstance`; 10) Auto-advance: if `currentRound < 3` → `currentRound += 1; renderRoundIntro(currentRound);` else `endGame(true)`. |
| **Tap CHECK / Enter with non-empty input → WRONG (lives remain)** (typed value !== `round.correct` AND `gameState.lives > 1`) | Same evaluator returns `false`; `gameState.lives - 1 > 0` | 1) `gameState.isProcessing = true`; 2) `timerInstance.pause()`; 3) Set target's `data-state="wrong"`; flash input pill red ~600 ms (`await new Promise(r => setTimeout(r, 600))`); 4) Set target's `data-state="reveal"`; render `round.correct` value with green tick (so student SEES the right number); 5) **`progressBar.update(currentRound, gameState.lives - 1)` FIRST** (decrements heart visually); 6) `gameState.lives -= 1`; 7) Resolve misconception via `resolveMisconception(round, typedValue)` (dispatch table by `round.ruleFamily` — see "Wrong-answer evaluator" section below); 8) Push attempt with `is_correct: false`, `misconception_tags: [resolvedTag]`, `value: input.value.trim()`; 9) `await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD, minDuration: 1500 })` (CASE 7); 10) `await FeedbackManager.playDynamicFeedback({ feedback_type: 'incorrect', audio_content: round.ruleStatement + ' The centre is ' + round.correct + '.', subtitle: <same>, sticker: STICKER_SAD })`; 11) Tear down `timerInstance`; 12) Auto-advance: if `currentRound < 3` → `currentRound += 1; renderRoundIntro(currentRound);` else `endGame(false)`. **No retry within round.** |
| **Tap CHECK / Enter with non-empty input → WRONG (last life)** (typed value !== `round.correct` AND `gameState.lives === 1`) | Same evaluator returns `false`; `gameState.lives - 1 === 0` | Same as WRONG-with-lives steps 1–11 (CASE 8 — wrong feedback MUST play before game-over). Then step 12: `endGame(false)` → because `gameState.lives === 0`, routes to `showGameOver()`. |
| **Timer expiry** (timerInstance reaches 0) | `onExpire` callback fires inside TimerComponent | Same as the corresponding wrong path (lives remain OR last life), with TWO differences: (a) `input.value` may be empty — treat empty as a wrong answer (the typed value used in `recordAttempt` is `input.value.trim()` which may be `""`); (b) the TTS payload prefixes `"Time's up! "` to `round.ruleStatement` — `audio_content: "Time's up! " + round.ruleStatement + " The centre is " + round.correct + "."`. CHECK button is disabled (`floatingBtn.setSubmittable(false)`) so a late tap is ignored. Misconception tag for empty input is `whole-rule-mismatch`. |
| **Round transition** (auto-advance to Round N+1 intro) | Called from previous round's CHECK / timer-expiry handler when `currentRound < 3` | TransitionScreen with `title: "Round " + N`, `buttons: []` (CASE 2 Variant A — auto-advancing). `onMounted`: `await FeedbackManager.sound.play('sound_rounds', { sticker: STICKER_NEUTRAL })` → `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round ' + N, subtitle: 'Round ' + N })`. After both audio steps complete: `transitionScreen.hide(); renderRound(N);`. Inside `renderRound(N)`: clear input, repaint clusters, construct fresh `timerInstance`, start it. |
| **Round prompt TTS** (round-start, fire-and-forget) | Inside `renderRound(N)`, after the play area paints | `FeedbackManager.playDynamicFeedback({ audio_content: 'Study the two examples and figure out the rule. Type the missing centre.', subtitle: 'Study the two examples and figure out the rule. Type the missing centre.' }).catch(()=>{})` — fire-and-forget (CASE 3) so the student can read the examples and start typing immediately. |
| **Last round complete → Victory** (`endGame(success)` called from R3 with `gameState.lives > 0`) | Final round CHECK / timer-expiry handler converges on `endGame(...)` after feedback completes | 1) Compute `gameState.stars = getStars()`; 2) Send `game_complete` postMessage with metrics (`{ score, totalQuestions: 3, stars, accuracy: stars/3*100, timeSpent }`); 3) `transitionScreen.show({ title: 'Victory!', subtitle: <per-stars>, stars: gameState.stars, buttons: <per-stars>, persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE }); await FeedbackManager.playDynamicFeedback({ audio_content: <subtitle>, subtitle: <subtitle>, sticker: STICKER_CELEBRATE }); } })`; 4) `buttons` is `[{ text: 'Play Again', type: 'secondary', action: showMotivation }, { text: 'Claim Stars', type: 'primary', action: showStarsCollected }]` if `stars < 3`, else `[{ text: 'Claim Stars', type: 'primary', action: showStarsCollected }]`. CASE 11. |
| **Game Over (lives = 0 mid-session)** (`endGame(false)` with `gameState.lives === 0`) | Wrong-feedback chain has already completed (CASE 8) | 1) Compute `gameState.stars = 0`; 2) Send `game_complete` postMessage with metrics; 3) `transitionScreen.show({ title: 'Game Over', subtitle: "You ran out of lives — let's try a fresh set.", stars: 0, buttons: [{ text: 'Try Again', type: 'primary', action: showMotivation }], persist: true, onMounted: async () => { await FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD }); } })`. CASE 8. |
| **Tap Play Again** (Victory, 0–2★) OR **Tap Try Again** (Game Over) | TransitionScreen primary/secondary button | Routes to `showMotivation()`: `transitionScreen.show({ title: "Ready to improve your score? ⚡", buttons: [{ text: "I'm ready! 🙌", type: 'primary', action: restartGame }], persist: true, onMounted: async () => { progressBar.update(0, 3); await FeedbackManager.sound.play('sound_motivation', { sticker: STICKER_MOTIVATE }); } })`. Tap CTA → `restartGame()` (cycles set, resets state to lives=3 / score=0 / currentRound=1, skips Preview + Welcome). |
| **Tap Claim Stars** (Victory) | TransitionScreen `Claim Stars` button | Routes to `showStarsCollected()`: `transitionScreen.show({ title: 'Yay!\nStars collected!', buttons: [], persist: true, styles: { title: { whiteSpace: 'pre-line', lineHeight: '1.3' } }, onMounted: async () => { await FeedbackManager.sound.play('sound_stars_collected', { sticker: STICKER_CELEBRATE }); window.parent.postMessage({ type: 'show_star', stars: gameState.stars }, '*'); setTimeout(() => showAnswerCarousel(), 1500); } })`. **Does NOT call `transitionScreen.hide()` in `onMounted`** (memory: `feedback_pause_overlay` — terminal celebration surface persists as backdrop). |
| **Show Answer Carousel** | `showAnswerCarousel()` fires from Stars Collected `onMounted`'s `setTimeout` | `answerComponent.show({ slides: buildAnswerSlidesForAllRounds() })` — 3 slides, one per round, each `{ render(container) { renderAnswerForRound(gameState.activeRounds[i], container); } }`. Then `floatingBtn.setMode('next')`. AnswerComponent appears OVER the still-mounted Stars Collected backdrop. |
| **Tap Next** (FloatingButton 'next' mode, after Answer Carousel revealed) | `floatingBtn.on('next', () => { ... })` | Single-stage exit (memory: AnswerComponent end-game chain is single-stage): `answerComponent.destroy(); previewScreen.destroy(); floatingBtn.destroy(); window.parent.postMessage({ type: 'next_ended' }, '*');`. Iframe tears down. |
| **Visibility hidden / tab switch (CASE 14)** | Browser `visibilitychange` event with `document.hidden === true` | `timerInstance.pause()` (PART-006 internal). FeedbackManager pauses any in-flight audio. **VisibilityTracker's built-in PopupComponent renders the pause overlay automatically** (memory: `feedback_pause_overlay` — never custom-build a pause overlay div). Customize ONLY via VisibilityTracker's `popupProps` if needed. |
| **Visibility restored (CASE 15)** | `visibilitychange` with `document.hidden === false` | `timerInstance.resume()` (PART-006 internal). FeedbackManager resumes audio. VisibilityTracker dismisses its own popup. Gameplay continues. |
| **Audio failure (CASE 16)** | Any `FeedbackManager.sound.play(...)` or `playDynamicFeedback(...)` throws | All audio calls are try/catch wrapped (or `.catch(()=>{})` on fire-and-forget). Visual feedback (red flash, reveal, green tick, heart dim) renders regardless. Game advances normally. |

## Feedback per answer type (wrong-answer evaluator dispatch)

The wrong-answer evaluator computes candidate values for each named misconception family and matches the student's submitted value (`Number(input.value.trim())`, or `NaN` if empty) against the set. The first match wins; on no match, `whole-rule-mismatch` is recorded. Dispatch is by `round.ruleFamily`:

### `ruleFamily === 'pair-sums'` (Round 1, all sets)

Correct rule: `centre = (top + right) + (bottom + left)`.

| Misconception tag | Candidate value (computed from `target.outers`) | When it matches |
|-------------------|------------------------------------------------|-----------------|
| `wrong-pairing-diagonal-vs-row` | `(top + bottom) + (right + left)` (vertical / horizontal axes) | typed === this candidate. Note: this often equals the correct sum (commutativity); only matches when the student's typed value differs from the correct centre (e.g. they computed `top + bottom` and stopped — see below). |
| `partial-sum-missing-one-outer` | Any of: `top + right + bottom`, `top + right + left`, `top + bottom + left`, `right + bottom + left` (4 candidates) | typed matches any of the 4 partial sums. |
| `sum-instead-of-product` | `top × right × bottom × left` | typed === this candidate (rare on R1 but tracked for taxonomy completeness). |
| `whole-rule-mismatch` | (no candidate) | typed matches none of the above and !== `round.correct`. Default fallback. |

TTS payload: `round.ruleStatement + ' The centre is ' + round.correct + '.'` (e.g. *"Add the top pair, add the bottom pair, then add those two sums. The centre is 22."*). The misconception family does NOT change the TTS — the TTS always names the correct rule (per spec: wrong-feedback content reveals the rule + the correct centre regardless of which misconception was matched).

### `ruleFamily === 'sum-minus-k'` (Round 2, all sets)

Correct rule: `centre = (top + right + bottom + left) - K`, where `K` is round-specific (3 for Set A, 5 for Set B, 2 for Set C).

| Misconception tag | Candidate value | When it matches |
|-------------------|-----------------|-----------------|
| `partial-sum-missing-one-outer` | Each of the 4 three-outer sums minus K (4 candidates) — covers "partial sum then subtracted K" | typed matches any. |
| `partial-sum-missing-one-outer` (variant) | Each of the 4 three-outer sums (without subtracting K) — covers "partial sum, forgot K" | typed matches any. |
| `carry-over-from-previous-round` | `(top + right) + (bottom + left)` — the R1 pair-sums rule applied to R2's outers | typed === this candidate. |
| `sum-instead-of-product` | `top × right × bottom × left` | typed === this candidate. |
| `whole-rule-mismatch` | (no candidate) | typed matches none. Includes "raw sum forgot K" if the raw sum doesn't equal `round.correct` (which it won't, by construction). |

TTS: `round.ruleStatement + ' The centre is ' + round.correct + '.'` (e.g. *"Add all four petals, then subtract 3. The centre is 24."*).

### `ruleFamily === 'extremes'` (Round 3, all sets)

Correct rule depends on set: Set A `max - min`, Set B `max + min`, Set C `max × min`.

| Misconception tag | Candidate value | When it matches |
|-------------------|-----------------|-----------------|
| `first-minus-second-instead-of-max-minus-min` | `top - right` AND/OR `top - bottom` (2 candidates — Set A only; for Set B/C, "first − second" is not the family-named misconception but still tracked under this tag) | typed === any (Set A); tracked-but-rare for Set B/C. |
| `sum-instead-of-product` | `top + right + bottom + left` (the raw sum — student summed all four when the rule was multiply-extremes, especially Set C) | typed === this candidate. |
| `carry-over-from-previous-round` | `(top + right + bottom + left) - K` for K ∈ [1, 6] (the R2 sum-minus-K family applied with any reasonable K) | typed matches any K-shifted raw sum. |
| `partial-sum-missing-one-outer` | Each of the 4 three-outer sums | typed matches any. |
| `whole-rule-mismatch` | (no candidate) | typed matches none. Default fallback. |

TTS:
- Set A: *"Find the largest petal, find the smallest, and subtract the smallest from the largest. The centre is 14."*
- Set B: *"Find the largest petal, find the smallest, and add them together. The centre is 18."*
- Set C: *"Find the largest petal, find the smallest, and multiply them together. The centre is 27."*

### Timer-expiry path (any ruleFamily)

When the timer reaches 0 with `input.value` empty, the typed value is `""` and `Number("") === 0`. The evaluator runs against the same dispatch table; the matching tag is almost always `whole-rule-mismatch` (since 0 rarely matches any candidate by coincidence). The TTS prefixes `"Time's up! "` to the rule statement, regardless of the matched tag. Lives decrement once.

When the timer reaches 0 with a non-empty `input.value`, the typed value is processed identically to a tapped submit — the evaluator runs the dispatch table, the matching tag is recorded, the TTS prefixes `"Time's up! "` to the rule + correct-centre statement.

### Generic-wrong (no misconception match)

When the typed value matches NONE of the family-specific candidates, `whole-rule-mismatch` is recorded. The TTS payload is unchanged — it still names the round's correct rule and the correct centre. The student receives the same instructional content; only the `recordAttempt.misconception_tags[0]` field differs (`whole-rule-mismatch` vs a specific named tag), which feeds the gauge / signal-collector phase for content-author feedback.

## CHECK button (FloatingButton, PART-050) — control rules

- **Component:** `FloatingButtonComponent` (PART-050), instantiated once at game-build time, mounted in `ScreenLayout`'s floating-button slot (`slots: { floatingButton: true }`).
- **Test selector:** `.mathai-fb-btn-primary`.
- **Initial mode:** `floatingBtn.setMode('submit')`. Label: `"CHECK"` (override default 'Submit' label via `floatingBtn.setLabel('CHECK')` if API supports, else customise via `submit` mode label).
- **Initial submittable state:** `floatingBtn.setSubmittable(false)`.
- **Visibility predicate:** `setSubmittable(input.value.length > 0)` is re-evaluated on every `oninput` event on the target's input field.
- **Submit handler:** registered ONCE: `floatingBtn.on('submit', async () => { if (gameState.isProcessing) return; await handleCheck(); })`.
- **Per-round lifecycle:** between rounds (after auto-advance to `renderRound(N+1)`), the input is cleared, `floatingBtn.setSubmittable(false)` is called explicitly to disable CHECK for the new round. Mode remains `'submit'` until `endGame(...)` chain flips it to `'next'` inside `showAnswerCarousel()`.
- **End-of-game lifecycle:** mode flips to `'next'` ONLY inside `showAnswerCarousel()` AFTER `answerComponent.show(...)` has rendered. Never inside `endGame()` directly. `floatingBtn.on('next', ...)` is registered ONCE alongside `setMode('next')`. Tap fires the single-stage exit handler above.

## Cross-checks (Step 7)

- ✅ Every screen named in the diagram (Preview, Welcome, Round Intro × 3, Game, Game Over, Victory, Motivation, Stars Collected, Answer Carousel) has a row in the screen inventory and will get a wireframe in screens.md.
- ✅ Every feedback event (tap-target, type-digit, enter, check-correct, check-wrong-with-lives, check-wrong-last-life, timer-expiry, round-transition, last-round-victory, game-over, play-again/try-again, claim-stars, show-answer, tap-next, visibility-hide, visibility-restore, audio-failure) has a FeedbackManager call signature documented above and will get a row in feedback.md.
- ✅ Every wrong-answer dispatch (pair-sums, sum-minus-k, extremes, timer-expiry, generic-wrong) has a documented candidate-value table and TTS payload.
- ✅ Scoring formula matches state changes: `score += 1` on each correct CHECK; `stars = getStars()` (1:1 with score, with the Game-Over edge case returning 0); 0–3★ all route through Victory + Stars Collected + AnswerComponent EXCEPT lives=0 mid-session which routes through Game Over (no AnswerComponent).
- ✅ ProgressBar bumps FIRST inside CHECK / timer-expiry handlers (memory: `progress_bar_round_complete`) — `progressBar.update(currentRound, lives|lives-1)` precedes any awaited SFX/TTS so the final round shows 3/3 (not 2/3) at Victory time.
- ✅ AnswerComponent reveals AFTER Stars Collected celebration (memory: `feedback_pause_overlay` — celebration plays first, then carousel; `answerComponent.show(...)` is called ONLY from `showAnswerCarousel()`, never from `endGame()` or from a Victory `Claim Stars` action that bypasses Stars Collected).
- ✅ Pause overlay = VisibilityTracker's PopupComponent (memory: `feedback_pause_overlay` — never custom-built).
- ✅ TimerComponent mounted INSIDE `.mathai-preview-header-center` visibly (memory: `timer_preview_integration` — not hidden; override 320×41 inline styles; hide `#previewTimerText`).
- ✅ Set rotation increments `setIndex` BEFORE `resetGameState()` inside `restartGame()` so the new round-slice is in place before round 1 renders.
- ✅ FloatingButton in `'submit'` mode for CHECK (PART-050 mandatory per game-archetypes constraint #8); flips to `'next'` mode ONLY inside `showAnswerCarousel()` AFTER `answerComponent.show(...)`.
- ✅ Next click handler is `on('next', ...)` not `on('submit', ...)` (avoiding the bodmas-blitz 2026-04-23 regression).
- ✅ No `function loadRound() { ... }` declarations (memory: `feedback_window_loadround_shadow` — use `renderRound`).
- ✅ Timer per-round value read from `round.timerSeconds` (60 / 60 / 75), NOT hardcoded.
- ✅ Free-text numeric input uses `type="text" inputmode="numeric" pattern="[0-9]*"` with `font-size: 16px` (Mobile rules #13, #28). Enter key submits (Mobile rule #16). No auto-focus on round entry (Mobile rule #17). `visualViewport` keyboard listener keeps the cluster visible (Mobile rule #14). FeedbackManager overlays remain visible above the keyboard (Mobile rule #15).
- ✅ Wrong-answer evaluator is a dispatch table by `round.ruleFamily`, computing candidate values for each named misconception per family.
