# PART-021: Screen Layout

**Category:** MANDATORY | **Condition:** Every game | **Dependencies:** PART-002

---

> ⛔ **DEPRECATED (v1):** The manual HTML layout (`.page-center > .game-wrapper > .game-stack`) described below is **deprecated**. All new games MUST use **PART-025 ScreenLayout Component v2** with the `sections` API. The v2 component auto-generates the layout with header, questionText, progressBar, playArea, and transitionScreen sections.
>
> This file is retained only for reference when maintaining legacy games. **Do NOT use this layout for new games.**

## Migrate to v2

Replace the manual HTML + CSS from this part with:

```javascript
ScreenLayout.inject('app', {
  sections: {
    header: true,            // only if timer/HUD
    questionText: true,      // ALWAYS
    progressBar: true,       // ALWAYS
    playArea: true,          // ALWAYS
    transitionScreen: true   // ALWAYS
  }
});
```

See **PART-025** for full v2 documentation.

---

## Legacy Design Principles (v1 — deprecated)

- **Mobile-first:** max-width 480px, width 100vw
- **Centered horizontally** with white space on sides
- **Vertical stacking** with 10px gaps between blocks
- **Vertical scrolling** allowed if content overflows
- **100dvh** preferred over 100vh (mobile safe-areas)

## Legacy HTML Structure (v1 — deprecated)

```html
<!-- ⛔ DEPRECATED: Use ScreenLayout.inject() with sections API instead -->
<div class="page-center">
  <section class="game-wrapper">
    <div class="content-fill">
      <div class="game-stack">
        <div class="game-block" id="{{block-id}}">
          <!-- content -->
        </div>
      </div>
    </div>
  </section>
</div>
```

## Legacy CSS (v1 — deprecated)

```css
/* ⛔ DEPRECATED: ScreenLayout v2 injects its own CSS automatically.
   Only keep these if maintaining a v1 game. */

:root {
  --mathai-game-max-width: 480px;
  --mathai-stack-gap: 10px;
}

html, body {
  height: 100%;
  margin: 0;
  background: #f6f6f6;
  font-family: var(--mathai-font-family, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif);
}

.page-center {
  display: flex;
  justify-content: center;
  width: 100%;
  min-height: 100dvh;
  box-sizing: border-box;
}

.game-wrapper {
  width: 100vw;
  max-width: var(--mathai-game-max-width);
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100dvh;
  padding-top: 54px;
  position: relative;
}

.game-stack {
  display: flex;
  flex-direction: column;
  gap: var(--mathai-stack-gap);
  padding: 0 10px 20px 10px;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
}

.game-block {
  padding: var(--mathai-stack-gap);
  margin-bottom: var(--mathai-stack-gap);
  background: transparent;
  border-radius: 8px;
  box-sizing: border-box;
}

.content-fill {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100dvh - 54px);
  box-sizing: border-box;
}

#mathai-progress-slot,
.mathai-progress-slot {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

@media (min-width: 520px) {
  .game-wrapper { width: 100%; }
}
```

## v2 Equivalent CSS

For games using ScreenLayout v2, use this CSS instead:

```css
/* Reset */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100dvh; overflow: hidden; }
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-white);
  color: var(--mathai-black);
}

/* Play area centering (use !important — ScreenLayout CSS loads dynamically) */
.mathai-layout-playarea {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  padding: 0 20px 32px !important;
}

/* Transition screen fills remaining space */
.mathai-ts-screen.active {
  flex: 1;
  justify-content: center;
}
```

## Accessibility (applies to both v1 and v2)

- Prefer `100dvh` over `100vh` for mobile safe-areas
- Use semantic elements where appropriate
- Ensure interactive elements are keyboard accessible

## Verification

- [ ] ⛔ NOT using manual `.page-center > .game-wrapper > .game-stack` HTML (deprecated)
- [ ] Using `ScreenLayout.inject()` with `config.sections` (PART-025 v2)
- [ ] CSS reset applied with `100dvh`
- [ ] Play area CSS overrides use `!important`
- [ ] Uses semantic HTML where appropriate
