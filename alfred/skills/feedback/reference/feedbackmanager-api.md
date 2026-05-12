# FeedbackManager API (Production Reference)

FeedbackManager is the CDN package (PART-017) that handles all audio, stickers, and subtitles. Games call it — they never build their own audio or overlay systems.

## CDN Script Tag

Include this script tag in `<head>` to load the FeedbackManager package:

```html
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
```

This is the **exact production URL** — do not modify it, do not use any other URL.

## Initialization

```javascript
// 1. Wait for all packages to load
await waitForPackages(); // polls for FeedbackManager, TimerComponent, etc.

// 2. Initialize FeedbackManager
await FeedbackManager.init();

// 3. Preload all static audio (use exact URLs from the Standard Audio URLs table below)
await FeedbackManager.sound.preload([
  { id: 'correct_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757588479110.mp3' },
  { id: 'incorrect_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3' },
  { id: 'victory_sound_effect', url: 'https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506672258.mp3' },
  // ... all SFX for this game from the Standard Audio URLs table below,
  // plus any creator-supplied static VO declared in the spec's `creatorSounds` block
]);
```

All three steps happen once during DOMContentLoaded, before the first screen appears.

## Audio Readiness Check

Before the first audio plays (typically on the first level/round screen), wait for audio permission:

```javascript
await new Promise(function(resolve) {
  if (FeedbackManager.canPlayAudio()) return resolve();
  var check = setInterval(function() {
    if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
  }, 200);
  setTimeout(function() { clearInterval(check); resolve(); }, 15000);
});
```

This only needs to run once — on the first transition screen. After that, audio is unlocked for the session.

## Sequential Audio — `FeedbackManager.runSequence(callback)` (MANDATORY)

Any function body awaiting 2+ audio calls back-to-back wraps in `runSequence`. CTA / screen-change handlers keep calling the existing stop methods (`sound.stopAll()` / `stream.stopAll()` / `_stopCurrentDynamic()`) — those now also abort the in-flight `runSequence` automatically.

```javascript
ctaButton.action = function () {
  try { FeedbackManager.sound.stopAll(); } catch (e) {}
  try { FeedbackManager.stream.stopAll(); } catch (e) {}
  transitionScreen.hide(); done();
};
FeedbackManager.runSequence(async () => {
  try { await safePlaySound('rounds_sound_effect', { sticker: STICKER_ROUND }); } catch (e) {}
  try { await FeedbackManager.playDynamicFeedback({ audio_content: 'Round 3', subtitle: 'Round 3', sticker: STICKER_ROUND }); } catch (e) {}
});
```

**Mechanism.** `runSequence` installs an ambient `AbortController` on `FeedbackManager`. Every internal `sound.play`, `stream.play`, and `playDynamicFeedback` (including its `fetch()`) checks that signal at entry and after each internal await. Calling `sound.stopAll()` / `stream.stopAll()` / `_stopCurrentDynamic()` — or starting another `runSequence` — aborts the controller. In-flight calls throw `AbortError` (caught silently by per-call `try/catch`); any *next* awaited call inside the callback short-circuits at its first line. Game code does NOT pass a signal — cancellation is internal.

**Why mandatory.** Without `runSequence`, calling `sound.stopAll()` mid-first-audio resolves the first await but does not stop the next awaited line from firing on the next screen. The legacy `var audioStopped = false; ... if (audioStopped) return;` flag is **forbidden** — it does not cover the in-flight `fetch()` window inside `playDynamicFeedback`. Validator: `GEN-FEEDBACK-RUN-SEQUENCE`.

Concurrency: only one sequence runs at a time; calling `runSequence` again aborts the previous.

---

## Two Audio APIs

### 1. Static Audio — `FeedbackManager.sound.play(id, options)`

Plays a pre-recorded, preloaded sound by ID. Used for SFX, and also for **static VO** when the creator has supplied a pre-recorded narration audio file (e.g. a custom "Welcome to ..." or victory line). Static VO is registered in the spec's `creatorSounds` block and preloaded the same way as SFX.

```javascript
await FeedbackManager.sound.play('correct_sound_effect', {
  sticker: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-95.gif'
});
```

