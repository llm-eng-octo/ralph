# Timing, Blocking, and Audio Control

How feedback timing works in production: what to await, what to fire-and-forget, when to stop, when to pause, and how input blocking integrates with the data contract.

## Await vs Fire-and-Forget

Production games await `FeedbackManager.sound.play()` and `FeedbackManager.playDynamicFeedback()` **directly inside `try/catch`** — no wrappers, no `Promise.race`, no `Promise.all` floors. The package owns all failure timeouts (2.5s ceiling on JIT-load, API fetch, stream setup, stream first-chunk) and resolves with a status object on failure. Playing audio always runs to its natural end. Fire-and-forget calls are not awaited — `.catch()` is chained for error handling. Validator: `5e0-FEEDBACK-RACE-FORBIDDEN` rejects any `Promise.race` wrapping a FeedbackManager call.

| Feedback moment | Await? | Reasoning |
|----------------|--------|-----------|
| Level transition SFX → VO | **Yes** (sequential, CTA interrupts) | SFX awaited, then VO awaited; CTA stops all mid-sequence |
| Round transition (auto-advance, no CTA) | **Yes** (sequential) | SFX awaited, then VO awaited; audio IS the pacing |
| Round transition (with CTA) | **Yes** (sequential, CTA interrupts) | SFX awaited, then VO awaited; CTA stops all mid-sequence |
| Round start dynamic TTS | No | Student should interact immediately |
| Correct SFX (single-step) | **Yes** | Bare `try { await FeedbackManager.sound.play(...) } catch(e){}`; package bounds JIT-load failure at 2.5s |
| Correct TTS (single-step) | **Yes** | Awaited so the explanation finishes BEFORE the round advances. Without await, the TTS subtitle/audio paints over the next round's transition (equivalent-ratios regression). |
| Correct SFX (multi-step, mid-round match) | No | SFX + sticker only, fire-and-forget; no dynamic TTS |
| Round complete SFX | **Yes** | Gate before next round advances |
| Round complete TTS | **Yes** (awaited) **if the spec includes a Bloom L2+ explanation for the round** | Same reasoning as single-step correct TTS — finishes before round advance. For Bloom L1 multi-step rounds, the SFX + subtitle alone is enough; no TTS. |
| Wrong SFX (single-step) | **Yes** | Bare `try { await FeedbackManager.sound.play(...) } catch(e){}`; package bounds JIT-load failure at 2.5s |
| Wrong TTS (single-step) | **Yes** | Awaited so the explanation finishes BEFORE retry/advance. Without await, the TTS bleeds into the retry input or the next round. |
| Wrong SFX (multi-step) | No | SFX + sticker only, fire-and-forget; no dynamic TTS |
| Explanatory TTS (Bloom L2+, any moment) | **Yes** | If `playDynamicFeedback`'s `audio_content` carries a Bloom L2+ explanation (a *why*, not just an ack), it MUST be awaited so the student actually hears it. Bloom L1 acks (e.g., "Yes!", "Correct!") MAY remain fire-and-forget. |
| Tile select / deselect SFX | No | Pure ambient micro-interaction |
| Partial progress SFX (chains) | No | SFX + sticker only, fire-and-forget; no mid-chain TTS/VO — student keeps interacting (CASE 10) |
| End-game SFX → VO (victory/game-over) | **Yes** (sequential) | But screen + CTA already visible, so student CAN interrupt |
| New cards / content appearing SFX | No | Ambient |

### Submit-handler Pattern (Single-step games — SFX awaited, then TTS awaited)

```javascript
// BEFORE any await: lock input so the game freezes, not the TTS pipeline
gameState.isProcessing = true;
// ... disable buttons / voiceInput.disable() here ...
// ... visual feedback (CSS classes) ...
// ... recordAttempt ...
// SFX awaited directly — package bounds JIT-load failure at 2.5s; playing audio
// runs to natural end. Status object resolves on failure (try/catch only catches AbortError).
try {
  await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER });
} catch(e) { /* AbortError only */ }
// TTS awaited directly — package bounds API + stream-setup + first-chunk at 2.5s on failure;
// playing TTS runs to natural end (NOT truncated). Validator: GEN-FEEDBACK-TTS-AWAIT.
try {
  await FeedbackManager.playDynamicFeedback({
    audio_content: 'Great! 5 in the thousands place gives 5000',
    subtitle: 'Great! 5 in the thousands place gives 5000',
    sticker: CORRECT_STICKER
  });
} catch(e) { /* AbortError only */ }
// Do NOT re-enable here. renderRound() / loadRound() re-enables inputs when the next round paints.
// advance to next round
```

