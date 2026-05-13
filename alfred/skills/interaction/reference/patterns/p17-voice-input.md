# Pattern 17: Voice Input

### Description

Student speaks an answer via microphone or types it in a textarea. The VoiceInput CDN package handles everything: UI (textarea + toolbar + bottom drawer with animated mic), recording (WAV via ScriptProcessorNode), transcription (3-step signed-upload pipeline), permission handling, and sound effects. The game receives the final text value — it never touches audio streams or transcription APIs directly.

### Identification

- "say your answer", "speak the answer", "voice input", "type or speak"
- Any spec that mentions speech-to-text, microphone input, or voice-based answering
- Games where the student's answer is free-form text (not multiple choice) AND voice is an input modality

### CDN Loading

VoiceInput is bundled inside the Components package — **no extra script tag needed**. It loads automatically when the standard components script loads:

```html
<!-- Components bundle (already required in every game) — includes VoiceInput -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
```

After the components bundle loads, `window.VoiceInput` is available globally (also accessible via `window.MathAIComponents.VoiceInput`).

### When NOT to use

- Pure keyboard text/number input (P7 is simpler and sufficient)
- Multiple choice, drag-and-drop, tap-select — use the appropriate tap/drag pattern instead
- If the spec says "type your answer" without mentioning voice — use P7

---

## Integration

### 1. HTML Setup

The game needs a container `<div>` — VoiceInput builds all its own DOM inside it.

```html
<div id="voice-input-area"></div>
```

Do NOT put any child elements inside this div. VoiceInput clears it on construction.

### 2. Initialization

```javascript
// After DOMContentLoaded + waitForPackages()
var voiceInput = new VoiceInput("voice-input-area");
```

Constructor signature:

```javascript
new VoiceInput(containerId, options);
```

| Param                 | Type       | Required | Default                        | Description                   |
| --------------------- | ---------- | -------- | ------------------------------ | ----------------------------- |
| `containerId`         | `string`   | Yes      | —                              | ID of the container element   |
| `options.tools`       | `string[]` | No       | `["mic", "keyboard", "reset"]` | Which toolbar buttons to show |
| `options.defaultTool` | `string`   | No       | First item in `tools`          | Which tool is active on focus |
| `options.placeholder` | `string`   | No       | `"type here.."`                | Textarea placeholder text     |

Alternative constructor form:

```javascript
new VoiceInput({
  containerId: "voice-input-area",
  tools: ["mic", "keyboard"],
  placeholder: "Speak or type...",
});
```

### 3. Reading the Answer

```javascript
// Property (read-only)
var answer = voiceInput.value;

// Method (equivalent)
var answer = voiceInput.getValue();
```

Both return the current text — whether typed by keyboard or filled by voice transcription. This is the only value the game needs for answer checking.

### 4. Answer Checking Integration

P17 uses the **canonical single-step submit-handler shape** documented in [`p07-text-input.md`](./p07-text-input.md). The body is structurally identical (guards → `isProcessing = true` + disable affordances → eval → state + telemetry → awaited SFX → awaited TTS → progress bump → advance / endGame). Apply these P17-specific deltas to the canonical template:

| Step in canonical handler    | P7 (text input)                                         | P17 (voice input) — deltas                                                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read answer                  | `input.value.trim()`                                    | `voiceInput.value.trim()`                                                                                                                                                                                                                                 |
| Disable affordance pre-await | `input.blur()`                                          | `voiceInput.disable()` + explicit `textarea.disabled = true; textarea.readOnly = true; textarea.blur()` on `.voice-input-wrapper textarea` / `#voice-input-area textarea` (CDN `disable()` alone does NOT reliably block typing — see Constraint 3 below) |
| Visual feedback class        | `input.classList.add('input-correct' \| 'input-wrong')` | `voiceInput.markCorrect()` / `voiceInput.markWrong()`                                                                                                                                                                                                     |
| Cleared in `renderRound()`   | `input.classList.remove(...)`, `input.value = ''`       | `voiceInput.clearMark()`, `voiceInput.clear()`, `voiceInput.enable()`, plus matching explicit textarea re-enable                                                                                                                                          |

Everything else (the awaited SFX → awaited TTS block, the game-over branch, the progress bump, the round advance) is identical to the canonical shape — do not restate it here.

### 5. Submit Trigger

VoiceInput does NOT auto-submit. The game decides when to check the answer. Common patterns:

**A. Separate Submit button (recommended):**

```javascript
document.getElementById("submit-btn").addEventListener("click", function () {
  handleSubmit();
});
```

**B. Listen for transcript event (auto-submit after voice):**

