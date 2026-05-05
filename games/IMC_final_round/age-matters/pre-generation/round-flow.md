# Round Flow: Age Matters

## Round Types

There are 3 round types, all with the same 3-step structure:

- **Type A** (Stage 1, Rounds 1–3) — single person + one time shift. Step 1 trivial (1 name tile), Step 2 = direction tiles, Step 3 = simple equation.
- **Type B** (Stage 2, Rounds 4–7) — two people, present tense, no time shift. Step 1 = real variable choice, Step 2 = piece-bank `x ± k` or `n · x` expression, Step 3 = sum / single-fact equation.
- **Type C** (Stage 3, Rounds 8–10) — two people + one time shift on both. Step 1 = variable choice, Step 2 = present-tense expression, Step 3 = full equation with paren-scaffolded time-shift; passive time-shift reminder banner above Step 3.

Every round runs through the same `renderRound(N)` orchestrator; type-specific behaviour is dispatched on `round.type`.

---

## Round Type: A — Single person + time shift (Stage 1)

### Step-by-step

1. **Round starts**
   - `renderRound(N)` runs. Reads `gameState.currentRoundData = filteredRounds[N-1]` (filtered by current `setIndex`).
   - Resets `currentSlotState = []`, `pieceBankState = []`, `idleNudgeFiredForStep = false`, `stepFirstTapDirty = false`.
   - Paints word-problem panel with `round.problemText`. Sets step indicator to "Step 1 / 3". Mounts Step-1 tile row (single tile, `${round.preferredVariable} = x`). Hides Step-2 + Step-3 UIs.
   - Fires fire-and-forget round-start TTS: `playDynamicFeedback({audio_content: round.problemAudioText, subtitle: round.problemText.replace(/<[^>]+>/g, ''), sticker:null}).catch(...)`.
   - `gameState.isProcessing = false`. `gameState.currentStep = 1`.
   - Schedules 15s idle-nudge timer for Step 1 (`setTimeout(applyGlowToStepNextCorrect, 15000)`).

2. **Student sees** — word-problem panel, "Step 1 / 3" chip, single name tile.

3. **Student acts** — taps the single name tile (Type A: 1 tile only; "wrong" is impossible at Step 1 in Type A).

4. **Step 1 — Right tap path** (multi-step pattern: SFX + sticker only, no awaited TTS):
   a. Clear idle-nudge timer.
   b. `gameState.isProcessing = true` BEFORE any feedback (defensive — even fire-and-forget).
   c. Tile gets `.selected-correct` styling; tile flashes green ~400 ms.
   d. `FeedbackManager.sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — fire-and-forget, ~150 ms.
   e. If `stepFirstTapDirty === false`, `gameState.firstTapCorrect++`; `gameState.score++`. Update first-tap counter chip.
   f. `recordAttempt({is_correct: true, attempt_type: 'step-tap', step: 1, round: N, retryCount: 0})`.
   g. `loadStep(2)` — fades in Step-2 UI (`.fade-in`, 350ms), sets step indicator to "Step 2 / 3", `stepFirstTapDirty = false`, schedules new 15s idle-nudge timer for Step 2.
   h. `gameState.isProcessing = false` inside `loadStep(2)` (single source of truth — see MEMORY rule `feedback_window_loadround_shadow`: do NOT name a local function `loadRound`).

5. **Student sees Step 2** — direction tile row (`x − 5` / `x + 5`).

6. **Student acts** — taps one of the two tiles.

7. **Step 2 — Right tap path**:
   - Same as Step 1's right-tap, except `loadStep(3)` opens Step-3 UI. firstTapCorrect++ if `stepFirstTapDirty === false`.

8. **Step 2 — Wrong tap path** (multi-step pattern: SFX + sticker only, no awaited TTS):
   a. Clear idle-nudge timer.
   b. Tile gets `.selected-wrong` styling; tile flashes red ~600 ms (`.shake-wrong`).
   c. `FeedbackManager.sound.play('soft_sad', {sticker:'sad'}).catch(...)` — fire-and-forget.
   d. Inline contextual hint panel renders `round.step2.tiles[i].misconception` → looked up in `round.step3.hints` map (or per-step hints if defined). E.g. `time-shift-direction-flip` → "Five years AGO means subtract 5, not add 5. Try a different operator."
   e. `stepFirstTapDirty = true` (this step is forfeit for first-tap accounting).
   f. `recordAttempt({is_correct: false, attempt_type: 'step-tap', step: 2, round: N, misconception_tag: tile.misconception, retryCount: stepFirstTapDirty ? 1 : 0})`.
   g. `gameState.isProcessing = false` immediately (multi-step does NOT block input). Student can re-tap.
   h. NO life decrement (lives = 0).

9. **Student sees Step 3** — slot template + piece bank.

10. **Student acts** — taps a piece in the bank.

11. **Step 3 — Right piece in next slot path**:
    a. Piece animates into the slot with a scale-in (200 ms).
    b. `FeedbackManager.sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — fire-and-forget.
    c. Update `currentSlotState[i].filled = piece`. Mark piece in bank as consumed.
    d. **If this fills the last empty slot** AND `normalizeAst(builtEquation) === normalizeAst(round.step3.canonicalEquation)` → fire **round-complete handler** (step 12).
    e. Else: stay on Step 3, await next tap.