**Carve-outs that remain fire-and-forget.** TTS is awaited only when it carries an explanation tied to a specific moment (submit handlers, round-complete). The following sites stay fire-and-forget because the audio has no explanatory payload and/or the student should keep interacting:

| Moment | Why fire-and-forget |
|---|---|
| Round-start dynamic TTS | Contextual welcome, not feedback — student should interact immediately (multi-round only; standalone is OFF by default per CASE 3) |
| Partial progress SFX in chains | Ambient progress acknowledgement — fire-and-forget SFX only, no mid-chain VO/TTS (CASE 10) |
| Tile select / deselect SFX | Pure micro-interaction (CASE 9) |
| New cards / content appearing SFX | Ambient (CASE 17) |
| Multi-step mid-round match SFX | SFX + sticker only — no TTS exists (CASE 5) |

### Fire-and-Forget Pattern

```javascript
FeedbackManager.sound.play('correct_sound_effect', {
  sticker: CORRECT_STICKER
}).catch(function(e) { console.error('Audio error:', e.message); });
// student can interact immediately — no await, no isProcessing block
```

## Input Blocking

`gameState.isProcessing` is the single gatekeeper. Every interaction handler must check it:

```javascript
if (gameState.isProcessing) return;
```

**When to set `isProcessing = true`:** at the top of every awaited-feedback handler (submit, retry, timer-expiry `onEnd`, API-failure handler entry, round-complete, end-game) — BEFORE any `await`. Set in the same pre-await block as the modality-specific disables: `.dnd-disabled` on the board wrapper (P6 — sole functional lock on `@dnd-kit/dom`), `voiceInput.disable()` (P17), `timer.pause()` (PART-006), `floatingBtn.setSubmittable(false)` (FloatingButton).

**When to set `isProcessing = false`:** depends on the path. Detailed per-shape × per-event timing in [interaction/reference/state-and-guards.md § Lifecycle matrix](../../interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix). High-level:
- Submit-correct / submit-wrong-with-lives (multi-round predicate-driven): `renderRound()` / `loadRound()` of the next round is the re-enable site. Handler does NOT flip the flag.
- Standalone Try Again: `on('retry')` handler is the re-enable site.
- Multi-round explicit retry button (`roundRetryButton: true`): `on('retry')` handler delegates to `renderRound(currentRound)` for same-round re-render OR re-enables directly — pick one.
- API-failure: catch branch in the submit handler re-enables.
- Terminal game-over: remove `.dnd-disabled` from board wrapper before `endGame()` teardown so end-game UI stays tappable.

**Optional defense-in-depth: `.is-processing` on `#gameContent`.** Adds `pointer-events: none` to voice-input, action-row, submit-btn — a workaround for the CDN VoiceInput bug where `.disable()` only blocks the textarea, not the mic toggle. Add at the same site as `isProcessing = true`; remove at the same site as `isProcessing = false`. This is an extra layer for P17 games specifically; on `@dnd-kit/dom` games the equivalent is `.dnd-disabled` on the board wrapper (which IS load-bearing, not defense-in-depth).

**When NOT to block input:**
- Multi-step correct matches (fire-and-forget)
- Tile select/deselect (micro-interactions)
- Dynamic TTS at round start
- Partial progress audio (chain games)

## Stop Triggers

`sound.stopAll()` and `stream.stopAll()` now also abort the ambient `runSequence` automatically. Existing call patterns work unchanged; you do NOT need a new method.

