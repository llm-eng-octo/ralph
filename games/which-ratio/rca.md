# which-ratio — Spec RCA

**Game:** which-ratio
**Session position:** Trig session Game 2 (Bloom L2) — ratio selection mechanic
**Spec:** MCQ + worked example panel on first wrong attempt. Given a triangle with two sides labeled and an angle marked, identify which ratio (sin/cos/tan) relates those two sides to that angle. No lives — learning mode. Stars by accuracy.
**Standards:** NCERT Ch 8 §8.3 / CC HSG-SRT.C.7

---

## 1. Root Cause

**Build #558:** `gemini-2.5-pro` generated `fallbackContent` with the object's closing `}` squashed inline at the end of the `rounds` array line (no newline separator). This produced `SyntaxError: Unexpected token '}'` in the inline `<script>` block. The error prevented `DOMContentLoaded` from firing, so `waitForPackages()` never ran, `ScreenLayout.inject()` never ran, and `#gameContent` was never created in the DOM. Smoke check reported "Blank page: missing #gameContent element". Smoke-regen also failed because the CDN smoke-regen prompt checks CDN URL bugs, `slots:` wrapper bugs, and Sentry order bugs — it does not scan for JS syntax errors.

## 2. Evidence of Root Cause

- Smoke check error message: `"Blank page: missing #gameContent element"` (Step 1d)
- Browser console: `SyntaxError: Unexpected token '}'` on inline script line (diagnostic agent confirmed)
- `DOMContentLoaded` never fired — no `waitForPackages()` call observed in page lifecycle
- `ScreenLayout.inject()` never reached — `#gameContent` absent from DOM throughout
- Smoke-regen attempt also failed with same symptom — LLM re-examined CDN init (which was structurally correct) and did not identify the syntax error in `fallbackContent`

## 3. POC Fix Verification (REQUIRED before E2E)

- GEN-119 rule added to `CDN_CONSTRAINTS_BLOCK` in `lib/prompts.js`: the `fallbackContent` closing `}` MUST be on its own line. The WRONG/CORRECT pattern example shows the inline-squash variant explicitly.
- T1 check `PART-027-JS-SYNTAX` added to `lib/validate-static.js`: runs `new vm.Script()` on each inline `<script>` block; any `SyntaxError` → `ERROR` level, blocking smoke step.
- With PART-027-JS-SYNTAX active, the malformed HTML from build #558 would have been caught at T1 before smoke check — no smoke-regen wasted.

## 4. Reliability Reasoning

- T1 `PART-027-JS-SYNTAX` is deterministic: Node.js `vm.Script` parse catches any JS syntax error regardless of which LLM generated the HTML.
- GEN-119 gen prompt rule reduces the probability that the model produces the squashed `}` pattern in the first place.
- Defense in depth: even if the gen prompt rule is not followed, T1 catches the error before smoke; smoke-regen is not invoked for syntax errors — pipeline fails fast and re-queues cleanly.
- Remaining risk: `vm.Script` only validates syntax, not runtime errors. Logical bugs in `fallbackContent` (wrong data shape, missing fields) are not caught by this check.

## 5. Go/No-Go for E2E

**READY FOR E2E** — build #559 queued.