12. **Step 3 — Wrong piece in next slot path** (or piece that violates slot expectations):
    a. Clear idle-nudge timer.
    b. Slot+piece flash red 600 ms (`.shake-wrong` on both elements).
    c. `FeedbackManager.sound.play('soft_sad', {sticker:'sad'}).catch(...)` — fire-and-forget.
    d. Look up `round.step3.pieceMisconceptions[piece]` → tag → `round.step3.hints[tag]` → render in contextual hint panel.
    e. `stepFirstTapDirty = true`.
    f. `recordAttempt({is_correct: false, attempt_type: 'step-tap', step: 3, round: N, misconception_tag: tag, retryCount: stepFirstTapDirty ? 1 : 0})`.
    g. Slot clears (piece returns to bank, slot becomes `__slot__` again).
    h. NO life decrement.
    i. Student can re-tap.

13. **Idle nudge (15s without input on the active step)**:
    - If `idleNudgeFiredForStep === false`, apply `.glow-nudge` CSS class to the next-correct piece/tile.
    - Animation: `box-shadow: 0 0 12px var(--mathai-color-accent); animation: glow-pulse 1.5s ease-in-out infinite alternate;`.
    - Fires ONCE per step. Set `idleNudgeFiredForStep = true`.
    - NO sound. Tapping the glowing piece counts as a normal tap (with `stepFirstTapDirty = true` if not already — see footnote). Glow disappears on next valid tap.
    - Footnote: per spec, glow forfeits the first-tap point. Implementation: when glow is applied, set `stepFirstTapDirty = true` immediately (before the next tap).

14. **Round-equation correct (Step 3 final placement, single-step pattern: SFX awaited + dynamic TTS awaited):**
    a. `gameState.isProcessing = true` BEFORE any await. Disable all step inputs.
    b. Per-piece celebration glow propagates across the assembled equation (~600 ms total, staggered).
    c. **`progressBar.update(currentRound, lives)` FIRES FIRST** (per MEMORY rule `progress_bar_round_complete`).
    d. `await FeedbackManager.sound.play('correct_sound_effect', {sticker:'celebration', minDuration: 1500})`.
    e. **Algebraic solve animation** plays in-place:
       - Equation builder area re-renders with `round.solution.solveLines` (e.g. `['x − 5 = 12', 'x = 12 + 5', 'x = 17']`).
       - Each line fades in over 600 ms, sequentially. After each line: `FeedbackManager.sound.play('soft_tick', {sticker:null}).catch(...)` — fire-and-forget.
       - Total duration ~3-4 s.
       - Captioned-age bubbles appear below the final line (`round.solution.captionedAnswers` rendered as small `<div>` bubbles each, e.g. `[Aman (now): 17]`).
    f. `await FeedbackManager.playDynamicFeedback({audio_content: round.solution.successAudio, subtitle: round.solution.successSubtitle, sticker:'celebration'})`.
    g. If `stepFirstTapDirty === false`, `gameState.firstTapCorrect++`; `gameState.score++`. Update first-tap chip.
    h. `recordAttempt({is_correct: true, attempt_type: 'round-equation', round: N, step3FirstTapClean: !stepFirstTapDirty})`.
    i. **Routing:**
       - If `currentRound === 3` → `showStageTakeaway(1)` (Stage-1→2 takeaway TS).
       - Else if `currentRound === 7` → `showStageTakeaway(2)` (Stage-2→3 takeaway TS).
       - Else if `currentRound < 10` → `nextRound()` → Round-(N+1) intro TS.
       - Else (`currentRound === 10`) → `endGame(true)` → Victory chain (see end-game chain below).