| Trigger | What to call |
|---------|-------------|
| CTA tapped on transition / results / game-over | `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()` |
| New transition screen appearing | same (clear previous screen's audio) |
| Student taps during dynamic TTS | `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()` (canonical stop pair) |
| Restart / Try Again | `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()` |
| `nextRound()` / `scheduleNextRound()` / `showRoundIntro(n)` entry | same — FIRST line, before `currentRound++` / `transitionScreen.show()`. Validator: `GEN-ROUND-BOUNDARY-STOP`. |
| `endGame()` / `restartGame()` entry | same — FIRST line after the `gameEnded` guard. |
| Level-transition button `action` | same — before `startLevel()` / `nextLevel()`. |
| Pause (visibility hidden) | `FeedbackManager.sound.pause()` + `FeedbackManager.stream.pauseAll()` — pause is NOT stop; does NOT abort `runSequence`. |

**Why the last four rows exist:** The FeedbackManager overlay auto-clear fires only when a NEW `playDynamicFeedback()` call starts. Silent round auto-advance, restart, end-screen entry, and level transitions do NOT necessarily start a new dynamic feedback — so the previous round's subtitle + sticker + audio will bleed into the new phase unless stopped explicitly. See SKILL.md Student-Visible Invariants and Anti-pattern 10.

## Round/Phase Cleanup (Canonical Call)

Every round-boundary function (`nextRound`, `scheduleNextRound` timeout body, `endGame`, `restartGame`, level-transition `action`) MUST execute this block as its FIRST statement, before mutating `gameState`:

```javascript
// Canonical cleanup — MUST run BEFORE any gameState mutation
try { FeedbackManager.sound.stopAll(); } catch (e) {}
try { FeedbackManager.stream.stopAll(); } catch (e) {}

// If the game renders custom feedback DOM outside FeedbackManager's overlay:
if (feedbackEl) {
  feedbackEl.textContent = '';
  feedbackEl.classList.remove('show', 'correct', 'incorrect', 'visible');
}
```

**Ordering in `endGame()`** (cleanup slots in right after the re-entry guard):

```javascript
async function endGame(reason) {
  if (gameState.gameEnded) return;       // 1. re-entry guard
  gameState.gameEnded = true;             // 2. set guard flag
  try { FeedbackManager.sound.stopAll(); } catch(e) {}   // 3. cleanup FIRST
  try { FeedbackManager.stream.stopAll(); } catch(e) {}
  gameState.isActive = false;             // 4. stop accepting input
  gameState.phase = reason === 'victory' ? 'results' : 'gameover';  // 5. phase
  syncDOMState();                         // 6. propagate to data-phase
  // 7. results screen + postMessage + end-game audio (as defined by End-Game Data Contract)
  await transitionScreen.show({ ... });
}
```

**Why this ordering (matches GEN-PHASE-SEQUENCE):** cleanup runs BEFORE phase assignment so no audio is still resolving when `syncDOMState()` paints the new `data-phase`; phase assignment runs BEFORE `syncDOMState()` so the 500ms test harness poll never reads a stale value. Running cleanup AFTER state mutation opens a 1–2 frame window where the next round paints with the previous round's sticker still on screen — visually jarring and detectable in Playwright screenshots.

**Caller does NOT need to also call `FeedbackManager._stopCurrentDynamic()`** — the canonical stop pair `sound.stopAll()` + `stream.stopAll()` covers both static SFX and dynamic TTS, and aborts the ambient `runSequence` automatically. `_stopCurrentDynamic()` is package-internal and only exists for legacy code paths; new game code should not call it.

## Pause / Resume Triggers

Only triggered by visibility change:

```javascript
// Tab hidden / screen lock:
FeedbackManager.sound.pause();
FeedbackManager.stream.pauseAll();
timer.pause({ fromVisibilityTracker: true });

// Tab visible / return:
FeedbackManager.sound.resume();
FeedbackManager.stream.resumeAll();
timer.resume({ fromVisibilityTracker: true });
```

Pause ≠ Stop. Pause keeps the audio position so it can resume. Stop discards it.

## Round/Level/End-Game Audio Sequence

Sequential awaited audio (SFX → TTS) MUST be wrapped in `FeedbackManager.runSequence(async () => { ... })`. CTA `action` calls the existing stop methods (`sound.stopAll()` / `stream.stopAll()`) — those now also abort the ambient `runSequence`, so any *next* awaited call inside the callback short-circuits. Rationale + ban on legacy `audioStopped` flag in `feedbackmanager-api.md` § Sequential Audio. Validator: `GEN-FEEDBACK-RUN-SEQUENCE`.

```javascript
// Transition / end-game canonical shape — applies to round, level, victory, game-over.
ctaButton.onclick = function () {
  try { FeedbackManager.sound.stopAll(); } catch (e) {}
  try { FeedbackManager.stream.stopAll(); } catch (e) {}
  proceed();
};
FeedbackManager.runSequence(async () => {
  // SFX awaited directly — package owns failure bounds.
  try { await FeedbackManager.sound.play(sfxId, { sticker }); } catch (e) {}
  try { await FeedbackManager.playDynamicFeedback({ audio_content: ttsText, subtitle: ttsText, sticker }); } catch (e) {}
});
```

Auto-advance (no CTA) variants use the same wrapper; just omit the `ctaButton.onclick` line.

## Wrong Answer Visual Timing

- `.wrong` / `.incorrect` CSS class applied immediately
- Class cleared after ~600ms (via setTimeout)
- In some games, the wrong option becomes permanently disabled (`.filled` with gray background)
- The FeedbackManager audio plays in parallel with the visual flash

## Data Contract Integration

When an answer is submitted, execute in this exact order:

```
1. gameState.isProcessing = true          — block input (set BEFORE any await)
   + disable voiceInput / buttons          — defense-in-depth; also BEFORE any await
2. Apply visual CSS (.correct / .wrong)   — immediate visual feedback
3. Update state (lives--, score++)        — update game state
4. progressBar.update(round, lives)       — update UI immediately
5. recordAttempt({...})                   — log attempt BEFORE audio
6. signalCollector.recordViewEvent(...)   — record feedback event
7a. try { await FeedbackManager.sound.play(...); } catch(e){}
    — play SFX with sticker. Package bounds JIT-load failure at 2.5s; playing audio runs to natural end.
7b. [Single-step + round-complete] try { await FeedbackManager.playDynamicFeedback(...); } catch(e){}
    — dynamic TTS awaited. Package bounds API + stream-setup + first-chunk failure at 2.5s; playing TTS runs to natural end.
    Validator: GEN-FEEDBACK-TTS-AWAIT.
8. Advance (renderRound / loadRound / endGame)
   — renderRound / loadRound is the single source of truth for re-enabling inputs
   (it sets isProcessing = false, voiceInput.enable(), btn.disabled = false, etc.)
   DO NOT set isProcessing = false in the submit handler.
   Exception: API-failure path (LLM timeout / error, can't advance) re-enables in-handler
   so the user can retry; terminal game-over also handles its own re-enable.
```

**Why this order:**
- `recordAttempt` fires BEFORE audio so the attempt captures pre-feedback state
- `progressBar.update` fires BEFORE audio so student sees the heart/round change immediately
- Visual CSS applies BEFORE audio so student sees green/red while audio plays
- SFX is awaited directly; the package bounds JIT-load failure at 2.5s so the round never stalls on a missing/broken sound
- Dynamic TTS is awaited so the explanation finishes attached to the answer it explains; the package bounds API + stream-setup + first-chunk failure at 2.5s and resolves with a status object — playing TTS is never truncated
- Inputs are re-enabled only by the next `renderRound()` / `loadRound()` — same single-source-of-truth invariant as before; awaited TTS just delays when `renderRound` is reached

### Defense-in-depth CSS (optional but recommended)

Add `.is-processing` to `#gameContent` at the start of the submit handler; clear it in `renderRound()`. Style it as `pointer-events: none` on voice-input, action-row, submit-btn. The CDN VoiceInput has a known bug where `.disable()` only blocks the textarea but not the mic toggle — this CSS works around it.

```css
#gameContent.is-processing .voice-input,
#gameContent.is-processing .action-row,
#gameContent.is-processing #submit-btn {
  pointer-events: none;
}
```

## End-Game Data Contract

The end-game sequence has a strict order:

```
1. gameState.isActive = false             — stop accepting input
2. timer.pause()                          — freeze the timer
3. Calculate metrics (stars, accuracy)    — compute final results
4. signalCollector.seal()                 — finalize signal data
5. Render results/game-over screen        — SCREEN FIRST
6. window.parent.postMessage(game_complete) — DATA BEFORE AUDIO
7. await end-game SFX → VO               — audio plays last
8. Cleanup (destroy timer, tracker, etc.) — after audio finishes
```
