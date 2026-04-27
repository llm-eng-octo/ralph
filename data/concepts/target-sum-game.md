### Game Concept: Target Sum Game — Make Sum

This is a combinatorial addition game. The player is shown a grid of number and expression cards, and must select a subset whose values add up to a target shown at the top of the screen. It trains flexible decomposition — seeing multiple routes to the same total and composing numbers from parts.

### Core Mechanics & Interface

* **Status Header:** Top bar shows the question label "Q1", a timer ("00:03"), and a star progress readout ("0/10").
* **Game Progress Bar:** A progress strip labelled "Round 0/9" with 3 lives remaining.
* **Target Label:** A large "Make Sum 310" banner sets the round's goal.
* **Card Grid:** A **staggered 3+4+2 arrangement** of tappable value cards, centred horizontally so each row is indented from the row above. In B1: row 1 has `30+70`, `50+50`, `60`; row 2 widens to `80`, `40`, `20`, `70`; row 3 narrows to `30`, `90`. Each card is a white rounded-rectangle with a thin gray border and black text — expression cards (e.g. `50+50`) and plain-number cards sit in the same grid with identical styling.
* **Bottom-right action:** A large yellow rounded-rectangle **"Next Round"** button sits anchored to the bottom right; tapping it submits the current selection.
* **Progression:** The game is 9 rounds long. The intro reads "Complete all 9 rounds with an average speed of under 3 seconds per round to win 3 stars."

### Behaviors and Interactions

* **Card Tap (Select/Deselect):** Tapping a card selects it, which likely adds a highlight color; tapping again deselects it. The player assembles a running selection whose total must reach the target.
* **Next Round Button:** Tapping "Next Round" submits the current selection and, if the chosen cards sum to the target, advances to the next round.

### Victory / Completion

Successfully completing all 9 rounds finishes the game; average round time determines whether the player earns up to 3 stars.

### Variant Progression

All three variants keep the same tap-to-select/tap-to-deselect mechanic, 9-round format, 3 hearts, 10-star target, and the "<3 sec/round" speed rule; only the target sum and card pool shift:
* **B1 (canonical, 310449):** Target **310**; cards include `30+70`, `50+50`, `60`, `80`, `40`, `20`, `70`, `30`, `90`.
* **B2 (310457):** Target **320**; cards include `40+60`, `30+70`, `80`, `50`, `60`, `40`, `20`, `90`, `70`.
* **B3 (310465):** Target **330**; same staggered-grid format.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 1, chunk "Target sum game" (block 310449; block_count 3). Screenshots: 16483_303415_0.png.
