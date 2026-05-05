# One Stick To Truth — The Matchstick Equation Fix

## In one line
A visual puzzle where a wrong arithmetic equation is built out of matchsticks (`8 + 8 = 8`) and the student must drag exactly *one* stick — from a digit, an operator, or anywhere — to a new position to turn the equation into a true statement, with the option to convert a `+` into a `−` (or vice versa) on the way.

## Who it's for
Class 5–7 students (ages ~10–13) who can do single-digit arithmetic in their sleep but think of arithmetic as a one-way pipe — *given inputs, compute output*. The game is for the kid who can solve `8 + 8` instantly but has never asked themselves *"what other digits can I make from this 8 by removing a stick?"* It's a sideways teaching of digit anatomy, operator structure, and equation balance — exactly the kind of lateral thinking that classroom math rarely rewards but competitions and engineering reasoning demand.

## What it tries to teach
The whole game is built around one slippery skill: **treating digits and operators as visual structures that can be reshaped, not just symbols that can be computed**.
Three threads inside that:
- **Digit anatomy.** A 7-segment `8` has 7 sticks; a `9` has 6, a `6` has 6, a `0` has 6. Removing one stick from `8` can leave a `0`, a `6`, or a `9` depending on *which* stick. The student learns the topology of digits — a small piece of "vision math" most students never explicitly meet.
- **Operator surgery.** A `+` is a `−` plus one vertical stick. So moving a stick *off* the `+` and onto a digit converts the operator and changes the equation type. The hint *"You can also change the sign!"* invites this move, but discovering it for oneself is the rush.
- **Equation balance.** After each candidate move, the student has to mentally re-evaluate the new equation. Is `8 − 8 = 0`? Yes! Is `9 + 9 = 0`? No. Quickly checking candidate moves trains the student in fast equation evaluation — the same loop a chess player uses to evaluate candidate moves.

## What the player sees and does
A clean white panel. The thin top status row holds the `Q1` badge with the teacher's avatar on the left, a big blue **00:00** countdown (count-up timer for stars, no fail) in the middle, and an `0/10` star tally with a soft cyan star on the right.

Below the instruction text — *"Move any **1 stick** to make the given statement correct."* with a smaller hint line *"💡 **Hint:** You can also change the sign!"* — sits a thin yellow progress bar labelled *"Moves left"* with `1` on the right.

The middle of the screen is the puzzle: an equation rendered in matchsticks. Each digit is a 7-segment box of yellow sticks with red match-heads at every endpoint; the `+` and `=` signs are also made of sticks. The reference puzzle reads `8 + 8 = 8` — visibly false. Empty grey "ghost" segments sit faintly behind each digit, marking the slots where a stick *could* go. Each visible stick is draggable.

Below the puzzle sits a small **Reset** button with a circular yellow arrow icon, ready to undo all moves and restore the original equation.

- **Tap and drag a stick** → the stick lifts with a soft *click*, the ghost segments brighten to show legal landing spots (any empty 7-segment slot in any digit, plus the operator's missing arm).
- **Drop on a legal slot** → the stick locks in, the moves-left bar drops to `0`, and the equation re-renders with the new digit/operator. The game then evaluates: if true, a *cha-ching* plays, the equation glows green, and the round resolves. If false, a soft *clunk*, the equation goes red briefly, and a one-line hint appears: *"That equation is `9 + 8 = 8` — try again."* The Reset button starts pulsing.
- **Drop on an illegal slot or release mid-air** → the stick snaps back to its original position, no moves consumed.
- **Tap Reset** → all moves are undone with a swift animation and the original puzzle returns. Reset is unlimited; the game is patient.

There's no fail state on a single round — the student can reset and try forever. The clock just measures how fast the right move came.

## Shape of the experience
10 rounds, the puzzles deepening in lateral-thinking demand:

- **Rounds 1–2 — Single-digit fix.** `1 + 2 = 4` → move one stick from the `4` to make `1 + 2 = 3`. Pure digit surgery, no operator change.
- **Rounds 3–4 — Operator hint.** `2 + 3 = 4` → student is meant to notice they can move the vertical stick off the `+` to make `2 − 3 = −1`… no, even better: move it onto a `2` to make `5 + 3 = 8`. (Designers pick puzzles with at least one non-operator solution to keep the surface intuitive.)
- **Rounds 5–6 — Operator change required.** `8 + 8 = 8` → there's no single-digit fix. The student must convert `+` into `−` and adjust a digit elsewhere, like `8 − 0 = 8`. This is where the hint earns its keep.
- **Rounds 7–8 — Subtle puzzles with multiple solutions.** `6 + 4 = 4` → could be `5 + 4 = 9`, `6 − 4 = 2` (no, requires more), etc. Multiple right answers; any one of them resolves the round.
- **Rounds 9–10 — The stretch.** Three-digit equations like `5 + 7 = 2` where the student has to re-imagine multiple digits.

## Win condition and stars
Stars per round, summed:

- **3 stars** — solved on the first attempted move (no Reset, no wrong drops).
- **2 stars** — solved within 3 attempted moves (some Resets allowed).
- **1 star** — solved eventually, however many resets it took.
- **0 stars** — round skipped (a softer "Show solution" appears after 60 seconds of inactivity).

There are no lives because resetting is the intended verb. The total cap of 30 stars rewards lateral-thinking-on-the-first-try, and the fallback star tiers ensure even a struggling student finishes the run with something on the scoreboard.

## Feel and motivation
- **Sticks feel real.** Each match is a chunky 3D-shaded yellow rod with a red round head. Picking one up tilts it with a soft shadow; dropping it makes a wooden *clack*. The physicality reinforces that a stick is a *thing* you move, not a symbol you transform.
- **Ghost segments do gentle teaching.** When a stick is in the air, the legal landing slots brighten faintly. A child who hasn't yet realised that the missing top of a `0` is a slot can see it light up and learn a digit's anatomy by playing.
- **Reset is celebrated, not punished.** The button is the same warm yellow as the win-state. The game is communicating: *experimenting is the verb, not the failure*. This is unusual for a math game and very deliberate.

## Why it works pedagogically
Standard arithmetic teaches students to compute forward — given an equation, find the missing piece in a single named slot. This game teaches them to manipulate the *whole equation as a structure*, which is the cognitive move underlying algebraic transformation, geometric proof, and most kinds of mathematical play. The matchstick framing makes the manipulation tactile and finite — only one stick, only the visible structure — so it's not overwhelming, but the leap it asks the student to make (re-imagining a digit) is intellectually large. Solving even one of these gives the student the same *"oh!"* feeling that good math should give every day. A 10-round session takes 8–15 minutes; doing them at the start of class as a brain-warmer reliably puts students into a problem-solving mood for the lesson that follows.
