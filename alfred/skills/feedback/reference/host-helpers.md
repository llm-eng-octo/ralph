# Host helpers — symbols referenced but not part of FeedbackManager

The skill's examples reference identifiers that are NOT part of the FeedbackManager CDN API. Each one lives elsewhere in the game scaffolding or in another PART. When a sub-agent encounters one of these symbols, it must use the canonical implementation from the owning PART / skill — never invent a replacement.

This file is the authoritative pointer table.

## Helpers owned by game scaffolding (per-game template)

| Symbol | Purpose | Definition lives in |
|---|---|---|
| `renderRound()` / `loadRound()` | Paints the next round's DOM and re-enables inputs (clears `isProcessing`, calls `voiceInput.enable()`, resets button states). Single source of truth for re-enabling inputs. | Game scaffolding — per-game implementation. Submit handlers MUST NOT clear `isProcessing` themselves. |
| `nextRound()` / `scheduleNextRound()` | Round-advance dispatchers. MUST call the cleanup stop pair as the FIRST line (validator `GEN-ROUND-BOUNDARY-STOP`). | Game scaffolding. |
| `endGame(reason)` / `restartGame()` | Terminal lifecycle handlers. Same FIRST-line cleanup rule. Standalone `endGame` is a single 5-step orchestrator (see PART-050 and feedback `SKILL.md` § Default Feedback / End-of-game). | Game scaffolding. |
| `syncDOMState()` | Paints `data-phase` on `#gameContent` after a phase mutation. Required by the 500ms test-harness poll. | Game scaffolding per PART-008 / `GEN-PHASE-SEQUENCE`. |
| `gameState.isProcessing` | In-flight gatekeeper for input. Set to `true` BEFORE any await in a submit handler; cleared by `renderRound`. Every interaction handler's first guard. | Game-local convention; PART-010 / interaction skill. |
| `waitForPackages()` | Polls until all required CDN packages (FeedbackManager, TimerComponent, ProgressBar, etc.) are loaded before `init`. | Game scaffolding. |
| `postGameComplete()` | Fires `window.parent.postMessage({ type: 'game_complete', ... }, '*')` with the canonical payload (stars, rounds, accuracy, etc.). | Data-contract skill / PART-008. |

## Helpers owned by CDN packages

| Symbol | What it is | Owning PART |
|---|---|---|
| `FeedbackManager.*` | Audio (static + dynamic TTS), subtitle, sticker, `runSequence`, pause/resume, stop methods | PART-017 |
| `TimerComponent` | Round/level timing, pause/resume, visibility tracking | PART-022 |
| `progressBar` (ProgressBarComponent instance) | Lives + round dots | PART-023 |
| `transitionScreen` (TransitionScreenComponent instance) | Level / round / end screens; CTA button slot | PART-024 |
| `floatingBtn` (FloatingButtonComponent instance) | Advance CTA (`'next'` / `'retry'` / `'submit'` modes) | PART-050 |
| `previewScreen` (PreviewScreenComponent instance) | Welcome / instructions surface | PART-025 |
| `voiceInput` (VoiceInput instance) | P17 voice answer input; `.enable()` / `.disable()` / `.show()` / `.hide()` | PART-016 |
| `answerComponent` (AnswerComponent instance) | Answer-review carousel rendered over still-mounted Stars Collected | PART-051 |
| `VisibilityTracker` | Tab-hide / tab-return events; owns the pause `PopupComponent` (`autoShowPopup: true`) | PART-027 / pause-tracker PART |

## Helpers owned by other skills

| Symbol | Purpose | Owning skill |
|---|---|---|
| `signalCollector` | Telemetry collector — `recordViewEvent(...)`, `seal()` at end-game | `data-contract` |
| `recordAttempt({ round, correct, answer, ... })` | Per-attempt telemetry. MUST fire BEFORE any audio in the submit handler. | `data-contract` |

## Rules

- **Sub-agents:** When generating code that uses any of these symbols, use the canonical implementation from the owning PART / skill. If the symbol is owned by game scaffolding (`renderRound`, `endGame`, etc.), copy the canonical implementation as-is from this skill or the per-game template.
- **Don't reinvent.** Helpers above already exist in the canonical scaffolding. Inventing a parallel implementation (`playFeedback`, `audioRace`, `awaitedPlay`, custom subtitle DOM, etc.) is what triggers the validator rules listed in `SKILL.md` § Validators referenced by this skill.
- **Don't reach into CDN-package internals.** Use the documented API surface only; never access private fields (e.g. `FeedbackManager._stopCurrentDynamic` for new code — it's legacy belt-and-suspenders only).