**Parameters:**
- `id` (string, required) — matches an `id` from the `preload()` call
- `options.sticker` (string, optional) — **plain URL string** to the animated GIF. FeedbackManager wraps it internally into `{ image, duration, type: 'IMAGE_GIF' }`. Game code MUST pass a string, never the object form.
- `options.subtitle` (string, optional) — on-screen text

**Returns:** Promise that resolves when the audio finishes playing.

**WARNING — bare `await sound.play()` resolves early.** The promise can resolve before the audio actually finishes. For **answer-feedback SFX** (correct/wrong/life-lost/all-correct/round-complete) and any submit-handler SFX, always wrap in `Promise.all` with a 1500ms minimum floor — typically through the `safePlaySound(id, opts)` helper. Validator: `5e0-FEEDBACK-MIN-DURATION`. See PART-026 Anti-Pattern 34.

#### `safePlaySound(id, opts)` — required wrapper for answer-feedback SFX

`safePlaySound` is the canonical wrapper helper games use everywhere a SFX must fully play before the next side-effect. It is provided in game scaffolding (not part of the CDN package). Implementation shape:

```javascript
async function safePlaySound(id, opts) {
  try {
    await Promise.all([
      FeedbackManager.sound.play(id, opts),
      new Promise(function (r) { setTimeout(r, 1500); }),
    ]);
  } catch (e) {
    console.error('SFX error:', JSON.stringify({ id, error: e.message }, null, 2));
  }
}
```

Use `safePlaySound` for: correct/wrong SFX in submit handlers, round-complete SFX, level/round transition SFX, victory/game-over SFX. Do NOT use it for fire-and-forget micro-interactions (tile select/deselect, ambient `new_cards`, chain partial-match) — those use bare `sound.play(...).catch(...)`.

### 2. Dynamic TTS — `FeedbackManager.playDynamicFeedback(options)`

Generates text-to-speech on the fly. Used for content-specific narration that can't be pre-recorded.

```javascript
// Transition-screen / end-game context: awaited (CTA visible, user can interrupt)
try {
  await FeedbackManager.playDynamicFeedback({
    audio_content: 'Make 90',
    subtitle: 'Make 90',
    sticker: 'https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1759297084426-234.gif'
  });
} catch (e) {}

// Submit/answer handler context: ALSO awaited. The explanation must finish
// before round advance, else its subtitle/audio paints over the next round.
// Package bounds at 3s (API) / 60s (streaming); try/catch swallows rejection
// so a network failure still advances. Validator: GEN-FEEDBACK-TTS-AWAIT.
try {
  await FeedbackManager.playDynamicFeedback({
    audio_content: 'Great! 5 in the thousands place gives 5000',
    subtitle: 'Great! 5 in the thousands place gives 5000',
    sticker: CORRECT_STICKER
  });
} catch (e) { console.error('TTS error:', e.message); }
```

**When to await vs fire-and-forget:**
- **Await (default — transition-screen VO, end-game VO, submit/answer handlers, round-complete):** The explanation must finish before the next screen/round paints, else its subtitle/audio bleeds into the new phase. Package bounds at 3s API / 60s streaming + `try/catch` prevents freezes. Validator: `GEN-FEEDBACK-TTS-AWAIT` (see PART-026 Anti-Pattern 36). Re-enabling inputs is handled by `renderRound()` / `loadRound()` — the single source of truth.
- **Fire-and-forget carve-outs:** round-start TTS in `showRoundIntro` / `onMounted` for multi-round games (student should interact immediately) is the only fire-and-forget `playDynamicFeedback` site. Chain-progress / partial-match / tile-select / ambient SFX moments use `sound.play(...).catch(...)` instead — they play SFX only with no TTS (see CASE 10).

**Parameters:**
- `audio_content` (string, required) — text to speak
- `subtitle` (string, optional) — on-screen text, under 60 characters
- `sticker` (string, optional) — URL to sticker GIF

**Returns:** Promise. Can be stored and stopped later via `FeedbackManager._stopCurrentDynamic()`.

## Control Methods

