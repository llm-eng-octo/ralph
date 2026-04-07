# Assembly Book: Word Problem Workshop

---

## 1. Game Identity

```
- Title: Word Problem Workshop
- Game ID: word-problem-workshop
- Type: standard
- Description: See a math expression, then write a real-world word problem that matches it. The game evaluates whether your word problem correctly represents the expression using AI — there is no single "right answer." 10 rounds across 3 stages (simple operations, multi-step, mixed operations). No lives — low-stakes exploratory. Star rating at end based on total points earned.
- Learning Goal: Mathematical Reasoning & Communication for Grade 4. The kid builds the habit of connecting abstract math expressions to real-world situations. They learn that math lives in everyday life and that the same expression can tell many different stories.
- Skills covered: 1 (translating math expressions to word problems) & 2 (demonstrating understanding of operation meaning)
- Grade: 4
- Bloom level: L3 Apply → L5 Evaluate
```

---

## 2. Parts Selected

| Part ID | Name | Included | Config/Notes |
|---------|------|----------|-------------|
| PART-001 | HTML Shell | YES | — |
| PART-002 | Package Scripts | YES | — |
| PART-003 | waitForPackages | YES | — |
| PART-004 | Initialization Block | YES | — |
| PART-005 | VisibilityTracker | YES | popupProps: default |
| PART-006 | TimerComponent | NO | No timer — low-stakes exploratory |
| PART-007 | Game State Object | YES | Custom fields: wordProblemText, evaluationResult, feedbackText, totalPoints |
| PART-008 | PostMessage Protocol | YES | — |
| PART-009 | Attempt Tracking | YES | — |
| PART-010 | Event Tracking & SignalCollector | YES | Custom events: game_ready, word_problem_submit, evaluation_complete, round_complete |
| PART-011 | End Game & Metrics | YES | Star logic based on totalPoints (see Section 8) |
| PART-012 | Debug Functions | YES | — |
| PART-013 | Validation Fixed | NO | — |
| PART-014 | Validation Function | NO | No deterministic check — primary evaluation is 100% LLM |
| PART-015 | Validation LLM | YES | **PRIMARY** evaluation via `MathAIHelpers.SubjectiveEvaluation.evaluate()` — evaluates word problem correctness AND quality |
| PART-016 | StoriesComponent | NO | — |
| PART-017 | Feedback Integration | YES | Audio: correct_tap, wrong_tap. Stickers: correct/incorrect GIFs, trophy Lottie. Dynamic TTS for evaluation feedback + end-game. |
| PART-018 | Case Converter | NO | — |
| PART-019 | Results Screen UI | YES | Custom metrics: total points, correct problems, best round |
| PART-020 | CSS Variables & Colors | YES | — |
| PART-021 | Screen Layout CSS | YES | — |
| PART-022 | Game Buttons | YES | Submit Word Problem button |
| PART-023 | ProgressBar Component | YES | totalRounds: 10, totalLives: 0 (no lives) |
| PART-024 | TransitionScreen Component | YES | Screens: start, stage-transition, victory |
| PART-025 | ScreenLayout Component | YES | slots: progressBar=true, transitionScreen=true |
| PART-026 | Anti-Patterns | YES (REFERENCE) | — |
| PART-027 | Play Area Construction | YES | Layout: expression card + word problem textarea + feedback area |
| PART-028 | InputSchema Patterns | YES | Schema type: rounds with expressions + operations + rubrics |
| PART-029 | Story-Only Game | NO | — |
| PART-030 | Sentry Error Tracking | YES | — |
| PART-033 | Interaction Patterns | YES | Patterns: textarea (word problem), buttons |
| PART-034 | Variable Schema Serialization | YES (POST_GEN) | — |
| PART-035 | Test Plan Generation | YES (POST_GEN) | — |
| PART-037 | Playwright Testing | YES (POST_GEN) | — |

---

## 3. Game State

```javascript
window.gameState = {
  // MANDATORY (from PART-007):
  gameId: 'word-problem-workshop',    // GEN-GAMEID: MUST be first property
  currentRound: 0,
  totalRounds: 10,
  score: 0,
  attempts: [],
  events: [],
  startTime: null,
  isActive: false,
  gameEnded: false,               // GEN-ENDGAME-GUARD: used by endGame() guard
  phase: 'start',                 // start | writing | evaluating | feedback | transition | results
  isProcessing: false,            // Prevents overlapping click handlers during feedback
  content: null,
  duration_data: {
    startTime: null,
    preview: [],
    attempts: [],
    evaluations: [],
    inActiveTime: [],
    totalInactiveTime: 0,
    currentTime: null
  },

  // GAME-SPECIFIC:
  currentStage: 1,                // 1=simple operations, 2=multi-step, 3=mixed operations
  totalPoints: 0,                 // Accumulated points (max 3 per round = 30 total)
  wordProblemText: '',            // Kid's written word problem for current round
  evaluationResult: null,         // 'correct_match' | 'partial_match' | 'no_match' — determined by LLM
  feedbackText: '',               // LLM-generated feedback for current round
  roundData: null,                // Current round's content data
  correctCount: 0,                // Running total of fully correct (correct_match) rounds
  partialCount: 0,                // Running total of partial_match rounds
  contentSetId: null,             // Set from game_init postMessage
  signalConfig: null,             // Set from game_init postMessage (flushUrl, playId, etc.)
  sessionHistory: [],             // Accumulated per-session results for restart tracking
  currentDynamicAudio: null,      // Reference for stopping dynamic TTS on early interaction
  voGameStartPlayed: false,       // Play welcome VO only once, even across restarts
};

var visibilityTracker = null;
var signalCollector = null;
var progressBar = null;
var transitionScreen = null;
var visibilityTrackerConfig = null;  // Saved for reuse in restartGame()
var questionSlotId = null;           // Stored from ScreenLayout.inject() return
```

---

