# Common Mistakes & Resolutions — MathAI Game Templates

> Recurring bugs found across 27 game templates during production readiness audits. Each entry documents the pattern, root cause, symptom, fix, and which games were affected.
>
> **Use this file to audit existing games and prevent these mistakes in new ones.**

---

## Table of Contents

1. [Signal Events Lost After seal()](#1-signal-events-lost-after-seal)
2. [Subtitle/Sticker Bleeding Between Screens](#2-subtitlesticker-bleeding-between-screens)
3. [Sticker API Format Mismatch](#3-sticker-api-format-mismatch)
4. [Double Audio on Transitions](#4-double-audio-on-transitions)
5. [Cleanup Race Condition on Restart](#5-cleanup-race-condition-on-restart)
6. [postMessage Blocked by Audio Await](#6-postmessage-blocked-by-audio-await)
7. [Level 1 Audio Silent (No Welcome Screen)](#7-level-1-audio-silent-no-welcome-screen)
8. [StickerComponent.configure() Crash](#8-stickercomponentconfigure-crash)
9. [Unused Preloaded Audio](#9-unused-preloaded-audio)
10. [Hardcoded totalRounds](#10-hardcoded-totalrounds)
11. [Dead Timer Variable](#11-dead-timer-variable)
12. [Incorrect Answer on Last Life Skips Feedback](#12-incorrect-answer-on-last-life-skips-feedback)

---

## 1. Signal Events Lost After seal()

**Severity:** Critical (data loss)
**Affected Games:** 13 out of 27 templates
**Found in:** adjustment-strategy, bubble-pairs-2, bubbles-pairs, connect-swipe, doubles, doubles_chain_game, eq-ratio, kakuro, queens, same-rule, scale-it-up, scale_it_up, total-in-flash

### Pattern

```javascript
// ❌ WRONG — event recorded AFTER seal() is called
var signalPayload = signalCollector.seal();  // Freezes the collector
signalCollector.recordViewEvent('screen_transition', { ... });  // LOST — collector is sealed
window.parent.postMessage({ type: 'game_complete', data: { ...signalPayload } }, '*');
```

### Root Cause

`signalCollector.seal()` freezes the collector and returns the final payload. Any `recordViewEvent()`, `recordCustomEvent()`, or `endProblem()` calls after `seal()` are silently discarded — no error thrown, data just lost.

### Fix

```javascript
// ✅ CORRECT — all events recorded BEFORE seal()
signalCollector.endProblem(problemId, outcome);  // First: flush pending problem
signalCollector.recordViewEvent('screen_transition', { ... });  // Second: record final event
var signalPayload = signalCollector.seal();  // Last: freeze and extract
window.parent.postMessage({ type: 'game_complete', data: { ...signalPayload } }, '*');
```

### Audit Check

Search for `seal()` in every game. Verify NO `signalCollector.record*` or `endProblem` calls appear after it.

---

## 2. Subtitle/Sticker Bleeding Between Screens

**Severity:** Critical (visual bug)
**Affected Games:** 20 out of 27 templates (all that use `stream.stopAll()` for cleanup)

### Pattern

```javascript
// ❌ WRONG — audio stops but subtitle/sticker stays visible
FeedbackManager.sound.stopAll();
FeedbackManager.stream.stopAll();
transitionScreen.hide();
showNextScreen();
// User sees previous screen's subtitle for 1-3 seconds on next screen
```

### Root Cause

`sound.stopAll()` and `stream.stopAll()` stop audio playback but do NOT hide the subtitle or sticker UI components. The `SubtitleComponent` and `StickerComponent` have their own visibility state that must be explicitly cleared.

**FeedbackManager internal hierarchy:**
- `FeedbackManager.sound.stopAll()` → stops audio only
- `FeedbackManager.stream.stopAll()` → stops streams only
- `FeedbackManager.feedback` → `FeedbackComponentsManager` (has `hideAll()`, `hideSubtitle()`, `hideSticker()`)
- `FeedbackManager._stopCurrentDynamic()` → stops current dynamic audio stream + calls `feedback.hideAll()` internally + clears tracking IDs

### Fix

```javascript
// ✅ CORRECT — _stopCurrentDynamic() is the all-in-one cleanup
try { FeedbackManager._stopCurrentDynamic(); } catch(e) {}
try { FeedbackManager.sound.stopAll(); } catch(e) {}
gameState.currentDynamicAudio = null;
```

Use `_stopCurrentDynamic()` in:
- Every button action on transition screens (level, round, results)
- Start of every transition function (showRoundTransition, showLevelTransition)
- Retry/restart button actions

### Common Wrong Approaches

```javascript
// ❌ FeedbackManager.hideAll() — does NOT exist as a top-level method (silently fails)
FeedbackManager.hideAll();

// ❌ Works but is the low-level internal API — prefer _stopCurrentDynamic()
FeedbackManager.feedback.hideAll();
```

---

## 3. Sticker API Format Mismatch

**Severity:** Critical (broken stickers)

### Pattern

The two main FeedbackManager APIs expect **different sticker formats**:

| API | Sticker Parameter | Format |
|-----|-------------------|--------|
| `FeedbackManager.sound.play(id, opts)` | `opts.sticker` | Object: `{ image: URL, type: 'IMAGE_GIF' }` |
| `FeedbackManager.playDynamicFeedback(params)` | `params.sticker` | Plain URL string |

### Wrong: Object passed to playDynamicFeedback

```javascript
// ❌ WRONG — playDynamicFeedback wraps sticker internally, so it does image: {object}
await FeedbackManager.playDynamicFeedback({
  audio_content: 'Great!',
  sticker: { image: 'https://cdn.../star.gif', type: 'IMAGE_GIF' }  // ❌ Object
});
```

**Result:** Broken sticker image (the `image` property becomes `[object Object]`)

### Wrong: String passed to sound.play

```javascript
// ❌ WRONG — sound.play passes sticker through to StickerComponent.show() which needs type/image
await FeedbackManager.sound.play('correct_sfx', {
  sticker: 'https://cdn.../star.gif'  // ❌ String — StickerComponent tries stickersList lookup, fails
});
```

**Result:** `StickerComponent: No JSON provided for LOTTIE sticker` error (defaults to LOTTIE type)

### Fix

```javascript
// ✅ CORRECT — sound.play gets object
await FeedbackManager.sound.play('correct_sfx', {
  sticker: { image: STICKER_URLS.correct, type: 'IMAGE_GIF' }
});

// ✅ CORRECT — playDynamicFeedback gets URL string
await FeedbackManager.playDynamicFeedback({
  audio_content: 'Great!',
  sticker: STICKER_URLS.correct  // Plain URL string
});
```

### Best Practice: STICKER_URLS Constant

```javascript
var STICKER_URLS = {
  correct:   'https://cdn.mathai.ai/.../correct.gif',
  incorrect: 'https://cdn.mathai.ai/.../incorrect.gif',
  victory:   'https://cdn.mathai.ai/.../victory.gif',
  // ... all stickers as plain URL strings
};
```

---

## 4. Double Audio on Transitions

**Severity:** High (audio plays twice)

### Pattern

```javascript
// ❌ WRONG — plays the same content twice (once as static, once as dynamic TTS)
await FeedbackManager.sound.play('level_1');  // Static preloaded voice
await FeedbackManager.playDynamicFeedback({   // Dynamic TTS of same text
  audio_content: DYNAMIC_AUDIO.level_1
});
```

### Root Cause

During development, games often start with static preloaded audio. When switching to dynamic TTS (`playDynamicFeedback`), the old `sound.play()` call for the same voice content isn't removed.

### Fix

**Rule:** Each audio moment should have ONE source:
- **SFX jingles** → `sound.play('correct_sound_effect', { sticker })` (short, pre-recorded)
- **Voice/narration** → `playDynamicFeedback({ audio_content, subtitle, sticker })` (TTS)
- **Never both for the same content**

```javascript
// ✅ CORRECT — SFX jingle first, then dynamic TTS (different content)
await FeedbackManager.sound.play('victory_sound_effect', { sticker: { image: URL, type: 'IMAGE_GIF' } });
await FeedbackManager.playDynamicFeedback({
  audio_content: 'Amazing! You got 3 stars!',
  subtitle: 'Amazing! You got 3 stars!',
  sticker: STICKER_URLS.victory
});
```

---

## 5. Cleanup Race Condition on Restart

**Severity:** Critical (components destroyed after recreation)

### Pattern

```javascript
async function endGame() {
  showResults(metrics);                    // Shows "Play Again" button

  await FeedbackManager.sound.play(...);   // ← User clicks "Play Again" during this await
  await FeedbackManager.playDynamicFeedback(...);  // ← restartGame() runs, recreates components

  // ❌ This runs AFTER restartGame() — destroys the NEW components!
  progressBar.destroy();                   // Destroys the just-recreated progressBar
  visibilityTracker.destroy();             // Destroys the just-recreated visibilityTracker
}
```

### Root Cause

`endGame()` is async. The results screen (with "Play Again" button) is shown before audio. If user clicks the button during audio:
1. `restartGame()` runs → sets `gameEnded = false`, recreates progressBar/visibilityTracker
2. Audio promise resolves/rejects (because `_stopCurrentDynamic()` was called)
3. `endGame()` resumes → cleanup code destroys the NEW components

### Fix

```javascript
// ✅ CORRECT — guard cleanup with gameEnded flag
async function endGame() {
  gameState.gameEnded = true;
  // ... metrics, show results, play audio ...

  // Guard: if restartGame() already ran, skip cleanup
  if (gameState.gameEnded) {
    if (progressBar) { progressBar.destroy(); progressBar = null; }
    if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
  }
}

function restartGame() {
  gameState.gameEnded = false;  // ← This prevents the endGame cleanup from running
  // ... reset state, recreate components ...
}
```

---

## 6. postMessage Blocked by Audio Await

**Severity:** Medium (delayed parent notification)

### Pattern

```javascript
// ❌ WRONG — parent waits for entire audio sequence before getting game_complete
await FeedbackManager.sound.play('victory_sfx');                    // 2-3 seconds
await FeedbackManager.playDynamicFeedback({ audio_content: '...' }); // 3-5 seconds
window.parent.postMessage({ type: 'game_complete', data: { ... } }, '*');  // Sent after 5-8 seconds!
```

### Root Cause

The parent window (which embeds the game iframe) needs `game_complete` to record results, update progress, etc. Sending it after audio `await` delays this by the entire audio duration.

### Fix

```javascript
// ✅ CORRECT — send postMessage BEFORE audio, so parent gets it immediately
showResults(metrics);
window.parent.postMessage({ type: 'game_complete', data: { ... } }, '*');

// Audio plays after — user sees results and hears celebration
await FeedbackManager.sound.play('victory_sfx');
await FeedbackManager.playDynamicFeedback({ audio_content: '...' });
```

---

## 7. Level 1 Audio Silent (No Welcome Screen)

**Severity:** High (no audio on first screen)

### Pattern

```javascript
// ❌ WRONG — if game skips welcome screen, first audio call fails silently
function setupGame() {
  showLevelTransition(1);  // Tries to play audio immediately
}

async function showLevelTransition(level) {
  // Browser blocks this — no user interaction has happened yet!
  await FeedbackManager.playDynamicFeedback({ audio_content: 'Level 1!' });
}
```

### Root Cause

Browsers require a user interaction (tap/click) before allowing audio playback. `FeedbackManager.init()` shows an unlock popup, but the audio context may not be ready by the time `showLevelTransition()` runs. Games with a welcome screen have a natural "Start" button click, but games that skip directly to Level 1 don't.

### Fix

```javascript
// ✅ CORRECT — poll canPlayAudio() before first audio
async function showLevelTransition(level) {
  transitionScreen.show({ ... });  // Show screen with "Let's go!" button

  // Wait for user interaction to unlock audio
  try {
    await new Promise(function(resolve) {
      if (FeedbackManager.canPlayAudio()) return resolve();
      var check = setInterval(function() {
        if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
      }, 200);
      setTimeout(function() { clearInterval(check); resolve(); }, 15000);  // 15s fallback
    });
  } catch(e) {}

  // Now audio will work
  await FeedbackManager.playDynamicFeedback({ audio_content: 'Level 1!' });
}
```

---

## 8. StickerComponent.configure() Crash

**Severity:** Critical (game-breaking error)

### Pattern

```javascript
// ❌ WRONG — StickerComponent loads async, may not be available
StickerComponent.configure({
  stickersList: [
    { name: 'correct', type: 'IMAGE_GIF', image: '...' },
    { name: 'incorrect', type: 'IMAGE_GIF', image: '...' }
  ]
});
// Error: StickerComponent is not defined
```

### Root Cause

`StickerComponent` is loaded asynchronously as part of the components package. `configure()` sets up a `stickersList` for name-based lookup. But:
1. The component may not be loaded when `configure()` runs
2. Name-based lookup is unnecessary when passing inline sticker objects

### Fix

Don't use `StickerComponent.configure()` at all. Pass stickers as inline objects:

```javascript
// ✅ CORRECT — no configure needed
// For sound.play():
FeedbackManager.sound.play('sfx', { sticker: { image: URL, type: 'IMAGE_GIF' } });

// For playDynamicFeedback():
FeedbackManager.playDynamicFeedback({ sticker: URL_STRING });
```

---

## 9. Unused Preloaded Audio

**Severity:** Low (wasted bandwidth, ~50-200KB per unused file)

### Pattern

```javascript
// ❌ WRONG — these voice files are preloaded but never used in sound.play()
await FeedbackManager.sound.preload([
  { id: 'correct_sound_effect', url: '...' },     // ✅ Used in sound.play('correct_sound_effect')
  { id: 'level_1', url: '...' },                   // ❌ Never used — voice moved to playDynamicFeedback
  { id: 'game_over', url: '...' },                 // ❌ Never used — voice moved to playDynamicFeedback
  { id: 'victory', url: '...' },                   // ❌ Never used — voice moved to playDynamicFeedback
]);
```

### Root Cause

When migrating from static audio (`sound.play('level_1')`) to dynamic TTS (`playDynamicFeedback`), the old static voice files remain in the preload list. They download on every game load but are never played.

### Fix

Audit every preloaded ID. For each one, search for `sound.play('that_id')`. If no match, remove it.

---

## 10. Hardcoded totalRounds

**Severity:** Medium (wrong progress bar / round tracking)

### Pattern

```javascript
// ❌ WRONG — hardcoded, doesn't adapt to content
window.gameState = { totalRounds: 5 };
progressBar = new ProgressBarComponent({ totalRounds: 5 });
```

### Fix

```javascript
// ✅ CORRECT — sync from content
if (!gameState.content) gameState.content = fallbackContent;
gameState.totalRounds = gameState.content.rounds.length;
progressBar = new ProgressBarComponent({ totalRounds: gameState.totalRounds });

// Also update in handlePostMessage:
function handlePostMessage(event) {
  gameState.content = event.data.data.content;
  if (gameState.content?.rounds) gameState.totalRounds = gameState.content.rounds.length;
}
```

---

## 11. Dead Timer Variable

**Severity:** Low (dead code, confusing)

### Pattern

```javascript
// ❌ WRONG — timer declared but never used (game has no timer)
let timer = null;

// VisibilityTracker has unnecessary timer guards:
onInactive: () => {
  if (timer) timer.pause({ fromVisibilityTracker: true });  // Always no-op
},
onResume: () => {
  if (timer?.isPaused) timer.resume({ fromVisibilityTracker: true });  // Always no-op
}
```

### Root Cause

Copy-pasted from a template that uses TimerComponent. Harmless (null checks protect against errors) but adds confusion and dead code.

### Fix

If game doesn't use TimerComponent, don't declare `timer` and remove timer references from VisibilityTracker handlers.

---

## 12. Incorrect Answer on Last Life Skips Feedback

**Severity:** High (no feedback before game over)

### Pattern

```javascript
// ❌ WRONG — when lives hit 0, jumps directly to game over (no incorrect feedback shown)
gameState.lives--;
if (gameState.lives <= 0) {
  await handleGameOver();  // User sees game over without understanding what went wrong
}
```

### Fix

Two valid approaches:

**Approach A:** Play feedback before game over (position-maximizer pattern)
```javascript
if (gameState.lives <= 0) {
  // Skip SFX (game_over_sound_effect will play instead), go to game over
  // But the game over screen itself shows "Oops!" message
  gameState.pendingEndProblem = { ... };
  await handleGameOver();
}
```

**Approach B:** Play incorrect feedback, THEN game over
```javascript
if (gameState.lives <= 0) {
  await FeedbackManager.sound.play('incorrect_sound_effect', { sticker: ... });
  await FeedbackManager.playDynamicFeedback({ audio_content: incorrectText });
  await handleGameOver();
}
```

Choose based on UX preference. Key point: the user must understand WHY they lost.

---

## Cross-Cutting Audit Queries

Run these searches to find affected games:

```bash
# 1. Signal events after seal (13 games affected)
grep -l "seal()" templates/*/game/index.html | xargs -I{} sh -c 'echo "=== {} ===" && grep -n "seal\|recordViewEvent\|recordCustomEvent\|endProblem" {}'

# 2. Missing _stopCurrentDynamic (20 games affected)
grep -rL "_stopCurrentDynamic" templates/*/game/index.html

# 3. StickerComponent.configure usage
grep -rl "StickerComponent.configure" templates/*/game/index.html

# 4. Unused preloads (manual: check each preloaded ID has a sound.play match)
grep -n "preload\|sound.play" templates/*/game/index.html

# 5. postMessage after audio await
grep -B5 "game_complete" templates/*/game/index.html | grep -A5 "await.*sound.play\|await.*playDynamic"
```

---

## Prevention

1. **Before shipping:** Run every query in "Cross-Cutting Audit Queries" above
2. **In spec.md:** Document the exact signal → seal → postMessage → screen → audio ordering
3. **In game code:** Add comments at critical ordering points (e.g., `// IMPORTANT: recordViewEvent BEFORE seal()`)
4. **When copying from templates:** Check if the source template has these bugs — many do
5. **When switching from static to dynamic audio:** Remove all old static voice preloads and `sound.play` calls for voice content