```javascript
voiceInput.on("input_change", function (data) {
  // Auto-submit after voice transcription completes (optional)
  if (data.value && !voiceInput.isRecording && !voiceInput.isLoading) {
    handleSubmit();
  }
});
```

**C. Hybrid — submit button for keyboard, auto-submit for voice:**

```javascript
voiceInput.on("transcript", function (data) {
  // Voice completed — auto-submit
  setTimeout(function () {
    handleSubmit();
  }, 500); // Brief delay so user sees the text
});

document.getElementById("submit-btn").addEventListener("click", function () {
  handleSubmit();
});
```

---

## Game-Used Public API

This is the subset game code normally uses. The package may emit additional events or expose maintenance helpers; verify those directly in `packages/components/voice-input/index.js` when working on the package itself.

### Methods

| Method              | Returns  | Description                                                       |
| ------------------- | -------- | ----------------------------------------------------------------- |
| `getValue()`        | `string` | Current input text                                                |
| `setValue(text)`    | `void`   | Set input text programmatically                                   |
| `clear()`           | `void`   | Clear input (equivalent to `setValue('')`)                        |
| `markCorrect()`     | `void`   | Green background — call after correct answer                      |
| `markWrong()`       | `void`   | Red background — call after wrong answer                          |
| `clearMark()`       | `void`   | Reset to neutral background                                       |
| `cancelRecording()` | `void`   | Cancel an in-flight recording; useful on visibility/phase changes |
| `disable()`         | `void`   | Disable all interaction (cancels recording if active)             |
| `enable()`          | `void`   | Re-enable interaction                                             |
| `highlight()`       | `void`   | Add blue glow around wrapper (for attention/hint)                 |
| `unhighlight()`     | `void`   | Remove blue glow                                                  |
| `destroy()`         | `void`   | Full cleanup — removes DOM, event listeners, drawer               |
| `on(event, fn)`     | `void`   | Subscribe to an event                                             |
| `off(event, fn)`    | `void`   | Unsubscribe from an event                                         |

### Read-only Properties

| Property      | Type      | Description                               |
| ------------- | --------- | ----------------------------------------- |
| `value`       | `string`  | Current input text (same as `getValue()`) |
| `isRecording` | `boolean` | Whether mic is actively recording         |
| `isLoading`   | `boolean` | Whether transcription is in progress      |

### Events Used by Games

| Event               | Payload                              | When                                                                                                                             |
| ------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `input_change`      | `{ value: string }`                  | Every keystroke or transcription result                                                                                          |
| `transcript`        | `{ text: string, fullText: string }` | After successful voice transcription. `text` = this transcription only. `fullText` = full textarea value including previous text |
| `error`             | `{ type: string, message: string }`  | On any error. Types: `permission_denied`, `mic_error`, `no_audio`, `transcription_empty`, `transcription_failed`, `timeout`      |
| `permission_change` | `{ permitted: boolean }`             | When microphone permission state changes                                                                                         |

---

## Package-Owned UI Behavior

VoiceInput owns its textarea, toolbar, drawer, recording/transcription states, internal sound effects, geometry, animation, colors, and `.vi-*` classes. Game code should not build, restyle, or proxy those internals through `FeedbackManager`.

Interaction-owned requirements are limited to:

- create the container and instantiate `VoiceInput`
- read `voiceInput.value` / `voiceInput.getValue()` at submit
- call `markCorrect()` / `markWrong()` / `clearMark()` for answer state
- call `disable()` before awaited feedback and `enable()` in `renderRound()`
- explicitly disable/readOnly/blur the underlying textarea during awaited feedback as described below
- call `cancelRecording()` / `disable()` on visibility or phase changes that interrupt gameplay
- call `destroy()` when removing the component

If a bug depends on exact drawer, sound, subtitle, permission, or pause behavior, verify the current package source at `packages/components/voice-input/index.js` or the future VoiceInput PART doc. Do not encode package-internal UI tables in the interaction skill.

---

## Lifecycle in a Game

```javascript
// In loadRound():
function loadRound() {
  var round = getRounds()[gameState.currentRound];
  document.getElementById("question-text").textContent = round.question;

  // Single source of truth for re-enabling inputs after a correct/wrong answer.
  // Never re-enable inputs in the submit handler after TTS — only here.
  gameState.isProcessing = false;
  voiceInput.clearMark();
  voiceInput.clear();
  voiceInput.enable();
  // Defense-in-depth: CDN enable() doesn't always clear disabled/readOnly
  // on the textarea. Do it explicitly to match the disable() path.
  var ta = document.querySelector(
    ".voice-input-wrapper textarea, #voice-input-area textarea",
  );
  if (ta) {
    ta.disabled = false;
    ta.readOnly = false;
  }
}

// In endGame():
function endGame(reason) {
  voiceInput.disable();
  // ... show end screen
}

// On page unload (optional but clean):
window.addEventListener("beforeunload", function () {
  voiceInput.destroy();
});
```

