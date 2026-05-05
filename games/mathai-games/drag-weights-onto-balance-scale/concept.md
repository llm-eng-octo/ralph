# Fruit & Iron — The Balancing-Scale Combinator

## In one line
A pan-balance puzzle where the left pan holds a few fruit with their weights labelled (a 303 g mango, a 96 g apple, a 101 g avocado), and the student must drag the right combination of iron-block weights onto the empty right pan to make the scale tip flat — quietly turning addition into a search problem.

## Who it's for
Class 4–5 students (ages ~9–11) who can compute `303 + 96 + 101` if you ask them to, but who freeze when the question becomes *"which of these blocks add up to 500?"* The game is for the in-between phase where addition *forward* is solid but addition as a *target search* — *"what subset of these numbers gives me X?"* — is still missing. It also doubles as a soft introduction to the balance-scale model that becomes algebraic equation-solving in Class 6, where what you do to one side you must do to the other.

## What it tries to teach
The whole game is built around one rich skill: **finding a subset of given numbers that sums to a target — a mini knapsack problem, dressed as a fruit-and-iron physics gag**.
Three threads inside that:
- **Total-then-search.** Step 1: add the left side to find the target weight. Step 2: pick blocks that combine to that target. Most students try to do both simultaneously and get muddled. The game's separation of fruit (left) from blocks (below) gently nudges the two-step strategy.
- **Round-number scaffolding.** The block pool always includes one weight that's *almost* the target (e.g. `555 g` when the target is `500 g`) and a couple of small correctives (`49 g`, `98 g`). The student learns to use the big block as an anchor and combine smalls. This is the same heuristic adults use for mental change-making.
- **Constructive checking.** Once the student's blocks are dropped, they can see the right pan visually tilt (a slight lift if they're under, a slight drop if they're over). The continuous physics feedback teaches that *"too many"* and *"too few"* feel different — useful intuition for inequality reasoning later.

## What the player sees and does
A clean white panel. The thin top status row holds the `Q1` badge with the teacher's avatar on the left, a big blue **00:00 → 01:00** countdown in the middle, and a heart icon (`2` lives) and `0/10` star tally on the right.

Below the instruction text — *"A Mango, an Apple and an Avocado are given on the left with their actual weight. **Drag and drop weights** to the right side to balance the scale."* — sits the centrepiece: a stylised pan-balance scale, navy-and-yellow.

- The **left pan** holds three small white tiles, each with a fruit emoji and a weight label: a yellow mango (`303 g`), a red apple (`96 g`), an avocado (`101 g`). The pan is tipped slightly down because of their combined 500 g weight.
- The **right pan** is empty and tilted up. A grey label appears above it that updates as blocks are added: *"Right side: 0 g"*.
- The **fulcrum** is a navy triangle below the central beam.

Below the scale sits the **weight pool**: a 4×2 grid of grey block-tiles labelled with weights — `49 g`, `98 g`, `197 g`, `205 g`, `555 g`, etc. Each block can be dragged once and only once (no duplicates). Picking up a block makes it lift with a small shadow; dropping it on the right pan adds it to the running total.

- **Drop a block on the right pan** → the block animates into the pan and stacks visually; the right-side label updates (*"Right side: 197 g"*). If the running total is below the target, the right pan stays high; if at the target, the beam smoothly levels out to flat; if over, the right pan dips below.
- **Tap a block already on the pan** → it flies back to the pool, available again. (No undo limit; experimentation is the point.)
- **Beam is flat (running total equals left side)** → a gentle *cha-ching*, the scale glows green, the timer freezes, the round resolves.
- **Run out of time without balancing** → the right pan animates the correct combination floating in (greyed out), one heart shatters, the round ends.
- **Submit explicitly via a small confirm button (or auto-detect on flat)** → resolves the round.

## Shape of the experience
10 rounds, the search space growing:

- **Rounds 1–3 — Single-block solutions.** Fruit summing to a round number like 200 g; pool has a `200 g` block plus distractors. The student gets the gesture and the balance physics.
- **Rounds 4–6 — Two-block solutions.** Fruit summing to 500 g (sample shown); pool has `49 g, 98 g, 197 g, 205 g, 555 g`. The neat answer is `205 + 197 + 98 = 500` (three blocks) — multiple valid combinations exist; any working subset wins.
- **Rounds 7–8 — Decoy traps.** A pool block (`555 g`) is *almost* the target — students who eyeball without adding will grab it and overshoot. Diagnostic of the "anchor" misuse.
- **Rounds 9–10 — Three-fruit, four-block solutions.** Targets like 837 g, multiple small blocks needed, more arithmetic per attempt.

## Win condition and stars
Stars per round, summed:

- **3 stars** — balanced on the first attempted submit, within 30 seconds.
- **2 stars** — balanced eventually, within 60 seconds.
- **1 star** — balanced after running over time (game grants extra 30 s but penalises stars).
- **0 stars** — round abandoned or hearts depleted.

Two lives across the whole run. Each timeout costs one heart. The game ends at 10 rounds or zero hearts. A perfect run is 30 stars.

## Feel and motivation
- **The scale is the math.** When the right-pan total moves from 400 to 480 to 500, the beam visually rotates from down to almost-flat to flat. A student watching the beam can *feel* the inequality close — and can see the difference between "almost balanced" and "balanced" in their gut. This is unusual physical-feedback in a math UI and it does real teaching work.
- **Distractor blocks teach.** The presence of a `555 g` block on a 500 g round is not a trap to punish careless kids — it's there so the careful kid can think *"if I use 555 I overshoot, so I won't"* and feel good about their reasoning. Wrong choices are diagnostic, not punitive.
- **Fruit chosen for sums, not flavour.** Designers pick fruit weights so the left side adds to a friendly round number — 200, 500, 750, 1000 — because the *target* is what the student needs to feel; the *path* is what they need to find.

## Why it works pedagogically
Subset-sum problems live everywhere — making change, packing a bag to a weight limit, choosing which workshop sessions add up to the credit budget — and they're conspicuously absent from primary-math curricula, which mostly drill forward arithmetic. This game smuggles the subset-sum skill into a child's repertoire under the cover of a fun balance-scale gag, and trains both halves of the underlying skill (estimation + targeted combination) with rich, immediate visual feedback. A 10-round session lasts about 8–10 minutes; the leverage on Class 6 algebra (where the balance-scale metaphor literally returns as the standard model for solving equations) makes this archetype an unusually high-value teaching investment.
