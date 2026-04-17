# Round Flow: Matching Doubles

## Round Types

Only **one** round type across all 9 rounds:

- **Type A — Tap-to-Match Pair** (Memory Match, click-to-match across two columns). Pairs-per-round and distractor policy increase by stage. No other round types exist.

## Per-Round Content Table

All values copied verbatim from `spec.md` → `fallbackContent.rounds`. `left` and `right` arrays, `pairs` map, and `misconception_tags` are NOT regenerated here — they are the authoritative content contract.

| # | Stage | Type | Pairs | Left (base numbers) | Right (shuffled) | Correct pairs `{left: right}` | Distractors (misconception tags) |
|---|-------|------|-------|---------------------|------------------|-------------------------------|----------------------------------|
| 1 | 1 Warm-up | A | 3 | `[3, 5, 8]` | `[16, 6, 10]` | `{3:6, 5:10, 8:16}` | none |
| 2 | 1 Warm-up | A | 3 | `[4, 7, 9]` | `[18, 8, 14]` | `{4:8, 7:14, 9:18}` | none |
| 3 | 1 Warm-up | A | 3 | `[2, 6, 9]` | `[18, 4, 12]` | `{2:4, 6:12, 9:18}` | none |
| 4 | 2 Standard | A | 4 | `[6, 11, 15, 22]` | `[44, 12, 30, 22]` | `{6:12, 11:22, 15:30, 22:44}` | none |
| 5 | 2 Standard | A | 4 | `[9, 13, 18, 25]` | `[36, 18, 50, 26]` | `{9:18, 13:26, 18:36, 25:50}` | none |
| 6 | 2 Standard | A | 4 | `[8, 14, 20, 27]` | `[28, 40, 54, 16]` | `{8:16, 14:28, 20:40, 27:54}` | none |
| 7 | 3 Confusability | A | 5 | `[15, 18, 21, 24, 30]` | `[36, 17, 42, 60, 30, 48]` | `{15:30, 18:36, 21:42, 24:48, 30:60}` | `17 → double-add-instead` (15+2) |
| 8 | 3 Confusability | A | 5 | `[17, 23, 28, 35, 40]` | `[46, 29, 56, 80, 70, 34, 55]` | `{17:34, 23:46, 28:56, 35:70, 40:80}` | `29 → double-next-number` (28+1), `55 → double-off-by-one` (2·28 − 1) |
| 9 | 3 Confusability | A | 5 | `[19, 26, 33, 42, 50]` | `[38, 52, 44, 66, 84, 100, 51]` | `{19:38, 26:52, 33:66, 42:84, 50:100}` | `44 → double-add-instead` (42+2), `51 → double-next-number` (50+1) |

**Totals:**
- Total pairs across 9 rounds: 3+3+3 + 4+4+4 + 5+5+5 = **36 correct pairs**. (Note: the victory subtitle template uses `totalPairsMatched`; when every pair is matched the value is 36. Spec example uses 27 — that is illustrative only, not a data constraint. Actual value at runtime is derived from `fallbackContent`.)
- Total distractor tiles across Stage 3: 1 (R7) + 2 (R8) + 2 (R9) = **5 misconception-tagged distractors**.

## Round Type: A — Tap-to-Match Pair

### Step-by-step (one round, generic N-pair case)

1. **Round starts** — Round-N intro transition auto-dismisses (after `sound_rounds`). Gameplay screen mounts. Timer is already running (count-up). `gameState.currentRound = N`. `gameState.pairsLockedThisRound = 0`. Left + right tile arrays render (`.fade-in` 350ms). Input is NOT blocked — `gameState.isProcessing = false`.
2. **Student sees** — Left column with `round.left.length` tiles in given order; right column with `round.right.length` tiles (already shuffled in spec). Progress bar shows `Round N / 9` + current hearts. Per-round prompt "Which numbers are doubles?" at the top of the game body.
3. **Student acts — first tap (LEFT tile)** — tile gets `.tile-selected` accent border. `FeedbackManager.sound.play('sound_tile_select', { sticker: null }).catch(() => {})` — fire-and-forget (CASE 9 equivalent, tap-select SFX, no sticker). `gameState.selectedLeft = <value>`. No other side effects.
    - **Re-tap LEFT (deselect)**: `.tile-selected` removed, `sound_tile_deselect` fire-and-forget, `gameState.selectedLeft = null`. Round state unchanged.
