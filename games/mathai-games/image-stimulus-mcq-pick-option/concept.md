# Read The Clue, Pick The Picture — The Spatial Logic Sorter

## In one line
A picture-matching logic game where a single short clue — *"Neha sits across from Samir."* — appears in a soft yellow box, and the student taps the seating chart, out of two side-by-side options, that actually obeys the clue.

## Who it's for
Class 3–4 students (ages ~8–10) who can read short sentences fluently but have never been asked to *check a picture against a sentence*. The skill the game targets is the foundational pre-algebra move of **constraint-checking**: holding a rule in mind ("X is across from Y") and verifying it against a candidate state. It is, in disguise, the first cousin of "is `x = 5` a solution to the equation?" — the kind of yes/no logic check that quietly underwrites everything from inequality solving to proof reading.

## What it tries to teach
The whole game is about **translating a spatial relationship described in English into a check against a picture**.
Three threads:
- **Spatial vocabulary precision.** *"Across from"*, *"next to"*, *"between"*, *"in front of"* — these are not interchangeable. The game's clues use them carefully, and the wrong-image option always violates *one specific word* in the clue. The student learns to read the clue with the words that matter highlighted in their attention.
- **The "compared to what" instinct.** Two options is the perfect minimum for this skill: with one option, the student would pass by default; with three, the choice fragments. With two side-by-side options, the student has to pick by *contrast* — what does the right one have that the wrong one lacks? This contrast-driven reading is what the game trains.
- **Decoy logic.** The wrong image is always a near-miss — same characters, same furniture, but one relationship flipped. This is deliberate; it forces the student to look at the relationship being described, not at incidental details.

## What the player sees and does
A friendly, classroom-coloured layout.

At the top, the standard status row — round badge `Q1`, a friendly avatar, a heart icon with `4` lives, and the star tally `0/10` on the right.

Below the header, a multi-line instruction in body text: *"Read the clue and **tap** the picture that matches it. You lose a life if you tap on an incorrect image. Complete **4 rounds** without losing all lives."*

A thin yellow progress bar runs across the screen, labelled *"Rounds Completed"* on the left and `0/4` on the right. It fills as rounds resolve, giving the student a clear sense of how close they are to the finish.

Below the progress bar sits the puzzle itself. A soft cream-yellow box holds the clue in purple text — clean, sentence-length, single-clause: *"Neha sits across from Samir."* The colour and the rounded corners signal "read this carefully — it's the rule".

Beneath the clue, a small instruction *"Tap here 👇"* with a pointing-hand emoji, then **two illustrated cards** sitting side by side. Each card shows a small classroom seating arrangement — two desks facing each other, two desks back to back, characters labelled by name above their heads. The illustrations are intentionally simple, pixel-art-style children at desks with clean labels.

- **Tap the correct picture** → the card glows green, a *cha-ching* plays, the progress bar advances by 25%, and the next round loads automatically.
- **Tap the wrong picture** → the card shakes briefly with a red flash, a heart deflates in the top right, the *correct* picture pulses green for emphasis, and the round still resolves (the progress bar advances). This is generous — a wrong tap doesn't trap the student.
- **Lose all 4 lives** → the round ends mid-run; the student sees their final stars without finishing the four rounds.

## Shape of the experience
4 rounds — short on purpose. Each round is a different spatial relationship, escalating in subtlety:

- **Round 1 — "Across from".** *"Neha sits across from Samir."* Two clear options: one with Neha across from Samir, one with Neha next to Samir. The student learns the basic check.
- **Round 2 — "Next to".** *"Riya sits next to Aman, on his left."* Adds laterality — left vs right. The wrong option flips the side.
- **Round 3 — "Between".** *"Bobby sits between Mira and Anita."* Adds a three-character relationship; the wrong option puts Bobby at one end instead of the middle.
- **Round 4 — Compound clue.** *"Sara is across from Karan, who is next to Tanvi."* Two relationships chained. The student must verify both. The wrong option satisfies one but not the other.

## Win condition and stars
A run is 4 rounds with 4 lives. Stars are based on the count of rounds passed on the first tap:
- **3 stars** — all 4 rounds first-tap correct.
- **2 stars** — 3 rounds first-tap correct.
- **1 star** — 1–2 rounds first-tap correct.
- **0 stars** — 0 rounds first-tap correct, or all 4 lives lost.

There is no timer. The student reads as carefully as they want.

## Feel and motivation
- **The clue box is the protagonist.** Pale yellow with purple text — it's the only stylised element on the screen, deliberately so. Children's eyes go to it first, which is the correct reading order.
- **Decoys are visually identical except for the relationship.** Same characters, same furniture, same colour palette. The only difference is the *position*. This is the contrast-driven reading the game wants to train.
- **Generous lives, short run.** 4 lives over 4 rounds is essentially "you can mess up everything once and still finish". The game is a teaching loop, not a test, and the lives count signals that to the student in a calming way.

## Why it works pedagogically
The hidden skill in this game is *constraint verification* — being given a rule and asked whether a picture obeys it. Constraint verification is everywhere in mathematics: checking whether a number satisfies an inequality, checking whether a triangle satisfies the triangle inequality, checking whether a function value matches an equation. Schools rarely train this skill at the primary level because it doesn't look like math; this game smuggles it in through spatial reasoning, where the constraints are intuitive and the verification feels like a game of *spot-the-difference*. The compounding clue in round 4 is a small foreshadowing of multi-condition logic that pays off in middle school. A 4-round session is 90 seconds — short enough to fit between two heavier exercises, long enough to be a complete experience, and shaped to feel like a fast win.
