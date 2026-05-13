# PART-025: ScreenLayout Component

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-002

---

ScreenLayout uses the `slots` API. `previewScreen: true` is the default configuration (required by PART-039); opt out with spec-level `previewScreen: false`, in which case `slots.previewScreen` MUST be omitted.

## Slots API — Per-shape configuration {#per-shape-slots}

Slot configuration depends on game shape. See [shapes.md § Decision Matrix](../skills/game-planning/reference/shapes.md#decision-matrix) for the full per-shape feature scope.

| Slot key | Multi-round (`totalRounds > 1`) | Standalone (`totalRounds: 1`) | Notes |
|---|---|---|---|
| `previewScreen: true` | included by default | included by default | OMIT when `spec.previewScreen: false` (creator-only opt-out) |
| `transitionScreen: true` | **REQUIRED** — multi-round flow uses TS for Welcome / Round-N / Victory / Game Over / Motivation / Stars Collected | **OMIT** — standalone has no transition screens ([GEN-FLOATING-BUTTON-STANDALONE-TS-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md#shape-enforcement)) | — |
| `progressBar: true` | included when `totalRounds > 1` | **OMIT** — standalone has no progress bar ([GEN-STANDALONE-NO-PROGRESS-BAR](../skills/game-building/reference/static-validation-rules.md#shape-enforcement)) | Creates `#mathai-progress-slot` at the top of `.game-stack` |
| `floatingButton: true` | included by default | included by default | OMIT when `spec.floatingButton: false` (creator-only opt-out); standalone TS prohibition still applies regardless |
| `answerComponent: true` | included by default | included by default | OMIT when `spec.answerComponent: false` (creator-only opt-out) |

## Slots API — Preview Wrapper (PART-039 games, default)

Multi-round example (all default slots):

```javascript
ScreenLayout.inject('app', {
  slots: {
    previewScreen: true,
    transitionScreen: true,                 // For multi-round games
    progressBar: true,
    floatingButton: true,
    answerComponent: true
  }
});

// Returns:
// { previewSlot, transitionSlot, gameContent }
```

Standalone example (omit `transitionScreen` and `progressBar`):

```javascript
ScreenLayout.inject('app', {
  slots: {
    previewScreen: true,
    floatingButton: true,
    answerComponent: true
    // NO transitionScreen — standalone uses AnswerComponent + FloatingButton for end-state
    // NO progressBar — standalone has no round-by-round progression
  }
});
```

### DOM Structure (slots + previewScreen:true)

```
#app
  .page-center
    #mathai-preview-slot                       (the persistent wrapper, always visible)
      .mathai-preview-header (fixed)           (avatar, label, score, star, progress, timer)
      .mathai-preview-body (scrollable)
        .mathai-preview-instruction
        .mathai-preview-game-container
          .game-stack
            #gameContent                       (game renders here)
            #mathai-transition-slot            (between-round transitions)
```

Key points:
- The header bar is `position: fixed` and visible in BOTH preview and game states.
- Instruction + game content share a single scroll area below the fixed header (no nested scrolling).
- `#gameContent` and `#mathai-transition-slot` are siblings inside `.game-stack` — no DOM moves at runtime.
- The round progress-bar slot (`#mathai-progress-slot`) is created at the top of `.game-stack` when `slots.progressBar: true` is passed; omitted otherwise (Shape 1 Standalone). The preview header carries its own audio-countdown strip (`#previewProgressBar`) — a different element.
- PreviewScreenComponent populates header content and manages state transitions.

When `previewScreen: false`, a `.game-wrapper > .game-stack > #gameContent` structure is created instead.

## HTML Requirement

```html
<div id="app"></div>
```

## CRITICAL: Game Content Placement

**ALL game HTML must render inside `#gameContent`.** Build HTML via JS after inject — never put game HTML directly in `<body>` or in `#app`.

```javascript
// Correct — build game HTML via JavaScript after inject
ScreenLayout.inject('app', { slots: { previewScreen: true, transitionScreen: true } });
var gameContent = document.getElementById('gameContent');
gameContent.innerHTML = '<div id="game-screen">...</div>';
```

## Rules

- Call `ScreenLayout.inject()` BEFORE creating ProgressBar, TransitionScreen, or PreviewScreen
- **ALL game content MUST be inside `#gameContent`** — never as a sibling of `#app`
- Don't manually create `.page-center` / `.game-wrapper` if using this component
- Build HTML in JS after inject — never put game HTML directly in `<body>` or `#app`
- With `previewScreen: true`: no `.game-wrapper`, no `#mathai-progress-slot`, no `#mathai-header-slot`, no `#mathai-question-slot`

## Verification

- [ ] `ScreenLayout.inject()` called with correct config mode
- [ ] `#app` div exists in HTML (the ONLY structural div in body before inject)
- [ ] **ALL game content rendered inside `#gameContent`**
- [ ] Game HTML built via JS innerHTML after inject (no static HTML in body)
- [ ] Slots match the components used

## Source Code

Full ScreenLayoutComponent implementation: `warehouse/packages/components/screen-layout/index.js`
