# Post-Generation Verification Checklist

This checklist is used by the LLM to verify generated HTML against known issues.
Ralph runs this as a loop (max 5 iterations) after HTML generation, before Playwright tests.

**Instructions for the verifying LLM:**
- Read the generated `index.html` and the game template `spec.md`
- For each section, check every item against the actual code
- Mark each item: `PASS`, `FAIL: <reason>`, or `SKIP` (if feature not used in this game)
- If ANY item is `FAIL`, output the fixes needed
- Be precise — cite line numbers and exact code snippets

---

## 1. Package Loading & Initialization

- [ ] Script tags in correct order: FeedbackManager → Components → Helpers
- [ ] `waitForPackages()` exists and polls for all required globals
- [ ] `waitForPackages()` has a timeout (≤10s) with error handling
- [ ] `FeedbackManager.init()` is called inside `DOMContentLoaded` or `window.onload`
- [ ] `FeedbackManager.init()` is awaited before any FeedbackManager usage
- [ ] No FeedbackManager calls (sound.play, sound.preload, etc.) before `init()` completes
- [ ] Initialization order: `waitForPackages()` → `FeedbackManager.init()` → SignalCollector → audio preload → ScreenLayout.inject() → populate slots → Timer → TransitionScreen → VisibilityTracker → progressBar.update(0) → postMessage listener → game_ready → `showWelcomeScreen()`

## 2. Audio / FeedbackManager

- [ ] Audio preloaded using `FeedbackManager.sound.preload([{id, url}])` — NOT `sound.register()`
- [ ] `sound.preload()` receives an **array** of `{id, url}` objects, not individual calls
- [ ] `sound.preload()` is called ONCE after `FeedbackManager.init()`, before any `sound.play()`
- [ ] All audio IDs used in `sound.play()` are present in the `preload()` array
- [ ] All audio URLs from the spec/template are included in `preload()` — none missing
- [ ] `sound.play()` is always `await`ed when subsequent code depends on audio completion
- [ ] No `onComplete` callback passed to `sound.play()` — use `await` instead
- [ ] No `sound.register()` calls anywhere in the code
- [ ] No `new Audio()` or `audio.play()` — all audio through FeedbackManager
- [ ] Dynamic feedback uses `FeedbackManager.playDynamicFeedback({audio_content, subtitle})`
- [ ] Audio does not carry between screens — verify audio is properly sequenced with `await` before screen transitions
- [ ] When two audio calls happen back-to-back, the first is `await`ed before the second starts (mono mode: new audio cuts the current one)
- [ ] **Cleanup between rounds / end of game**: No leftover audio, subtitle, or sticker from the previous round carries over into the next round or the end screen. Every `nextRound()`, `scheduleNextRound()`, `restartGame()`, and `endGame()` body MUST call `try { FeedbackManager.sound.stopAll(); } catch(e) {} try { FeedbackManager.stream.stopAll(); } catch(e) {}` BEFORE mutating `gameState` for the new phase. Exempt only if the function itself triggers a NEW `FeedbackManager.playDynamicFeedback()` (the new overlay auto-clears the previous one). Canonical source: **alfred/skills/feedback/SKILL.md** Cross-Cutting Rule 10 + reference/timing-and-blocking.md § Round/Phase Cleanup. Validator: `5e0-CLEANUP-BETWEEN-ROUNDS`.
- [ ] **Custom feedback DOM also cleared**: if the game renders subtitle/sticker/feedback outside the FeedbackManager overlay (e.g. `#feedback-area`, `#feedback-panel`, custom sticker node), the same cleanup block MUST reset `feedbackEl.textContent = ''` and remove transient classes (`show`, `correct`, `incorrect`, `visible`, `playing`). Do NOT `.remove()` the node — cached references become stale (GEN-DOM-CACHE).

## 3. VisibilityTracker & Tab Switch

