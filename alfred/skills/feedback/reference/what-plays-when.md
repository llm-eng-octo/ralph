# What Plays When — Feedback Matrix

For each game moment, exactly which feedback types fire. No ambiguity.

## Feedback Type Key

- **SFX** = Static pre-recorded sound effect via `FeedbackManager.sound.play(id)`
- **VO** = Static pre-recorded voiceover via `FeedbackManager.sound.play(id)`
- **TTS** = Dynamic text-to-speech via `FeedbackManager.playDynamicFeedback({audio_content})`
- **Sticker** = Animated GIF overlay (always paired with audio)
- **Subtitle** = On-screen text (always paired with audio)

## The Matrix

| Moment | SFX | VO | TTS | Sticker | Subtitle | Await? |
|--------|-----|-----|-----|---------|----------|--------|
| Level transition | ✅ level SFX | — | ✅ dynamic VO | ✅ mascot (5s) | ✅ "Level N" | **Yes** (sequential, CTA interrupts) |
| Round transition (auto-advance) | ✅ round SFX | — | ✅ dynamic VO | ✅ (per round) | ✅ "Round N" | **Yes** (sequential) |
| Round transition (with CTA) | ✅ round SFX | — | ✅ dynamic VO | ✅ (per round) | ✅ "Round N" | **Yes** (sequential, CTA interrupts) |
| Round start | — | — | ✅ reads question | — | ✅ question text | No |
| Correct (single-step) | ✅ correct SFX | — | sometimes ✅ explanation | ✅ celebration (2s) | sometimes ✅ | **Yes** |
| Correct (multi-step mid-round) | ✅ correct SFX | — | — | ✅ celebration (2s) | — | No |
| Round complete (all matched) | ✅ all-correct SFX | — | — | ✅ (2s) | ✅ "All matched!" | **Yes** |
| Wrong (lives remaining) | ✅ wrong SFX | — | sometimes ✅ explanation | ✅ sad (2s) | — | **Yes** |
| Wrong (last life) | **skipped** | — | — | — | — | N/A |
| Tile select | ✅ bubble SFX | — | — | — | — | No |
| Tile deselect | ✅ bubble SFX | — | — | — | — | No |
| Partial progress (chain) | ✅ chain SFX | ✅ progress VO | — | ✅ | — | No |
| Victory (3★) | ✅ victory SFX | ✅ victory VO | — | ✅ big celebration (3-5s) | — | **Yes** (sequential) |
| Victory (2★) | ✅ complete SFX | ✅ 2-star VO | — | ✅ moderate (3s) | — | **Yes** (sequential) |
| Victory (1★) | ✅ complete SFX | ✅ 1-star VO | — | ✅ moderate (3s) | — | **Yes** (sequential) |
| Game over | ✅ game-over SFX | ✅ game-over VO | — | ✅ sad (3s) | — | **Yes** (sequential) |
| New cards appearing | ✅ ambient SFX | — | — | — | — | No |
| Restart | — | sometimes ✅ restart VO | — | sometimes ✅ | — | No |

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

If a CTA is present, student can tap it at any point during the sequence. On CTA tap: `stopAll()` + `_stopCurrentDynamic()`, then proceed. Use an `audioStopped` flag to prevent the second audio from starting if CTA was tapped during the first.

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

## SFX + Dynamic TTS Together (The Combo Rule)

SFX and Dynamic TTS fire together **only when the feedback needs to SAY something content-specific that changes per round**. The sequence is always: **SFX (awaited) → then Dynamic TTS (awaited)**. Never the other way around, never simultaneous.

### When the combo fires

| Moment | SFX | Then Dynamic TTS | Example TTS content |
|--------|-----|-----------------|---------------------|
| Correct answer with round-specific explanation | ✅ correct SFX | ✅ explanation TTS | "Great! Placing 5 in the thousands place gives 5000" |
| Wrong answer with round-specific explanation | ✅ wrong SFX | ✅ explanation TTS | "Oops! 5 contributes only 50 from this position" |
| Puzzle/path complete with celebration | ✅ correct SFX | ✅ celebration TTS | "Excellent! Path complete!" |

### When the combo does NOT fire (SFX alone is enough)

| Moment | Why no TTS |
|--------|-----------|
| Correct answer with generic feedback | Explanation is in subtitle text ("Right! Divide both by 3"), no need to speak it |
| Wrong answer with generic feedback | Subtitle covers it ("Not quite. It's 1:2") |
| Multi-step mid-round match | Don't slow the student — fire-and-forget SFX only |
| Tile select/deselect | Micro-interaction, ambient SFX only |
| Round complete (all matched) | SFX + subtitle ("All matched!"), no dynamic narration needed |

### The decision rule

**Use SFX + Dynamic TTS when:** the explanation involves actual numbers, positions, or reasoning specific to that round's content AND speaking it aloud adds pedagogical value (the student benefits from hearing the explanation, not just reading it).

**Use SFX alone when:** the feedback is generic/rotatable ("Correct!", "Not quite") or the moment needs to be fast (mid-round matches, micro-interactions).

## Sticker Rules

- Stickers are always attached to a `FeedbackManager.sound.play()` or `playDynamicFeedback()` call
- Stickers never render without accompanying audio
- Each sticker is a CDN-hosted animated GIF
- Sticker type is always `'IMAGE_GIF'`
- Different GIFs for: correct, wrong, each level, each star tier, game over, round transition, restart
- A game should have unique sticker URLs — don't reuse the same GIF for correct and wrong
