### Game Concept

The application is an educational, fast-paced mental math game. The primary objective is to quickly scan a board of number pairs and identify those that add up to a specific target sum. In the level shown, the goal is to find "friendly pairs" that make a sum of 10, testing both addition skills and visual processing speed. 

### Core Mechanics & Interface

* **The Board:** The game presents a staggered grid of pill-shaped buttons. Each button displays a pair of numbers separated by a middle dot (e.g., **6 · 4**). 
* **Target Objective:** The current mathematical goal is displayed prominently at the top of the playing area (e.g., "Make Sum 10").
* **Health/Lives System:** The player begins with 3 lives, which are represented by red heart icons at the top right of the screen.
* **Progression:** A round is cleared only when the player successfully finds and taps *all* the correct pairs present on the current board.
* **Scoring/Pacing:** While not explicitly demonstrated via a visible countdown timer during gameplay, the intro screen states: "Spot each pair under 2 seconds to win 3 stars!", indicating a speed-based scoring mechanic.

### Behaviors and Interactions

* **Correct Selection (Tap):** * When the player taps a button containing a correct pair (e.g., tapping **2 · 8** when the target is 10), the button instantly turns purple and remains highlighted. 
    * Upon selecting the final correct pair on the board, the screen clears, a "Good job!" animation plays with a filling progress bar, and a new set of numbers immediately populates.
* **Incorrect Selection (Tap):** * When the player taps a button containing an incorrect pair (e.g., tapping **5 · 4** when the target is 10), the game provides immediate negative feedback. 
    * The button flashes red and shakes.
    * A red 'X' icon briefly flashes at the bottom of the screen.
    * One heart is deducted from the player's life total.
* **Game Over State:** * If the player makes three incorrect selections, depleting all their hearts, the active board disappears.
    * A "Game Over" modal appears with the text "You ran out of lives!", ending the current session and summarizing the performance (e.g., earning 0 stars).