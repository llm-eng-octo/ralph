FeedbackManager is the CDN package (PART-017) that renders feedback overlays with subtitle text and sticker animations -- the game calls it, never builds its own overlays.

## Wrapper Function

Every game must define this wrapper:

```javascript
function playFeedback(type, subtitle) {
  try {
    if (typeof window.playDynamicFeedback === 'function') {
      window.playDynamicFeedback(type, { subtitle: subtitle || '' });
    } else if (typeof window.FeedbackManager !== 'undefined' &&
               typeof window.FeedbackManager.playDynamicFeedback === 'function') {
      window.FeedbackManager.playDynamicFeedback(type, { subtitle: subtitle || '' });
    }
  } catch (e) {
    /* feedback is non-blocking -- game continues regardless */
  }
}
```

## Valid Feedback Types

| Type | When to call | What it renders |
|------|-------------|-----------------|
| `'correct'` | Student answers correctly | Green sticker + positive audio + subtitle |
| `'incorrect'` | Student answers incorrectly | Red sticker + negative audio + subtitle |
| `'victory'` | Game completes with score > 0 | Celebration sticker + victory audio + subtitle |
| `'gameover'` | Lives reach 0 (game over) | Encouraging sticker + gentle audio + subtitle |

## Parameters

- `type` (string, required) -- one of: `'correct'`, `'incorrect'`, `'victory'`, `'gameover'`
- `options` (object, optional):
  - `subtitle` (string) -- text displayed below the sticker. Keep under 60 characters.

## Waiting for FeedbackManager

FeedbackManager loads asynchronously from CDN. Games must poll for readiness before the first round:

```javascript
function waitForFeedback() {
  return new Promise(function(resolve) {
    var maxAttempts = 50;
    var attempts = 0;
    function check() {
      attempts++;
      var hasFeedback = typeof window.FeedbackManager !== 'undefined' ||
                        typeof window.playDynamicFeedback !== 'undefined';
      if (hasFeedback || attempts >= maxAttempts) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    }
    check();
  });
}
```

## When PART-017 = NO

If the spec sets PART-017 to NO, the game must NOT call `playDynamicFeedback`. Instead, provide minimal visual-only feedback using CSS classes (`.selected-correct`, `.selected-wrong`) with no overlay. The `playFeedback` wrapper already handles this -- the try/catch silently skips if FeedbackManager is absent.

## Feedback Per Bloom Level

The subtitle text and feedback depth change based on the game's Bloom level.

### L1 -- Remember

- **Tone:** Immediate, short, encouraging
- **Correct subtitle:** "That's right!" / "Yes!" / "Correct!" (rotate randomly)
- **Wrong subtitle:** "Not quite. It's [correct answer]."
- **Duration:** Standard (1500ms correct, 2000ms wrong)
- **No explanation** -- recall is binary
- **Pacing:** Fast. Keep the drill rhythm tight.

### L2 -- Understand

- **Tone:** Encouraging with brief explanation
- **Correct subtitle:** "Right! [brief why]." Example: "Right! 3:6 simplifies to 1:2."
- **Wrong subtitle:** "[Correct answer]. [brief why]." Example: "It's 1:2. Divide both by 3."
- **Duration:** Standard
- **Explanation:** One short sentence (under 60 characters) explaining why -- CRITICAL
- **Pacing:** Moderate.

### L3 -- Apply

- **Tone:** Corrective with approach hint
- **Correct subtitle:** "Correct approach!" or "Right method!"
- **Wrong subtitle:** "Try [method hint]. The answer is [answer]."
- **Duration:** Standard (2000ms wrong -- student needs time to read approach hint)
- **Explanation:** Points toward the method, not just the answer -- CRITICAL
- **Pacing:** Moderate-to-slow.

### L4 -- Analyze

- **Tone:** Analytical, prompting reflection
- **Correct subtitle:** "Good analysis!" or "Sharp reasoning!"
- **Wrong subtitle:** "What could you check? The answer is [answer]."
- **Duration:** 2000ms for both correct and wrong
- **Explanation:** Asks a metacognitive question, then states the answer -- CRITICAL
- **Pacing:** Slow. Do not rush.

## Subtitle Templates for Wrong Answers (All Levels)

```
L1: "Not quite. It's {correctAnswer}."
L2: "It's {correctAnswer}. {briefExplanation}."
L3: "Try {methodHint}. The answer is {correctAnswer}."
L4: "What could you check? {reflectivePrompt}. The answer is {correctAnswer}."
```
