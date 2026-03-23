# UI/UX Audit — math-mcq-quiz

**Audited:** 2026-03-23
**Method:** Spec-only (no approved build exists — 0 builds in DB)
**Source:** `games/math-mcq-quiz/spec.md`
**Auditor:** UI/UX Slot (Rule 16)

---

## Summary

**9 findings: 6a (gen prompt rule), 2b (spec addition), 1d (test gap)**

No P0 flow bugs. Both end conditions (victory and game-over) are explicitly specified and call through to an endGame path. Timer behaviour on expiry is well-specified. FeedbackManager.init() is absent (PASS — this is a critical pre-build gate). No alert()/confirm()/prompt() in spec.

---

## Mandatory Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | CSS stylesheet intact (not stripped) | N/A | Spec-only — no HTML to check |
| 2 | FeedbackManager.init() absent | PASS | Not mentioned in spec |
| 3 | alert()/confirm()/prompt() absent | PASS | Not mentioned in spec |
| 4 | window.endGame assigned at DOMContentLoaded end | FAIL | Section 7 defines `endGame()` as local function; no `window.endGame = endGame` mentioned anywhere in spec |
| 5 | data-phase / syncDOMState at EVERY phase change | FAIL | Spec has phases (start, gameplay, round-transition, game-over, victory) — no data-phase attribute or syncDOMState() call specified anywhere |
| 6 | Enter key handler | N/A | Tap/click input only — no text input fields |
| 7 | ProgressBar: options object with slotId key | FAIL | Section 3 lists PART-023 (ProgressBar) but Section 6 layout diagram does not show a `new ProgressBarComponent({ slotId: 'mathai-progress-slot', ... })` call. No slotId specified. |
| 8 | aria-live="polite" role="status" on dynamic feedback | FAIL | Section 6 specifies green/red flash feedback and sticker output but no aria-live region is defined in spec for option feedback |
| 9 | SignalCollector constructor args: sessionId, studentId, templateId | FAIL | Not mentioned in spec Section 3 or any other section |
| 10 | gameState.gameId as FIRST field | FAIL | Section 5 gameState declaration has `isStarted` as first field — gameId is absent entirely |
| 11 | Results screen position:fixed | FAIL | PART-019 (Results Screen) listed in Section 3 but no CSS position:fixed constraint specified |
| 12 | All interactive buttons min-height:44px | PARTIAL | Section 6 says "large, rounded, colorful, tap-friendly" for option buttons; no explicit 44px minimum specified. Choice buttons are the primary interactive elements. |
| 13 | Sentry SDK v10.23.0 three-script pattern | FAIL | PART-030 (Sentry) listed but spec does not mandate v10.23.0 or three-script pattern |
| 14 | game_complete postMessage on BOTH victory AND game-over | PARTIAL | Section 2 specifies both end paths; PART-008 (PostMessage) listed; but spec does not explicitly state both paths fire game_complete — game-over path says "GAME OVER screen" only |
| 15 | restartGame() resets ALL gameState fields | FAIL | Section 7 lists `restartGame() → reload page / reset state` but does not specify which fields are reset. Timer destroy+recreate not mentioned. |
| 16 | waitForPackages() only awaits packages actually used | PARTIAL | Game uses TimerComponent (PART-006 listed) — timer IS used, so TimerComponent wait is valid. VisibilityTracker listed and also used. OK. |

---

## Findings

### F1 — window.endGame not assigned to window (a) gen prompt rule — Medium

**Spec evidence:** Section 7 defines `endGame()` as a local function with no `window.endGame = endGame` assignment.