## 4. Input Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "WordProblemWorkshopContent",
  "description": "Content schema for the 'Word Problem Workshop' game",
  "type": "object",
  "required": ["gameId", "rounds"],
  "properties": {
    "gameId": {
      "type": "string",
      "const": "word-problem-workshop"
    },
    "rounds": {
      "type": "array",
      "minItems": 10,
      "maxItems": 10,
      "items": {
        "type": "object",
        "required": ["roundNumber", "stage", "expression", "expressionDisplay", "result", "operation", "rubric", "exampleWordProblem", "hints"],
        "properties": {
          "roundNumber": {
            "type": "integer",
            "minimum": 1,
            "maximum": 10
          },
          "stage": {
            "type": "integer",
            "minimum": 1,
            "maximum": 3,
            "description": "Stage 1 = simple operations, Stage 2 = multi-step, Stage 3 = mixed operations"
          },
          "expression": {
            "type": "string",
            "description": "The math expression in code form (e.g., '3 * 4 + 2')"
          },
          "expressionDisplay": {
            "type": "string",
            "description": "The math expression in display form with proper symbols (e.g., '3 x 4 + 2 = 14')"
          },
          "result": {
            "type": "number",
            "description": "The numerical result of the expression"
          },
          "operation": {
            "type": "string",
            "enum": ["addition", "subtraction", "multiplication", "division", "multi-step", "mixed"],
            "description": "The primary operation type for this round"
          },
          "rubric": {
            "type": "string",
            "description": "LLM rubric describing what a correct word problem for THIS expression looks like. Must mention the specific operations, quantities, and relationships that should be present."
          },
          "exampleWordProblem": {
            "type": "string",
            "description": "One example of a correct word problem for this expression. Shown as a hint if the kid struggles."
          },
          "hints": {
            "type": "object",
            "required": ["thinkAbout", "revealExplanation"],
            "properties": {
              "thinkAbout": {
                "type": "string",
                "description": "A gentle nudge about what the expression means (shown if the kid gets partial_match or no_match)"
              },
              "revealExplanation": {
                "type": "string",
                "description": "Full explanation of what the expression means in real-world terms, shown via TTS feedback"
              }
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      }
    }
  },
  "additionalProperties": false
}
```

**Exposed content shape:**
```json
{
  "gameId": "word-problem-workshop",
  "rounds": [
    {
      "roundNumber": 1,
      "stage": 1,
      "expression": "5 + 3",
      "expressionDisplay": "5 + 3 = 8",
      "result": 8,
      "operation": "addition",
      "rubric": "A correct word problem must describe a situation where 5 things and 3 things are combined to make 8. The two quantities must be clearly 5 and 3. Accept any real-world context (food, animals, toys, etc.) as long as the joining/combining action matches addition.",
      "exampleWordProblem": "Tom had 5 apples. His friend gave him 3 more apples. How many apples does Tom have now?",
      "hints": {
        "thinkAbout": "Think about putting two groups together. What has 5 of something and then gets 3 more?",
        "revealExplanation": "5 plus 3 means starting with 5 things and adding 3 more, giving you 8 total. For example: 5 apples plus 3 apples equals 8 apples."
      }
    }
  ]
}
```

---

## 5. Fallback Content

All 10 rounds verified — each round has a valid expression, correct result, appropriate rubric, and proper stage assignments.

```javascript
var fallbackContent = {
  "gameId": "word-problem-workshop",
  "rounds": [
    {
      "roundNumber": 1,
      "stage": 1,
      "expression": "5 + 3",
      "expressionDisplay": "5 + 3 = 8",
      "result": 8,
      "operation": "addition",
      "rubric": "A correct word problem must describe a situation where 5 things and 3 things are combined to make 8 total. The two quantities must be clearly 5 and 3. The action must represent addition (joining, combining, getting more). Accept any real-world context.",
      "exampleWordProblem": "Tom had 5 apples. His friend gave him 3 more. How many apples does Tom have now?",
      "hints": {
        "thinkAbout": "Think about putting two groups together. What has 5 of something and then gets 3 more?",
        "revealExplanation": "5 plus 3 means starting with 5 things and adding 3 more to get 8 total."
      }
    },
    {
      "roundNumber": 2,
      "stage": 1,
      "expression": "12 - 4",
      "expressionDisplay": "12 - 4 = 8",
      "result": 8,
      "operation": "subtraction",
      "rubric": "A correct word problem must describe a situation where you start with 12 things and 4 are removed/lost/given away, leaving 8. The starting quantity must be 12 and the amount removed must be 4. The action must represent subtraction (taking away, losing, giving away, eating, etc.).",
      "exampleWordProblem": "Maria had 12 stickers. She gave 4 to her sister. How many stickers does Maria have left?",
      "hints": {
        "thinkAbout": "Think about starting with a group and taking some away. What starts at 12 and loses 4?",
        "revealExplanation": "12 minus 4 means starting with 12 things and taking 4 away, leaving 8."
      }
    },
    {
      "roundNumber": 3,
      "stage": 1,
      "expression": "6 * 3",
      "expressionDisplay": "6 x 3 = 18",
      "result": 18,
      "operation": "multiplication",
      "rubric": "A correct word problem must describe a situation with 6 groups of 3 things each (or 3 groups of 6 things) totaling 18. The word problem must clearly show equal groups or repeated addition. Accept either 6 groups of 3 OR 3 groups of 6 since multiplication is commutative.",
      "exampleWordProblem": "There are 6 bags with 3 oranges in each bag. How many oranges are there in total?",
      "hints": {
        "thinkAbout": "Think about equal groups. What has 6 sets of 3 things each?",
        "revealExplanation": "6 times 3 means 6 groups with 3 in each group, which gives 18 total."
      }
    },
    {
      "roundNumber": 4,
      "stage": 1,
      "expression": "20 / 4",
      "expressionDisplay": "20 / 4 = 5",
      "result": 5,
      "operation": "division",
      "rubric": "A correct word problem must describe a situation where 20 things are split equally into 4 groups (giving 5 each) OR split into groups of 4 (giving 5 groups). The starting quantity must be 20 and the divisor must be 4. The action must represent fair sharing or equal grouping.",
      "exampleWordProblem": "A teacher has 20 pencils to share equally among 4 students. How many pencils does each student get?",
      "hints": {
        "thinkAbout": "Think about sharing equally. If you have 20 things and split them into 4 equal groups, how many in each group?",
        "revealExplanation": "20 divided by 4 means splitting 20 things into 4 equal groups of 5 each."
      }
    },
    {
      "roundNumber": 5,
      "stage": 2,
      "expression": "3 * 4 + 2",
      "expressionDisplay": "3 x 4 + 2 = 14",
      "result": 14,
      "operation": "multi-step",
      "rubric": "A correct word problem must describe a two-step situation: first, 3 groups of 4 things (or 4 groups of 3), then adding 2 more. The final total must be 14. The order of operations matters — the multiplication must happen conceptually before the addition. Accept stories where someone has equal groups of items and then gets a few extra.",
      "exampleWordProblem": "Sara bought 3 packs of 4 stickers each. Then she found 2 more stickers on the ground. How many stickers does Sara have now?",
      "hints": {
        "thinkAbout": "This has two parts: first multiply 3 times 4, then add 2 more. What story has equal groups plus some extra?",
        "revealExplanation": "3 times 4 equals 12, then adding 2 more makes 14. Think of it as 3 groups of 4 plus 2 extra."
      }
    },
    {
      "roundNumber": 6,
      "stage": 2,
      "expression": "5 * 6 - 3",
      "expressionDisplay": "5 x 6 - 3 = 27",
      "result": 27,
      "operation": "multi-step",
      "rubric": "A correct word problem must describe a two-step situation: first, 5 groups of 6 things (totaling 30), then 3 are removed. The final answer must be 27. The multiplication must conceptually happen before the subtraction. Accept stories where someone starts with equal groups and then loses/uses some.",
      "exampleWordProblem": "A bakery made 5 trays of 6 cupcakes each. 3 cupcakes fell on the floor. How many cupcakes are left?",
      "hints": {
        "thinkAbout": "First figure out 5 groups of 6 (that's 30), then take away 3. What story works for that?",
        "revealExplanation": "5 times 6 equals 30, then subtracting 3 gives 27. Think of equal groups where a few get removed."
      }
    },
    {
      "roundNumber": 7,
      "stage": 2,
      "expression": "24 / 6 + 5",
      "expressionDisplay": "24 / 6 + 5 = 9",
      "result": 9,
      "operation": "multi-step",
      "rubric": "A correct word problem must describe a two-step situation: first, 24 things are divided into 6 equal groups (giving 4 each), then 5 more are added. The final answer must be 9. The division must conceptually happen before the addition. Accept stories involving sharing/splitting followed by receiving more.",
      "exampleWordProblem": "Mom divided 24 cookies equally among 6 children. Then grandma gave each child 5 more cookies. How many cookies does each child have now?",
      "hints": {
        "thinkAbout": "First split 24 into 6 equal parts (that's 4 each), then add 5 more. What real-life situation fits?",
        "revealExplanation": "24 divided by 6 equals 4, then adding 5 gives 9. Think of sharing equally and then getting more."
      }
    },
    {
      "roundNumber": 8,
      "stage": 3,
      "expression": "4 * 5 + 3 * 2",
      "expressionDisplay": "(4 x 5) + (3 x 2) = 26",
      "result": 26,
      "operation": "mixed",
      "rubric": "A correct word problem must describe a situation with TWO separate groups: 4 groups of 5 things AND 3 groups of 2 things, combined for a total of 26. Both multiplication parts must be clearly represented. Accept stories involving two types of items or two separate purchases/collections.",
      "exampleWordProblem": "A store has 4 shelves with 5 big books each and 3 shelves with 2 small books each. How many books are there in total?",
      "hints": {
        "thinkAbout": "This expression has two parts added together: 4 groups of 5 AND 3 groups of 2. Think of two different kinds of groups combined.",
        "revealExplanation": "4 times 5 equals 20, and 3 times 2 equals 6. Together that's 26. Think of two separate groups of items added together."
      }
    },
    {
      "roundNumber": 9,
      "stage": 3,
      "expression": "50 - 3 * 8",
      "expressionDisplay": "50 - (3 x 8) = 26",
      "result": 26,
      "operation": "mixed",
      "rubric": "A correct word problem must describe a situation where you start with 50 things, then remove 3 groups of 8 (removing 24 total), leaving 26. The multiplication (3 groups of 8 removed) must happen before the subtraction conceptually. Order of operations matters. Accept stories involving a starting amount where groups of items are taken away.",
      "exampleWordProblem": "A jar had 50 marbles. Three friends each took 8 marbles. How many marbles are left in the jar?",
      "hints": {
        "thinkAbout": "Start with 50, then remove 3 groups of 8. That's 24 taken away, leaving 26. What scenario works?",
        "revealExplanation": "3 times 8 equals 24. 50 minus 24 equals 26. Think of starting with a large number and removing equal groups."
      }
    },
    {
      "roundNumber": 10,
      "stage": 3,
      "expression": "36 / 4 + 2 * 7",
      "expressionDisplay": "(36 / 4) + (2 x 7) = 23",
      "result": 23,
      "operation": "mixed",
      "rubric": "A correct word problem must describe a situation with TWO parts: 36 things divided into 4 groups (giving 9) AND 2 groups of 7 things (14), combined for a total of 23. Both the division and multiplication must be clearly represented as separate actions that combine. Accept stories with two distinct activities whose results are added.",
      "exampleWordProblem": "A teacher shared 36 crayons equally among 4 tables. Then she gave each table 2 packs of 7 markers. How many coloring supplies does one table have now?",
      "hints": {
        "thinkAbout": "Two things happen: 36 split into 4 groups (that's 9) AND 2 groups of 7 (that's 14). Together that's 23.",
        "revealExplanation": "36 divided by 4 is 9, and 2 times 7 is 14. Adding them gives 23. Think of two separate actions whose totals combine."
      }
    }
  ]
};
```

### Content Generation Guide

Generate **3 content sets**: one Easy, one Medium, one Hard. Each set contains 10 rounds.

The game receives content via `postMessage` (`game_init` -> `event.data.data.content`). To generate different difficulty levels, vary these parameters:

| Field | Easy | Medium | Hard |
|-------|------|--------|------|
| Rounds | 10 | 10 | 10 |
| Stage 1 rounds | 4 | 3 | 2 |
| Stage 2 rounds | 3 | 4 | 4 |
| Stage 3 rounds | 3 | 3 | 4 |
| Number range | 1–20 | 5–50 | 10–100 |
| Operations (Stage 1) | Single: +, -, x, / | Single: +, -, x, / | Single: +, -, x, / |
| Operations (Stage 2) | 2-step: a*b+c | 2-step: a*b-c, a/b+c | 2-step: a*b-c, a/b+c |
| Operations (Stage 3) | 2 operations combined | 3+ operations | 3+ operations + parentheses |

**Content constraints (MUST be enforced):**
- `result` must exactly match the evaluated `expression` with standard order of operations.
- `expressionDisplay` must use `x` instead of `*` for multiplication and show the result after `=`.
- `rubric` must describe what a correct word problem looks like for THAT specific expression, mentioning the specific quantities and operations. No generic rubrics.
- `exampleWordProblem` must be a verified-correct word problem for the expression.
- `hints.revealExplanation` must walk through the expression step-by-step with specific numbers.
- Contexts should be familiar real-world scenarios: food, school, shopping, sports, crafts, animals.
- Each content set should use varied contexts — do not repeat the same context within a set.
- Stage progression must be maintained: Stage 1 first, then Stage 2, then Stage 3.
- Division expressions MUST result in whole numbers (no remainders).
- Stage 3 `expressionDisplay` MUST use parentheses to make grouping explicit when order of operations would change the result if read left-to-right (e.g., `(4 x 5) + (3 x 2) = 26` not `4 x 5 + 3 x 2 = 26`). This removes ambiguity for Grade 4 students who may not yet know PEMDAS/BODMAS.

---

## 5b. Package Script Order (PART-002)

Scripts MUST be loaded in this exact order in the `<head>`:

```html
<!-- 1. SentryConfig package -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/sentry/index.js"></script>

<!-- 2. initSentry() function definition (inline script) -->
<script>
  function initSentry() {
    if (typeof SentryConfig !== 'undefined' && SentryConfig.enabled && typeof Sentry !== 'undefined') {
      Sentry.init({
        dsn: SentryConfig.dsn,
        environment: SentryConfig.environment,
        release: 'word-problem-workshop@1.0.0',
        tracesSampleRate: SentryConfig.tracesSampleRate,
        sampleRate: SentryConfig.sampleRate,
        maxBreadcrumbs: 50,
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          'Script error.',
          'Load failed',
          'Failed to fetch'
        ]
      });
    }
  }

  window.addEventListener('error', function(event) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(event.error || new Error(event.message), {
        tags: { errorType: 'unhandled', severity: 'critical' },
        contexts: { errorEvent: { message: event.message, filename: event.filename, lineno: event.lineno } }
      });
    }
  });

  window.addEventListener('unhandledrejection', function(event) {
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(event.reason || new Error('Unhandled promise rejection'), {
        tags: { errorType: 'unhandled-promise', severity: 'critical' }
      });
    }
  });
