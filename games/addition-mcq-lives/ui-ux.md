# addition-mcq-lives UI/UX Audit

**Build:** spec-only (no approved build exists)
**Date:** 2026-03-23
**Viewport:** 480x800px (mobile-first)
**Method:** Static spec analysis - no HTML to download; spec read against CDN compliance checklist and known visual issue pattern database

---

## Summary

Spec is structurally sound for a first build. Lives mechanic is correctly designed. TimerComponent usage follows the approved `timer-container` pattern. CSS is well-specified with explicit 44px-equivalent padding on option buttons (padding: 18px on 24px font produces ~60px total height). 6 actionable issues found: 4 gen prompt rules (class a), 2 spec additions (class b), 1 test gap (class d). F4 (initialization order) investigated and downgraded - order is correct.

No P0 flow blockers: no FeedbackManager.init(), no results-screen static position violation, no window.endGame unassigned, no timer.start() in setupGame().

---

## Findings

### F1: No data-phase state machine or syncDOMState() calls specified - P1

**Classification:** (a) gen prompt rule

The spec Game Flow section (Section 7) does not declare gameState.phase assignments or syncDOMState() calls at any transition. Phase states required: start_screen -> playing -> game_over / results. Without explicit phase assignments in the spec, the LLM frequently omits syncDOMState() calls - the confirmed root cause of 22% of game-flow iteration-1 failures.

**Instance count:** 2nd confirmed MCQ spec instance (addition-mcq-blitz was first, 2026-03-23).

Required additions to spec:
- showStartScreen(): gameState.phase = 'start_screen'; syncDOMState();
- startGame(): gameState.phase = 'playing'; syncDOMState();
- endGame() game-over path: gameState.phase = 'game_over'; syncDOMState(); BEFORE postMessage
- endGame() victory path: gameState.phase = 'results'; syncDOMState(); BEFORE postMessage

**Routes to:** Gen Quality - MCQ / timed game phase state machine rule already in ROADMAP (line 237), updated with 2nd instance confirmation.

---

### F2: ProgressBarComponent options object missing explicit slotId key - P1

**Classification:** (a) gen prompt rule

Section 7 initialization shows: progressBar = new ProgressBarComponent({ autoInject: true, totalRounds: 10, totalLives: 3 }). The slotId: 'mathai-progress-slot' key is absent. Across 4 prior audits (find-triangle-side, quadratic-formula, right-triangle-area, real-world-problem), the LLM passes either a positional string, a hash-prefixed ID, or omits the key - all cause the ProgressBar to render in the wrong slot or not at all.

**Instance count:** 5th confirmed instance (prior 4 in ROADMAP Known Visual Issue Patterns table).

Fix: spec must state: new ProgressBarComponent({ slotId: 'mathai-progress-slot', autoInject: true, totalRounds: 10, totalLives: 3 })

**Routes to:** Gen Quality - ProgressBar slot ID rule (ROADMAP pending, now 5 instances - escalate priority).

---

### F3: No ARIA live region on MCQ feedback - P1

**Classification:** (a) gen prompt rule

Section 5 HTML structure shows option buttons with .correct/.wrong CSS class changes for feedback, but no aria-live region is specified. Screen-reader users get no announcement on answer correctness. ARIA-001 was shipped 2026-03-23 after 8 confirmed instances. This is the 9th instance, confirming the rule applies to MCQ games.

Fix: spec must include an element with aria-live="polite" aria-atomic="true" that receives textContent updates on each answer outcome before CSS classes are applied.

**Routes to:** Test Engineering - verify ARIA-001 T1 check fires for MCQ feedback absence.

---

### F4: Initialization order - DOWNGRADED (not a finding)

ScreenLayout.inject() runs first (step 2), then ProgressBarComponent (step 3), then TimerComponent (step 6). timer-container is a static DOM element inside game-screen - it pre-exists in the HTML and is not a ScreenLayout slot. Initialization order is correct per CDN load order rules. No action required.

---

### F5: endGame() dual-path branching is implicit - P2

**Classification:** (b) spec addition

Section 7 End Game calculates stars then calls showResults(metrics) without specifying separate TransitionScreen calls for game-over (lives=0) vs victory (lives>0). Without explicit branching in the spec, the LLM may generate a unified path showing identical content for both outcomes.

Fix required in spec Section 7 End Game: explicit if (gameState.lives <= 0) branch showing game-over TransitionScreen (stars: 0, "Try again!" button) vs else branch showing victory TransitionScreen (stars: 1-3, "Play again!" button).

**Routes to:** Spec (Section 7 End Game - add before queuing first build). ROADMAP entry added.

---

### F6: restartGame() has no implementation detail - P2

**Classification:** (b) spec addition

Section 8 lists restartGame() in the Functions table with no implementation. For timer-based games, restart must destroy and recreate TimerComponent. Reusing the existing timer without destroying it risks stale onEnd callbacks firing on a fresh playthrough.

Fix required in spec: restartGame() must (1) call timer.destroy() then recreate new TimerComponent with same config, (2) reset gameState fields (lives=3, currentRound=0, score=0, attempts=[], isActive=false), (3) call progressBar.update(0, 3), (4) call showStartScreen().

**Routes to:** Spec (Section 8 - add restartGame() outline before first build). ROADMAP entry added.

---

### F7: data-lives attribute not on any DOM element - P2

**Classification:** (d) test gap

The spec specifies gameState.lives in the state object but no HTML element carries a data-lives attribute. The test harness getLives() helper reads data-lives from the DOM. If absent, all mechanics tests asserting lives decrements after wrong answers or timeouts return undefined and fail.

Fix: spec must require data-lives on app or body, kept in sync inside every syncDOMState() call: document.getElementById('app').setAttribute('data-lives', gameState.lives).

**Routes to:** Test Engineering - verify test-gen prompt requires data-lives for lives-based games; verify getLives() reads from correct element. ROADMAP entry added.

---

## Routing

| Finding | Severity | Classification | Routes to | Action |
|---------|----------|----------------|-----------|--------|
| F1: No data-phase / syncDOMState | P1 | (a) gen prompt rule | Gen Quality | In ROADMAP (line 237) - 2nd MCQ instance; update count |
| F2: ProgressBar missing slotId | P1 | (a) gen prompt rule | Gen Quality | In ROADMAP - 5th instance; escalate priority |
| F3: No ARIA live on MCQ feedback | P1 | (a) gen prompt rule | Test Engineering | ARIA-001 shipped; verify T1 fires for MCQ feedback |
| F4: Initialization order | - | Not a finding | - | No action |
| F5: endGame dual-path implicit | P2 | (b) spec addition | Spec Section 7 | Add game-over vs victory branching before first build |
| F6: restartGame() unspecified | P2 | (b) spec addition | Spec Section 8 | Add restartGame() timer destroy+recreate outline |
| F7: data-lives not on DOM | P2 | (d) test gap | Test Engineering | Require data-lives in syncDOMState(); ROADMAP entry added |

---

## Pre-Build Checklist

Before queuing first build for addition-mcq-lives:

- [ ] Add slotId: 'mathai-progress-slot' to ProgressBarComponent init in spec (F2)
- [ ] Add gameState.phase assignments + syncDOMState() at all 4 transition points (F1)
- [ ] Add data-lives sync inside syncDOMState() (F7)
- [ ] Add explicit game-over vs victory TransitionScreen branching to endGame() (F5)
- [ ] Add restartGame() implementation outline (F6)
- [ ] Add aria-live="polite" aria-atomic="true" feedback element to spec HTML (F3)