### State changes per step (Type A)

| Step | gameState fields changed | DOM update |
|------|--------------------------|------------|
| Round starts | `currentRound++`, `currentStep=1`, `stepFirstTapDirty=false`, `idleNudgeFiredForStep=false` | Word-problem panel + Step-1 tile painted, Steps 2 & 3 hidden |
| Step 1 right | `firstTapCorrect++` (if clean), `score++`, `currentStep=2`, `stepFirstTapDirty=false`, `idleNudgeFiredForStep=false` | Step-1 tile `.selected-correct`, Step-2 fades in |
| Step 2 right | `firstTapCorrect++` (if clean), `score++`, `currentStep=3`, `stepFirstTapDirty=false`, `idleNudgeFiredForStep=false` | Step-2 tile `.selected-correct`, Step-3 fades in |
| Step 2 wrong | `stepFirstTapDirty=true`, `attempts.push(...)` | Step-2 tile `.selected-wrong`, hint panel renders |
| Step 3 right (partial) | `currentSlotState[i].filled=piece` | Piece animates into slot |
| Step 3 right (final) | `firstTapCorrect++` (if clean), `score++`, `attempts.push(...)`, `progressBar.update FIRST` | Solve animation + captioned bubbles + TTS |
| Step 3 wrong | `stepFirstTapDirty=true`, `attempts.push(...)`, `currentSlotState[i].filled=null` | Slot+piece `.shake-wrong`, hint panel renders, slot clears |

---

## Round Type: B — Two people, present tense (Stage 2)

Same 3-step orchestration as Type A; differences:

### Step 1 differences

- **Two name tiles** rendered (per `round.people[]`).
- **Right tap** is the `preferredVariable` tile. Same as Type A's Step 1 right-path.
- **Wrong tap** (`variable-choice-suboptimal` — soft wrong):
  a. Tile flashes red ~600 ms.
  b. `FeedbackManager.sound.play('soft_sad', {sticker:'sad'}).catch(...)` — fire-and-forget.
  c. Hint: "You can solve it this way, but picking the younger person keeps the numbers smaller. Try the other tile?"
  d. `stepFirstTapDirty = true`.
  e. `recordAttempt({is_correct: false, attempt_type: 'step-tap', step: 1, round: N, misconception_tag: 'variable-choice-suboptimal'})`.
  f. Step does NOT advance; student can re-tap the other tile (which then takes the "right" path but firstTapCorrect for Step 1 = 0).
  g. NO life decrement.

### Step 2 differences

- `step2.kind === 'pieceBank'`; rendered as a 3-slot template (`['x', '__slot__', '__slot__']`) with `x` pinned. Piece bank has `+`, `−`, the correct number, and 1–2 distractors.
- Auto-evaluates when ALL 3 slots are full (i.e. when slots 2 and 3 both have a piece) AND `normalizeAst(builtExpression) === normalizeAst(round.step2.canonical)`.
- Right path: same SFX + scale-in pattern; on auto-evaluate, advances to Step 3 via `loadStep(3)`.
- Wrong piece in next slot:
  a. Slot+piece flash red, sad SFX (FF), hint panel via `round.step2.pieceMisconceptions[piece]` → `round.step2.hints[tag]` (or shared hint map).
  b. `stepFirstTapDirty = true`. `recordAttempt(...)`. Slot clears.

