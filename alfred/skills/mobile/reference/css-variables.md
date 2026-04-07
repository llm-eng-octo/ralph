# CSS Variables (`--mathai-*` System)

Complete reference for the `--mathai-*` design token system. Every visual value MUST come from these variables -- never hardcode colors, spacing, font sizes, or border radii.

---

## Usage Rule (STANDARD)

If a value exists as a `--mathai-*` variable, you MUST use the variable. Hardcoded equivalents (even if numerically identical) are banned because they break theming and create maintenance debt.

```css
/* WRONG — hardcoded, even though value matches */
.card { border-radius: 12px; background: #ffffff; color: #270f36; }

/* CORRECT — variable references */
.card {
  border-radius: var(--mathai-border-radius-card);
  background: var(--mathai-white);
  color: var(--mathai-primary);
}
```

When you need a value that has no variable (e.g., a specific margin for a custom layout), use a raw value but add a comment:

```css
.custom-diagram {
  margin-top: 16px; /* No --mathai-* variable for diagram spacing */
}
```

---

## Complete Variable Reference (from PART-020)

```css
:root {
  /* Layout */
  --mathai-game-max-width: 480px;
  --mathai-stack-gap: 10px;
  --mathai-game-padding-top: 54px;

  /* Brand colors */
  --mathai-primary: #270f36;
  --mathai-level-text: #270F63;
  --mathai-purple: #9B51E0;

  /* Action colors */
  --mathai-green: #219653;
  --mathai-blue: #667eea;
  --mathai-red: #E35757;
  --mathai-orange: #F2994A;
  --mathai-yellow: #FFDE49;

  /* Neutrals */
  --mathai-white: #ffffff;
  --mathai-gray: #666666;
  --mathai-light-gray: #f5f5f5;
  --mathai-disabled-gray: #E0E0E0;
  --mathai-text-primary: #4a4a4a;
  --mathai-border-gray: #e0e0e0;

  /* Gameplay feedback */
  --mathai-cell-bg-green: #D9F8D9;
  --mathai-cell-bg-yellow: #FCF6D7;
  --mathai-cell-bg-red: #FFD9D9;
  --mathai-cell-bg-grey: #E0E0E0;
  --mathai-cell-border-green: #27ae60;
  --mathai-cell-border-red: #e74c3c;

  /* Typography */
  --mathai-font-family: 'Epilogue', -apple-system, 'Segoe UI', Roboto, sans-serif;
  --mathai-font-size-title: 32px;
  --mathai-font-size-subtitle: 18px;
  --mathai-font-size-button: 16px;
  --mathai-font-size-body: 16px;
  --mathai-font-size-small: 14px;
  --mathai-font-size-large: 24px;

  /* Spacing */
  --mathai-padding-large: 56px 40px;
  --mathai-padding-medium: 16px 24px;
  --mathai-padding-small: 10px;
  --mathai-border-radius: 24px;
  --mathai-border-radius-small: 8px;
  --mathai-border-radius-button: 10px;
  --mathai-border-radius-card: 12px;
}
```

---

## Typography Rules (STANDARD)

**Font stack — MUST use the CSS variable:**

```css
body {
  font-family: var(--mathai-font-family);
  /* Resolves to: 'Epilogue', -apple-system, 'Segoe UI', Roboto, sans-serif */
  /* Why: fallback chain ensures readable text even if Epilogue CDN fails */
}
```

Never use a custom font without the variable. If Epilogue fails to load, the system font stack takes over.

**Minimum sizes — enforced by variable usage:**

| Context | Minimum | Variable | Example |
|---------|---------|----------|---------|
| Body text, labels | 14px | `--mathai-font-size-small` | Instructions, captions |
| Game text (questions, options) | 16px | `--mathai-font-size-body` | Question text, option labels |
| Buttons | 16px | `--mathai-font-size-button` | Submit, Next, option buttons |
| Subheadings | 18px | `--mathai-font-size-subtitle` | Stage titles, section headers |
| Headings | 20px+ | `--mathai-font-size-large` (24px) | Screen titles |
| Title screen | 32px | `--mathai-font-size-title` | Game name on start screen |

```css
/* WRONG */
.question-text { font-size: 12px; }

/* CORRECT */
.question-text { font-size: var(--mathai-font-size-body); }
```

**Line height — MUST be 1.4 or greater for readability:**

```css
body {
  line-height: 1.5;
  /* Why: text at 16px with line-height 1.0 is unreadable on small screens; 1.4 minimum, 1.5 preferred */
}

.question-text {
  line-height: 1.4;
}
```

---

## Color Contrast (STANDARD)

All `--mathai-*` color pairs already meet WCAG AA (4.5:1). Using hardcoded colors risks failing contrast.

| Text | Background | Pair | Ratio |
|------|-----------|------|-------|
| `--mathai-primary` (#270f36) | `--mathai-white` (#ffffff) | Dark on white | 15.8:1 |
| `--mathai-text-primary` (#4a4a4a) | `--mathai-white` (#ffffff) | Body text | 7.7:1 |
| `--mathai-white` (#ffffff) | `--mathai-green` (#219653) | Button text | 4.6:1 |
| `--mathai-gray` (#666666) | `--mathai-white` (#ffffff) | Secondary text | 5.7:1 |

```css
/* WRONG — unknown contrast ratio */
.label { color: #aaaaaa; }

/* CORRECT — verified 4.5:1+ */
.label { color: var(--mathai-gray); }
```
