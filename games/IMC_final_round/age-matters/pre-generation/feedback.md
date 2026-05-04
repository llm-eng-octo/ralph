# Feedback: Age Matters

## Bloom Level: L4 Analyze

Translating a multi-sentence word problem into a single linear equation in one variable requires intersecting multiple semantic constraints (who is older, what time delta applies, which phrase encodes the equation). The construction is graded at each translation step rather than only at the final answer — every wrong tap produces a *misconception-tagged hint* so the student gets immediate diagnostic feedback at the level of the specific translation move that failed.

L4 implications for feedback:
- **Wrong-answer feedback is misconception-specific** (NOT generic "try again"). 7 named misconceptions; one hint per misconception per step.
- **Multi-step pattern dominates** (steps 1–2 and partial fills of step 3): SFX + sticker fire-and-forget, NO awaited TTS, NO input block. Wrong taps on Steps 1 & 2 keep the student in flow.
- **Single-step pattern only at round boundaries**: round-equation correct (Step-3 final placement) awaits the round-complete SFX + algebraic-solve animation + dynamic TTS. This is the rewarding pause where the math gets done for the student.
- **No lives, no game-over feedback** (totalLives = 0). CASE 8 (last-life-lost) does NOT apply.
- **Idle nudges are visual-only** (no sound) — they're a gentle scaffolding signal, not a punishment.

---

## Feedback Moment Table

