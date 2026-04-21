# SubtitleComponent

Text overlays with markdown support, auto-synchronized with audio.

## Overview

SubtitleComponent provides:
- Markdown support: `**bold**`, `*italic*`, `[links](url)`
- Auto-synchronized with audio playback
- Smart duration (calculated from audio length)
- Automatic show/hide management

## Subtitles MUST NEVER Truncate (MANDATORY)

**Rule:** the subtitle must ALWAYS display the full text passed to it. No ellipsis, no line-clamp, no hidden overflow, no clipping. This applies to every call site — static `sound.play`, `playDynamicFeedback`, streaming audio, transition screens, story playback, game over messages — **everywhere**.

**Symptom this rule fixes:** when using dynamic audio (`playDynamicFeedback`), long TTS sentences get cut off mid-sentence on screen because the default subtitle container is only 280px wide and the rendered text runs into `-webkit-line-clamp`, `text-overflow: ellipsis`, or `overflow: hidden` from ambient CSS.

### Required configuration (run ONCE at game init, right after `FeedbackManager.init()`)

```javascript
SubtitleComponent.configure({
  position: {
    bottom: '60px',
    // Wide enough for long dynamic TTS sentences; wraps within viewport on mobile
    maxWidth: 'min(92vw, 720px)'
  }
});
```

### Required CSS override (add to the game's `<style>` block — belt-and-braces against ambient styles)

```css
/* Subtitles must show the full text — never truncate. Targets the CDN subtitle
   container regardless of its internal class name. */
[class*="subtitle"],
[id*="subtitle"],
[class*="Subtitle"],
[id*="Subtitle"],
[class*="mathai-subtitle"] {
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

### Do NOT shorten the text passed to subtitles

```javascript
// ❌ WRONG — truncating the caller side to "fit"
await FeedbackManager.playDynamicFeedback({
  audio_content: longMessage,
  subtitle: longMessage.slice(0, 60) + '…'   // NEVER
});

// ❌ WRONG — using a different, shorter summary for the subtitle
await FeedbackManager.playDynamicFeedback({
  audio_content: 'You scored 95 out of 100 and finished in 42 seconds — great work!',
  subtitle: 'Great work!'   // hides information from deaf / hard-of-hearing players
});

// ✅ CORRECT — subtitle text equals audio_content, verbatim
const message = 'You scored 95 out of 100 and finished in 42 seconds — great work!';
await FeedbackManager.playDynamicFeedback({
  audio_content: message,
  subtitle: message
});
```

### Duration must match audio length

Never set a short fixed `duration` that hides the subtitle before the audio ends. For `FeedbackManager.sound.play()` / `playDynamicFeedback()` the component auto-syncs; for manual `SubtitleComponent.show()` calls, pass a duration ≥ the spoken audio length or rely on the audio-end callback.

## Auto-loaded by FeedbackManager

**CRITICAL: SubtitleComponent is loaded automatically by FeedbackManager.**

```html
<!-- CORRECT - FeedbackManager loads SubtitleComponent -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>

<!-- WRONG - Do NOT load separately -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
```

## Usage (via FeedbackManager props)

**Important:** Always pass subtitle options to FeedbackManager (VERIFY: No direct SubtitleComponent method calls):

### Simple String

```javascript
await FeedbackManager.sound.play("correct", {
  subtitle: "**Great job!** You got it right!",
});
```

### With Markdown

```javascript
await FeedbackManager.sound.play("correct", {
  subtitle: "**Excellent!** You got it *right* ✨",
});
```

### Subtitle Object (Advanced)

```javascript
await FeedbackManager.sound.play("correct", {
  subtitle: {
    text: "**Congratulations!**",
    duration: 3,  // Optional: override auto-calculated duration
  },
});
```

## Critical Rules Checklist

### SubtitleComponent Usage

```
[ ] VERIFY: No direct SubtitleComponent usage
[ ] Pass subtitle to FeedbackManager instead
```

```javascript
// CORRECT - Pass subtitle to FeedbackManager
await FeedbackManager.sound.play("correct", {
  subtitle: "Great!",
});

// WRONG - Never call SubtitleComponent methods
SubtitleComponent.show({ text: "Great!" });      // NOT synchronized!
SubtitleComponent.updateText("New message");     // NOT managed!
SubtitleComponent.hide();                        // Auto-managed!
```

### Why Use FeedbackManager?

- **Auto-sync**: Subtitles hide when audio completes
- **Smart timing**: Duration calculated from audio length
- **Sequential playback**: Subtitles update when new audio plays
- **Unified API**: One call for audio + subtitle + sticker

## Auto-synchronization

Subtitles automatically:
- Show when audio starts
- Update text if new audio plays
- Hide when audio completes
- Hide when audio is preempted by new audio

```javascript
// Play audio with subtitle
await FeedbackManager.sound.play("tap", {
  subtitle: "Button clicked"
});

// New audio preempts previous - subtitle auto-updates
await FeedbackManager.sound.play("correct", {
  subtitle: "Correct!"
});
// "Button clicked" subtitle auto-hides
// "Correct!" subtitle shows
```

## Full Documentation

For complete API reference, type definitions, and advanced usage:
- [SubtitleComponent Type Definitions](../types/subtitle-component.d.ts)
- [SubtitleComponent Full Usage Guide](../types/subtitle-component-usage.md)
- [FeedbackManager Integration](../types/feedback-manager-usage.md)

## Related Components

- [FeedbackManager](./feedback-manager.md) - Use this to show subtitles
