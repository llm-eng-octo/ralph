# PART-003: waitForPackages()

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-002

> **Single source of truth for the package set:** [`alfred/skills/game-building/reference/mandatory-components.md`](../../alfred/skills/game-building/reference/mandatory-components.md). The list below is the *baseline* (always-required components); the registry has the full set including conditional components (Preview, Transition, Progress, FloatingButton, AnswerComponent). Read the registry before generating the gate.

---

## Code

```javascript
function waitForPackages() {
  return new Promise(function (resolve, reject) {
    var startedAt = Date.now();
    var TIMEOUT_MS = 180000;
    function check() {
      var ok =
        typeof FeedbackManager !== 'undefined' &&
        typeof TimerComponent !== 'undefined' &&
        typeof VisibilityTracker !== 'undefined' &&
        typeof SignalCollector !== 'undefined' &&
        typeof ScreenLayout !== 'undefined' &&
        // Conditional rows from mandatory-components.md — keep ONLY those NOT opted out in spec.md.
        // Drop a row only when the matching opt-out flag is present in the spec.
        typeof PreviewScreenComponent !== 'undefined' &&        // drop if previewScreen: false
        typeof TransitionScreenComponent !== 'undefined' &&     // drop if game has only one screen (no transitionScreen slot)
        typeof ProgressBarComponent !== 'undefined' &&          // drop if Shape 1 single-screen (no progressBar slot)
        typeof FloatingButtonComponent !== 'undefined' &&       // drop if floatingButton: false
        typeof AnswerComponentComponent !== 'undefined';        // drop if answerComponent: false (creator-only)
      if (ok) return resolve(true);
      if (Date.now() - startedAt > TIMEOUT_MS) {
        return reject(new Error('waitForPackages timeout: ' + TIMEOUT_MS + 'ms'));
      }
      setTimeout(check, 100);
    }
    check();
  });
}
```

## Placement

Top of the `<script>` block, before any other functions.

## Rules

- **Hard `&&` only.** Every required class must be a hard `&&` term in the readiness expression. Do **not** write `|| typeof ScreenLayout !== 'undefined'` (or any `||`) inside the `ok = ...` expression. `ScreenLayout` and individual component classes register on `window` at *different* points in the same bundle's IIFE — one being defined does NOT imply the other is. Validator rule `GEN-WAITFORPACKAGES-NO-OR` rejects any `||` in the readiness expression.
- **Derive the set from the registry, not from this file.** [`mandatory-components.md`](../../alfred/skills/game-building/reference/mandatory-components.md) is authoritative. Drop a row from the gate only when its spec opt-out flag is set.
- **Timeout 180000ms (180s).** GCP CDN cold-start can take 30–120s; a shorter timeout produces flaky cold-load failures.
- **Reject (don't swallow) on timeout.** The promise must reject with an error so the standalone fallback can render an attributable failure UI.
- **TimerComponent is always checked**, even for games without timers — the components bundle always registers it globally, and other code paths assume the symbol exists.

## Anti-Patterns

```javascript
// ❌ WRONG: || ScreenLayout fallback (fail-open). Validator: GEN-WAITFORPACKAGES-NO-OR.
var ok =
  typeof FeedbackManager !== 'undefined' &&
  (typeof PreviewScreenComponent !== 'undefined' || typeof ScreenLayout !== 'undefined');

// ❌ WRONG: only checks one or two packages
async function waitForPackages() {
  while (typeof FeedbackManager === 'undefined') { ... }
}

// ❌ WRONG: no waitForPackages at all
window.addEventListener('DOMContentLoaded', async () => {
  await FeedbackManager.init(); // May fail — not loaded yet
});

// ❌ WRONG: gate references umbrella names. Validator: GEN-WAITFOR-BANNEDNAMES.
var ok = typeof Components !== 'undefined' && typeof Helpers !== 'undefined';
```

## Verification

- [ ] Function named `waitForPackages` exists.
- [ ] Readiness expression checks every component the file calls `new X(...)` on, AND every slot the file injects via `ScreenLayout.inject(...)`.
- [ ] Readiness expression contains zero `||` operators (validator: `GEN-WAITFORPACKAGES-NO-OR`).
- [ ] Timeout is 180000ms (180s).
- [ ] Promise rejects on timeout (does not silently resolve or hang).
- [ ] Standalone fallback (in `DOMContentLoaded`) re-checks the same set before booting and renders an attributable error if any class is still undefined — see `code-patterns.md` § Standalone fallback.
