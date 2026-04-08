# HTML Structure Template

The exact document structure every game must follow. Do not deviate from the element order. This template reflects the authoritative init sequence from `PRODUCTION-CHECKLIST.md`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Game Title}</title>

  <!-- ====== 1. SentryConfig package (MUST be first script) ====== -->
  <script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

  <!-- ====== 2. initSentry() definition (inline) ====== -->
  <script>
    function initSentry() {
      if (typeof SentryConfig === 'undefined' || !SentryConfig.enabled) return;
      if (typeof Sentry === 'undefined') return;
      Sentry.init(SentryConfig.getConfig({
        release: '{game-id}@1.0.0'
      }));
    }
  </script>

  <!-- ====== 3. Sentry SDK (3 scripts, NO integrity attribute) ====== -->
  <script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
  <script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
  <script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

  <!-- ====== 4. Initialize Sentry on load ====== -->
  <script>window.addEventListener('load', initSentry);</script>

  <!-- ====== 5-7. Game CDN packages (exact order: feedback-manager, components, helpers) ====== -->
  <script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
  <script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
  <script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>

  <style>
    /* 1. :root variables (--mathai-* system, including --mathai-success/error/warning) */
    /* 2. Reset: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } */
    /* 3. html, body { width: 100%; height: 100dvh; overflow: hidden; } -- use 100dvh NOT 100vh */
    /* 4. .hidden { display: none !important; } -- MUST be defined if .hidden class is used */
    /* 5. #results-screen { position: fixed; top:0; left:0; right:0; bottom:0; z-index:100; } */
    /* 6. Layout overrides for .mathai-layout-root (max-width: 480px; margin: 0 auto;) */
    /* 7. Transition screen overrides (.mathai-ts-screen.active, .mathai-ts-card) */
    /* 8. Gameplay styles (header, progress, question, options) */
    /* 9. Results screen / Game-over screen (lives games only) */
    /* 10. Micro-animations (@keyframes) */
    /* 11. Responsive & touch (44x44px targets, -webkit-tap-highlight-color: transparent) */
  </style>
</head>
<body>
  <!-- Body contains ONLY #app -- no manual layout divs (.page-center, .game-wrapper, .game-stack) -->
  <!-- ScreenLayout.inject() creates the internal scaffold including #gameContent -->
  <div id="app" data-phase="start_screen" data-score="0"></div>

  <script>
    /* ====== Function & variable definitions (global scope) ====== */
    /* 1. gameState initialization (gameId MUST be first field) */
    /* 2. window.gameState = gameState */
    /* 3. fallbackContent (complete rounds matching spec schema) */
    /* 4. Module-scope vars: timer, visibilityTracker, signalCollector, progressBar, transitionScreen */
    /* 5. syncDOM */
    /* 6. trackEvent */
    /* 7. recordAttempt */
    /* 8. getStars */
    /* 9. getRounds (with fallback) */
    /* 10. waitForPackages (typeof checks for 4 packages, 180s timeout) */
    /* 11. FeedbackManager preload + audio helper functions */
    /* 12. handlePostMessage */
    /* 13. render (phase router) */
    /* 14. startGame */
    /* 15. loadRound (first 3 lines: isProcessing=false, isActive=true, syncDOM) */
    /* 16. answer handler (with isProcessing + gameEnded guards) */
    /* 17. nextRound */
    /* 18. endGame (gameEnded guard, both victory + game-over paths) */
    /* 19. showResults (populate #results-screen directly, NOT via transitionScreen) */
    /* 20. restartGame (reset ALL fields including game-specific, re-instantiate SignalCollector) */

    /* ====== DOMContentLoaded -- 15-step init sequence ====== */
    document.addEventListener('DOMContentLoaded', async function() {
      try {
        /* 1.  await waitForPackages() */
        /* 2.  await FeedbackManager.init() -- do NOT call unlock() after */
        /* 3.  SignalCollector creation */
        /* 4.  ScreenLayout.inject('app', { sections: {...}, styles: {...} }) */
        /* 5.  Inject timer container into header slot */
        /* 6.  Build play area HTML into #gameContent */
        /* 7.  TimerComponent creation (autoStart: false) */
        /* 8.  InteractionManager creation */
        /* 9.  VisibilityTracker creation (onInactive/onResume handlers) */
        /* 10. createProgressBar() */
        /* 11. TransitionScreenComponent creation */
        /* 12. Audio preloading: FeedbackManager.sound.preload([{id, url}]) */
        /* 13. Register handlePostMessage listener -- BEFORE game_ready */
        /* 14. Send game_ready postMessage */
        /* 15. setupGame() */
      } catch (e) {
        console.error('[init] ' + e.message);
      }

      /* Window exposures (MUST be here, at bottom of DOMContentLoaded) */
      window.gameState = gameState;
      window.endGame = endGame;
      window.restartGame = restartGame;
      window.nextRound = nextRound;
      window.startGame = startGame;
    });
  </script>
</body>
</html>
```

## Initial `#app` Attributes

The `#app` element MUST have initial `data-*` attributes matching gameState initial values:

```html
<!-- No-lives game -->
<div id="app" data-phase="start_screen" data-score="0"></div>

<!-- Lives game -->
<div id="app" data-phase="start_screen" data-score="0" data-lives="3"></div>
```

**GEN-PHASE-INIT:** The `data-phase` value in HTML must match `gameState.phase` initial value. Mismatch = build failure.

## Script Loading Rules

Scripts load in two groups, in this exact order:

**Group 1: Sentry (error tracking)**
1. SentryConfig package: `https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js`
2. `initSentry()` inline definition
3. Sentry SDK (3 scripts from `https://browser.sentry-cdn.com/10.23.0/`) -- NO `integrity` attributes
4. `window.addEventListener('load', initSentry)` -- not inline call

**Group 2: Game CDN packages**
5. FeedbackManager: `https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js`
6. Components: `https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js`
7. Helpers: `https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js`

**Rules:**
- Never invent CDN URLs -- copy exactly from this template
- No other external scripts. No CDN libraries (jQuery, lodash, etc.)
- No `<link>` tags to external CSS
- All game CSS is inline in `<style>`
- All game JS is inline in `<script>`
- Sentry release tag must match game ID: `"{game-id}@1.0.0"`

## Init Sequence Rules

The `DOMContentLoaded` handler runs 15 steps in order (see template above). Critical constraints:

1. `waitForPackages()` uses `typeof` checks for FeedbackManager, TimerComponent, VisibilityTracker, SignalCollector with 180s timeout
2. `FeedbackManager.init()` must be awaited -- but do NOT call `unlock()` after it
3. `ScreenLayout.inject()` must run before any DOM insertion into `#gameContent`
4. PostMessage listener registered BEFORE `game_ready` sent -- prevents race condition
5. Entire init block wrapped in try/catch
6. `setupGame()` is the last call
7. Window exposures (`window.gameState`, `window.endGame`, `window.restartGame`, `window.nextRound`, `window.startGame`) at bottom of DOMContentLoaded
