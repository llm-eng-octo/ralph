# Game Flow: Age Matters — The Word-Problem Equation Trainer

## One-liner

Translate friendly English-language age word-problems into a single linear equation in one variable by tapping through three small decisions per round (variable choice → other-age expression → equation construction) across 10 rounds (3 stages: A=single-person + time-shift, B=two-people present, C=two-people across time), with 0 lives, no timer, an in-place algebraic solve animation after every correct equation, and an end-of-game 10-slide AnswerComponent carousel reviewing every canonical setup.

## Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Preview Screen (PART-039)                                                   │
│  ─ previewInstruction HTML + previewAudioText TTS                            │
│  ─ "Start" CTA                                                               │
│              │ tap                                                           │
│              ▼                                                               │
│  Welcome / Round-1 intro TS (PART-024)                                       │
│  ─ "Round 1 of 10" + round-intro SFX + VO                                    │
│  ─ tap to begin                                                              │
│              │                                                               │
│              ▼                                                               │
│  Gameplay R1 (Type A — single person + time shift)                           │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Step 1 (variable confirm) ─ Step 2 (direction tile) ─ Step 3 (equation)│  │
│  │ each step auto-evaluates on tap / slot-fill                            │  │
│  │ wrong tap → red flash + sad SFX (FF) + contextual hint, slot clears    │  │
│  │ right tap → green tick + soft chime (FF), step opens                   │  │
│  │ 15s idle on active step → glow nudge on next-correct piece (forfeits   │  │
│  │   first-tap point; fires once per step)                                │  │
│  │ Step-3 final placement → celebration glow propagates →                 │  │
│  │   await round-complete SFX + sticker →                                 │  │
│  │   ALGEBRAIC SOLVE ANIMATION in-place (~3-4s, line-by-line, tick SFX,  │  │
│  │     captioned-age bubbles) →                                           │  │
│  │   await playDynamicFeedback(round.solution.successAudio)               │  │
│  │   progressBar.update() FIRST in round-complete handler                 │  │
│  │   firstTapCorrect counter updated per step                             │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│              │ auto-advance                                                  │
│              ▼                                                               │
│  Round-2 intro TS → Gameplay R2 (Type A) → Round-3 intro TS → R3 (Type A)    │
│              │                                                               │
│              ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │ Stage 1 → 2 Takeaway TS                                          │        │
│  │ "Stage 1 done. Time-shifts add or subtract from every age."      │        │
│  │ motivation VO · tap to continue                                  │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│              │                                                               │
│              ▼                                                               │
│  Round-4..7 intro TS + Gameplay R4..7 (Type B — two people present tense)    │
│              │                                                               │
│              ▼                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐        │
│  │ Stage 2 → 3 Takeaway TS                                          │        │
│  │ "Stage 2 done. Notice how picking the younger person as x        │        │
│  │  kept the numbers small."                                        │        │
│  │ motivation VO · tap to continue                                  │        │
│  └──────────────────────────────────────────────────────────────────┘        │
│              │                                                               │
│              ▼                                                               │
│  Round-8..10 intro TS + Gameplay R8..10 (Type C — two people across time)    │
│  (Type C adds a passive "In k years, add k to each age." banner above Step 3)│
│              │ Round 10 Step-3 correct → final algebraic solve animation     │
│              ▼                                                               │
│  endGame(true)                                                               │
│   1. await FeedbackManager.play('round-complete') final-round feedback       │
│   2. postMessage({type:'game_complete', data:{stars, metrics}})              │
│   3. showVictory()                                                           │
│              │                                                               │
│              ▼                                                               │
│  Victory TS (PART-024)                                                       │
│  ─ stars rendered (per first-tap rubric: 27→3⭐, 21→2⭐, completed→1⭐)       │
│  ─ buttons: [{text:'Claim Stars', action: showStarsCollected}]               │
│  ─ NO inline 'Next' inside buttons[] (validator GEN-FB-TS-CTA-FORBIDDEN)     │
│  ─ persist:true                                                              │
│              │ Claim Stars tap                                               │
│              ▼                                                               │
│  Stars Collected TS (terminal celebration backdrop)                          │
│  ─ title:'Yay! Stars collected!', stars rendered, buttons:[], persist:true   │
│  ─ onMounted: await sound.play('sound_stars_collected') →                    │
│      postMessage({type:'show_star'}) →                                       │
│      setTimeout(showAnswerCarousel, ~1500 ms)                                │
│  ─ TS stays mounted as backdrop (does NOT call transitionScreen.hide())      │
│              │                                                               │
│              ▼                                                               │
│  AnswerComponent carousel (PART-051) ─ 10 slides (1 per round of current set)│
│  ─ each slide: word-problem (compact) + canonicalEquationDisplay +           │
│    solveLines (2-3 lines) + captioned-age bubbles + 1-line explanation       │
│  ─ rendered via {render(container){...}} callbacks (NEVER {html:'...'})      │
│  ─ floatingBtn.setMode('next') AFTER answerComponent.show()                  │
│              │ tap Next                                                      │
│              ▼                                                               │
│  Single-stage exit:                                                          │
│    answerComponent.destroy() · postMessage({type:'next_ended'}) ·            │
│    previewScreen.destroy() · floatingBtn.destroy()                           │
│                                                                              │
│  Pause overlay: VisibilityTracker's PopupComponent on tab-hidden (CASE 14);  │
│    audio pauses. On resume (CASE 15) audio resumes. NEVER custom overlay.    │
│                                                                              │
│  NO Game Over branch (totalLives = 0). Abandonment is browser-level only;    │
│    the 0⭐ rubric outcome is recorded only when the player never reaches the │
│    Round-10 Victory transition. The harness fires game_complete only at     │
│    Victory — there is no game_over postMessage path.                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Shape

