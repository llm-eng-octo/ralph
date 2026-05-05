# Treasure Path — The Pirate's Coin-Counting Sum

## In one line
A pirate-themed addition game where the student adds up the coins scattered along a path between a tiny pirate and a treasure chest, and types the total into a single input box to claim the gold.

## Who it's for
Class 2–4 students (ages ~7–10) who can add two-digit numbers but freeze when one of the addends is a much bigger number — like adding `6000 + 10 + 3`. The stuck-point is **mixed-magnitude addition**: a child fluent at `34 + 27` will often write `6013` as `60103` or `7013` because they line up the wrong digits, or they try to do the whole calculation in their head and lose track of the place values. The game is for the moment when the student needs to internalise that adding `6000` and `10` doesn't change the `6` or the `1` — they live in different "places" and ignore each other.

## What it tries to teach
The game is built around one quietly important skill: **adding numbers of very different magnitudes by aligning place values, not by sequential addition**.
Three threads inside that:
- **Place-value awareness over digit-addition.** The student learns that `6000 + 10 + 3 = 6013` not by adding sequentially (`6000 + 10 = 6010`, then `6010 + 3 = 6013`) but by *seeing* that each addend lights up a different column: thousands, tens, ones — and the answer is just those columns side by side. This is a structural insight, not a procedural one.
- **Resisting the urge to "do something" with the numbers.** Children at this age often respond to seeing three numbers by trying to multiply, subtract, or pattern-match. The instruction is *sum*, plain and simple. The game's framing — "all the gold is yours if you tell me the total" — gives addition a clear, motivated reason.
- **Reading numbers with leading zeros and gaps.** When the answer is `6013`, the student sees a `0` in the hundreds place that came from *nowhere* — there was no hundreds addend. Recognising that empty places mean zero is a moment many children miss, and this game manufactures it cleanly.

## What the player sees and does
A clean white panel with the familiar status strip — round badge `Q1`, two-heart indicator, star counter `0/10`. Below it, the scene-setter in friendly text: *"The pirate found a treasure chest for you 🏴‍☠️"*.

A small smiling pirate illustration sits centred — bandana, wide grin, hands-on-hips, drawn in flat warm colours. Below the pirate, three pale-yellow tiles are arranged in a tiered "stepping stones" path: one tile centred above (`6000`), and two tiles side-by-side just below (`10` and `3`). To the right of the lower row, a tiny treasure chest icon overflows with gold coins — the destination.

Below the path, two short instruction lines: *"If you tell the **total coins** collected on the path to the chest, all the gold from that chest is yours! Can you win it?"*

At the bottom, a single rectangular input field labelled *"Type here"* — no number pad, no expression builder, just one box for the total.

- **Type the right total and submit** → the path tiles each fade, their coin contents fly into the treasure chest, the chest lid pops open, gold coins burst out in a small confetti, and a *cha-ching* plays. Round resolves.
- **Type a wrong total** → the chest stays closed, a heart shatters, and a one-line correction appears: *"Not quite — the path had **6013** coins. Watch the place values."* The correct total is then animated digit-by-digit into the field before the next round.
- **Type a wrong total that's a common error** (e.g. `60103` for `6000 + 10 + 3`) → the same correction, but with a more specific hint: *"The 10 sits in the **tens** place — it doesn't add a digit."*
- **Leave the field blank for too long** → no penalty, but a faint glow appears around the input box and the path tiles pulse once, drawing attention back.

## Shape of the experience
10 rounds, gradually scaling magnitude:

- **Rounds 1–3 — Friendly small numbers.** Three tiles like `40 + 5 + 2` or `200 + 30 + 4`. The student learns the rhythm: read the tiles, sum them, type the answer. No place-value tricks yet.
- **Rounds 4–7 — Big-and-tiny mixes.** Like the reference: `6000 + 10 + 3`, `3000 + 200 + 7`, `9000 + 50 + 1`. The student must hold a four-digit number while adding a two-digit and a one-digit. This is the core teaching zone.
- **Rounds 8–10 — Four tiles and place-value gaps.** Now four coins on the path, e.g. `5000 + 300 + 0 + 8`, where one of the path tiles deliberately holds a `0` so the student notices that *missing* contributions are still part of the total. Or `7000 + 60 + 4` with a "skipped" hundreds place to write as `7064`.

The pirate's pose changes between rounds — sometimes celebrating, sometimes pointing — and the chest's coin count grows visibly with progress, just for the small thrill of accumulation.

## Win condition and stars
Three hearts, carried across all rounds. Stars per round are based on **first-attempt accuracy**:

- **3 stars** for typing the right total on the first try with no backspaces.
- **2 stars** for typing it correctly after self-corrections (backspaces).
- **1 star** for getting it correct after one wrong submission.
- **0 stars** for the round if a heart is lost.

Tally is `X / 10`. The game ends at round 10 or when all three hearts are gone. There's no time limit — counting is the point, not racing.

## Feel and motivation
- **The pirate is a friend, not a teacher.** No instructional dialogue, no "great job!" banners. The pirate just stands there, beaming, and the chest rewards correct sums by spilling more gold. The fiction does the motivating; the math is the math.
- **Tiered tile layout is a hint.** The big-magnitude tile (`6000`) sits *above* the small-magnitude tiles (`10`, `3`), which subtly suggests its place-value dominance. Students who internalise the visual layout often start aligning their typed answer column-by-column without thinking about it.
- **The input box is alone.** No place-value scaffolding (no `___ ___ ___` digit-by-digit boxes), no comma helpers, no number pad with thousands-button. The student types one continuous number. This is deliberate: the game wants the *answer* to come out of the student's understanding, not out of a UI-imposed structure.
- **Decoy errors are diagnostic.** Common wrong answers — concatenating digits (`60103`), forgetting a tile (`6010`), or place-value-shifting (`6103`) — each trigger a slightly different hint. Teachers reading the gauge view can see exactly which mistake the student is making.

## Why it works pedagogically
"Just add these numbers" sounds trivial, but for many Class 2–4 students it's a place-value crisis disguised as an arithmetic question. Adding `6000 + 10 + 3` correctly requires the student to reject the urge to "do something with the digits" and instead recognise that addends in different magnitude bands compose cleanly. This skill underwrites later success in multi-digit subtraction (where misalignment is fatal), decimal addition, and column arithmetic in algebra. The game rehearses it 10 times in a session with no procedural overhead — no number pad, no carrying drills, just *see the addends, hold the sum, type it*. A session takes 4–7 minutes, slots cleanly into a place-value lesson warm-up, and gives a teacher's gauge view a clear signal of which students are still struggling with mixed-magnitude alignment.
