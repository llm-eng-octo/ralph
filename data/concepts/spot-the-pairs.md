### Game Concept: Spot the Pairs — Friendly Pairs Sum Challenge

This is a fast mental-math game focused on number bonds. The player scans a board of simple addition expressions and taps every expression whose result equals a target sum shown in the header (e.g., "Make Sum 10"). It trains automatic recognition of friendly pairs that combine into benchmark numbers like 10 and 20.

### Core Mechanics & Interface

* **Status Bar:** Top strip carries the question label ("Q1"), a central timer (starts at "00:03"), and a right-aligned star counter ("0/10") with a light blue star icon.
* **Level Progress:** A horizontal progress bar labelled "0/4 Levels" sits below the header, with 3 red heart lives anchored above its right edge.
* **Target Header:** A prominent "Make Sum 10" label tells the player which total to hunt for on the current board.
* **The Board:** A **staggered 3+3+2 arrangement** — row 1 has three pill buttons (**6 + 4**, **5 + 6**, **3 + 8**), row 2 has three more (**2 + 8**, **4 + 5**, **7 + 4**) directly under row 1, and row 3 has only two (**5 + 5**, **6 + 3**) centred under the first two columns. Each pill is a rounded rectangle with light-lavender fill and purple text.
* **Bottom-right action:** A large yellow rounded-rectangle **"Next Round"** button sits anchored to the bottom right of the screen (used to advance once the current board is cleared).
* **Progression:** The onboarding text invites the player to "Tap and select all friendly pairs of 10 and 20!" across 4 total levels, with a 3-star bonus for spotting each pair under 2 seconds.

### Behaviors and Interactions

* **Expression Tap:** The player taps an expression button to select it. Correct pairs (those summing to the target) highlight or disappear; incorrect taps suggest a loss of life based on the heart indicator.
* **Next Round Button:** A "Next Round" button advances the player to the next level or sum target once the current board is cleared.

### Variant Progression

All three variants keep the same 4-level structure, same "Make Sum 10" target, 3 hearts, 10 stars, and tap-to-select interaction; only the specific pool of expressions on the board changes:
* **B1 (canonical, 310362):** Expressions include 6+4, 5+6, 3+8, 2+8, 4+5, 7+4, 5+5, 6+3.
* **B2 (310370):** Card-grid styled with light-purple cards showing e.g. 3+7, 4+7, 6+5, etc.
* **B3 (310378):** White cards with light-purple borders — 7+3, 6+3, 8+3, 4+6, 7+4, 2+9, 9+1, 5+4.

---
**Source:** IMC 2025-26 Final Round (worksheet 16483), Level 1, chunk "Spot the pairs" (block 310362; block_count 3). Screenshots: 16483_303403_0.png, 16483_303405_0.png.
