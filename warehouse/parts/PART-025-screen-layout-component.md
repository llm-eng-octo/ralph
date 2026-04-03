# PART-025: ScreenLayout Component (v2)

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-002

---

> ⚠️ **v2 Update:** This part now uses the `sections` API. The old `slots` API is **deprecated**. All new games MUST use `config.sections`. See [MATHAI-EQUIVALENCE](../../claude-skills/mathai/game-spec/MATHAI-EQUIVALENCE.md) for full review guidelines.

## Code

```javascript
ScreenLayout.inject('app', {
  sections: {
    header: true,            // Only if game has timer/HUD — omit or false otherwise
    questionText: true,      // ALWAYS — displays game instructions
    progressBar: true,       // ALWAYS — round progress + lives
    playArea: true,          // ALWAYS — main game content
    transitionScreen: true   // ALWAYS — welcome/level/results screens
  },
  styles: {
    header: { background: '#1A1A2E' },
    questionText: {
      padding: '16px 20px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%'
    },
    progressBar: {
      padding: '0 20px',
      maxWidth: '600px',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: '8px',
      width: '100%'
    }
  }
});

// Returns:
// { header, questionText, progressBar, playArea, transitionSlot, progressSlot, gameContent }
```

## HTML Requirement

```html
<div id="app"></div>
```

ScreenLayout injects the full page structure into this div. Your game content goes inside `#gameContent`.

## Section Configurations

| Section | Required | Default Slot ID | Purpose |
|---------|----------|----------------|---------|
| `header` | Only if timer/HUD | `mathai-header-slot` | Sticky top bar for timer |
| `questionText` | **YES** | `mathai-question-slot` | Game instructions text |
| `progressBar` | **YES** | `mathai-progress-slot` | Round/level progress + hearts |
| `playArea` | **YES** (always created) | `gameContent` | Main game content |
| `transitionScreen` | **YES** | `mathai-transition-slot` | Welcome/level/results cards |

## DOM Structure Produced (v2)

```
#app
  .mathai-layout-root (100dvh flex column)
    .mathai-layout-header  (#mathai-header-slot)    ← sticky, z-index: 10
    .mathai-layout-body                             ← scrollable flex column
      .mathai-layout-question (#mathai-question-slot)
      .mathai-layout-progress (#mathai-progress-slot)
      .mathai-layout-playarea (#gameContent)         ← flex: 1
      #mathai-transition-slot                        ← sibling of playArea
```

Question text and progress bar stay visible above both game content and transition screens.

## CRITICAL: Game Content Placement

When using ScreenLayout, **ALL game HTML must render inside `#gameContent`**. ScreenLayout creates the layout structure automatically — your game content slot is `#gameContent`.

**Wrong — game HTML as sibling of `#app` (content escapes the layout):**
```html
<div id="app"></div>
<!-- WRONG: This renders OUTSIDE the ScreenLayout wrapper -->
<div id="game-screen">
  <div class="game-grid">...</div>
</div>
```

**Wrong — game HTML directly in `#app` (overwritten by ScreenLayout.inject):**
```html
<div id="app">
  <!-- WRONG: ScreenLayout.inject('app') replaces this -->
  <div class="game-grid">...</div>
</div>
```

**Correct — build game HTML via JavaScript after inject:**
```javascript
ScreenLayout.inject('app', {
  sections: { questionText: true, progressBar: true, playArea: true, transitionScreen: true }
});
var gameContent = document.getElementById('gameContent');
gameContent.innerHTML =
  '<div id="play-stage" class="play-stage">' +
    '<div class="target-area" id="target-area">...</div>' +
    '<div class="options-area" id="options-area"></div>' +
  '</div>';
```

## CSS Override — CRITICAL

ScreenLayout v2 CSS loads dynamically (after game CSS), so play area overrides MUST use `!important`:

```css
.mathai-layout-playarea {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding: 0 20px 32px !important;
}

.mathai-ts-screen.active {
  flex: 1;
  justify-content: center;
}
```

## Question Text Pattern

```javascript
// Populate at init
function updateInstructions() {
  var slot = document.getElementById('mathai-question-slot');
  if (!slot || !gameState.content) return;
  slot.innerHTML =
    '<div class="instruction-area">' +
      '<p class="instruction-text">Game instruction here.</p>' +
    '</div>';
}

// Hide when game starts (free screen space)
function startGame() {
  var questionSlot = document.getElementById('mathai-question-slot');
  if (questionSlot) questionSlot.style.display = 'none';
  // ...
}

// Show on welcome screen
function showWelcomeScreen() {
  var questionSlot = document.getElementById('mathai-question-slot');
  if (questionSlot) questionSlot.style.display = '';
  // ...
}
```

## Rules

- Call `ScreenLayout.inject()` BEFORE creating ProgressBar or TransitionScreen
- **ALL game content MUST be inside `#gameContent`** — never as a sibling of `#app`
- Don't manually create `.page-center` / `.game-wrapper` if using this component
- Build HTML in JS after inject — never put game HTML directly in `<body>` or `#app`
- Use `!important` on `.mathai-layout-playarea` CSS overrides
- `header` section is only needed when the game has a timer or HUD element
- `questionText` is populated at init, hidden during gameplay, shown on restart

## Deprecated: v1 slots API

```javascript
// ⛔ DEPRECATED — do NOT use in new games
ScreenLayout.inject('app', {
  slots: { progressBar: true, transitionScreen: true }
});
```

The `slots` API still works for backwards compatibility but produces the old v1 DOM structure (`.page-center > .game-wrapper > .game-stack`). All new games MUST use `sections`.

## Verification

- [ ] `ScreenLayout.inject()` called with `config.sections` (NOT `config.slots`)
- [ ] `questionText`, `progressBar`, `playArea`, `transitionScreen` all set to `true`
- [ ] `header` set to `true` only if game has timer/HUD
- [ ] `#app` div exists in HTML (the ONLY structural div in body before inject)
- [ ] **ALL game content rendered inside `#gameContent`**
- [ ] Game HTML built via JS innerHTML after inject (no static HTML in body)
- [ ] `.mathai-layout-playarea` CSS overrides use `!important`
- [ ] Question text hidden during gameplay, shown on welcome/restart

## Source Code

Full ScreenLayoutComponent implementation: `warehouse/packages/components/screen-layout/index.js`