### Multiple Instances

Multiple VoiceInput instances on the same page share a single global permission check. Microphone permission is requested only once — either detected as already-granted via `navigator.permissions.query`, or requested on the first recording attempt. The browser prompt appears at most once per page load.

---

## Constraints

### CRITICAL

1. **Never build custom recording/transcription code.** VoiceInput handles the full pipeline internally (WAV recording → GCS signed upload → speech-to-text API). The game only reads `voiceInput.value`.

2. **Never call `getUserMedia` yourself.** VoiceInput manages all microphone access. Calling it separately will conflict with VoiceInput's permission state.

3. **Always call `disable()` during answer evaluation AND explicitly set `textarea.disabled=true`.** `voiceInput.disable()` alone does not reliably block keyboard input — the current CDN sets the internal `_disabled` flag but leaves the textarea typeable. Add `var ta = document.querySelector('.voice-input-wrapper textarea, #voice-input-area textarea'); if (ta) { ta.disabled = true; ta.readOnly = true; ta.blur(); }` right after `voiceInput.disable()` in every submit / end-game handler, and the matching re-enable (`ta.disabled = false; ta.readOnly = false;`) right after `voiceInput.enable()` in `loadRound()`. Without this, the student can keep typing while feedback audio is playing and cause audio/evaluation conflicts.

4. **Always call `destroy()` if removing the input from the page.** VoiceInput appends the drawer to `document.body` and adds a global click listener. Without `destroy()`, these leak.

5. **Do NOT add a separate VoiceInput script tag.** VoiceInput loads automatically via the Components bundle. Adding a standalone `<script>` on top of the bundle will cause a duplicate-load skip (harmless but unnecessary).

### STANDARD

6. **Use `voiceInput.value` (or `getValue()`) as the single source of truth for the answer.** Never read the textarea DOM directly — VoiceInput may have internal state that differs from the DOM during transcription.

7. **Call `clearMark()` then `clear()` when loading a new round.** Order doesn't matter, but both are needed — `clear()` doesn't reset the background color, and `clearMark()` doesn't clear the text.

8. **Use the `transcript` event (not `input_change`) if you need to distinguish voice from keyboard input.** `input_change` fires for both. `transcript` fires only after voice transcription.

### ADVISORY

9. **Consider a Submit button rather than auto-submit.** Auto-submit on transcription can surprise the student if the transcription is wrong. A Submit button lets them review/edit first.

10. **Use `highlight()` / `unhighlight()` for hints or attention.** Adds a blue glow (#000FFF) around the input wrapper — useful for guided tutorials or "enter your answer here" prompts.

---

## Anti-patterns

| Do NOT                                                   | Why                                                                                                          | Do instead                                                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read `document.querySelector('.vi-textarea').value`      | Internal DOM — may differ from VoiceInput state during transcription                                         | Use `voiceInput.value` or `voiceInput.getValue()`                                                                                                 |
| Add your own `<textarea>` or `<input>` for voice answers | Duplicates UI, confuses the student                                                                          | Use VoiceInput — it includes the textarea                                                                                                         |
| Call `navigator.mediaDevices.getUserMedia()`             | Conflicts with VoiceInput's permission management                                                            | VoiceInput handles this internally                                                                                                                |
| Style `.vi-*` classes directly                           | Package CSS may change; your overrides will break                                                            | Use `markCorrect()` / `markWrong()` / `highlight()` API                                                                                           |
| Put HTML inside the container div                        | VoiceInput clears `innerHTML` on construction                                                                | Put sibling elements outside the container                                                                                                        |
| Forget to call `destroy()` when removing the component   | Leaks drawer DOM + global click listener                                                                     | Always call `destroy()` in cleanup                                                                                                                |
| Skip `disable()` during feedback playback                | Student can record during TTS → audio collision                                                              | Always `disable()` before feedback, `enable()` after                                                                                              |
| Rely on `voiceInput.disable()` alone to block typing     | CDN disable() sets `_disabled` flag but leaves textarea typeable — student can keep typing during processing | Pair every `disable()` with `textarea.disabled = true; textarea.readOnly = true; textarea.blur()`. Pair every `enable()` with the matching clears |
