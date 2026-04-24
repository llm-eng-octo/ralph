# PART-017: Feedback Integration

**Category:** EXTENSION | **Condition:** Added after initial HTML is approved | **Dependencies:** PART-003

---

This part is NOT included in initial HTML generation. It's added later via Edit.

## Standard Assets

### Audio URLs

| Sound ID                       | URL                                                                                                | When to Use                          |
| ------------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `correct_tap`                  | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3`                  | Simple correct answer feedback       |
| `wrong_tap`                    | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3`                  | Simple incorrect answer feedback     |
| `all_correct`                  | `https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/ab12c9db-1f0c-4ce3-a215-afc86e385df8.mp3` | All parts of answer correct          |
| `partial_correct_attempt1`     | `https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/45389c85-82d1-47af-ab9c-37327f9df527.mp3` | Partially correct, retries remaining |
| `partial_correct_last_attempt` | `https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/2061b06a-12ee-4edf-a850-7b86ee9cdabd.mp3` | Partially correct, no retries left   |
| `all_incorrect_attempt1`       | `https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b3faaea8-4fc0-4169-ab5e-6699097b8257.mp3` | All wrong, retries remaining         |
| `all_incorrect_last_attempt`   | `https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/6420e861-2213-4855-8992-e3e964fabb29.mp3` | All wrong, no retries left           |

**When to use which:** Use `correct_tap`/`wrong_tap` for simple right/wrong games. Use the detailed variants (`all_correct`, `partial_correct_*`, `all_incorrect_*`) for games with multi-part answers or multiple attempts per question.

### Sticker URLs

| Sticker ID        | URL                                                                                   | Type        | When to Use                                      |
| ----------------- | ------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `correct`         | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-30.gif` | `IMAGE_GIF` | Correct answer                                   |
| `incorrect`       | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-49.gif` | `IMAGE_GIF` | Incorrect answer                                 |
| `checking`        | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1742961316441-47.gif` | `IMAGE_GIF` | While evaluating (e.g., subjective eval loading) |
| `all_correct`     | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1742961316441-91.gif` | `IMAGE_GIF` | All parts correct                                |
| `partial_correct` | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1742961316441-51.gif` | `IMAGE_GIF` | Partially correct (any attempt)                  |
| `try_again`       | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1742961316441-80.gif` | `IMAGE_GIF` | Encouraging retry                                |

## Code — Audio Preloading

**MUST use `preload()` with an array of `{id, url}` objects. There is NO `register()` method.**

```javascript
// Simple games — preload just correct/wrong
try {
  await FeedbackManager.sound.preload([
    { id: 'correct_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3' },
    { id: 'wrong_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3' },
  ]);
} catch (e) {
  console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2));
}

// Multi-part / multi-attempt games — preload all feedback variants
try {
  await FeedbackManager.sound.preload([
    {
      id: 'all_correct',
      url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/ab12c9db-1f0c-4ce3-a215-afc86e385df8.mp3',
    },
    {
      id: 'partial_correct_attempt1',
      url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/45389c85-82d1-47af-ab9c-37327f9df527.mp3',
    },
    {
      id: 'partial_correct_last_attempt',
      url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/2061b06a-12ee-4edf-a850-7b86ee9cdabd.mp3',
    },
    {
      id: 'all_incorrect_attempt1',
      url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/b3faaea8-4fc0-4169-ab5e-6699097b8257.mp3',
    },
    {
      id: 'all_incorrect_last_attempt',
      url: 'https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/6420e861-2213-4855-8992-e3e964fabb29.mp3',
    },
  ]);
} catch (e) {
  console.error('Sound preload error:', JSON.stringify({ error: e.message }, null, 2));
}
```

## Code — Playing Audio with Sticker

### CRITICAL: Minimum Feedback Duration (Promise.all wrapper)

`FeedbackManager.sound.play()` can resolve **BEFORE** the audio finishes playing. Any code after `await sound.play(...)` (round advance, tile reset, game-over check) may run while the audio/sticker is still audible. All answer-feedback `sound.play()` calls MUST be wrapped in `Promise.all` with a 1500ms minimum delay floor.