### Step 3 differences

- Slot template is the full equation skeleton (e.g. `['x', '+', '__slot__', '=', 25]`).
- Some slots are pre-filled from Step 2's product (e.g. `x` and the constant); the student fills the remaining op + num slots.
- Piece bank: 3 distractors. Includes operators that trigger `operation-mismatch` and numbers that trigger `distractor-number-confusion`.
- Auto-evaluate on slot-full: same AST normalize + match against `round.step3.canonicalEquation`.

### State changes per step (Type B) — additional rows

| Step | gameState fields changed | DOM update |
|------|--------------------------|------------|
| Step 1 right | (same as Type A) — but wrong-tap is "soft" | (same) |
| Step 1 wrong (soft) | `stepFirstTapDirty=true`, `attempts.push(...)` (`misconception_tag: 'variable-choice-suboptimal'`) | Tile `.selected-wrong`, hint panel renders |

---

## Round Type: C — Two people + time shift (Stage 3)

Same 3-step orchestration as Type B; differences:

### Step 2 differences

- Slot template is the present-tense second-age expression (`['x', '__slot__', '__slot__']` for `x ± k`, or `['__slot__', '·', 'x']` for `n · x`).
- Piece bank includes additional distractors: the time-delta number `k` is in the bank — picking it triggers `time-shift-omission` (the student is applying the time shift here, but Step 2 is for present-tense ages only).

### Time-shift reminder banner

- Renders ABOVE Step-3 builder, NOT a decision. Reads `"In ${k} years, add ${k} to each age."` if `round.timeDelta > 0`, else `"${|k|} years ago, subtract ${|k|} from each age."`.

### Step 3 differences

- Slot template uses parens to scaffold the time-shift application: e.g. `['(', 'x', '+', '__slot__', ')', '+', '(', '__slot__', '+', '__slot__', ')', '=', 33]`.
- Piece bank includes an `n·x`-shaped tile (e.g. `2x`, `3x`) AS A SINGLE PIECE to reduce slot-count.
- Pieces that omit the time-shift trigger `time-shift-omission`. Pieces with the wrong-sign time-shift trigger `time-shift-direction-flip`.

### Algebraic solve animation (Type C — fractional answers)

- For rounds where `round.solution.variableValue` is non-integer (e.g. 7.5), the algebraic solve animation renders the final line with a fraction notation: `x = 15/2 = 7.5`.
- Captioned-age bubbles round to one decimal: `Anita (now): 7.5`.
- The TTS reads the fractional answer correctly: `"seven point five"`.

---

## End-game chain (Round 10 Step-3 correct)

When `currentRound === 10` and Step 3 just auto-evaluated correct, the round-complete handler enters the end-game chain. **NEW chain per PART-051 Step 2e — supersedes the legacy 5-step chain.**