**Shape:** Shape 2 Multi-round (10 rounds split across 3 stages: 3 / 4 / 3).

## Changes from default

- **Inserted Stage-1→2 takeaway TS** between R3 feedback and R4 intro (flow-gallery: "section-intro / pep-talk every N rounds" — adapted as a single one-line takeaway, motivation VO, no decision).
- **Inserted Stage-2→3 takeaway TS** between R7 feedback and R8 intro (same pattern).
- **No Game Over branch.** `totalLives = 0` → wrong taps never end the game; only voluntary abandonment yields the 0⭐ outcome and that records nothing (no game_over postMessage). Validator note: archetype 7 lists `game_over` as conditional.
- **Algebraic solve animation** plays *inside* the gameplay screen between Round-N's Step-3-correct and Round-(N+1)'s intro TS — it is NOT a separate screen, it is part of the round-complete feedback beat. Line-by-line equation transformations (~3-4 s) with tick SFX per line and captioned-age bubbles below the final line.
- **Per-step (not per-round) first-tap accounting.** The progress bar tracks rounds (`currentRound / totalRounds`) but a separate first-tap counter chip ("21/30 correct so far") sits alongside the progress bar — see screens.md persistent fixtures.
- **No FloatingButton during gameplay.** Each step auto-evaluates on tap (Step 1) or on slot-template fill (Steps 2 & 3). PART-050 is mounted at end-of-game ONLY for the single-stage Next exit after AnswerComponent — required by PART-051's end-game chain.
- **AnswerComponent carousel = 10 slides (1 per round of the current set).** Renders the canonical equation in solved form for every round, including rounds the student got first-tap-correct (carousel is not gated on accuracy).
- **Round-set cycling (A → B → C → A).** Three full sets × 10 rounds each = **30 round objects** committed to `fallbackContent.rounds`. `setIndex` rotates BEFORE `resetGameState()` on Try-Again / Play-Again and persists across in-session restarts (`resetGameState()` MUST NOT clear `setIndex`). Set A first attempt; Set B after first restart; Set C after second restart; cycles back to A.
- **Custom star rule (NOT default 90/66/33%):**
  - **3⭐** = 27–30 first-tap correct out of 30 step-decisions.
  - **2⭐** = 21–26 first-tap correct out of 30.
  - **1⭐** = completed all 10 rounds with < 21 first-tap correct.
  - **0⭐** = abandoned before reaching Round-10 Victory (only if the student walks away / closes tab; no in-app path produces this).
