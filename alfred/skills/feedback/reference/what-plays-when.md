# What Plays When — Feedback Matrix

For each game moment, exactly which feedback types fire. No ambiguity.

## Feedback Type Key

- **SFX** = Static pre-recorded sound effect via `FeedbackManager.sound.play(id)` — preloaded
- **VO** = Voiceover (scripted narration like "Level N" / "Round N" / "Victory!"). **Can be static or dynamic** depending on what the creator supplies: static VO = pre-recorded file, preloaded, played via `sound.play(id)`; dynamic VO = TTS generated on the fly via `playDynamicFeedback({audio_content})`.
- **TTS** = Dynamic text-to-speech via `FeedbackManager.playDynamicFeedback({audio_content})` — same API as dynamic VO; distinguished by intent (TTS = puzzle-specific explanation, VO = scripted narration)
- **Sticker** = Animated GIF overlay (always paired with audio)
- **Subtitle** = On-screen text (always paired with audio)

## The Matrix

**Column convention.** "VO" = scripted narration (e.g. "Level N", "Victory!", "Game over"), whether the creator supplies a static recording or it's generated dynamically via `playDynamicFeedback`. "TTS" = puzzle-specific explanation generated dynamically per round (e.g. "Great! 5 in the thousands place gives 5000"). Both use `playDynamicFeedback` when dynamic; static VO uses `sound.play(id)`.

| Moment | SFX | VO | TTS | Sticker | Subtitle | Await? |
|--------|-----|-----|-----|---------|----------|--------|
| Level transition | ✅ level SFX | ✅ "Level N" VO (static or dynamic) | — | ✅ mascot (5s) | ✅ "Level N" | **Yes** (sequential, CTA interrupts) |
| Round transition (auto-advance) | ✅ round SFX | ✅ "Round N" VO (static or dynamic) | — | ✅ (per round) | ✅ "Round N" | **Yes** (sequential) |
| Round transition (with CTA) | ✅ round SFX | ✅ "Round N" VO (static or dynamic) | — | ✅ (per round) | ✅ "Round N" | **Yes** (sequential, CTA interrupts) |
| Round start (multi-round games) | — | — | ✅ reads question (fire-and-forget) | — | ✅ question text | No |
| Round start (standalone games) | — | — | OFF by default; opt-in via `roundMountNarration: true` (CASE 3) | — | — | n/a |
| Correct (single-step) | ✅ correct SFX | — | ✅ explanation TTS (always) | ✅ celebration (2s) | ✅ explanation subtitle | **Yes** (sequential) |
| Correct (multi-step mid-round) | ✅ correct SFX | — | — | ✅ celebration (2s) | — | No |
| Round complete (all matched) | ✅ all-correct SFX | — | ✅ explanation TTS **only if Bloom L2+** | ✅ (2s) | ✅ "All matched!" | **Yes** (SFX always awaited; TTS awaited only when present) |
| Wrong — single-step (lives remaining) | ✅ wrong SFX | — | ✅ explanation TTS (always) | ✅ sad (2s) | ✅ explanation subtitle | **Yes** (sequential) |
| Wrong — multi-step (lives remaining) | ✅ wrong SFX | — | — | ✅ sad (2s) | — | No |
| Wrong (last life) | ✅ wrong SFX (awaited via `FeedbackManager.sound.play`, package bounds failures at 2.5s) | — | — | ✅ sad (2s) | — | **Yes** — then game-over flow (CASE 8) |
| Tile select | ✅ bubble SFX | — | — | — | — | No |
| Tile deselect | ✅ bubble SFX | — | — | — | — | No |
| Partial progress (chain) | ✅ chain SFX | — | — | ✅ | — | No (fire-and-forget; no mid-chain TTS/VO — see CASE 10) |
| Victory (3★) | ✅ victory SFX | ✅ victory VO (static or dynamic) | — | ✅ big celebration (3-5s) | — | **Yes** (sequential) |
| Victory (2★) | ✅ complete SFX | ✅ 2-star VO (static or dynamic) | — | ✅ moderate (3s) | — | **Yes** (sequential) |
| Victory (1★) | ✅ complete SFX | ✅ 1-star VO (static or dynamic) | — | ✅ moderate (3s) | — | **Yes** (sequential) |
| Game over | ✅ game-over SFX | ✅ game-over VO (static or dynamic) | — | ✅ sad (3s) | — | **Yes** (sequential) |
| New cards appearing | ✅ ambient SFX | — | — | — | — | No |
| Restart | — | sometimes ✅ restart VO (static or dynamic) | — | sometimes ✅ | — | No |

## Sequential Audio Pattern

**CRITICAL RULE: When two audios play back-to-back, ALWAYS `await` the first before starting the second. The second must NEVER override or overlap the first.**

### Transition Screens (Level + Round)

All transition screens play **two sequential awaited calls**: SFX with sticker first, then dynamic VO with sticker.

```
SFX (with sticker) → await complete → dynamic VO (with sticker) → await complete → done
```

