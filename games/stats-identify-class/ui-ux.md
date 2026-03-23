# UI/UX Audit — stats-identify-class

**Audit date:** 2026-03-23
**Auditor:** UI/UX Slot (mandatory active slot — CLAUDE.md Rule 16)
**Audit type:** Spec-only — no builds in DB (0 builds for this game)
**Spec:** games/stats-identify-class/spec.md (1113 lines, v1)

---

## Summary

Spec-only audit. No HTML available for browser playthrough — static spec analysis only.

Game profile: MCQ measure-of-central-tendency classifier, 10 rounds, 3 lives, no timer. Three-button MCQ (Mean / Median / Mode). Worked-example panel on first wrong attempt; skip (life deducted) on second wrong attempt. Victory via TransitionScreen CDN overlay; game-over via TransitionScreen CDN overlay. Uses ProgressBarComponent (PART-023), TransitionScreenComponent (PART-024), VisibilityTracker (PART-005), FeedbackManager sound-only (PART-017 NO), Sentry (PART-030), no TimerComponent. Custom fields: attemptsThisRound, wrongFirstAttempt, totalFirstAttemptCorrect, isProcessing, gameEnded.

**No P0 blockers.** FeedbackManager.init() absent (PASS). No alert()/confirm()/prompt() (PASS). window.endGame explicitly assigned (PASS). data-phase/syncDOMState fully specified (PASS). gameState.gameId FIRST field (PASS). ProgressBar slotId correct (PASS). ARIA live region present (PASS).

**4 actionable findings (0a, 1b-HIGH, 1b-LOW, 1a-LOW, 1d-MEDIUM).** Key gaps: postMessage type casing conflict between Section 6.8 and Section 13 (spec inconsistency — pre-build fix needed); Sentry v10 three-script pattern not shown; SignalCollector not instantiated anywhere in spec; waitForPackages awaits ScreenLayout but instantiation not shown. restartGame() body not defined in spec.

This spec is the most complete and self-consistent MCQ spec audited to date — most recurrent gen-rule failures are explicitly prevented by detailed function pseudocode and Anti-Patterns list.

---

