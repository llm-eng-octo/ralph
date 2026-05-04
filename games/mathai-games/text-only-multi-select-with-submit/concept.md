# All The Right Ways — The Equivalent Expressions Picker

## In one line
A multi-select game that shows a target sum like `7 + 8` and asks the student to tap *every* expression that secretly equals it — `8 + 8 − 1`, `7 + 7 + 1` — while leaving the impostors untapped, then commit with a single Submit button.

## Who it's for
Class 2–3 students (ages ~7–9) who have memorised most of their addition facts up to ten but stall on near-doubles like `7 + 8` or `6 + 7`. The skill the game targets is exactly the fluency move every Class-2 textbook eventually preaches: *"if you know `7 + 7`, then `7 + 8` is just one more."* Students learn this rule as a sentence; the game lets them feel it as a click.

## What it tries to teach
The whole game is about **recognising that one addition fact can be rewritten as a near-double, and trusting which way to bend the extra**.
Three threads:
- **Doubles as anchors.** `7 + 7 = 14` and `8 + 8 = 16` are facts most students at this age have. Near-doubles like `7 + 8` are not memorised — they're *constructed* from the doubles. The game makes that construction explicit by laying both anchor doubles side by side and asking the student to pick the right adjustment.
- **The +1 / −1 hinge.** `7 + 8 = 7 + 7 + 1` and `7 + 8 = 8 + 8 − 1` are *both* valid. The student must hold this dual representation in mind. The decoys (`7 + 7 − 1`, `8 + 8 + 1`) are the same expressions with the wrong adjustment, designed to expose any student who treats the rule as pattern-matching rather than understanding.
- **The "all of the above" muscle.** Multi-select is hard for young learners. Most school assessments train them to find *the* answer; this game retrains them to find *every* correct answer and stop only when none remain. That metacognition — *"I should keep looking even though I found one"* — is the secret pedagogical goal.

## What the player sees and does
A clean, calm panel. At the top, a status strip — round badge `Q1`, a friendly avatar, a heart icon with the lives count `2`, and the running star tally `0/10`. Below the strip, the instruction in plain body text: *"Select all the options that will help you find the sum of **7 + 8**."* The target expression is bolded so the student's eye locks onto it before drifting down.

The body of the screen is four full-width white tiles, stacked vertically with comfortable spacing — `7 + 7 + 1`, `8 + 8 + 1`, `7 + 7 − 1`, `8 + 8 − 1`. Each tile reads like a small flashcard. Tapping a tile toggles a soft yellow border around it, marking it as selected. Tapping again deselects.

A bright yellow **Submit & check** button anchors the bottom of the screen — it stays inactive (no glow) until at least one tile is selected.

- **Tap a tile** → it toggles between selected (yellow border) and unselected (grey border). No sound on individual taps; the screen waits for the student to commit.
- **Hit Submit with the exact correct set** → all chosen tiles turn green, the impostors stay grey, a chime plays, the round ticks up.
- **Hit Submit with a wrong set** (missed a correct, or included an impostor) → the wrong tiles flash red briefly, the correct set is revealed in green, a heart shatters, and the round ends. No partial credit.
- **Submit with nothing selected** → the button gives a soft refusal-buzz and a one-line nudge: *"Pick at least one option before submitting."*

## Shape of the experience
10 rounds, ramping in three small steps:

- **Rounds 1–3 — Single anchor.** The target is a near-double like `5 + 6`. Three of the four tiles are constructed from the *same* anchor double (`5 + 5 + 1`, `5 + 5 − 1`, `5 + 5 + 2`); only one is correct. The student learns to read the adjustment.
- **Rounds 4–7 — Both anchors live.** Targets like `7 + 8` where two of the four tiles are correct (`7 + 7 + 1` and `8 + 8 − 1`) and two are decoys. The student stops searching too early at their peril.
- **Rounds 8–10 — Stretch.** Targets like `8 + 9` or `6 + 8` where the gap is two, *or* an extra correct tile in a non-near-double form (e.g., `10 + 7` for the target `9 + 8`). The student must recognise equivalences beyond the textbook rule.

## Win condition and stars
A run is 10 rounds with 3 lives. Stars are based on the count of fully-correct rounds (every correct tile selected, no decoys):
- **3 stars** — 9 or 10 rounds fully correct.
- **2 stars** — 6–8 rounds fully correct.
- **1 star** — completed the 10 rounds with at least one fully-correct round.
- **0 stars** — all 3 lives lost before round 10.

A wrong submission costs a heart but the round still counts as "answered" — the student sees the right answer and moves on. There's no retry-this-round mechanic; this is deliberate — the discomfort of a wrong submit is what makes the student look harder before committing next time.

## Feel and motivation
- **Tiles look like cards, not buttons.** The visual language is "evidence to weigh", not "button to press". This nudges the student to consider every option rather than slapping the first plausible one.
- **Submit is the only confirming action.** There is no auto-advance on selection — the student is forced into a deliberate "I am done thinking" tap. This is the metacognitive habit being trained.
- **Decoys are diagnostic.** A student who consistently picks `7 + 7 − 1` for the target `7 + 8` is misremembering "near-doubles need adjustment in the direction of the larger number". A teacher who watches the gauge sees that mistake as a pattern, not a one-off slip, and can target a single 5-minute mini-lesson at it.

## Why it works pedagogically
The traditional classroom version of this skill is a worksheet that asks *"Use a near-double to find 7 + 8"* — an open prompt that lets students slip past the rule by computing `15` directly and writing `14 + 1` after. This game flips the cognitive direction: the student is forced to *recognise* the near-double, in someone else's handwriting, while ignoring lookalikes. That recognition-from-noise task is closer to how the skill actually shows up in mental arithmetic — when a child sees `7 + 8` in the wild, they have to find the near-double pattern themselves, not be told to use it. Ten rounds, three minutes; small but pointed practice on a real bottleneck.