This applies to:
- Level transition: level SFX → `playDynamicFeedback({audio_content: 'Level N'})`
- Round transition (auto-advance): round SFX → `playDynamicFeedback({audio_content: 'Round N'})`
- Round transition (with CTA): round SFX → `playDynamicFeedback({audio_content: 'Round N'})` (CTA interrupts)

If a CTA is present, student can tap it at any point during the sequence. Wrap the sequential awaits in `FeedbackManager.runSequence(async () => { ... })`. On CTA tap: `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()`, then proceed — those calls abort the ambient `runSequence` automatically, so the second awaited audio short-circuits. The legacy `audioStopped` flag is **forbidden** (validator `GEN-FEEDBACK-RUN-SEQUENCE`).

### End-Game (Victory + Game Over)

End-game moments always play **two sequential awaited calls**: SFX with sticker first, then dynamic VO.

```
SFX (with sticker, 3-5s) → await complete → dynamic VO (with sticker) → await complete → done
```

This applies to:
- Victory (3★): victory SFX → `playDynamicFeedback({audio_content: victory VO})`
- Game complete (2★): complete SFX → `playDynamicFeedback({audio_content: 2-star VO})`
- Game complete (1★): complete SFX → `playDynamicFeedback({audio_content: 1-star VO})`
- Game over: game-over SFX → `playDynamicFeedback({audio_content: game-over VO})`

The results/game-over screen is already visible during this sequence. If student taps CTA, both are stopped.

### Correct/Wrong with Explanation

When a content-specific explanation follows the SFX:

```
SFX (with sticker) → await complete → dynamic TTS explanation (with sticker) → await complete → unblock input
```

Same rule: `await` first, then start second. Never simultaneous.

## When Dynamic TTS Is Used

Dynamic TTS (`playDynamicFeedback`) is used when the audio content is **content-specific and can't be pre-recorded**:

- Reading the question aloud at round start ("Make 90", "Place the digit to maximize")
- Explaining a correct answer with specific numbers ("Great! Placing 5 in the thousands place gives 5000")
- Explaining a wrong answer with specific context ("Oops! 5 contributes only 50 from this position")
- Level/round announcements with dynamic content

Dynamic TTS is NOT used for:
- Correct/wrong SFX (these are always pre-recorded)
- Victory/game-over SFX (pre-recorded)
- Micro-interactions like tile select/deselect (pre-recorded)

## SFX + Dynamic TTS Default Rule (by Game Type)

**CRITICAL — This determines the default feedback behavior based on the game type.**

### Single-step games (1 interaction completes the round)

**Default: SFX (awaited) → Dynamic TTS with subtitle + sticker (awaited). ALWAYS.**

Every correct and wrong answer plays two sequential audios. The TTS speaks a context-aware explanation using actual numbers/values from that round. The sequence is always: **SFX (awaited) → then Dynamic TTS (awaited)**. Never the other way around, never simultaneous.

| Moment | SFX | Then Dynamic TTS | Subtitle | Example TTS content |
|--------|-----|-----------------|----------|---------------------|
| Correct answer | ✅ correct SFX | ✅ explanation TTS | ✅ same as TTS | "Great! Placing 5 in the thousands place gives 5000" |
| Wrong answer | ✅ wrong SFX | ✅ explanation TTS | ✅ same as TTS | "Not quite! 5 contributes only 50 from this position" |

### Multi-step games (multiple interactions to complete the round)

**Default: SFX + sticker only. NO dynamic TTS, NO subtitle. Fire-and-forget.**

Mid-round matches/actions only play SFX with a sticker. No dynamic TTS — it would kill the pacing. Student keeps interacting immediately.

| Moment | SFX | Dynamic TTS | Subtitle | Why |
|--------|-----|------------|----------|-----|
| Correct match/action | ✅ correct SFX + sticker | ❌ none | ❌ none | Don't slow the student |
| Wrong match/action | ✅ wrong SFX + sticker | ❌ none | ❌ none | Don't slow the student |
| Round complete (all matched) | ✅ all-correct SFX + sticker | ✅ explanation TTS **only if Bloom L2+** | ✅ "All matched!" | Terminal moment — SFX always awaited; awaited TTS added when spec has a Bloom L2+ explanation |
| Tile select/deselect | ✅ bubble SFX | ❌ none | ❌ none | Pure ambient |

### How to identify the game type

| Game type | Examples |
|-----------|---------|
| Single-step | MCQ (tap 1 of 4), type a number, select one correct option, tap the right cell |
| Multi-step | Match pairs, sort items into buckets, build a chain, drag multiple items, connect dots |

## Sticker Rules

- Stickers are always attached to a `FeedbackManager.sound.play()` or `playDynamicFeedback()` call
- Stickers never render without accompanying audio
- Each sticker is a CDN-hosted animated GIF
- Game code passes a **string URL** to the `sticker` param; FeedbackManager wraps it internally into `{ image, duration, type: 'IMAGE_GIF' }`. Do NOT construct the object yourself — that's the package's internal shape.
- Different GIFs for: correct, wrong, each level, each star tier, game over, round transition, restart
- A game should have unique sticker URLs — don't reuse the same GIF for correct and wrong
