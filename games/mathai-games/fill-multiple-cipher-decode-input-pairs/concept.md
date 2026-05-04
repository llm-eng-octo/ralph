# Secret Decoder — The Letter-Number Cipher Reader

## In one line
A spy-themed decoding game where the student is handed a tattered alphabet key and a message written entirely in numbers — `13-1-20-8` — and has to type back the word those digits spell.

## Who it's for
Class 2–4 students (ages ~7–10) who already know their alphabet cold and can count past 26, but who have never been asked to *map* one symbol system onto another. The stuck-point isn't reading or arithmetic — it's the cognitive jump of holding "A=1, B=2, C=3..." in working memory while scanning a list of numbers and turning each one into a letter without losing the place. Children who can recite the alphabet flawlessly often freeze when asked "what's the 13th letter?" because they've never had to *index* the alphabet before.

## What it tries to teach
The game is built around one quietly powerful idea: **a code is just a function from one set of symbols to another, and applying it carefully gives back meaning**.
Three threads inside that:
- **One-to-one mapping under pressure.** Every number has exactly one letter; every letter has exactly one number. The student internalises that this is a *lookup*, not a guess. Students who try to "feel" the answer instead of checking the key fall apart by the third character.
- **Counting your place in an ordered list.** To find letter #20, the student must either count A-B-C-...-T or use the visual position of the cell. The game's parchment lays the alphabet out in three rows of 9–9–8, so position-counting is faster than recitation — and that visual chunking is the actual mental tool being trained.
- **Rebuilding a word from its parts.** Once each digit has produced a letter, those letters must be assembled left-to-right into a real English word. The game requires the student to type the *word* (not the letters), so the final step is the moment the puzzle resolves into language — the small reward of recognition.

## What the player sees and does
A clean white panel. At the top, a slim status row — the round badge `Q1` on the left, three hearts and a star counter `0/10` on the right. Below the row, a three-line message in friendly text introduces the spy fiction: *"Your friend sent you a message in **secret code**, for practice. Use this key to match every number to the letter."*

The middle of the screen holds the cipher key itself, drawn on a piece of parchment with frayed edges. The 26 letters sit on the parchment in three rows — A through I, J through R, S through Z — each letter in bold above its number in a smaller faded brown. The whole panel feels like a relic, not a math worksheet.

Below the parchment is the puzzle table: a row of three or four word-cells. The first cell is empty with a thin grey input box; the others are already decoded for the student (`IS`, `FUN`) so they can see what a finished cell looks like. Underneath every cell, the original number sequence is printed in small text — `13-1-20-8` for the empty cell, `9-19` and `6-21-14` for the filled ones — making the connection between the cipher and the answer visible.

- **Type the right word** → the cell turns green, a soft *click-click* like a typewriter, the round resolves and the game moves on.
- **Type a wrong word** → the cell shakes, a heart shatters, and the correct letters fade into place character-by-character so the student can see *where* the decoding broke (was it the third letter? the fifth?). Then the next round loads.
- **Type a partial word and pause** → the already-typed letters stay; nothing happens. There's no submit button — the round only checks once the input field has the right number of characters and the student stops typing for a beat.

## Shape of the experience
10 rounds, getting longer and trickier:

- **Rounds 1–3 — Short common words.** 3-letter and 4-letter everyday words like `MATH`, `CODE`, `PLAY`. All letters fall in the first half of the alphabet (numbers 1–13), so the student isn't doing big counts yet.
- **Rounds 4–7 — Longer words, full alphabet.** 5–6 letter words like `PUZZLE`, `SECRET`, `LETTER` that pull from the whole range. Counting from `A` to `R` (18) is now part of the work; students start using the parchment's row breaks (every 9 letters) as anchor points.
- **Rounds 8–10 — Multi-word phrases.** Short two-word messages like `STAY SAFE` or `READ MORE` where the student decodes two empty cells in a single round. A small space between the cells reminds them that words have boundaries.

A new cipher key shuffles in only every couple of rounds, not every round — enough variation to prevent rote memorisation, but not so much that the student loses the feel of "knowing where the letters live."

## Win condition and stars
Three lives total, carried across all 10 rounds. Stars are awarded **per round** based on first-try accuracy, then summed against a 30-star ceiling:

- **3 stars** for typing the word correctly on the first attempt with no backspaces.
- **2 stars** for typing it correctly with corrections (backspace use) before submitting.
- **1 star** for getting it correct after one wrong submission.
- **0 stars** for the round if a heart is lost or the round is abandoned.

The displayed counter is `X / 10` — a compressed view of the underlying 30-star tally — so a perfect run reads as `10 / 10`. The game ends when either all 10 rounds finish or all 3 hearts are gone.

## Feel and motivation
- **Parchment, not screens.** The cipher key has a hand-drawn look on purpose. The fiction of "your friend's secret message" is sustained in every visual choice — even the typed letters appear in a serif font, like ink — so the student feels like a code-breaker rather than a test-taker.
- **The two pre-decoded words are tutors.** `IS` and `FUN` aren't filler; they're scaffolding. A student stuck on `13-1-20-8` can glance at `9-19 → IS` and confirm: yes, this *is* how the code works, the 9 really does become I.
- **Numbers stay small.** No cipher in the game uses numbers above 26 (the alphabet's natural ceiling), and most words avoid the X/Z/Q range so the student isn't constantly hunting the bottom row of the parchment. The challenge is the *mapping*, not the lookup.

## Why it works pedagogically
This game is the gentlest possible introduction to a foundational mathematical idea: a **function** as a one-to-one rule. Long before students meet the word "function" in algebra, they need to feel comfortable with "every input has exactly one output, and you can reverse the rule to decode." Cipher work is also where many children first experience the small thrill of *deciphering* — a piece of nonsense becomes a sentence because they applied a rule correctly. That feeling is the seed of every later moment in math when an unreadable expression simplifies into something obvious. A 10-round session takes 4–6 minutes; long enough to feel like real spy work, short enough to slot into the warm-up of any number-systems lesson.
