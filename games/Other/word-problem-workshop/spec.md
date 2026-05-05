# Game Design: Word Problem Workshop

## Identity

- **Game ID:** word-problem-workshop
- **Title:** Word Problem Workshop
- **Class/Grade:** Class 3-5
- **Math Domain:** Number Operations — Addition and Subtraction (+, −)
- **Topic:** Creating word problems from math expressions
- **Bloom Level:** L5 Create
- **Archetype:** Custom (No-Penalty Explorer + Subjective Evaluation variant)

## One-Line Concept

Student sees a math expression and must speak or type a real-world word problem that matches it — an AI rubric grades the response on correctness and relevance, rewarding open-ended creative construction of meaning.

## Target Skills

| Skill                   | Description                                                                | Round Type |
| ----------------------- | -------------------------------------------------------------------------- | ---------- |
| Word problem creation   | Construct a meaningful real-world scenario that matches a given expression | All rounds |
| Operation understanding | Demonstrate deep understanding of what + and − mean in context             | All rounds |
| Multi-step reasoning    | Combine multiple operations into one coherent story (Rounds 2-3)           | R2, R3     |

## Core Mechanic

**Interaction Patterns:** P17 Voice Input (primary) + P7 Textarea (fallback when mic unavailable or user prefers typing) → Subjective Evaluation (`MathAIHelpers.SubjectiveEvaluation.evaluate`) scores the response on a 3-tier rubric.

### Type A: "Expression → Word Problem" (used in all 3 rounds)

1. **Student sees:** A math expression prominently displayed (e.g., `5 + 3 = 8`), a round prompt ("Make up a story that matches this expression"), a voice-record button, a text field (always visible as an alternate), and a **Submit** button.
2. **Student does:**
   - Tap-and-hold the mic button to speak OR type directly into the text field.
   - Voice input streams through the platform's speech-to-text. Text appears in the field as the student speaks and is editable before submit.
   - Tap **Submit** to have the answer evaluated.
3. **What counts as correct:** LLM rubric classifies response into one of three tiers:
   - **Correct (3 pts, advances to next round):** Story uses all numbers from the expression in the right roles, correct operation(s) are represented, narrative produces the stated total/result.
   - **Partial** — story is close but not quite right; no points awarded, **1 life lost**, student retries the same round.
   - **Incorrect** — story doesn't match; 1 life lost, student retries the same round.