```js
async function onRound10Complete() {
  // Step a-h same as round-complete handler, then:
  await FeedbackManager.sound.play('correct_sound_effect', {sticker:'celebration', minDuration: 1500});
  await playAlgebraicSolveAnimation(round); // ~3-4 s
  await FeedbackManager.playDynamicFeedback({
    audio_content: round.solution.successAudio,
    subtitle: round.solution.successSubtitle,
    sticker: 'celebration'
  });
  // End-game starts here:
  const stars = computeStars();
  postMessage({ type: 'game_complete', data: { stars, metrics: { /* ... */ } } });
  endGame(true); // routes to showVictory()
}

function showVictory() {
  const stars = computeStars();
  const buttons = [
    { text: 'Claim Stars', action: showStarsCollected }
  ];
  if (stars < 3) {
    buttons.push({ text: 'Play Again', action: onPlayAgain });
  }
  transitionScreen.show({
    title: 'Victory!',
    subtitle: 'You translated all 10 problems!',
    sticker: 'alfred_celebration',
    stars,
    buttons,
    persist: true
  });
  // Note: NO 'Next' button inside buttons[] (validator GEN-FB-TS-CTA-FORBIDDEN).
}

function showStarsCollected() {
  const stars = computeStars();
  transitionScreen.show({
    title: 'Yay! Stars collected!',
    sticker: 'alfred_celebration',
    stars,
    buttons: [],
    persist: true,
    onMounted: async () => {
      await FeedbackManager.sound.play('sound_stars_collected', {sticker:'celebration'});
      postMessage({ type: 'show_star' });
      setTimeout(showAnswerCarousel, 1500);
    }
  });
  // Stars Collected TS does NOT call transitionScreen.hide() — it stays mounted as backdrop.
}

function showAnswerCarousel() {
  answerComponent.show({
    slides: buildAnswerSlidesForAllRounds()
  });
  floatingBtn.setMode('next');
  floatingBtn.on('next', () => {
    answerComponent.destroy();
    postMessage({ type: 'next_ended' });
    previewScreen.destroy();
    floatingBtn.destroy();
  });
  // Single-stage exit (validator GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE).
}

function onPlayAgain() {
  FeedbackManager.sound.stopAll();
  rotateRoundSet(); // setIndex = (setIndex + 1) % 3 — BEFORE resetGameState
  resetGameState();
  transitionScreen.show({ title: 'Round 1 of 10', /* ... */ });
}

function rotateRoundSet() {
  gameState.setIndex = (gameState.setIndex + 1) % 3;
}

function resetGameState() {
  gameState.currentRound = 1;
  gameState.currentStep = 1;
  gameState.score = 0;
  gameState.firstTapCorrect = 0;
  gameState.stepFirstTapDirty = false;
  gameState.idleNudgeFiredForStep = false;
  gameState.attempts = [];
  gameState.isProcessing = false;
  gameState.lives = 0;
  gameState.currentRoundData = null;
  gameState.currentSlotState = [];
  gameState.pieceBankState = [];
  // CRITICAL: do NOT touch gameState.setIndex.
}

function computeStars() {
  if (gameState.currentRound < gameState.totalRounds) return 0; // abandoned mid-session
  const f = gameState.firstTapCorrect; // 0..30
  if (f >= 27) return 3;
  if (f >= 21) return 2;
  return 1;
}
```

---

## Stage takeaway handler (after R3 and R7)

```js
function showStageTakeaway(stageJustCompleted) {
  const copy = stageJustCompleted === 1
    ? { title: 'Stage 1 done.', subtitle: 'Time-shifts add or subtract from every age in the room.' }
    : { title: 'Stage 2 done.', subtitle: 'Notice how picking the younger person as `x` kept the numbers small.' };

  transitionScreen.show({
    title: copy.title,
    subtitle: copy.subtitle,
    sticker: 'alfred_celebration',
    buttons: [], // tap-to-dismiss only
    onMounted: async () => {
      await FeedbackManager.sound.play('motivation_sound_effect', {sticker:'celebration'});
      await FeedbackManager.playDynamicFeedback({
        audio_content: copy.subtitle,
        subtitle: copy.subtitle,
        sticker: 'celebration'
      });
    },
    onDismiss: () => {
      transitionScreen.hide();
      const nextRoundIndex = stageJustCompleted === 1 ? 4 : 8;
      gameState.currentRound = nextRoundIndex;
      transitionScreen.show({ title: `Round ${nextRoundIndex} of 10`, /* ... */ });
      // After Round-N intro TS dismisses → renderRound(N).
    }
  });
}
```

---

## Slot-template + AST evaluation algorithm (used by all 3 round types)

Pseudocode for the build of step 2 / step 3 evaluation logic:

