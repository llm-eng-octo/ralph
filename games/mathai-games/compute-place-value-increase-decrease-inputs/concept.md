# Up and Down — The Place-Value Change Detective

## In one line
A timed mental-math game where the student stares at two four-digit numbers, works out how much went *up* in some places and *down* in others, and types both deltas into two side-by-side input fields before the 40-second timer runs out.

## Who it's for
Class 4–5 students (ages ~9–11) who already know what a "thousands" or "hundreds" digit is when you point at it, but who freeze when asked something like *"How does 2006 become 2024?"* and reach for column subtraction. The game is for the student who thinks of place value as a column-counting trick rather than a way of seeing numbers as bundles, and who has no instinct yet for *changing* a number by adjusting one place at a time.

## What it tries to teach
The whole game is built around one fluid skill: **decomposing a change between two numbers into independent place-value adjustments**, mentally and quickly.
Three threads inside that:
- **See places, not digits.** When 2006 becomes 2024, the *6* didn't change to *24* — the ones place dropped from 6 to 4 (a decrease of 2) and the tens place rose from 0 to 2 (an increase of 20, not 2). Students learn to read each column independently and weigh it as its full place-value (a 2 in the tens place is *twenty*, not *two*).
- **Separate increase from decrease.** Real changes between numbers usually involve both directions. The game's two input fields — one labeled "increased by", one "decreased by" — force the student to commit to *which* places went up and *which* went down, instead of mashing them into a single signed answer.
- **Mental, not paper.** Forty seconds is enough for an unhurried mental scan but not enough to set up a column subtraction with carries and borrows. The constraint pushes the student into the cleaner, faster strategy by making the slow one impossible.

## What the player sees and does
A soft cream header bar sits at the top: a small tutor avatar, the round badge ("Q1"), and a chunky blue countdown timer reading **00:40** that ticks downward. On the right, the rolling star tally (`0/10`) and a yellow star icon.

Below the header, two short instruction lines: *"What is the **total change** from the given number to the new number?"* and *"You get **40 seconds** to answer. Calculate the answer mentally!"*

The body is the math, laid out as two stacked tiles:

- **Given number** — the label sits above a horizontal row of four cream squares, each holding one big purple digit: `2 0 0 6`. The squares are slightly separated, so the eye sees four places, not one number.
- **New number** — same layout below: `2 0 2 4`. Side by side with the first, the student can scan column by column.

Beneath both numbers, a third label: *"Write the total change here"*. Then two answer rows:

- **`2006 increased by`** [empty input box]
- **`and decreased by`** [empty input box]

The tiny phrasing matters — the labels remind the student which number they're transforming, and force them to think *up first, then down*.

- **Type the right pair** (e.g. `20` and `2`) and tap submit → both boxes turn green, a quick chime plays, the round badge ticks up, and the timer freezes.
- **Type the wrong pair** → the wrong box(es) turn red, a heart shatters, the correct values flash green for a beat, and a one-line nudge appears: *"The tens went **up** by 20 (from 0 to 20), and the ones went **down** by 2 (from 6 to 4)."*
- **Run out of time** → both boxes dim, the correct values pulse green, a heart shatters, the round ends.

## Shape of the experience
5 rounds, gradually trickier:

- **Rounds 1–2 — One direction only.** Pure-increase or pure-decrease changes (e.g. *2006 → 2026*: increase by 20, decrease by 0). The student feels how the form works without the dual-direction twist.
- **Rounds 3–4 — Mixed direction, single column each.** One column goes up, one goes down, never the same column (e.g. *2006 → 2024*: tens up 20, ones down 2). This is the heart of the skill.
- **Round 5 — Two-place adjustments.** Two columns may move in the same direction or in opposite directions, including across thousands and hundreds (e.g. *4380 → 4126*: hundreds down 200, tens down 50, ones up 6). The student must hold two simultaneous deltas in their head.

Three hearts carry across the whole 5-round session.

## Win condition and stars
Stars are earned per round, then summed:
- **3 stars** — both inputs correct on first submit, with at least 15 seconds left on the clock.
- **2 stars** — both inputs correct on first submit, but slower than 25 seconds taken.
- **1 star** — finished the round eventually, even after a wrong submit.
- **0 stars** — round ended on a heart loss or timeout with no correct submit.

The session ends when either all 5 rounds are complete or all 3 hearts are lost. Final tally is displayed out of 15.

## Feel and motivation
- **The two boxes are the trick.** Splitting "increase" and "decrease" into separate inputs is what makes the game pedagogical rather than a glorified subtraction drill. A student who tries to compute `2024 − 2006 = 18` will try to type `18` and get stuck — there is nowhere to put it. The form quietly forces the right strategy.
- **Place-value colour cues.** The four digit tiles in the given and new numbers are aligned column by column on the screen, so the student can sweep their eye top-to-bottom and *see* which places changed without doing arithmetic. This is the visual companion to the mental skill.
- **Numbers stay friendly.** Digit changes are always within a single place (no borrowing across columns), the four-digit numbers stay round-ish (lots of zeros), and no digit changes by more than a small amount. The game is about *which place* and *which direction*, not about big mental arithmetic.

## Why it works pedagogically
Most students learn place value as a labeling exercise — point at the 7 in 274, say "tens", get a sticker. They don't learn to *operate* on places. This game treats place value as a tool for transformation: you change a number by reaching into one column at a time and moving it. That mental model is the foundation for column addition, column subtraction, rounding, estimation, and the whole next two years of arithmetic. By forcing students to articulate the change in two channels (up and down) instead of one (a signed difference), the game makes their place-value thinking visible and gradeable. A 5-round session takes 3–4 minutes; doing it three times a week for a fortnight visibly cleans up sloppy column subtraction in the rest of a child's homework.