| Method | When to use |
|--------|------------|
| `FeedbackManager.runSequence(cb)` | Wrap any body awaiting 2+ audio calls. See § Sequential Audio. |
| `FeedbackManager.sound.stopAll()` | CTA tap, screen change, restart, round/level boundary. Also aborts the ambient `runSequence`. |
| `FeedbackManager.stream.stopAll()` | Same; stops streaming TTS. Also aborts the ambient `runSequence`. |
| `FeedbackManager._stopCurrentDynamic()` | Stop in-flight dynamic feedback (calls into stopAll under the hood). |
| `FeedbackManager.sound.pause()` / `.resume()` | Visibility change (tab switch / restore). Pause ≠ stop; does NOT abort `runSequence`. |
| `FeedbackManager.stream.pauseAll()` / `.resumeAll()` | Visibility change. |
| `FeedbackManager.canPlayAudio()` | Audio readiness check before first play. |

## Sticker Durations

**Rule: sticker duration matches the duration of its paired audio.** FeedbackManager mounts the sticker when the audio starts and unmounts it when the audio ends. Game code passes only a string URL; the package manages timing.

The values below are **approximate expected durations** (used by reviewers to spot stuck/stale stickers and by spec authors to pick GIFs that loop nicely over the expected audio length). They are NOT clamps, minimums, or maximums — the sticker stays exactly as long as the audio plays.

| Moment | Expected paired-audio duration |
|--------|--------------------------------|
| Correct answer | ~2s (SFX + 1500ms floor, then TTS explanation) |
| Wrong answer | ~2s (SFX + 1500ms floor, then TTS explanation) |
| Round/level transition | ~5s (SFX → "Round N" / "Level N" TTS) |
| Victory / game complete | ~3–5s (victory SFX → victory VO) |
| Game over | ~3–5s (game-over SFX → game-over VO) |
| Restart | ~2s (optional restart VO) |

## Preload Sound Categories

Every game preloads sounds from these categories:

| Category | Example IDs | Required? |
|----------|------------|-----------|
| Correct SFX | `correct_sound_effect` | Yes |
| Wrong SFX | `incorrect_sound_effect` | Yes |
| Life lost SFX | `sound_life_lost` | Yes |
| Micro-interaction | `sound_bubble_select`, `sound_bubble_deselect`, `tap_sound` | If game has select/deselect |
| Round transition SFX | `rounds_sound_effect` | Yes |
| Level transition SFX | `sound_level_transition` | If game has levels |
| Victory SFX | `victory_sound_effect` | Yes |
| Game complete SFX | `game_complete_sound_effect` | Yes |
| Game over SFX | `game_over_sound_effect` | Yes |
| All correct SFX | `all_correct` | If game has multi-match rounds |
| Ambient | `new_cards` | If game has card/tile refresh |
| Chain progress | `soundChainComplete`, `soundPartialCorrect` | If game has multi-chain rounds |

**Note:** VO can be either **static** (creator-supplied recorded file, preloaded alongside SFX via `sound.preload`) or **dynamic** (generated on the fly via `playDynamicFeedback`). Use static VO when the creator provides the audio file; otherwise use dynamic VO. Custom static VO IDs are declared in the spec's `creatorSounds` block — see § Standard Audio URLs (Production CDN).

## Standard Audio URLs (Production CDN)

**AUTHORITATIVE — single source of truth for sound ids.** Every id used in `FeedbackManager.sound.preload([{id, url}])`, `FeedbackManager.sound.play('<id>', ...)`, or any wrapper helper (`safePlaySound`, `awaitedPlay`) MUST come from the canonical table below. Invented ids — names like `bubble_pop_sfx` / `tap_select_sfx` / `game_correct_sound` that look canonical but are not in this table — are forbidden. The (id, URL) pair is fixed: an id always points at the same URL across all games. Custom sounds (a creator-supplied audio asset not in this table) require a spec-level declaration with both the id and the URL the creator wants attached; spec-creation captures these in a `creatorSounds` block (see spec-creation/SKILL.md). The static validator `GEN-SOUND-ID-CANONICAL` enforces this contract at build time.

**CRITICAL: Use these exact URLs. Do NOT invent or modify audio URLs.**

### SFX (Sound Effects)