**Pattern:** 5th confirmed instance (also in: adjustment-strategy, addition-mcq spec, associations #513, math-cross-grid spec). Already in Known Patterns table.

**Action:** Gen prompt rule already tracked (CDN window exposure T1 check deployed — `lib/validate-static.js`). Confirm T1 W3 will catch this at first build. No new ROADMAP entry needed — rule is shipped.

---

### F2 — No data-phase / syncDOMState at any phase transition (a) gen prompt rule — Medium

**Spec evidence:** Spec Section 2 defines five distinct states: start screen, gameplay (per round), round-transition, game-over, victory. None of these are accompanied by a `gameState.phase = '...'` assignment or `syncDOMState()` call in any section.

**Pattern:** 4th confirmed MCQ spec instance (also in: addition-mcq spec, addition-mcq-lives spec, addition-mcq-blitz spec). ROADMAP line 237 tracks this pattern.

**Action:** Already in ROADMAP. Confirm gen prompt rule for MCQ games covers syncDOMState at: start screen load, each `loadRound()` call, round-transition display, game-over, victory. No new entry needed.

---

### F3 — No ARIA live region specified for option feedback (a) gen prompt rule — Medium

**Spec evidence:** Section 8 specifies correct/wrong feedback via green/red flash and sticker, but no `aria-live="polite" role="status"` element is defined anywhere in the spec for announcing feedback to screen readers.

**Pattern:** 14th confirmed instance (ARIA-001). Rule shipped (c826ec1 2026-03-23). T1 will catch at first build.

**Action:** No new ROADMAP entry needed — ARIA-001 is shipped. Note instance count: 14.

---

### F4 — gameState.gameId absent from initial declaration (a) gen prompt rule — High

**Spec evidence:** Section 5 gameState declaration lists `isStarted`, `isEnded`, `startTime`, `content`, `currentRound`, `totalRounds`, `lives`, `totalLives`, `score`, `questions`, `selectedOption`, `isAnswering` — no `gameId` field.

**Pattern:** 5th confirmed instance (also in: adjustment-strategy, addition-mcq spec, associations #513, math-cross-grid spec). GEN-GAMEID shipped (as noted in ROADMAP `Status` line under Gen Quality slot: `GEN-GAMEID SHIPPED — gameState.gameId mandatory first field`).

**Action:** Rule is shipped. T1 or gen prompt should enforce. Confirm T1 catches missing gameId. No new ROADMAP entry needed. Instance count: 5.

---

### F5 — Results screen position:fixed not specified (a) gen prompt rule — High

**Spec evidence:** PART-019 (Results Screen) is listed in Section 3 but spec provides no CSS position:fixed constraint. Section 6 layout diagram shows results as part of the play area rather than a full-screen overlay.

**Pattern:** 10th confirmed instance. GEN-UX-001 / GEN-MOBILE-RESULTS shipped (2026-03-23). T1 or gen rule should enforce.

**Action:** Rule is shipped. No new ROADMAP entry needed. Instance count: 10.

---

### F6 — ProgressBar slot ID not specified (a) gen prompt rule — Medium

**Spec evidence:** Section 3 lists PART-023 (ProgressBar) and Section 6 shows the progress bar slot, but no `new ProgressBarComponent({ slotId: 'mathai-progress-slot', ... })` call with the slotId key is specified anywhere.

**Pattern:** 8th confirmed instance. GEN-UX-003 shipped (25bdad0 2026-03-23).

**Action:** Rule is shipped. No new entry needed. Instance count: 8.

---

### F7 — SignalCollector constructor args absent from spec (a) gen prompt rule — Medium

**Spec evidence:** SignalCollector is implied via PART-009 (Attempt Tracking) and PART-010 (Event Tracking) but spec gives no SignalCollector instantiation example with `(sessionId, studentId, templateId)` args.

**Pattern:** 4th confirmed instance. GEN-UX-005 shipped (25bdad0 2026-03-23).

**Action:** Rule is shipped. No new entry needed. Instance count: 4.

---

### F8 — game_complete postMessage on game-over path not explicit in spec (b) spec addition — Medium

**Spec evidence:** Section 2 flow says game-over leads to "GAME OVER screen" — no explicit mention that `game_complete` postMessage fires on this path. Victory path similarly implicit. PART-008 (PostMessage) is listed but spec does not show dual-path confirmation.

**Pattern:** Similar to addition-mcq-lives F4 — endGame dual-path not explicit. Spec needs to explicitly state: both the victory path AND the game-over path must call `endGame()` which fires `game_complete` postMessage with the correct type.

**Action:** Add to spec before first build. New ROADMAP entry needed — see routing table.

---

### F9 — restartGame() timer destroy+recreate not specified (b) spec addition — Medium

**Spec evidence:** Section 7 defines `restartGame() → reload page / reset state`. Section 11 specifies timer is started per question and destroyed in `endGame()` via `timer.destroy()`. If restartGame() reloads the page, timer cleanup is handled by page unload. However if it resets state in-place (the common generated pattern), the spec does not mandate `timer.destroy()` before re-init, nor does it list which gameState fields are reset to initial values.

**Pattern:** Same pattern as addition-mcq-lives F6 — restartGame() unspecified for timer games. 2nd confirmed timer game instance.

**Action:** Spec should either (a) mandate page reload in restartGame() or (b) explicitly list fields to reset AND mandate timer.destroy() + timer = new TimerComponent() in restartGame(). Add to ROADMAP — see routing table.

---

### F10 (Low) — Sentry SDK version not pinned to v10.23.0 in spec (a) gen prompt rule — Low

**Spec evidence:** PART-030 (Sentry Error Tracking) is listed but no specific version or three-script pattern is mandated in the spec.

**Pattern:** Same as word-pairs #529 Sentry v7 vs v10 pattern. Gen prompt standardisation rule is pending in ROADMAP.

**Action:** No new entry needed — already tracked. Confirm rule ships with pending Sentry standardisation ROADMAP item.

---

## Routing Table

| Finding | Classification | Route | Target |
|---------|---------------|-------|--------|
| F1 — window.endGame | (a) gen prompt | Already shipped (T1 W3) | — |
| F2 — data-phase/syncDOMState | (a) gen prompt | Already in ROADMAP (line 237) | — |
| F3 — ARIA live region | (a) gen prompt | Already shipped (ARIA-001 c826ec1) | — |
| F4 — gameState.gameId | (a) gen prompt | Already shipped (GEN-GAMEID) | — |
| F5 — results screen fixed | (a) gen prompt | Already shipped (GEN-UX-001) | — |
| F6 — ProgressBar slotId | (a) gen prompt | Already shipped (GEN-UX-003) | — |
| F7 — SignalCollector args | (a) gen prompt | Already shipped (GEN-UX-005) | — |
| F8 — game_complete dual path | (b) spec addition | ROADMAP — new entry | Education/spec |
| F9 — restartGame() timer | (b) spec addition | ROADMAP — new entry | Education/spec |
| F10 — Sentry v10 | (a) gen prompt | Already in ROADMAP (pending) | — |

---

## Positive Observations

- FeedbackManager.init() is NOT in spec — this is the correct pattern (pre-build gate PASS).
- No alert()/confirm()/prompt() anywhere in spec.
- Timer behaviour is precisely specified: `timerType: 'decrease'`, `startTime: 30`, `autoStart: false`, `timer.destroy()` in endGame. Section 11 is a model for timer games.
- `timer.pause({ fromAudio: true })` / `timer.resume({ fromAudio: true })` pattern is correctly specified in Section 8 — prevents timer double-running during audio feedback.
- VisibilityTracker integration (Section 13) is fully specified with pause/resume on both sound and stream — correct pattern.
- Fallback content is correctly defined and appropriate for kids 5–10.
- validateAnswer() uses string normalization (trim + toLowerCase) — correct for MCQ string comparison.
- waitForPackages() correctly includes TimerComponent since the game uses it (unlike math-cross-grid).
- Star logic (Section 2) is clearly tied to `livesRemaining`, not `score` — correct pedagogical metric.
- 15 test scenarios in Section 14 are well-specified and cover timer expiry, game-over mid-round, and visibility change.