4. **Student acts — second tap (RIGHT tile, after left selected)** — evaluate `round.pairs[gameState.selectedLeft] === <right value>`.
5. **Correct path (multi-step — SFX + sticker only, CASE 5 multi-step variant):**
    a. Both tiles get `.locked-pair` class: green background, scale pulse 200ms, then `pointer-events: none` (permanently disabled).
    b. `FeedbackManager.sound.play('correct_sound_effect', { sticker: STICKER_CELEBRATE }).catch(() => {})` — **fire-and-forget, NO dynamic TTS, NO input block**.
    c. `gameState.pairsLockedThisRound++`, `gameState.totalPairsMatched++`, `gameState.selectedLeft = null`.
    d. `recordAttempt({ is_correct: true, misconception_tag: null, round: N })` fires synchronously.
    e. Student continues interacting immediately with remaining tiles — **NO auto-advance, NO input block**.
    f. **If `pairsLockedThisRound === round.left.length`** → proceed to step 7 (Round complete).
6. **Wrong path (multi-step — SFX + sticker only, CASE 7 multi-step variant):**
    a. Both tiles get `.shake-wrong` + `.tile-wrong-flash` classes (red flash + shake, 600ms CSS keyframe).
    b. `FeedbackManager.sound.play('incorrect_sound_effect', { sticker: STICKER_SAD }).catch(() => {})` — **fire-and-forget, NO dynamic TTS, NO subtitle, NO input block**.
    c. `gameState.lives--`. Progress-bar heart row animates heart-break on lost heart (600ms).
    d. `recordAttempt({ is_correct: false, misconception_tag: round.misconception_tags[<wrongRightValue>] || null, round: N })` fires synchronously.
    e. After 600ms CSS keyframe, both tiles deselect: `.shake-wrong`, `.tile-wrong-flash`, `.tile-selected` removed. `gameState.selectedLeft = null`.
    f. **If `gameState.lives === 0`** → skip wrong SFX completion, go straight to Game Over (step 8). The wrong SFX started in (b) may still complete naturally; the game-over path does NOT `stopAll` until Game-Over CTA is tapped, because the game-over SFX is queued after `postMessage`.
    g. **If `gameState.lives > 0`** → student stays on same round, retries. No auto-advance. The same pair can be re-attempted.
7. **Round complete (last pair locked, CASE 6 single-step awaited):**
    a. `gameState.isProcessing = true` — block input during celebration (no more taps registered).
    b. `await FeedbackManager.sound.play('all_correct', { sticker: STICKER_CELEBRATE })` — awaited.
    c. `await FeedbackManager.playDynamicFeedback({ audio_content: 'Round complete!', subtitle: 'Round complete!', sticker: STICKER_CELEBRATE })` — awaited (subtitle per spec Feedback row).
    d. `gameState.pairsLockedThisRound = 0`, `gameState.currentRound++`.
    e. `gameState.isProcessing = false`.
    f. **If N < 9** → mount Round (N+1) intro transition. **If N === 9** → proceed to step 9 (Victory).
8. **Game Over (lives hit 0 during step 6f):**
    a. `gameState.phase = 'game_over'`, `gameState.stars = 1` (forced).
    b. Render game_over transition screen FIRST (title "Game Over", subtitle "You ran out of lives!", icon `😔`, CTA "Try Again").
    c. `window.parent.postMessage({ type: 'game_complete', stars: 1, score: gameState.totalPairsMatched, totalQuestions: 36, accuracy: (gameState.totalPairsMatched/36)*100, timeSpent: Date.now() - gameState.startTime, gameStatus: 'game_over' }, '*')` **BEFORE audio**.
    d. `onMounted` of the transition screen fires `FeedbackManager.sound.play('sound_game_over', { sticker: STICKER_SAD })`.
    e. CTA visible immediately — tap "Try Again" at any point calls `FeedbackManager.sound.stopAll()` and routes to `motivation`.
