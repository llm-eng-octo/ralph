# Cross Sums — The Place-Value Maximisation Puzzle

## In one line
A digit-arranging puzzle laid out as a plus-sign-shaped grid where the centre cell is shared by two numbers, and the student has to drag the six given digits around until the sum of both numbers is as large as it can possibly be — which only happens when they realise the *middle* digit gets counted twice.

## Who it's for
Class 4–5 students (ages ~9–11) who already know what a place value is — they can tell you the `7` in `4732` is "in the hundreds place" — but who haven't yet *internalised* that bigger digits in higher places dominate everything else. The game is for the child who, when asked to arrange `5, 7, 9, 2, 7, 2` into a 4-digit and a 3-digit number for the largest sum, will write `9752 + 722` and feel pretty good about it, never noticing they could have written `9772 + 522` instead and gained 50.

## What it tries to teach
The whole puzzle is built around one slippery insight: **a digit's contribution to a sum is its face value times its place value, and you should put the biggest digits where the place value is largest** — including the *shared* cell that both numbers count.
Three threads inside that:
- **Place-value ranking.** The vertical number is 4 digits long (thousands, hundreds, tens, ones); the horizontal number is 3 digits (hundreds, tens, ones). The student learns to think of every cell as a *weight*: thousands cell = ×1000, hundreds = ×100, and so on. Bigger digits go in heavier cells.
- **The intersection trick.** The centre cell of the cross belongs to both numbers — its digit gets added once as part of Number 1 and again as part of Number 2. So the digit in the middle is effectively *doubled*. The puzzle is unsolvable optimally without this realisation, and it lands hard the first time a student sees the new total jump after they swap the centre digit.
- **Comparing before committing.** A student who guesses gets close; a student who *checks* gets it right. After every drag, the running totals of Number 1, Number 2, and the combined sum update at the side, so the child can see whether their last move was an improvement or a downgrade.

## What the player sees and does
A clean white screen with the standard top status bar — small avatar, *"Q1"*, a heart icon with a remaining-lives count, and a star tally on the right. Below that, the instruction in bold-and-light typography: *"**Rearrange the digits** in the grid in such a way that the **value of every digit** contributes **maximum** to the **sum of both numbers**."* The bolded phrases are the actual lesson.

The body of the screen is the cross itself, centred:

```
        [ 5 ]
        [ 7 ]
[7]  [ 2 ]  [9]
        [ 2 ]
```

— a 4-cell vertical column with a 3-cell horizontal row crossing through its second-from-bottom cell. The vertical column is labelled *"Number 1"* with a finger-down emoji at its top; the horizontal row is labelled *"Number 2"* on its left. Each cell holds a single digit card with a dashed border, signalling it is draggable. The six digits given (here: `5, 7, 7, 2, 9, 2`) are pre-placed in some non-optimal arrangement.

To one side, three small read-outs update live: *Number 1 = 5722*, *Number 2 = 729*, *Sum = 6451*. The child watches these tick as they swap cards.

- **Drag a digit onto another digit** → the two cards swap places with a soft snap, the running totals update, and the new sum either ticks up (small green flash) or down (small grey flash) — never red, because exploring is allowed.
- **Reach the optimal arrangement** → the cross briefly glows gold, the sum read-out enlarges, and a quiet *"Perfect — that's the maximum!"* slides in. A *Continue* button appears.
- **Submit a sub-optimal arrangement** (via a *Done* button) → the gap is shown: *"You got 9952. The best possible was 9972 — try again?"* The child keeps their attempt visible and can keep swapping.

## Shape of the experience
10 rounds, escalating in subtle ways:

- **Rounds 1–3 — Easy spread.** Six digits with a clear winner (one `9`, one `8`, the rest small). The child usually finds the optimum in two swaps.
- **Rounds 4–6 — Same-digit traps.** Repeated digits like `5, 5, 6, 6, 7, 7`, where the centre-cell trick matters more because every choice is so close.
- **Rounds 7–9 — Asymmetric digits.** Sets like `1, 2, 3, 8, 9, 9`, where the two `9`s create a real choice — one goes in the thousands cell, the other in the centre, and the child has to decide which.
- **Round 10 — Subtraction twist (optional).** Some variants flip the goal to *minimise* the sum, which forces the child to invert their entire mental model and reveals whether they understood the rule or just memorised "big at top."

## Win condition and stars
Three lives, ten rounds. Each round resolves on the first *Done* click:

- **3 stars per round** — found the optimal arrangement on the first *Done* click.
- **2 stars** — found the optimum within two *Done* clicks (after one corrective hint).
- **1 star** — found the optimum eventually but with three or more attempts, or used the centre-cell hint button.
- **0 stars** — gave up or lost the round.

Lives tick down only on a *clearly worse* submission (sum more than 10% below optimum) — small misses just cost stars, not lives. The session ends when 10 rounds are complete or all 3 lives are gone.

## Feel and motivation
- **The cross shape is the lesson.** A child who has only ever seen numbers in horizontal rows is forced to think about place value spatially: the thousands cell is at the *top*, not the *left*. This visual reorientation is what makes the centre-cell insight click.
- **Live totals, not just final scores.** The running sum next to the grid means every swap is an experiment with immediate feedback — the child stops guessing and starts testing.
- **Decoy starting positions.** Round 1's initial arrangement is *almost* right but with one obviously wrong centre digit — designed so the very first thing the child fixes is the intersection. The lesson lands in the first 30 seconds.

## Why it works pedagogically
Place value is taught as a labelling exercise (*"point to the hundreds digit"*) but tested as a manipulation exercise (*"rearrange to make the largest number"*). Most kids pass the labelling step and quietly fail the manipulation one because labelling never required them to *care* about the weights. This puzzle makes the weights into a leaderboard: a digit in the thousands cell scores you a thousand points; the same digit in the ones cell scores you one. The child sees the cost of a wrong placement immediately and viscerally, in their own running total, and begins to feel place value the way a chess player feels the difference between a queen and a pawn. The cross-shape adds a second insight on top — that some cells are *more equal than others* — which transfers directly to later topics like signed-number ordering, decimal place value, and even algebraic expression maximisation.
