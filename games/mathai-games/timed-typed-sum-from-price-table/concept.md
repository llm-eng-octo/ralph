# Cart Total — The 40-Second Shopping List Sprint

## In one line
A timed mental-addition game where the student stares down a six-row shopping receipt — books, pencils, plates, a watch — rounds the prices in their head, and types the total into the bottom of the table before forty seconds tick out.

## Who it's for
Class 4–5 students (ages ~9–11) who can add three-digit numbers cleanly on paper but stall the moment six prices land on screen and a clock starts running. The game targets the specific stuck-point where the student *knows* how to add `399 + 499` but reaches for a notebook before they think to estimate. It's for kids who haven't yet learned that "shopping addition" is mostly rounding plus a small correction.

## What it tries to teach
The whole game is built around one quiet but high-leverage skill: **fluent mental addition of a list of two- and three-digit prices**, fast enough to be useful at a real shop counter.
Three threads inside that:
- **Round-and-correct.** Prices like `399`, `499`, `999` are practically begging to be treated as `400`, `500`, `1000`. The fluent move is to total the rounded numbers (`400 + 500 + 400 + 1000 + 500 + 1000 = 3800`) and then subtract the small corrections (`-1 -1 -1 -1 -1 -1 = -6`). The game is *built* from prices ending in 99 and 49 to make that move the obvious one.
- **Holding a running total.** Six prices is too many to keep in working memory as a list. The student learns to chunk — sum two, hold, sum two more, hold — and arrive at the total without paper.
- **Trusting the estimate.** With the timer ticking, the student must commit to a number and type it. Most kids at this level *can* compute the sum but won't *commit* without checking. The 40-second window is the deliberate squeeze that forces commitment.

## What the player sees and does
A clean white panel. At the top, a thin status row — Q1 badge with a friendly avatar, a big blue countdown reading `00:40` and ticking, and a `0/10` star tally on the right.

Below that a two-line instruction in large friendly text: *"Guess the total cost of the items. You have 40 seconds to guess. Your time starts now!"* The word *guess* is doing real work — it gives the student permission to estimate.

The body of the screen is the receipt itself: a vertical table with two columns titled **Items** and **Price (₹)**. Six rows follow — a small illustration of each item (a comic book, a pencil pack, golf clubs, a plate of food, a watch, a family figurine) on the left, and its price on the right (`399`, `499`, `399`, `999`, `499`, `999`). The cells have soft green headers and clean black numerals. The very last row is the **Total** row: green label on the left, an empty white input box on the right where the answer goes.

- **Type the right total and submit before 40s** → the Total cell turns green, a quick *cha-ching*, the round badge ticks up, and a star is awarded.
- **Type a wrong total** → the cell flashes red, a heart shatters in the top right, and the correct total appears in faded green for a beat before the next round loads.
- **Run out of time** → the timer flashes red, all rows dim, the correct total reveals, a heart shatters, and the round ends.

There is no on-screen scratch space, no calculator, no number pad — just the receipt and a typing input. The deliberate absence of a workspace is the point: the student must *do this in their head*.

## Shape of the experience
10 rounds, gradually trickier:

- **Rounds 1–3 — Round-friendly prices.** All six items priced like `99`, `199`, `299` — every price one rupee under a clean hundred. Totals land in the 1,000–2,000 range. Students should clear these in 20 seconds once they spot the pattern.
- **Rounds 4–7 — Mixed prices.** A couple of items priced like `249` or `349` mixed in. The student now has to round to the nearest fifty in places, and track the total correction more carefully.
- **Rounds 8–10 — Stretch.** Six items with mixed `99`, `49`, `19` endings. Totals climb into the 3,000–5,000 range. The corrections add up to non-trivial numbers like `-12` or `-18`, which students who got lazy will miscount.

## Win condition and stars
The student starts with 3 hearts, carried across all 10 rounds. Stars are awarded **per round**:
- **3 stars** — correct total typed in under 25 seconds, no wrong attempts.
- **2 stars** — correct total typed in under 40 seconds, no wrong attempts.
- **1 star** — correct total typed eventually, but after a wrong attempt or after the timer expired and the student got a retry.
- **0 stars** — round ends with no correct entry.

The game ends when **either** all 10 rounds are complete **or** all 3 hearts are lost. A perfect run is 30 stars; the headline tally up top reads *"X / 10"* and weighs the harder rounds more.

## Feel and motivation
- **Prices look like a shop, not a worksheet.** The little item illustrations (book, pencils, plate of food) anchor the math in a real-world frame. The student isn't adding "numbers" — they're tallying a cart, which is the actual situation this skill exists to serve.
- **The timer is loud.** The countdown is the largest text in the status row. It ticks audibly under 10 seconds and shifts blue → amber → red. This is the squeeze that converts careful long-addition into estimate-and-correct.
- **Rounds are reusable.** The price bank holds about 80 items spread across categories (stationery, food, clothes, electronics, toys), and each round samples six of them, so a student replaying the game gets a fresh receipt each time and can't memorize totals.

## Why it works pedagogically
By Class 4, the textbook teaches column addition with carrying, but real-life arithmetic — shop totals, restaurant bills, splitting costs — is almost never done that way. It's done by rounding and correcting, in your head, under social time pressure. This game is a deliberate rehearsal of that real-world move. By scoping the math down to *just* a six-item shopping list with prices designed to round cleanly, the game lets the student feel the gear-shift from "compute exactly on paper" to "estimate then correct in your head" without anything else in the way. After two weeks of daily play, students arrive at a shop counter with a tool they didn't have before — the ability to *know* what their cart costs before the cashier scans the last item.

A 10-round session takes 4–6 minutes. Short enough to drop in as a daily warm-up, long enough that a child internalizes the round-and-correct move.
