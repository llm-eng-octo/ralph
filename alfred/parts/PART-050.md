### PART-050: FloatingButton Component (Submit / Retry / Next)

**Category:** CONDITIONAL | **Condition:** Every game whose flow has a Submit / Check / Done / Commit CTA UNLESS the spec sets `floatingButton: false` | **Dependencies:** [PART-002](PART-002.md), [PART-006](PART-006.md), [PART-017](PART-017.md), [PART-022](PART-022.md) (superseded for the floating variant)

> **If you change this PART, also re-read [`game-planning/SKILL.md`](../skills/game-planning/SKILL.md) and [`game-building/SKILL.md`](../skills/game-building/SKILL.md) for any prose that restates a rule below — paraphrased rules can drift from this canonical source.** Update [`alfred/parts/README.md`](README.md) too if the component's mandatory/conditional status changes; run `node alfred/scripts/validate-parts-catalog.js` to confirm catalog ↔ disk match.

## Index — the story this doc tells

The doc walks through five questions, in the order a reader actually asks them. Each question's answer leads to the next. Jump in via the links if you only need one section — but the connections are linked, so you may need to back up.

> **1. Why am I reading this file?** — Every game needs a Submit / Retry / Next CTA, and the iframe host needs exactly one `next_ended` message at the right moment. Hand-rolled buttons drift across games and break that contract. This component owns the entire CTA state machine for the session.
>
> Open with the [§ 1 Problem](#problem) — what need this exists to fill. Then [§ 2 Canonical names](#canonical-names) — vocabulary the rest of the doc uses (Submittable predicate, Win Confirmation screen, Victory Celebration screen, etc.) so prose doesn't drift.
>
> **2. What *is* this thing — what does it look like from outside?** — A state machine with four observable modes. The mode tells you *what's on screen*; cases tell you *when each mode applies* and *what tapping it does*.
>
> [§ 3 States](#states) names the four modes (`null` / `submit` / `retry` / `next`) and their entry/exit triggers. The state machine alone is incomplete — it doesn't say WHEN to be in each state. Three case tables answer that:
> - [§ 4 Submit visibility cases](#submit-visibility-cases) — when the `submit` mode appears (predicate-driven; covers timeout, empty input, pre-filled input, partial input).
> - [§ 5 Retry and Next visibility cases](#retry-and-next-visibility-cases) — when the mode switches to `retry` or `next` after the player taps Submit, by game shape and outcome.
> - [§ 6 Click action cases](#click-action-cases) — what tapping the visible mode actually does (one ordered action sequence per mode × shape/phase).
>
> Together: § 3 says what states exist · § 4–5 say when each state is allowed · § 6 says what happens on tap.
>
> **3. How does it solve the problem — what must always be true while it runs?** — The case tables say what *should* happen; the rules section says what MUST be true to keep the case tables from being subverted.
>
> [§ 7 Mandatory rules](#mandatory-rules) — six MECE buckets covering the six dimensions on which the component can go wrong: state integrity, predicate correctness, end-game side-effect ordering, component boundary, teardown contract, readiness. If every rule holds, no case-table row produces a wrong outcome.
>
> The rules above reference two spec inputs and one bypass, in increasing order of how much they switch off:
> - [§ 8 `partialSubmitAllowed` spec flag](#partialsubmitallowed-spec-flag) — the single spec key two Submit-visibility rows depend on. Tunes when Submit appears; the button still ships.
> - [§ 8a `autoSubmit` spec flag](#top-level-spec-flag--autosubmit) — creator-only opt-in to auto-evaluation. Hides Submit AND Retry wholesale; Next still ships so `next_ended` posts.
> - [§ 9 Opt-out (`floatingButton: false`)](#opt-out-floatingbutton-false) — when the whole component is absent and none of the above applies (game hand-rolls `next_ended` via PART-022).
>
> **4. How do I actually wire it up — and which variant matches my game?** — Two parts: the boilerplate every game shares, then the variant for the specific game shape.
>
> Boilerplate (in the order you write it):
> - [§ 10 ScreenLayout configuration](#screenlayout-configuration) — reserve the slot.
> - [§ 11 Instantiation](#instantiation) — construct the instance.
> - [§ 12 Public API](#public-api) — methods you call on the instance.
> - [§ 13 Visual design](#visual-design) — colors, sizes, label conventions.
>
> Variants — pick by game shape, every variant is a concrete walk-through of § 6 click-action rows:
> - [§ 14 Standalone lifecycle](#standalone-lifecycle) — `totalRounds: 1`. End-game runs as a single 5-beat orchestrator inside `endGame(correct)`.
> - [§ 15 Multi-round lifecycle](#multi-round-lifecycle) — `totalRounds > 1`. End-game routes Win Confirmation (optional) → Victory Celebration → AnswerComponent reveal → Next.
> - [§ 16 Try Again lifecycle](#try-again-lifecycle) — Standalone with `totalLives > 1`. The third visible mode (`retry`) the standard lifecycles don't cover.
> - [§ 17 Dual-button variant](#dual-button-variant) — replaces the single Submit with two parallel CTAs (Yes/No, True/False).
>
> **5. How do I know I got it right — and what should I never do?** — Two enforcement layers (static and human) plus the negative space.
>
> [§ 18 Banned patterns](#banned-patterns) — patterns previous LLM runs produced and we rejected, each linked to its enforcing rule. Read this once before writing code; the names are the regression vocabulary.
>
> [§ 19 Integration](#integration) — the exact contract surface (postMessage type / awaited promise / slot) this component shares with each neighbor PART. [§ 20 CDN](#cdn) — script tags. [§ 21 Validator rules enforced](#validator-rules-enforced) — static enforcement of § 7. [§ 22 Verification checklist](#verification-checklist) — the human's pre-ship pass for things validators can't see (real browser behavior, real audio).

## Problem

Every game needs a single, predictable CTA the player taps to submit, retry, or finish. Hand-rolled Submit / Retry / Next buttons drift across games (different positions, different timing rules, different audio interactions). Inconsistency confuses players AND breaks the host iframe's teardown contract — the harness needs exactly one `next_ended` postMessage per session, and it must fire at the right moment. **`FloatingButtonComponent`** owns the entire CTA state machine for the session: visibility, mode (submit / retry / next / hidden), styling, and tap routing.

## Canonical names

Defined once; the rest of the doc uses these terms exactly. Drop-in replacements for previously vague references ("the celebration" / "the carousel" / "the header").

- **FloatingButton** — the `FloatingButtonComponent` instance. Lives in `#mathai-floating-button-slot` (a body-level sibling of `.page-center`, not inside scrolling content).
- **Submittable predicate** — a game-defined function `isSubmittable()` that returns `true` only when current `gameState` is valid to evaluate.
- **Interaction signal** — a boolean on `gameState` (e.g. `hasInteracted`, `userInteracted`, `touched`, `dirty`) that flips `false → true` on the player's first input. The Submittable predicate ANDs this with the value-valid check so pre-filled inputs do not show Submit on first paint.
- **Win Confirmation screen** / `showWinConfirmation()` — optional button-gated transition with a "Claim Stars" CTA. No sound, no animation, no `show_star`. Player taps Claim Stars to advance.
- **Victory Celebration screen** / `showVictoryCelebration()` — celebration TransitionScreen. Plays `victory_sound_effect`, posts `show_star`, stays mounted as backdrop while AnswerComponent appears below it via the `onMounted` `setTimeout` hand-off.
- **Standalone shape** — `totalRounds: 1`. No TransitionScreen at all. End-of-game UI is FloatingButton + [AnswerComponent](PART-051.md) + the persistent preview header. See [shapes.md § Standalone](../skills/game-planning/reference/shapes.md#definitions) and [standalone-flow.md](../skills/game-planning/reference/standalone-flow.md) for the canonical definition and flow diagram.
- **Multi-round shape** — `totalRounds > 1`. Round-end uses a TransitionScreen with `buttons: []` (tap-dismissible). See [shapes.md § Multi-round](../skills/game-planning/reference/shapes.md#definitions) and [multi-round-flow.md](../skills/game-planning/reference/multi-round-flow.md).
- **Single-stage Next handler** — the `floatingBtn.on('next', ...)` handler that tears down everything (AnswerComponent, Win/Victory Celebration TS, preview, FloatingButton) and posts `next_ended` in one tap.

## States

FloatingButton has exactly four externally observable states. `setMode(...)` is the only transition driver.

| State | Visible? | Trigger to enter | Trigger to exit |
|---|---|---|---|
| `null` (hidden) | No | `setMode(null)` / `hide()` / page load / new round | `setSubmittable(true)` (predicate true) → `submit` |
| `submit` | Yes | `setSubmittable(true)` / `setMode('submit')` / `show()` | Submit tap (auto-hide before handler) → `null`; `setMode(null)` → `null` |
| `retry` | Yes | `setMode('retry')` (wrong + lives>0, whenever the chosen UX shows an explicit retry button: Standalone (validator-enforced) OR Multi-round with `spec.roundRetryButton: true`) | Retry tap → `null` |
| `next` | Yes | `setMode('next')` (end-of-game CTA reveal) | Next tap → component destroyed |

`disabled` is NOT a separate state — it is a flag (`setDisabled(bool)`) that visually greys the current state without changing it. Use only for transient lockouts.

```
  page load / new round
          │
          ▼
       null ◀──────── retry / next click ◀────┐
          │                                    │
  player edits → predicate true                │
          │                                    │
          ▼                                    │
       submit ──── submit click ──────────────▶│
                   (auto-hide first)           │
                                          wrong: retry
                                          right: next
```

## Submit visibility cases

MECE. Every leaf has a verdict (`show` / `hide` / `auto-hide`). The Submittable predicate is the single mechanism that produces these verdicts; if your predicate is correct, the table is satisfied for free.

| Shape | Phase | Component visibility | Interaction state | Verdict |
|---|---|---|---|---|
| Standalone | Gameplay | (any) | Timeout fired (PART-006 timer expired) | **auto-hide** |
| Standalone | Gameplay | Hidden | n/a | (Submit not gated on hidden components) |
| Standalone | Gameplay | Visible | Empty (no interaction) | **hide** |
| Standalone | Gameplay | Visible | Pre-filled, no interaction | **hide** |
| Standalone | Gameplay | Visible | Fully attempted | **show** |
| Standalone | Gameplay | Visible | Partial, [`partialSubmitAllowed: true`](#partialsubmitallowed-spec-flag) (default) | **show** |
| Standalone | Gameplay | Visible | Partial, `partialSubmitAllowed: false` | **hide** |
| Standalone | Gameplay | Visible | Started but not attempted | **hide** |
| Multi-round | Transition screen (Welcome / Round-intro / Win Confirmation / Victory Celebration / Game Over) | n/a | n/a | **hide** |
| Multi-round | Gameplay (any round, including last) | (same as Standalone Gameplay rows) | (same as Standalone) | (same as Standalone) |

## Retry and Next visibility cases

Decision table for post-evaluation and transition-screen contexts. The AnswerComponent column names whether [PART-051](PART-051.md) is also visible at that moment.

| Shape | Phase | Outcome | Lives remaining | FloatingButton | AnswerComponent |
|---|---|---|---|---|---|
| Standalone | Post-eval | Correct | (n/a) | **next** | **hidden** |
| Standalone | Post-eval | Wrong | > 0 | **retry** | hidden |
| Standalone | Post-eval | Wrong | 0 | **next** | **shown** |
| Multi-round | Gameplay post-eval | Correct | (n/a) | hidden (auto-advance) | hidden |
| Multi-round | Gameplay post-eval | Wrong | > 0 | hidden (auto-advance) | hidden |
| Multi-round | Gameplay post-eval | Wrong | 0 | hidden (auto-advance to Game Over) | hidden |
| Multi-round | Victory Celebration screen | (n/a) | (n/a) | **next** | **shown** |
| Multi-round | Win Confirmation screen | (n/a) | (n/a) | hidden (Claim Stars button is on the TS, not on FloatingButton) | hidden |
| Multi-round | Welcome / Round-intro / Game Over screens | (n/a) | (n/a) | hidden | hidden |

## Click action cases

Each row is one mode × shape/phase → one ordered action sequence. The [lifecycle sections](#standalone-lifecycle) are concrete walk-throughs of these rows.

| Mode tapped | Shape | Phase / context | Action sequence |
|---|---|---|---|
| Submit | Standalone | Gameplay | (1) auto-hide button before handler runs (component-internal) · (2) evaluate `gameState.userInput` · (3) `recordAttempt({correct, ...})` · (4) `endGame(correct)` — runs the [Standalone end-game beats](#standalone-lifecycle) |
| Submit | Multi-round | Non-last round | (1) auto-hide · (2) evaluate · (3) `recordAttempt` · (4) `await FeedbackManager.play(...)` · (5) advance to next round (auto-advance applies on both correct and wrong; wrong+lives=0 routes to Game Over) |
| Submit | Multi-round | Last round | Same as non-last, except (5) routes to Win Confirmation (if used) → Victory Celebration on win, or Game Over on lives=0 |
| Retry | Standalone | Post-eval, wrong, lives > 0 | (1) clear input value UNLESS `spec.retryPreservesInput: true` · (2) clear inline feedback DOM · (3) `gameState.isProcessing = false` · (4) `boardEl.classList.remove('dnd-disabled')` (P6 — load-bearing on @dnd-kit/dom) · (5) `voiceInput.enable()` (P17) · (6) `timer.resume()` (PART-006, when timer was paused at submit) · (7) `floatingBtn.setMode(null)` — predicate-driven re-show owned by the next interaction handler · (8) **(mandatory)** MUST NOT call `setSubmittable(...)` ([GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE](../skills/game-building/reference/static-validation-rules.md)) · (9) **(mandatory)** MUST NOT reset `gameState.lives` / `gameState.attempts` / `gameState.score` ([GEN-FLOATING-BUTTON-RETRY-LIVES-RESET](../skills/game-building/reference/static-validation-rules.md)). Full timing per [state-and-guards.md § Lifecycle matrix](../skills/interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix). |
| Retry | Multi-round (default, `roundRetryButton: false`) | n/a | Not wired. Wrong-with-lives auto-advances (or predicate re-shows Submit on the next interaction). The mode is never set in this variant. |
| Retry | Multi-round (`spec.roundRetryButton: true`, opt-in) | Post-eval, wrong, lives > 0 | (1) clear inline feedback DOM · (2) `floatingBtn.setMode(null)` · (3) call `renderRound(currentRound)` for same-round re-render — `renderRound`'s first 3 lines flip `isProcessing = false` and remove `.dnd-disabled`. In-handler variant (when same-round re-render is too heavy): mirror the standalone retry handler body. Pick one per game. Validator rules `RETRY-NO-SUBMITTABLE` / `RETRY-LIVES-RESET` apply identically. |
| Next | Standalone | Post-eval, correct OR (wrong + lives = 0) | (1) `window.parent.postMessage({type:'next_ended'}, '*')` · (2) `answerComponent.destroy()` if visible · (3) `previewScreen.destroy()` · (4) `floatingBtn.destroy()` — single-stage exit, no branching, no flag-checks ([GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE](../skills/game-building/reference/static-validation-rules.md)) |
| Next | Multi-round | Victory Celebration screen | Same single-stage exit. The Victory Celebration TS is destroyed alongside (it stayed mounted as backdrop). |

If a row's first effect (auto-hide for Submit, post-message for Next) is not the literal first line of the registered handler body, that's a regression.

## Mandatory rules

Every line is `(mandatory)`. The enforcement tag in parentheses names the mechanism that catches violations. Rules are grouped into six MECE buckets — each bucket constrains one dimension of the component's behavior. **Completeness check:** if every rule in every bucket holds, no row of any case table can produce a wrong outcome. If you find a regression that isn't catchable by some rule below, a bucket is missing a rule.

#### A. State integrity — the state machine in [§ States](#states) cannot be subverted

Constrains: which mode is visible at any moment, and how transitions fire. Backstops every row of [Submit visibility cases](#submit-visibility-cases).

1. **(mandatory)** FloatingButton starts hidden on page load AND at the start of every new round. (static: [GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md))
2. **(mandatory)** Submit click auto-hides the button BEFORE the registered `on('submit', ...)` handler runs. The handler's first observable side-effect must not be re-showing the button. (static: component-internal contract)
3. **(mandatory)** Multi-round Victory Celebration / Game Over TransitionScreens use `buttons: []` and rely on tap-to-dismiss. Any `text: 'Next' / 'Continue' / 'Done' / 'Finish' / 'Play Again'` inside a `buttons:` array is forbidden — Next is owned by FloatingButton, not by a button on the TS. (static: [GEN-FLOATING-BUTTON-TS-CTA-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))

#### B. Predicate correctness — the Submittable predicate is the single mechanism that drives [Submit visibility cases](#submit-visibility-cases)

Constrains: what `isSubmittable()` may and may not gate on. If the predicate is correct, every row of the Submit visibility table is satisfied automatically.

4. **(mandatory)** Submittable predicate must AND a value-valid check with an Interaction signal — the value-valid check alone is forbidden because it lets pre-filled inputs show Submit on first paint. (static: [GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md))
5. **(mandatory)** Empty / no-input submit semantics is "Submit hidden", never "wrong attempt + life lost". (static: [GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md), spec-side: [spec-review Z10](../skills/spec-review/SKILL.md))
6. **(mandatory)** When [PART-006 § TimerComponent](PART-006.md) is in scope, the `onEnd` callback must hide FloatingButton — either by calling `setMode(null)` / `setSubmittable(false)` directly OR by flipping a state flag matching `/timeExpired|timerEnded|timeUp|timeIsUp/i` that the Submittable predicate consumes. (static: [GEN-FLOATING-BUTTON-TIMEOUT-HIDE](../skills/game-building/reference/static-validation-rules.md), test: Step 6 Playwright trigger expiry → assert hidden)
7. **(mandatory)** Retry handler MUST NOT call `setSubmittable(...)` — predicate-driven re-show is owned by the next interaction handler. (static: [GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE](../skills/game-building/reference/static-validation-rules.md))

#### C. End-game side-effect ordering — the [Click action cases](#click-action-cases) for Submit must run their beats in source order

Constrains: when each side-effect (game_complete, show_star, AnswerComponent reveal, setMode('next')) may fire relative to awaited audio. Backstops every Submit-click row that ends in `endGame(...)`.

8. **(mandatory)** Standalone `endGame()` is a SINGLE 5-step orchestrator (SFX-await → game_complete SYNC → TTS-await → show_star + AnswerComponent reveal → setTimeout setMode). No split chain (`runFeedbackSequence` + `finalizeAfterDwell` + inner `endGame`). Each beat corresponds to one row of [Click actions § Submit / Standalone](#click-action-cases). (static: [GEN-FEEDBACK-ORDER](../skills/game-building/reference/static-validation-rules.md))
9. **(mandatory)** `setMode('next')` must not sit next to `game_complete` without an `await` / `transitionScreen.onDismiss(` / `transitionScreen.hide()` / `setTimeout(` separator. Next appears AFTER feedback + celebration, never alongside `game_complete`. (static: [GEN-FLOATING-BUTTON-NEXT-TIMING](../skills/game-building/reference/static-validation-rules.md))

#### D. Component boundary — only one Submit/Retry/Next CTA exists per session, and it lives in the FloatingButton slot

Constrains: where the component's DOM lives and what other DOM may compete with it. Backstops the [Standalone shape](#canonical-names) invariant that there is no TransitionScreen and no inline body-card.

10. **(mandatory)** Standalone games (`totalRounds: 1`) MUST NOT use TransitionScreen. End-of-game UI is FloatingButton + AnswerComponent + the persistent preview header. (static: [GEN-FLOATING-BUTTON-STANDALONE-TS-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))
11. **(mandatory)** Standalone games MUST NOT render an inline body-card ("Puzzle solved!" / "Try again!" / "Game over!") into `#gameContent` inside `endGame` / `endStandaloneGame` / `onCorrect` / `onWrong`. Body-cards duplicate AnswerComponent and visually mimic a forbidden Victory TransitionScreen. (static: [GEN-STANDALONE-END-PANEL-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))
12. **(mandatory)** No custom `<button>` with id / class / data-testid / aria-label / inner text matching `/submit|retry|next|check|done|commit|cta/i` inside `#gameContent` when FloatingButton is used. (static: [5e0-FLOATING-BUTTON-DUP](../skills/game-building/reference/static-validation-rules.md))

#### E. Teardown contract — the host iframe receives exactly one `next_ended` per session, on Next-tap, after `game_complete`

Constrains: how the session ends. Backstops the [Click action § Next](#click-action-cases) rows.

13. **(mandatory)** Every game that reaches an end state must reveal Next AND register `on('next', ...)`. (static: [GEN-FLOATING-BUTTON-NEXT-MISSING](../skills/game-building/reference/static-validation-rules.md))
14. **(mandatory)** The `on('next', ...)` handler must post `{ type: 'next_ended' }` to `window.parent`. (static: [GEN-FLOATING-BUTTON-NEXT-POSTMESSAGE](../skills/game-building/reference/static-validation-rules.md))
15. **(mandatory)** The Next handler is single-stage — destroy AnswerComponent + post `next_ended` + destroy preview + destroy FloatingButton in one tap. No two-stage `if (firstClick) { ... } else { ... }` branching. (static: [GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE](../skills/game-building/reference/static-validation-rules.md))
16. **(mandatory)** Destroys (`previewScreen.destroy()`, `floatingBtn.destroy()`, `answerComponent.destroy()`) live in the Next handler, AFTER `next_ended` is posted. They MUST NOT live in `endGame()` — the preview header owns the `show_star` animation target and must stay mounted through the entire end-screen view. (review + static: [GEN-FLOATING-BUTTON-NEXT-TIMING](../skills/game-building/reference/static-validation-rules.md))

#### F. Readiness — the component is loaded and constructed before any handler can run

Constrains: how the component enters scope. Backstops the assumption every other rule makes that `floatingBtn` exists.

17. **(mandatory)** Standalone games with `totalLives > 1` must register an `on('retry', ...)` handler. Multi-round games with `spec.roundRetryButton: true` must also register `on('retry', ...)`. (static: [GEN-FLOATING-BUTTON-RETRY-STANDALONE](../skills/game-building/reference/static-validation-rules.md) — currently validates standalone only; if multi-round explicit-retry ships at scale the validator scope needs widening. TODO.)
17a. **(mandatory)** Retry handler MUST remove the board-level interaction lock — `boardEl.classList.remove('dnd-disabled')` (P6 / `@dnd-kit/dom`), `voiceInput.enable()` (P17), `timer.resume()` (PART-006) — in source order, in the handler body. There is no `renderRound()` between submit and retry in standalone; the handler is the source of truth. Multi-round variants that delegate to `renderRound(currentRound)` inherit re-enable from the re-render. See [state-and-guards.md § Exception patterns](../skills/interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix). (review-side rule; no validator yet — TODO: a `GEN-RETRY-DND-UNLOCK` rule would catch the standalone-with-P6 failure mode where `.dnd-disabled` is added but never removed.)
18. **(mandatory)** `waitForPackages` must include `typeof FloatingButtonComponent !== 'undefined'` as a hard `&&` term. (static: [GEN-WAITFORPACKAGES-NO-OR](../skills/game-building/reference/static-validation-rules.md), [GEN-WAITFORPACKAGES-MISSING](../skills/game-building/reference/static-validation-rules.md))
19. **(mandatory)** The `new FloatingButtonComponent(...)` call uses an attributable catch (`console.error` + `Sentry.captureException`), never a silent `try { ... } catch (e) {}`. (review + static: [GEN-SLOT-INSTANTIATION-MATCH](../skills/game-building/reference/static-validation-rules.md))

## `partialSubmitAllowed` spec flag

Top-level spec key controlling whether Submit is shown for partial input. Two rows of [Submit visibility cases](#submit-visibility-cases) reference it.

- **Default:** `true` (preserves prior behavior; partial input shows Submit and the game evaluates whatever the player typed).
- **`false`:** the Submittable predicate must require *fully attempted* state (every required field filled / every required cell occupied). Partial input keeps Submit hidden.

Authoring lives in [spec-creation § Game Parameters](../skills/spec-creation/SKILL.md). Review check lives in [spec-review § H6](../skills/spec-review/SKILL.md). Build consumes the flag when emitting `isSubmittable()` — see [game-building § Predicate emission](../skills/game-building/SKILL.md).

## Top-level spec flag — `autoSubmit`

Where § 8's `partialSubmitAllowed` tunes WHEN Submit appears, `autoSubmit` decides WHETHER the Submit and Retry buttons appear at all. It is the lighter half of § 9's `floatingButton: false`: it hides the same two CTAs but leaves the component instantiated so Next can still fire `next_ended`. Use it for games whose evaluation fires WITHOUT a Submit tap (timer expiry, drag-drop commit handler, canvas commit, etc.).

- **Default:** `false` — manual Submit + Retry/Try-Again buttons per [§ 4](#submit-visibility-cases) and [§ 5](#retry-and-next-visibility-cases). Today's behavior; spec authors emit nothing.
- **`true`:** No Submit button, no Retry button. The game's internal commit handler (timer `onEnd`, drag-drop drop handler, canvas commit) calls `endGame(correct)` directly. **`FloatingButtonComponent` stays instantiated** so it can reveal Next at end-of-game (rule 13 — every game that reaches an end state MUST reveal Next).

**Case-table flips when `autoSubmit: true`:**

- [§ 4 Submit visibility cases](#submit-visibility-cases) — every Gameplay row's verdict becomes **hide** (Submit is never shown). The Submittable predicate is not emitted.
- [§ 5 Retry/Next visibility cases](#retry-and-next-visibility-cases) — every Post-eval Retry row becomes **hidden**. There is no `on('retry', ...)` handler. The wrong-with-lives branch either advances the round directly (multi-round) or routes to AnswerComponent + Next (standalone, lives=0) via `endGame(false)`. Standalone lives>0 with `autoSubmit: true` is an unusual combination — the spec must describe how the game re-arms after a wrong commit (typically: clear inputs in the commit handler and let the player commit again, with no explicit Retry tap).
- [§ 6 Click action cases](#click-action-cases) — the Submit and Retry rows are unreachable. The Next rows are unchanged.

**`autoSubmit: true` is a CREATOR-ONLY decision** (mirrors `answerComponent: false`). The spec author MUST NOT auto-fill it. Valid only when the creator's prompt EXPLICITLY says: "no submit button", "no buttons", "auto-submit", "auto-advance on timer", "drag-to-commit / drop-to-commit", "canvas commits the answer", or equivalent. Silence means default (`false`).

Authoring lives in [spec-creation § Top-level spec field — `autoSubmit`](../skills/spec-creation/SKILL.md). Review check lives in [spec-review § H7](../skills/spec-review/SKILL.md). Build consumes the flag — see [game-building § Predicate emission](../skills/game-building/SKILL.md): when `true`, skip the `setSubmittable(...)` emission and the `on('retry', ...)` handler; keep the slot, the `on('next', ...)` handler, and the end-game routing.

**Validator skip behavior.** When `autoSubmit: true`, the three Submit/Retry static rules — `GEN-FLOATING-BUTTON-PREDICATE`, `GEN-FLOATING-BUTTON-SUBMIT-DEFAULT`, `GEN-FLOATING-BUTTON-RETRY-STANDALONE` — auto-skip (mirroring how they auto-skip on `floatingButton: false`). Next-related rules (`GEN-FLOATING-BUTTON-NEXT-MISSING`, `-NEXT-POSTMESSAGE`, `-NEXT-TIMING`, `-CDN`, `-SLOT`) stay active because Next is still mandatory. For the deeper bypass that strips Next as well, see § 9 below.

**Forbidden code patterns when `autoSubmit: true`.** Skip ≠ forbid. The skipped rules above no longer require Submit-predicate wiring, but `GEN-AUTOSUBMIT-NO-SUBMITTABLE` actively forbids the *inverse* — any call site that would re-show the Submit button. The following MUST NOT appear anywhere in the generated HTML:

| Forbidden call | Why | Caught by |
|---|---|---|
| `floatingBtn.setSubmittable(true)` (literal or any non-`false` predicate) | Re-shows Submit on every input event | `GEN-AUTOSUBMIT-NO-SUBMITTABLE` |
| `floatingBtn.setMode('submit')` | Force-shows Submit, bypassing the predicate | `GEN-AUTOSUBMIT-NO-SUBMITTABLE` |
| `floatingBtn.show()` | Equivalent to `setMode('submit')` | `GEN-AUTOSUBMIT-NO-SUBMITTABLE` |
| `floatingBtn.setMode('hidden')` / `setMode('')` / `setMode(undefined)` | Silent no-op — only `'submit'` / `'retry'` / `'next'` / `null` change state | `GEN-FLOATING-BUTTON-MODE-STRING` (autoSubmit-agnostic) |

Allowed hide calls remain available for the commit path to dismiss transient state: `setSubmittable(false)`, `setMode(null)`, `hide()`. The game's internal commit handler (timer `onEnd`, drag-drop drop callback, canvas commit) calls `endGame(correct)` directly — that is the only sanctioned entry into end-game UI. Canonical input-listener template lives in [code-patterns.md § `autoSubmit: true` input listener](../skills/game-building/reference/code-patterns.md).

## Opt-out (`floatingButton: false`)

When the spec declares a top-level `floatingButton: false`:

- `FloatingButtonComponent` MUST NOT be instantiated, imported, or referenced.
- `ScreenLayout.inject()` MUST NOT pass `floatingButton: true` in `slots` — omit the key entirely.
- The game hand-rolls its Submit / Retry / Next buttons inline per [PART-022](PART-022.md).
- All `GEN-FLOATING-BUTTON-*` and `5e0-FLOATING-BUTTON-*` rules auto-skip.

Two valid reasons to opt out: (1) the flow has no Submit CTA at all (timer-driven auto-advance, drag-to-commit, canvas-only flows) — emit NO Submit / Check / Done button anywhere; (2) the spec author deliberately opts into the inline PART-022 pattern.

**`floatingButton: false` vs `autoSubmit: true` — pick the lighter one.** `autoSubmit: true` (see [§ above](#top-level-spec-flag--autosubmit)) is the lighter opt-out — it hides only Submit and Retry while keeping `FloatingButtonComponent` instantiated to ship Next at end-of-game. Prefer it for games that want auto-evaluation but still need a Next button to fire `next_ended`. `floatingButton: false` is the heavier opt-out — it removes the entire component including Next, which means the game MUST hand-roll its own `next_ended` CTA via [PART-022](PART-022.md). Use `floatingButton: false` only when the creator explicitly opts into the inline PART-022 pattern, OR when no `next_ended` CTA is desired at all.

**(mandatory)** Step 4 (Build) MUST NOT write `floatingButton: false` into `spec.md` to silence validator rules. Same trust model as [PART-039](PART-039-preview-screen.md) — build-time spec mutations show up in `git diff` and are visible scope violations the user can revert.

## ScreenLayout configuration

```javascript
ScreenLayout.inject('app', {
  slots: {
    floatingButton: true,
    previewScreen: true,
    transitionScreen: true   // omit / set to false in Standalone (totalRounds: 1)
  }
});
```

The slot is a body-level sibling of `.page-center` / `.mathai-layout-root`. The component uses `position: fixed` and must not scroll with content.

Standalone variant: `slots.transitionScreen: false` (or omit) — Standalone shape forbids TransitionScreen ([rule 13](#mandatory-rules)).

## Instantiation

```javascript
let floatingBtn;
try {
  floatingBtn = new FloatingButtonComponent({ slotId: 'mathai-floating-button-slot' });
} catch (e) {
  console.error('FloatingButton init failed', e);
  Sentry.captureException(e);
}
```

`waitForPackages` must include `typeof FloatingButtonComponent !== 'undefined'` as a hard `&&` term ([rule 18](#mandatory-rules)).

## Public API

| Method | Purpose |
|---|---|
| `setMode(mode)` | `'submit'` / `'retry'` / `'next'` / `null`. Mutually exclusive. `null` fully hides the component. |
| `setSubmittable(bool)` | `true` ⇒ `setMode('submit')`; `false` ⇒ `setMode(null)`. **No-op while in `'retry'` or `'next'`.** |
| `setDisabled(bool)` | Greys out the visible state without changing it. Transient lockouts only. |
| `setLabels({submit, retry, next, submitting, secondary})` | Label overrides. Passing `secondary` enables the [Dual-button variant](#dual-button-variant) in `submit` mode. |
| `setError(text)` | Shows / clears an error line above the button row. |
| `on(event, handler)` | `event ∈ {submit, retry, next, secondary}`. Handler may be async. |
| `show()` | Equivalent to `setMode('submit')`. |
| `hide()` | Equivalent to `setMode(null)`. |
| `destroy()` | Removes DOM, clears listeners. Call from the Next handler AFTER `next_ended` is posted ([rule 12](#mandatory-rules)). |

## Visual design

All three visible modes share the same yellow button — this matches the canonical React `FlowButton` reference ("the CTA is here, tap to proceed"). Differentiating colors per mode would fight the reference and confuse players.

| Mode | Default label | Background | Notes |
|---|---|---|---|
| `submit` | `Submit` | `#FFDE49` | gargoyle-gas yellow |
| `retry` | `Try again` | `#FFDE49` | same yellow |
| `next` | `Next` | `#FFDE49` | same yellow |
| `null` | — | (not rendered) | |

Text color: `#333333` (dark-charcoal). Secondary button (Dual-button variant): `#FFFFFF` background, same text. Disabled: `#DDDDDD`. Height: 68px. Padding: 20px 53px. Border-radius: 8px. Shadow: `0 2px 1px rgba(0,0,0,0.1)`.

## Standalone lifecycle

Standalone (`totalRounds: 1`) end-game is a single 5-beat orchestrator inside `endGame(correct)`. The submit handler `await`s `endGame(correct)` and that's it. Each beat below is one row of [Click action cases](#click-action-cases) for the Standalone Submit handler.

Beat ordering is statically enforced by [GEN-FEEDBACK-ORDER](../skills/game-building/reference/static-validation-rules.md). The audio chain is `SFX-await → game_complete SYNC → TTS-await → reveal side-effects`, in that source order.

1. **(mandatory)** SFX awaited directly. PERMITTED: `await FeedbackManager.sound.play(...)` inside `try/catch`. FORBIDDEN: any `safePlaySound` helper, `Promise.all` duration floor, `Promise.race`, `setMode`, `show_star`, `answerComponent.show`, navigation, `destroy`.
2. **(mandatory)** `game_complete` SYNC. PERMITTED: `postGameComplete()` / `window.parent.postMessage({type:'game_complete', data:{...}}, '*')`. FORBIDDEN: `answerComponent.show(...)`, `floatingBtn.setMode(...)`, `window.postMessage({type:'show_star', ...})`, `transitionScreen.hide()`, any `*.destroy()`, body-card render into `#gameContent` ([rule 14](#mandatory-rules)).
3. **(mandatory)** TTS awaited. PERMITTED: `await FeedbackManager.playDynamicFeedback({...})`. FORBIDDEN: any side-effect from beats 4–5. Skip this beat only when the spec has no TTS.
4. **(mandatory)** `show_star` (correct only) + AnswerComponent reveal (wrong + lives=0 only). PERMITTED: `window.postMessage({type:'show_star', data:{count, ...}}, '*')` (header animation, ~1 s) AND `answerComponent.show({slides: getReviewSlides()})` gated on `!correct`. FORBIDDEN: bare `setMode` (deferred via setTimeout is beat 5), `transitionScreen.hide()` (Standalone has no TS), navigation. AnswerComponent on standalone correct is forbidden ([Retry & Next visibility](#retry-and-next-visibility-cases) — Standalone correct row).
5. **(mandatory)** Reveal Next / Retry. PERMITTED: `setTimeout(function(){ floatingBtn.setMode(correct ? 'next' : (gameState.lives > 0 ? 'retry' : 'next')); }, 1100)`. FORBIDDEN: bare `floatingBtn.setMode(...)` outside a setTimeout (would race the star animation), any further audio calls, body-card render. The ~1100 ms delay lets beat 4's animation finish.

```js
async function endGame(correct) {
  // Beat 1 — SFX.
  await FeedbackManager.play(correct ? 'correct' : 'incorrect');

  // Beat 2 — game_complete SYNC.
  window.parent.postMessage({ type: 'game_complete', data: { /* metrics */ } }, '*');

  // Beat 3 — TTS (omit if no TTS).
  try {
    await FeedbackManager.playDynamicFeedback({ audio_content: ttsText, subtitle, sticker });
  } catch (e) { /* TTS failures must not block */ }

  // Beat 4 — show_star (correct only) + AnswerComponent reveal (wrong+lives=0 only).
  if (correct) {
    window.postMessage({
      type: 'show_star',
      data: { count: gameState.stars || 1, variant: 'yellow', score: gameState.score + '/1' }
    }, '*');
  } else if (gameState.lives === 0 && answerComponent) {
    answerComponent.show({ slides: getReviewSlides() });
  }

  // Beat 5 — reveal Next or Retry.
  setTimeout(function () {
    floatingBtn.setMode(correct ? 'next' : (gameState.lives > 0 ? 'retry' : 'next'));
  }, 1100);
}

floatingBtn.on('next', function () {
  window.parent.postMessage({ type: 'next_ended' }, '*');
  try { if (answerComponent) answerComponent.destroy(); } catch (e) {}
  try { if (previewScreen) previewScreen.destroy(); } catch (e) {}
  floatingBtn.destroy();
});
```

**postMessage targets.** `game_complete` and `next_ended` cross frames — `window.parent.postMessage`. `show_star` is intra-frame (consumed by the ActionBar in the same window) — `window.postMessage`, no `.parent`. See [PART-040](PART-040-action-bar.md).

## Multi-round lifecycle

Multi-round (`totalRounds > 1`) end-game routes through Win Confirmation (optional) → Victory Celebration → AnswerComponent reveal → Next.

Per-round (non-final) submit handler awaits SFX + TTS, then auto-advances. There is no per-round retry ([Retry & Next visibility](#retry-and-next-visibility-cases) — Multi-round wrong rows).

End-of-game beats (final round resolves):

1. `await FeedbackManager.play(...)` for the final round.
2. `window.parent.postMessage({ type: 'game_complete', data: {...} }, '*')`.
3. `if (gameState.stars > 0) showWinConfirmation();` (or skip directly to `showVictoryCelebration()` if no Win Confirmation gate). On lives exhausted: `showGameOver()` (no AnswerComponent).
4. Win Confirmation's `Claim Stars` button calls `showVictoryCelebration()`.
5. Victory Celebration's `onMounted` plays `victory_sound_effect`, posts `show_star`, and via `setTimeout` calls a `showAnswerCarousel()` that calls `answerComponent.show({ slides })` + `floatingBtn.setMode('next')`. The Victory Celebration TS stays mounted (`persist: true`).
6. Player taps Next → single-stage exit ([rule 11](#mandatory-rules)).

```js
async function endGame() {
  await FeedbackManager.play(/* final round */);
  window.parent.postMessage({ type: 'game_complete', data: { /* metrics */ } }, '*');
  if (gameState.stars > 0) {
    showWinConfirmation();    // optional; or call showVictoryCelebration() directly
  } else {
    showGameOver();
  }
}

// Optional pre-celebration gate.
function showWinConfirmation() {
  transitionScreen.show({
    stars: gameState.stars,
    title: 'Victory!',
    buttons: [{
      text: 'Claim Stars',
      type: 'primary',
      action: function () {
        transitionScreen.hide();
        showVictoryCelebration();
      }
    }]
  });
}

// Celebration + hand-off.
async function showVictoryCelebration() {
  await transitionScreen.show({
    title: 'Yay! Stars collected!',
    stars: gameState.stars,
    buttons: [],
    persist: true,
    onMounted: function () {
      (async function () {
        await FeedbackManager.sound.play('victory_sound_effect', { sticker: STICKER_CELEBRATE });
        window.postMessage({
          type: 'show_star',
          data: { count: gameState.stars, variant: 'yellow', score: gameState.score + '/' + gameState.totalRounds }
        }, '*');
        setTimeout(function () { showAnswerCarousel(); }, 1500);
      })();
    }
  });
}

function showAnswerCarousel() {
  answerComponent.show({
    slides: rounds.map(function (r) {
      return { render: function (c) { renderAnswerForRound(r, c); } };
    })
  });
  floatingBtn.setMode('next');
}

floatingBtn.on('next', function () {
  window.parent.postMessage({ type: 'next_ended' }, '*');
  try { answerComponent.destroy(); } catch (e) {}
  try { if (previewScreen) previewScreen.destroy(); } catch (e) {}
  floatingBtn.destroy();
});
```

**`spec.autoShowStar: false`.** When the author wires their own `show_star` postMessage (e.g. from a `Claim Stars` action), set `autoShowStar: false` to suppress the generator-emitted default. ActionBar dedupes identical payloads within 500 ms, so an unintentional double-fire is safe. The Next-reveal `setTimeout` delay shortens to 300 ms when `autoShowStar: false` (no star animation to wait for); the default 1100 ms applies when the animation fires.

## Try Again lifecycle

**Scope:** Two UX variants. Pick one per game.

- **Standalone variant** — `totalRounds: 1` with `totalLives > 1`. Required (validator-enforced).
- **Multi-round explicit-retry-button variant** — `totalRounds > 1` with `totalLives > 1` AND `spec.roundRetryButton: true`. Opt-in.
- Default multi-round (without the flag) is **predicate-driven** — no retry button; wrong-with-lives plays audio then `setMode(null)`; the next interaction re-shows Submit. This variant has no Try Again lifecycle of its own — re-enable lives in `renderRound()` of the next round (multi-round predicate) or in the submit handler's wrong branch (multi-round auto-advance).

Re-enable timing for all three variants resolves at [state-and-guards.md § Lifecycle matrix](../skills/interaction/reference/state-and-guards.md#interaction-lifecycle--canonical-matrix).

### Standalone variant

Why standalone needs an explicit retry button: in standalone the single round IS the game, so "retry this question" is the only way to use a spare life. There is no `renderRound()` to delegate re-enable to.

Beats:

1. Submit click → wrong.
2. **(mandatory)** `gameState.lives -= 1`; `recordAttempt({correct: false, is_retry: (gameState.retryCount || 0) > 0, ...})`.
3. `await FeedbackManager.play('incorrect')`.
4. Branch on `gameState.lives`:
   - `> 0` → `floatingBtn.setMode('retry')`. Do NOT flip `isProcessing` / `.dnd-disabled` here — the retry handler is the source of truth.
   - `=== 0` → `endGame(false)` → routes to Next via [Standalone lifecycle](#standalone-lifecycle) beat 5 (gates AnswerComponent on `!correct`).
5. Player taps Try Again → handler runs the [Click actions Retry row](#click-action-cases).

```js
// Inside the wrong-answer branch of on('submit'):
gameState.lives -= 1;
gameState.attempts.push({ correct: false, is_retry: (gameState.retryCount || 0) > 0 /* ... */ });
await FeedbackManager.play('incorrect');

if (gameState.lives > 0) {
  gameState.retryCount = (gameState.retryCount || 0) + 1;
  floatingBtn.setMode('retry');
} else {
  endGame(false);
}

floatingBtn.on('retry', function () {
  // Clear input / feedback UI per spec.retryPreservesInput
  if (!RETRY_PRESERVES_INPUT) { inputEl.value = ''; gameState.userInput = ''; }
  clearFeedbackUI();

  // Re-enable in source order — the handler is the single source of truth
  gameState.isProcessing = false;
  if (boardEl) boardEl.classList.remove('dnd-disabled');     // P6 — load-bearing on @dnd-kit/dom
  if (voiceInput) voiceInput.enable();                        // P17
  if (timer) timer.resume();                                  // PART-006
  floatingBtn.setMode(null);                                  // predicate takes over again
  if (inputEl && !RETRY_PRESERVES_INPUT) inputEl.focus();
});
```

`RETRY_PRESERVES_INPUT` is a game-scope const emitted from `spec.retryPreservesInput`.

**Button label persistence (both shapes):** the retry button label is **stable `"Try Again"` across all retries**. Do NOT call `floatingBtn.setLabels({retry: ...})` mid-game to vary it (e.g. `"Last try!"` on the final retry, `"Retry 2 of 3"`). Per-retry label variation is out of scope — pick one label at game start (default `"Try Again"`, or a creator-quoted override emitted once via the initial `setLabels(...)` call) and keep it for the lifetime of the game. Varying the label per retry has no design intent in the canonical lifecycle and breaks the "stable button label" invariant the player relies on.

**Must reset / re-enable:** `gameState.isProcessing = false`; `boardEl.classList.remove('dnd-disabled')` (P6); `voiceInput.enable()` (P17); `timer.resume()` (PART-006); clear input value (unless `retryPreservesInput: true`); clear inline feedback DOM. **Must NOT reset:** `gameState.lives` (already decremented), `gameState.attempts`, `gameState.score`, `gameState.retryCount`. ([rule 6](#mandatory-rules), [GEN-FLOATING-BUTTON-RETRY-LIVES-RESET](../skills/game-building/reference/static-validation-rules.md))

### Multi-round explicit-retry-button variant (`spec.roundRetryButton: true`)

Why opt-in: the default multi-round wrong-with-lives UX is predicate-driven (no button — the player just keeps editing and Submit re-appears). Some game shapes want an explicit "Retry this round" affordance — same-round re-render after a wrong answer, gated on a button tap. The opt-in flag lets the spec author choose.

Beats:

1. Submit click → wrong, lives remaining.
2. `gameState.lives -= 1`; `recordAttempt(...)`.
3. `await FeedbackManager.play('incorrect')`.
4. `floatingBtn.setMode('retry')`. Do NOT flip `isProcessing` / `.dnd-disabled` here — the retry handler delegates to `renderRound(currentRound)` which is the source of truth.
5. Player taps Try Again → handler triggers same-round re-render.

```js
// Inside the wrong-answer branch of on('submit'):
gameState.lives -= 1;
await FeedbackManager.play('incorrect');

if (gameState.lives > 0) {
  floatingBtn.setMode('retry');
} else {
  endGame(false);
}

floatingBtn.on('retry', function () {
  clearFeedbackUI();
  floatingBtn.setMode(null);
  renderRound(gameState.currentRound);   // same-round re-render; flips isProcessing + removes .dnd-disabled in its first 3 lines
});
```

In-handler variant (when same-round re-render is too heavy): mirror the standalone handler body — flip `isProcessing`, remove `.dnd-disabled`, `voiceInput.enable()`, `timer.resume()` in source order. Pick one variant per game and template consistently.

**Validator scope.** `GEN-FLOATING-BUTTON-RETRY-STANDALONE` / `-LIVES-RESET` / `-NO-SUBMITTABLE` were authored assuming standalone-only retry. They will not fire on multi-round-with-`roundRetryButton`. If this UX ships at scale, the validator regexes need widening. TODO.

## Dual-button variant

Enable the secondary slot for parallel-answer flows (Yes / No, True / False):

```js
floatingBtn.setLabels({ submit: 'Yes', secondary: 'No' });
floatingBtn.on('submit',    () => answer(true));
floatingBtn.on('secondary', () => answer(false));
```

Secondary button is rendered only in `mode === 'submit'`. White background, same dark text. Off by default.

## Banned patterns

Patterns that look reasonable but break one of the [Mandatory rules](#mandatory-rules). Each entry links to its enforcing rule. LLM build agents hallucinate these regularly; listing them here lets the validator and the human reviewer catch them by name.

- `postGameComplete(...); floatingBtn.setMode('next');` in `endGame()` — Next during feedback audio. ([GEN-FLOATING-BUTTON-NEXT-TIMING](../skills/game-building/reference/static-validation-rules.md))
- `setMode('next')` in the same function as a `game_complete` postMessage. ([GEN-FLOATING-BUTTON-NEXT-TIMING](../skills/game-building/reference/static-validation-rules.md))
- Fire-and-forget end-of-game feedback (`FeedbackManager.play(...).catch(...)`). End-of-game feedback MUST be awaited.
- `setMode('next')` inside `.then(...)` of feedback play without dismissing the TransitionScreen — Next appears while the celebration is still visible.
- `transitionScreen.show({ buttons: [{ text: 'Next', ... }] })` — Next is owned by FloatingButton, not by a button on the TS. ([GEN-FLOATING-BUTTON-TS-CTA-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))
- `setSubmittable(true)` literal (no conditional). ([GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md))
- Empty-allowing predicates: `length >= 0`, `length >= -1`, `length !== -1`, `length > -1`. ([GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md))
- Predicate that omits the Interaction signal (value-valid only). ([GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md))
- Two-stage Next handler with `if (firstClick) { showNextScreen(); ... } else { exit(); }`. ([GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE](../skills/game-building/reference/static-validation-rules.md))
- `previewScreen.destroy()` called from `endGame()`. ([rule 12](#mandatory-rules))
- TransitionScreen used in Standalone games. ([GEN-FLOATING-BUTTON-STANDALONE-TS-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))
- Inline body-card render in `#gameContent` inside Standalone end-game handlers. ([GEN-STANDALONE-END-PANEL-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md))
- Custom `<button>` matching `/submit|retry|next|check|done|commit|cta/i` in `#gameContent` while FloatingButton is in use. ([5e0-FLOATING-BUTTON-DUP](../skills/game-building/reference/static-validation-rules.md))
- Retry handler that calls `setSubmittable(...)` after `setMode(null)`. ([GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE](../skills/game-building/reference/static-validation-rules.md))
- AnswerComponent reveal on Standalone correct end. ([Retry & Next visibility](#retry-and-next-visibility-cases))

## Integration

One subsection per neighbor PART. Each names the exact contract surface (postMessage type / awaited promise / slot).

### [PART-006 § TimerComponent](PART-006.md)

When TimerComponent is in scope, the `onEnd` callback must hide FloatingButton ([rule 4](#mandatory-rules)). The canonical pattern:

```js
new TimerComponent('timer-container', {
  timerType: 'decrease',
  onEnd: function () {
    gameState.timeExpired = true;
    floatingBtn.setMode(null);   // or: rely on isSubmittable() reading gameState.timeExpired
  }
});
```

### [PART-017 § FeedbackManager](PART-017.md)

Submit handlers await FeedbackManager audio / sticker cues before deciding the next mode:

```js
floatingBtn.on('submit', async () => {
  const correct = evaluate(gameState.userInput);
  recordAttempt({ correct, /* … */ });
  await FeedbackManager.play(correct ? 'correct' : 'incorrect');
  if (correct) endGame(true);
  else if (gameState.lives > 0) floatingBtn.setMode('retry');
  else endGame(false);
});
```

The button auto-hides on submit click ([rule 5](#mandatory-rules)), so the feedback sequence has no CTA competing for attention.

### [PART-040 § ActionBar](PART-040-action-bar.md) (postMessage targets)

- `game_complete`, `next_ended` → `window.parent.postMessage(...)` (cross-frame).
- `show_star` → `window.postMessage(...)` (intra-frame; ActionBar listens in the same window).

### [postmessage-schema](../skills/data-contract/schemas/postmessage-schema.md)

`next_ended` fires ONCE per game session, AFTER `game_complete`, in response to the Next tap.

### [PART-022 § Reset](PART-022.md)

Reset stays inline per PART-022. NOT absorbed into FloatingButton.

## CDN

Bundle (auto-loads `FloatingButtonComponent`):

```html
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
```

Standalone alternative:

```html
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/floating-button/index.js"></script>
```

## Validator rules enforced

Static enforcement of the [Mandatory rules](#mandatory-rules). Auto-skipped when the spec has `floatingButton: false`.

| Rule | What it checks |
|---|---|
| [GEN-FLOATING-BUTTON-CDN](../skills/game-building/reference/static-validation-rules.md) | Script tag for `floating-button/index.js` OR `components/index.js` bundle present when `FloatingButtonComponent` is referenced. |
| [GEN-FLOATING-BUTTON-SLOT](../skills/game-building/reference/static-validation-rules.md) | `slots.floatingButton: true` in `ScreenLayout.inject()` when the component is instantiated. |
| [GEN-FLOATING-BUTTON-PREDICATE](../skills/game-building/reference/static-validation-rules.md) | Source calls `setSubmittable(` from at least one input/state-change handler. |
| [GEN-FLOATING-BUTTON-MISSING](../skills/game-building/reference/static-validation-rules.md) | Hand-rolled Submit / Check / Done / Commit `<button>` in source but `FloatingButtonComponent` is NOT instantiated. |
| [GEN-FLOATING-BUTTON-SUBMIT-DEFAULT](../skills/game-building/reference/static-validation-rules.md) | No `setSubmittable(true)` literal; no empty-allowing predicates; predicate must AND a value-valid check with an Interaction signal (`/hasInteracted\|userInteracted\|touched\|dirty\|interacted\|isInteracted/i`). |
| [GEN-FLOATING-BUTTON-TIMEOUT-HIDE](../skills/game-building/reference/static-validation-rules.md) | When `new TimerComponent({...})` is present, the `onEnd` callback must hide FloatingButton — direct `setMode(null)` / `setSubmittable(false)` OR a state flag matching `/timeExpired\|timerEnded\|timeUp\|timeIsUp/i` consumed by `isSubmittable()`. |
| [5e0-FLOATING-BUTTON-DUP](../skills/game-building/reference/static-validation-rules.md) | No custom submit/retry/next/check/done/commit/cta `<button>` inside `#gameContent` when FloatingButton is used. Scans id, class, data-testid, aria-label, inner text. |
| [GEN-FLOATING-BUTTON-NEXT-MISSING](../skills/game-building/reference/static-validation-rules.md) | FloatingButton used AND `game_complete` posted, but no `setMode('next')` call OR no `on('next', ...)` handler. |
| [GEN-FLOATING-BUTTON-NEXT-POSTMESSAGE](../skills/game-building/reference/static-validation-rules.md) | `on('next', ...)` handler body does NOT post `{ type: 'next_ended' }`. |
| [GEN-FLOATING-BUTTON-NEXT-TIMING](../skills/game-building/reference/static-validation-rules.md) | `setMode('next')` sits within 400 chars of a `game_complete` reference without a `transitionScreen.hide()` / `transitionScreen.onDismiss(` / `await` / `.then(` separator. |
| [GEN-FLOATING-BUTTON-TS-CTA-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md) | TransitionScreen button object with `text: 'Next' / 'Continue' / 'Done' / 'Finish' / 'Play Again'` while FloatingButton is in use. |
| [GEN-FLOATING-BUTTON-STANDALONE-TS-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md) | Spec has `totalRounds: 1` AND FloatingButton is used, but source references `new TransitionScreenComponent(` or `transitionScreen.show(`. |
| [GEN-FLOATING-BUTTON-RETRY-STANDALONE](../skills/game-building/reference/static-validation-rules.md) | Spec has `totalRounds: 1` AND `totalLives > 1` AND FloatingButton used, but no `on('retry', ...)` handler. |
| [GEN-FLOATING-BUTTON-RETRY-LIVES-RESET](../skills/game-building/reference/static-validation-rules.md) | `on('retry', ...)` handler body contains a lives reset (`gameState.lives = gameState.totalLives` or `gameState.lives = <literal>`). |
| [GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE](../skills/game-building/reference/static-validation-rules.md) | `on('retry', ...)` handler body calls `setSubmittable(...)`. |
| [GEN-STANDALONE-END-PANEL-FORBIDDEN](../skills/game-building/reference/static-validation-rules.md) | `gameContent.innerHTML = '<...>'` assignments inside `endGame` / `endStandaloneGame` / `onCorrect` / `onWrong` for Standalone games. |

## Verification checklist

The human's pre-ship pass for things the validator can't see (real browser behavior, real audio).

- [ ] FloatingButton starts hidden; first appears only when the Submittable predicate returns true.
- [ ] Submittable predicate ANDs a value-valid check with an Interaction signal.
- [ ] Pre-filled input does NOT show Submit on first paint.
- [ ] Timer expiry hides Submit (test: trigger expiry, screenshot, button gone).
- [ ] Standalone end-game runs the 5-beat orchestrator in source order.
- [ ] AnswerComponent appears on Standalone end ONLY when `correct === false && lives === 0`.
- [ ] Multi-round Victory Celebration is reached via `showVictoryCelebration()`; AnswerComponent reveal happens via `onMounted` `setTimeout`.
- [ ] `floatingBtn.on('next', ...)` is single-stage and posts `next_ended` first.
- [ ] No `*.destroy()` calls inside `endGame()`.
- [ ] `node alfred/scripts/validate-static.js <game-html>` exits 0.