- [ ] VisibilityTracker instantiated with `onInactive` and `onResume` callbacks
- [ ] `onInactive` calls `FeedbackManager.sound.pause()` — NOT `sound.stopAll()`
- [ ] `onInactive` calls `FeedbackManager.stream.pauseAll()`
- [ ] `onResume` calls `FeedbackManager.sound.resume()`
- [ ] `onResume` calls `FeedbackManager.stream.resumeAll()`
- [ ] Timer paused with `timer.pause({ fromVisibilityTracker: true })` — NOT bare `timer.pause()`
- [ ] Timer resumed with `timer.resume({ fromVisibilityTracker: true })` — NOT bare `timer.resume()`
- [ ] SignalCollector paused/resumed in visibility callbacks (`signalCollector.pause()` / `.resume()`)
- [ ] `gameState.inactiveStartTime` tracked in `onInactive`, `gameState.totalInactiveTime` updated in `onResume`

## 4. Timer (skip if no timer)

- [ ] Timer container element exists in HTML with matching ID (e.g., `id="timer-container"`)
- [ ] `TimerComponent` instantiated AFTER DOM is ready (inside DOMContentLoaded/onload)
- [ ] Timer config includes required fields: `containerId`, `timerType`, `startTime`/`endTime`
- [ ] For countdown timers: `timerType: 'decrease'` with `startTime` > `endTime`
- [ ] For count-up timers: `timerType: 'increase'` with large `endTime` (e.g., 99999)
- [ ] `timer.start()` is called at the right moment (in `setupGame()` or round start)
- [ ] `onEnd` callback handles timer expiry (advance round or end game)
- [ ] Timer is destroyed and recreated on game restart: `timer.destroy()` then `new TimerComponent()`
- [ ] Timer is NOT started before the game is actually ready for the player

## 5. Rounds & Game Flow (skip if single-screen game)

- [ ] `gameState.currentRound` initialized and incremented correctly
- [ ] `gameState.totalRounds` set from content data
- [ ] Round content renders from the content array (not hardcoded)
- [ ] Round advances only after correct answer + user action (next button or auto-advance)
- [ ] `endGame()` called when `currentRound >= totalRounds`
- [ ] Submit button state managed: enabled/disabled/visible at correct times
- [ ] User input cleared between rounds (selected options, typed text, drag state)
- [ ] **Feedback cleared between rounds**: audio stopped, subtitle text cleared, sticker hidden — no carryover from previous round. See Section 2 cleanup item.
- [ ] Attempt recorded for each answer submission with correct shape

## 6. End Game & Metrics

- [ ] `endGame()` has a guard against double-call (`if (gameState.gameEnded) return`)
- [ ] `gameState.isActive` set to `false` in `endGame()`
- [ ] Timer stopped in `endGame()` (if present)
- [ ] **Feedback stopped in `endGame()`**: FIRST line after the `gameEnded` guard calls `try { FeedbackManager.sound.stopAll(); } catch(e) {} try { FeedbackManager.stream.stopAll(); } catch(e) {}` — no audio/subtitle/sticker from the last round may be audible or visible on the victory/game-over screen. Custom feedback DOM also cleared (textContent/classList). See alfred/skills/feedback/reference/timing-and-blocking.md § "Round/Phase Cleanup" for the canonical `endGame()` ordering.
- [ ] **Feedback stopped in `restartGame()`**: same cleanup block runs BEFORE recreating SignalCollector/Timer/ProgressBar/VisibilityTracker, so a restart never starts with residual audio or a leftover sticker from the previous session.
- [ ] Accuracy calculated: `correctCount / totalRounds`
- [ ] Stars calculated: ≥80% → 3, ≥50% → 2, >0% → 1, 0% → 0
- [ ] `game_complete` postMessage sent with `{ metrics, attempts, events }`
- [ ] SignalCollector sealed before postMessage: `signalCollector.seal()`
- [ ] Results shown via `transitionScreen.show({ content: metricsHTML, persist: true })` — NOT a separate `#results-screen` div
- [ ] Restart button calls `restartGame()` which resets ALL state and recreates components — does NOT reload page
- [ ] `restartGame()` preserves `content` and `sessionHistory`
- [ ] `restartGame()` recreates: SignalCollector, Timer, ProgressBar, VisibilityTracker

## 7. SignalCollector

