# Standalone Flow (Shape 1)

This is the canonical standalone flow for single-question games (`totalRounds: 1`). If the spec has more than one evaluated round, use [Shape 2 — Multi-Round](multi-round-flow.md) instead. Shape definitions, decision matrix, and per-shape feature scope live in [shapes.md](shapes.md).

```
┌──────────┐ tap    ┌────────────┐ submit  ┌──────────────────┐
│ Preview  ├───────▶│ Game (Q1)  ├────────▶│ Feedback 2s      ├──▶ Game End
│ 🔊 prev  │        │ 🔊 prompt  │         │ ✓ / ✗            │    {stars, correct,
└──────────┘        │ no progress│         │ stars auto-given │     livesLeft}
                    │ bar        │         │ lives decr if ✗  │    → host resumes
                    └────────────┘         └──────────────────┘
```

**No transition screens.** No Welcome, no Round-N intro, no Victory, no Game Over, no "Ready to improve your score?", no "Yay stars collected!". Standalone games have a single question and a single end state — nothing to transition between.

**No round-set cycling.** A single round object in `fallbackContent.rounds` with no `set` key. Validator `GEN-ROUNDSETS-MIN-3` auto-skips on `totalRounds === 1`.

**End-state UI = AnswerComponent + FloatingButton + persistent preview header.** No inline body-card, no TransitionScreen. The 5-beat end-game orchestrator lives in [PART-050 § Standalone lifecycle](../../../parts/PART-050.md#standalone-lifecycle). AnswerComponent visibility is gated on `!correct AND lives === 0` — see [PART-051 § Standalone lifecycle](../../../parts/PART-051.md).

**Retry behavior:** when `totalLives > 1`, wrong+lives>0 routes to Try Again via FloatingButton's `retry` mode. When `totalLives === 1` or lives have run out, wrong routes through AnswerComponent reveal → Next. See [PART-050 § Try Again lifecycle](../../../parts/PART-050.md).

**Progress bar:** not instantiated. ProgressBarComponent does not appear in any standalone screen — neither in `#gameContent` nor in the preview header.

**Lives UI:** placement is deferred. Since there's no progress bar, how/whether to show the lives count on the Game screen is TBD. Placeholder options: top-right hearts overlay, header slot, or host-rendered. The decision will be made when a real standalone game forces it.

**Round mount narration:** OFF by default. The spec MAY opt in with `roundMountNarration: true` only when the creator explicitly asks for the question to be read aloud after the puzzle renders. Mount-time narration source is `round.questionTTS` only — even when the round carries `answers: [...]`. See [spec-creation § Optional roundMountNarration flag](../../spec-creation/SKILL.md) and [feedback CASE 3](../../feedback/SKILL.md).

**Shape-conditional validators that fire:** `GEN-FLOATING-BUTTON-STANDALONE-TS-FORBIDDEN`, `GEN-STANDALONE-END-PANEL-FORBIDDEN`, `GEN-FLOATING-BUTTON-RETRY-STANDALONE`, `GEN-FLOATING-BUTTON-RETRY-LIVES-RESET`, `GEN-FLOATING-BUTTON-RETRY-NO-SUBMITTABLE`, `GEN-SHOW-STAR-ONCE`, `GEN-ANSWER-COMPONENT-SHOW-AFTER-FEEDBACK`. See [static-validation-rules.md](../../game-building/reference/static-validation-rules.md).
