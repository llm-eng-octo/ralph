# Feedback Quick Reference

Use this as a review cheat sheet. For implementation, use `SKILL.md`, `feedbackmanager-api.md`, and `timing-and-blocking.md`.

## Core Rules

| Topic | Rule |
|---|---|
| Single-step answer feedback | Await SFX -> await dynamic TTS with subtitle + sticker -> advance. |
| Multi-step mid-round feedback | Fire-and-forget SFX + sticker only. No TTS/subtitle mid-round. |
| Multi-step round-complete | Await round-complete SFX; add awaited TTS only for Bloom L2+ explanation in spec. |
| Sequential audio | Wrap 2+ awaited audio calls in `FeedbackManager.runSequence(...)`. |
| Stop pair | CTA/screen change/cleanup calls `FeedbackManager.sound.stopAll()` + `FeedbackManager.stream.stopAll()`. |
| Pause/resume | Visibility hide pauses sound + streams + timer; resume continues from position. |
| End-game | Final answer feedback finishes before results/game-over screen; end-game audio plays after the screen and `game_complete`. |
| Failure | Package owns timeouts/status objects. No wrappers, no `Promise.race`, no duration floors. |

## Moment Matrix

| Moment | Feedback |
|---|---|
| Level / round transition | SFX -> VO/TTS, awaited in order; CTA can interrupt. |
| Round start | Optional question TTS, fire-and-forget, input stays live. |
| Correct single-step | Correct SFX -> explanatory TTS, both awaited. |
| Wrong single-step | Wrong SFX -> explanatory TTS, both awaited. |
| Wrong last life | Wrong SFX first, then Game Over flow. |
| Correct/wrong multi-step partial | SFX + sticker fire-and-forget. |
| Round complete | Await SFX; optional awaited explanation TTS. |
| Tile select/deselect | Micro SFX only. |
| Victory / game complete | Screen first -> `game_complete` -> end SFX -> VO/TTS. |
| Game over | Screen first -> `game_complete` -> game-over SFX -> VO/TTS. |

## Student-Visible Checks

- Audio, subtitle, and sticker appear together and disappear together.
- Subtitle/sticker never appear without paired audio.
- New feedback cuts old feedback cleanly; no echo on double-tap.
- No leftover audio/subtitle/sticker when a new round or end screen paints.
- Interactions are blocked during single-step submit feedback.
- CTA stops all audio immediately.
- Playing audio is not truncated; failed audio resolves with a package status.

## Pattern Mapping

| Pattern type | Examples | Feedback rule |
|---|---|---|
| Single-step | P1, P7, P1+P7 | Await SFX -> await TTS. |
| Multi-step | P2, P3, P5, P6, P8-P16 and compounds | Mid-round SFX only; round-complete awaited SFX plus optional Bloom L2+ TTS. |

Refer to `skills/game-archetypes/SKILL.md` for the canonical pattern taxonomy.