</script>

<!-- 3. Sentry SDK (3 scripts, NO integrity attribute) -->
<script src="https://browser.sentry-cdn.com/10.23.0/bundle.tracing.replay.feedback.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/captureconsole.min.js" crossorigin="anonymous"></script>
<script src="https://browser.sentry-cdn.com/10.23.0/browserprofiling.min.js" crossorigin="anonymous"></script>

<!-- 4. Initialize Sentry on load -->
<script>window.addEventListener('load', initSentry);</script>

<!-- 5-7. Game packages (exact URLs, this order: FeedbackManager → Components → Helpers) -->
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/feedback-manager/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/components/index.js"></script>
<script src="https://storage.googleapis.com/test-dynamic-assets/packages/helpers/index.js"></script>
```

**CRITICAL — Correct global names exported by these bundles:**

| Bundle | Globals exported to `window` |
|--------|------------------------------|
| `helpers/sentry/index.js` | `SentryConfig` |
| `feedback-manager/index.js` | `FeedbackManager` |
| `components/index.js` | `ScreenLayout`, `ScreenLayoutComponent`, `ProgressBarComponent`, `TransitionScreenComponent`, `TimerComponent`, `PopupComponent`, `SubtitleComponent`, `StickerComponent`, `StoriesComponent` |
| `helpers/index.js` | `VisibilityTracker`, `SignalCollector`, `MathAIHelpers`, `InteractionManager` |

**Common mistakes to avoid:**
- Do NOT use individual component URLs like `components/screen-layout.js` — they don't exist. Use the bundle `components/index.js`.
- Do NOT use `helpers/visibility-tracker/index.js` or `helpers/signal-collector/index.js` directly — use the bundle `helpers/index.js`.
- The TransitionScreen constructor is `TransitionScreenComponent` (NOT `TransitionScreen`).
- The ScreenLayout constructor is `ScreenLayout` (alias: `ScreenLayoutComponent`).
- Subjective evaluation is accessed via `MathAIHelpers.SubjectiveEvaluation.evaluate()` (NOT standalone `subjectiveEvaluation()`).
- Sentry uses SentryConfig package + 3 SDK scripts (NOT a single `bundle.min.js`).

---

## 6. Screens & HTML Structure

### Body HTML (PART-025 — ScreenLayout v2 sections API)

> **IMPORTANT:** Do NOT use `<template>` tags. Do NOT include a `#results-screen` div. HTML is injected into `#gameContent` after `ScreenLayout.inject()`. Results screen uses TransitionScreen `content` slot.

```html
<body>
  <div id="app"></div>
  <!-- All game HTML injected via JS into #gameContent after ScreenLayout.inject() -->
</body>
```

**ScreenLayout injection:**
```javascript
var layout = ScreenLayout.inject('app', {
  sections: { header: true, questionText: true, progressBar: true, playArea: true, transitionScreen: true }
});
questionSlotId = layout.questionText;
```

**Game content injected into `#gameContent`:**
```html
<div id="game-screen" class="game-block">
  <!-- Expression Card -->
  <div class="expression-card" id="expression-card">
    <p class="expression-label">Write a word problem for:</p>
    <div class="expression-display" id="expression-display"></div>
    <p class="expression-hint-text" id="expression-hint-text"></p>
  </div>

  <!-- Writing Area -->
  <div class="writing-area" id="writing-area">
    <label class="input-label" for="word-problem-input">Your word problem:</label>
    <textarea id="word-problem-input" class="word-problem-input" rows="3" maxlength="500"
      placeholder="Write a real-world story that matches this math expression..."
      data-signal-id="word-problem-input"></textarea>
    <div class="char-count"><span id="char-count">0</span>/500</div>
    <p class="inline-error" id="writing-error" style="display:none;"></p>
  </div>

  <!-- Button Container — OUTSIDE writing-area so it stays visible during feedback -->
  <div class="btn-container" id="btn-container">
    <button class="game-btn btn-secondary" id="btn-reset" data-signal-id="btn-reset" onclick="handleReset()">Reset</button>
    <button class="game-btn btn-primary" id="btn-submit-problem" data-signal-id="btn-submit-problem" onclick="handleProblemSubmit()">
      <span class="btn-spinner" id="btn-submit-spinner"></span>
      <span id="btn-submit-text">Submit Word Problem</span>
    </button>
  </div>

  <!-- Loading Indicator -->
  <div id="loading-indicator" class="loading-indicator" style="display:none;">
    <div class="spinner"></div>
    <span>Evaluating your word problem...</span>
  </div>

  <!-- Feedback Area (shown after evaluation) -->
  <div class="feedback-area" id="feedback-area" style="display:none;">
    <div class="evaluation-badge" id="evaluation-badge"></div>
    <div class="feedback-section">
      <p class="feedback-label">The expression</p>
      <p class="feedback-value" id="feedback-expression"></p>
    </div>
    <div class="feedback-section">
      <p class="feedback-label">Your word problem</p>
      <p class="feedback-user-problem" id="feedback-user-problem"></p>
    </div>
    <div class="feedback-section">
      <p class="feedback-label">Feedback</p>
      <p class="feedback-reasoning" id="feedback-reasoning"></p>
    </div>
    <div class="feedback-section">
      <p class="feedback-label">Points this round</p>
      <p class="feedback-points" id="feedback-points"></p>
    </div>
    <div class="feedback-hint" id="feedback-hint" style="display:none;">
      <p class="hint-label">Tip:</p>
      <p class="hint-text" id="hint-text"></p>
    </div>
    <div class="feedback-example" id="feedback-example" style="display:none;">
      <p class="example-label">Example word problem:</p>
      <p class="example-text" id="example-text"></p>
    </div>
  </div>
</div>
```

**Results screen — uses TransitionScreen content slot (NO `#results-screen` div):**
```javascript
transitionScreen.show({
  title: stars >= 3 ? 'Excellent!' : (stars >= 2 ? 'Good Try!' : 'Keep Practicing!'),
  content: metricsHTML,  // Dynamically built HTML with stars, points, matches, time
  persist: true,
  buttons: [{ text: buttonText, type: stars >= 3 ? 'primary' : 'secondary',
    action: function() { FeedbackManager._stopCurrentDynamic(); restartGame(); } }]
});
```

**Submit button has dual mode — repurposed after evaluation:**
- During writing: `onclick → handleProblemSubmit()`, text "Submit Word Problem"
- After evaluation: `onclick → handleNextRound()`, text "Next Round" (or "See Results" on last round)
- After reset: restored to submit mode

---

## 7. CSS

