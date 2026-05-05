# Maximum Crossword — The Place-Value Sum Maximiser

## In one line
A digit-rearrangement puzzle where the student looks at a crossword-shaped grid of two interlocking numbers, and decides which loose digits go in which slots so the two numbers add up to the biggest sum possible.

## Who it's for
Class 4–6 students (ages ~9–12) who can already add multi-digit numbers and know what "place value" means in a textbook sense, but haven't yet *felt* it — they don't intuitively know that swapping a 9 from the ones place to the thousands place is worth nearly a thousand more, not just six more. The game is for the moment a child stops reading every digit as "just a digit" and starts reading them as "this digit, multiplied by where it lives."

## What it tries to teach
The whole game is built around one quietly powerful idea: **a digit's worth depends on its column, and to maximise a sum you push your biggest digits into your most expensive columns.**
Three threads inside that:
- **Place value as currency.** Across two numbers (a 3-digit row and a 4-digit column sharing one cell) the leftmost slots are the thousands position; they pay a thousand rupees per digit. The rightmost are the ones; they pay one rupee per digit. The student learns to spend their nines and eights in the expensive seats and bury their zeros and ones in the cheap ones.
- **Constraint reading.** Half the digits are *fixed* — locked into grey cells that cannot be moved. The student has to look at what's already pinned (a 7 in the tens, a 4 somewhere in the middle of the column) and route the remaining movable digits around them. This trains the habit of reading *what's free* and *what's locked* before reaching for a number.
- **Comparing alternatives without recomputing.** The student should not be re-adding the entire sum after every swap. They should be reasoning: *"this 8 is currently in the tens; if I move it to the thousands, the sum goes up by 8000 - 80 = 7920."* That delta-style reasoning is the actual cognitive prize.

## What the player sees and does
A clean, sparse panel. At the top the standard status row — avatar, round badge `Q1`, lives heart with a `2`, progress chip `0/10`, and a yellow star icon. Below the status row sits the instruction in soft, friendly text: *"Rearrange the digits in the grid in such a way that the **sum** of all numbers is **maximum**. Digits in grey are fixed and cannot be moved!"*

In the middle of the screen, a small cross-shaped grid floats on the white space. Two labels in pencil-handwriting style — *"Number 1"* with an arrow pointing left at the horizontal row, *"Number 2"* with an arrow pointing down at the vertical column — name the two numbers being built. The horizontal row is three cells wide; the vertical column is four cells tall; they share one cell at the corner. Each cell is a square with a single digit. White cells are movable; grey cells are pinned. In the reference layout the row reads `6, 7, 0` (with the 7 locked) and the column reads `8, 5, 4, 9` (with the 4 locked) — leaving five free digits that can be reshuffled across five free positions.

- **Drag a movable digit onto another movable cell** → the two digits swap places with a soft *thunk*; the running sum (rendered subtly below the grid) updates to the new total.
- **Drag onto a grey cell** → the cell pulses red briefly and the digit snaps back; a one-line hint murmurs *"that one's locked."*
- **Tap Submit when the arrangement is final** → if the sum is the true maximum possible given the fixed cells, the cells flash green in sequence, a small victory chime plays, and the round resolves. If the sum is high but not the true maximum, the game shows a single tier hint: *"Close! Could a bigger digit live in a more expensive seat?"* and lets the student keep rearranging — without docking a life on the first miss.
- **Idle for 12 seconds** → the most valuable empty seat (highest place value still holding a small digit) gets a faint glow.

## Shape of the experience
10 rounds, gradually meaner about constraints:

- **Rounds 1–3 — One free swap.** Almost every cell is grey except two free digits in two free cells. There is exactly one swap that improves the sum, and it's obvious. The student gets the rhythm.
- **Rounds 4–7 — Three or four free digits.** The fixed cells are placed so that the student has to think two moves ahead — putting the biggest digit in the thousands sometimes forces a small digit into the next-best slot.
- **Rounds 8–10 — Adversarial fixed cells.** A small digit (a 1 or a 2) is locked into the thousands slot of one of the numbers, and a large digit (an 8 or 9) is locked into a low slot of the other. The student has to accept the loss on one number and *fully optimise* the freedom they have on the other.

## Win condition and stars
Three lives across the full ten-round session. A round costs a life only on the *second* wrong submission; the first miss is a free hint. Stars are awarded by **how many rounds resolved on the first submit**:
- **3 stars** — 9 or 10 first-submit correct, no lives lost.
- **2 stars** — 6–8 first-submit correct.
- **1 star** — finished all 10 rounds with at least 1 life remaining.
- **0 stars** — all hearts lost before round 10.

Time is unbounded. The point is to think clearly about place value, not to scramble.

## Feel and motivation
- **Digits feel like furniture.** Drag-and-drop is unhurried, with a slight elastic bounce when a digit settles into a cell. Children who like fidgeting with tangible blocks recognise the feel immediately.
- **The grid never lies.** The running sum below the cross updates live as digits move, but the *target* (the maximum possible sum) is never shown. The student has to commit to "I think this is the best" rather than chase a number on screen.
- **Decoy temptations.** In Stage 3, the layout is rigged so that the *most natural* swap (biggest digit to biggest column of Number 2) is actually slightly worse than spreading the big digits across both numbers. A student who has internalised "biggest digit, biggest seat" without understanding *across two numbers* will get caught here.

## Why it works pedagogically
Place value is one of those topics where Indian classrooms succeed at the vocabulary — every Class 4 student can say "ones, tens, hundreds, thousands" — and fail at the *intuition*: a startling number of Class 6 students still treat 8 in the thousands and 8 in the ones as roughly equivalent because both are "an eight." Asking them to maximise a sum by rearranging digits forces the intuition out of hiding, because if they're wrong the number visibly shrinks. The crossword shape is doing extra work here too: it puts two numbers on the screen at once, sharing a digit, which trains the habit of seeing place-value seats *across* numbers, not just within one — exactly the move they'll need when they hit column addition with carrying, or, later, polynomial arithmetic. A 10-round session lasts about 6–10 minutes, long enough to feel like a proper puzzle block, short enough to do daily as a place-value warm-up.
