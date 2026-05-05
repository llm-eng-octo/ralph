# Factor Hunt — The Division-Checker Detective Game

## In one line
A divide-and-discover game where the student tries different divisors against a target number, watches the long division play out live, and writes down every factor pair that lands a clean zero remainder.

## Who it's for
Class 4–5 students (ages ~9–11) who can recite times tables for 2, 5, and 10 but stall the moment a number sits outside their fluency window. The game is for the student who, asked "find all the factors of 42," confidently writes `1, 42, 6, 7` — because those came from the times tables they know — and then stops, because they have no systematic way to check whether 3 or 4 or 5 might also work. The stuck-point is the *missing tool*: students need a reliable, non-times-table way to ask "does this divide evenly?" and the long-division algorithm is exactly that tool, but they've never used it as a *checker* — only as a procedure to grind through homework.

## What it tries to teach
The whole game is built around one big idea: **a factor is a divisor that produces zero remainder, and long division is the universal way to check**.
Three threads inside that:
- **Systematic search instead of recall.** Once the student exhausts what they remember from times tables, they need to *try every candidate* up to the square root of the target. The game's divisor cards (2, 3, 4, 5...) are arranged in order so the student feels the rhythm of "try each one in turn, don't skip."
- **Reading a long division for the remainder, not the quotient.** Most school division work focuses on "what's the answer?" Here the *quotient* matters less than whether the remainder is zero. The student learns to glance at the bottom of the division and read pass/fail.
- **Factor pairs come in twos.** When `42 ÷ 3 = 14 r 0`, the student writes both `3 × 14 = 42` and recognises that `14` is also a factor — they just got two factors for the price of one division. This is the game's lever: every successful divisor reveals its partner for free.

## What the player sees and does
A clean white panel. At the top, the usual status strip — round badge `Q1`, two-hearts indicator on the right, star counter `0/10`. Below it, a short paragraph sets up the situation: *"Nisha could find only two factor pairs of 42 by using the times table — 1 and 42, 6 and 7. Use the division checker to help her find the other factor pairs of 42."*

The middle of the screen is the **division checker**: a row of small purple-tinted divisor cards (`2`, `3`, `4`, `5`...) sitting above a large dashed-bordered division area. The currently-selected divisor is highlighted yellow. Inside the dashed box, the long-division layout draws itself in real time — the dividend (42) on the right under the bracket, the chosen divisor on the left, the working laid out in pale-cyan rows showing the partial products and subtractions. The bottom row of the working is the remainder, large and bold. When it's zero, the row glows softly green.

Below the division area sit the **factor-pair equations**: rows of small empty input boxes shaped like `[ ] × [ ] = 42`, with the right-hand `42` already locked in a soft blue tile. The first equation is filled in (`1 × 42`) and the second (`6 × 7`) is too — the rest are empty for the student to discover.

- **Tap a divisor card** → the long division animates into the box, working from top to bottom; the student reads the final remainder.
- **Type a successful pair into the equations** → the inputs glow green, a soft *ding*, and one of the empty `[ ] × [ ] = 42` rows is now finished.
- **Type a non-factor pair** → the inputs flash red and clear; a one-line hint appears: *"That doesn't multiply to 42 — try another divisor."*
- **Run out of hearts** → the round ends with the missing factors revealed, so the student sees the complete answer.

## Shape of the experience
10 rounds, each one a different target number with its own factor landscape:

- **Rounds 1–3 — Small numbers, friendly factors.** Targets like 12, 18, 24 — numbers under 30 with three or four factor pairs. The student learns the rhythm: try a divisor, watch the remainder, write the pair.
- **Rounds 4–7 — Mid-range numbers with a "trap."** Targets like 36, 48, 60. These have many factors *and* near-misses (e.g. 7 looks like it might divide 36, but the remainder is 1). Students learn to actually *read* the remainder rather than assume.
- **Rounds 8–10 — Stretch numbers.** Targets like 72, 84, 96. Larger dividends, more divisors to test, and the introduction of a clue-strip showing how many pairs they're hunting (*"6 pairs total, 4 still to find"*) so they don't give up early.

The factor pairs already shown ("1 and 42", "6 and 7") shrink in number as rounds progress. By Round 8, only one pair is given; by Round 10, the student starts from scratch.

## Win condition and stars
Three lives, carried across all rounds. Stars are awarded **per round** by completion accuracy:

- **3 stars** for filling every empty pair correctly without any wrong submissions.
- **2 stars** for completing the round with one wrong typing attempt.
- **1 star** for completing it after multiple wrong tries.
- **0 stars** for the round if a heart is lost (round ends).

The headline counter is `X / 10` and rewards the student for hunting factors *thoroughly* — leaving an empty pair when they think they're done counts as a wrong submission. A perfect run is `10 / 10`.

## Feel and motivation
- **The division animates, it doesn't appear.** Each tap on a divisor triggers a 1.5-second animated long-division reveal — partial products draw in, the subtraction line slides in, the next digit drops down. This is deliberate: the *process* of long division is what we want the student internalising, not just the answer.
- **Yellow for "looking", green for "got it."** The currently-selected divisor card is yellow while the student is exploring. The moment a successful divisor is committed to the factor-pair input, that divisor card turns green and stays green — a visual log of what's been found, so the student doesn't waste turns re-trying.
- **Numbers stay sweet.** All target numbers in the game have at least three factor pairs. No primes, no near-primes, no numbers like 50 that only factor as `1×50, 2×25, 5×10`. The point is to feel the *abundance* of factors hidden inside a number, not to discover that some numbers are factor-poor.

## Why it works pedagogically
"Find all the factors" is a recurring task in primary math — it shows up in fractions, in LCM/HCF, in prime factorisation, in early algebra. The skill bottleneck isn't usually arithmetic; it's *systematic search*. Children miss factors because they rely on patchy times-table recall and have no way to verify what they don't already know. This game makes long division the trusted verification tool — the student tries every candidate in order, reads the remainder, and writes the pair. After 10 rounds, the student has done long division 30–50 times in a single session, all of it in service of a question they actually care about answering. That's the rare combination — concentrated procedural practice carried by a real conceptual purpose. A session takes 6–10 minutes and pairs naturally with any unit on multiples, factors, or divisibility rules.