- §2 evidence: confirmed via diagnostic (SyntaxError in console, #gameContent absent, DOMContentLoaded never fired)
- §3 POC: T1 PART-027-JS-SYNTAX deterministically catches the malformed HTML; GEN-119 prompt rule prevents recurrence
- No other known failure modes for which-ratio at this time

---

## Browser Audit Findings — Build #561 (APPROVED)

Three P0 patterns found in browser playthrough of which-ratio #561. Gen rules shipped commit c0d5391 (2026-03-23).

### BROWSER-P0-001: transitionScreen.show() string-mode API (GEN-TRANSITION-API, rule 45)
- **Symptom:** Victory screen rendered completely blank — no title, no subtitle, no Play Again button. User stranded.
- **Root cause:** Generated code called `transitionScreen.show('victory', { score, stars, onRestart })`. The CDN TransitionScreenComponent has no string-mode API. Passing a string as the first argument causes all fields (title, buttons, icons) to resolve to `undefined`.
- **Console evidence:** `{title: undefined, stars: undefined, buttons: undefined}`
- **Fix:** GEN-TRANSITION-API rule 45 added — MUST always use object API. NEVER pass string as first arg.

### BROWSER-P0-002: SVG markup in icons array (GEN-TRANSITION-ICONS, rule 46)
- **Symptom:** The transition screen was filled with raw SVG source code text — `<svg xmlns="http://www.w3.org/2000/svg"...>` visible as literal characters across the entire screen.
- **Root cause:** Generated code used `icons: ['<svg xmlns="http://www.w3.org/2000/svg"><path d="..."/></svg>']`. The CDN inserts icon values via `textContent` (not `innerHTML`), which HTML-escapes all markup.
- **Fix:** GEN-TRANSITION-ICONS rule 46 added — icons MUST be plain emoji strings only. NEVER SVG/HTML.

### BROWSER-NEW-001: totalLives=0 in ProgressBarComponent (GEN-PROGRESSBAR-LIVES, rule 47)
- **Symptom:** `RangeError: Invalid count value: -5` thrown on every round during `progressBar.update()`.
- **Root cause:** Generated code used `new ProgressBarComponent({ totalLives: 0, totalRounds: 5, ... })`. The CDN computes a lives repeat count as `(totalLives - currentLives)`. With `totalLives=0` and `currentLives=5`, result is `-5` — a negative repeat count throws RangeError.
- **Fix:** GEN-PROGRESSBAR-LIVES rule 47 added — totalLives MUST be ≥1. For no-lives games, pass `totalLives=totalRounds` and call `progressBar.update(currentRound, 0)`.

## Failure History

| Build | Symptom | Root Cause | Status |
|-------|---------|------------|--------|
| #558 | Step 1d smoke — "Blank page: missing #gameContent element" | JS SyntaxError in fallbackContent: closing `}` squashed inline at end of rounds array | FAILED — GEN-119 fix shipped, #559 queued |
| #559 | APPROVED by reviewer (8/10 tests), FAILED post-approval — EACCES: permission denied on warehouse/templates/which-ratio/game/ (root-owned) | Same infra bug as name-the-sides #555: warehouse template dir root-owned, post-approval copy failed. Fix: sudo chown -R the-hw-app:the-hw-app + chmod 775 | FAILED (infra) — permissions fixed, #560 re-queued |
| #561 | APPROVED — browser audit found 3 P0 patterns post-approval: blank victory screen (string-mode API), SVG icons as raw text, RangeError on every round (totalLives=0) | See BROWSER-P0-001, BROWSER-P0-002, BROWSER-NEW-001 above | GEN rules 45/46/47 shipped commit c0d5391; re-queue to verify |

## Manual Run Findings

- Build #558 HTML: `fallbackContent` object closing `}` appeared inline at end of last rounds array entry, e.g. `{ ... }];}`
- Browser console (diagnostic agent): `SyntaxError: Unexpected token '}'` immediately on script parse — no further execution
- `window.gameState` undefined; `#gameContent` absent; `data-phase` never set
- Smoke-regen LLM recheck: examined `ScreenLayout.inject()` call, `waitForPackages()` structure, Sentry order — all correct. Did not identify syntax error. Smoke-regen produced a second smoke failure with identical symptom.

## Targeted Fix Summary

- No targeted fix attempted — failure classified as a gen-level prompt + T1 validation gap
- GEN-119 rule shipped to `lib/prompts.js` CDN_CONSTRAINTS_BLOCK
- PART-027-JS-SYNTAX T1 check shipped to `lib/validate-static.js`
- Build #559 queued to verify
