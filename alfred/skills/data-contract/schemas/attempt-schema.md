recordAttempt is called once per student answer -- every field is required unless marked optional.

## Function Signature

```javascript
function recordAttempt(roundIndex, userInput, correct, metadata) { ... }
```

## Attempt Object Schema

The object pushed to `gameState.attempts`:

| Field | Type | Required | Example | Source | Why Required |
|-------|------|----------|---------|--------|-------------|
| `attempt_timestamp` | `number` | Yes | `1712345678901` | `Date.now()` at submission | Platform uses absolute timestamp to reconstruct session timeline |
| `time_since_start_of_game` | `number` | Yes | `14500` | `Date.now() - gameState.startTime` (ms) | Enables engagement analysis without knowing absolute start time |
| `input_of_user` | `any` | Yes | `"3"`, `"option-b"`, `[2,5]` | Exactly what the student submitted | Gauge step needs raw input to detect misconception patterns |
| `correct` | `boolean` | Yes | `true` | Whether the answer matched the correct answer | Accuracy calculation and per-round accuracy both derive from this |
| `round_number` | `number` | Yes | `3` | 1-indexed round number (`roundIndex + 1`) | Joins with content set to identify which question was answered |
| `question_id` | `string` | Yes | `"r3_ratio_6to2"` | Stable identifier for this question across sessions | Gauge compares performance on identical questions across students |
| `correct_answer` | `any` | Yes | `"3"` | The expected correct answer for this round | Enables offline re-grading if scoring logic changes |
| `response_time_ms` | `number` | Yes | `3200` | Ms from question display to submission | Identifies questions students struggle with (high time = confusion) |
| `misconception_tag` | `string \| null` | Yes | `"additive-reasoning"` or `null` | Which misconception the wrong answer maps to. `null` if correct. | Powers misconception dashboards; null when correct to distinguish "no misconception" from "unmapped" |
| `difficulty_level` | `number` | Yes | `2` | Difficulty/stage of this round (from content set) | Analytics segments accuracy by difficulty to detect ceiling/floor effects |
| `is_retry` | `boolean` | Yes | `false` | `true` if student is re-attempting the same question | Separates first-attempt accuracy (learning signal) from retry accuracy (persistence signal) |
| `metadata` | `object` | Yes | `{ round: 3, type: 'A' }` | Game-specific context. May include any additional fields. | Extensibility -- games add custom context without schema changes |

## Implementation Pattern

```javascript
function recordAttempt(roundIndex, userInput, correct, metadata) {
  const round = getRounds()[roundIndex];
  const attempt = {
    attempt_timestamp: Date.now(),
    time_since_start_of_game: gameState.startTime ? Date.now() - gameState.startTime : 0,
    input_of_user: userInput,
    correct: correct,
    round_number: roundIndex + 1,
    question_id: round.id || ('r' + (roundIndex + 1)),
    correct_answer: round.answer || round.correctOption || round.correctAnswer,
    response_time_ms: gameState.roundStartTime ? Date.now() - gameState.roundStartTime : 0,
    misconception_tag: correct ? null : (metadata.misconception_tag || null),
    difficulty_level: round.difficulty || round.stage || 1,
    is_retry: metadata.is_retry || false,
    metadata: metadata || {}
  };
  gameState.attempts.push(attempt);
  gameState.duration_data.attempts.push({
    round: roundIndex + 1,
    timestamp: Date.now()
  });
}
```

## Notes

- `question_id` must be stable across sessions for the same question content, so the gauge step can compare performance on identical questions.
- `misconception_tag` values come from the spec's misconception taxonomy. The game maps wrong-answer choices to tags (e.g., choosing additive instead of multiplicative reasoning).
- Games may add extra fields to the attempt object. Extra fields are preserved (forward compatibility). Required fields must never be omitted.
