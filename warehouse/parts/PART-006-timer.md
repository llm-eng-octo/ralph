# PART-006: TimerComponent

**Category:** CONDITIONAL | **Condition:** Game has time pressure | **Dependencies:** PART-003, PART-004

---

## HTML Required

```html
<!-- Header must be position: relative so the absolute timer anchors to it -->
<header class="game-header">
  <div class="header-left">‹ avatar Q1</div>     <!-- normal flex flow -->
  <div id="timer-container"></div>                 <!-- absolutely positioned -->
  <div class="header-right">0/3 ⭐</div>           <!-- normal flex flow -->
</header>
```

## CSS Required (MANDATORY — timer is always absolute, top-center of header)

```css
.game-header {
  position: relative; /* REQUIRED — anchor for the absolute timer */
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
  pointer-events: none; /* header siblings (lives/score) stay clickable */
}
#timer-container > * { pointer-events: auto; }
```

**Rule:** `#timer-container` is ALWAYS `position: absolute` and ALWAYS centered in the header (horizontally and vertically). Never place the timer inline in the header's flex/grid flow — other header items (lives, score, close button) keep their natural left/right placement and the timer floats in the visual center above them.

**Why:** If the timer is a flex child of the header, the left group (back button, avatar, question label) and right group (score, lives, star) are almost never equal widths. `justify-content: space-between` distributes children by gap, not by visual center, so the timer gets pushed toward whichever side is narrower. In the common layout the left group is wider than the right group, so the timer visibly drifts **toward the right**. Absolute positioning with `translate(-50%, -50%)` is the only way to keep the timer in the true visual center regardless of sibling widths.

**❌ Anti-pattern (the "timer inclined toward the right" bug):**

```css
/* WRONG — timer is a flex child, drifts off-center */
#timer-container {
  /* no position: absolute */
  /* relies on flex/grid to center — breaks when sibling widths differ */
}
```

All four properties are required together on `#timer-container`: `position: absolute`, `top: 50%`, `left: 50%`, `transform: translate(-50%, -50%)`. Missing any one of them breaks centering. Do not substitute `margin: auto`, `justify-self: center`, or `grid-column: 2` — these only work when sibling widths are equal, which cannot be guaranteed.

## Code

```javascript
timer = new TimerComponent('timer-container', {
  timerType: '{{decrease|increase}}',
  format: 'min',
  startTime: {{seconds}},
  endTime: {{seconds}},
  autoStart: false,
  onEnd: (timeTaken) => {
    endGame();
  }
});
```

## Placement

Inside DOMContentLoaded (PART-004), BEFORE VisibilityTracker (so tracker can reference timer).

## Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `timerType` | `'increase' \| 'decrease'` | `'decrease'` | Count up or countdown |
| `format` | `'min' \| 'sec'` | `'min'` | `'min'` = MM:SS, `'sec'` = SS |
| `startTime` | `number` | `0` | Start value in seconds |
| `endTime` | `number` | `0` | End value (countdown only) |
| `autoStart` | `boolean` | `true` | Start immediately on creation |
| `showInActionBar` | `boolean` | `false` | Action bar positioning |
| `onEnd` | `(timeTaken) => void` | - | Called when timer reaches endTime |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `start()` | void | Start timer |
| `pause(options?)` | void | Pause timer. `options: { fromAudio?: bool, fromVisibilityTracker?: bool }` |
| `resume(options?)` | void | Resume timer. Same options as pause. Cross-system blocking: audio resume won't unpause a visibility-paused timer and vice versa |
| `stop()` | void | Stop timer |
| `reset()` | void | Reset to startTime |
| `destroy()` | void | Cleanup |
| `getCurrentTime()` | number | Current seconds |
| `getTimeTaken()` | number | Elapsed seconds |
| `getFormattedTime()` | string | Formatted time string |
| `getElapsedTimes()` | number[] | Array of elapsed times across resets |
| `updateConfig(config)` | void | Update timer config (e.g. `{ seconds }` to set time) |
| `setTime(seconds)` | void | Set current time to specific value |

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `isRunning` | boolean | Timer is actively counting |
| `isPaused` | boolean | Timer is paused |
| `isPausedByAudio` | boolean | Timer was paused by audio system |
| `isPausedByVisibilityTracker` | boolean | Timer was paused by visibility tracker |
| `currentSeconds` | number | Current time value |

## Cross-System Pause/Resume

The timer tracks WHO paused it (`fromAudio` vs `fromVisibilityTracker`). When resume is called with a source flag, the timer checks if it's also paused by the OTHER system — if so, it stays paused. This prevents conflicts between FeedbackManager audio (which auto-pauses/resumes the timer) and VisibilityTracker.

```javascript
// FeedbackManager does this internally — you don't write this:
timer.pause({ fromAudio: true });
timer.resume({ fromAudio: true });

// VisibilityTracker callbacks MUST pass their flag:
timer.pause({ fromVisibilityTracker: true });
timer.resume({ fromVisibilityTracker: true });
```

## Count-Up Timer Without End Limit

When using `timerType: 'increase'` and the game has no specific time limit (e.g., the game ends by completing all rounds, not by time), set `endTime` to a very large value so the timer never triggers `onEnd` prematurely:

```javascript
// Count-up timer with no time limit — use a large endTime
timer = new TimerComponent('timer-container', {
  timerType: 'increase',
  format: 'min',
  startTime: 0,
  endTime: 100000,  // ~27 hours — effectively unlimited
  autoStart: false,
  onEnd: (timeTaken) => { endGame(); }
});
```

**Do NOT** omit `endTime` or set it to `0` — the timer may fire `onEnd` immediately or behave unpredictably.

## Anti-Patterns

```javascript
// WRONG: Custom timer with setInterval
let time = 60;
setInterval(() => { time--; updateDisplay(); }, 1000);

// CORRECT: Use TimerComponent
timer = new TimerComponent('timer-container', { timerType: 'decrease', startTime: 60, endTime: 0 });

// WRONG: Count-up timer with no endTime or endTime: 0
timer = new TimerComponent('timer-container', { timerType: 'increase', startTime: 0 });

// CORRECT: Count-up timer with large endTime
timer = new TimerComponent('timer-container', { timerType: 'increase', startTime: 0, endTime: 100000 });
```

## Verification

- [ ] `<div id="timer-container"></div>` exists in HTML, inside the header element
- [ ] Header (`.game-header` or equivalent) has `position: relative`
- [ ] `#timer-container` has `position: absolute` + `top: 50%` + `left: 50%` + `transform: translate(-50%, -50%)`
- [ ] Timer renders in the visual top-center of the header regardless of header width/content
- [ ] Timer is NOT inside the header's flex/grid flow (does not shift other header items)
- [ ] `new TimerComponent('timer-container', {...})` called
- [ ] `timerType` set correctly for game needs
- [ ] `onEnd` calls `endGame()` (if countdown)
- [ ] `timer.destroy()` called in endGame cleanup
- [ ] No `setInterval` or `setTimeout` used for timing

## Source Code

Full TimerComponent implementation: `warehouse/packages/components/timer/index.js`

## Deep Reference

`mathai-game-builder/components/timer-component.md`
