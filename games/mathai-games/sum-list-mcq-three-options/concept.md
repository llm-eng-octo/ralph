# Speed Sum — The 15-Second Mental Addition Sprint

## In one line
A timed mental-addition game where the student stares at a small flock of numbers, totals them in their head, and slaps the correct answer out of three close-together choices before fifteen seconds run out.

## Who it's for
Class 4–5 students (ages ~9–11) who already know how to add two-digit numbers on paper but freeze, finger-count, or grab a pencil the moment a list of more than three numbers shows up. The game is for the in-between phase where addition *facts* are solid but mental *strategy* — pairing to ten, doubling, running totals — has not yet replaced laborious left-to-right addition.

## What it tries to teach
The whole game is built around one quiet skill: **fluent mental addition of a list of small whole numbers**, finished fast enough that the answer feels obvious rather than worked-out.
Three threads live inside that:
- **Pair-to-friendly-numbers.** A list like `12 + 8 + 13 + 7` collapses fast if you spot `12 + 8 = 20` and `13 + 7 = 20`. The decoys are placed close enough (off by ±10) that students who add carelessly left-to-right tend to drift past the right answer; students who pair to tens land on it.
- **Running totals without writing.** The list is long enough (~14 numbers) that the student must hold a running sum in working memory. They learn to chunk — sum four, hold, sum the next four, hold — because trying to keep all 14 numbers in mind at once falls apart.
- **Spotting the right answer fast.** With three options sitting *very* close to the true sum, the student can't just eliminate by gut feel. They have to commit to a number and trust it. That decisiveness is the actual goal — most kids at this level *can* compute the sum but won't *commit* under time pressure.

## What the player sees and does
A clean white panel. At the top a thin status row — current round badge, big blue countdown timer, lives icons (three hearts), and a star counter on the right. Just below, a two-line instruction: *"Add the given list of numbers and tap on their sum! Add each list within **15 seconds** to win 3 stars!"*

The body of the screen is the math itself: about fourteen two-digit numbers laid out across three or four lines, each separated by a gentle `+` sign in light grey. The numbers themselves are large and purple, so the eye reads numbers first and operators second — matching how a fluent solver actually parses the line.

Below the list, three white answer tiles sit in a single row. Each tile holds one candidate sum. The tiles are the same size, neutral-coloured, and intentionally close in value, so the choice can't be made by guessing.

A yellow **Next Round** button sits in the bottom-right, but it lights up only after the round resolves.

- **Tap the right answer** → the tile turns green, a quick *cha-ching*, the timer freezes, the round badge ticks up, and Next Round becomes tappable.
- **Tap the wrong answer** → the tile turns red and shakes briefly, a heart shatters in the top-right, the correct tile glows green for a beat, and the round ends.
- **Run out of time** → all three tiles dim, the correct tile pulses green, a heart shatters, and the round ends.

There is no expression builder, no number pad, no scratch space on the screen. The deliberate absence of a workspace is the point — the student must *do this in their head*.

## Shape of the experience
5 rounds, gradually heavier:

- **Rounds 1–2 — Short and friendly.** 8–10 numbers, all under 15, with at least one obvious pair-to-ten on the line. The student should clear these in well under 15 seconds and feel the rhythm.
- **Rounds 3–4 — Long and busy.** 12–14 numbers, mixed sizes from 2 to 19, with no neat pairs jumping out. The student starts running totals.
- **Round 5 — Stretch.** A full 14–16 numbers, totals in the 150–200 range, decoys tighter (off by 10 instead of 20). Students who got lazy in earlier rounds will lose a heart here.

Lives carry across rounds — three hearts total — so a single careless tap doesn't end the run, but a second one bites.

## Win condition and stars
Stars are earned **per round** based on time-to-correct-tap, then summed:

- **3 stars** for solving the round in under 15 seconds and on the first tap.
- **2 stars** for solving on the first tap, but slower than 15 seconds.
- **1 star** for getting the right answer eventually, even after a wrong tap.
- **0 stars** for the round if all hearts are lost or the round is left unanswered.

A perfect run is 15 stars across 5 rounds. The headline display *"X / 10"* in the top right is the rolling tally — it hits a max of 10 even on perfect play, because the bottom two rounds are weighted higher (Stage 5 is worth more than Stage 1). This nudges students to push for the hard rounds rather than coast on the easy ones.

The game ends when **either** all 5 rounds are complete **or** all 3 lives are lost. There is no continue-from-here — losing all hearts ends the session and the student sees their final star tally.

## Feel and motivation
- **Numbers feel like a flock, not a column.** The list is laid out as a flowing two-line cluster rather than a vertical sum, so the student is encouraged to scan and pair rather than add top-to-bottom. This is a small but deliberate departure from how addition is taught in the textbook.
- **Time is loud.** The countdown timer is the largest text on the screen. It ticks down audibly in the last 5 seconds, and the colour shifts from blue to amber to red. Most students will solve faster than they thought possible just because the clock is shouting.
- **Decoys teach.** The three options are always: the right answer, the answer if you missed one number, and the answer if you double-counted one number. So a wrong tap is diagnostic — a child who consistently picks the "missed-one" decoy is undercounting; the "double-count" decoy reveals the opposite. The game doesn't surface this analysis to the child, but the pattern shows up clearly in a teacher's gauge view.

## Why it works pedagogically
By Class 4, the bottleneck in arithmetic is no longer "can the child add 7 and 8" — it's "can the child add 7 and 8 *automatically* without stopping the rest of their thinking to do it." This game targets that automaticity with a deliberately narrow scope: only addition, only small numbers, only mental, only timed. It strips away every other variable so the student feels the *fluency* gap rather than a knowledge gap, and closes it through repetition under just enough pressure to matter. A 5-round session takes 90 seconds to 2 minutes — short enough to drop into the start of a class as a warm-up, long enough that doing it daily for two weeks measurably moves a child's mental-addition speed.