```css
/* === CSS Variables (PART-020) === */
:root {
  --mathai-green: #219653;
  --mathai-light-green: #D9F8D9;
  --mathai-red: #E35757;
  --mathai-light-red: #FFD9D9;
  --mathai-blue: #2563eb;
  --mathai-light-blue: #EBF0FF;
  --mathai-orange: #F2994A;
  --mathai-light-orange: #FFF3E0;
  --mathai-purple: #7C3AED;
  --mathai-light-purple: #F3E8FF;
  --mathai-gray: #828282;
  --mathai-light-gray: #F2F2F2;
  --mathai-border-gray: #E0E0E0;
  --mathai-white: #FFFFFF;
  --mathai-text-primary: #4a4a4a;
  --mathai-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --mathai-font-size-title: 24px;
  --mathai-font-size-body: 16px;
  --mathai-font-size-label: 14px;
  --mathai-font-size-small: 12px;
}

/* === Reset === */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: var(--mathai-font-family);
  background: var(--mathai-light-gray);
  color: var(--mathai-text-primary);
  -webkit-font-smoothing: antialiased;
}

/* === ScreenLayout v2 overrides === */
.mathai-layout-root { max-width: 480px; margin: 0 auto; }
.mathai-layout-playarea {
  flex-direction: column !important;
  align-items: center !important;
  padding: 8px 16px !important;
  overflow-y: auto !important;
}
.mathai-ts-screen.active { flex: 1; justify-content: flex-start; padding-top: 16px; }
.mathai-ts-card { min-height: 50dvh; }

/* === Game Block === */
.game-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

/* === Expression Card === */
.expression-card {
  width: 100%;
  max-width: 360px;
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
  animation: fadeIn 0.4s ease;
}

.expression-label {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
  margin-bottom: 12px;
  font-weight: 500;
}

.expression-display {
  font-size: clamp(20px, 5vw, 36px);
  font-weight: 800;
  color: var(--mathai-purple);
  background: var(--mathai-light-purple);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 2px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.expression-hint-text {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-gray);
  font-style: italic;
  line-height: 1.4;
}

/* === Writing Area === */
.writing-area {
  width: 100%;
  max-width: 360px;
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  animation: slideInUp 0.4s ease;
}

.input-label {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-gray);
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.word-problem-input {
  width: 100%;
  border: 2px solid var(--mathai-border-gray);
  border-radius: 12px;
  padding: 12px;
  font-size: var(--mathai-font-size-body);
  font-family: var(--mathai-font-family);
  color: var(--mathai-text-primary);
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  line-height: 1.5;
  margin-bottom: 4px;
}
.word-problem-input:focus {
  border-color: var(--mathai-purple);
}

.char-count {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-gray);
  text-align: right;
  margin-bottom: 12px;
}

/* === Inline Error === */
.inline-error {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-red);
  margin-bottom: 8px;
  line-height: 1.4;
}

/* === Buttons (PART-022) === */
.game-btn {
  width: 100%;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  font-size: var(--mathai-font-size-body);
  font-weight: 600;
  font-family: var(--mathai-font-family);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.btn-primary {
  background: var(--mathai-green);
  color: var(--mathai-white);
}
.btn-primary:hover { filter: brightness(0.9); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.feedback-next-btn {
  margin-top: 16px;
  animation: slideInUp 0.3s ease;
}

/* === Evaluation Badge === */
.evaluation-badge {
  width: 100%;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  font-size: var(--mathai-font-size-body);
  font-weight: 700;
  margin-bottom: 16px;
  animation: slideInUp 0.3s ease;
}

.evaluation-badge.correct-match {
  background: var(--mathai-light-green);
  border-left: 4px solid var(--mathai-green);
  color: var(--mathai-green);
}
.evaluation-badge.partial-match {
  background: var(--mathai-light-orange);
  border-left: 4px solid var(--mathai-orange);
  color: var(--mathai-orange);
}
.evaluation-badge.no-match {
  background: var(--mathai-light-red);
  border-left: 4px solid var(--mathai-red);
  color: var(--mathai-red);
}

/* === Feedback Area === */
.feedback-area {
  width: 100%;
  max-width: 360px;
  background: var(--mathai-white);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  animation: slideInUp 0.4s ease;
}

.feedback-section {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--mathai-light-gray);
}
.feedback-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.feedback-label {
  font-size: var(--mathai-font-size-small);
  color: var(--mathai-gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.feedback-value {
  font-size: var(--mathai-font-size-body);
  font-weight: 700;
  color: var(--mathai-purple);
}

.feedback-user-problem {
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-text-primary);
  line-height: 1.5;
  font-style: italic;
}

.feedback-reasoning {
  font-size: var(--mathai-font-size-body);
  color: var(--mathai-text-primary);
  line-height: 1.5;
}

.feedback-points {
  font-size: var(--mathai-font-size-title);
  font-weight: 700;
  color: var(--mathai-green);
}

.feedback-hint {
  background: var(--mathai-light-blue);
  border-radius: 12px;
  padding: 12px;
  margin-top: 12px;
}

.hint-label {
  font-size: var(--mathai-font-size-label);
  font-weight: 700;
  color: var(--mathai-blue);
  margin-bottom: 4px;
}

.hint-text {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-text-primary);
  line-height: 1.4;
}

.feedback-example {
  background: var(--mathai-light-purple);
  border-radius: 12px;
  padding: 12px;
  margin-top: 8px;
}

.example-label {
  font-size: var(--mathai-font-size-label);
  font-weight: 700;
  color: var(--mathai-purple);
  margin-bottom: 4px;
}

.example-text {
  font-size: var(--mathai-font-size-label);
  color: var(--mathai-text-primary);
  line-height: 1.4;
  font-style: italic;
}

/* === Results Screen — uses TransitionScreen content slot, no separate div === */
/* Results metrics are built inline in showResults() function */

/* === Button Spinner (inside submit button) === */
.btn-spinner {
  display: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}
.btn-primary:disabled .btn-spinner { display: inline-block; }

/* === Loading Indicator === */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px;
  color: var(--mathai-gray);
  font-size: var(--mathai-font-size-label);
  width: 100%;
  max-width: 360px;
}
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid var(--mathai-light-gray);
  border-top-color: var(--mathai-purple);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* === Button Container (Reset + Submit side-by-side) === */
.btn-container {
  display: flex;
  gap: 12px;
  justify-content: center;
  width: 100%;
  max-width: 360px;
  margin: 4px auto 0;
}

/* === Animations === */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 8. Game Flow

### Stage Progression

- **Stage 1 (Rounds 1-4) — Simple Operations:** Single-operation expressions (+, -, x, /). Numbers are small (1-20). The kid learns the basic connection between each operation and its real-world meaning.
- **Stage 2 (Rounds 5-7) — Multi-Step:** Two-operation expressions (e.g., 3 x 4 + 2). The kid must build a story with two connected steps. Requires understanding order of operations.
- **Stage 3 (Rounds 8-10) — Mixed Operations:** Complex expressions with 2+ different operations combined (e.g., 4 x 5 + 3 x 2). The kid must construct multi-part stories. Tests deeper understanding.

### Scoring

Each round awards up to 3 points based ENTIRELY on LLM evaluation:
- **Evaluation tiers (all determined by `MathAIHelpers.SubjectiveEvaluation.evaluate()`):**
  - ✅ **Correct match** — word problem correctly represents the expression: **3 points**
  - 🔶 **Partial match** — word problem captures the general idea but has errors in quantities or operations: **1 point**
  - ❌ **No match** — word problem does not represent the expression or is incoherent: **0 points**

**Max total: 30 points (10 rounds x 3 points)**

**Star calculation:**
- 24-30 points → ⭐⭐⭐ (3 stars)
- 15-23 points → ⭐⭐ (2 stars)
- 1-14 points → ⭐ (1 star)

### Flow Steps

1. **Page loads** → DOMContentLoaded fires:
   - `waitForPackages()` — checks `ScreenLayout`, `ProgressBarComponent`, `TransitionScreenComponent`, `FeedbackManager`, `VisibilityTracker`, `SignalCollector`, `MathAIHelpers` exist (10s timeout)
   - `FeedbackManager.init()` — do NOT call `unlock()` after
   - Audio preload: `correct_sound_effect`, `incorrect_sound_effect`, `victory_sound_effect`, `victory`, `game_complete_sound_effect`, `game_complete_1_star`, `game_complete_2_star`
   - SignalCollector created and assigned to `window.signalCollector`
   - EventCapture guarded init: `try { if (typeof EventCapture !== 'undefined') EventCapture.init(); } catch (e) {}`
   - `ScreenLayout.inject('app', { sections: { header: true, questionText: true, progressBar: true, playArea: true, transitionScreen: true } })` — v2 sections API, NOT slots
   - Store `questionSlotId = layout.questionText` for dynamic updates
   - Build initial question text into `questionSlotId` slot: "Word Problem Workshop / Turn math expressions into real-world stories!"
   - Inject game HTML into `#gameContent` (expression card + writing area + **btn-container (outside writing-area)** + loading indicator + feedback area)
   - Attach `input` listener on `#word-problem-input` to update `#char-count`
   - InteractionManager creation: `{ selector: '.writing-area', disableOnAudioFeedback: false, disableOnEvaluation: true }`
   - `createProgressBar()` helper — creates ProgressBar with destroy-before-create pattern
   - `transitionScreen = new TransitionScreenComponent({ autoInject: true })`
   - VisibilityTracker created — config saved to `visibilityTrackerConfig` for reuse in `restartGame()`
   - Register `window.addEventListener('message', handlePostMessage)` — BEFORE `game_ready`
   - Fire `game_ready` event and postMessage to parent
   - Poll `canPlayAudio()` with `setInterval(200ms)` + `setTimeout(15000ms)` fallback
   - `setupGame()` — idempotent, loads fallback content
   - Show start transition screen with welcome audio + sticker:
     ```javascript
     transitionScreen.show({
       icons: ['✏️'], iconSize: 'large',
       title: 'Word Problem Workshop',
       subtitle: 'Turn math expressions into real-world stories!',
       persist: true,
       buttons: [{ text: "Let's Go!", type: 'primary',
         action: function() { FeedbackManager._stopCurrentDynamic(); startGame(); } }]
     });
     // Welcome VO (only once, even across restarts)
     if (!gameState.voGameStartPlayed) {
       gameState.voGameStartPlayed = true;
       gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
         audio_content: 'Welcome to the Word Problem Workshop! See a math expression, then write a real-world story that matches it. Let\'s turn math into stories!',
         subtitle: 'Turn math expressions into real-world stories!',
         sticker: ROUND_STICKER_1  // Plain URL string for playDynamicFeedback
       });
       await gameState.currentDynamicAudio;
       gameState.currentDynamicAudio = null;
     }
     ```

2. **handlePostMessage(event)** — receives content and signal config from parent:
   - If `event.data.type === 'game_init'`:
     ```javascript
     gameState.content = event.data.data.content || fallbackContent;
     gameState.contentSetId = event.data.data.contentSetId || null;
     gameState.signalConfig = event.data.data.signalConfig || null;

     // Configure SignalCollector flush (PART-010 v3)
     if (signalCollector && gameState.signalConfig) {
       if (gameState.signalConfig.flushUrl) signalCollector.flushUrl = gameState.signalConfig.flushUrl;
       if (gameState.signalConfig.playId) signalCollector.playId = gameState.signalConfig.playId;
       if (gameState.signalConfig.sessionId) signalCollector.sessionId = gameState.signalConfig.sessionId;
       if (gameState.signalConfig.studentId) signalCollector.studentId = gameState.signalConfig.studentId;
       signalCollector.startFlushing();
     }
     ```
   - Enable start button on transition screen
   - Record view event:
     ```javascript
     if (signalCollector) {
       signalCollector.recordViewEvent('screen_transition', {
         screen: 'start',
         metadata: { transition_from: 'loading', content_loaded: true }
       });
     }
     ```

