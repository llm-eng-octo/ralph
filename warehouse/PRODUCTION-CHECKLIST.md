# MathAI Game — Production Readiness Checklist

> A comprehensive checklist for making any MathAI game production-ready. Covers architecture, platform integration, audio, layout, analytics, error tracking, and known pitfalls. Apply this before shipping any game.

---

## 1. HTML Structure & Single-File Architecture (RULE-007)

- [ ] `<!DOCTYPE html>` declaration present
- [ ] `<meta charset="UTF-8">` in `<head>`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1.0">` in `<head>`
- [ ] Single `<style>` block in `<head>` — all CSS inline, no external stylesheets
- [ ] Single `<script>` block in `<body>` — all game JS inline, no external game scripts
- [ ] Body contains only `<div id="app"></div>` — no manual layout divs (`.page-center`, `.game-wrapper`, `.game-stack`)
- [ ] No `#results-screen` div — use TransitionScreen content slot instead
- [ ] All game code in one `index.html` file — only CDN package scripts are external

---

## 2. Script Loading Order (PART-002)

Scripts must load in this exact order. Never invent URLs — copy from the warehouse.

```html
<!-- 1. SentryConfig package -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

<!-- 2. initSentry() function definition (inline script) -->

<!-- 3. Sentry SDK (3 scripts, NO integrity attribute) -->
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- 4. Initialize Sentry on load -->
<script>window.addEventListener('load', initSentry);</script>

<!-- 5-7. Game packages (exact URLs, this order) -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

- [ ] SentryConfig loads first
- [ ] Sentry SDK loads after SentryConfig, before game packages
- [ ] `initSentry()` called via `window.addEventListener('load', ...)` — not inline
- [ ] FeedbackManager → Components → Helpers in that order
- [ ] No `integrity` attributes on Sentry scripts
- [ ] Sentry release tag matches game ID: `"<game-id>@1.0.0"`

---

## 3. Initialization Sequence (PART-004)

DOMContentLoaded must run these steps in order:

```
1.  waitForPackages()
2.  FeedbackManager.init()           ← fires unlock popup internally, do NOT call unlock() again
3.  SignalCollector creation
4.  ScreenLayout.inject('app', {...})
5.  Inject timer container into header slot
6.  Build play area HTML into #gameContent
7.  TimerComponent creation
8.  InteractionManager creation
9.  VisibilityTracker creation
10. createProgressBar()
11. TransitionScreenComponent creation
12. Audio preloading
13. Register handlePostMessage listener  ← BEFORE game_ready
14. Send game_ready postMessage
15. setupGame()
```

- [ ] `waitForPackages()` checks FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector with 10s timeout
- [ ] `FeedbackManager.init()` is awaited — but do NOT call `unlock()` after it
- [ ] PostMessage listener registered BEFORE `game_ready` sent — prevents race condition
- [ ] Entire init block wrapped in try/catch
- [ ] `setupGame()` is the last call

---

## 4. CSS & Layout

### Reset & Viewport
- [ ] CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`
- [ ] `html, body { width: 100%; height: 100dvh; overflow: hidden; }` — use `100dvh` NOT `100vh`
- [ ] Body uses `font-family: var(--mathai-font-family)`, `background: var(--mathai-white)`, `color: var(--mathai-text-primary)`

### Layout Root
- [ ] `max-width: 480px; margin: 0 auto;` on `.mathai-layout-root` — constrains game on desktop
- [ ] Game is centered on wide screens, not pinned to left edge

### Play Area
- [ ] `.mathai-layout-playarea` display must **NOT** use `!important` — TransitionScreen toggles `#gameContent.style.display` inline. `!important` breaks this
- [ ] Other playarea properties (flex-direction, align-items, padding) CAN use `!important`

### Transition Screen Overrides
- [ ] `.mathai-ts-screen.active { flex: 1; justify-content: flex-start; padding-top: 16px; }` — positions card near top, not centered with large gap
- [ ] `.mathai-ts-card { min-height: 50dvh; }` — ensures card has adequate height

### Theming
- [ ] All colors use `var(--mathai-*)` CSS variables — no hardcoded hex values
- [ ] Fallback values provided for critical colors: `var(--mathai-text-primary, #000000)`
- [ ] Instruction/question text uses `--mathai-text-primary` — not blue or other theme colors

