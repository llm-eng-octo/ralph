### PART-006: TimerComponent
**Purpose:** Countdown or count-up timer with pause/resume support.
**Condition:** Game has time pressure.
**API:** `new TimerComponent('timer-container', { timerType, format, startTime, endTime, autoStart, onEnd })`
**Key rules:**
- `timerType`: `'decrease'` (countdown) or `'increase'` (count-up)
- `format`: `'min'` (MM:SS) or `'sec'` (SS)
- Methods: `.start()`, `.pause({ fromVisibilityTracker })`, `.resume({ fromVisibilityTracker })`, `.getTimeTaken()`, `.reset()`
- Create BEFORE VisibilityTracker so tracker can reference `timer`
- `autoStart: false` — start manually after game begins

**Mount + layout (MANDATORY — same in every game, required because PreviewScreen does NOT mirror `timerInstance` into the header):**

- HTML: append `<div id="timer-container"></div>` as a direct child of `#mathai-preview-slot` (positioned ancestor). NOT inside `.mathai-preview-header` / `.mathai-preview-header-center`.
- CSS: set `#mathai-preview-slot { position: relative; }` and absolute-center the timer top-center:
  ```css
  #timer-container {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    pointer-events: none;
  }
  #timer-container > * { pointer-events: auto; }
  ```
- Override TimerComponent's hard-coded 320×41 / 24px / `#000FFF` `.timer-display` styles so it fits the header:
  ```css
  #timer-container .timer-wrapper { padding: 0 !important; margin: 0 !important; }
  #timer-container .timer-display {
    width: auto !important; height: auto !important; padding: 0 !important;
    font-size: 16px !important; font-weight: 700 !important;
    color: var(--mathai-primary) !important;
    font-family: var(--mathai-font-family) !important;
  }
  #previewTimerText { display: none !important; }
  ```

This matches the canonical React `TimerComponent`'s `showInActionBar: true` layout (`src/modules/home/view/activity/Components/Blocks/AllInOne/ComponentV2/components/timer/index.tsx`).
