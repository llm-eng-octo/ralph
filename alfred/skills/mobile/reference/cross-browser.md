# Cross-Browser Compatibility

Banned CSS/JS features, Safari-specific rules, and performance budget for target browsers (Chrome 80+, Safari 14+, Samsung Internet 14+, Android WebView 80+).

---

## 1. Banned CSS Features (CRITICAL)

| Feature | Problem | Alternative |
|---------|---------|-------------|
| `gap` in flexbox | Not supported in Android WebView < 84, Samsung Internet < 14 | Use `margin-bottom` on children |
| `aspect-ratio` | Not supported below Chrome 88 / Safari 15 | Use padding-bottom hack |
| `:has()` selector | Not supported below Chrome 105 / Safari 15.4 | Use JS class toggling |
| `container queries` | Not supported below Chrome 105 / Safari 16 | Use media queries |
| `color-mix()` | Not supported below Chrome 111 / Safari 16.2 | Use pre-computed colors |

```css
/* WRONG — gap in flexbox */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* CORRECT — margin instead of gap */
.options-list {
  display: flex;
  flex-direction: column;
}
.options-list > * + * {
  margin-top: 8px;
  /* Why: flexbox gap is unsupported on Android WebView <84, breaking option layout on older budget phones */
}
```

**Exception:** `gap` is safe in CSS Grid (supported since Chrome 66 / Safari 12). The ban applies only to flexbox `gap`.

---

## 2. Banned JS Features (CRITICAL)

| Feature | Problem | Alternative |
|---------|---------|-------------|
| Optional chaining (`?.`) | Not supported in Android WebView < 80 | Use explicit null checks |
| Nullish coalescing (`??`) | Not supported in Android WebView < 80 | Use logical OR with care |
| `Array.at()` | Not supported below Chrome 92 | Use bracket notation |
| `structuredClone()` | Not supported below Chrome 98 | Use `JSON.parse(JSON.stringify())` |
| Top-level `await` | Not supported in older WebViews | Wrap in async IIFE |

```javascript
// WRONG — optional chaining
var score = gameState?.score?.total;

// CORRECT — explicit checks
var score = gameState && gameState.score ? gameState.score.total : 0;
```

---

## 3. Safari-Specific Rules (STANDARD)

```css
/* WRONG — webkit prefix without standard */
-webkit-backdrop-filter: blur(10px);

/* CORRECT — standard property with webkit fallback */
-webkit-backdrop-filter: blur(10px);
backdrop-filter: blur(10px);
/* Why: prefixed-only properties will break when browsers drop prefix support */

/* WRONG — webkit-only */
-webkit-appearance: none;

/* CORRECT — both */
-webkit-appearance: none;
appearance: none;
```

Every `-webkit-` property MUST have the unprefixed standard property as well. The prefixed version goes first, standard version second (cascade ensures the standard wins when supported).

**Safari input styling — remove default iOS input styling:**

```css
input[type="text"],
input[type="number"] {
  -webkit-appearance: none;
  appearance: none;
  border-radius: var(--mathai-border-radius-small);
  font-size: 16px; /* Why: Safari auto-zooms inputs with font-size below 16px, disrupting game layout */
}
```

Safari auto-zooms inputs with font-size below 16px. MUST set `font-size: 16px` or larger on all inputs.

---

## 4. Performance Budget (ADVISORY)

**Maximum HTML file size: 500KB.** On a 4G connection (5 Mbps), 500KB loads in ~1 second. On 3G (1 Mbps), ~4 seconds.

**No heavy animations during active gameplay:**

```css
/* WRONG — continuous animation during gameplay */
.question-text {
  animation: pulse 2s infinite;
}

/* CORRECT — animation only on state change, short duration */
.option-btn.correct {
  animation: correctBounce 0.3s ease;
  /* Why: continuous CSS animations cause jank on low-end phones (Snapdragon 400-series, 2-3GB RAM) */
}

@keyframes correctBounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
```

**requestAnimationFrame for smooth JS animations:**

```javascript
// WRONG — setTimeout for visual updates
setTimeout(function() { element.style.opacity = 0.5; }, 16);

// CORRECT — requestAnimationFrame syncs with display refresh
requestAnimationFrame(function() {
  element.style.opacity = 0.5;
});
```

**Debounce scroll and resize handlers:**

```javascript
var resizeTimeout;
window.addEventListener('resize', function() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    // Handle resize
  }, 150);
});
// Why: undebounced resize fires 60+ times per second during keyboard open/close, causing layout thrashing
```

**DOM size: keep total element count under 500.** Budget phones slow down above this. A 9-round MCQ game with 4 options per round should render only the current round's DOM, not all 9 rounds at once.

**Image handling (STANDARD, when used):**

```html
<!-- WRONG -->
<img src="diagram.png">

<!-- CORRECT — constrained, lazy-loaded -->
<img src="diagram.png" loading="lazy" decoding="async"
     style="max-width: 100%; height: auto; display: block;">
<!-- Why: unconstrained images overflow the game-wrapper and cause horizontal scroll -->
```