```javascript
// Correct answer — wrapped in Promise.all for minimum duration
try {
  await Promise.all([
    FeedbackManager.sound.play('correct_tap', {
      subtitle: '**Great job!** That is correct!',
      sticker: {
        image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-30.gif',
        duration: 2,
        type: 'IMAGE_GIF',
      },
    }),
    new Promise(function (r) {
      setTimeout(r, 1500);
    }),
  ]);
} catch (e) {
  console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2));
}
// Next action goes here — audio has fully played

// Incorrect answer — same Promise.all wrapper
try {
  await Promise.all([
    FeedbackManager.sound.play('wrong_tap', {
      subtitle: 'Not quite. Try again!',
      sticker: {
        image: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757512958230-49.gif',
        duration: 2,
        type: 'IMAGE_GIF',
      },
    }),
    new Promise(function (r) {
      setTimeout(r, 1500);
    }),
  ]);
} catch (e) {
  console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2));
}
// Next action goes here — audio has fully played
```

**Applies to:** `sound_life_lost`, `sound_correct`, `wrong_tap`, `correct_tap`, `sound_incorrect`, `all_correct`, `all_incorrect_*`, `partial_correct_*`.

**Does NOT apply to:** VO (`vo_game_start`, `vo_level_start_*`) or transition audio (`sound_game_complete`, `sound_game_over`, `sound_game_victory`) — these play during transition screens with no immediate state change after.

Validator rule: `5e0-FEEDBACK-MIN-DURATION`. See also PART-026 Anti-Pattern 34.

## Code — Dynamic Audio (TTS for completion)

```javascript
const text = `You scored ${accuracy}% in ${time} seconds!`;
await FeedbackManager.playDynamicFeedback({
  audio_content: text,
  subtitle: text, // MUST equal audio_content verbatim — never shorten / summarize
  sticker: 'https://cdn.mathai.ai/mathai-assets/lottie/trophy.json',
});
```

### MANDATORY: Subtitles Never Truncate

Long TTS sentences from dynamic audio (and any narrated content) routinely run 120–250+ characters. The CDN `SubtitleComponent` defaults to `maxWidth: 280px` and ambient styles in generated games often pull in `-webkit-line-clamp`, `text-overflow: ellipsis`, or `overflow: hidden`, which clip the rendered subtitle mid-sentence. Every generated game MUST do BOTH of the following:

**1. Configure the singleton once at init (right after `FeedbackManager.init()`):**

```javascript
SubtitleComponent.configure({
  position: {
    bottom: '60px',
    maxWidth: 'min(92vw, 720px)', // wide enough for long TTS, wraps within viewport
  },
});
```

**2. Inject this CSS override in the game's `<style>` block:**

```css
[class*='subtitle'],
[id*='subtitle'],
[class*='Subtitle'],
[id*='Subtitle'],
[class*='mathai-subtitle'] {
  max-width: min(92vw, 720px) !important;
  width: auto !important;
  height: auto !important;
  max-height: none !important;
  white-space: normal !important;
  overflow: visible !important;
  text-overflow: clip !important;
  display: block !important;
  -webkit-line-clamp: unset !important;
  -webkit-box-orient: unset !important;
  line-clamp: unset !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  line-height: 1.4 !important;
}
```

**3. Never shorten the `subtitle` prop to "fit":**

```javascript
// ❌ WRONG — hides half the sentence
await FeedbackManager.playDynamicFeedback({
  audio_content: longMessage,
  subtitle: longMessage.slice(0, 60) + '…',
});

// ❌ WRONG — subtitle doesn't match what's being said
await FeedbackManager.playDynamicFeedback({
  audio_content: 'You scored 95 out of 100 and finished in 42 seconds — great work!',
  subtitle: 'Great work!',
});

// ✅ CORRECT — subtitle === audio_content (verbatim)
const message = 'You scored 95 out of 100 and finished in 42 seconds — great work!';
await FeedbackManager.playDynamicFeedback({
  audio_content: message,
  subtitle: message,
});
```

**Applies to all call sites, not just dynamic audio:** `FeedbackManager.sound.play({ subtitle })`, `SubtitleComponent.show()`, transition screens, story playback, game-over messages — every subtitle, every time, shows the full text.

## Two Distinct APIs — Do NOT Confuse Them

