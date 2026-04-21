# TimerComponent Checklist

## When to Use

Use this checklist when the game requires a timer (countdown or stopwatch).

## Prerequisites

- [ ] User confirmed timer is required in Phase 1 Checklist 1
- [ ] Components package loaded in HTML

## Integration Steps

### 1. HTML Structure

Timer lives inside the header, but is positioned absolutely so it sits in the **visual top-center of the header** without disturbing other header items (lives, score, close button, etc.).

```html
<header class="game-header">
  <div id="timer-container"></div>
  <!-- other header items (lives, score, close) stay in normal flow -->
</header>
```

```css
/* MANDATORY — timer is always absolute + centered in header */
.game-header {
  position: relative;  /* anchor for the timer */
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

**Verification:**
- [ ] Container has id="timer-container"
- [ ] Container is a DIRECT child of the header element
- [ ] Header (`.game-header` or equivalent) has `position: relative`
- [ ] `#timer-container` has `position: absolute`
- [ ] `#timer-container` is centered via `top: 50%; left: 50%; transform: translate(-50%, -50%)`
- [ ] Timer is NOT part of header's flex/grid flow (does not shift lives/score placement)
- [ ] Timer visually appears in the center of the header regardless of header content/width

### 2. JavaScript Implementation

```javascript
// Declare timer variable
let timer = null;

// Create TimerComponent
timer = new TimerComponent("timer-container", {
  timerType: "increase", // or "decrease"
  startTime: 0, // Adjust based on game requirements
  endTime: 9999999, // Large number for unlimited counting (or specific countdown time)
  autoStart: true, // or false if manual start needed
  onEnd: () => {
    endGame(); // Call your game end function
  },
});
window.timer = timer;  // Store globally for debugging and external access
```

**Verification:**
- [ ] Timer variable declared at top scope
- [ ] TimerComponent created with correct container ID
- [ ] timerType set correctly ("increase" or "decrease")
- [ ] startTime and endTime configured appropriately
- [ ] onEnd callback defined
- [ ] autoStart set based on game requirements
- [ ] `window.timer = timer;` added after creation for global access

### 2.5. Creation Sequence (CRITICAL)

⚠️ **MANDATORY:** HTML container MUST exist in DOM before creating TimerComponent

**Two Common Patterns:**

**Pattern A: Static HTML (Container Always Exists)**

```html
<!-- HTML already has container -->
<div id="timer-container"></div>

<script>
window.addEventListener('DOMContentLoaded', async () => {
  await waitForPackages();

  // Container already exists - safe to create component
  timer = new TimerComponent("timer-container", {...});
  window.timer = timer;  // Store globally for debugging
});
</script>
```

**Pattern B: Dynamic HTML (Container Created by JavaScript)**

```javascript
function startRound() {
  // Step 1: Create container in DOM FIRST
  renderGame(); // This creates #timer-container

  // Step 2: THEN create TimerComponent
  timer = new TimerComponent("timer-container", {...});
  window.timer = timer;  // Store globally for debugging
}

function renderGame() {
  document.getElementById('gameContent').innerHTML = `
    <div id="timer-container"></div>
    <!-- other elements -->
  `;
}
```

**Anti-Pattern (CAUSES ERRORS):**

```javascript
// ❌ WRONG: Timer created before container exists
function startRound() {
  timer = new TimerComponent("timer-container", {...}); // ERROR!
  renderGame(); // Too late
}
```

**Verification:**

 Container element exists in DOM before new TimerComponent()
 If using innerHTML, component created AFTER innerHTML assignment
 Order: renderDOM() → Component creation
 No "Cannot find element with id 'timer-container'" errors

### 3. VisibilityTracker Integration

```javascript
visibilityTracker = new VisibilityTracker({
  onInactive: () => {
    if (timer) timer.pause();
    // ... other pause logic
  },
  onResume: () => {
    if (timer && timer.isPaused) timer.resume();
    // ... other resume logic
  },
  popupProps: {
    title: "Game Paused",
    description: "Click Resume to continue.",
    primaryText: "Resume",
  },
});
```

**Verification:**
- [ ] timer.pause() called in onInactive
- [ ] timer.resume() called in onResume with isPaused check

### 4. Timer Controls (Optional)

If manual controls needed:

```javascript
// Start timer
timer.start();

// Pause timer
timer.pause();

// Resume timer
timer.resume();

// Reset timer
timer.reset();

// Destroy timer
timer.destroy();
```

**Verification:**
- [ ] Controls connected to UI buttons (if needed)
- [ ] destroy() called when game ends

## Anti-Patterns (DO NOT USE)

```javascript
// ❌ WRONG - Custom timer implementation
let timeLeft = 60;
setInterval(() => {
  timeLeft--;
  document.getElementById("timer").textContent = timeLeft;
}, 1000);

// ❌ WRONG - setTimeout for countdown
setTimeout(() => {
  updateTimer();
}, 1000);
```

**Verification:**
- [ ] VERIFY: No setInterval for timer logic
- [ ] VERIFY: No setTimeout for timer logic
- [ ] VERIFY: No custom countdown implementations

## Final Verification

**Code Search:**
- [ ] Search code for `new TimerComponent` - should exist if timer required
- [ ] Search code for `<div id="timer-container">` - should exist if timer required
- [ ] Search CSS for `#timer-container` - MUST have `position: absolute` + centering transform
- [ ] Search CSS for header selector - MUST have `position: relative`
- [ ] Search code for `setInterval` - should ONLY appear in waitForPackages, NOT for timer logic
- [ ] Search code for `setTimeout` - should ONLY appear in waitForPackages, NOT for timer logic

**Visual Test:**
- [ ] Timer displays in game UI
- [ ] Timer is rendered in the top-center of the header (horizontally AND vertically centered)
- [ ] Timer stays centered when the header resizes (mobile / desktop widths)
- [ ] Timer does NOT shift lives/score/close-button placement in the header
- [ ] Timer counts correctly (up or down)
- [ ] Timer format is correct (MM:SS or seconds)
- [ ] onEnd callback fires when timer completes
- [ ] Timer pauses when tab becomes inactive
- [ ] Timer resumes when tab becomes active

## Reference

- Full API: [components/timer-component.md](../../components/timer-component.md)
- Quick reference: [reference/component-props.md](../../reference/component-props.md)
