# TimerComponent

Countdown/countup timer with MM:SS or SS format.

## Overview

TimerComponent provides:
- Count down (decrease) or count up (increase)
- Display formats: MM:SS or SS only
- Auto-start capability
- Control methods: start, pause, resume, stop, reset
- State access: getCurrentTime(), getTimeTaken()

## Installation

```html
<!-- Load Components package -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
```

## Positioning (MANDATORY)

🚨 **The timer MUST be `position: absolute` and horizontally + vertically centered in the header.** It must NOT participate in the header's flex/grid flow. Other header items (back button, avatar, question label, lives, score, star) keep their normal placement, and the timer floats in the true visual center above them.

**Why this rule exists:** When the timer is a flex child, the header's left group (back button, avatar, question label) and right group (score/lives/star) are almost never equal widths. `justify-content: space-between` distributes children by gap, not by visual center, so the timer gets pushed toward whichever side is narrower. In the common layout the left group is wider than the right group, and the timer ends up visibly **inclined toward the right**. Absolute positioning with `translate(-50%, -50%)` is the only way to keep the timer in the true visual center regardless of sibling widths.

**✅ CORRECT:**

```html
<header class="game-header">
  <div class="header-left">‹ avatar Q1</div>
  <div id="timer-container"></div>      <!-- absolutely positioned, out of flow -->
  <div class="header-right">0/3 ⭐</div>
</header>
```

```css
.game-header {
  position: relative;           /* REQUIRED — anchor for the absolute timer */
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#timer-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
}
#timer-container > * { pointer-events: auto; }
```

**❌ WRONG (the "timer drifts to the right" bug):**

```css
/* Timer left in the flex flow — header siblings push it off-center */
#timer-container {
  /* no position: absolute — bug */
}
```

**Hard rules:**
- Do NOT place `#timer-container` inline in the header flex/grid — it will drift off-center whenever the left and right groups have unequal widths.
- Do NOT use `position: static`, `relative`, `fixed`, or `sticky` for `#timer-container`. ONLY `position: absolute` is allowed.
- Do NOT rely on `margin: auto`, `justify-self: center`, `grid-column: 2`, or any flex/grid centering trick for the timer — these all break when sibling widths change.
- The parent (`.game-header` or whichever element holds the timer) MUST be `position: relative` so the absolute timer anchors to it (and not to the viewport).
- `#timer-container` MUST have all four of: `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`, and `position: absolute`. Missing any one of these breaks centering.

## Usage

### Countdown Timer

```javascript
const timer = new TimerComponent("timer-container", {
  timerType: "decrease",
  format: "min",        // MM:SS format
  startTime: 60,        // Start at 60 seconds
  endTime: 0,           // Stop at 0
  autoStart: true,
  onEnd: (timeTaken) => {
    alert("Time is up!");
    submitGame();
  },
});
window.timer = timer;  // Store globally for debugging and external access
```

### Countup Timer

```javascript
const timer = new TimerComponent("timer-container", {
  timerType: "increase",
  format: "min",
  startTime: 0,
  endTime: 9999999,  // Large number for unlimited counting
  autoStart: true,
  onEnd: (timeTaken) => {
    console.log("Game finished in", timeTaken, "seconds");
  },
});
window.timer = timer;  // Store globally for debugging and external access
```

### Control Methods

```javascript
// Control timer
timer.start();
timer.pause();
timer.resume();
timer.stop();
timer.reset();

// Get state
const current = timer.getCurrentTime();     // seconds
const elapsed = timer.getTimeTaken();       // seconds
const formatted = timer.getFormattedTime(); // "MM:SS" or "SS"
```

## Critical Rules

### TimerComponent Usage Checklist

```
[ ] Use TimerComponent for all timers
[ ] VERIFY: No custom timer implementations
```

```javascript
// CORRECT - Use TimerComponent
const timer = new TimerComponent("timer-container", {
  timerType: "decrease",
  startTime: 60,
});
window.timer = timer;  // Store globally for debugging

// WRONG - Never create manual timers
let timeLeft = 60;
setInterval(() => {
  timeLeft--;
  document.getElementById("timer").textContent = timeLeft;  // VERIFY: No custom timers!
}, 1000);
```

### MUST Integrate with VisibilityTracker

For games with timers, you MUST use VisibilityTracker to pause/resume when users switch tabs:

```javascript
const timer = new TimerComponent("timer-container", {
  timerType: "decrease",
  startTime: 60,
  autoStart: true,
});
window.timer = timer;  // Store globally for debugging

// MANDATORY: VisibilityTracker integration
const tracker = new VisibilityTracker({
  onInactive: () => {
    timer.pause({ fromVisibilityTracker: true }); // Pause timer
    FeedbackManager.sound.pause();         // Pause audio
    FeedbackManager.stream.pauseAll();     // Pause streaming
  },
  onResume: () => {
    timer.resume({ fromVisibilityTracker: true }); // Resume timer
    FeedbackManager.sound.resume();        // Resume audio
    FeedbackManager.stream.resumeAll();    // Resume streaming
  },
});
```

## Integration with VisibilityTracker

**Why it's mandatory:**
- Fair gameplay - prevents users from gaming the system by switching tabs
- Better UX - auto-pauses when user is distracted
- Session integrity - maintains engagement

**What to pause:**
- Timer (always)
- Audio (both sound and stream)
- Animations (if any)
- Intervals/timeouts (if any)

See [VisibilityTracker](./visibility-tracker.md) for details.

## Full Documentation

For complete API reference, type definitions, and advanced usage:
- [TimerComponent Type Definitions](../types/timer-component.d.ts)
- [TimerComponent Full Usage Guide](../types/timer-component-usage.md)
- [Component Props Reference](../reference/component-props.md)

## Related Components

- [VisibilityTracker](./visibility-tracker.md) - MANDATORY integration
- [FeedbackManager](./feedback-manager.md) - Audio feedback