### Responsive & Touch
- [ ] Touch targets ≥ 44×44px on all interactive elements
- [ ] `:hover` states on interactive elements for desktop mouse users
- [ ] `:active { transform: scale(0.95) }` or similar for tap feedback
- [ ] `-webkit-tap-highlight-color: transparent` on interactive elements
- [ ] `user-select: none; -webkit-user-select: none;` on interactive elements
- [ ] Package CSS changes require CDN deployment — use game-level CSS overrides for immediate effect

---

## 5. ScreenLayout v2 (PART-025)

- [ ] Use `config.sections` API (v2), **NOT** `config.slots` (v1 — deprecated)
- [ ] All 5 sections enabled: `header`, `questionText`, `progressBar`, `playArea`, `transitionScreen`
- [ ] Custom styles passed via `config.styles` object (header, questionText, progressBar, playArea, body)
- [ ] Timer container injected into header slot AFTER `ScreenLayout.inject()`
- [ ] Play area HTML built into `#gameContent` AFTER layout injection
- [ ] Question text stays visible on ALL screens — never hidden during gameplay or transitions

---

## 6. Audio & Autoplay Policy (PART-017)

### Unlock Pattern
- [ ] Do NOT call `FeedbackManager.unlock()` after `FeedbackManager.init()` — init fires it internally
- [ ] Do NOT block initialization waiting for audio unlock
- [ ] Poll `canPlayAudio()` only where audio actually needs to play (e.g., welcome screen VO):
  ```javascript
  await new Promise(function(resolve) {
    if (FeedbackManager.canPlayAudio()) return resolve();
    var check = setInterval(function() {
      if (FeedbackManager.canPlayAudio()) { clearInterval(check); resolve(); }
    }, 200);
    setTimeout(function() { clearInterval(check); resolve(); }, 15000);
  });
  ```

### Preloading
- [ ] All static sounds preloaded with `FeedbackManager.sound.preload([{id, url}])` in DOMContentLoaded
- [ ] Use `sound.preload()` — NOT `sound.register()`
- [ ] All audio URLs are full CDN paths — never relative
- [ ] No unused sounds in preload list — remove any that are never played

### Playback Patterns
- [ ] **UI sounds (select/deselect): fire-and-forget** — no `await`, don't block interaction
- [ ] **Feedback sounds (correct/incorrect): awaited** — must complete before next interaction
- [ ] **Transition screen audio: awaited** — plays after screen is visible
- [ ] **End screen audio: show screen FIRST, play audio AFTER** — user sees results immediately
- [ ] **Dynamic TTS: `FeedbackManager.playDynamicFeedback()`** — NOT `sound.play('dynamic')`
- [ ] Dynamic audio stops on user interaction: `FeedbackManager.stream.stopAll()`
- [ ] Transition screen audio stops on button click: `FeedbackManager.sound.stopAll()`
- [ ] Skip redundant sounds when auto-evaluation triggers (e.g., skip bubble select when correct/incorrect sound plays immediately)

### Stickers & Subtitles
- [ ] Sticker `duration` is in **SECONDS**, not milliseconds — `StickerComponent` does `duration * 1000` internally
- [ ] All sticker image URLs are full CDN paths
- [ ] Every transition screen plays audio — no silent transitions

### InteractionManager (PART-038)
- [ ] Attached to `window.interactionManager`
- [ ] Selector targets the game's interactive container (e.g., `.tile-grid`)
- [ ] `disableOnAudioFeedback: false` if users should interact during non-blocking audio
- [ ] `disableOnEvaluation: true` to block during correct/incorrect feedback

---

## 7. Timer & Visibility Tracker (PART-005, PART-006)

### TimerComponent
- [ ] `timerType: 'increase'` (count-up) or `'decrease'` (countdown) as appropriate
- [ ] `format: 'min'` for MM:SS display
- [ ] `autoStart: false` — timer starts only when gameplay begins
- [ ] `endTime` set appropriately (e.g., `100000` for no practical limit, or actual countdown value)

### Timer in startRound()
- [ ] Call `timer.resume()` → `timer.reset()` → `timer.start()` in that order
- [ ] The `resume()` clears `isExternallyControlled` flag set by manual `pause()` — without it, visibility tracker resume is blocked after tab switch