4. **What feedback plays:** Spoken feedback via `FeedbackManager.playDynamicFeedback()` — warm, encouraging, rubric-aware (never shaming). For partial and incorrect tiers, the feedback **must concretely name WHY the answer is off** (which number is wrong, which operation is missing, what total doesn't match) and give a one-line nudge on how to fix it — no vague cliffhangers.

## Rounds & Progression

3 rounds — exactly one round per stage — to keep the game short and creative (the open-ended cognitive load per round is high).

### Stage 1: Single Operation (Round 1)

- One operation, small whole numbers.
- Addition chosen as the canonical Round 1 because it carries the widest range of familiar contexts (combining, joining, receiving).

### Stage 2: Two-Step Expression (Round 2)

- Two operations (+ and −) combined without parentheses.
- Student must weave both operations into one coherent story.

### Stage 3: Multi-Step / Compound Expression (Round 3)

- A compound expression with grouping (only + and −) that describes two sub-scenarios composed into one.
- Requires describing two separate sub-problems within a single unified scenario.

| Dimension            | Stage 1 (R1)            | Stage 2 (R2)            | Stage 3 (R3)                       |
| -------------------- | ----------------------- | ----------------------- | ---------------------------------- |
| Operations per round | 1 (+)                   | 2 (+ and −)             | 3 (with grouping)                  |
| Number complexity    | Small (single-digit)    | Small-medium            | Medium, with grouping              |
| Cognitive demand     | Translate one operation | Sequence two operations | Compose two sub-scenarios into one |

## Game Parameters

- **Rounds:** 3
- **Timer:** None
- **Lives:** 3 (deducted on partial AND incorrect answers; correct does not deduct)
- **Star rating:** 3★ = all 3 rounds solved (9 pts), 2★ = 2 rounds solved (6 pts), 1★ = 1 round solved (3 pts), 0★ = 0 rounds solved (game over before any round). Max possible = 9 pts.
- **Input:** Voice (primary via P17) or typed text (P7 textarea — always visible as fallback)
- **Feedback:** `FeedbackManager.playDynamicFeedback()` with dynamic rubric-aware narration + on-screen written evaluation

## Scoring

- **Points per round:** 3 pts awarded only on a correct answer. Partial and incorrect award 0 pts and keep the student on the same round.
- **Max total:** 9 pts.
- **Star thresholds (exact):** 3★ = 9 pts, 2★ = 6 pts, 1★ = 3 pts, 0★ = 0 pts. Score is always a multiple of 3 (only correct answers earn points).
- **Lives:** 3. Both **partial** and **incorrect** answers cost 1 life; only **correct** answers do not. Lives = 0 → Game Over.
- **Partial credit:** No partial credit — partial answers earn 0 pts, cost 1 life, but let the student retry the same round with concrete feedback on what was wrong.

## Flow

**Shape:** Multi-round (default) + customizations

**Changes from default:**

- Correct answers advance; partial and incorrect answers retry the same round. Only incorrect costs a life.
- Lives branch **restored**: the "incorrect AND lives = 0 → Game Over" path is active. An incorrect answer decrements lives by 1 (floor 0). Partial and correct answers leave lives untouched; only correct advances to the next round (or to Victory on R3). If an incorrect answer drops lives to 0 on any round (including R1), the game transitions to a Game Over screen with a single "Retry" button. The default multi-round flow diagram below still applies; the game-over branch fires only when lives reach 0 after an incorrect answer.
- Feedback screen duration extended (~4-6s) to accommodate the spoken rubric explanation and give the student time to read the 1-line suggestion.

```
┌──────────┐  tap   ┌──────────┐  tap   ┌──────────────┐  auto   ┌────────────┐
│ Preview  ├───────▶│ Welcome  ├───────▶│ Round N      ├────────▶│ Game       │
│          │        │ (trans.) │        │ (trans.,     │ (after  │ (round N)  │
│ 🔊 prev  │        │ 🔊 welc. │        │  no buttons) │  sound) │ 🔊 prompt  │
│   audio  │        │    VO    │        │ 🔊 "Round N" │         │    / TTS   │
└──────────┘        └──────────┘        └──────────────┘         └─────┬──────┘
                                                ▲                      │ student
                                                │                      │ speaks/types +
                                                │                      │ submits
                                                │                      ▼
                                                │            ┌──────────────────────┐
                                                │            │ Feedback (4-6s, on   │
                                                │            │ same game screen)    │
                                                │            │ 🔊 dynamic rubric VO │
                                                │            │ shows evaluation +   │
                                                │            │ 1-line suggestion    │
                                                │            └─────────┬────────────┘
                                                │                      │
                                         more rounds?  ────YES──────── │
                                                │                      │
                                                │                     NO
                                                ▼                      ▼
                                      (loops to Round N+1)    ┌────────────────────┐
                                                              │ Victory (status)   │
                                                              │ 1–3★               │
                                                              │ 🔊 game_victory →  │
                                                              │   vo_victory_      │
                                                              │   stars_N          │
                                                              └──────┬─────┬───────┘
                                                  "Play Again"       │     │ "Claim Stars"
                                                  (only if 1–2★)     ▼     ▼
                                                   ┌──────────────────┐  ┌──────────────────────┐
                                                   │ "Ready to        │  │ "Yay, stars          │
                                                   │  improve your    │  │  collected!"         │
                                                   │  score?"         │  │ (trans., auto,       │
                                                   │ (trans., tap)    │  │  no buttons)         │
                                                   │ 🔊 motivation VO │  │ 🔊 stars-collected   │
                                                   │ [I'm ready]      │  │    sound + ✨        │
                                                   └────────┬─────────┘  └──────────┬───────────┘
                                                            │ tap                   │ auto
                                                            ▼                       ▼
                                                   restart from Round 1           exit
                                                   (skips Preview + Welcome)
```

Retry paths:

- **Play Again** after Victory with fewer than 3★ — routes through "Ready to improve your score?" and restarts from Round 1 (skips Preview + Welcome).
- **Claim Stars** after any Victory — routes through "Yay, stars collected!" and exits after the star animation.

## Feedback

| Event                                 | Behavior                                                                                                                                                                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correct answer (3 pts)                | Green checkmark, confetti, `playDynamicFeedback` with warm praise that names what the student did well. Written evaluation below submit area. Advances to next round.                                      |
| Partial answer (retry, 1 life lost)   | Amber check, feedback audio that **names exactly what is off** (wrong total, missing operation, misused number) and gives one concrete fix. Input clears, student retries the same round. 1 life deducted. |
| Incorrect answer (retry, 1 life lost) | Gentle feedback that **names exactly why the story does not match** the expression and points at the right approach. 1 life deducted. Input clears, student retries the same round (if lives > 0).         |
| Incorrect + lives=0                   | Lives drop to 0 → Game Over transition → Retry button → restartGame.                                                                                                                                       |
| Last round complete                   | 2s pause → Victory screen. `sound_game_victory` → `vo_victory_stars_N` based on total.                                                                                                                     |
| Lose last life                        | Game Over transition screen; sticker=neutral; soft sound; single "Retry" button → restartGame                                                                                                              |
| Submit empty                          | Inline message "Tell me your story first!" — no API call, no attempt recorded.                                                                                                                             |
| Mic permission denied                 | Auto-fall back to textarea. Inline tip: "You can type your story instead."                                                                                                                                 |
| Evaluation API failure                | Generic "Couldn't evaluate — try once more." Submit button re-enables. No attempt recorded. Per subjective-evaluation SKILL constraint 4.                                                                  |

## Content Structure (fallbackContent)

**Top-level spec fields:**

- `previewScreen: true` (default — PART-039 preview enabled)
- `previewInstruction` — HTML shown on preview overlay
- `previewAudioText` — plain text for TTS narration at deploy time
- `showGameOnPreview: false`

```js
const fallbackContent = {
  previewInstruction:
    "<p><strong>Make up a story for the math!</strong></p><p>You'll see a math expression. Your job: tell a short real-world story that matches it. You can <strong>speak</strong> or <strong>type</strong>, then tap <strong>Submit</strong>.</p>",
  previewAudioText:
    'In this game, you will see a math expression. Your job is to make up a short real-world story that matches it. You can speak your story or type it, then tap submit. Ready?',
  previewAudio: null, // filled at deploy time by TTS pipeline
  showGameOnPreview: false,
  // hint + exemplar retained as data for future reuse; no in-game scaffolding buttons exposed.
  rounds: [
    {
      round: 1,
      stage: 1,
      type: 'A',
      expression: '5 + 3 = 8',
      prompt: 'Make up a story that matches this expression.',
      rubric:
        'A correct answer is a 1-3 sentence real-world story that (a) introduces a quantity of 5, (b) adds 3 more of the same kind of thing, and (c) arrives at a total of 8. Partial credit if the story uses addition with 5 and 3 but the final total is wrong or missing. Incorrect if the story uses the wrong operation (e.g., takes away), uses wrong numbers, is gibberish, or is empty.',
      exemplar: 'Aarav had 5 mangoes. His friend gave him 3 more. Now he has 8 mangoes in total.',
      hint: 'Think about a situation where someone starts with something and then gets more of the same thing.',
      misconception_tags: {
        uses_subtraction: 'operation-reversal',
        wrong_total: 'computation-error',
        ignores_numbers: 'partial-application',
      },
    },
    {
      round: 2,
      stage: 2,
      type: 'A',
      expression: '10 + 5 - 3 = 12',
      prompt: 'Make up one story that matches this two-step expression.',
      rubric:
        'A correct answer is a 2-4 sentence real-world story where (a) a starting amount of 10 is increased by 5 (so it is combined or joined with 5 more), (b) then 3 are removed (given away, taken, used up, etc.), and (c) the story arrives at a final total of 12. Partial credit if addition and subtraction both appear but one step is off (wrong number, wrong direction, or missing final total). Incorrect if only one operation is represented, operations are reversed, or the story is off-topic/empty.',
      exemplar:
        'Priya had 10 stickers. Her cousin gave her 5 more, making 15. Then she gave 3 to her friend. Now she has 12 stickers.',
      hint: 'Try a story where someone starts with 10 things, then gets 5 more (that is the +), and then gives 3 away or uses 3 up (that is the −).',
      misconception_tags: {
        only_one_operation: 'partial-application',
        reversed_subtraction: 'operation-reversal',
        wrong_total: 'computation-error',
      },
    },
    {
      round: 3,
      stage: 3,
      type: 'A',
      expression: '(12 + 8) - (4 + 3) = 13',
      prompt:
        'Make up one story that matches this compound expression. Both groups should belong to the same scenario.',
      rubric:
        'A correct answer is a 2-5 sentence real-world story where (a) one sub-scenario produces 12 + 8 = 20 of something (two amounts combined), (b) a related sub-scenario in the same story produces 4 + 3 = 7 of a comparable thing that is then taken away or subtracted from the first amount, and (c) the story arrives at a total of 13. Partial credit if both sub-sums appear but the story reads as two unrelated problems stapled together, or the final total is missing/wrong. Incorrect if only one sub-sum is represented, if the student ignores the grouping or subtraction, or if the story is off-topic/empty.',
      exemplar:
        'A class collected 12 red balls and 8 blue balls, which makes 20 balls in total. During recess, 4 balls rolled away and 3 were lost in the grass, losing 7 balls. Now the class has 13 balls left.',
      hint: 'Think of one scene where two amounts are joined into one total, and then two other amounts are lost or taken away together. Add the first two, add the second two, then subtract.',
      misconception_tags: {
        only_one_group: 'partial-application',
        unrelated_subscenarios: 'multi-step-coordination',
        wrong_grouping: 'order-of-operations',
        wrong_total: 'computation-error',
      },
    },
  ],
};
```

## Defaults Applied

- **Input (voice vs text):** defaulted to **voice primary, textarea fallback** (creator said "voice or typed" without specifying primacy; voice is the pedagogically distinctive choice for a "Create" task).
- **Timer:** defaulted to **None** (creator specified None — recorded here for traceability).
- **Feedback style:** defaulted to **`FeedbackManager.playDynamicFeedback()` with rubric-aware dynamic narration** (creator said "AI evaluates" but did not specify feedback delivery).
- **Star thresholds (exact values):** defaulted to **3★=7-9, 2★=4-6, 1★=1-3** (creator specified percentage-style thresholds that were inconsistent with the new 3-round, 9-point max; recomputed to match).
- **Grade range:** defaulted to **Class 3-5** (creator specified — recorded for traceability).
- **Preview screen:** defaulted to **enabled** (PART-039 default — game is new to the student and benefits from the up-front instruction).
- **Preview audio text:** drafted based on the one-line concept; finalized at deploy time by TTS pipeline.

## Warnings

- **WARNING: Bloom L5 Create is outside the canonical L1-L4 pedagogy lookup.** Platform pedagogy defaults are defined for L1-L4. For L5, the spec uses feedback that is rubric-aware and non-shaming (closest to L4 Analyze behavior). Creator has confirmed L5 is intended. If the platform later constrains to L1-L4, relabel as L4 Analyze.
- **WARNING: 3 rounds is below the typical 5-12 round range.** Intentional for an open-ended Create task (each round has high cognitive load). Session length will feel short (~3-6 minutes). Acceptable given the task type.
- **WARNING: Voice input (P17) requires mic permission.** Graceful fallback to textarea is mandatory; if denied, the game must continue in text-only mode without blocking the student.
- **WARNING: Subjective evaluation is non-deterministic and has a per-round LLM cost.** With 3 rounds this is acceptable, but gauge analytics must log `validationType: 'llm'` so the cost-per-play can be tracked. Retry-until-correct means total LLM calls per play are unbounded (capped only by lives + number of partials).
- **WARNING: The retry-until-correct loop means a stuck student can repeatedly burn lives on one round.** With 3 lives and 3 rounds, worst case is game over on the first round after 3 incorrect attempts. Consider whether this is the intended difficulty for Class 3-5 creative tasks.
