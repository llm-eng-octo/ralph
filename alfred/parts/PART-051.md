### PART-051: AnswerComponent (Correct Answers reveal)

**Category:** CONDITIONAL | **Condition:** Every game with at least one evaluated answer to display UNLESS the spec sets `answerComponent: false` | **Dependencies:** [PART-002](PART-002.md), [PART-008](PART-008.md), [PART-017](PART-017.md), [PART-050](PART-050.md) (FloatingButton — its `next` tap drives the post-celebration exit)

> **If you change this PART, also re-read [`game-planning/SKILL.md`](../skills/game-planning/SKILL.md) and [`game-building/SKILL.md`](../skills/game-building/SKILL.md) for any prose that restates a rule below — paraphrased rules can drift from this canonical source.** Update [`alfred/parts/README.md`](README.md) too if the component's mandatory/conditional status changes; run `node alfred/scripts/validate-parts-catalog.js` to confirm catalog ↔ disk match.

## Index — the story this doc tells

The doc walks through five questions, in the order a reader actually asks them. Each question's answer leads to the next. Jump in via the links if you only need one section — but the connections are linked, so you may need to back up.

> **1. Why am I reading this file?** — After a player finishes a game, they need to *see the correct answer* — not the inline feedback that flashed during play, but a clean persistent surface they can scroll back to. Without it, the player walks away never knowing whether they were right (multi-round) or what the right answer was (Standalone wrong-with-no-lives). This component is the post-celebration reveal surface.
>
> Open with the [§ 1 Problem](#problem) — what need this exists to fill. Then [§ 2 Canonical names](#canonical-names) — vocabulary the rest of the doc uses (AnswerComponent header, Slide, Render callback, Victory Celebration screen).
>
> **2. What *is* this thing — what does it look like from outside?** — A two-state surface: Hidden or Visible. `show()` is the only way to enter Visible. The complexity is not in the state machine; it's in WHEN the Visible state is *allowed*.
>
> [§ 3 States](#states) names the two modes and their entry/exit triggers. The state machine alone is incomplete — anyone could call `show()` at the wrong moment. The visibility table answers when:
> - [§ 4 Visibility cases](#visibility-cases) — derived from [PART-050's Retry/Next visibility table](PART-050.md#retry-and-next-visibility-cases), reproduced here for direct lookup. Lists every (shape × phase × outcome × lives) combination and whether AnswerComponent is shown or hidden.
>
> Together: § 3 says what states exist · § 4 says when each state is allowed.
>
> **3. How does it solve the problem — what must always be true while it runs?** — The visibility table says when AnswerComponent is *allowed* to be Visible. The mandatory rules are the cross-cutting constraints that keep it allowed only at the right moments — the parts the visibility table cannot say on its own (audio ordering, DOM location, teardown sequencing, readiness).
>
> [§ 5 Mandatory rules](#mandatory-rules) — five MECE buckets covering five disjoint dimensions: state integrity, reveal ordering, component boundary, teardown contract, readiness. If every rule holds, no row of the visibility table can produce a wrong outcome.
>
> [§ 6 Opt-out (`answerComponent: false`)](#opt-out-answercomponent-false-creator-only) — when the whole component is absent and none of the above applies. Unlike most opt-outs in the pipeline, this one is creator-only — the trust model (spec-creation cannot auto-fill, spec-review FAILs an unjustified flag, build cannot mutate the spec) is what makes the rest of the doc enforceable.
>
> **4. How do I actually wire it up — and which variant matches my game?** — Two parts: the boilerplate every game shares, then the variant for the specific game shape, then where the slide payload comes from.
>
> Boilerplate (in the order you write it):
> - [§ 7 ScreenLayout configuration](#screenlayout-configuration) — reserve the slot.
> - [§ 8 Instantiation](#instantiation) — construct the instance with an attributable catch.
> - [§ 9 Public API](#public-api) — `show` / `hide` / `update` / `setSlideIndex` / `destroy` + the slide payload contract.
> - [§ 10 Visual design](#visual-design) — header strip, mint body, sizing.
> - [§ 11 Layout helpers](#layout-helpers) — `.mathai-answer-stack` and `.mathai-answer-row` for slide content.
>
> Variants — pick by game shape. Both are concrete walk-throughs of how AnswerComponent fits into the end-game sequence:
> - [§ 12 Standalone lifecycle](#standalone-lifecycle) — `totalRounds: 1`. AnswerComponent is beat 4 of [PART-050's 5-beat `endGame()` orchestrator](PART-050.md#standalone-lifecycle), gated on `!correct`.
> - [§ 13 Multi-round lifecycle](#multi-round-lifecycle) — `totalRounds > 1`. AnswerComponent reveals only via the [Victory Celebration screen](PART-050.md#multi-round-lifecycle)'s `onMounted` `setTimeout` hand-off; it never appears inside `endGame()`.
>
> Then [§ 14 Content / data contract](#content-data-contract) — where each slide's payload comes from in the spec (`content.rounds[i].answer` per round, or `answers: [...]` on a single Standalone round).
>
> **5. How do I know I got it right — and what should I never do?** — Two enforcement layers (static and human) plus the neighbor contracts.
>
> [§ 15 Integration](#integration) — the exact contract surface (postMessage type / awaited promise / slot) this component shares with each neighbor PART (FloatingButton, FeedbackManager, TransitionScreen, ActionBar). [§ 16 CDN](#cdn) — script tags. [§ 17 Validator rules enforced](#validator-rules-enforced) — static enforcement of § 5. [§ 18 Verification checklist](#verification-checklist) — the human's pre-ship pass for things validators can't see (real browser behavior, real audio).

## Problem

After a player finishes a game, they need to *see the correct answer* — not the inline feedback that flashed during play, but a clean, persistent surface they can scroll back to. Without this, the game ends on a celebration screen and the player walks away never knowing whether their answer was actually right (multi-round) or what the right answer was (Standalone wrong-with-no-lives). **`AnswerComponentComponent`** is the post-celebration reveal surface: one slide per evaluated answer, rendered by the game, contained in a fixed yellow-headered card.

## Canonical names

Defined once; the rest of the doc uses these terms exactly.

- **AnswerComponent** — the `AnswerComponentComponent` instance. Lives in `#mathai-answer-slot` at the end of `.game-stack`, after `#gameContent` and `#mathai-transition-slot`.
- **AnswerComponent header** — the yellow-tinted strip with the `Correct Answers!` label + `i/N` carousel counter + prev/next arrows.
- **Slide** — one entry of `slides[]` passed to `show({ slides })`. Shape is `{ render(container) }` only.
- **Render callback** — the slide's `render(container)` function. The component clears `container` before each call.
- **[Victory Celebration screen](PART-050.md#canonical-names)** — the post-game TransitionScreen that plays `victory_sound_effect` + `show_star`, stays mounted as backdrop, hands off to AnswerComponent via `onMounted` `setTimeout`.
- **[Inline feedback panel](PART-017.md)** — per-round feedback DOM (PART-017 / PART-022). NOT this component.
- **[Single-stage Next handler](PART-050.md#canonical-names)** — the `floatingBtn.on('next', ...)` handler that destroys AnswerComponent + posts `next_ended` + destroys the floating button (and preview, if applicable) in one tap.

## States

AnswerComponent has exactly two externally observable states. Complexity lives in the [Visibility cases](#visibility-cases) — when each state is allowed.

| State | Visible? | Trigger to enter | Trigger to exit |
|---|---|---|---|
| Hidden | No | Page load / `hide()` / `destroy()` | `show({ slides })` → Visible |
| Visible | Yes | `show({ slides })` | `hide()` / `destroy()` |

Internal carousel state (current slide index) is component-owned. `setSlideIndex(i)` jumps; arrow taps advance/retreat; counter shows `i/N`.

## Visibility cases

PART-051's visibility table is the AnswerComponent column of [PART-050 § Retry and Next visibility cases](PART-050.md#retry-and-next-visibility-cases). Reproduced here for direct lookup:

| Shape | Phase | Outcome | Lives remaining | AnswerComponent |
|---|---|---|---|---|
| Standalone | Post-eval | Correct | (n/a) | **hidden** |
| Standalone | Post-eval | Wrong | > 0 | hidden |
| Standalone | Post-eval | Wrong | 0 | **shown** |
| Multi-round | Gameplay (any round) | (any) | (any) | hidden |
| Multi-round | Victory Celebration screen | (n/a) | (n/a) | **shown** |
| Multi-round | Win Confirmation / Welcome / Round-intro / Game Over screens | (n/a) | (n/a) | hidden |
| Either shape | Preview state | (n/a) | (n/a) | hidden |

**Standalone wrong+lives=0 vs Standalone correct.** AnswerComponent reveals on Standalone wrong-with-no-lives so the player can read the solution. On Standalone correct, the player already produced the correct answer — AnswerComponent stays hidden, the player taps Next directly.

## Mandatory rules

Every line is `(mandatory)`. Rules are grouped into five MECE buckets covering five disjoint dimensions: (A) state integrity, (B) reveal ordering, (C) component boundary, (D) teardown contract, (E) readiness. **Completeness check:** if every rule in every bucket holds, no row of the [Visibility cases](#visibility-cases) can produce a wrong outcome.

#### A. State integrity — only `show()` reveals; nothing else

Constrains: how the component enters Visible state. Backstops the [Visibility cases](#visibility-cases) Hidden rows.

1. **(mandatory)** Component starts hidden and is revealed ONLY via `show()`. No CSS / DOM trick that auto-reveals. (review)
2. **(mandatory)** When `slides.length === 1`, prev/next arrows are disabled (`aria-disabled="true"`, opacity 0.3, no pointer events) and counter shows `1/1`. (component-internal)

#### B. Reveal ordering — `show()` is gated on shape, phase, and audio completion

Constrains: when `show()` is allowed to fire. Backstops every Visible row of the [Visibility cases](#visibility-cases).

3. **(mandatory)** `show({ slides })` is called AFTER `await FeedbackManager.play(...)` for the final round / final answer. (static: [GEN-ANSWER-COMPONENT-SHOW-AFTER-FEEDBACK](../skills/game-building/reference/static-validation-rules.md))
4. **(mandatory)** `show()` MUST NOT be called while `previewScreen.isActive()` is true. (static: [GEN-ANSWER-COMPONENT-NOT-IN-PREVIEW](../skills/game-building/reference/static-validation-rules.md))
5. **(mandatory)** **Standalone (`totalRounds: 1`):** `answerComponent.show(...)` is gated on `!correct` — reveal only when the player ran out of lives. The call site sits inside an `if (!correct)` / `if (correct === false)` / `else` of `if (correct)` branch. (static: [GEN-ANSWER-COMPONENT-SHOW-AFTER-FEEDBACK](../skills/game-building/reference/static-validation-rules.md))
6. **(mandatory)** **Multi-round (`totalRounds > 1`):** `answerComponent.show(...)` MUST NOT appear inside `endGame()`, inside a Win Confirmation `Claim Stars` action, or anywhere before the Victory Celebration screen. The reveal is reached only through the Victory Celebration `onMounted` `setTimeout` calling the answer-reveal function (typically `showAnswerCarousel()`). The Victory Celebration TS stays mounted (`persist: true`); no `transitionScreen.hide()` in the hand-off. (static: [GEN-ANSWER-COMPONENT-AFTER-CELEBRATION](../skills/game-building/reference/static-validation-rules.md))

#### C. Component boundary — slide shape and DOM location are fixed

Constrains: what payload `show()` accepts and where the DOM lives. Prevents drift across games.

7. **(mandatory)** Every `slides[]` entry uses `render(container)` only — no `html` / `element` keys. (static: [GEN-ANSWER-COMPONENT-SLIDE-SHAPE](../skills/game-building/reference/static-validation-rules.md))
8. **(mandatory)** Component container lives in `#mathai-answer-slot` inside `.game-stack`. NOT inside `#gameContent`, NOT inside the floating-button slot. (static: [GEN-ANSWER-COMPONENT-SLOT](../skills/game-building/reference/static-validation-rules.md))

#### D. Teardown contract — single-stage exit, destroy in two places

Constrains: how the Visible state ends. Tied to [PART-050 § Click action cases](PART-050.md#click-action-cases) Next rows.

9. **(mandatory)** The Next handler is single-stage — destroy AnswerComponent + post `next_ended` + destroy preview + destroy FloatingButton in one tap. No two-stage `if (firstClick) { showStarsCollected(); ... } else { exit(); }` branching. (static: [GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE](../skills/game-building/reference/static-validation-rules.md))
10. **(mandatory)** `destroy()` is called from the Next handler AND from `restartGame()`. (static: [GEN-ANSWER-COMPONENT-DESTROY](../skills/game-building/reference/static-validation-rules.md))

#### E. Readiness — the component is loaded and constructed before any `show()` can run

Constrains: how the component enters scope. Backstops the assumption every other rule makes that `answerComponent` exists.

11. **(mandatory)** `waitForPackages` includes `typeof AnswerComponentComponent !== 'undefined'` as a hard `&&` term. (static: [GEN-WAITFORPACKAGES-NO-OR](../skills/game-building/reference/static-validation-rules.md), [GEN-WAITFORPACKAGES-MISSING](../skills/game-building/reference/static-validation-rules.md))
12. **(mandatory)** The `new AnswerComponentComponent(...)` call uses an attributable catch (`console.error` + `Sentry.captureException`), never a silent `try { ... } catch (e) {}`. (review + static: [GEN-SLOT-INSTANTIATION-MATCH](../skills/game-building/reference/static-validation-rules.md))

## Opt-out (`answerComponent: false`) — CREATOR-ONLY

Unlike most opt-outs in the pipeline, this one is creator-only — the trust model is what makes the rest of the doc enforceable. When the spec declares a top-level `answerComponent: false`:

- `AnswerComponentComponent` MUST NOT be instantiated, imported, or referenced.
- `ScreenLayout.inject()` MUST NOT pass `answerComponent: true` in `slots` — omit the key entirely.
- The game ends at final feedback → celebration TransitionScreen(s) (multi-round) or directly at Next reveal (Standalone) with no answer review surface.
- All `GEN-ANSWER-COMPONENT-*` rules auto-skip.

**`answerComponent: false` is a CREATOR-ONLY decision.** Unlike most opt-outs in the pipeline, this flag MUST NOT be auto-filled by an LLM at any step. It only appears in `spec.md` when the human creator EXPLICITLY requests opt-out — quoted creator language must be present in the spec body or in the Warnings section.

Two valid creator reasons:

1. The game has no meaningful per-round answer to review — pure exploration / sandbox / canvas-only flows where "correct answer" isn't a concept the player can re-read.
2. The creator deliberately wants the inline feedback panel to be the only answer surface — and they say so explicitly.

**Trust model.**

- **(mandatory)** [Step 1 (spec-creation)](../skills/spec-creation/SKILL.md): the spec-author LLM MUST NOT auto-default `answerComponent` to `false`. The default is silent `true`. Auto-filling `false` because the game is a one-question Standalone, because an inline feedback panel exists, or because the creator was silent on answer review is a violation. (review: [spec-creation § answerComponent exception](../skills/spec-creation/SKILL.md))
- **(mandatory)** [Step 2 (spec-review)](../skills/spec-review/SKILL.md): the reviewer LLM MUST FAIL any spec containing `answerComponent: false` without quoted creator opt-out language. (review: [spec-review § H5](../skills/spec-review/SKILL.md))
- **(mandatory)** [Step 4 (build)](../skills/game-building/SKILL.md): the build-time LLM MUST NOT write `answerComponent: false` into `spec.md` to silence validator rules. Build-time spec mutations show up in `git diff` and are visible scope violations. (review)

## ScreenLayout configuration

```javascript
ScreenLayout.inject('app', {
  slots: {
    previewScreen: true,
    transitionScreen: true,
    floatingButton: true,
    answerComponent: true   // reserves #mathai-answer-slot at the end of .game-stack
  }
});
```

The slot is the last child of `.game-stack`, after `#gameContent` and `#mathai-transition-slot`. Visual order matches the spec rule "instructions → play area → answer component".

## Instantiation

```javascript
let answerComponent;
try {
  answerComponent = new AnswerComponentComponent({
    slotId: 'mathai-answer-slot'
    // headerLabel: 'Correct Answers!'  // default — override only if spec demands it
  });
} catch (e) {
  console.error('AnswerComponent init failed', e);
  Sentry.captureException(e);
}
```

`waitForPackages` must include `typeof AnswerComponentComponent !== 'undefined'` as a hard `&&` term ([rule 11](#mandatory-rules)).

## Public API

| Method | Purpose |
|---|---|
| `show({ slides, headerLabel? })` | Reveal component, render N slides. Each slide MUST be `{ render(container) }`. Counter shows `i/N`; nav auto-disables when `slides.length === 1`. |
| `hide()` | `display: none` on the root. State preserved. |
| `update({ slides, headerLabel? })` | Replace slides without toggling visibility. |
| `setSlideIndex(i)` | Jump to slide `i` (clamped). |
| `isVisible()` | `true` while root is rendered. |
| `destroy()` | Removes DOM, clears slides. Call from the Next handler AND `restartGame()` ([rule 7](#mandatory-rules)). |

### Slide payload

```javascript
{
  render(container) {
    // mount evaluated answer DOM into `container`
    // component clears the container before each invocation
  }
}
```

The component clears the slide container before every render (on `show`, on every nav, on `update` if index didn't change). Games can therefore reuse a single render function that constructs DOM from `gameState` / round data without worrying about leaks.

`html` / `element` keys are NOT supported ([rule 8](#mandatory-rules)).

### Slide cardinality

- **Multi-round game (`totalRounds > 1`):** N rounds → N slides. `rounds.map(r => ({ render: c => renderAnswerForRound(r, c) }))`.
- **Standalone with one answer (`totalRounds: 1`):** 1 slide → prev/next arrows disabled.
- **Standalone with multiple evaluated answers:** put an `answers: [...]` array on the single round; map each entry to a slide.

## Visual design

```
┌────────────────────────────────────────────────────┐
│ ✅  Correct Answers!              ⟨   1/3   ⟩      │   ← AnswerComponent header (#FCF6D7CC)
├────────────────────────────────────────────────────┤
│                                                    │
│           [ game-rendered answer view ]            │   ← mint body (#DAFEDC)
│                                                    │
└────────────────────────────────────────────────────┘
```

- AnswerComponent header: light-yellow strip; left = green-tick badge + label; right = prev arrow / `i/N` counter / next arrow.
- Body: pale-mint background; the game renders into the slide container.
- Card max-width: 400 px. Sits at the bottom of `.game-stack` after `#gameContent` and `#mathai-transition-slot`.
- Component starts hidden (`display: none`); only revealed by `show()`.

## Layout helpers

The slide container is plain block flow with `text-align: center` and `line-height: 1.5`. Two auto-margin rules (`> * + *` and `> * > * + *`) provide a 14 px vertical rhythm for direct and once-wrapped children, so simple multi-section views need no spacing CSS. For richer layouts, use:

| Class | Purpose | Notes |
|---|---|---|
| `.mathai-answer-stack` | Vertical column with `gap: 14px`, centred | Wrap multiple stacked sections — neutralises the auto `> * + *` margin so spacing is owned by `gap`. |
| `.mathai-answer-row` | Horizontal row with `gap: 8px 12px`, wraps | Inline groups of chips / labels / values that should sit side-by-side. |

```javascript
function renderAnswerForRound(round, container) {
  var wrap = document.createElement('div');
  wrap.className = 'mathai-answer-stack';
  wrap.innerHTML =
    '<div class="er-answer-title">Round ' + round.round + '</div>' +
    '<div class="mathai-answer-row">' +
    '  <span>' + round.answer.left + '</span>' +
    '  <span>vs</span>' +
    '  <span>' + round.answer.right + '</span>' +
    '</div>' +
    '<div class="er-answer-explanation">' + round.answer.explanation + '</div>';
  container.appendChild(wrap);
}
```

## Standalone lifecycle

Standalone (`totalRounds: 1`) flow. The FloatingButton-side beats live in [PART-050 § Standalone lifecycle](PART-050.md#standalone-lifecycle); AnswerComponent's role is beat 4.

1. Page load → `new AnswerComponentComponent(...)` → component hidden.
2. Preview state → component hidden.
3. Gameplay → component hidden. Per-round inline feedback is in `#gameContent` (PART-017).
4. Final feedback completes → `endGame(correct)` runs the 5 beats. Beat 4: `show_star` (correct only) + `answerComponent.show({ slides })` (wrong+lives=0 only — gated on `!correct`).
5. Beat 5 reveals Next or Retry via `setTimeout`.
6. Player taps Next → [Single-stage Next handler](PART-050.md#click-action-cases) → `answerComponent.destroy()` + `next_ended` + `floatingBtn.destroy()`.

```js
// Inside endGame() Beat 4 — see PART-050 § Standalone lifecycle:
if (correct) {
  window.postMessage({
    type: 'show_star',
    data: { count: gameState.stars || 1, variant: 'yellow', score: gameState.score + '/1' }
  }, '*');
} else if (gameState.lives === 0 && answerComponent) {
  answerComponent.show({ slides: getReviewSlides() });
}
```

`getReviewSlides()` returns a `{ render(container) }` array — one slide per evaluated answer (one in most Standalone games; N when `answers: [...]` is on the single round).

## Multi-round lifecycle

Multi-round (`totalRounds > 1`) flow. AnswerComponent is reached only via the Victory Celebration `onMounted` hand-off — see [PART-050 § Multi-round lifecycle](PART-050.md#multi-round-lifecycle) for the FloatingButton-side beats.

1. Page load → `new AnswerComponentComponent(...)` → component hidden.
2. Preview state → component hidden.
3. Gameplay → component hidden. Per-round inline feedback is in `#gameContent`.
4. Final round resolves → `endGame()` posts `game_complete` and routes to `showWinConfirmation()` (optional) or directly to `showVictoryCelebration()`.
5. Win Confirmation's `Claim Stars` button calls `showVictoryCelebration()`.
6. Victory Celebration's `onMounted` plays `victory_sound_effect`, posts `show_star`, then via `setTimeout` calls `showAnswerCarousel()` → `answerComponent.show({ slides })` + `floatingBtn.setMode('next')`. The Victory Celebration TS stays mounted (`persist: true`).
7. Player taps Next → [Single-stage Next handler](PART-050.md#click-action-cases) tears down AnswerComponent + Victory Celebration TS + preview + FloatingButton.

```
final-round feedback
        │
        ▼
endGame() ─→ postGameComplete()
             showWinConfirmation()                    (optional gate)
                  │ user taps "Claim Stars"
                  ▼
             showVictoryCelebration()                 (celebration TS — stays visible)
                  │  buttons: [], persist: true
                  │  onMounted:
                  │    await sound.play('victory_sound_effect')
                  │    window.postMessage({type:'show_star', ...})
                  │    setTimeout(() => {
                  │      showAnswerCarousel()         ← hand-off (TS stays mounted)
                  │    }, ~1500)
                  ▼
        ┌─────────────────────────────────────────┐
        │ showAnswerCarousel():                   │
        │   answerComponent.show({ slides })      │
        │   floatingBtn.setMode('next')           │   ← Next appears HERE, once
        └────────────────┬────────────────────────┘
                         │ user taps Next
                         ▼
        floatingBtn.on('next', ...)                  ← single-stage exit
```

When there is no Win Confirmation gate, `endGame()` calls `showVictoryCelebration()` directly. Same `onMounted` hand-off, same single-stage Next handler.

## Content / data contract

Where each slide's payload comes from in the spec. The answer payload itself is **game-specific** — same model as the question payload. The harness does not validate the inner shape; the component is dumb about types.

- Each round in `content.rounds[i]` MAY include an `answer` field (any shape — object, array, scalar) that the game uses to render the slide.
- For a Standalone game with multiple evaluated answers, use `totalRounds: 1` and put an `answers: [...]` array on the single round; the game maps each entry to a slide.
- The `spec.md` MUST document the per-round answer shape under "Content schema" alongside the question shape. See [spec-creation](../skills/spec-creation/SKILL.md).
- The deployment step adds the `answer` / `answers` field to `inputSchema.json` for content-set validation.

```javascript
function getReviewSlides() {
  return rounds.map(function (round) {
    return {
      render: function (container) {
        // render the evaluated answer view for `round` into `container`
        // — drop-zones in solved state, grid with correct queens, table with correct rows highlighted, etc.
      }
    };
  });
}
```

## Integration

One subsection per neighbor PART. Each names the exact contract surface (postMessage type / awaited promise / slot).

### [PART-050 § FloatingButton](PART-050.md)

Both surfaces live in `.game-stack`. AnswerComponent is the post-celebration reveal; FloatingButton's Next mode tears it down. The reveal-then-Next sequence is fully specified in [PART-050 § Standalone lifecycle](PART-050.md#standalone-lifecycle) (beats 4–5) and [PART-050 § Multi-round lifecycle](PART-050.md#multi-round-lifecycle).

### [PART-017 § FeedbackManager](PART-017.md)

`show()` is called AFTER `await FeedbackManager.play(...)` for the final answer ([rule 2](#mandatory-rules)). The Standalone end-game also awaits TTS (Beat 3) before the show call.

### [PART-024 § TransitionScreen](PART-024.md)

Multi-round only. The Victory Celebration TS hands off to AnswerComponent via `onMounted` `setTimeout` ([rule 5](#mandatory-rules)). The TS stays mounted as backdrop — no `transitionScreen.hide()` in the hand-off.

### [PART-040 § ActionBar](PART-040-action-bar.md) (postMessage targets)

- `next_ended` → `window.parent.postMessage(...)` (cross-frame).
- `show_star` → `window.postMessage(...)` (intra-frame).

## CDN

Bundle (auto-loads `AnswerComponentComponent`):

```html
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
```

Standalone alternative:

```html
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/answer-component/index.js"></script>
```

## Validator rules enforced

Static enforcement of the [Mandatory rules](#mandatory-rules). Auto-skipped when the spec has `answerComponent: false`.

| Rule | What it checks |
|---|---|
| [GEN-ANSWER-COMPONENT-CDN](../skills/game-building/reference/static-validation-rules.md) | Script tag for `answer-component/index.js` OR `components/index.js` bundle is present when `AnswerComponentComponent` is referenced. |
| [GEN-ANSWER-COMPONENT-SLOT](../skills/game-building/reference/static-validation-rules.md) | `slots.answerComponent: true` in `ScreenLayout.inject()` when the component is instantiated. |
| [GEN-ANSWER-COMPONENT-INSTANTIATE](../skills/game-building/reference/static-validation-rules.md) | `new AnswerComponentComponent({...})` exists at DOMContentLoaded. |
| [GEN-ANSWER-COMPONENT-SHOW-AFTER-FEEDBACK](../skills/game-building/reference/static-validation-rules.md) | `.show(` for the answer ref appears AFTER `await FeedbackManager.play(`. For `totalRounds === 1`, the `.show(` call site sits inside an `if (!correct)` / `if (correct === false)` / `else` of `if (correct)` branch. |
| [GEN-ANSWER-COMPONENT-AFTER-CELEBRATION](../skills/game-building/reference/static-validation-rules.md) | Multi-round games (`totalRounds > 1`) using TransitionScreen MUST NOT call `answerComponent.show(...)` inside `endGame()`, inside a Win Confirmation `Claim Stars` action, or anywhere before the Victory Celebration screen. The reveal must be reached only through the Victory Celebration `onMounted` `setTimeout`. |
| [GEN-ANSWER-COMPONENT-NEXT-SINGLE-STAGE](../skills/game-building/reference/static-validation-rules.md) | `floatingBtn.on('next', ...)` is a single-stage exit — destroy AnswerComponent + post `next_ended` + destroy floating button (and preview if applicable) in one tap. No two-stage `if (firstClick)` branching. |
| [GEN-ANSWER-COMPONENT-NOT-IN-PREVIEW](../skills/game-building/reference/static-validation-rules.md) | `.show(` is not called inside any branch gated by `previewScreen.isActive()` / `state === 'preview'`. |
| [GEN-ANSWER-COMPONENT-DESTROY](../skills/game-building/reference/static-validation-rules.md) | `.destroy()` is called from the `floatingBtn.on('next', ...)` handler AND from `restartGame()`. |
| [GEN-ANSWER-COMPONENT-SLIDE-SHAPE](../skills/game-building/reference/static-validation-rules.md) | All `slides[]` entries use `render` callback only — no `html` / `element` keys. |

## Verification checklist

The human's pre-ship pass for things the validator can't see (real browser behavior, real audio).

- [ ] `new AnswerComponentComponent({ slotId: 'mathai-answer-slot' })` runs at DOMContentLoaded.
- [ ] Component hidden during preview state.
- [ ] Component hidden during gameplay (every round).
- [ ] `show({ slides })` called AFTER `await FeedbackManager.play(...)` for the final round.
- [ ] **Standalone:** `show()` is gated on `!correct` — appears on wrong-with-no-lives, NOT on correct.
- [ ] **Multi-round:** `show()` is NOT called inside `endGame()`. Reached only through the Victory Celebration `onMounted` `setTimeout`. The Victory Celebration TS stays mounted.
- [ ] `floatingBtn.setMode('next')` is called immediately after `answerComponent.show(...)` inside the answer-reveal function.
- [ ] **Single-stage Next handler:** destroys AnswerComponent, posts `next_ended`, destroys FloatingButton (and preview if applicable) in one tap. No `if (!firstClick)` branching.
- [ ] Multi-round game: slide count equals round count; counter shows `1/N` … `N/N`.
- [ ] Standalone with one answer: prev/next disabled; counter shows `1/1`.
- [ ] Slide payloads use `render(container)` only.
- [ ] `node alfred/scripts/validate-static.js <game-html>` exits 0.