9. **Victory (round 9 cleared, lives ≥ 1):**
    a. Stop the count-up timer. Read `elapsedMs = Date.now() - gameState.startTime`. Compute `gameState.stars`: 3 if `elapsedMs <= 60000`, 2 if `elapsedMs <= 90000`, else 1.
    b. `gameState.phase = 'results'`.
    c. Render victory transition screen FIRST (title "Victory 🎉", subtitle `"Completed in {Math.round(elapsedMs/1000)}s — all ${gameState.totalPairsMatched} pairs matched!"`, stars row from `gameState.stars`). Button set per spec: `stars===3` → single "Claim Stars"; else `["Play Again", "Claim Stars"]`.
    d. `window.parent.postMessage({ type: 'game_complete', stars: gameState.stars, score: gameState.totalPairsMatched, totalQuestions: 36, accuracy: (gameState.totalPairsMatched/36)*100, timeSpent: elapsedMs, gameStatus: 'victory' }, '*')` **BEFORE audio**.
    e. `onMounted` fires `await FeedbackManager.sound.play('sound_game_victory', { sticker: STICKER_CELEBRATE })` then `await FeedbackManager.playDynamicFeedback({ audio_content: <tierVO>, subtitle: <tierVO>, sticker: STICKER_CELEBRATE })` — tier VO strings from screens.md Victory section.
    f. CTA interrupts audio with `FeedbackManager.sound.stopAll()`.

### State changes per step

| Step | gameState fields changed | DOM update |
|------|--------------------------|------------|
| Round starts (1) | `currentRound` set to N; `pairsLockedThisRound = 0`; `selectedLeft = null`; `isProcessing = false` | Gameplay mounts; progress bar updates; tiles fade-in (350ms) |
| Left tile tapped (3) | `selectedLeft = <value>` | Left tile gets `.tile-selected`; select SFX plays |
| Left tile re-tapped (3) | `selectedLeft = null` | `.tile-selected` removed; deselect SFX plays |
| Correct match (5) | `pairsLockedThisRound++`; `totalPairsMatched++`; `selectedLeft = null` | Both tiles get `.locked-pair` (green, scale pulse 200ms); disabled |
| Wrong match (6) | `lives--`; `selectedLeft = null` | Both tiles `.shake-wrong` + `.tile-wrong-flash` (600ms); progress-bar heart breaks (600ms) |
| Round complete (7) | `isProcessing = true → false`; `pairsLockedThisRound = 0`; `currentRound++` | Round-complete overlay briefly visible; audio awaited; next round intro mounts |
| Game Over (8) | `phase = 'game_over'`; `stars = 1` | game_over screen mounts; `game_complete` postMessage sent; game_over SFX plays |
| Victory (9) | `phase = 'results'`; `stars` computed from elapsed | Timer display frozen; victory screen mounts; `game_complete` postMessage sent; victory SFX + VO play |

### Notes specific to this game

- **No retry-on-wrong-advances-the-round.** Wrong matches keep the student on the same round until all pairs are locked or lives hit 0.
- **Same left value cannot re-lock.** Once a pair is locked, both tiles are `pointer-events: none`. The student cannot tap a locked tile.
- **Distractor tiles never pair.** Stage-3 distractors sit in the `right` array but are not keys in `round.pairs`. Tapping any left + distractor combination always evaluates to wrong and triggers step 6 with the distractor's misconception tag attached to `recordAttempt`.
- **Partial credit: none.** A pair is binary locked / not locked. No partial scoring.
- **Timer never resets between rounds** — it is continuous from `startGameAfterPreview()` until victory or game-over.
