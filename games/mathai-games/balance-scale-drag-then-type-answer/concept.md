# Weight It Out — The Balance-Scale Reasoner

## In one line
A two-pan balance scale where the student drags fruits and known weights onto the trays until the scale tips level — and from those balanced positions, deduces the weight of one apple and one orange, typing each into a labelled input.

## Who it's for
Class 4–5 students (ages ~9–11) who are about to meet algebra and need a concrete model of *unknown* and *equation*. They can do simple arithmetic but freeze at a sentence like *"if 3 apples weigh 60g, what does one apple weigh?"* — because they don't see the equation hiding in the words. The balance scale gives them a physical representation of equality: whatever's on the left side weighs the same as whatever's on the right.

## What it tries to teach
The whole game is built around one foundational pre-algebra skill: **using a balance to discover an unknown weight by setting up equal-mass configurations.**
Three threads inside that:
- **Equality as physical balance.** When the scale is level, both sides weigh the same — that's the equation. Students start to feel *"this side equals that side"* in their bodies before they meet the `=` sign in algebraic equations.
- **Isolating the unknown.** If `3 apples = 60g`, then `1 apple = 20g`. The student learns to divide, but more importantly, learns the *strategy* of finding a balance that lets them deduce a unit. Many students will first try `1 apple vs 5g` (too light), `1 apple vs 40g` (too heavy), then `3 apples vs 60g` (perfect) and reason from there.
- **Two unknowns from a single setup.** With both apples and oranges on the same scale, the student must isolate one at a time — usually by first balancing apples-only, then using the now-known apple weight to deduce the orange.

## What the player sees and does
A clean white panel. At the top, the usual thin status row — round badge, hearts, star tally. Below that, one short instruction: *"Balance the scale given below and figure out the weight of 1 green apple and 1 orange"*.

The body of the screen is the puzzle. A big yellow-and-navy balance scale dominates the centre — two yellow pans on either end of a horizontal beam, balanced on a navy triangular fulcrum. Initially the pans are empty and level.

Below the scale, a soft grey panel holds the draggable items: the top row has three green apples and one orange (each as a friendly cartoon icon), the bottom row has four weight stones labelled `5g`, `20g`, `30g`, `40g`. Students drag items from this pool onto either pan of the scale.

At the bottom, two labelled input fields:
- *"Weight of 1 green apple 🍏 = ___ g"*
- *"Weight of 1 orange 🍊 = ___ g"*

- **Drag items onto the pans** → the scale visibly tilts (left pan down if heavier, right pan down if heavier, level if balanced). The tilt is animated and immediate — physical feedback.
- **Achieve a balance** → both pans glow a soft gold for a moment, signalling *this is a usable equation*. The student can read off a relationship (e.g. *"3 apples = 60g, so 1 apple = 20g"*).
- **Type a correct apple weight** → input glows green, a chime, a tick mark appears.
- **Type both correct** → the round resolves with a triumphant chime and a confetti burst.
- **Type a wrong weight** → the input shakes red, a heart shatters, the input clears for another try. The scale stays as the student left it — they don't have to re-balance.
- **Try to submit without ever balancing the scale** → a gentle nudge: *"try balancing the scale first to figure out the weights."*

## Shape of the experience
10 rounds, with shifting fruit and weight values:

- **Rounds 1–3 — Apples only, easy ratios.** 1 apple = 10g (matched against the 10g stone), 2 apples = 20g, 3 apples = 30g. The student learns the balance mechanic with one unknown. Orange input is empty/disabled.
- **Rounds 4–6 — Apples and oranges, distinct weights.** Both fruits show up. Apple = 20g, orange = 30g. Students learn to balance one fruit at a time.
- **Rounds 7–10 — Trickier ratios.** Apple = 25g (no exact stone match — must balance multiple apples against multiple stones), orange = 35g. Some rounds require *combining* stones (e.g. 30g + 5g = 35g) to balance one orange. Real puzzle territory.

## Win condition and stars
Three lives across the whole session.
- **3 stars** — finish all 10 rounds with both inputs correct on the first try, no hearts lost.
- **2 stars** — finish all 10 rounds, losing one heart total.
- **1 star** — finish all 10 rounds, losing two hearts total.
- **0 stars** — all three hearts lost before round 10.

Students can drag items on and off the scale freely without penalty — the lives only fire on a wrong typed answer. The drag-and-balance phase is *exploration*; the type phase is *commitment*.

## Feel and motivation
- **The tilt is the feedback.** When the right pan is too heavy, the right pan dips. The student sees the imbalance physically — no need for "wrong, try again" text. This mirrors how a real balance works.
- **Stones come in helpful values.** 5g, 20g, 30g, 40g are chosen so that any reasonable answer can be reached with combinations. There's no useless stone.
- **The fruits are friendly cartoons.** Green apple, orange — instantly recognisable, no ambiguity. The visual language is "real-world objects on a real-world scale," which is why the game works for students who are scared of algebra notation.
- **Two inputs, two ticks.** Splitting the answer into apple-weight and orange-weight makes partial credit visible — a student who got the apple right but the orange wrong sees exactly what to fix.

## Why it works pedagogically
The balance scale is the most under-used pre-algebra tool in primary curricula. It physically embodies the two ideas that algebra is built on — *equality* and *isolating the unknown* — and lets students manipulate them with their hands long before the abstract notation arrives. By the time these students meet `3x = 60` on paper, they've already solved its physical equivalent dozens of times: they instinctively know that whatever you do to one side, you do to the other, and that division by 3 is what gets you to *one apple*. This is the bridge between concrete arithmetic and symbolic algebra, and it's the game that builds it.

A 10-round session takes 8–12 minutes — long enough to feel substantial, short enough to be a Friday warm-up before introducing the equals sign as more than just *"the answer goes here."*
