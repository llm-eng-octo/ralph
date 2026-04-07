### PART-013: Validation — Fixed Answer
**Purpose:** Validate answers with known correct values.
**Condition:** Game has single correct answers.
**API:** `validateAnswer(userAnswer, correctAnswer)` -> boolean
**Key rules:**
- String comparison: case-insensitive, trimmed
- Array comparison: order-independent (sorted stringify)
- Type-coerces to String for comparison