3. **startGame()** (from start screen button):
   - `FeedbackManager._stopCurrentDynamic()` — stops welcome VO if still playing
   - `transitionScreen.hide()` — explicit hide, TransitionScreen does NOT auto-hide on button click
   - `setupGame()` — idempotent, loads content
   - Reset: `gameState.currentRound = 0`
   - Set `gameState.startTime = Date.now()`
   - Set `gameState.duration_data.startTime = new Date().toISOString()`
   - Set `gameState.isActive = true`, `gameState.gameEnded = false`
   - `trackEvent('game_start', 'game')`
   - Call `showRoundTransition()` — shows round 1 intro screen with VO

4. **setupRound()**:
   - Get `roundData = gameState.content.rounds[gameState.currentRound]`
   - Set `gameState.roundData = roundData`
   - Set `gameState.currentStage = roundData.stage`
   - Reset round state: `gameState.wordProblemText = ''`, `gameState.evaluationResult = null`, `gameState.feedbackText = ''`
   - Set `gameState.isProcessing = false`
   - Populate expression card:
     - `#expression-display`: `roundData.expressionDisplay`
     - `#expression-hint-text`: Stage-specific hint text:
       - Stage 1: `"Think of a real-life situation with this operation."`
       - Stage 2: `"This has two steps — your story needs two parts!"`
       - Stage 3: `"This combines multiple operations — build a story with different actions!"`
   - Clear `#word-problem-input`, reset `#char-count` to 0
   - Show `#expression-card` and `#writing-area`; hide `#feedback-area`, `#feedback-hint`, `#feedback-example`, `#writing-error`
   - Re-show `#btn-reset` (hidden during feedback phase)
   - Enable `#btn-submit-problem`, reset text to "Submit Word Problem"
   - `progressBar.update(gameState.currentRound, 0)`
   - Focus textarea after short delay
   - `trackEvent('round_start', 'game', { round: gameState.currentRound + 1, stage: roundData.stage, expression: roundData.expression })`
   - Record view event:
     ```javascript
     if (signalCollector) {
       signalCollector.recordViewEvent('content_render', {
         screen: 'gameplay',
         content_snapshot: {
           expression: roundData.expressionDisplay,
           round: gameState.currentRound + 1,
           stage: roundData.stage,
           operation: roundData.operation,
           trigger: 'round_start'
         },
         components: {
           progress: { current: gameState.currentRound, total: gameState.totalRounds }
         }
       });
     }
     ```

5. **handleProblemSubmit()** — kid taps "Submit Word Problem":
   - Guard: `if (!gameState.isActive || gameState.isProcessing) return`
   - `gameState.isProcessing = true`
   - Read `wordProblem = document.getElementById('word-problem-input').value.trim()`
   - If `wordProblem.length < 10`: set `#writing-error` text to "Please write at least a sentence describing a real-world situation.", show `#writing-error`, `gameState.isProcessing = false`, return
   - Hide `#writing-error` (clear any previous error)
   - `gameState.wordProblemText = wordProblem`
   - `trackEvent('word_problem_submit', 'game', { wordProblem, round: gameState.currentRound + 1, expression: gameState.roundData.expression })`
   - Disable `#btn-submit-problem`, change text to "Evaluating...", show spinner
   - Disable textarea (`input.disabled = true`)
   - **Wrap the rest in try/catch/finally to ensure isProcessing reset (PART-015 pattern):**
   - **try:**
     - **LLM Evaluation (PART-015 — PRIMARY evaluation):**
       ```javascript
       var result = await validateWordProblemLLM(
         wordProblem,
         gameState.roundData.expression,
         gameState.roundData.expressionDisplay,
         gameState.roundData.result,
         gameState.roundData.rubric
       );
       gameState.evaluationResult = result.tier;  // 'correct_match' | 'partial_match' | 'no_match'
       gameState.feedbackText = result.feedback;
       ```
     - **Calculate round points:**
       ```javascript
       var roundPoints = 0;
       if (gameState.evaluationResult === 'correct_match') roundPoints = 3;
       else if (gameState.evaluationResult === 'partial_match') roundPoints = 1;
       gameState.totalPoints += roundPoints;
       if (gameState.evaluationResult === 'correct_match') gameState.correctCount++;
       if (gameState.evaluationResult === 'partial_match') gameState.partialCount++;
       ```
     - `trackEvent('evaluation_complete', 'game', { wordProblem, tier: gameState.evaluationResult, feedback: result.feedback, roundPoints, round: gameState.currentRound + 1 })`
     - **Show feedback UI via `showFeedbackUI(roundData, result, roundPoints, wordProblem)`**
     - **Play SFX + sticker based on evaluation (fire-and-forget — short SFX):**
       ```javascript
       // sound.play() sticker format: OBJECT { image, duration, type }
       var isCorrect = gameState.evaluationResult === 'correct_match';
       if (isCorrect) {
         FeedbackManager.sound.play('correct_sound_effect', {
           sticker: { image: CORRECT_STICKER_URL, duration: 2, type: 'IMAGE_GIF' }
         }).catch(function(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); });
       } else {
         FeedbackManager.sound.play('incorrect_sound_effect', {
           sticker: { image: INCORRECT_STICKER_URL, duration: 2, type: 'IMAGE_GIF' }
         }).catch(function(e) { console.error('Audio error:', JSON.stringify({ error: e.message }, null, 2)); });
       }
       ```
     - **Play dynamic TTS with LLM feedback — AWAITED:**
       ```javascript
       // playDynamicFeedback() sticker format: PLAIN URL STRING
       var feedbackText = result.feedback || roundData.hints.revealExplanation;
       document.getElementById('btn-submit-text').textContent = 'Playing Feedback...';
       gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
         audio_content: feedbackText,
         subtitle: feedbackText,
         sticker: isCorrect ? CORRECT_STICKER_URL : INCORRECT_STICKER_URL
       });
       await gameState.currentDynamicAudio;
       gameState.currentDynamicAudio = null;
       ```
     - Record feedback display view event:
       ```javascript
       if (signalCollector) {
         signalCollector.recordViewEvent('feedback_display', {
           screen: 'gameplay',
           content_snapshot: {
             feedback_type: gameState.evaluationResult,
             round_points: roundPoints,
             round: gameState.currentRound + 1,
             trigger: 'user_action'
           }
         });
       }
       ```
     - Record attempt:
       ```javascript
       recordAttempt({
         input_of_user: { wordProblem: gameState.wordProblemText },
         correct: gameState.evaluationResult === 'correct_match',
         metadata: {
           round: gameState.currentRound + 1,
           expression: gameState.roundData.expressionDisplay,
           result: gameState.roundData.result,
           evaluationTier: gameState.evaluationResult,
           roundPoints: roundPoints,
           validationType: 'subjective',
           llmFeedback: result.feedback
         }
       });
       ```
     - Record round outcome:
       ```javascript
       if (signalCollector) {
         signalCollector.recordCustomEvent('round_solved', {
           correct: gameState.evaluationResult === 'correct_match',
           round: gameState.currentRound + 1,
           evaluationTier: gameState.evaluationResult,
           roundPoints: roundPoints
         });
       }
       ```
   - **catch (error):**
     - Log error: `console.error('Word problem evaluation failed:', JSON.stringify({ error: error.message }, null, 2))`
     - Report to Sentry if available:
       ```javascript
       if (typeof Sentry !== 'undefined') {
         Sentry.captureException(error, { tags: { phase: 'word-problem-evaluation', severity: 'high' } });
       }
       ```
     - **Graceful fallback — show feedback with 0 points:**
       ```javascript
       document.getElementById('loading-indicator').style.display = 'none';
       showFeedbackUI(roundData, { tier: 'no_match', feedback: 'We couldn\'t evaluate your word problem this time. Your answer was saved!' }, 0, wordProblem);
       ```
     - Record attempt with error metadata
     - Set submit button to "Next Round" / "See Results", re-enable, set `onclick = handleNextRound`
   - **After try/catch:**
     - `gameState.isProcessing = false`

6. **handleNextRound()** — kid taps "Next Round" / "See Results" (submit button repurposed):
   - `FeedbackManager._stopCurrentDynamic()` — stops any remaining TTS
   - Restore submit button: `btnSubmit.onclick = handleProblemSubmit`
   - `trackEvent('round_complete', 'game', { round: gameState.currentRound + 1 })`
   - `gameState.currentRound++`
   - `progressBar.update(gameState.currentRound, 0)`
   - If `gameState.currentRound >= gameState.totalRounds` → `endGame()`
   - Else → `showRoundTransition()`