```js
function onPieceTap(piece, currentStep) {
  if (gameState.isProcessing) return;
  const round = gameState.currentRoundData;
  const stepData = currentStep === 2 ? round.step2 : round.step3;

  if (currentStep === 2 && stepData.kind === 'directionTiles') {
    // Type A Step 2: direction tile tap
    const tile = stepData.tiles.find(t => t.label === piece);
    if (tile.correct) onStepRight(2, tile);
    else onStepWrong(2, tile.misconception);
    return;
  }

  // pieceBank flow (Type A Step 3, Type B/C Steps 2 & 3)
  const nextEmptySlotIdx = currentSlotState.findIndex(s => s.filled === null && s.template === '__slot__');
  if (nextEmptySlotIdx < 0) return; // no empty slot — defensive

  // Tentatively place the piece:
  currentSlotState[nextEmptySlotIdx].filled = piece;

  // If all __slot__ slots are now filled, AST-validate:
  const allFilled = currentSlotState.filter(s => s.template === '__slot__').every(s => s.filled !== null);
  if (allFilled) {
    const builtAst = buildAstFromSlotState(currentSlotState);
    const canonicalAst = currentStep === 2 ? stepData.canonical : stepData.canonicalEquation;
    if (normalizeAst(builtAst).equals(normalizeAst(canonicalAst))) {
      onStepRight(currentStep, piece);
    } else {
      // The build was wrong — find the offending piece(s) and trigger wrong-piece feedback.
      const wrongPiece = findFirstWrongPiece(currentSlotState, canonicalAst, stepData.pieceMisconceptions);
      onPieceWrong(currentStep, wrongPiece, stepData.pieceMisconceptions[wrongPiece]);
    }
  } else {
    // Partial fill — animate the piece into the slot, no evaluation yet.
    animatePieceIntoSlot(piece, nextEmptySlotIdx);
  }
}
```

The `normalizeAst` function (see game-flow.md "AST normalization") sorts commutative operands, treats `=` as commutative, and flattens nested same-op chains. It does NOT simplify (no `2x` ≡ `x + x`).

---

## Round-set cycling integration

`renderRound(N)` and `nextRound()` always read from the *filtered* round array:

```js
function getActiveRoundList() {
  const setLetter = ['A','B','C'][gameState.setIndex];
  return fallbackContent.rounds.filter(r => r.set === setLetter); // length === 10
}

function renderRound(N) {
  const activeRounds = getActiveRoundList();
  gameState.currentRoundData = activeRounds[N - 1];
  // ... paint UI ...
}
```

Never index into `fallbackContent.rounds` directly with `currentRound - 1` — that would mix sets.

---

## Idle-nudge timer management

```js
let idleNudgeTimer = null;

function scheduleIdleNudge(forStep) {
  clearIdleNudge();
  idleNudgeTimer = setTimeout(() => {
    if (gameState.idleNudgeFiredForStep || gameState.isProcessing) return;
    gameState.idleNudgeFiredForStep = true;
    gameState.stepFirstTapDirty = true; // glow forfeits the first-tap point
    applyGlowToNextCorrect(forStep);
    // No sound, no input block.
  }, 15000);
}

function clearIdleNudge() {
  if (idleNudgeTimer) clearTimeout(idleNudgeTimer);
  idleNudgeTimer = null;
}
```

Schedule on every `loadStep(N)` and on every right-tap that doesn't advance (e.g. partial Step-3 fills). Clear on every tap.

---

## Pause / resume integration (CASE 14 / CASE 15)

VisibilityTracker's PopupComponent auto-shows on tab-hidden — see MEMORY rule `feedback_pause_overlay`. NEVER build a custom pause overlay. The runtime hooks:

- On `visibilitychange` → hidden: `FeedbackManager.sound.pauseAll()`, idle-nudge timer cleared.
- On `visibilitychange` → visible: `FeedbackManager.sound.resumeAll()`, idle-nudge timer rescheduled (with full 15 s window starting from resume).

There is no game-level timer to pause (no PART-006).
