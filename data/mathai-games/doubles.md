### Game Concept: "Doubles"

This application is a rapid-fire, speed-based mental math game focused on multiplication. The core objective is to calculate the double of a presented target number and select the correct answer from a set of three multiple-choice options as quickly as possible.

### Core Mechanics & Interface

* **The Board:** The interface is ultra-minimal. A primary target prompt (e.g., "Double of 12") sits above three horizontally aligned, pill-shaped buttons containing potential answers.
* **Progression Flow:** The game is structured into 3 distinct "Levels," with each level containing a chain of 5 sequential questions. This makes for a total of 15 rounds to complete the full session.
* **Health System:** The player starts with 3 lives, indicated by red heart icons at the top right. 
* **Scoring & Pacing:** The scoring is heavily dependent on speed. A central timer counts the seconds elapsed. To achieve a 3-star rating, the player must maintain an average selection time of under 2 seconds per correct answer across the session.

### Interaction Behaviors & Logic

* **Correct Selection (`onTap`):** * When the user taps the correct button, the button instantly highlights green.
    * There is zero delay; the game immediately transitions to the next number prompt in the sequence to maintain a fast, continuous flow.
* **Level Completion State:**
    * Upon answering the 5th question in a level, a summary screen pauses the action.
    * It displays the "Average time taken per double" for that specific level alongside a "Target time" (e.g., 1s).
* **Victory State:**
    * After clearing all 15 rounds (3 levels), a final "Victory!" modal appears.
    * It calculates the global average time taken per double.
    * If the average time requirement is met (under 2 seconds), the game awards 3 stars, triggers a celebratory animation, and plays an audio cue.