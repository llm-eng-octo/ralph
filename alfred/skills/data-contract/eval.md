# Eval: Data Contract

Tests for `skills/data-contract.md` -- the skill that validates game HTML against the required data schemas (gameState, recordAttempt, game_complete, syncDOM, trackEvent, postMessage).

## Version

v1 -- 2026-04-04 -- initial eval with priority tags, checklist format, judge types

## Setup

Context files that must be loaded before running:

- `skills/data-contract.md` (all 7 schema definitions)
- `skills/game-archetypes.md` (archetype determines conditional fields)
- `skills/game-building/reference/static-validation-rules.md` (build-time enforcement reference)

## Success Criteria

A contract validation passes when ALL of the following are true:

1. **Every required field checked.** No required field from any schema is skipped.
2. **Type correctness enforced.** Fields have the specified types (number, string, boolean, array).
3. **Conditional fields handled.** Lives-based fields present when lives > 0, absent or optional when lives = 0.
4. **Anti-patterns detected.** Known anti-patterns (body instead of #app, game_ready before listener, float accuracy) are flagged.
5. **Verdict is per-schema.** Each of the 7 schemas gets an independent pass/fail, not a single global verdict.

## Ship-Readiness Gate

All P0 cases must PASS. All P1 cases must PASS or PARTIAL.

---

## Cases

### Case 1: Fully compliant MCQ Quiz HTML

**Priority:** P0
**Type:** happy-path
**Judge:** llm

**Input:**

```html
<!-- A well-formed MCQ Quiz game HTML with all schemas correctly implemented:
     - window.gameState with all required fields
     - recordAttempt with all 12 fields
     - game_complete postMessage with correct metrics shape
     - syncDOM targeting #app with data-phase and data-score
     - trackEvent with canonical events
     - game_ready before game_init, listener registered first
     - Phase set as first line in game_init handler -->
```

**Expect:**

- [ ] All 7 schemas: PASS verdict
- [ ] gameState: all 14 required fields validated present
- [ ] recordAttempt: all 12 fields confirmed (attempt_timestamp through metadata)
- [ ] game_complete: type = 'game_complete', metrics has accuracy (integer 0-100), time, stars, attempts, duration_data, tries
- [ ] syncDOM: targets #app, writes data-phase and data-score
- [ ] trackEvent: game_start, game_end, answer_submitted, round_complete events present
- [ ] handlePostMessage: game_ready sent AFTER listener registered
- [ ] Phase assignment is FIRST LINE in game_init handler

**Why:** Happy path -- confirms all schemas validate correctly on well-formed input.

---

### Case 2: Missing gameState fields

**Priority:** P0
**Type:** error-handling
**Judge:** llm

**Input:**

```javascript
// gameState missing: duration_data, isProcessing, gameEnded, events
window.gameState = {
  gameId: 'test-game',
  phase: 'start_screen',
  currentRound: 0,
  totalRounds: 9,
  score: 0,
  attempts: [],
  startTime: null,
  isActive: false,
  content: null
};
```

**Expect:**

- [ ] gameState schema: FAIL verdict
- [ ] Missing fields explicitly listed: duration_data, isProcessing, gameEnded, events
- [ ] Each missing field reported with its expected type and initial value
- [ ] Other schemas NOT affected by gameState failure (independent verdicts)
- [ ] [LLM] Output does not report false positives for fields that ARE present

**Why:** Tests field-level granularity of gameState validation. The skill must enumerate every missing field, not just say "incomplete."

---

### Case 3: Common anti-patterns in a single file

**Priority:** P0
**Type:** error-handling
**Judge:** llm

**Input:**

```javascript
// Anti-pattern 1: syncDOM targets document.body instead of #app
function syncDOM() {
  document.body.setAttribute('data-phase', gameState.phase);
}

// Anti-pattern 2: game_ready sent BEFORE listener registered
window.parent.postMessage({ type: 'game_ready' }, '*');
window.addEventListener('message', handlePostMessage);

// Anti-pattern 3: accuracy as float
accuracy: score / totalRounds,  // 0.0-1.0 instead of 0-100

// Anti-pattern 4: phase assignment NOT first in game_init handler
function handlePostMessage(event) {
  if (event.data.type === 'game_init') {
    gameState.content = event.data.data.content;  // content first!
    gameState.phase = 'playing';                   // phase second -- WRONG
    syncDOM();
  }
}
```

**Expect:**

- [ ] syncDOM: FAIL -- targets document.body, must target #app
- [ ] handlePostMessage: FAIL -- game_ready before listener registration
- [ ] game_complete: FAIL -- accuracy is float 0.0-1.0, must be integer 0-100
- [ ] handlePostMessage: FAIL -- phase assignment is not first line in game_init
- [ ] Each anti-pattern reported with the specific rule ID (e.g., GEN-PHASE-INIT)
- [ ] [LLM] Fix recommendation provided for each violation

**Why:** Tests detection of the 4 most common contract violations from production builds.

---

### Case 4: Lives-based game -- conditional fields validation

**Priority:** P1
**Type:** edge-case
**Judge:** llm

**Input:**

```javascript
// Lives Challenge game with lives = 3 but missing:
// - data-lives attribute in syncDOM
// - totalLives field in game_complete metrics
// - game_over screen in state machine
window.gameState = {
  /* ...all required fields... */
  lives: 3,
  totalLives: 3,
  phase: 'start_screen'
};

function syncDOM() {
  document.getElementById('app').setAttribute('data-phase', gameState.phase);
  document.getElementById('app').setAttribute('data-score', gameState.score);
  // Missing: data-lives
}

// game_complete fires only on victory path, not game-over
if (gameState.phase === 'results') {
  window.parent.postMessage({ type: 'game_complete', data: { ... } }, '*');
}
```

**Expect:**

- [ ] syncDOM: FAIL -- missing data-lives for lives-based game (GEN-DATA-LIVES-SYNC)
- [ ] game_complete: FAIL -- only fires on victory, not game-over (GEN-PM-DUAL-PATH)
- [ ] Screen state machine: FAIL -- lives > 0 requires game_over screen
- [ ] [LLM] Constraint 5 cited: "Lives = 0 means no game_over screen" (inverse: lives > 0 means game_over required)
- [ ] gameState: PASS -- lives and totalLives are present

**Why:** Tests conditional field logic -- the most error-prone part of the contract for lives-based games.

---

### Case 5: Cross-skill -- recordAttempt feeds analytics

**Priority:** P1
**Type:** cross-skill
**Judge:** llm

**Input:**

```javascript
function recordAttempt(roundIndex, userInput, correct, metadata) {
  gameState.attempts.push({
    attempt_timestamp: Date.now(),
    time_since_start_of_game: Date.now() - gameState.startTime,
    input_of_user: userInput,
    correct: correct,
    round_number: roundIndex + 1,
    question_id: 'r' + (roundIndex + 1),
    correct_answer: getRounds()[roundIndex].answer,
    response_time_ms: Date.now() - gameState.roundStartTime,
    misconception_tag: correct ? null : (metadata.misconception_tag || null),
    difficulty_level: getRounds()[roundIndex].stage || 1,
    is_retry: false,
    metadata: metadata
  });
}
```

**Expect:**

- [ ] recordAttempt schema: PASS -- all 12 required fields present
- [ ] round_number is 1-indexed (roundIndex + 1) -- correct
- [ ] misconception_tag is null when correct, populated when wrong -- correct
- [ ] question_id uses stable format ('r' + roundNumber) -- correct
- [ ] [LLM] Output confirms this attempt object is compatible with game_complete metrics.attempts array
- [ ] [LLM] Output confirms misconception_tag enables per-misconception analytics downstream

**Why:** Tests that recordAttempt output is structured correctly for the analytics pipeline and game_complete postMessage.

---

## Eval Scoring

| Result | Meaning |
|--------|---------|
| PASS | All assertions in Expect checklist pass |
| PARTIAL | Some assertions fail -- note which ones |
| FAIL | Critical assertions fail or output is fundamentally wrong |

## Ship Gate Check

| Case | Priority | Required result |
|------|----------|----------------|
| Case 1: Fully compliant HTML | P0 | PASS |
| Case 2: Missing gameState fields | P0 | PASS |
| Case 3: Common anti-patterns | P0 | PASS |
| Case 4: Lives conditional fields | P1 | PASS or PARTIAL |
| Case 5: Cross-skill recordAttempt | P1 | PASS or PARTIAL |