## Mandatory Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | CSS stylesheet intact | N/A | Spec-only — no HTML build |
| 2 | FeedbackManager.init() ABSENT | PASS | Explicitly banned in CRITICAL header, Section 7.4, Anti-Pattern #1. Only `.sound()` and `.playDynamicFeedback()` used. |
| 3 | alert()/confirm()/prompt() absent | PASS | Not present anywhere in spec |
| 4 | window.endGame assigned at DOMContentLoaded end | PASS | Section 7.3 explicitly assigns: `window.endGame = endGame; window.restartGame = restartGame; window.nextRound = nextRound;` plus `window.loadRound` helper. |
| 5 | data-phase transitions + syncDOMState() at EVERY phase change | PASS | Section 7.0 defines syncDOMState() with all four data- attributes. Phase transitions at: page load (start_screen), startGame() (playing), endGame(true) (results), endGame(false) (game_over), life-lost (lives update). All explicitly shown. |
| 6 | Enter key handler (text input games only) | N/A | MCQ tap game — no text input |
| 7 | ProgressBar: options object with slotId: 'mathai-progress-slot' | PASS | Section 7.3 shows `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 10, totalLives: 3 })` — correct. |
| 8 | aria-live="polite" role="status" on ALL dynamic feedback elements | PASS | Section 5 layout shows `#feedback-text` with `aria-live="polite" role="status" data-testid="feedback-text"` explicitly. |
| 9 | SignalCollector constructor args: sessionId, studentId, templateId | FAIL | PART-009 (Attempt Tracking) listed as YES. Section 7.3 init block does NOT show SignalCollector instantiation. No `new SignalCollector(...)` anywhere in spec. Events are tracked via `gameState.events[]` — but no SignalCollector wiring shown. |
| 10 | gameState.gameId field as FIRST field | PASS | Section 3 line 1: `gameId: 'stats-identify-class',` with comment `// MANDATORY FIRST FIELD`. |
| 11 | Results screen position:fixed with z-index≥100 | PASS | Both victory and game-over use `transitionScreen.show('victory')` / `transitionScreen.show('game_over')` — TransitionScreenComponent is a CDN overlay that handles position:fixed internally. No custom results div used. |
| 12 | ALL interactive buttons min-height:44px | PASS (partial) | Option buttons: Section 5 and Section 6.2 both specify `min-height: 44px; min-width: 44px`. However, `got-it-btn` and `skip-round-btn` inside the worked-example panel have no explicit min-height specified — these are interactive buttons. Low-severity gap. |
| 13 | Sentry SDK v10.23.0 three-script pattern | FAIL (low) | PART-030 listed as YES with no config notes. No Sentry section in spec, no version pinning, no `initSentry()` call, no three-script CDN pattern shown anywhere in spec. Same low-severity pattern seen in 7+ prior audits. |
| 14 | game_complete postMessage on BOTH victory AND game-over paths | FAIL (spec conflict) | Section 6.8 (endGame function) correctly shows `type: 'game_complete'` (lowercase) on both paths. BUT Section 13 (PostMessage Protocol) shows `type: 'GAME_COMPLETE'` (ALL CAPS). The CDN contract requires lowercase `game_complete`. If LLM follows Section 13 template, tests will fail on the postMessage assertion. |
| 15 | restartGame() resets ALL gameState fields; timer games destroy+recreate | PARTIAL | No timer (PART-006 excluded) — timer destroy/recreate N/A. However, restartGame() function body is never defined anywhere in spec — only referenced as `onRestart: restartGame` in Section 7.3 TransitionScreen config. No explicit field-reset list or body pseudocode provided. |
| 16 | waitForPackages() only awaits packages the game actually instantiates | FAIL (low) | Section 7.2 waitForPackages awaits: `['ScreenLayout', 'TransitionScreenComponent', 'ProgressBarComponent', 'FeedbackManager']`. Section 7.3 init block does NOT show explicit `ScreenLayout` instantiation — only VisibilityTracker, ProgressBarComponent, and TransitionScreenComponent are instantiated. PART-025 (ScreenLayout) is YES but the init block relies on the CDN auto-mounting pattern rather than explicit `new ScreenLayout(...)`. If ScreenLayout is not actually used, waiting for it is a potential failure point. |

---

## Findings

### F1 — postMessage type casing conflict: game_complete vs GAME_COMPLETE [type-b] [HIGH]

**Pattern:** Spec-internal postMessage type inconsistency
**Instance count:** New finding — first all-caps vs lowercase conflict
**Description:** Section 6.8 (endGame function pseudocode) correctly specifies `type: 'game_complete'` (lowercase, matching CDN contract) on both victory and game-over paths. Section 13 (PostMessage Protocol reference block) specifies `type: 'GAME_COMPLETE'` (ALL CAPS). The LLM generating the HTML will see both sections and may follow Section 13's template (as it appears later and looks authoritative). CDN contract test asserts `type === 'game_complete'` — uppercase will cause contract test failure.
**Action (type-b):** Fix Section 13 before first build. Change `type: 'GAME_COMPLETE'` to `type: 'game_complete'`. Align with Section 6.8. Also note: Section 13 uses a different payload structure (`payload:` wrapper) vs Section 6.8 (flat structure). The CDN contract requires flat structure — Section 6.8 is correct; Section 13 template should be removed or marked as deprecated.

---

### F2 — restartGame() function body never defined [type-b] [LOW]

**Pattern:** Critical game function not specified in spec
**Instance count:** 2nd instance of missing restartGame() body (seen in mcq-addition-blitz)
**Description:** restartGame() is referenced in Section 7.3 as `onRestart: restartGame` in the TransitionScreen config. The game-over screen shows a restart button. When clicked, `restartGame()` is called. No function body or pseudocode is given anywhere in spec. The LLM must infer what restartGame() should do. Risk: LLM may omit resetting `gameState.lives`, `gameState.currentRound`, `gameState.totalFirstAttemptCorrect`, `gameState.attemptsThisRound`, `gameState.wrongFirstAttempt`, `gameState.gameEnded`, and `gameState.content`. A partial reset causes stats to carry over from the previous game, breaking the star calculation.
**Action (type-b):** Add restartGame() pseudocode to spec (new subsection in Section 6) before first build:
```
function restartGame() {
  gameState.lives = 3;
  gameState.currentRound = 0;
  gameState.score = 0;
  gameState.attemptsThisRound = 0;
  gameState.wrongFirstAttempt = 0;
  gameState.totalFirstAttemptCorrect = 0;
  gameState.isProcessing = false;
  gameState.gameEnded = false;
  gameState.isActive = false;
  gameState.events = [];
  gameState.attempts = [];
  progressBar.reset();
  startGame();
}
```

