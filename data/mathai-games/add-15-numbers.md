### Game Concept

This application is an educational math game focused on addition. The primary objective is to calculate the total sum of a grid of given numbers and select the correct answer from three multiple-choice options. It tests a player's mental addition skills and speed under a time limit.

### Core Mechanics & Interface

* **The Board:** The game presents a grid of numbers in the center of the screen that need to be added together. Below the grid, there are three distinct buttons representing possible sums.
* **Target Objective:** The goal is explicitly stated at the top: "Add the given list of numbers and tap on their sum!"
* **Health/Lives System:** The player starts with 3 lives, shown as red heart icons at the top right. 
* **Progression:** The game consists of 5 rounds, tracked by a "rounds completed" indicator (e.g., 0/5, 1/5).
* **Scoring/Pacing:** There is a 15-second timer per round, displayed both as a shrinking progress bar and a digital countdown. Adding the list within 15 seconds awards 3 stars. The game also tracks and displays the "Average time taken" between rounds.

### Behaviors and Interactions

* **Grid Number Selection (Tap):**
    * When the player taps an individual number within the main grid, it turns gray and is crossed out with a red strike-through line. This acts as a visual aid to help the player keep track of which numbers they have already added in their head.
* **Correct Sum Selection (Tap):** * When the player taps the correct multiple-choice button at the bottom (e.g., tapping **99** in Round 1), the button flashes green.
    * A "Correct sum!" message briefly appears.
    * An interstitial screen shows the average time taken before moving to the next round.
* **Incorrect Sum Selection (Tap):** * When the player taps an incorrect multiple-choice button (e.g., tapping **102** in Round 1), the game provides negative feedback.
    * The tapped button flashes red and shakes.
    * An "Oops! This is not the correct sum!" message appears.
    * One heart is deducted from the player's life total.
* **Game Over State:** * If the player makes three incorrect guesses across their session, depleting all their hearts, the round ends immediately.
    * A "Game Over" screen appears with a broken heart icon and the text "All lives lost!", terminating the game.