- [ ] SignalCollector initialized with `sessionId`, `studentId`, `gameId`
- [ ] `window.signalCollector` assigned
- [ ] `recordViewEvent('content_render', ...)` called when each round/question renders
- [ ] `recordViewEvent()` called in functions that modify visible DOM
- [ ] `data-signal-id` attributes on important interactive elements
- [ ] `seal()` called in `endGame()` before postMessage

## 8. Subjective Evaluation (skip if not used)

- [ ] Uses `MathAIHelpers.SubjectiveEvaluation.evaluate()` with `components` array
- [ ] Each component has `component_id` and `evaluation_prompt`
- [ ] Returns `{ data: [{ evaluation, feedback }] }` — NOT `{ correct, feedback }`
- [ ] Wrapped in try/catch with fallback
- [ ] Loading state shown during evaluation (button disabled + text change)
- [ ] Button re-enabled on both success and error

## 9. Sentry (skip if not included)

- [ ] SentryConfig script loaded before Sentry SDK
- [ ] Uses `SentryConfig.dsn` — NOT a placeholder DSN
- [ ] `SentryConfig.enabled` checked before `Sentry.init()`
- [ ] All 6 ignore patterns included
- [ ] Uses `Sentry.getClient()` — NOT deprecated `getCurrentHub().getClient()`

## 10. Analytics (skip if not included)

- [ ] Both `config.js` AND `index.js` script tags present (config FIRST)
- [ ] `analytics.init()` called after `FeedbackManager.init()`
- [ ] `analytics.identify()` called after `game_init` with student data
- [ ] Mandatory events tracked at correct trigger points

## 11. Stories (skip if not used)

- [ ] Constructor uses `storyBlockId` — NOT a `stories` array
- [ ] `onComplete` callback receives `{ history, inputs, globalContext, durations }`
- [ ] `onStoryChange` signature: `(index, direction, storyData)` — NOT `(index)`

## 12. ScreenLayout v2 & Components

- [ ] Body contains only `<div id="app"></div>` — no manual layout HTML
- [ ] `ScreenLayout.inject()` uses `config.sections` API — NOT deprecated `config.slots`
- [ ] Sections: `questionText`, `progressBar`, `playArea`, `transitionScreen` all `true`
- [ ] `header` section present only if game has timer/HUD
- [ ] ⛔ No `.page-center` / `.game-wrapper` / `.game-stack` manual HTML (deprecated v1)
- [ ] ⛔ No `#results-screen` div (use TransitionScreen content slot)
- [ ] `.mathai-layout-playarea` CSS overrides use `!important`
- [ ] `.mathai-ts-screen.active` has `flex: 1; justify-content: center;`
- [ ] All game content injected into `#gameContent` via JS after `ScreenLayout.inject()`
- [ ] `createProgressBar()` helper exists, called at init and restart
- [ ] `progressBar.update(0, lives)` at init — NOT `update(1, ...)`
- [ ] `TransitionScreenComponent` instantiated with `autoInject: true`
- [ ] Welcome screen shown with `transitionScreen.show()` + `vo_game_start` audio
- [ ] **Every transition screen plays audio** — no silent transitions
- [ ] Question text (`#mathai-question-slot`) hidden during gameplay, shown on welcome/restart
- [ ] Level transitions (if multi-level) shown with `vo_level_start_N` audio
- [ ] Victory/game-over shown via TransitionScreen with persist:true
- [ ] `voGameStartPlayed` guard prevents duplicate welcome VO on restart

## 13. General Code Quality

- [ ] All async functions wrapped in try/catch
- [ ] `console.error` uses `JSON.stringify({ error: error.message }, null, 2)` format
- [ ] No inline SignalCollector stubs/polyfills (shadows the real package)
- [ ] postMessage listener checks `event.data.type === 'game_init'`
- [ ] `setupGame()` is called from the postMessage handler, not directly at script load
- [ ] Fallback: if no `game_init` after timeout, `setupGame()` with defaults for standalone testing
- [ ] All `<script src="...">` URLs are correct, well-formed, and match the URLs given in the spec — no hallucinated or typo'd CDN domains
- [ ] All resource URLs (audio, images, stickers) match the URLs provided in the spec — no invented or broken paths
