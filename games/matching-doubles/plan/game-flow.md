# Game Flow: Matching Doubles

## One-liner

Students double (×2) a base number by tapping a left tile and then tapping its correct double on the right, clearing 9 rounds of increasing grid size under a 3-lives budget and a count-up timer that determines their star tier.

## Flow Diagram

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌──────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Game (Round  │
│          │        │ (trans.) │        │ intro        │ (after  │  N gameplay) │
│ 🔊 prev  │        │ 🔊 welc. │        │ (trans.,     │  sound) │ 🔊 prompt    │
│   audio  │        │    VO    │        │  no buttons) │         │  (optional)  │
└──────────┘        └──────────┘        │ 🔊 "Round N" │         └──────┬───────┘
                                        └──────────────┘                │
                                                ▲                       │ tap L → tap R
                                                │                       ▼
                                                │             ┌────────────────────┐
                                                │             │ Match check        │
                                                │             │ ✓ lock pair (SFX   │
                                                │             │   fire-and-forget) │
                                                │             │ ✗ shake+red        │
                                                │             │   life--           │
                                                │             │   (SFX f&f)        │
                                                │             └─────────┬──────────┘
                                                │                       │
                      ┌─────────────────────────┼───────────────────────┼───────────────────────┐
                      │                         │                       │                       │
                wrong AND lives=0        all pairs locked         correct OR wrong        pair locked BUT
                      │                  AND N < 9                AND round incomplete    round incomplete
                      ▼                         │                       │                       │
          ┌───────────────────────┐             │                  stay on Round N          stay on Round N
          │ Game Over (status)    │             ▼                  (deselect tiles,         (continue
          │ 😔 "Game Over"        │    ┌──────────────────┐         pair remains)            matching)
          │ "You ran out of       │    │ Round-complete   │                │                       │
          │  lives!"              │    │ SFX + subtitle   │                └───────────────────────┘
          │ 🔊 sound_game_over    │    │ "Round complete!"│                        │
          │ [Try Again]           │    │ (awaited)        │◀───────────────────────┘
          └───────────┬───────────┘    └────────┬─────────┘
                      │ tap                     │ auto, after sound
                      ▼                         │
          ┌───────────────────────┐             │   N<9: back to Round N+1 intro
          │ "Ready to improve     │             │
          │  your score?" (trans.)│             │   N=9:
          │ 🔊 sound_motivation   │             ▼
          │ [I'm ready! 🙌]       │   ┌─────────────────────┐
          └───────────┬───────────┘   │ Victory (status)    │
                      │ tap           │ 1–3★ (time-based)   │
                      ▼               │ "Completed in X s!" │
          restart from Round 1        │ 🔊 sound_game_      │
          (skips Preview + Welcome)   │    victory →        │
          lives=3, timer=0,           │    victory VO       │
          round=1                     └──────┬──────┬───────┘
                                             │      │
                                "Play Again" │      │ "Claim Stars"
                                (only if     │      │ (always)
                                 1–2★)       ▼      ▼
                                ┌──────────────────┐  ┌───────────────────────┐
                                │ "Ready to improve│  │ "Yay!                 │
                                │  your score?"    │  │  Stars collected!"    │
                                │ (trans., tap)    │  │ (trans., auto-dismiss)│
                                │ 🔊 motivation VO │  │ 🔊 stars_collected    │
                                │ [I'm ready! 🙌]  │  │   + ✨ star anim      │
                                └────────┬─────────┘  └──────────┬────────────┘
                                         │ tap                   │ auto, after
                                         ▼                       │ animation
                                restart from Round 1             ▼
                                (skips Preview + Welcome)     game_exit
                                lives=3, timer=0,             postMessage
                                round=1
```

Visibility handling (applies to every screen except Preview, Game Over, Victory, Stars Collected):
- `visibilitychange → hidden` → pause timer, pause all audio, show "Game Paused" overlay (CASE 14).
- `visibilitychange → visible` → resume timer, resume audio, dismiss overlay (CASE 15).

## Shape

**Shape:** Shape 2 Multi-round

## Changes from default

- Wrong-match branch leads to **Game Over when `lives === 0`** (Memory Match archetype override — the default Memory Match profile has `lives: 0`, but this spec specifies `lives: 3`, which activates the `game_over` subtree from the canonical Shape 2 diagram).
- Round feedback is **multi-step** (SFX + sticker, fire-and-forget) per feedback/SKILL.md — a correct or wrong match does NOT block input or await dynamic TTS. The student continues tapping tiles immediately. The only awaited feedback mid-game is "Round complete!" when the last pair in a round is locked (CASE 6).
- Star tier is **time-only** (3★ ≤ 60s, 2★ ≤ 90s, else 1★; forced 1★ on Game Over). The Victory `subtitle` therefore references time, not accuracy.
- Game-Over forces `stars = 1`.

## Stages

| Stage | Rounds | Difficulty | Content description |
|-------|--------|------------|---------------------|
| Warm-up (Stage 1) | 1–3 | L2 recall of ×2 with small numbers | 3 pairs per round, left tiles from 2–9, right tiles are exact doubles (no distractors). Goal: build ×2 reflex. |
| Standard (Stage 2) | 4–6 | L2 application of ×2 with mixed 1- and 2-digit values | 4 pairs per round, left tiles from 5–30, right tiles are exact doubles (no distractors). Goal: practice ×2 with larger numbers under more visual competition. |
| Confusability (Stage 3) | 7–9 | L2 application with misconception distractors | 5 pairs per round, left tiles from 15–50, right column includes 1–2 misconception-tagged distractors (`double-add-instead`, `double-next-number`, `double-off-by-one`). Goal: resist additive/off-by-one thinking. |

Round count, pairs-per-round, and distractor policy come from the spec (`## Rounds & Progression` + `fallbackContent`). The 3-stage / 3-round-per-stage split matches archetype defaults.