---

### F3 — SignalCollector not instantiated in spec [type-a] [MEDIUM]

**Pattern:** PART-009 listed YES but no SignalCollector constructor shown
**Instance count:** 7th confirmed (addition-mcq, mcq-addition-blitz, math-mcq-quiz, math-cross-grid, find-triangle-side, addition-mcq-lives)
**Description:** PART-009 (Attempt Tracking) is listed as YES. Events are tracked via `gameState.events[]` push operations in handleOptionClick. However, there is no `new SignalCollector({ sessionId, studentId, templateId })` instantiation shown anywhere in spec — not in Section 7.3 (DOMContentLoaded init block) and no dedicated section. GEN-UX-005 rule (shipped) requires correct instantiation args. Without the spec showing the constructor pattern, the LLM may emit bare `new SignalCollector()` or omit it entirely.
**Action (type-a):** GEN-UX-005 already shipped. Add SignalCollector instantiation to Section 7.3 init block before first build: `const signalCollector = new SignalCollector({ sessionId: window.__sessionId || 'dev', studentId: window.__studentId || 'dev', templateId: 'stats-identify-class' });`

---

### F4 — waitForPackages awaits ScreenLayout but init block uses CDN auto-mount [type-d] [LOW]

**Pattern:** waitForPackages awaits a package not explicitly instantiated in the init block
**Instance count:** New finding — ScreenLayout/auto-mount ambiguity
**Description:** Section 7.2 waitForPackages checks for `'ScreenLayout'` in the required packages array. Section 7.3 shows VisibilityTracker, ProgressBarComponent, and TransitionScreenComponent being explicitly instantiated — but no `new ScreenLayout(...)` call. PART-025 (ScreenLayout) is YES, which implies the CDN ScreenLayout is used for the container layout. If ScreenLayout fails to load, the game errors before init. However, the more specific risk is: if ScreenLayout is not actually called anywhere in the JS (auto-mounted via the CDN bundle's global init), the wait is correct but tests may be confused about why this package is awaited.
**Action (type-d):** Test Engineering: add a contract test that verifies `typeof window.ScreenLayout !== 'undefined'` after packages load, to catch CDN bundle regressions where ScreenLayout fails to export. No spec change needed — the wait is conservative and correct.

---

### F5 — got-it-btn and skip-round-btn missing explicit min-height:44px [type-a] [LOW]

**Pattern:** Interactive panel buttons missing touch-target size specification
**Instance count:** 12th confirmed instance of min-height gap (GEN-UX-002)
**Description:** The worked-example panel contains two interactive buttons: `[data-testid="got-it-btn"]` ("Got it — try again") and `[data-testid="skip-round-btn"]` ("Skip this round"). Section 5 layout mentions these buttons but provides no CSS specification for them. The `min-height: 44px` requirement in Section 5 and 6.2 explicitly covers `.option-btn` only. On mobile (480×800), undersized secondary buttons cause mis-taps and accessibility failures.
**Action (type-a):** GEN-UX-002 already shipped for `.option-btn` / `.game-btn`. Verify the gen rule selector also covers `.got-it-btn`, `.skip-btn`, or `[data-testid="got-it-btn"]` / `[data-testid="skip-round-btn"]`. Add to spec Section 12 (Worked-Example Panel CSS): `.we-actions button { min-height: 44px; min-width: 44px; }` before first build.

---

### F6 — Sentry SDK v10.23.0 three-script pattern not shown in spec [type-a] [LOW]

**Pattern:** PART-030 YES with no Sentry section or version pin
**Instance count:** 8th confirmed (all prior specs with PART-030 YES show same gap)
**Description:** PART-030 (Sentry Error Tracking) is listed as YES. No Sentry section exists in spec — no three-script CDN pattern, no version pinning to v10.23.0, no `initSentry()` call, no DSN configuration. Without explicit spec guidance, the LLM may generate Sentry v7 (incompatible API), omit init entirely, or use a single-script pattern instead of the required three-script async pattern.
**Action (type-a):** Same pattern as 7 prior audits. A standardised Sentry snippet section should be added to the warehouse template defaults and injected into all new specs. No individual spec fix needed — this is a gen rule / warehouse template gap. Track in ROADMAP.

---

## Routing Table

| Finding | Classification | Destination | Action |
|---------|---------------|-------------|--------|
| F1 — postMessage type casing conflict (GAME_COMPLETE vs game_complete) | (b) spec bug | Pre-build fix | Fix Section 13: lowercase `game_complete`; remove payload-wrapper pattern — HIGH priority before first build |
| F2 — restartGame() body not defined | (b) spec addition | Pre-build fix | Add restartGame() pseudocode to spec Section 6 before first build |
| F3 — SignalCollector not instantiated | (a) gen prompt rule | Gen Quality | GEN-UX-005 shipped; add instantiation to spec Section 7.3 before build |
| F4 — ScreenLayout wait vs auto-mount ambiguity | (d) test gap | Test Engineering | Add contract test: `typeof window.ScreenLayout !== 'undefined'` |
| F5 — got-it-btn / skip-round-btn min-height absent | (a) gen prompt rule | Gen Quality | GEN-UX-002 shipped; verify selector covers panel buttons; add CSS to spec Section 12 |
| F6 — Sentry v10 three-script pattern not shown | (a) gen prompt rule | Gen Quality | Warehouse template gap — track in ROADMAP; not individual spec fix |

---

## Positive Observations

- **FeedbackManager.init() correctly absent** — no audio popup risk. Explicitly banned in header, Section 7.4, and Anti-Pattern #1 (three layers of protection).
- **No alert()/confirm()/prompt()** anywhere in spec.
- **window.endGame, window.restartGame, window.nextRound, window.loadRound** all explicitly assigned in Section 7.3 — including the `loadRound` harness helper needed by jump-to-round mechanics tests.
- **gameState.gameId as FIRST field** — correctly placed with mandatory comment. Best-in-class compliance.
- **syncDOMState() fully specified** — Section 7.0 shows the exact function body AND enumerates all five phase transition call sites with precise timing (before vs after).
- **ARIA live region fully specified** — `#feedback-text` has `aria-live="polite" role="status" data-testid="feedback-text"` in Section 5 layout.
- **ProgressBar slotId correct** — `slotId: 'mathai-progress-slot'` present in Section 7.3 init block.
- **Anti-Patterns list (Section 8)** — 15-item list covers all known LLM failure modes for this game type. Best-in-class anti-pattern coverage.
- **Worked-example panel behaviour fully specified** — two-attempt logic (first wrong → explanation, second wrong → skip), button disable/re-enable, isProcessing guard, animation class toggle — all pseudocode present.
- **data-testid on all interactive elements** — Section 5 and Section 8 (Anti-Pattern #12) specify testids for every selectable element.
- **No timer** — PART-006 correctly excluded; no timer destroy/recreate ambiguity.
- **Both end paths use TransitionScreen CDN overlay** — no custom results div; no position:fixed gap.
- **inputSchema correct** — minItems/maxItems validated, misconceptionTag enum validated, all 10 fallback rounds present with pedagogically correct labels.

---

## Pre-Build Checklist (before queuing first build)

- [ ] **Section 13:** Change `type: 'GAME_COMPLETE'` → `type: 'game_complete'` (F1 — HIGH) and remove or mark the `payload:` wrapper pattern as deprecated (use flat structure from Section 6.8)
- [ ] **Section 6 (new subsection):** Add restartGame() pseudocode with full gameState field reset and `progressBar.reset()` call (F2)
- [ ] **Section 7.3:** Add SignalCollector instantiation with `{ sessionId, studentId, templateId: 'stats-identify-class' }` to DOMContentLoaded init block (F3)
- [ ] **Section 12 (Worked-Example Panel CSS):** Add `.we-actions button { min-height: 44px; min-width: 44px; }` or equivalent for got-it-btn and skip-round-btn (F5)