### 1. Registered Sound (pre-loaded audio file)

```javascript
// Play a REGISTERED sound by its preloaded ID
// sound.play() is async — await it, then continue with next action
await FeedbackManager.sound.play('correct', {
  subtitle: 'Great job!',
  sticker: { image: '...', type: 'IMAGE_GIF' },
});
// Code here runs after audio finishes
```

The first argument is a **registered sound ID** (from `preload()`). This plays a local audio file.
`sound.play()` returns a Promise — use `await` and put your next action after it. There is NO `onComplete` callback.

### 2. Dynamic Feedback (TTS — generates audio from text)

```javascript
// Generate and play audio from TEXT (TTS streaming)
await FeedbackManager.playDynamicFeedback({
  audio_content: 'You scored 80% in 45 seconds!',
  subtitle: 'You scored 80% in 45 seconds!',
  sticker: '...',
});
```

This calls `playDynamicFeedback()` — a **top-level method** on FeedbackManager, NOT on `sound`.

### CRITICAL Anti-Pattern: Mixing the Two

```javascript
// WRONG — 'dynamic' is not a registered sound ID, this plays nothing
// and triggers a browser permission popup with no valid audio source
await FeedbackManager.sound.play('dynamic', { text: 'Great job!' });

// WRONG — sound.play() does not accept text/audio_content params
await FeedbackManager.sound.play('some-id', { audio_content: 'text' });

// CORRECT — use playDynamicFeedback for TTS
await FeedbackManager.playDynamicFeedback({
  audio_content: 'Great job!',
  subtitle: 'Great job!',
});
```

## Other Anti-Patterns

| Wrong                                                  | Correct                                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `new Audio('sound.mp3')`                               | `FeedbackManager.sound.play(id)`                                              |
| `SubtitleComponent.show('text')`                       | `subtitle` prop in `sound.play()`                                             |
| `FeedbackManager.sound.play('dynamic', {text})`        | `FeedbackManager.playDynamicFeedback({audio_content, subtitle})`              |
| `sound.play(id, { onComplete: fn })`                   | `await sound.play(id, {...}); fn();` — no `onComplete` callback exists        |
| `sound.register('id', 'url')`                          | `sound.preload([{id, url}])` — `register()` does NOT exist                    |
| `sound.register('a', url1); sound.register('b', url2)` | `sound.preload([{id:'a', url:url1}, {id:'b', url:url2}])` — single batch call |
| `sound.stopAll()` in VisibilityTracker onInactive      | `sound.pause()` — stopAll destroys state and can't resume                     |
| Preload in Phase 1                                     | Preload added in Phase 3 only                                                 |

## CRITICAL: `register()` Does NOT Exist

Many older templates incorrectly use `sound.register()`. This method **does not exist** on FeedbackManager.

```javascript
// WRONG — register() is not a real method, audio will silently fail
await FeedbackManager.sound.register('correct_tap', 'https://cdn.mathai.ai/.../1757501597903.mp3');
await FeedbackManager.sound.register('wrong_tap', 'https://cdn.mathai.ai/.../1757501956470.mp3');

// CORRECT — preload() takes an ARRAY of {id, url} objects (single batch call)
await FeedbackManager.sound.preload([
  { id: 'correct_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3' },
  { id: 'wrong_tap', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501956470.mp3' },
  // Add all_correct, partial_correct_*, all_incorrect_* for multi-attempt games
]);
```

## CRITICAL: VisibilityTracker Must Use `pause()` Not `stopAll()`

In VisibilityTracker `onInactive`, use `sound.pause()` — NOT `sound.stopAll()`. `stopAll()` destroys the audio state entirely and audio cannot be resumed when the user returns.

```javascript
// WRONG — destroys audio state, resume does nothing
onInactive: () => {
  FeedbackManager.sound.stopAll();
};
onResume: () => {
  /* nothing to resume */
};

// CORRECT — pause/resume preserves audio state
onInactive: () => {
  FeedbackManager.sound.pause();
  FeedbackManager.stream.pauseAll();
};
onResume: () => {
  FeedbackManager.sound.resume();
  FeedbackManager.stream.resumeAll();
};
```

## CRITICAL: No `Promise.race` on FeedbackManager Calls

