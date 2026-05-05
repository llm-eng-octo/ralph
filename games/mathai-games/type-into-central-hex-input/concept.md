# Hexa Numbers — The Honeycomb Place-Value Builder

## In one line
A honeycomb-shaped place-value game where the student stares at two clusters of hexagons — each cluster a flower of six numbers around a hollow centre — and types in the centre the *sum* of the six surrounding values, building a number out of its place-value components.

## Who it's for
Class 3–5 students (ages ~8–11) who can read a number like `5,724` and name its digits' place values out loud, but haven't yet *built* a number from its parts the other way around. The game is for the conceptual move from *decomposition* (taking 5,724 apart into 5000 + 700 + 20 + 4) to *composition* (looking at scattered components like `2000`, `40`, `5`, `100`, and assembling them into 2,145 in your head).

## What it tries to teach
The whole game is built around one quietly important idea: **a number is a sum of its place-value parts, and being fluent in math means moving freely in either direction between the parts and the whole.**
Three threads inside that:
- **Composition by addition.** When the surrounding hexagons read `1000, 100, 30, 5000, 500, 20`, the centre is just `1000 + 100 + 30 + 5000 + 500 + 20 = 6650`. The student practises adding numbers that are deliberately spread across multiple place-value columns, so each addition is more like *placing a digit* than *combining quantities*.
- **Working with non-canonical parts.** Real life rarely hands you the place-value components in tidy textbook form. The hexagons mix in random orders — thousands next to ones next to tens — and sometimes a single column appears twice (a `40` and a `30` together meaning `70` in the tens place, with no carry). Students learn to group like-place-value parts before summing.
- **Sharing components across clusters.** The two flowers in the layout *share* one or two hexagons along their meeting edge, so the same number (say `5000`) belongs to both sums. This forces the student to read each cluster as its own sum without double-counting cross-shared parts in their head — a small but real test of careful reading.

## What the player sees and does
A clean, slightly mathematical-looking panel. The status row at the top is the standard one: round badge `Q1`, lives heart with `2`, and a yellow star with `0/10`.

Below the status row, two soft instruction lines: *"Blue hexagons have already been arranged."* and *"**Type** the numbers at the **centre** to complete the hexa numbers."*

The body of the screen is the headline visual: two honeycomb flowers laid out side by side. Each flower has:

- **Six light-blue (mint-tinted) hexagons** arranged in a ring, each showing a place-value number such as `1000`, `100`, `30`, `5000`, `500`, `20`. The numbers are large and friendly, with no decoration — the hexagon shape itself does the visual work of suggesting "petal" and "cluster."
- **One dark-green hexagon at the centre** with a hollow rectangle inside it, ready for typed input.

The two flowers overlap along their facing edge, sharing one or two hexagons (in the reference layout the `20` hexagon and the `5000` hexagon are shared between the two clusters). The shared cells are visually identical to the others; the student has to *notice* the sharing.

The student plays by tapping into a centre input and typing a number on a soft on-screen number pad (or the device keyboard):

- **Type the correct sum into a centre and confirm** → the centre fills with a soft mint colour, the typed number locks in dark green, and a small *bloom* animation ripples outward through the surrounding hexagons.
- **Type a wrong sum and confirm** → the centre flashes red briefly and the input clears, with a one-line hint such as *"close — check the hundreds column"* (the game compares the typed number to the correct one and points to the place-value column where they differ).
- **Tap a surrounding hexagon** → no interaction; the surrounding hexagons are read-only. (Some variants let you tap to "highlight" a hexagon while computing, like a mental abacus, but it does not change values.)
- **Both centres correctly filled** → the whole flower lattice glows gold for a second, a chord plays, and the round resolves.

The student can switch between the two centres freely; both must be correct to clear the round.

## Shape of the experience
10 rounds, with the place-value count and complexity increasing:

- **Rounds 1–3 — Three-column sums.** Each cluster sums to a 3-digit number; surrounding hexagons cover hundreds, tens, and ones only. Two clusters with no shared hexagons.
- **Rounds 4–7 — Four-column sums with a shared hexagon.** Each cluster sums to a 4-digit number; the two clusters share exactly one hexagon along their seam, so the student must read each sum independently.
- **Rounds 8–10 — Mixed columns and double-occurrence.** Within a single cluster, the same place value can show up twice — for example two hexagons in the tens column (`30` and `40`), so the student must add them together and *carry* into the hundreds. This nudges into the territory of regrouping.

## Win condition and stars
Three lives across the session. A wrong submit (typing a wrong sum and pressing confirm) costs a life; clearing the input and re-typing is free. Stars are based on **rounds resolved on the first confirm**:
- **3 stars** — at least 8 of 10 first-submit correct.
- **2 stars** — 5–7 first-submit correct.
- **1 star** — completed all 10 rounds with at least 1 life remaining.
- **0 stars** — all hearts lost before round 10.

There's no timer. Composition takes thinking, and the game respects that.

## Feel and motivation
- **The hexagons feel like a flower, not a worksheet.** The honeycomb arrangement is visually unusual enough that students who normally dread place-value drills approach this puzzle with the curiosity reserved for new things. The shape itself is part of the pedagogy — it disguises the math.
- **The shared-hexagon trick teaches careful reading.** A surprisingly large number of children, on first encounter, sum *all twelve* surrounding hexagons into the wrong centre, treating the two clusters as one giant flower. The game catches this on the first wrong submit and points the student back to *one cluster at a time*, which is itself a useful skill.
- **The number pad is intentionally minimal.** Only digits and a backspace; no operations, no tools. This signals that the math has already been done in the head; the student is just transcribing the result. That framing — *the computation is mental, the typing is the report* — is the whole pedagogical posture of the game.

## Why it works pedagogically
Indian textbooks teach place value from the decomposition side — *"break 4,572 into 4 thousands, 5 hundreds, 7 tens, 2 ones"* — and then assume the inverse (composition) is automatic. It isn't. A child who can decompose `4,572` may still need 30 seconds to assemble the same number from `4000, 500, 70, 2` if those parts are presented in a non-canonical order. This game targets that exact asymmetry, with two extra twists: the *visual* arrangement breaks the textbook left-to-right place-value column ordering, and the *shared* hexagon forces the student to read each cluster as a closed unit. The skill that emerges is fluency in moving from *parts of a number* to *the number itself*, which is the real prerequisite for column addition with carrying, multi-digit subtraction with regrouping, and eventually the entire decimal system. A 10-round session takes about 8–12 minutes, and pairs naturally with a place-value chapter early in the year.
