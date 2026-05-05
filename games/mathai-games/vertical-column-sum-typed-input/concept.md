# Tower Sum — The Vertical Column Adder

## In one line
A timed mental-addition game where six small numbers are stacked vertically in a tidy tower and the student must total them and type the answer into a single input — no grouping hint, no scratch space, just the column and the clock.

## Who it's for
Class 3–4 students (ages ~8–10) who can add two-digit numbers but freeze when they see more than three numbers in a column. They've memorised number bonds to 10 but haven't yet trained the *running-total* skill — the discipline of holding a partial sum in working memory while adding the next number. The game targets the precise moment when addition stops being a single bond lookup and starts being a multi-step accumulation.

## What it tries to teach
The whole game is built around one quiet but high-leverage skill: **summing a vertical list of single- and small-two-digit numbers in your head, fast and accurately.**
Three threads inside that:
- **Running totals.** With six numbers in the tower, the student can't keep them all in working memory simultaneously. They have to add the first two, hold that sum, add the third, hold the new sum, and so on. The game forces this discipline by hiding any sub-totalling space.
- **Pairing for tens.** The numbers are deliberately seeded so that two of them often pair to a friendly total (`4 + 6`, `7 + 3`). Students who spot pairs solve in seconds; students who don't grind through linearly. Over 10 rounds, the pairing strategy gets reinforced through speed difference alone.
- **Trusting your answer.** The input field accepts any number — there are no decoys, no multiple choice. The student must commit. That commitment under time pressure is the actual goal: a child who *can* add but second-guesses themselves loses the time war.

## What the player sees and does
A clean white panel. At the very top, the usual thin status row — but with one important addition: a large, bold **`00:44`** countdown timer in blue at the centre, ticking down throughout the round. Round badge sits to the left, hearts and star tally to the right.

Below the header, one short instruction: *"Find the sum of all the numbers"*.

The body of the screen is the tower: six small white boxes stacked vertically, each holding one number (`4`, `6`, `7`, `8`, `9`, `11` in the canonical example). The numbers are big and centred, the boxes are evenly spaced, and the column is tidy. There are no `+` signs between rows — the verticality implies addition. The eye reads top-to-bottom, which is how most students naturally tackle a column.

Below the column, a single text input labelled *"Type here"* sits centred. At the very bottom, a yellow **Next** button sits dim until the input is submitted.

- **Type the correct sum and press Next** → the input glows green, a bright chime, the timer freezes, the next round loads.
- **Type a wrong sum and press Next** → the input flashes red and shakes, a heart shatters, the correct answer is briefly shown ghost-grey before the round resolves and moves on.
- **Run out of time** → the timer goes red and pulses, the input dims, a heart shatters, the correct answer is revealed. Round ends.
- **Type a partial number and pause** → no penalty. The timer keeps ticking but the student can revise.

## Shape of the experience
10 rounds, ramping difficulty:

- **Rounds 1–3 — Short towers.** Four to five numbers, all under 12, with at least one obvious pair (`4 + 6`, `3 + 7`). Time generous — 60 seconds. Students should clear these in under 20.
- **Rounds 4–7 — Six-number towers.** Numbers up to 15, no obvious pairs. Time tightened to 45 seconds. Students start running totals.
- **Rounds 8–10 — Seven-number stretch.** Numbers up to 20. Time at 30 seconds. Sums climb above 80. Students who didn't internalise pairing earlier struggle here.

## Win condition and stars
Three lives across the whole session, plus a per-round time bonus:
- **3 stars** — finish all 10 rounds correct, with each round solved in under half its allotted time, and no hearts lost.
- **2 stars** — finish all 10 rounds correct, with at least 7 of them in under half time, and no more than one heart lost.
- **1 star** — finish all 10 rounds correct (regardless of time), with hearts to spare.
- **0 stars** — all three hearts lost before round 10.

## Feel and motivation
- **The clock is the headline.** Big, blue, dead centre. The countdown drives the game's urgency. In the last 5 seconds, the timer turns amber, then red, and ticks audibly.
- **No grouping suggested.** The numbers sit in a tower without any visual grouping, hinting, or pairing aids. This is on purpose — students must *do the strategy themselves*, not have it cued. A child who spontaneously pairs `4 + 6 = 10` in their head has learned the move; a child who grinds top-to-bottom hasn't.
- **The Next button is yellow and big.** When a student commits an answer, that physical *press* gives a satisfying *I'm done* feel — much more decisive than a tiny submit chevron.
- **Sums stay under 100 for most rounds.** This keeps it mental. The moment a column sums above 200, students reach for paper, and the lesson breaks.

## Why it works pedagogically
The vertical column sum is the most ubiquitous arithmetic shape in primary school — it shows up in addition, subtraction, multi-digit multiplication, and money problems. Students who fluent the *running total* move are dramatically faster at every downstream topic. This game targets that fluency directly with no decoys, no multiple choice, no draggable hints — just a column, a typed input, and a timer. After ten rounds, the student has internalised a rhythm: scan, pair, run-total, commit. That rhythm is exactly what every later arithmetic skill assumes you've already built.

A 10-round session takes 5–8 minutes — perfect as a 5-minute warm-up at the start of a numeracy block, or a daily fluency drill that visibly improves over a fortnight.