| Moment | Trigger | FeedbackManager call | Subtitle template | Blocks input? | Await? | What happens after |
|--------|---------|---------------------|-------------------|---------------|--------|--------------------|
| Preview audio | PreviewScreen mounts | (PART-039 owns it; uses `playDynamicFeedback({audio_content: previewAudioText})` internally) | `previewAudioText` | No (CTA visible) | No (interruptible) | Tap Start → Welcome TS |
| Round-N intro (auto) | Round_intro TS shows | `await sound.play('rounds_sound_effect', {sticker:'rounds'})` → `await playDynamicFeedback({audio_content:'Round N', subtitle:'Round N', sticker:null})` | `"Round N"` (N = currentRound) | No CTA | Yes (sequential) | Auto-advance on tap-to-dismiss |
| Round start TTS (problem read aloud) | renderRound paints | `playDynamicFeedback({audio_content: round.problemAudioText, subtitle: round.problemText.text, sticker:null}).catch(...)` — FIRE-AND-FORGET | round-specific problem text | No | No (FF) | Continue immediately |
| Step 1 right (Type A — trivial confirm) | Single name tile tap | `sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — FIRE-AND-FORGET | — | Brief (~150ms gating) | No (FF) | `loadStep(2)` |
| Step 1 right (Type B/C — preferred variable tap) | Preferred name tile tap | `sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — FIRE-AND-FORGET | — | Brief | No (FF) | `loadStep(2)` |
| Step 1 wrong (Type B/C — non-preferred tile tap) | Non-preferred name tile tap (soft wrong) | `sound.play('soft_sad', {sticker:'sad'}).catch(...)` — FIRE-AND-FORGET | misconception hint: "You can solve it this way, but picking the younger person keeps the numbers smaller. Try the other tile?" | No | No (FF) | Stay on step; student re-taps |
| Step 2 right (right tile / right piece in right slot) | Tile tap or slot-fill match | `sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — FIRE-AND-FORGET, with scale-in 200ms | — | Brief | No (FF) | If slots full + AST match → `loadStep(3)`; else partial-fill, no advance |
| Step 2 wrong (wrong tile / wrong piece) | Tile or piece flagged | `sound.play('soft_sad', {sticker:'sad'}).catch(...)` — FIRE-AND-FORGET, slot+piece flash red 600ms | misconception-tagged hint via `step2.tiles[i].misconception` or `step2.pieceMisconceptions[piece]` (see hint map below) | No | No (FF) | Stay on step; slot clears; student re-taps |
| Step 3 right (right piece in next slot, partial) | Piece tap, slot not yet final | `sound.play('soft_chime', {sticker:'celebration'}).catch(...)` — FIRE-AND-FORGET, scale-in 200ms | — | No | No (FF) | Continue placing pieces |
| Step 3 wrong (wrong piece in next slot) | Piece tap, AST mismatch | `sound.play('soft_sad', {sticker:'sad'}).catch(...)` — FIRE-AND-FORGET, slot+piece flash red 600ms | misconception-tagged hint via `step3.pieceMisconceptions[piece]` → `step3.hints[tag]` | No | No (FF) | Stay on step; slot clears; student re-taps |
| Round-equation correct (Step 3 final placement) | Step-3 slot full + AST match | (1) `progressBar.update(currentRound, lives)` FIRST → (2) `await sound.play('correct_sound_effect', {sticker:'celebration', minDuration:1500})` → (3) algebraic solve animation (~3-4s, line-by-line, tick SFX FF per line) → (4) `await playDynamicFeedback({audio_content: round.solution.successAudio, subtitle: round.solution.successSubtitle, sticker:'celebration'})` | round-specific success ("Aman is 17 now.") | YES — single-step pattern | YES (sequential) | Auto-advance to round_intro / stage_takeaway / Victory |
| Idle nudge (15 s without input on active step) | Silent timer fires | (no sound) | — | No | No | Apply `.glow-nudge` to next-correct piece/tile; fires once per step; sets `stepFirstTapDirty = true` |
| Stage 1→2 takeaway (after R3) | Round-3 round-complete handler routes here | `await sound.play('motivation_sound_effect', {sticker:'celebration'})` → `await playDynamicFeedback({audio_content:'Time-shifts add or subtract from every age in the room.', subtitle: same, sticker:'celebration'})` | `"Time-shifts add or subtract from every age in the room."` | No CTA | Yes (sequential) | Tap-to-dismiss → Round-4 intro TS |
| Stage 2→3 takeaway (after R7) | Round-7 round-complete handler routes here | `await sound.play('motivation_sound_effect', {sticker:'celebration'})` → `await playDynamicFeedback({audio_content:'Notice how picking the younger person as x kept the numbers small.', subtitle: same, sticker:'celebration'})` | `"Notice how picking the younger person as x kept the numbers small."` | No CTA | Yes (sequential) | Tap-to-dismiss → Round-8 intro TS |
| Victory | endGame(true) after R10 | Screen first → `postMessage({type:'game_complete'})` → `await sound.play('victory_sound_effect', {sticker:'celebration'})` → `await playDynamicFeedback({audio_content:'Victory! You translated all 10 problems.', subtitle:'You translated all 10 problems!', sticker:'celebration'})` | per-star-tier dynamic | CTA visible | Yes (sequential, CTA interrupts via `sound.stopAll()`) | "Claim Stars" → Stars Collected; "Play Again" (if stars<3) → restart |
| Stars Collected | Claim Stars tap | `onMounted: await sound.play('sound_stars_collected', {sticker:'celebration'})` → `postMessage({type:'show_star'})` → `setTimeout(showAnswerCarousel, 1500)` | — | No (no buttons) | Yes (in onMounted) | After ~1500ms → AnswerComponent reveal |
| AnswerComponent revealed | `showAnswerCarousel()` | (no per-slide audio; component is silent) | — | No | No | Player paginates 10 slides at own pace; tap Next → `next_ended` |
| Pause (tab hidden) | `visibilitychange → hidden` | `FeedbackManager.sound.pauseAll()` | — | (overlay shown by VisibilityTracker) | — | On resume: `FeedbackManager.sound.resumeAll()` |
| Audio failure | any audio call rejects | try/catch swallows | — | — | — | Visual feedback (green tick, red flash, glow, sticker) still renders. Game continues. CASE 16. |

(NO CASE 8 / Last life wrong — totalLives = 0, this path never fires. NO Game Over moment.)

---

## Subtitle Examples (3 concrete examples per type)

### Round-equation correct (round-specific success TTS)

1. Type A, Round 1 (`A_r1_aman_past`):
   - subtitle: `"Aman is 17 now."`
   - audio_content: `"Aman is seventeen now."`
2. Type B, Round 4 (`A_r4_mira_brother`):
   - subtitle: `"Mira is 11 and Ravi is 14."`
   - audio_content: `"Mira is eleven and Ravi is fourteen."`
3. Type C, Round 8 (`A_r8_anita_bobby_future`):
   - subtitle: `"Bobby is 7 now, Anita is 14."`
   - audio_content: `"Bobby is seven now, and Anita is fourteen."`

### Step wrong (misconception hints)

1. `time-shift-direction-flip`: `"Five years AGO means subtract 5, not add 5. Try a different operator."`
2. `sign-error-younger-confused-with-older`: `"Sara is OLDER than Ravi, so her age is x + 4, not x − 4."`
3. `time-shift-omission`: `"In 6 years, both ages go up by 6. Did you add 6 to BOTH?"`

### Stage takeaway VO

1. After R3: `"Time-shifts add or subtract from every age in the room."`
2. After R7: `"Notice how picking the younger person as `x` kept the numbers small."`
3. (only two stage takeaways exist; no third)

### Victory VO

1. 3⭐: `"Victory! All 10 problems translated, almost every step on the first try. Brilliant analysis."`
2. 2⭐: `"Victory! You translated all 10 problems. Plenty of first-try wins — keep that momentum."`
3. 1⭐: `"Victory! You finished all 10 problems. Translation is hard — every wrong tap was a chance to learn."`

(Build emits the per-tier VO via a `getVictoryVO(stars)` helper; the `subtitle` mirrors the audio_content with cleaner text for the on-screen caption.)

---

## Misconception → hint map (used at every wrong-tap)

| Misconception tag | Hint copy |
|---|---|
| `time-shift-direction-flip` | "{k} years AGO means subtract {k}, not add {k}. Try a different operator." (or the reverse for future) |
| `time-shift-wrong-delta` | "The problem says {k1} years ago, not {k2}. Pick the right number." |
| `time-shift-omission` | "In {k} years, both ages go up by {k}. Did you add {k} to BOTH?" |
| `sign-error-younger-confused-with-older` | "{name} is OLDER than {other}, so {name}'s age is x + {k}, not x − {k}." |
| `operation-mismatch` | "Sum tells us to add, not multiply. Look at the operator pieces again." (template varies by operator) |
| `distractor-number-confusion` | "That number isn't in the problem — pick a number you can read in the sentence." |
| `variable-choice-suboptimal` | "You can solve it this way, but picking the younger person keeps the numbers smaller. Try the other tile?" |

The hint copy is templated per round (with `{k}`, `{name}`, `{other}` substituted from the round's `step2.tiles[]`, `step3.pieceMisconceptions`, and `people[]`). Each round's `step{2,3}.hints` map carries the fully-substituted strings.

**Hint priority (when multiple misconceptions could apply to a single wrong piece in Step 3):**
`time-shift-omission > sign-error-younger-confused-with-older > time-shift-direction-flip > operation-mismatch > distractor-number-confusion`.

The runtime reads `step3.pieceMisconceptions[piece]` (a single tag per piece, pre-baked per round) — the priority is encoded at content-authoring time, NOT computed at runtime.

---

## Animations

| Animation | Trigger | CSS class | Duration |
|-----------|---------|-----------|----------|
| Green tick | Right tap on tile (Step 1, Step 2 directionTiles) | `.selected-correct` | 400ms |
| Scale-in piece | Right piece tap (Steps 2 & 3 pieceBank) | `.piece-scale-in` | 200ms |
| Red flash + shake | Wrong tap (any step) | `.selected-wrong .shake-wrong` | 600ms (3 cycles of 200ms) |
| Soft glow nudge | 15s idle on active step | `.glow-nudge` | 1500ms ease-in-out infinite alternate |
| Per-piece celebration glow propagate | Round-equation correct | `.celebrate-glow-propagate` | 600ms staggered (100ms per piece) |
| Algebraic solve line fade-in | Solve animation | `.solve-line-fadein` | 600ms per line |
| Captioned-age bubble pop | After final solve line | `.captioned-bubble-pop` | 400ms |
| Stage takeaway sticker bob | TS onMounted | `.sticker-bob` | 800ms |
| Victory star pop | Star earned | `.star-earned` | 400ms (staggered 200ms per star) |
| Fade in (round transition) | renderRound paints | `.fade-in` | 350ms |
| Step UI fade in | loadStep(2/3) | `.fade-in` | 350ms |

(NO heart-break animation — no lives. NO score-bounce — score chip uses a simple text update, the first-tap chip uses `.first-tap-chip-bump` 200ms.)

---

## Wrong Answer Handling

- **Show correct answer:** NO at step level (the student must re-tap). YES at round-equation level (the algebraic solve animation reveals the canonical equation regardless of how many wrong taps occurred during the round).
- **Misconception-specific feedback:** YES — every wrong tap renders a tag-keyed hint string from `round.step{2,3}.hints[tag]`. NEVER a generic "try again."
- **Failure recovery:** No game-level recovery (no lives). At step level: 3+ consecutive wrong taps on the same step DO NOT trigger any UI escalation in v1. (Future iteration could add a "Tap the glowing piece" softer-language follow-up after 3 wrong taps; out of scope per creator brief.)
- **Idle nudge as soft scaffolding:** the 15 s glow on the next-correct piece is the gentle path forward when the student is stuck. NO sound, NO blocking, single fire per step.
- **Soft wrongs (Step 1 Type B/C):** the non-preferred-variable tap is treated as a "soft wrong" — same red flash + sad SFX + hint, but the student CAN proceed by tapping the other tile (the equation is still solvable in the preferred-variable form which the build pins).

---

## Emotional Arc Notes

- **Stage 1 (Rounds 1–3):** the warm-up. Most students get all 9 step-decisions on the first tap. The 3-step structure is intentionally consistent across all stages so by Round 4 the structure is familiar and the student can focus entirely on the new content (real variable choice). Step-1 in Type A is a "free win" — the trivial single-tile confirmation contributes a free first-tap-correct point. This is intentional warm-up generosity.
- **Stage 2 (Rounds 4–7):** the meat. Real variable choice + real expression construction. The `variable-choice-suboptimal` soft-wrong is the tightest pedagogical moment — it's the *only* place where "you can keep going but we'd rather you didn't" is the message. The hint phrasing is calibrated to be encouraging, not corrective.
- **Stage 2→3 takeaway:** the system explicitly rewards meta-cognition: "picking the younger person kept the numbers small" — this is a *strategy* observation, not a content one. It matters because Stage 3 will punish the student who picks the older person (numbers blow up).
- **Stage 3 (Rounds 8–10):** the stretch. Time-shift-omission is the most common error here (per pedagogy.md L4 priors for word-problem translation). The reminder banner above Step 3 is a free scaffold — the student does NOT lose the first-tap point for "remembering" the time-shift, but DOES lose it for omitting the time-shift in the assembled equation. This delineates the *recall* (banner) from the *application* (equation).
- **Algebraic solve animation:** this is the emotional reward beat. The math gets DONE for the student — the line-by-line transformation visualises that "you set up the right equation; the rest is mechanical." Captioned ages with TTS close the loop emotionally ("Aman is 17 now") — the abstract `x` becomes a real age, in a real person's name.
- **AnswerComponent carousel:** review without judgment. Ungated by accuracy. The student sees the canonical setup for *every* round, so even rounds they aced get their canonical form reinforced. The 1-line explanation per slide is the takeaway — it's what they should remember tomorrow.
- **0⭐ never appears in-app.** It's reserved for browser-level abandonment, which the runtime cannot show feedback for. The 1⭐ floor for completion preserves emotional safety: every student who finishes gets at least one star.
