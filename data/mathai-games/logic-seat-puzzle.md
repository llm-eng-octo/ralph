### Game Concept: Logic Seating Puzzle

This application is a deductive reasoning and reading comprehension game. The primary objective is to arrange a group of people into specific seats around a table by carefully interpreting a given set of textual clues. It tests the player's logical thinking and spatial arrangement skills.

### Core Mechanics & Interface

* **Clue Panel:** The top section displays a list of numbered clues (e.g., "Anu is between Priya and Ravi...", "Neha sits across Anu") that dictate the seating arrangement rules.
* **The Board (Drop Zones):** The center of the screen features a top-down view of a rectangular table with designated, numbered seating slots (e.g., Seat 1 through Seat 6) split across two sides.
* **Character Pool (Draggable Items):** Below the board is a pool of available characters represented by names and avatars. There may be more characters in the pool than available seats, acting as distractors.
* **Submission:** A primary "CHECK" button sits below the board, used to validate the final arrangement.

### Behaviors and Interactions

* **Drag-and-Drop (Placement):** * The player taps, holds, and drags a character from the bottom pool into an empty seat on the board. 
    * Upon release, the character snaps into the designated seat.
* **Drag-and-Drop (Replacement):** * If a player drags a character from the pool and drops them onto a seat that is *already occupied*, the new character takes that seat. 
    * The previous occupant is automatically ejected and returned to the character pool at the bottom.
* **Check Action (Validation Tap):** * Once the player has filled all the seats, they tap the "CHECK" button to submit their logic.
* **Incorrect Submission Feedback:** * When the submitted arrangement violates the clues, the game provides immediate negative audio-visual feedback.
    * An error sound plays, and a message box appears saying, "Oh no! That's not right!"
    * The occupied seats on the board visually indicate an error state by highlighting with a red background and red border.
    * The "CHECK" button changes to a "Next" button to proceed.