- **No timer (PART-006 omitted).** L4 Analyze deserves deliberation per the creator brief.
- **Per-round TTS reads the word problem aloud at round start** (fire-and-forget so a fast reader can interact immediately).

## Stages

| Stage | Rounds | Type | Difficulty | Content description |
|-------|--------|------|------------|---------------------|
| Stage 1 | 1–3 | A — single person + time shift | warm-up; canonical numbers ≤ 20 | One person, one time delta `k ∈ {2,3,4,5,6}`, mix of past / future / mixed-tense. Step 1 is a no-op confirmation (single name tile); Step 2 is the time-shift direction (`x − k` vs `x + k`); Step 3 builds the simple equation `x ± k = N` or `x = N`. 2 distractors per piece bank. Expected first-solve ~85 %. |
| Stage 2 | 4–7 | B — two people, present tense | NO time shift; canonical numbers ≤ 30; integer answer ≤ 25 | Two people; relationship: "older by k", "younger by k", "twice as old", "thrice as old", or "difference is k". Sum constraint or single-fact constraint. Step 1 is a real variable choice (preferred = younger / simpler); Step 2 is `x ± k` or `k · x` second-age expression; Step 3 is the full sum / difference equation. 3 distractors per bank. Expected first-solve ~70 %. |
| Stage 3 | 8–10 | C — two people across time | full skill: two people + a time delta on both; canonical numbers ≤ 40; answer ≤ 30 (fractional permitted, e.g. `x = 7.5`) | Two people + a single time delta applied to BOTH ages. Adds a passive "In k years, add k to each age." reminder banner above Step 3. Relationship set = Stage 2 set + `n × x` and `(n+1) × x`. Step 3 slot template uses parens to scaffold the time-shift application. At least one round across the set produces a fractional canonical answer — the algebraic solve animation handles this gracefully and the captioned bubbles round to one decimal. 3 distractors per bank. Expected first-solve ~50 %. |

Each stage is replicated identically (parallel difficulty + parallel decision count + parallel piece-bank distractor count) across Sets A, B, and C. Set A's Round 1 ≈ Set B's Round 1 ≈ Set C's Round 1 in shape; only names, numbers, and tense vary.

Round 10 → final algebraic solve animation → endGame(true) → Victory TS → Stars Collected TS → AnswerComponent → Next.

There is no Game Over path; lives = 0 means the player can ALWAYS complete all 10 rounds.

## Round-set cycling — set IDs and parallel difficulty

| Set | Round IDs (round 1 → 10) | Stage 1 (R1–3) | Stage 2 (R4–7) | Stage 3 (R8–10) |
|-----|--------------------------|----------------|----------------|-----------------|
| A | `A_r1_aman_past`, `A_r2_sara_future`, `A_r3_ravi_mixed`, `A_r4_mira_brother`, `A_r5_aman_father`, `A_r6_anita_twice`, `A_r7_bobby_diff`, `A_r8_anita_bobby_future`, `A_r9_sara_ravi_past`, `A_r10_mira_aman_thrice` | past · future · mixed | younger · older · twice · diff | future-twice · past-older · future-thrice |
| B | `B_r1_anita_past`, `B_r2_bobby_future`, `B_r3_mira_mixed`, `B_r4_sara_aman_younger`, `B_r5_ravi_aman_older`, `B_r6_anita_mira_thrice`, `B_r7_aman_ravi_diff`, `B_r8_sara_ravi_future`, `B_r9_bobby_anita_past`, `B_r10_aman_sara_thrice_future` | past · future · mixed | younger · older · thrice · diff | future-twice · past-older · future-fourth |
| C | `C_r1_ravi_past`, `C_r2_mira_future`, `C_r3_sara_mixed`, `C_r4_aman_bobby_younger`, `C_r5_anita_sara_older`, `C_r6_ravi_mira_thrice`, `C_r7_sara_anita_diff`, `C_r8_mira_bobby_future`, `C_r9_aman_ravi_past`, `C_r10_bobby_sara_thrice_future` | past · future · mixed | younger · older · thrice · diff | future-twice · past-older · future-thrice |

