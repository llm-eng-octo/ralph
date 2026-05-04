# Piggy Bank Subtraction — The Place-Value Withdrawal Game

## In one line
A money-themed subtraction game where the student watches a 4-digit balance lose a few notes of various denominations, then taps each digit on a small display to *click* it down to the correct new balance — feeling the place-value subtraction column by column.

## Who it's for
Class 3–4 students (ages ~8–10) who have learned the standard subtraction algorithm on paper but treat each digit-by-digit step as a magic ritual rather than a withdrawal of a *specific quantity from a specific column*. The game is for the awkward middle stage where a child can mechanically compute `6789 - 2340` on a notebook (line up the digits, borrow if needed, write the answer below) but cannot answer *"if I take three hundred-rupee notes, which digit changes and by how much?"* without recomputing.

## What it tries to teach
The whole game is built around one big idea: **subtraction by denomination is just place-value subtraction wearing different clothes.**
Three threads inside that:
- **The thousands digit minds the thousand-rupee notes.** When the problem says *"she takes 2 notes of ₹1000"*, the only digit that should move is the thousands digit, and it should move by exactly 2. The game makes this physical — tapping the thousands digit decrements it; the student literally watches `6 → 5 → 4` while internalising that they've removed ₹2000.
- **Each column is independent — until it isn't.** Most rounds are clean (no borrowing), so the student sees that the hundreds digit responds to hundred-rupee notes, the tens digit to ten-rupee notes, and the columns don't talk to each other. Later rounds introduce one borrow, and the student suddenly has to confront *what happens if you try to remove more notes than this column has*. That's where regrouping clicks.
- **Note-by-note thinking, not algorithm-by-algorithm.** The game refuses to let the student write a vertical subtraction. They must think *"first I remove 2 thousand-notes, that's the thousands digit, tap-tap. Now 3 hundred-notes, that's the hundreds digit, tap-tap-tap"* — exactly the way a real cashier or shopkeeper handles money.

## What the player sees and does
A clean, vertically-flowing screen built like a small story. The status row at the top shows the round badge, lives heart with `2`, and the progress chip `0/10`.

Below the status row, the screen reads like a children's storybook page:

1. **Setup line.** *"Tanvi has a piggy bank that displays the total amount of money it contains like this 👇"* — friendly text, with a finger-pointing emoji nudging the eye downward.
2. **Current balance display.** A label *"Current Balance 👇"* sits above a row of four digit-cells in a thin black grid, showing the starting balance (e.g. `6 7 8 9` for ₹6,789). These cells are static, read-only — they mark the *before* state.
3. **The withdrawal scenario.** *"She takes **2 notes of ₹1000**, **3 notes of ₹100** and **4 notes of ₹10** from her piggy bank to buy a watch."* Below that, a delightful little illustration: a watch on the left, an equals sign in the middle, and three rows on the right showing `2 ×` a ₹1000 note image, `3 ×` a ₹100 note image, and `4 ×` a ₹10 note image. The economy of the trade is right there on the screen — this watch literally costs these notes.
4. **Tap-to-update grid.** A second instruction *"Tap on the digits below 👇 to reduce the current balance of her piggy bank"* introduces the *interactive* grid — the same four-cell shape as the static balance, but tappable. It starts at the original balance (`6 7 8 9`) and the student has to tap their way down to `4 4 4 9`.
5. **Reset button.** A small Reset button below the grid lets the student undo all their taps and start the round over.

Tapping a digit decrements it by 1 (and rolls from 0 back to 9 for over-correction); a long-press or right-tap could increment, but the typical interaction is *tap to count down*.

- **Reach the correct balance** → the four cells flash green together, a soft *cha-ching* like a cash register, and the round resolves.
- **Stop on a wrong balance and idle** → after 8 seconds the wrong column gets a faint red underline, prompting *"check the hundreds"* without giving the answer.
- **Tap Reset** → all four digits snap back to the starting balance with a pleasant whoosh, no penalty.

## Shape of the experience
10 rounds, with the friction shifting subtly:

- **Rounds 1–3 — Clean withdrawals.** Each note count is small enough that no column needs to borrow. The student practises the basic loop: read each note line, tap the matching digit that many times.
- **Rounds 4–7 — Mixed denominations.** Withdrawals include thousands, hundreds, tens, *and* ones. Notes are introduced for ₹1 too. Multiple columns change in the same round, so the student has to stay organised about which note line they're processing.
- **Rounds 8–10 — Borrow rounds.** The starting balance has a small digit in one column and the withdrawal asks for *more* notes than that column holds. The student has to decrement an adjacent column to "break" a higher-denomination note into ten lower-denomination ones — a guided introduction to regrouping, made physical by the tapping.

## Win condition and stars
Three lives across the session. A wrong submit costs a life; using Reset never costs a life. Stars are awarded by **rounds resolved on the first submit**:
- **3 stars** — at least 8 of 10 rounds correct on first submit.
- **2 stars** — 5–7 first-submit correct.
- **1 star** — completed all 10 rounds with at least one heart left.
- **0 stars** — all hearts lost before round 10.

There's no clock. The point is to think about denominations, not race them.

## Feel and motivation
- **Money looks like money.** The note images are real Indian rupee illustrations — the orange ₹10, the lavender ₹100, the salmon ₹1000 — so the connection between *that note image* and *this digit cell* is intuitive, not abstract.
- **Tapping feels like counting.** Each tap on a digit produces a soft click and a tiny dip-and-bounce of the cell, so the student is *physically counting down* the way they would peel notes off a stack. The tactile feedback is the lesson.
- **Decoy temptations.** In Stage 3, one round has a starting balance with a `0` in the tens column, and the withdrawal asks for two ₹10 notes. A student who hasn't yet internalised borrowing will tap the tens cell, watch it roll to `8` (because it cycled past `0` to `9` then `8`), and confidently submit a wrong answer that's `100` more than the right one. The error is informative, not random — it reveals the exact concept gap.

## Why it works pedagogically
The Indian primary curriculum introduces subtraction with regrouping as a procedural drill — borrow from the next column, cross out, write the small number above. This works for the well-prepared minority and looks like nonsense to the rest. Rooting subtraction in *money* and *notes-of-each-denomination* gives the procedure a meaning every Class 3 child already understands viscerally: you cannot pay with a note you don't have, but you can break a bigger note for change. The interactive digit-cell display makes the act of subtracting *visible at the column level*, so the student sees that the hundreds digit drops because they removed hundred-rupee notes, not because of any abstract algorithm. By the time they hit borrowing in Stage 3, they are not learning a new rule — they are extending one they already feel. A 10-round session takes about 8–12 minutes, comfortable as a Friday warm-up or a homework starter.
