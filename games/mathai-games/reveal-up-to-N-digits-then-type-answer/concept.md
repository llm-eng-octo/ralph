# Hidden Number — The One-Digit-Reveal Detective Game

## In one line
A logic-deduction game where the student is told a 4-digit number is hiding behind four purple blocks, given three carefully crafted clues, and allowed to peek at *exactly one* digit before they have to type the whole number into an input field.

## Who it's for
Class 4–5 students (ages ~9–11) who know what *thousands*, *hundreds*, *tens*, and *ones* mean — they can write the place value of each digit on a worksheet — but haven't yet *used* place value as a tool for solving anything. The game targets the specific stuck-point where students have place value as vocabulary but not as a deduction strategy. It's the bridge from "I can label the digits" to "I can solve a number puzzle by reasoning about each place separately."

## What it tries to teach
The whole game is built around one quiet skill: **decomposing a multi-digit number into its place-value parts and reasoning about each part independently**.
Three threads inside that:
- **Reading place-value clues.** Clues come in three flavours: *value* clues (*"my hundreds place has a place value of 700"* → the hundreds digit is 7), *digit* clues (*"my ones digit is 5"*), and *relational* clues (*"my thousands digit is 2 less than my hundreds digit"*). Students must parse each clue down to a single digit and place.
- **Choosing the right reveal.** The student gets exactly *one* free reveal. Spending it on a digit the clues already pin down is wasted; spending it on the digit that has the *least* information is high-leverage. Students learn to scan all three clues *first*, see which digits are already determined, and reveal the digit that's still ambiguous.
- **Putting four parts back together.** Once all four digits are known (three from clues, one from reveal — or four from clues if the puzzle leaves the reveal optional), the student types the whole number, in order, into the input. A common error is digit transposition or place-value confusion (`7028` typed as `2078`). The game grades the assembled number, so this final step is graded explicitly.

## What the player sees and does
A clean white panel. Top status row — Q1 badge with avatar, heart with `2` lives, `0/10` stars.

Below it, an inviting opening line: *"I'm a 4-digit number hidden behind these blocks! Can you reveal me?"* The number is given a personality — a small mystery character — which gives the puzzle a friendly, playful frame.

Then the **clues list**, three numbered yellow-tinted rows:
1. *"My **hundreds** place has a place value of **700**"*
2. *"My **thousands** digit is **2 less** than the digit in my **hundreds** place"*
3. *"My **ones** digit is **1 more** than the digit in my **hundreds** place"*

Below the clues, a small rules block: *"Each block hides exactly 1 digit of my number. You may **tap and reveal** any **1 digit** to uncover my identity. ↓"*

Below that, the centrepiece: a row of four bright purple square blocks, one per digit place — Thousands, Hundreds, Tens, Ones, left-to-right. Each block is the size of a tile, deeply saturated, almost glowing. They look *deliberately* mysterious.

Below the blocks, the answer input — a label *"Number ↓"* with a hand emoji and a `Type here` text box.

- **Tap a block** → the block flips open with a small animation revealing its digit. The student gets one of these per round.
- **Type the correct 4-digit number and submit** → all four blocks flip open in sequence to confirm, the input turns green, *cha-ching*, the round badge ticks up, a star is awarded.
- **Type a wrong number** → the input shakes red, a heart shatters, and the closest mistake is highlighted: *"Your hundreds digit is `6`, but the clue says place value `700`."*
- **Tap two blocks (one already revealed)** → soft prompt: *"You only get to reveal one digit per round. Trust the clues for the rest."*

## Shape of the experience
10 rounds, escalating in clue subtlety:

- **Rounds 1–3 — Direct clues only.** All three clues are direct (*"my tens digit is 4"*, *"my ones digit is 7"*, *"my hundreds digit is 2"*). The reveal pinpoints the fourth digit. Students just have to assemble. Warm-up.
- **Rounds 4–7 — Mixed direct + relational clues.** Two direct clues, one relational (*"my thousands digit is 3 more than my ones digit"*). Now the order of solving matters — students learn to do the direct ones first and use them to unlock the relational one.
- **Rounds 8–10 — Mostly relational.** One direct clue (often a place-value clue: *"my hundreds place has a place value of 500"*), two relational. The reveal becomes critical — the student must pick the digit that, once known, lets the relational clues cascade. This is the stretch zone where deductive reasoning really kicks in.

Some rounds have 3-digit numbers, some 4-digit, some 5-digit — the block count adjusts to match.

## Win condition and stars
The student starts with 3 hearts, carried across rounds. Stars are awarded **per round**:
- **3 stars** — correct number typed on the first try, with the reveal used wisely (i.e. on a digit the clues couldn't determine).
- **2 stars** — correct number typed on the first try, but the reveal was used on a digit the clues already determined.
- **1 star** — correct number typed eventually, after a wrong attempt.
- **0 stars** — round failed (hearts gone).

The game ends when either all 10 rounds are complete or all 3 hearts are lost. A perfect run is 30 stars, displayed as *"X / 10"*.

## Feel and motivation
- **The blocks feel like a mystery, not a math problem.** Bright saturated purple, slight pulsing glow, a flip-open animation when tapped — the blocks are *intentionally* theatrical. The student isn't doing place-value drill; they're playing a detective game where the suspect happens to be a number.
- **One reveal is precious.** Limiting the reveal to one digit per round forces strategic thinking. Students who tap the wrong block early can't recover with another tap; they have to trust the clues. This pressure is what teaches the place-value reasoning — without scarcity, students would tap all four and skip the deduction.
- **Clue language is deliberate.** *"Place value"* (which means digit × place) shows up every round at least once, so students who confuse "place" with "place value" get gently corrected by the round's grading.

## Why it works pedagogically
Place value is one of those topics every textbook introduces in week one and every student forgets by week four because it gets used as a labelling exercise (*"underline the hundreds digit"*) instead of a *thinking tool*. This game refuses to let the student treat place value as decoration. To win, they *must* reason about each digit-place independently, link clues across places, and assemble the number back together. After 10 rounds, the four place-value buckets — thousands, hundreds, tens, ones — feel like four separate drawers in the student's head, and they can read or write a number by filling each drawer correctly. That mental model is what unlocks the next two years of arithmetic: subtraction with regrouping, decimal place value, multi-digit multiplication. A session takes about 6–8 minutes — long enough to feel like a real puzzle, short enough to fit at the end of a class period.
