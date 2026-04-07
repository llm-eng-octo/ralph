### PART-014: Validation — Function-Based
**Purpose:** Validate answers using a rule function.
**Condition:** Game has rule-based answers (any even number, sums to X, etc.).
**API:** `validateAnswer(userAnswer, validationFn)` -> boolean
**Key rules:**
- Wraps `validationFn(userAnswer)` in try/catch
- Use for open-ended valid answers: `isEven`, `isPrime`, `sumsToTen`, etc.
