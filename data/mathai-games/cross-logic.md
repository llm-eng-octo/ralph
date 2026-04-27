### Game Concept: Cross-Logic Puzzle

This application is a deductive reasoning game based on classic logic grid puzzles. The primary objective is to accurately match items across different categories—in this case, matching students with their favorite animal and their country of origin—by cross-referencing a set of written clues and using the process of elimination.

### Core Mechanics & Interface

* **Clue Panel:** The top section displays a list of definitive statements (e.g., "Maya is not from Japan") that serve as the rules for the current puzzle.
* **The Logic Grid:** The main play area is a matrix grid. 
    * The vertical axis (rows) lists the **NAMES** of the students (Maya, Arjun, Priya).
    * The horizontal axis (columns) is divided into the other categories: **ANIMALS** (Lion, Elephant) and **COUNTRIES** (India, Japan).
* **Objective:** The player must fill out the intersecting cells of the grid to determine the true pairings (e.g., intersecting 'Maya' with 'Elephant') while ensuring no contradictions exist based on the clues.

### Behaviors and Interactions

* **Grid Cell Selection (Tap Cycle):** The game uses a cyclical tapping interaction to mark deductions within the grid cells:
    * **First Tap:** Places a red cross (❌) in the cell, indicating a negative deduction (e.g., Maya does *not* like Lions).
    * **Second Tap:** Replaces the cross with a green checkmark (✅), indicating a positive deduction (e.g., Maya *does* like Elephants).
    * **Third Tap:** Clears the cell back to an empty state if a mistake was made.
* **Validation & Feedback:** * As the player fills in the grid with checks and crosses, the game appears to process the inputs. A brief "Please wait" message flashes on the screen.
    * **Incorrect Solution:** If the player inputs a combination that violates the given clues (e.g., marking Maya as liking Elephants and being from India, which contradicts the clue that the elephant lover is from Japan), the game immediately triggers a fail state. An "Oh no! You got this puzzle wrong." dialogue box appears, and a "Next" button is provided to move on.