### Timer in Transitions
- [ ] `timer.pause(); timer.reset();` at start of every transition screen function
- [ ] Timer not running during welcome screen, level intros, or end screens

### VisibilityTracker
- [ ] Created with `onInactive` and `onResume` handlers
- [ ] Popup props: title, description, primaryText for the resume popup
- [ ] `onInactive`: pause timer (`{ fromVisibilityTracker: true }`), pause audio (`sound.pause()` NOT `stopAll()`), pause streams, pause signalCollector
- [ ] `onResume`: resume timer (`{ fromVisibilityTracker: true }`), resume audio, resume streams, resume signalCollector
- [ ] Duration tracking: push `{ start }` on inactive, set `end` on resume, accumulate `totalInactiveTime`

---

## 8. Game State (PART-007)

### Mandatory Fields
- [ ] `currentRound`, `totalRounds`, `score`, `attempts[]`, `events[]`
- [ ] `startTime`, `isActive`, `content`
- [ ] `duration_data: { startTime, preview[], attempts[], evaluations[], inActiveTime[], totalInactiveTime, currentTime }`

### Game-Specific Fields
- [ ] All custom state fields declared in gameState (e.g., `lives`, `selectedTiles`, `roundTimes`, `isProcessing`)
- [ ] `isProcessing` guard flag for preventing double-taps during feedback
- [ ] `voGameStartPlayed` flag — play welcome VO only once, even across restarts

### Global Variables
- [ ] `timer`, `visibilityTracker`, `signalCollector`, `progressBar`, `transitionScreen` declared at module scope
- [ ] `currentDynamicAudio` reference for stopping dynamic TTS on early interaction

---

## 9. Game State Guards & Interaction

- [ ] `isProcessing` check at top of every interaction handler — return early if true
- [ ] `isActive` check at top of every interaction handler — return early if false
- [ ] `isProcessing = true` set at start of correct/incorrect handlers
- [ ] `isProcessing = false` reset on ALL exit paths:
  - Correct → before advancing to next round
  - Incorrect (lives remaining) → after tile reset
  - Game over / game complete → `restartGame()` resets it
- [ ] Star rating thresholds match user-facing hint text (inclusive vs exclusive bounds)
- [ ] Conditional button text: "Play Again" at max stars, "Retry for more stars" otherwise

---

## 10. Attempt & Event Tracking (PART-009, PART-010)

### Attempt Recording
- [ ] `recordAttempt()` called on every correct AND incorrect answer
- [ ] Attempt shape includes: `attempt_timestamp`, `time_since_start_of_game`, `input_of_user`, `attempt_number`, `correct`, `metadata`
- [ ] Metadata includes: `round`, `question`, `correctAnswer`, `validationType`

### Event Tracking
- [ ] `trackEvent()` fires at ALL interaction points:
  - `game_start`, `game_end`, `game_paused`, `game_resumed`
  - Game-specific: tile_select, tile_deselect, correct_answer, incorrect_answer, life_lost, question_shown, level_transition
- [ ] Events include relevant context data (round number, target, selected values, time taken)

### SignalCollector
- [ ] Created with sessionId, studentId, gameId
- [ ] `recordViewEvent('content_render', ...)` on every DOM change / screen render
- [ ] `recordViewEvent('visual_update', ...)` on tile selection/deselection
- [ ] `recordViewEvent('feedback_display', ...)` on correct/incorrect feedback
- [ ] `recordCustomEvent()` for game-specific events (round_solved, visibility changes)
- [ ] `seal()` called before `game_complete` postMessage
- [ ] SignalCollector config updated from postMessage `game_init` data (flushUrl, playId, etc.)
- [ ] `startFlushing()` called after config update

---

## 11. End Game & Metrics (PART-011)

- [ ] `endGame()` called at START of showGameComplete/showGameOver — before audio plays
- [ ] Idempotency guard: `if (!gameState.isActive) return;`
- [ ] Sets `gameState.isActive = false`
- [ ] Records `duration_data.currentTime`
- [ ] Calculates: accuracy, timeTaken, stars, attempts count
- [ ] Logs final metrics with `JSON.stringify`
- [ ] Sends `game_complete` postMessage with full metrics object
- [ ] Cleanup: `timer.destroy()`, `visibilityTracker.destroy()`, `sound.stopAll()`, `stream.stopAll()`
- [ ] `signalCollector.seal()` before postMessage