(Exact problem text + numbers per round are pinned in `spec.md`'s `fallbackContent.rounds[]`. The build step copies them verbatim.)

`setIndex` semantics:
- Initialised to `0` on fresh page load (Set A plays first).
- `rotateRoundSet()` increments `setIndex = (setIndex + 1) % 3` and is invoked BEFORE `resetGameState()` on every Try-Again / Play-Again.
- `resetGameState()` MUST NOT clear `setIndex` — it persists across in-session restarts.
- The 30 round objects all live in `fallbackContent.rounds`. The runtime filters by `round.set === ['A','B','C'][gameState.setIndex]` to get the current 10-round playlist.
- The full content bank in spec describes ~60 problems; only 30 (3 sets × 10) are committed to `fallbackContent` for v1. The remaining ~30 are out-of-scope for v1 (creator brief).

## State machine sketch

```js
const gameState = {
  // Persistent across in-session restarts (do NOT clear in resetGameState):
  setIndex: 0,                  // 0=A, 1=B, 2=C — rotates BEFORE resetGameState

  // Per-session (reset by resetGameState on Try-Again / Play-Again):
  currentRound: 1,              // 1..10
  currentStep: 1,               // 1..3 within the current round
  score: 0,                     // running first-tap-correct counter (0..30)
  firstTapCorrect: 0,           // alias of score for clarity
  stepFirstTapDirty: false,     // true once a wrong tap occurs on the active step
  attempts: [],                 // recordAttempt log (per step: tap-step / round-equation)
  isProcessing: false,          // input block during awaited feedback
  idleNudgeFiredForStep: false, // ensures glow fires once per step
  lives: 0,                     // never decremented — always 0

  // Per-round (cleared by loadRound between Round N → Round N+1):
  currentRoundData: null,       // round object from fallbackContent.rounds[i]
  currentSlotState: [],         // array mirror of slotTemplate with filled / empty status
  pieceBankState: [],           // pieces + their consumed status
};
```

**Key transitions:**

- `boot → Preview` (PART-039 with `previewInstruction` + audio).
- `Preview → Welcome / Round-1 intro TS` on Start tap.
- `Round-N intro TS → Gameplay R-N` on tap-dismiss → `renderRound(N)` (NOT `loadRound` — see MEMORY rule `feedback_window_loadround_shadow`).
- `Step-1 right tap → Step-2 opens` (Step-2 template fades in 300 ms; firstTapCorrect++ if step was clean).
- `Step-2 slot-full + canonical match → Step-3 opens` (firstTapCorrect++ if step was clean).
- `Step-3 slot-full + canonical AST match → round-complete handler`:
  1. `progressBar.update(currentRound, lives)` FIRST (per MEMORY rule `progress_bar_round_complete`).
  2. `await sound.play('correct_sound_effect', {sticker, minDuration:1500})`.
  3. **Algebraic solve animation** (~3-4 s, line-by-line, tick SFX per line, captioned-age bubbles).
  4. `await playDynamicFeedback({audio_content: round.solution.successAudio, subtitle: round.solution.successSubtitle, sticker})`.
  5. firstTapCorrect++ if Step 3 was clean.
  6. `recordAttempt({is_correct: true, attempt_type: 'round-equation', round})`.
  7. If `currentRound === 3` → Stage-1→2 takeaway TS → Round-4 intro TS.
  8. If `currentRound === 7` → Stage-2→3 takeaway TS → Round-8 intro TS.
  9. Else if `currentRound < 10` → Round-(N+1) intro TS.
  10. Else (`currentRound === 10`) → `endGame(true)` → Victory TS.
- `Victory TS → Stars Collected TS` on Claim Stars tap (Claim Stars button's action calls `showStarsCollected()` directly — NEVER `answerComponent.show(...)` from here per validator `GEN-ANSWER-COMPONENT-AFTER-CELEBRATION`).
- `Stars Collected TS → AnswerComponent + Next` after `~1500 ms setTimeout` inside Stars Collected `onMounted`. Stars Collected TS does NOT call `transitionScreen.hide()` — it stays mounted as the celebration backdrop.
- `AnswerComponent → exit` on Next tap (single-stage: `answerComponent.destroy()`, post `next_ended`, `previewScreen.destroy()`, `floatingBtn.destroy()`).

**End-game chain** (per PART-051 Step 2e — supersedes the legacy 5-step chain):

1. `await FeedbackManager.play('round-complete')` — final-round feedback (includes algebraic solve animation + successAudio TTS).
2. `postMessage({type:'game_complete', data:{stars, metrics}})`.
3. `endGame(true)` → `showVictory()`.
4. `transitionScreen.show({title:'Victory', subtitle:'You translated all 10 problems!', stars, buttons:[{text:'Claim Stars', action: showStarsCollected}], persist:true})` (Play Again button appended only when `stars < 3`).
5. `showStarsCollected()` → `transitionScreen.show({title:'Yay! Stars collected!', stars, buttons:[], persist:true, onMounted})`.
6. `onMounted` plays `sound_stars_collected`, posts `{type:'show_star'}`, `setTimeout(showAnswerCarousel, 1500)`.
7. `showAnswerCarousel()` → `answerComponent.show({slides: buildAnswerSlidesForAllRounds()})` then `floatingBtn.setMode('next')`.
8. `floatingBtn.on('next', () => { answerComponent.destroy(); postMessage({type:'next_ended'}); previewScreen.destroy(); floatingBtn.destroy(); })`.

`buildAnswerSlidesForAllRounds()` filters `fallbackContent.rounds` to `round.set === ['A','B','C'][gameState.setIndex]` (10 rounds) and returns `[{render(container){...}}, ...]`. Each `render` reads only `round.answer` (problemText, canonicalEquationDisplay, solveLines, captionedAnswers, explanation) — no DOM lookups outside `container`. (Validator `GEN-ANSWER-COMPONENT-SLIDE-SHAPE`: NEVER use `{html:'...'}` or `{element:...}`.)

## AST normalization for equation matching

Step 2 and Step 3 evaluate the assembled expression / equation by **normalizing the AST and comparing structurally** to the round's `canonicalEquation` / `canonical` AST. The normalizer:

1. Sorts operands of commutative ops (`+`, `·`) lexicographically by a stable key (numbers first ascending, then strings, then sub-tree hashes).
2. Treats `=` as commutative (`a = b` ≡ `b = a`).
3. Flattens nested same-op chains: `(x + 4) + 6` ≡ `x + 4 + 6` ≡ `((x + 4) + 6)` (still match).
4. Does NOT simplify arithmetic — `2x + 3` is NOT equivalent to `x + x + 3` for matching purposes (the canonical form pinned in the round dictates the exact shape the student must build). However, the slot template ENFORCES the shape so the student can only build canonical-shaped expressions.
5. For Step 2 piece-bank rounds, the slot template pins the structure (`['x','__op__','__num__']`) so the student only fills two slots — match is "did the (op, num) pair equal the canonical ones".

This decouples "structurally correct equation" from "the student typed the exact operand order" — see `Type A: What counts as correct` in spec.md §Core Mechanic for the canonical examples.

The normalizer is implemented inline in the build (no external lib); it lives next to the round-complete handler. The validator-relevant invariant is that `canonicalEquation` in every round is the round's pinned canonical form — the runtime never modifies it.