7. **showRoundTransition()** — transition screen before each round:
   - `FeedbackManager._stopCurrentDynamic()`
   - Get `roundData = gameState.content.rounds[gameState.currentRound]`
   - Check if stage changed (for rounds after the first):
     ```javascript
     if (roundIndex > 0) {
       var prevRound = gameState.content.rounds[roundIndex - 1];
       if (prevRound && prevRound.stage !== roundData.stage) {
         showStageTransition(roundData);
         return;
       }
     }
     ```
   - Show round transition screen:
     ```javascript
     transitionScreen.show({
       icons: ['✏️'],
       iconSize: 'normal',
       title: 'Round ' + roundData.roundNumber,
       subtitle: 'Write a word problem for: ' + roundData.expressionDisplay,
       persist: true,
       buttons: [{ text: "Let's Go!", type: 'primary', action: function() {
         FeedbackManager._stopCurrentDynamic();
         transitionScreen.hide();
         setupRound();
       }}]
     });
     ```
   - Play round VO with sticker (fire-and-forget with `.catch()`):
     ```javascript
     try {
       gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
         audio_content: 'Round ' + roundNum + '! Write a word problem for ' + roundData.expressionDisplay + '.',
         subtitle: 'Round ' + roundNum + ': ' + roundData.expressionDisplay,
         sticker: ROUND_STICKERS[stickerIndex]  // Plain URL string for playDynamicFeedback
       });
     } catch(e) { console.error('Round VO error:', JSON.stringify({ error: e.message }, null, 2)); }
     ```

   **showStageTransition(roundData)** — shown when stage changes (round 5, round 8):
   - `FeedbackManager._stopCurrentDynamic()`
   - Stage names: `{ 1: 'Simple Operations', 2: 'Multi-Step', 3: 'Mixed Operations' }`
   - Stage descriptions: `{ 1: 'One operation — build a simple story!', 2: 'Two steps — your story needs two parts!', 3: 'Multiple operations — create a complex story!' }`
   - Show stage transition screen:
     ```javascript
     transitionScreen.show({
       icons: ['✏️'],
       iconSize: 'large',
       title: 'Stage ' + roundData.stage + ': ' + stageNames[roundData.stage],
       subtitle: stageDescs[roundData.stage],
       persist: true,
       buttons: [{ text: "I'm Ready!", type: 'primary', action: function() {
         FeedbackManager._stopCurrentDynamic();
         transitionScreen.hide();
         setupRound();
       }}]
     });
     ```
   - Play stage VO with sticker (fire-and-forget with `.catch()`):
     ```javascript
     try {
       gameState.currentDynamicAudio = FeedbackManager.playDynamicFeedback({
         audio_content: 'Stage ' + roundData.stage + ': ' + stageNames[roundData.stage] + '! ' + stageDescs[roundData.stage],
         subtitle: stageNames[roundData.stage],
         sticker: ROUND_STICKERS[stickerIndex]  // Plain URL string for playDynamicFeedback
       });
     } catch(e) { console.error('Stage VO error:', JSON.stringify({ error: e.message }, null, 2)); }
     ```

