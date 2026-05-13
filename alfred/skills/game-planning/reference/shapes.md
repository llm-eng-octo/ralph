# Game Shapes — Canonical Source

This file is the **single source of truth** for the standalone-vs-multi-round-vs-sectioned distinction. Definitions, shape-conditional feature scope, creator-only flag matrix, and a pointer to each shape's flow file all live here. Other skill / PART files **link** to this file rather than restating.

The skill infers exactly one shape from the spec's ASCII user-flow diagram + `totalRounds` / `sections` config. Standalone collapses the flow to its minimum; multi-round runs the full machinery; sectioned adds section-intro transitions between grouped loops. A single runtime handles all three.

## Definitions {#definitions}

- **Standalone** — a game with exactly one evaluated question (`totalRounds: 1`, no `sections`). Single round, single end state, no transition screens, no round-set cycling. End-state UI is AnswerComponent + FloatingButton + persistent preview header. Canonical flow diagram: [standalone-flow.md](standalone-flow.md).

- **Multi-round** — a game with several evaluated rounds (`totalRounds ≥ 2`, no `sections`). Round-N intro, progress bar `i/N`, round-set cycling (sets A/B/C), full Victory/Game-Over branches, Play Again / Try Again. Canonical flow diagram: [multi-round-flow.md](multi-round-flow.md).

- **Sectioned** — a game with `sections: [...]` present. Section-intro transition at each boundary; rounds grouped per section; progress bar shows section + round. Otherwise inherits the multi-round end-game machinery. (No dedicated flow file yet — see § Shape 3 below.)

## Shape Decision Matrix {#decision-matrix}

| Feature | Standalone (`totalRounds: 1`) | Multi-Round (`totalRounds ≥ 2`) |
|---|---|---|
| Round-set cycling (`set: 'A'\|'B'\|'C'`) | **FORBIDDEN** — single round, no `set` key | **MANDATORY** — at least 3 sets × `totalRounds` rounds each (validator `GEN-ROUNDSETS-MIN-3`) |
| `rounds.length` | **MUST equal 1** | `totalRounds × N` where N ≥ 3 (number of sets) |
| `setIndex` in `gameState` | omitted (harmless to include but unused) | required, integer ≥ 0 |
| TransitionScreen | **FORBIDDEN** — no Welcome / Round-N / Victory / Game Over / Motivation / Stars Collected screens | **MANDATORY** — full flow per [multi-round-flow.md](multi-round-flow.md) |
| ProgressBarComponent | **MUST NOT instantiate** (validator: proposed `GEN-STANDALONE-NO-PROGRESS-BAR`) | **MANDATORY** — visible on every screen except Preview |
| FloatingButton | OPTIONAL (default ON; creator may set `floatingButton: false`) — but TS remains FORBIDDEN regardless of this flag | OPTIONAL (default ON) |
| AnswerComponent | OPTIONAL (default ON). When ON, reveal is gated on `!correct AND lives === 0`. See [PART-051 § Standalone lifecycle](../../../parts/PART-051.md). | OPTIONAL (default ON). When ON, reveal happens via Victory Celebration `onMounted` hand-off — see [PART-051 § Multi-round lifecycle](../../../parts/PART-051.md). |
| End-game orchestrator | **5-beat `endGame(correct)`** in [PART-050 § Standalone lifecycle](../../../parts/PART-050.md#standalone-lifecycle) | **Split chain**: feedback loop → Victory/Game-Over TS → Stars Collected → AnswerComponent → Next |
| `show_star` animation | fires inside `endGame()` beat 4, once per game | fires inside Stars Collected `onMounted`, once per game |
| Round mount narration (`questionTTS` on render) | **OFF by default**; opt-in via spec `roundMountNarration: true` (creator-quoted) | **ON when round has `questionTTS`** — fire-and-forget |
| Try Again handler | required when `totalLives > 1`; forbidden when `totalLives === 1` (proposed validator extension) | optional, gated by `spec.roundRetryButton: true` |
| Retry button label | stable `"Try Again"` across all retries; do not vary | stable `"Try Again"` across all retries |
| PreviewScreen destruction | exclusively via FloatingButton `on('next')` — see [PART-039:315](../../../parts/PART-039-preview-screen.md) | exclusively via FloatingButton `on('next')` — same rule |
| Restart / Play Again | N/A — no restart UI | required; rotates `setIndex` before `resetGameState()` |

## Creator-only Spec Flags {#creator-only-flags}

Four spec flags are **creator-only** — no LLM step may auto-default them. The spec MUST include creator-quoted opt-in/out for any of these flags that appear.

| Flag | Default | Opt-out / Opt-in trigger | Shape impact |
|---|---|---|---|
| `previewScreen: false` | `true` (preview is present) | Creator-quoted opt-out only | Applies to both shapes. ScreenLayout omits the preview slot — see [PART-025](../../../parts/PART-025-screen-layout-component.md). |
| `answerComponent: false` | `true` (carousel is present) | Creator-quoted opt-out only — spec-review § H5 enforces audit trail | Both shapes. **For standalone:** opting out also kills the wrong-with-no-lives solution reveal — surface to creator. |
| `autoSubmit: true` | `false` | Creator-quoted opt-in only | Both shapes. Hides Submit/Retry; game's internal handler (timer, drag-drop) calls `endGame()` directly. |
| `floatingButton: false` | `true` | Creator-quoted opt-out only | Both shapes. Game hand-rolls end-CTA via [PART-022 inline button](../../../parts/PART-022.md). **Does NOT relax the TS prohibition on standalone** — TS remains forbidden. |
| `roundMountNarration: true` | `false` for standalone; `true` for multi-round (always emit canonical mount block) | Creator-quoted opt-in for standalone | Standalone only. When `true`, every round MUST carry paired `questionTTS` + `questionSubtitle`. Mount-time source is `round.questionTTS` ONLY — per-slide narration belongs to AnswerComponent's `render()`, not mount. |

## Lives UI placement {#lives-ui}

**Standalone:** TBD. Since there's no progress bar, how/whether to show the lives count on the Game screen is deferred. Placeholder options: top-right hearts overlay, header slot, or host-rendered. The decision will be made when a real standalone game forces it.

**Multi-round:** lives count is shown in the ProgressBarComponent's heart segment. See [PART-023-progress-bar.md](../../../parts/PART-023-progress-bar.md).

## Shape flow diagrams

- **Shape 1 — Standalone:** [standalone-flow.md](standalone-flow.md)
- **Shape 2 — Multi-round:** [multi-round-flow.md](multi-round-flow.md)
- **Shape 3 — Sectioned:** see below (no dedicated file yet)

## Shape 3 — Sectioned (`sections: [...]` present) {#sectioned}

```
Preview ─▶ Welcome ─▶ Section 1 intro ─▶ Round 1 ─▶ Game ─▶ … ─▶ Game (last of S1) ─┐
🔊 prev    🔊 vo     🔊 section vo       🔊"R 1"    🔊prompt                         │
           [ready]   [ready]             auto       progress: S1 · i/k               │
                                                                                     │
            ┌────────────────────────────────────────────────────────────────────────┘
            ▼
   Section 2 intro ─▶ Round k+1 ─▶ Game ─▶ … ─▶ Game (last of last section) ─▶ Victory
   🔊 section vo     🔊"R k+1"    🔊prompt                                     1–3★
   [ready]           auto         progress: S2 · j/m
```

Section intros are tap-to-advance (same sub-type as Level N / Practice / Challenge). Game-Over and Victory branches behave identically across all three shapes — only the body between Welcome and the end differs. End-game machinery inherits from Shape 2 (multi-round).
