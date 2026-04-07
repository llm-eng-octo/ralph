### PART-009: Attempt Tracking
**Purpose:** Records every user answer attempt with timestamp, correctness, and metadata.
**API:** `recordAttempt({ userAnswer, correct, question, correctAnswer, validationType })`
**Key rules:**
- Pushes to `gameState.attempts[]` and `gameState.duration_data.attempts[]`
- Fields: `attempt_timestamp`, `time_since_start_of_game`, `input_of_user`, `attempt_number`, `correct`, `metadata`
- Called from game-specific answer handler after validation
