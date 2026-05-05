# Number Hop — The Place-Value Jump Sprint

## In one line
A 20-second mental-math sprint where the student stares at a starting number, a target number, and a tray of `±1 / ±10 / ±100 / ±1000` jump blocks — and drags exactly the right combination into a drop zone to leap from one to the other before the clock runs out.

## Who it's for
Class 3–4 students (ages ~8–10) who can read a four-digit number and chant the place values back at you, but still slow down or finger-count when asked *"what's 1250 + 200?"* The game is for the in-between phase where place-value *names* are known but place-value *moves* — adding and subtracting hundreds, thousands, tens — are not yet automatic. It's for the kid who can write `3550 − 1250 = 2300` on paper but freezes when the same calculation flashes on a screen.

## What it tries to teach
The whole game is built around one quiet skill: **mentally decomposing the difference between two numbers into place-value-sized hops**.
Three threads live inside that:
- **Column-wise difference.** Going from 1250 to 3550 isn't *"add 2300"* — it's *"add 2 thousands and 3 hundreds"*. The blocks force the student to see the change column by column, which is exactly how a fluent mental arithmetic-er actually computes the difference.
- **Choosing the smallest block-set.** Many target deltas have multiple representations (`+200` is two `+100` blocks; `+200` is also `+1000` minus `−800`, which is silly). The student learns to pick the *minimal* set — the one move per column where it changes — because that's the cleanest mental model of the difference.
- **Direction sense.** Half the rounds go up (`1250 → 3550`), half go down (`3550 → 1250`). The student must look at *both* numbers before grabbing blocks, not just at the bigger one. A wrong-direction drop is the most common early mistake and the game highlights it specifically.

## What the player sees and does
A clean white panel. The header strip across the top holds three things in a thin row: a tiny `Q1` badge with the teacher's avatar on the left, a big blue **00:00 → 00:20** countdown timer in the middle, and an `0/10` star tally next to a soft yellow star on the right.

Below it the instruction text reads: *"Drag and drop all the blocks needed to **change** the given number to a new number. Find the answer mentally. You will get **20 seconds** to answer."*

The middle of the screen shows two stacked black-bordered boxes:
- **Given Number** — a row of large digits, e.g. `1 2 5 0`.
- **New Number** — a row of large digits, e.g. `3 5 5 0`.

Below that is a centred drop zone — a thin grey rectangle with the label *"Drop the blocks here ☟"* — and below the drop zone, the **block pool**: a 3×3 grid of small white block-tiles labelled `+1000`, `−1000`, `+100`, `−100`, `+10`, `−10`, `+1`, `−1`. A yellow **Show solution** button sits at the bottom and lights up only after the round ends. The countdown timer is the loudest thing on the screen — it ticks audibly in the last 5 seconds and shifts blue → amber → red.

- **Drag the right blocks into the drop zone, in any order, and the running total reaches the new number** → the drop zone glows green, a quick *cha-ching*, the timer freezes, and the round resolves.
- **Drop a wrong block** → the block stays in the zone but the running total above it shows in red, signalling the student has overshot or undershot. They can drag the wrong block back out, or drag a corrective block on top.
- **Run out of time** → all blocks dim, the correct combination floats up into the zone in soft yellow as a "this is what it should have been" reveal, and the round ends.

There's no number pad, no scratch space, no hint — the deliberate absence of a workspace is the point: do this in your head.

## Shape of the experience
10 rounds, scaling from one-column changes to multi-column:

- **Rounds 1–3 — Single column.** Changes like `1250 → 1290` (one column, +40 — three `+10` blocks) or `4500 → 4500 + 1000`. The student warms up to the gesture.
- **Rounds 4–7 — Two columns.** Changes like `1250 → 3550` (+2000 and +300, three blocks). The student starts decomposing.
- **Rounds 8–9 — Cross-column.** Changes like `1990 → 2010` where the obvious `+20` is correct but the student is tempted into `+1000 − 980`. Numbers chosen so a column rolls over.
- **Round 10 — The stretch.** A four-column change in 20 seconds: `1234 → 5678`. Nine blocks needed, no time to overthink.

## Win condition and stars
Stars per round, then summed:

- **3 stars** — solved with the *minimum* number of blocks and within 10 seconds.
- **2 stars** — solved correctly within 20 seconds.
- **1 star** — solved correctly after running over time (game grants extra 10s but penalises score).
- **0 stars** — round abandoned or skipped via Show Solution.

Three lives total. Each timeout costs one heart. The game ends at 10 rounds or when all hearts are gone, whichever comes first. A perfect run is 30 stars.

## Feel and motivation
- **The block tiles look like keypad keys.** Square, slightly raised, with a clear sign and a number. Picking up a block has a tactile *click*. Dropping a wrong-direction block (e.g. a `−100` on a round where the student should be going up) makes the running total flash red briefly — diagnostic feedback without a dialog.
- **Show Solution is a soft offramp, not a fail.** A child who gives up taps the yellow button, sees the correct block set animate into the drop zone, and earns 0 stars for that round but doesn't lose a heart. This keeps frustrated kids from quitting the whole game.
- **Numbers are realistic.** Four-digit numbers without leading zeros, deltas that read like real-world price changes or score updates. The student is solving small puzzles that feel like the kind of mental math they'll do at a shop counter.

## Why it works pedagogically
Asking *"what is 3550 − 1250?"* tests whether a student can subtract; asking them to *build* the difference out of place-value bricks tests whether they understand what subtraction *is*. Most curricula tackle the first question and assume the second comes along for the ride, but the second is what makes mental arithmetic fast — and is exactly what most Class 3 students lack. By forcing the student to externalise the column-wise structure of the difference, this game makes that hidden mental step visible, fixable, and quickly automatic. A 10-round session lasts about 4 minutes — short enough to fit at the start of a math class, long enough to drill the move twenty times.
