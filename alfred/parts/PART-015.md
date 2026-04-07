### PART-015: Validation — LLM Subjective
**Purpose:** AI-powered evaluation for open-ended answers.
**Condition:** Game has answers requiring AI judgment.
**API:** `await validateAnswerLLM(userAnswer, question, rubric)` -> `{ correct, evaluation, feedback }`
**Key rules:**
- Uses `MathAIHelpers.SubjectiveEvaluation.evaluate({ components: [{ component_id, evaluation_prompt, feedback_prompt }], timeout })`
- Returns `{ correct, evaluation, feedback }` — correct is derived from evaluation text
- 30s timeout, graceful fallback on error