| ID | URL | Used for |
|----|-----|----------|
| `correct_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757588479110.mp3` | Standard correct answer SFX |
| `incorrect_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3` | Standard wrong answer SFX |
| `sound_life_lost` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3` | Life lost (same as incorrect) |
| `rounds_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506558124.mp3` | Round transition SFX |
| `victory_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506672258.mp3` | Victory (3★) SFX |
| `game_complete_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506659491.mp3` | Game complete (1★/2★) SFX |
| `game_over_sound_effect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506638331.mp3` | Game over SFX |
| `tap_sound` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432016820.mp3` | Tile tap / micro-interaction |
| `sound_bubble_select` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758162403784.mp3` | Bubble/tile select |
| `sound_bubble_deselect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1758712800721.mp3` | Bubble/tile deselect |
| `new_cards` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432104595.mp3` | New content appearing |
| `all_correct` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506764346.mp3` | All items matched / round complete |
| `soundChainComplete` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501597903.mp3` | Chain complete (multi-chain games) |
| `soundPartialCorrect` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757501548938.mp3` | Partial progress (chain games) |
| `sound_level_transition` | `https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1756742499143.mp3` | Level transition SFX |

### VO (Voiceover)

VO can be **either static or dynamic**, depending on what the creator supplies for the game:

- **Static VO** — creator provides a pre-recorded narration audio file. Register the (id, URL) pair in the spec's `creatorSounds` block (see `spec-creation/SKILL.md`); preload it alongside SFX via `sound.preload([{id, url}])`; play with `FeedbackManager.sound.play(id, {sticker})`. The (id, URL) pair is fixed once declared — validator `GEN-SOUND-ID-CANONICAL` enforces it.
- **Dynamic VO** — generated on the fly via `FeedbackManager.playDynamicFeedback({audio_content, subtitle, sticker})`. Use when the creator hasn't supplied a recorded file, or when the line is parameterised (e.g. variable round/level number, contextual game-over message).

The Standard Audio URLs table above contains **only canonical SFX IDs**. Static VO IDs are creator-supplied and live in the spec, not in this table. Do NOT invent VO IDs or hardcode VO URLs outside the `creatorSounds` block.

### Standard Sticker GIFs (default set — from position-maximizer)

| Role | URL |
|------|-----|
| Correct | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-95.gif` |
| Incorrect | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-99.gif` |
| Round transition | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-87.gif` |
| Level transition | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1759297084426-234.gif` |
| Victory (3★) | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1759297084426-230.gif` |
| Game complete (2★) | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-113.gif` |
| Game complete (1★) | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-110.gif` |
| Game complete (generic) | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-107.gif` |
| Game over | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1758375013588-103.gif` |
| Restart | `https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757430772002-102.gif` |

**Never invent URLs.** Always use the exact SFX and sticker URLs from the tables above. For static VO (creator-supplied recordings), only use IDs and URLs declared in the spec's `creatorSounds` block — never hardcode VO URLs elsewhere. For dynamic VO, no URL is needed (`playDynamicFeedback` generates the audio on the fly).

## Error Handling

Every FeedbackManager call must be wrapped in try/catch:

```javascript
try {
  await FeedbackManager.sound.play('correct_sound_effect', { sticker: CORRECT_STICKER_URL });
} catch (e) {
  console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2));
}
```

Audio failure never breaks gameplay. The game continues even if every audio call fails.

## Feedback Per Bloom Level (Subtitle Templates)

The subtitle text depth changes by Bloom level:

### L1 — Remember
- **Correct:** "That's right!" / "Yes!" / "Correct!" (rotate)
- **Wrong:** "Not quite. It's [answer]."
- No explanation — recall is binary.

### L2 — Understand
- **Correct:** "Right! [brief why]." → "Right! 3:6 simplifies to 1:2."
- **Wrong:** "[Answer]. [brief why]." → "It's 1:2. Divide both by 3."
- One sentence explaining why — CRITICAL.

### L3 — Apply
- **Correct:** "Correct approach!" / "Right method!"
- **Wrong:** "Try [method hint]. The answer is [answer]."
- Points toward the method, not just the answer.

### L4 — Analyze
- **Correct:** "Good analysis!" / "Sharp reasoning!"
- **Wrong:** "What could you check? The answer is [answer]."
- Asks a metacognitive question, then states the answer.