8. **async endGame()** (all 10 rounds completed):
   - Guard: `if (gameState.gameEnded) return`; `gameState.gameEnded = true`; `gameState.isActive = false`
   - `gameState.duration_data.currentTime = new Date().toISOString()`
   - Calculate stars and metrics:
     ```javascript
     var timeTaken = Math.round((Date.now() - gameState.startTime) / 1000);
     var accuracy = gameState.totalRounds > 0 ? Math.round((gameState.correctCount / gameState.totalRounds) * 100) : 0;
     var stars = 1;
     if (gameState.totalPoints >= 24) stars = 3;
     else if (gameState.totalPoints >= 15) stars = 2;

     var metrics = {
       accuracy: accuracy,
       time: timeTaken,
       stars: stars,
       attempts: gameState.attempts,
       duration_data: gameState.duration_data,
       totalLives: 1,  // No lives in this game — default 1 per PART-011
       tries: computeTriesPerRound(gameState.attempts),
       totalPoints: gameState.totalPoints,
       correctCount: gameState.correctCount,
       partialCount: gameState.partialCount,
       totalRounds: gameState.totalRounds
     };

     // Track session history for restart
     if (gameState.sessionHistory && gameState.sessionHistory.length > 0) {
       metrics.sessionHistory = gameState.sessionHistory.concat([{
         totalLives: 1,
         tries: computeTriesPerRound(gameState.attempts)
       }]);
     }
     ```
   - `trackEvent('game_end', 'game', { metrics: { stars: stars, accuracy: accuracy, totalPoints: gameState.totalPoints } })`
   - Sentry breadcrumb:
     ```javascript
     if (typeof Sentry !== 'undefined') {
       Sentry.addBreadcrumb({ category: 'game', message: 'endGame', data: { stars: stars, accuracy: accuracy, totalPoints: gameState.totalPoints }, level: 'info' });
     }
     ```
   - **SignalCollector: recordViewEvent BEFORE seal** (seal freezes collector):
     ```javascript
     if (signalCollector) {
       signalCollector.recordViewEvent('screen_transition', {
         screen: 'results',
         metadata: { transition_from: 'gameplay' }
       });
       signalCollector.seal();
     }
     ```
   - **Show results via TransitionScreen content slot** (no separate `#results-screen` div):
     ```javascript
     showResults(metrics, stars);
     ```
   - **PostMessage BEFORE audio** (so parent isn't blocked by audio await):
     ```javascript
     window.parent.postMessage({
       type: 'game_complete',
       data: {
         metrics: metrics,
         attempts: gameState.attempts,
         completedAt: Date.now()
       }
     }, '*');
     ```
   - **Play end-game audio based on stars** (SFX + sticker → awaited voice):
     ```javascript
     if (stars === 3) {
       try { await FeedbackManager.sound.play('victory_sound_effect', { sticker: { image: VICTORY_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } }); } catch(e) {}
       try { await FeedbackManager.sound.play('victory'); } catch(e) {}
     } else if (stars === 2) {
       try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: GAME_COMPLETE_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } }); } catch(e) {}
       try { await FeedbackManager.sound.play('game_complete_2_star'); } catch(e) {}
     } else {
       try { await FeedbackManager.sound.play('game_complete_sound_effect', { sticker: { image: GAME_COMPLETE_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } }); } catch(e) {}
       try { await FeedbackManager.sound.play('game_complete_1_star'); } catch(e) {}
     }
     ```
   - **Guarded cleanup** — prevents destroying components recreated by restartGame():
     ```javascript
     if (gameState.gameEnded) {
       if (visibilityTracker) { visibilityTracker.destroy(); visibilityTracker = null; }
       try { FeedbackManager._stopCurrentDynamic(); } catch(e) {}
       if (progressBar) { progressBar.destroy(); progressBar = null; }
     }
     ```

9. **restartGame()** — Full reset with preserve/restore:
   - **Push session snapshot BEFORE resetting:**
     ```javascript
     if (!gameState.sessionHistory) gameState.sessionHistory = [];
     gameState.sessionHistory.push({
       totalLives: 1,
       totalPoints: gameState.totalPoints,
       tries: computeTriesPerRound(gameState.attempts)
     });
     ```
   - **Preserve across restart** (content, config, session history, voGameStartPlayed):
     ```javascript
     var preserved = {
       content: gameState.content,
       contentSetId: gameState.contentSetId,
       signalConfig: gameState.signalConfig,
       sessionHistory: gameState.sessionHistory,
       voGameStartPlayed: gameState.voGameStartPlayed
     };
     ```
   - Reset all gameState fields to defaults: `currentRound=0, score=0, attempts=[], events=[], isActive=false, isProcessing=false, gameEnded=false, currentStage=1, totalPoints=0, wordProblemText='', evaluationResult=null, feedbackText='', roundData=null, correctCount=0, partialCount=0, currentDynamicAudio=null, startTime=null`
   - Reset `duration_data`: `{ startTime: null, preview: [], attempts: [], evaluations: [], inActiveTime: [], totalInactiveTime: 0, currentTime: null }`
   - **Restore preserved:**
     ```javascript
     gameState.content = preserved.content;
     gameState.contentSetId = preserved.contentSetId;
     gameState.signalConfig = preserved.signalConfig;
     gameState.sessionHistory = preserved.sessionHistory;
     gameState.voGameStartPlayed = preserved.voGameStartPlayed;
     ```
   - **Recreate SignalCollector** (no optional chaining — use `&&` checks):
     ```javascript
     signalCollector = new SignalCollector({
       sessionId: (window.gameVariableState && window.gameVariableState.sessionId) ? window.gameVariableState.sessionId : 'session_' + Date.now(),
       studentId: (window.gameVariableState && window.gameVariableState.studentId) ? window.gameVariableState.studentId : null,
       gameId: gameState.gameId,
       contentSetId: gameState.contentSetId
     });
     window.signalCollector = signalCollector;
     if (gameState.signalConfig && gameState.signalConfig.flushUrl) {
       signalCollector.flushUrl = gameState.signalConfig.flushUrl;
       signalCollector.playId = gameState.signalConfig.playId || null;
       signalCollector.sessionId = gameState.signalConfig.sessionId || signalCollector.sessionId;
       signalCollector.studentId = gameState.signalConfig.studentId || signalCollector.studentId;
       signalCollector.startFlushing();
     }
     ```
   - **Recreate VisibilityTracker** using saved config:
     ```javascript
     visibilityTracker = new VisibilityTracker(visibilityTrackerConfig);
     ```
   - **Recreate ProgressBar** using destroy-before-create helper:
     ```javascript
     createProgressBar();
     progressBar.update(0, 0);
     ```
   - Restore question text slot to initial state
   - Re-enable writing area: `input.disabled = false; input.value = '';`
   - Restore submit button: `btnSubmit.onclick = handleProblemSubmit; btnSubmit.disabled = false;`
   - `trackEvent('game_start', 'game')` — NOTE: this fires `game_start` on restart. Review finding: consider removing to avoid duplicate `game_start` events since `startGame()` also fires it.
   - Show start transition screen:
     ```javascript
     transitionScreen.show({
       icons: ['✏️'],
       iconSize: 'large',
       title: 'Word Problem Workshop',
       subtitle: 'Turn math expressions into real-world stories!',
       persist: true,
       buttons: [{ text: "Let's Go!", type: 'primary', action: function() { FeedbackManager._stopCurrentDynamic(); startGame(); } }]
     });
     ```

---

## 9. Functions

### Global Scope (RULE-001) — all `var`, no `let`/`const`, no optional chaining (`?.`)

**handlePostMessage(event)** — as described in Flow Step 2

**startGame()** — as described in Flow Step 3

**showRoundTransition()** — as described in Flow Step 7 (shows round intro or delegates to showStageTransition)

**showStageTransition(roundData)** — as described in Flow Step 7 (shows stage intro when stage changes)

**setupRound()** — as described in Flow Step 4

**async handleProblemSubmit()** — as described in Flow Step 5 (wrapped in try/catch)

**showFeedbackUI(roundData, result, roundPoints, wordProblem)** — renders evaluation badge, feedback sections, hint/example:
- Sets badge class: `correct-match` / `partial-match` / `no-match`
- Populates: `#feedback-expression`, `#feedback-user-problem`, `#feedback-reasoning`, `#feedback-points`
- For non-correct_match: shows `#feedback-hint` with `roundData.hints.thinkAbout` and `#feedback-example` with `roundData.exampleWordProblem`
- Hides expression card + writing area, shows feedback area
- Hides `#btn-reset` (only "Next Round" / "See Results" button should be visible during feedback)

**handleNextRound()** — as described in Flow Step 6

**handleReset()** — resets writing area for current round:
- Guard: `if (gameState.isProcessing) return`
- Guard: `if (gameState.evaluationResult !== null) return` — prevents reset after evaluation (double submission)
- `FeedbackManager._stopCurrentDynamic()`
- Clear textarea, re-enable it, reset char count, hide errors/loading/feedback
- Show expression card + writing area back
- Restore submit button to `handleProblemSubmit`
- `gameState.wordProblemText = ''`
- `trackEvent('answer_reset', 'game', { round: gameState.currentRound + 1 })`

**async endGame()** — as described in Flow Step 8

**showResults(metrics, stars)** — renders results via TransitionScreen content slot:
- Builds inline HTML with star display, metrics rows (Total Points, Perfect Matches, Partial Matches, Time)
- Shows via `transitionScreen.show({ title, content: metricsHTML, persist: true, buttons: [...] })`
- Button text: 3 stars → "Play Again", else → "Retry for more stars"
- Button action: `FeedbackManager._stopCurrentDynamic(); restartGame();`

**restartGame()** — as described in Flow Step 9

**updateQuestionText(roundData)** — updates questionText slot with round/stage info:
- Shows "Round N — Stage S: StageName" + "Write a word problem for the expression below"

**createProgressBar()** — destroy-before-create helper:
```javascript
function createProgressBar() {
  if (progressBar) { progressBar.destroy(); progressBar = null; }
  progressBar = new ProgressBarComponent({
    autoInject: true,
    totalRounds: gameState.totalRounds || 10,
    totalLives: 0,
    slotId: 'mathai-progress-slot'
  });
}
```

**computeTriesPerRound(attempts)** — PART-011 v3 helper:
```javascript
function computeTriesPerRound(attempts) {
  var rounds = {};
  attempts.forEach(function(a) {
    var r = (a.metadata && a.metadata.round) ? a.metadata.round : 0;
    rounds[r] = (rounds[r] || 0) + 1;
  });
  return Object.keys(rounds).map(function(r) {
    return { round: Number(r), triesCount: rounds[r] };
  });
}
```

**formatTime(seconds)** — display helper:
```javascript
function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}
```

**async validateWordProblemLLM(wordProblem, expression, expressionDisplay, expectedResult, rubric)** — PART-015 (PRIMARY EVALUATION via `MathAIHelpers.SubjectiveEvaluation.evaluate()`):
```javascript
async function validateWordProblemLLM(wordProblem, expression, expressionDisplay, expectedResult, rubric) {
  try {
    // Sanitize answer — escape quotes to prevent prompt injection
    var sanitizedProblem = wordProblem.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');

    var result = await MathAIHelpers.SubjectiveEvaluation.evaluate({
      components: [{
        component_id: 'wp_' + gameState.currentRound,
        evaluation_prompt: 'Math expression: "' + expressionDisplay + '" (result = ' + expectedResult + ')\n'
          + 'Student\'s word problem: "' + sanitizedProblem + '"\n'
          + 'Rubric: ' + rubric + '\n\n'
          + 'Evaluate whether the student\'s word problem correctly represents the given math expression.\n\n'
          + 'Be GENEROUS and BROAD in your evaluation — this is a Grade 4 student being creative. Accept any word problem that demonstrates understanding of the math, even if:\n'
          + '- The items are different types\n'
          + '- The wording is informal, uses slang, or has minor grammar/spelling mistakes\n'
          + '- The story is silly, fantastical, or uses unusual scenarios\n'
          + '- The student describes the result explicitly rather than posing it as a question\n\n'
          + 'IMPORTANT: Profanity, insults, abuse, and offensive language are NEVER correct. They are ALWAYS no_match.\n'
          + 'The word "idk" or "I don\'t know" as a standalone answer means the student doesn\'t know — classify as no_match.\n\n'
          + 'What matters is:\n'
          + '1. The correct quantities from the expression appear in the story\n'
          + '2. The relationship between quantities matches the operation\n'
          + '3. The math works out to the correct result\n\n'
          + 'Return ONLY one of these three words — nothing else, no quotes, no explanation:\n'
          + 'correct_match\npartial_match\nno_match',
        feedback_prompt: 'You are a friendly math tutor helping a Grade 4 student learn to write word problems.\n\n'
          + 'Math expression: "' + expressionDisplay + '"\n'
          + 'Student\'s word problem: "' + sanitizedProblem + '"\n'
          + 'Evaluation: {{evaluation}}\n\n'
          + 'Provide a short (2-3 sentence) encouraging feedback.\n'
          + 'Keep it warm and age-appropriate for a Grade 4 student. Use simple language.'
      }],
      timeout: 30000
    });

    // Guard against malformed API response
    if (!result || !result.data || !result.data[0]) {
      console.error('Subjective evaluation returned malformed response:', JSON.stringify(result, null, 2));
      return { tier: 'no_match', evaluation: '', feedback: 'We couldn\'t evaluate your word problem this time. Keep trying!' };
    }

    var componentResult = result.data[0];
    var evalText = (componentResult.evaluation || '').trim().toLowerCase().replace(/[^a-z_]/g, '');

    // Normalize evaluation to expected tiers (indexOf for ES5 compat — no .includes())
    var tier = 'no_match';
    if (evalText.indexOf('correct_match') !== -1) tier = 'correct_match';
    else if (evalText.indexOf('partial_match') !== -1) tier = 'partial_match';

    return {
      tier: tier,
      evaluation: componentResult.evaluation || '',
      feedback: componentResult.feedback || ''
    };
  } catch (error) {
    console.error('LLM validation error:', JSON.stringify({ error: error.message }, null, 2));
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, { tags: { phase: 'llm-evaluation', component: 'SubjectiveEvaluation', severity: 'high' } });
    }
    return { tier: 'no_match', evaluation: '', feedback: 'We couldn\'t evaluate your word problem this time. Keep trying!' };
  }
}
```

---

## 10. Feedback Integration (PART-017)

### Audio Preload

```
correct_sound_effect: https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757588479110.mp3
incorrect_sound_effect: https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757432062452.mp3
victory_sound_effect: https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506672258.mp3
victory: https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/e252bcc4-bd5f-4195-ad04-a02582095b6d.mp3
game_complete_sound_effect: https://cdn.mathai.ai/mathai-assets/dev/home-explore/document/1757506659491.mp3
game_complete_1_star: https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/2ee85ea3-919b-4010-95a2-40bcd7d90d22.mp3
game_complete_2_star: https://cdn.mathai.ai/mathai-assets/dev/worksheet/audio/84f4ff34-6e59-43d6-9663-4d9936cad002.mp3
```

**Note:** `game_over_sound_effect` and `game_over` are NOT preloaded — the game has no game-over state (all players complete all 10 rounds).

### Sticker URLs

```
CORRECT_STICKER_URL: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-20.gif (IMAGE_GIF)
INCORRECT_STICKER_URL: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-28.gif (IMAGE_GIF)
VICTORY_STICKER_URL: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1757430772002-98.gif (IMAGE_GIF)
GAME_COMPLETE_STICKER_URL: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1754587201419-25.gif (IMAGE_GIF)

Round stickers (plain URL strings for playDynamicFeedback):
ROUND_STICKER_1: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1743761988949-44.gif
ROUND_STICKER_2: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1743761988949-47.gif
ROUND_STICKER_3: https://cdn.mathai.ai/mathai-assets/dev/figma/assets/rc-upload-1743761988949-52.gif
```

### Sticker Format Rules

- **`sound.play()` sticker** → object: `{ sticker: { image: URL, duration: N, type: 'IMAGE_GIF' } }`
- **`playDynamicFeedback()` sticker** → plain URL string: `{ sticker: URL_STRING }`
- NEVER mix formats.

### Audio Flow per Interaction

- **Welcome VO (start screen):** `playDynamicFeedback({ audio_content, subtitle, sticker: ROUND_STICKER_1 })` — awaited, only once via `voGameStartPlayed` flag
- **Round intro VO:** `playDynamicFeedback({ audio_content, subtitle, sticker: ROUND_STICKERS[i] })` — fire-and-forget on transition screen
- **Stage intro VO:** `playDynamicFeedback({ audio_content, subtitle, sticker: ROUND_STICKERS[i] })` — fire-and-forget on transition screen
- **Word problem evaluated — correct_match:** SFX `correct_sound_effect` (fire-and-forget with `.catch()`) + sticker → then `playDynamicFeedback` with LLM feedback (awaited)
- **Word problem evaluated — partial_match / no_match:** SFX `incorrect_sound_effect` (fire-and-forget with `.catch()`) + sticker → then `playDynamicFeedback` with LLM feedback (awaited)
- **End game — 3 stars:** `await sound.play('victory_sound_effect', { sticker: VICTORY })` → `await sound.play('victory')`
- **End game — 2 stars:** `await sound.play('game_complete_sound_effect', { sticker: GAME_COMPLETE })` → `await sound.play('game_complete_2_star')`
- **End game — 1 star:** `await sound.play('game_complete_sound_effect', { sticker: GAME_COMPLETE })` → `await sound.play('game_complete_1_star')`

---

## 11. Audio Sequence Table

| # | Moment | Trigger | Audio Type | Content / Sound ID | Await? | Notes |
|---|--------|---------|------------|--------------------|--------|-------|
| 1 | Welcome VO | DOMContentLoaded (after canPlayAudio) | Dynamic TTS | `playDynamicFeedback({ audio_content: 'Welcome to the Word Problem Workshop!...', sticker: ROUND_STICKER_1 })` | ✅ Awaited* | Only once via `voGameStartPlayed` flag; streaming may resolve early |
| 2 | Round intro VO | showRoundTransition() | Dynamic TTS | `playDynamicFeedback({ audio_content: 'Round N! Write a word problem for...', sticker: ROUND_STICKERS[i] })` | ❌ Fire-and-forget | Stopped by `_stopCurrentDynamic()` in button action |
| 3 | Stage intro VO | showStageTransition() | Dynamic TTS | `playDynamicFeedback({ audio_content: 'Stage N: StageName!...', sticker: ROUND_STICKERS[i] })` | ❌ Fire-and-forget | Stopped by `_stopCurrentDynamic()` in button action |
| 4 | Correct SFX | handleProblemSubmit (correct_match) | Static + Sticker | `sound.play('correct_sound_effect', { sticker: { image: CORRECT_STICKER_URL, duration: 2, type: 'IMAGE_GIF' } })` | ❌ Fire-and-forget | `.catch()` attached; short SFX overlaps start of TTS |
| 5 | Incorrect SFX | handleProblemSubmit (partial/no_match) | Static + Sticker | `sound.play('incorrect_sound_effect', { sticker: { image: INCORRECT_STICKER_URL, duration: 2, type: 'IMAGE_GIF' } })` | ❌ Fire-and-forget | `.catch()` attached; short SFX overlaps start of TTS |
| 6 | Evaluation feedback TTS | handleProblemSubmit (after SFX) | Dynamic TTS | `playDynamicFeedback({ audio_content: result.feedback, sticker: dynamicSticker })` | ✅ Awaited* | Sequential after #4/#5; btn shows "Playing Feedback..."; streaming may resolve early |
| 7a | Victory SFX (3★) | endGame() | Static + Sticker | `await sound.play('victory_sound_effect', { sticker: { image: VICTORY_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } })` | ✅ Awaited | Blocks until SFX ends |
| 7b | Victory voice (3★) | endGame() after #7a | Static | `await sound.play('victory')` | ✅ Awaited | Sequential after #7a |
| 8a | Complete SFX (2★) | endGame() | Static + Sticker | `await sound.play('game_complete_sound_effect', { sticker: { image: GAME_COMPLETE_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } })` | ✅ Awaited | Blocks until SFX ends |
| 8b | Complete voice (2★) | endGame() after #8a | Static | `await sound.play('game_complete_2_star')` | ✅ Awaited | Sequential after #8a |
| 9a | Complete SFX (1★) | endGame() | Static + Sticker | `await sound.play('game_complete_sound_effect', { sticker: { image: GAME_COMPLETE_STICKER_URL, duration: 3, type: 'IMAGE_GIF' } })` | ✅ Awaited | Blocks until SFX ends |
| 9b | Complete voice (1★) | endGame() after #9a | Static | `await sound.play('game_complete_1_star')` | ✅ Awaited | Sequential after #9a |

**Notes:**
- Rows 4/5 and 6 are within the same handler — SFX fires immediately (fire-and-forget), then TTS is awaited. Brief SFX overlap with TTS start is intentional (short sound effect under voice).
- Rows 7a/7b, 8a/8b, 9a/9b are sequential awaits — SFX plays to completion, then voice starts. Only one path executes based on star count.
- All transition screen VOs (#2, #3) are stopped by `FeedbackManager._stopCurrentDynamic()` when the user taps the button — no audio bleed.
- PostMessage `game_complete` is sent BEFORE end-game audio (#7-9) so parent is not blocked.

---

## 12. Review Findings

### Production Patterns Applied

- **No `let`/`const`** — all variables use `var` (ES5 compat for iframe environment)
- **No optional chaining (`?.`)** — all null checks use explicit `&&` guards
- **No `.includes()`** — uses `.indexOf() !== -1` for ES5 compat
- **No `<template>` tags** — game HTML injected via string concatenation in JS
- **No `#results-screen` div** — results shown via TransitionScreen `content` slot
- **No `syncDOMState()`** — removed; state-driven DOM is unnecessary with direct DOM manipulation
- **Answer sanitization** — escape `\`, `"`, `\n` in user input before injecting into LLM prompts
- **SentryConfig + 3 SDK scripts** — not single `bundle.min.js`
- **ScreenLayout v2 `sections` API** — not deprecated `slots` API
- **`MathAIHelpers.SubjectiveEvaluation.evaluate()`** — not standalone `subjectiveEvaluation()`
- **`canPlayAudio()` polling** — `setInterval(200ms)` + `setTimeout(15000ms)` before first audio
- **`voGameStartPlayed` flag** — welcome VO plays only once, even across restarts
- **`visibilityTrackerConfig` saved** — reused in `restartGame()` to recreate VisibilityTracker
- **`createProgressBar()` helper** — destroy-before-create pattern
- **`persist: true`** on ALL transition screens
- **`transitionScreen.hide()`** — explicit call in every button action (does NOT auto-hide)
- **`FeedbackManager._stopCurrentDynamic()`** — called in every transition button action for full cleanup
- **`gameState.gameEnded` guard** — prevents cleanup race condition in `endGame()`
- **`recordViewEvent()` before `seal()`** — seal freezes collector
- **`postMessage` before audio** in endGame — so parent isn't blocked
- **EventCapture guarded init** — `try { if (typeof EventCapture !== 'undefined') EventCapture.init(); } catch(e) {}`

### Informational Notes

- **Info — First fully-subjective evaluation game:** Uses `MathAIHelpers.SubjectiveEvaluation.evaluate()` as the **sole and primary** evaluation mechanism. No deterministic check — the LLM determines correctness, partial-correctness, and provides feedback.

- **Info — Three-tier evaluation:** The LLM returns one of three tiers (`correct_match`, `partial_match`, `no_match`) instead of a binary correct/incorrect. This allows nuanced scoring (3/1/0 points) that rewards students who are close but not perfect.

- **Info — Subjective Evaluation API:** Uses `MathAIHelpers.SubjectiveEvaluation.evaluate()` from the helpers package. The API controls BOTH evaluation (clean verdict) AND feedback (personalized response generated via `feedback_prompt` with `{{evaluation}}` substitution). The TTS audio plays the API's feedback text, falling back to `revealExplanation` only if the API response has no feedback.

- **Info — No deterministic fallback:** If the API fails, the game gracefully awards 0 points and shows the example word problem + hint as a learning fallback. The kid is never stuck.

- **Info — No lives:** This game uses no lives (totalLives: 0, reported as 1 per PART-011 convention). The ProgressBar shows round progress only.

- **Info — Evaluation loading state:** Submit button disabled with "Evaluating..." text during LLM call. Repurposed to "Next Round" / "See Results" after evaluation. Re-enabled on both success and error.

- **Warning — LLM latency:** The `validateWordProblemLLM` call may take 2-10 seconds. The 30-second timeout covers worst-case scenarios. Graceful fallback on failure.

- **Warning — LLM evaluation reliability:** Prompt engineering is critical. The evaluation_prompt includes profanity/abuse guard (always `no_match`), "idk" guard, and generous acceptance of creative answers. Tier normalization uses `indexOf` matching and strips non-alpha characters for robustness.

- **Info — SFX overlap with TTS is intentional:** SFX fire-and-forget followed immediately by `playDynamicFeedback` creates brief overlap. This is the accepted pattern — short SFX under start of TTS voice.

- **Info — Content generation safety:** Division expressions MUST result in whole numbers. The `result` field must exactly match the evaluated expression.

- **Info — SignalCollector v3 compliance:** Uses `recordViewEvent()` for content_render, screen_transition, and feedback_display. Uses `recordCustomEvent()` for round_solved and visibility events. Calls `startFlushing()` after game_init, `seal()` in endGame.

- **Info — Stage 3 parentheses:** Stage 3 expressions use explicit parentheses in `expressionDisplay` to remove order-of-operations ambiguity for Grade 4 students.

### Open Review Findings (from spec review)

1. **⚠️ Warning · Completeness — Unused preloaded audio:** `game_over_sound_effect` and `game_over` were removed from preload list since the game has no game-over state (all players complete all 10 rounds). ✅ Fixed in production HTML.

2. **⚠️ Warning · Interaction — Reset button allows double submission:** ✅ Fixed. Added `if (gameState.evaluationResult !== null) return` guard in `handleReset()`. Also `#btn-reset` is hidden during feedback phase by `showFeedbackUI()` and re-shown by `setupRound()`.

3. **ℹ️ Info · Interaction — SFX overlap with TTS:** Accepted as intentional pattern.

4. **ℹ️ Info · Completeness — Unhandled promise rejections in transition VOs:** `showRoundTransition()` and `showStageTransition()` call `playDynamicFeedback()` without `.catch()` on the returned promise. Wrapped in try/catch in production HTML.

5. **⚠️ Warning · Promise — Duplicate `game_start` event:** `trackEvent('game_start')` fires in both `restartGame()` and `startGame()`. Should be removed from `restartGame()`.

6. **ℹ️ Info · Completeness — `startTime` not nulled in restart:** Defensive fix: `gameState.startTime = null` added to reset block in production HTML.
