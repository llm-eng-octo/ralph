# Estimate the Field — The Picture-to-Number Estimation Game

## In one line
A real-world estimation game where the student studies two side-by-side land-use diagrams (last year vs this year), uses one known acreage as an anchor, and types in their best estimate of an unknown area — learning that *good math* sometimes means *good guessing with reasons*.

## Who it's for
Class 4–6 students (ages ~9–12) who are confident with exact arithmetic but freeze the moment a problem says *"about how much"* or *"estimate"*. The game is for the child who has been told their whole life that math has *one right answer*, and now has to face a question whose answer is *somewhere between 18 and 24 acres*. The specific stuck-point is the discomfort of committing to a number you can't verify by computation — and learning that the **process** of getting close on purpose is its own valid mathematical move.

## What it tries to teach
The leverage is **proportional reasoning from a visual anchor**: using one known quantity to scale the rest of a picture.
Three threads:
- **Anchor and scale.** When the picture says *"in 2024, carrot = 12 acres"* and shows a small orange rectangle of that size, the child has a unit they can mentally drop onto the 2025 picture to count *"how many carrot-rectangles fit in the new carrot region?"* This is the foundational move of unit-iteration that powers area, ratio, and even integration much later.
- **Equal-parts decomposition.** The hint nudges the child toward dividing the whole picture into equal parts and counting how many parts the carrot region covers. A field that's split 2 acres + 8 acres + 2 acres in 2024 (carrot is roughly 1/6 of the field) might become 2 acres + carrot + 4 acres in 2025 — and if the new carrot region looks like *half* the field, that's 12 acres ÷ (1/6) × (1/2) = 6 × 12 / 2... but the child doesn't need to do that computation. They just need to count *parts*.
- **Estimation has tolerance.** The game accepts any answer within ±10% of the true value as correct. *18 to 22* is right when *20* is exact. The child sees this band on the feedback screen — *"the right answer was 20; you said 19 — close enough!"* — and learns that estimation is an interval skill, not a point skill.

## What the player sees and does
A vertically stacked layout. Top status bar: avatar, *"Q1"*, a bright-blue countdown timer in the centre (e.g. `00:21`), heart with lives, and star tally `0/10`.

Below the bar, an opening paragraph:

> *"The pictures below show how a farmer used his land to grow crops in 2024 and what he is planning for 2025."*

Then the centrepiece: **two coloured land-use diagrams side by side**, each with its year stamped above it in bright pink. The 2024 diagram shows a tall rectangle divided horizontally — most of it tan-coloured *Wheat*, with an orange *Carrot 12 acres* slab at the bottom. The 2025 diagram is the same outer rectangle but split into three regions — a small *Wheat* tile top-left, a small yellow *Corn* tile top-right, and a much larger orange *Carrot ?* region taking up most of the lower area. The unknown is marked with a clear bold *"?"*.

Below the diagrams, two bullet-style context lines (each prefixed with a small arrow icon):

> *"➡️ In 2024, farmer grew wheat and carrot. And, he used around 12 acres to grow carrot."*  
> *"➡️ In 2025, farmer wants to grow wheat, carrot, and corn on the same land."*

A short specific question: *"From the given image, estimate how much land will be used to grow carrot in 2025."*

A hint box in soft yellow: *"💡 Hint: Divide the land into equal parts and see how much space each part covers."*

At the bottom, the answer line is laid out conversationally: *"Around `[ Type here ]` acres"* — a small inline input nestled between two text labels, so the child reads it as a sentence and types the missing word.

- **Tap the input** → number pad slides up, input box highlights.
- **Type a number within ±10%** → input turns green, a soft chime, the diagrams briefly highlight the carrot region with the correct answer overlaid (*"= 20 acres"*), Continue button activates.
- **Type a number off by more than 10% but in the right ballpark (within ±25%)** → input turns amber. *"Close, but not quite. Try counting how many small carrot-rectangles fit in the new region."* The child can edit and resubmit without losing a life.
- **Type a wildly wrong number** (off by >25%) → input turns red, a heart breaks, and a more direct hint appears: *"Look at how many equal parts the field is split into."*
- **Timer expires** → auto-submit blank as wrong; heart breaks if no answer; correct value reveals.

## Shape of the experience
10 rounds, each a different real-world estimation scene:

- **Rounds 1–3 — Single anchor, simple scaling.** Carrot/wheat fields, 2× or 3× scaling. The child practises "twice as big as the anchor."
- **Rounds 4–6 — Multi-region.** Diagrams with three or four regions where the child has to decompose visually before scaling. Crops, classroom seating charts, parking lots.
- **Rounds 7–9 — Different domains.** A jug of water with one known fill-line and an unknown second fill-line; a bookshelf with one known stack height and a longer one to estimate; a grocery shelf with one labeled price and a similar item to estimate.
- **Round 10 — Inverse stretch.** The child is given the *unknown* and asked to estimate the *anchor*. The same skill, run backwards.

The variety in scene type is deliberate — estimation is a domain-general skill, and the game's job is to convince the child that the *same move* works across radically different pictures.

## Win condition and stars
Three lives, ten rounds. Stars per round:

- **3 stars** — answer within ±10% of the true value, on the first submission, before the timer expires.
- **2 stars** — within ±10% but after one revision (no life lost).
- **1 star** — within ±25% on the first or second try.
- **0 stars** — beyond ±25%, or timer expired with no answer.

Game ends at 10 rounds completed or 3 hearts lost. Maximum 30 stars. The end-of-game screen shows the child a *"how close you got, on average"* number — most children improve from ±20% to ±8% over 10 rounds, which is a real and visible jump.

## Feel and motivation
- **The diagrams do the talking.** Coloured regions, clear labels, hand-drawn-feeling proportions. The child can squint at the picture and *see* the answer — which is exactly the cognitive move the game wants to build.
- **Hints land at the right moment.** The first hint is gentle (*"divide into equal parts"*); the second is more directive only after a wrong answer. The game doesn't pre-explain the strategy on round 1 — the child has to feel the gap before the hint becomes useful.
- **Tolerance bands are visible.** When the child gets a right answer, the screen briefly highlights the *range* that would have been accepted (e.g., *"18 to 22 was correct; you said 19"*). This makes the lesson explicit: estimation is about being *near*, not being *on*.

## Why it works pedagogically
Estimation is one of the highest-leverage and least-taught math skills in primary school. Adults use it constantly — *will this fit in my car?* *can I afford this?* *how long will the queue take?* — and a child who has never been allowed to be approximately right cannot make these judgements. Conventional curricula either skip estimation entirely or treat it as a rounding exercise (*"round 47 to the nearest ten"*) which misses the point: estimation is reasoning under uncertainty, not arithmetic with fewer digits. By forcing the child to commit to a number from a picture, with a visible tolerance band and a hint that shows the *strategy*, this game teaches the actual cognitive habit. The transfer is enormous: kids who play this consistently report being more confident on word problems generally, because they've internalised the move of *"sanity-check what a reasonable answer would even look like"* before computing.