FeedbackManager already bounds resolution internally:

| Method                       | Worst-case resolution time      | Mechanism                                  |
| ---------------------------- | ------------------------------- | ------------------------------------------ |
| `sound.play(id, opts)`       | audio duration + 1.5s           | Guard timeout → `finalizeVoice("timeout")` |
| `playDynamicFeedback({...})` | 60s streaming / 3s TTS API dead | Stream safety timeout + fetch timeout      |

**Templates MUST NOT wrap these calls in `Promise.race`.** Phase/round transitions await audio completion directly.

**Anti-pattern** (truncates normal TTS, causes round to advance while audio still plays):

```javascript
// WRONG — 800ms ceiling wins over normal 1–3s TTS; round advances before audio ends
function audioRace(p) {
  return Promise.race([p, new Promise((r) => setTimeout(r, 800))]);
}
await audioRace(FeedbackManager.sound.play('correct_sound_effect', { sticker }));
```

**Correct:**

```javascript
// RIGHT — SFX awaited (short, predictable ~1s), dynamic TTS fire-and-forget
// (game flow MUST NOT depend on TTS completion; if the network stalls, the next round still loads).
try {
  await FeedbackManager.sound.play('correct_sound_effect', { sticker });
} catch (e) {
  /* non-blocking — see feedback SKILL Rule 8 */
}
FeedbackManager.playDynamicFeedback({ audio_content, subtitle, sticker })
  .catch(function(e) { /* non-blocking — TTS error must not freeze the game */ });
```

"Non-blocking" means `try/catch` around SFX and `.catch()` on fire-and-forget TTS — never `Promise.race`. Validator rule: `5e0-FEEDBACK-RACE-FORBIDDEN`.

**Do NOT re-enable inputs after the audio block.** The next `renderRound()` / `loadRound()` is the single source of truth for re-enabling inputs (`isProcessing = false`, `voiceInput.enable()`, `btn.disabled = false`, etc.). Re-enabling after TTS blocks the next-round transition on audio completion.

## Verification

- [ ] `preload()` called with array of `{id, url}` objects — NOT `register()`
- [ ] No `sound.register()` calls anywhere
- [ ] `play()` uses asset IDs (not raw URLs)
- [ ] Subtitles passed as props (not SubtitleComponent.show())
- [ ] No `new Audio()` anywhere
- [ ] VisibilityTracker uses `sound.pause()`/`sound.resume()` — NOT `sound.stopAll()`
- [ ] No `Promise.race(...)` wrapping `FeedbackManager.sound.play` / `playDynamicFeedback` / `audioRace` helper; templates await FeedbackManager calls directly inside `try/catch`
- [ ] `SubtitleComponent.configure({ position: { maxWidth: 'min(92vw, 720px)' } })` called once at init (narrower `maxWidth` truncates dynamic TTS)
- [ ] Game `<style>` block includes the subtitle anti-truncation CSS override (no `-webkit-line-clamp`, no `text-overflow: ellipsis`, no `overflow: hidden`, no `white-space: nowrap` reaching the subtitle container)
- [ ] For every `playDynamicFeedback({ audio_content, subtitle })`, `subtitle` equals `audio_content` verbatim — never sliced, summarized, or replaced with a shorter label
- [ ] No `.slice(...)`, `…`, `substring(...)`, or `' ... '` concatenation applied to any value passed as `subtitle`
- [ ] Manual `SubtitleComponent.show({ text, duration })` calls: `duration` ≥ length of the accompanying audio (or rely on audio-driven auto-hide via `FeedbackManager`)
- [ ] Answer-feedback `sound.play()` calls wrapped in `Promise.all` with 1500ms minimum delay — bare `await` resolves before audio finishes (Anti-Pattern 34, validator rule `5e0-FEEDBACK-MIN-DURATION`)

## Source Code

Full FeedbackManager implementation: `warehouse/packages/feedback-manager/index.js`

- Contains SoundManager, StreamManager, AudioKitCore, PopupManager, FeedbackComponentsManager
- Read this source to understand: preload internals, play() promise behavior, subtitle/sticker timing, permission flow, iOS quirks

## Deep Reference

`mathai-game-builder/components/feedback-manager.md`