---

## 12. restartGame() Completeness

- [ ] Push to `sessionHistory` before resetting — preserves analytics across retries
- [ ] Reset ALL game state fields: currentRound, score, lives, attempts, events, selectedTiles, roundTimes, roundStartTime, isProcessing, duration_data
- [ ] Set `isActive = true`, `startTime = Date.now()`
- [ ] Recreate destroyed components: timer, visibilityTracker, signalCollector, progressBar
- [ ] Recreated timer uses same config as original
- [ ] Recreated visibilityTracker uses same handlers and popup props
- [ ] `createProgressBar()` and `progressBar.update(0, lives)`
- [ ] Fire `trackEvent('game_start', 'game')`
- [ ] Restore question text visibility
- [ ] Show welcome screen — user expects a fresh start

---

## 13. TransitionScreen v2 (PART-024)

Every game needs these screens:

| Screen | Title | Button | Audio | Persist |
|--------|-------|--------|-------|---------|
| Welcome | Game title | "Start Game" (primary) | Welcome VO + sticker | true |
| Level Intro (×N) | "Level N" | "I'm ready! 💪" (primary) | Level VO + sticker | true |
| Game Complete | "Game Complete! 🎉" | Conditional text (secondary) | Victory + stars VO | true |
| Game Over | "Game Over" | "Try Again" (primary) | Game over sound | true |

- [ ] All screens use `persist: true`
- [ ] Game complete shows stars and metrics via `content` slot
- [ ] Level 2+ intros show performance subtitle (e.g., average time)
- [ ] Button actions stop playing audio before transitioning
- [ ] End screens: `transitionScreen.show()` BEFORE audio plays

---

## 14. ProgressBar v2 (PART-023)

- [ ] Created via `createProgressBar()` helper function
- [ ] Config: `slotId: 'mathai-progress-slot'`, `totalRounds`, `totalLives`
- [ ] `progressBar.update(currentRound, lives)` called at:
  - Init (`update(0, lives)`)
  - After correct answer
  - After incorrect answer (lives decremented)
- [ ] `progressBar.destroy()` before recreating (in createProgressBar helper)

---

## 15. PostMessage Protocol (PART-008)

- [ ] `game_ready` sent after all init complete — triggers parent to send content
- [ ] `game_init` handler: receives content, updates signalCollector config, calls `setupGame()`
- [ ] `game_complete` sent from `endGame()` with: `{ metrics, attempts, completedAt }`
- [ ] All postMessages use `'*'` as target origin
- [ ] `setupGame()` falls back to `fallbackContent` if no content received

---

## 16. Input Schema & Content (PART-028)

- [ ] JSON schema defined with types, constraints, required fields
- [ ] Fallback content for standalone testing — game works without postMessage
- [ ] Fallback content respects all stated constraints
- [ ] Content set generation guidance: 3 sets (easy, medium, hard) with specific dimension variations
- [ ] Expression/formula evaluation is safe — try/catch with graceful fallback
- [ ] All content constraints documented (e.g., "no single tile equals target", "at least one valid subset")

---

## 17. Rules Compliance

### RULE-001: Global Scope
- [ ] All functions referenced in HTML onclick/onchange handlers are in global scope — not inside DOMContentLoaded

### RULE-002: Async/Await
- [ ] Every function using `await` is declared `async`

### RULE-003: Error Handling
- [ ] Every async operation wrapped in try/catch
- [ ] Catch blocks log with context, don't crash the game

### RULE-004: Structured Logging
- [ ] All `console.log` / `console.error` use `JSON.stringify()` — never raw objects

### RULE-005: Cleanup
- [ ] `endGame()` destroys: timer, visibilityTracker
- [ ] `endGame()` stops: `FeedbackManager.sound.stopAll()`, `FeedbackManager.stream.stopAll()`
- [ ] No lingering intervals, timeouts, or event listeners after game ends

### RULE-006: No Custom Implementations
- [ ] Audio: use `FeedbackManager` — no `new Audio()`
- [ ] Timer: use `TimerComponent` — no `setInterval` for timing
- [ ] Pause detection: use `VisibilityTracker` — no manual `visibilitychange` listeners
- [ ] Subtitles: managed by `FeedbackManager` — no `SubtitleComponent.show()` directly

### RULE-007: Single File
- [ ] Everything in one `index.html`
- [ ] No external CSS files, no external JS files (except CDN packages from PART-002)

---

## 18. Sentry Error Tracking (PART-030)

- [ ] `initSentry()` defined before Sentry SDK loads
- [ ] Checks `SentryConfig.enabled` and `typeof Sentry !== 'undefined'` before init
- [ ] Release tag: `"<game-id>@1.0.0"`
- [ ] Standard `ignoreErrors` list (ResizeObserver, Non-Error promise rejection, Script error, Load failed, Failed to fetch)
- [ ] `verifySentry()` debug function confirms SDK loaded and initialized
- [ ] `testSentry()` debug function sends a test error

---

## 19. Debug Functions (PART-012)

All attached to `window` for console access:

- [ ] `debugGame()` — dumps full `gameState`
- [ ] `debugAudio()` — dumps sound + stream state
- [ ] `testAudio(id)` — plays a specific preloaded sound
- [ ] `testPause()` — simulates tab inactive (pauses timer, audio, signals)
- [ ] `testResume()` — simulates tab resume
- [ ] `debugSignals()` — dumps SignalCollector state, input events, current view
- [ ] `verifySentry()` — checks Sentry SDK status
- [ ] `testSentry()` — sends test error to Sentry
- [ ] `loadRound(n)` — jumps to round N for testing

---

## 20. Spec Completeness

- [ ] **Every HTML change reflected in spec.md** — code examples, flow descriptions, checklist all match
- [ ] **Spec is the generation source** — a stale spec produces buggy regenerations
- [ ] **Audio sequence table** — every audio moment documented with: trigger, sound ID, await behavior, sticker, notes
- [ ] **Callout boxes for pitfall patterns** — `> **IMPORTANT:**` blocks for audio unlock, sticker duration units, display !important, timer resume
- [ ] **Flow descriptions match code** — prose and code examples must agree
- [ ] **Input schema with examples** — complete fallback content showing exact data shape
- [ ] **Content authoring constraints** — rules content generators must follow
- [ ] **Test scenarios** — exact selectors, exact actions, exact assertions for every user flow
- [ ] **Scaffold points documented** — optional extension hooks for hints/difficulty adjustment
- [ ] **Visual specs** — colors, typography, spacing, interactive states, responsive behavior

---

## Quick Reference: Common Pitfalls

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| Calling `unlock()` after `init()` | "User did not grant audio permission" | Poll `canPlayAudio()` instead |
| `duration: 5000` on stickers | Sticker visible for 83 minutes | Use `duration: 5` (seconds) |
| `display: flex !important` on playarea | Transition screen never shows | Remove `!important` from display property only |
| No `timer.resume()` before `start()` | Timer stuck after tab switch | Add `timer.resume()` before `reset()`+`start()` |
| `avgTime < 3` for 3-star threshold | Exactly 3s gets 2 stars | Use `<=` to match user-facing hint text |
| Audio before screen on end screens | Blank screen while audio plays | Show screen first, play audio after |
| `sound.stopAll()` in visibility handler | Audio lost on tab switch | Use `sound.pause()` to preserve state |
| Hiding question text during gameplay | Instructions disappear | Keep visible on ALL screens |
| `100vh` instead of `100dvh` | Content hidden behind mobile address bar | Always use `100dvh` |
| Missing `isProcessing` guard | Double-tap causes duplicate feedback | Check at top of every interaction handler |
| PostMessage listener after `game_ready` | `game_init` missed, game stuck on fallback | Register listener BEFORE sending `game_ready` |
| `sound.register()` for preloading | Sounds don't load | Use `sound.preload([{id, url}])` |
| Raw objects in console.log | `[object Object]` in logs | Always `JSON.stringify(obj, null, 2)` |
| External CSS/JS files | Violates RULE-007, deployment issues | Everything inline in single `index.html` |
| `new Audio()` for sounds | No iOS support, no volume control | Use `FeedbackManager.sound.play()` |
