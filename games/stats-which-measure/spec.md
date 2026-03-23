# Measure Selector — Game-Specific Template (Assembly Book)

> **Self-contained template.** An LLM reading ONLY this file should produce a working HTML file. No need to re-read the warehouse.

> **CRITICAL — PART-017 is NO (Feedback Integration NOT included).** Do NOT call `FeedbackManager.init()` in this game. Calling it triggers an audio permission popup that causes non-deterministic test failures in Playwright. The game uses `FeedbackManager.sound` and `FeedbackManager.playDynamicFeedback` directly (which do not require init). Omit `FeedbackManager.init()` entirely.

> **CRITICAL — window.gameState MUST be set.** `window.gameState = gameState` must appear at the bottom of the gameState declaration block (module scope, NOT inside DOMContentLoaded). The test harness reads `window.gameState` to sync `data-phase` / `data-lives` / `data-score`. If omitted, `waitForPhase()` will always timeout.

> **CRITICAL — window.endGame, window.restartGame, window.nextRound MUST be set.** These must be assigned in DOMContentLoaded after the functions are defined: `window.endGame = endGame; window.restartGame = restartGame; window.nextRound = nextRound`. Tests call these directly.

> **CRITICAL — TimerComponent destroy/recreate on restart.** `restartGame()` MUST call `timer.destroy()` then `timer = new TimerComponent(...)` before calling `startGame()`. Reusing the old timer after destroy causes a no-op and the timer never starts.

> **CRITICAL — gameId MUST be the FIRST field in the gameState object literal.** The pipeline validator checks that `gameState.gameId` is set and matches the game directory name. Any other field before gameId causes the contract check to fail.

> **PEDAGOGICAL DESIGN NOTE.** This game implements Bloom's Level 4 (Analyze) for the skill `stats-which-measure`: given a real-world data scenario, the learner must analyze the data's characteristics and choose the most appropriate measure of central tendency — Mean, Median, or Mode. This is NOT a computation game. No numbers are calculated. The learner must reason about data type (categorical vs numerical) and distribution shape (symmetric vs skewed/outlier-containing) to select the correct tool. On the first incorrect attempt, a worked-example panel expands inline explaining WHY the chosen measure is wrong for this scenario and what the correct choice is — with the SAME "Worked Example on Wrong" pattern proven by which-ratio (#561). On the second incorrect attempt, a life is deducted and the round advances. 9 rounds, 3 lives. Timer: 30 seconds per round (this is a reasoning task, not a computation task — 30s is sufficient for analysis without computation). Session position: Game 5 of 5 in the Statistics session, the L4 Analyze cap. Bloom L4 rationale: learner must decompose the data scenario into its properties (data type, distribution symmetry, outlier presence, open-ended intervals) and map those properties to the correct statistical tool — a multi-step analysis act, not recall or application. Interaction type: `measure-selection-mcq-worked-example`.
>
> **RESEARCH SOURCES (Exa, 2026-03-23):**
> - Source A: NCERT Class 11 Statistics (Class 9-10 prerequisites) Chapter 5 "Measures of Central Tendency" — https://ncert.nic.in/textbook/pdf/kest105.pdf. NCERT explicitly states: "The median is the preferred measure when the data has extreme values or outliers, as it remains unaffected by them (unlike the mean)." NCERT provides the canonical Indian curriculum guidance that mean = arithmetic average, median = positional middle, mode = most frequent, and each has a specific appropriate context. The NCERT farmer example (land ownership in Balapur) demonstrates all three measures for the same dataset, illustrating that "above average in ordinary sense" (mean), "above what half the farmers own" (median), and "above what most farmers own" (mode) answer different questions.
> - Source B: Australian Bureau of Statistics "Measures of Central Tendency" — https://www.abs.gov.au/statistics/understanding-statistics/statistical-terms-and-concepts/measures-central-tendency. Definitive statement: "The median is less affected by outliers and skewed data than the mean and is usually the preferred measure of central tendency when the distribution is not symmetrical." Also: "When a distribution is symmetrical, the mode, median and mean are all in the middle of the distribution" — reinforcing that symmetric data (no outliers) is the canonical case where mean is appropriate.
> - Source C: Laerd Statistics "Mean, Mode and Median — Measures of Central Tendency" — https://statistics.laerd.com/statistical-guides/measures-central-tendency-mean-mode-median.php. Summary table: Nominal data → Mode; Ordinal data → Median; Interval/Ratio (not skewed) → Mean. "The mode can provide valuable insights, especially in categorical data where mean and median may not apply." This directly grounds the game's categorical-data → Mode rounds.
> - Source D: Penn State STAT 200 "Skewness & Central Tendency" — https://online.stat.psu.edu/stat200/lesson/2/2.2/2.2.4/2.2.4.1. "The preferred measure of central tendency often depends on the shape of the distribution. For distributions that have outliers or are skewed, the median is often the preferred measure of central tendency because the median is more resistant to outliers than the mean." Grounds the skewed/outlier → Median rounds. Also: "In a symmetrical distribution, the mean, median, and mode are all equal. In these cases, the mean is often the preferred measure of central tendency."
> - Source E: Pubadmin Institute "How to Choose the Right Measure of Central Tendency for Your Data" — https://pubadmin.institute/research-methodologies/choose-right-measure-central-tendency. Real estate price example: "property prices often have a skewed distribution with a few extremely high-priced properties. In such cases, the median price provides a more accurate representation." Income salary example: "billionaires included in the dataset would pull the mean far above what typical earners earn — median is the right measure." Both scenarios appear in the game's rounds (house prices → Median, salaries with CEO → Median).

---

## 1. Game Identity

| Field | Value |
|---|---|
| **Title** | Measure Selector |
| **Game ID** | `stats-which-measure` |
| **Type** | standard |
| **Session** | Statistics Session 2 — Game 5 of 5 |
| **Bloom Level** | L4 Analyze |
| **Description** | Students analyze a data scenario and choose the most appropriate measure of central tendency (Mean / Median / Mode). 9 rounds, 3 lives, 30-second timer per round. On the first wrong answer: a worked-example panel expands explaining WHY that measure is wrong and what to use instead (no life deducted). On the second wrong answer OR timeout: life deducted, round advances. Stars based on first-attempt accuracy. Session predecessor: stats-mode (L3 — compute mode). Session cap: this is the L4 analysis game that concludes the 5-game statistics session. Targets NCERT Class 10 Ch 14 §14.4 (Relationship between Mean, Median and Mode — understanding which measure fits which context). |

---

## 2. Parts Selected

| Part ID  | Name                          | Included        | Config/Notes                                                                                                                     |
| -------- | ----------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PART-001 | HTML Shell                    | YES             | —                                                                                                                                |
| PART-002 | Package Scripts               | YES             | —                                                                                                                                |
| PART-003 | waitForPackages               | YES             | required = ['ScreenLayout', 'TransitionScreenComponent', 'ProgressBarComponent', 'TimerComponent', 'FeedbackManager']. **maxWait = 180000** (NOT 10000) |
| PART-004 | Initialization Block          | YES             | —                                                                                                                                |
| PART-005 | VisibilityTracker             | YES             | popupProps: default                                                                                                               |
| PART-006 | TimerComponent                | YES             | 30s countdown per round; loses a life on timeout. Destroyed and recreated on restartGame().                                      |
| PART-007 | Game State Object             | YES             | Custom fields: attemptsThisRound, firstAttemptCorrect, totalFirstAttemptCorrect, isProcessing, gameEnded, workedExampleShown     |
| PART-008 | PostMessage Protocol          | YES             | game_complete on BOTH victory and game_over paths                                                                                |
| PART-009 | Attempt Tracking              | YES             | —                                                                                                                                |
| PART-010 | Event Tracking                | YES             | Events: measure_correct_first, measure_correct_second, measure_wrong_second, worked_example_shown, timeout, round_complete       |
| PART-011 | End Game & Metrics            | YES             | Star logic: ≥8/9 first-attempt correct = 3★; ≥6/9 = 2★; ≥3/9 = 1★; <3 = 0★. Game-over on 0 lives.                           |
| PART-012 | Debug Functions               | YES             | —                                                                                                                                |
| PART-013 | Validation Fixed              | YES             | String equality: selectedMeasure === round.correctMeasure                                                                        |
| PART-014 | Validation Function           | NO              | —                                                                                                                                |
| PART-015 | Validation LLM                | NO              | —                                                                                                                                |
| PART-016 | StoriesComponent              | NO              | —                                                                                                                                |
| PART-017 | Feedback Integration          | NO              | Not included — FeedbackManager.init() triggers audio permission popup. Use .sound() and .playDynamicFeedback() only.             |
| PART-018 | Case Converter                | NO              | —                                                                                                                                |
| PART-019 | Results Screen UI             | YES             | Metrics: first-attempt correct, accuracy %, stars earned, worked-examples triggered                                              |
| PART-020 | CSS Variables & Colors        | YES             | —                                                                                                                                |
| PART-021 | Screen Layout CSS             | YES             | —                                                                                                                                |
| PART-022 | Game Buttons                  | YES             | —                                                                                                                                |
| PART-023 | ProgressBar Component         | YES             | `new ProgressBarComponent({ slotId: 'mathai-progress-slot', totalRounds: 9, totalLives: 3 })`                                   |
| PART-024 | TransitionScreen Component    | YES             | Screens: start, victory, game_over. OBJECT FORM ONLY — never string mode.                                                        |
| PART-025 | ScreenLayout Component        | YES             | slots: progressBar=true, transitionScreen=true                                                                                   |
| PART-026 | Anti-Patterns                 | YES (REFERENCE) | Verification checklist in Section 15                                                                                             |
| PART-027 | Play Area Construction        | YES             | Layout: scenario card (styled text box describing the data context) + question text + 3 MCQ option buttons (Mean / Median / Mode) + worked-example panel (hidden by default, expands below buttons on first wrong attempt) |
| PART-028 | InputSchema Patterns          | YES             | Schema type: rounds with scenario, question, correctMeasure, options (3), workedExampleHtml, feedbackCorrect, feedbackSkip, misconceptionTag, difficulty |
| PART-029 | Story-Only Game               | NO              | —                                                                                                                                |
| PART-030 | Sentry Error Tracking         | YES             | —                                                                                                                                |
| PART-031 | API Helper                    | NO              | —                                                                                                                                |
| PART-032 | AnalyticsManager              | NO              | —                                                                                                                                |
| PART-033 | Interaction Patterns          | NO              | —                                                                                                                                |
| PART-034 | Variable Schema Serialization | YES (POST_GEN)  | Serializes Section 4 to inputSchema.json                                                                                         |
| PART-035 | Test Plan Generation          | YES (POST_GEN)  | Generates tests.md after HTML                                                                                                    |
| PART-037 | Playwright Testing            | YES (POST_GEN)  | Ralph loop generates tests + fix cycle                                                                                           |

---

## 3. Game State

```javascript
const gameState = {
  // MANDATORY FIRST FIELD — gameId must be the FIRST key in this object literal:
  gameId: 'stats-which-measure',
  phase: 'start',                // 'start' | 'playing' | 'results' | 'game_over'
  // MANDATORY (from PART-007):
  currentRound: 0,
  totalRounds: 9,
  lives: 3,
  score: 0,
  attempts: [],
  events: [],
  startTime: null,
  isActive: false,
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
  attemptsThisRound: 0,         // 0, 1, or 2 — resets to 0 on each new round
  firstAttemptCorrect: false,   // true if this round was answered correctly on the first attempt
  totalFirstAttemptCorrect: 0,  // count of rounds answered correctly on first attempt (for stars)
  workedExampleShown: false,    // true after first wrong attempt in this round (example panel open)
  isProcessing: false,          // guard against double-submit during feedback delay
  gameEnded: false              // prevent post-endGame state mutations
};

window.gameState = gameState;   // MANDATORY: test harness reads window.gameState

let visibilityTracker = null;
let progressBar = null;
let transitionScreen = null;
let timer = null;
```

**Lives system:** 3 lives. A life is deducted on SECOND wrong attempt OR TIMEOUT. The FIRST wrong attempt shows the worked-example panel — no life deducted. When `gameState.lives` reaches 0, `endGame(false)` is called immediately (game_over). Victory requires completing all 9 rounds with at least 1 life remaining.

**Phase values (MANDATORY — syncDOMState maps these to data-phase):**
- `'start'` — start screen visible, game not begun
- `'playing'` — active round in progress
- `'results'` — victory screen, all 9 rounds completed
- `'game_over'` — lives exhausted before round 9

---

## 4. Input Schema (External Variables)

```json
{
  "type": "object",
  "properties": {
    "rounds": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "scenario": {
            "type": "string",
            "description": "2–4 sentences describing a real-world data context. Must include enough detail for the learner to determine: (a) whether data is categorical or numerical, (b) whether it is symmetric or skewed/contains outliers. No numbers to compute — only the context matters. Max 60 words."
          },
          "question": {
            "type": "string",
            "description": "The question shown above the buttons. Always: 'Which measure of central tendency is most appropriate for this data?' or a close variant. Max 20 words."
          },
          "correctMeasure": {
            "type": "string",
            "enum": ["Mean", "Median", "Mode"],
            "description": "The correct measure for this scenario. Must match one of the 3 button labels exactly (capital first letter)."
          },
          "options": {
            "type": "array",
            "items": { "type": "string", "enum": ["Mean", "Median", "Mode"] },
            "minItems": 3,
            "maxItems": 3,
            "description": "Always exactly ['Mean', 'Median', 'Mode'] in this fixed order. All 3 options present every round. The learner chooses the appropriate one."
          },
          "workedExampleHtml": {
            "type": "string",
            "description": "HTML string (no <script> tags) shown in the worked-example panel after the first wrong attempt. Must: (1) name the data characteristic that determines the correct measure, (2) explain why the learner's chosen measure is wrong for this scenario, (3) show the correct measure and why it fits. 3–5 short sentences. Use <strong> for key terms. Max 80 words. Example: '<p>This data is <strong>skewed</strong> — the CEO salary is an extreme outlier. The <strong>mean</strong> would be pulled upward by that one extreme value, giving a misleadingly high \"average.\" The <strong>median</strong> is resistant to outliers and shows what a typical employee earns. Use <strong>Median</strong> when extreme values are present.</p>'"
          },
          "feedbackCorrect": {
            "type": "string",
            "description": "One sentence shown briefly on correct answer. Names the key characteristic and confirms the choice. Example: 'Correct! Symmetric data with no outliers — mean gives the most complete summary.' Max 20 words."
          },
          "feedbackSkip": {
            "type": "string",
            "description": "One sentence shown when the round is skipped after second wrong attempt. Names the correct answer. Example: 'The correct answer is Median — salary data has extreme outliers.' Max 20 words."
          },
          "misconceptionTag": {
            "type": "string",
            "enum": ["MC-always-use-mean", "MC-outlier-ignore", "MC-categorical-mean", "MC-mode-for-ordered", "MC-symmetric-median"],
            "description": "The primary misconception this round targets. MC-always-use-mean: learner defaults to mean regardless of context. MC-outlier-ignore: learner fails to notice extreme values that distort the mean. MC-categorical-mean: learner tries to average categorical/nominal data. MC-mode-for-ordered: learner picks mode for ordered numerical data when mean/median is appropriate. MC-symmetric-median: learner picks median even for symmetric data with no outliers."
          },
          "difficulty": {
            "type": "string",
            "enum": ["easy", "medium", "hard"],
            "description": "easy = rounds 1–3, medium = rounds 4–6, hard = rounds 7–9."
          }
        },
        "required": ["scenario", "question", "correctMeasure", "options", "workedExampleHtml", "feedbackCorrect", "feedbackSkip", "misconceptionTag", "difficulty"]
      },
      "minItems": 9,
      "maxItems": 9,
      "description": "Exactly 9 rounds. Rounds 1–3: easy. Rounds 4–6: medium. Rounds 7–9: hard. Distribution: 3 rounds where Mean is correct, 3 rounds where Median is correct, 3 rounds where Mode is correct."
    }
  },
  "required": ["rounds"]
}
```

### Fallback Test Content (9 rounds)

Field names in each round MUST match the schema: `scenario` (string), `question` (string), `correctMeasure` (string), `options` (array of 3 strings), `workedExampleHtml` (string), `feedbackCorrect` (string), `feedbackSkip` (string), `misconceptionTag` (string), `difficulty` (string).

```javascript
// FIELD NAMES PER SCHEMA: scenario, question, correctMeasure, options (always ['Mean','Median','Mode']),
// workedExampleHtml, feedbackCorrect, feedbackSkip, misconceptionTag, difficulty
const fallbackContent = {
  rounds: [
    // ============================================================
    // ROUND 1 — EASY — symmetric data, no outliers → MEAN
    // Scenario: exam scores for a class of 30 students, roughly bell-shaped
    // Misconception targeted: MC-symmetric-median (learner picks median)
    // NCERT / Source D (Penn State): symmetric data → mean is preferred
    // ============================================================
    {
      scenario: 'A teacher records the marks scored by 30 students in a mathematics test. Most students score near 60 out of 100. Very few score extremely high or extremely low. The distribution is roughly symmetric.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mean',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>This data is <strong>symmetric</strong> with no extreme outliers — scores are spread evenly around the centre. The <strong>median</strong> is also valid here, but the <strong>mean</strong> uses every data value and gives a more complete summary for symmetric distributions. Use <strong>Mean</strong> when data is symmetrically distributed and has no extreme outliers.</p>',
      feedbackCorrect: 'Correct! Symmetric data with no outliers — mean uses all values and gives the best summary.',
      feedbackSkip: 'The correct answer is Mean — symmetric, no outliers means mean is the preferred measure.',
      misconceptionTag: 'MC-symmetric-median',
      difficulty: 'easy'
    },

    // ============================================================
    // ROUND 2 — EASY — categorical data (nominal) → MODE
    // Scenario: most popular shoe size in a shop
    // Misconception targeted: MC-always-use-mean (learner tries to average shoe sizes)
    // Source C (Laerd): Nominal data → Mode
    // ============================================================
    {
      scenario: 'A shoe shop owner records the shoe size purchased by each of 50 customers over a week: sizes range from 5 to 12. She wants to know which size to stock the most.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mode',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>The shop owner wants to know the <strong>most common</strong> size — not an average. Shoe sizes are discrete categories. The <strong>mean</strong> might give a non-existent size like 8.4, which cannot be stocked. The <strong>mode</strong> identifies the single most frequently purchased size — exactly what she needs to make stocking decisions. Use <strong>Mode</strong> for the most common value.</p>',
      feedbackCorrect: 'Correct! The most popular shoe size = the most frequent value = Mode.',
      feedbackSkip: 'The correct answer is Mode — the owner needs the most common size, not an average.',
      misconceptionTag: 'MC-always-use-mean',
      difficulty: 'easy'
    },

    // ============================================================
    // ROUND 3 — EASY — skewed data with outlier → MEDIAN
    // Scenario: monthly salaries in a company (CEO earns 100× others)
    // Misconception targeted: MC-outlier-ignore (learner picks mean, ignoring CEO salary outlier)
    // Source E (Pubadmin): salary example — mean distorted by high earners
    // ============================================================
    {
      scenario: 'A small company has 10 employees. Nine employees earn between ₹25,000 and ₹40,000 per month. The company founder earns ₹8,00,000 per month. The HR manager wants to report the "typical" employee salary.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Median',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>The founder\'s ₹8,00,000 salary is an extreme <strong>outlier</strong>. If we compute the mean, that one value pulls the average far above what any regular employee earns — giving a misleading picture. The <strong>median</strong> (middle value when sorted) is unaffected by extreme values and accurately represents a typical employee\'s pay. Use <strong>Median</strong> when data has outliers or is skewed.</p>',
      feedbackCorrect: 'Correct! One extreme outlier (founder salary) makes median the right choice here.',
      feedbackSkip: 'The correct answer is Median — the founder\'s salary is an extreme outlier that distorts the mean.',
      misconceptionTag: 'MC-outlier-ignore',
      difficulty: 'easy'
    },

    // ============================================================
    // ROUND 4 — MEDIUM — categorical data (nominal blood groups) → MODE
    // Scenario: most common blood group in a school health survey
    // Misconception targeted: MC-always-use-mean (can't average blood groups)
    // Source C (Laerd): Nominal data → Mode; mean is meaningless for nominal data
    // ============================================================
    {
      scenario: 'A school nurse records the blood group of each of 120 students as part of a health survey. Blood groups are A, B, AB, or O. The nurse wants to know which blood group is most common among the students.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mode',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>Blood group is <strong>categorical (nominal) data</strong> — the labels A, B, AB, O have no numerical value. You cannot add or order blood groups, so <strong>mean</strong> and <strong>median</strong> are mathematically meaningless here. The <strong>mode</strong> is the only valid measure: it identifies the most frequently occurring category. Use <strong>Mode</strong> whenever data consists of named categories with no numeric order.</p>',
      feedbackCorrect: 'Correct! Blood groups are nominal categories — only Mode makes sense.',
      feedbackSkip: 'The correct answer is Mode — blood groups are categories, not numbers. Only Mode applies.',
      misconceptionTag: 'MC-categorical-mean',
      difficulty: 'medium'
    },

    // ============================================================
    // ROUND 5 — MEDIUM — symmetric, no outliers → MEAN
    // Scenario: heights of students in a physical education class
    // Misconception targeted: MC-symmetric-median (learner defaults to median)
    // Source B (ABS): symmetric distribution → mean = median = mode, but mean preferred
    // ============================================================
    {
      scenario: 'A physical education teacher measures the height of 40 students in Class 10. The heights range from 150 cm to 175 cm. Most students are clustered near 162 cm. The distribution is roughly bell-shaped with no unusually tall or short students.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mean',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>Heights follow a roughly <strong>symmetric, bell-shaped distribution</strong> — no extreme outliers are present. When data is symmetric, the mean, median and mode are close to each other. The <strong>mean</strong> is preferred because it uses every measurement, making it the most informative summary. Reserve the <strong>median</strong> for when outliers or skewness distort the mean.</p>',
      feedbackCorrect: 'Correct! Bell-shaped, no outliers — mean is the most informative summary here.',
      feedbackSkip: 'The correct answer is Mean — symmetric data with no outliers; mean uses all values efficiently.',
      misconceptionTag: 'MC-symmetric-median',
      difficulty: 'medium'
    },

    // ============================================================
    // ROUND 6 — MEDIUM — house prices (right-skewed, few luxury properties) → MEDIAN
    // Scenario: property prices in a city (a few luxury flats skew the data)
    // Misconception targeted: MC-outlier-ignore
    // Source E (Pubadmin): real estate prices — median provides accurate typical value
    // ============================================================
    {
      scenario: 'A real estate website lists the prices of 200 flats sold in a city last month. Most flats sell between ₹30 lakh and ₹80 lakh. Five luxury penthouses sell for ₹5 crore each. A buyer wants to know the typical flat price.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Median',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>Five ₹5-crore penthouses are extreme <strong>outliers</strong> in this dataset. They pull the <strong>mean</strong> price upward, making it far higher than what a typical buyer would pay. The <strong>median</strong> — the middle price when all flats are ranked — is unaffected by those five extreme values and accurately reflects the typical flat price. Use <strong>Median</strong> when a few extreme values skew the data.</p>',
      feedbackCorrect: 'Correct! A few luxury penthouses are extreme outliers — median gives the typical price.',
      feedbackSkip: 'The correct answer is Median — luxury penthouses are outliers that distort the mean price.',
      misconceptionTag: 'MC-outlier-ignore',
      difficulty: 'medium'
    },

    // ============================================================
    // ROUND 7 — HARD — favourite subject survey (nominal) → MODE
    // Scenario: most popular subject in a school survey
    // Misconception targeted: MC-mode-for-ordered (learner confuses with ordered categories)
    // Source C (Laerd): Nominal → Mode. "Favourite subject" has no numeric ordering.
    // ============================================================
    {
      scenario: 'A school conducts a survey asking 500 students to name their favourite subject from: Mathematics, Science, English, Social Studies, or Hindi. The school wants to decide which subject to feature in the annual exhibition.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mode',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>Favourite subject is <strong>nominal categorical data</strong> — the subjects have no natural numeric order or value. There is no meaningful "middle subject" (median) and no way to calculate an "average subject" (mean). The <strong>mode</strong> identifies the subject chosen most frequently. For any survey asking "which category do you prefer?", <strong>Mode</strong> is the only valid measure of central tendency.</p>',
      feedbackCorrect: 'Correct! "Favourite subject" is a named category — Mode identifies the most popular choice.',
      feedbackSkip: 'The correct answer is Mode — subject names are categories with no numeric value; only Mode applies.',
      misconceptionTag: 'MC-categorical-mean',
      difficulty: 'hard'
    },

    // ============================================================
    // ROUND 8 — HARD — grouped data with open-ended class interval → MEDIAN
    // Scenario: income distribution where the top class is "₹1 lakh and above" (open-ended)
    // Misconception targeted: MC-always-use-mean (can't compute exact mean without upper boundary)
    // NCERT Class 10 Ch 14 §14.2: if a class interval is open-ended, mean cannot be exactly computed;
    // median is preferred. Source A (NCERT): open-ended intervals → median.
    // ============================================================
    {
      scenario: 'A government survey records the monthly income of 1,000 households. The frequency table has class intervals: ₹0–10,000; ₹10,001–20,000; ₹20,001–30,000; ₹30,001–50,000; and "₹50,001 and above". The last class has no upper boundary.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Median',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>The last class interval "₹50,001 and above" is <strong>open-ended</strong> — we do not know the upper boundary. To compute the <strong>mean</strong> we need class marks (midpoints), but the open-ended class has no midpoint. The <strong>median</strong> only requires cumulative frequencies and the median class boundaries, which are known. Use <strong>Median</strong> when the frequency distribution has an open-ended class interval.</p>',
      feedbackCorrect: 'Correct! Open-ended class interval — exact mean cannot be computed; median is the right choice.',
      feedbackSkip: 'The correct answer is Median — the open-ended class interval makes computing an exact mean impossible.',
      misconceptionTag: 'MC-always-use-mean',
      difficulty: 'hard'
    },

    // ============================================================
    // ROUND 9 — HARD — daily temperature over a month (symmetric, scientific context) → MEAN
    // Scenario: weather data, symmetric seasonal pattern, no outliers
    // Misconception targeted: MC-always-use-mean is the CORRECT choice here — tests whether
    // learner now correctly identifies mean (after being corrected toward median earlier)
    // and doesn't over-generalise "always use median" (MC-symmetric-median reversal)
    // Source D (Penn State): symmetric data → mean is preferred; outliers absent → mean valid
    // ============================================================
    {
      scenario: 'A meteorologist records the daily maximum temperature in a city for 30 days in October. Temperatures range from 22°C to 32°C. Most days cluster near 27°C with no extreme cold or heat spells. The data is roughly symmetric.',
      question: 'Which measure of central tendency is most appropriate for this data?',
      correctMeasure: 'Mean',
      options: ['Mean', 'Median', 'Mode'],
      workedExampleHtml: '<p>Temperature is <strong>continuous numerical data</strong> with a roughly <strong>symmetric distribution</strong> — no extreme outliers are present. The <strong>mean</strong> uses all 30 temperature readings and gives the most precise summary. The <strong>median</strong> is reserved for skewed data or when outliers distort the mean. Here, no such distortion exists — <strong>Mean</strong> is the correct and most informative choice.</p>',
      feedbackCorrect: 'Correct! Symmetric numerical data, no outliers — mean uses all readings for the best summary.',
      feedbackSkip: 'The correct answer is Mean — symmetric temperature data with no extreme values; mean is preferred.',
      misconceptionTag: 'MC-symmetric-median',
      difficulty: 'hard'
    }
  ]
};
```

---

## 5. HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Measure Selector</title>
  <!-- PART-002: Package Scripts -->
  <script src="https://unpkg.com/@hw-app/cdn-games@latest/dist/bundle.js"></script>
  <style>
    /* CSS defined in Section 10 */
  </style>
</head>
<body>
  <div id="app">
    <!-- ScreenLayout injects: progress bar slot (mathai-progress-slot) + transition screen slot + game area -->

    <!-- Game Area (visible during 'playing' phase) -->
    <div id="game-area" class="screen" style="display:none;">

      <!-- Timer slot -->
      <div id="timer-container"></div>

      <!-- Scenario Card -->
      <div id="scenario-card" class="scenario-card">
        <p id="scenario-text" class="scenario-text" data-testid="scenario-text"></p>
      </div>

      <!-- Question + MCQ Buttons -->
      <div id="question-panel">
        <p id="question-text" class="question-text" data-testid="question-text"></p>

        <!-- 3 MCQ measure buttons: always Mean / Median / Mode -->
        <div id="options-grid" class="options-grid" data-testid="options-grid">
          <!-- Buttons injected here dynamically in loadRound() -->
        </div>
      </div>

      <!-- Worked Example Panel (hidden by default — shown after first wrong attempt) -->
      <div
        id="worked-example-panel"
        class="worked-example-panel hidden"
        data-testid="worked-example-panel"
        aria-live="polite"
        role="region"
        aria-label="Worked example"
      >
        <div class="worked-example-header">Why not that measure?</div>
        <div id="worked-example-content" class="worked-example-content"></div>
        <button id="skip-btn" class="skip-btn" data-testid="skip-btn">Got it — next round</button>
      </div>

      <!-- Answer feedback (aria-live) -->
      <div
        id="answer-feedback"
        class="answer-feedback hidden"
        aria-live="polite"
        role="status"
        data-testid="answer-feedback"
      ></div>

    </div>

    <!-- Results Screen (PART-019) — position:fixed to overlay all content -->
    <div id="results-screen" class="results-screen" style="display:none;" data-testid="results-screen">
      <!-- Populated dynamically by showResultsScreen() -->
    </div>

  </div>
</body>
</html>
```

**Key structural rules:**
- `#app` is the root — `data-phase`, `data-lives`, `data-score`, `data-round` attributes live here.
- `#timer-container` must be in the DOM before `new TimerComponent('timer-container', ...)` is called.
- `#worked-example-panel` is hidden by default (`.hidden` class). It becomes visible after first wrong attempt and is hidden again at the start of each new round.
- `#skip-btn` inside the worked-example panel advances the round on click (deducts a life, same as second wrong answer path).
- `#answer-feedback` MUST have `aria-live="polite"` and `role="status"`.
- `#results-screen` MUST have `position: fixed; z-index: 100` in CSS (see Section 10).

---

## 6. Screen Flow + Phase State Machine

```
                    ┌─────────────────────────────────────┐
                    │         page loads                  │
                    │  gameState.phase = 'start'          │
                    │  syncDOMState()                     │
                    │  transitionScreen.show({...start...}) │
                    └───────────────┬─────────────────────┘
                                    │ [Play button clicked]
                                    ▼
                    ┌─────────────────────────────────────┐
                    │  startGame()                        │
                    │  gameState.phase = 'playing'        │
                    │  syncDOMState()                     │
                    │  transitionScreen.hide()            │
                    │  loadRound(1)                       │
                    └──────┬─────────────────────┬────────┘
                           │                     │
               [Button clicked]            [Timer expires]
                           │                     │
              ┌────────────▼──────────────────────▼────────┐
              │  handleMeasureSelect(measure)               │
              │  OR handleTimeout()                         │
              └──────┬──────────────────────────┬───────────┘
                     │                          │
               [CORRECT]                  [WRONG attempt 1]
                     │                          │
              score+10                    show worked-example panel
              totalFirstAttemptCorrect++  attemptsThisRound = 1
              (if first attempt)          (no life deducted)
              advance round                     │
                     │                    [WRONG attempt 2]
                     │                    OR [Skip button]
                     │                    OR [Timeout]
                     │                          │
                     │                    lives--
                     │                    syncDOMState()
                     │                    advance round
                     │                          │
              ┌──────▼──────────────────────────▼──────────┐
              │  nextRound() / advanceGame()               │
              │  if lives===0 → endGame(false)             │
              │  if round===9 completed → endGame(true)    │
              │  else → loadRound(currentRound + 1)        │
              └─────────────────────────────────────────────┘
```

### syncDOMState() — MANDATORY (GEN-PHASE-001)

Every phase change MUST call `syncDOMState()` immediately after setting `gameState.phase`. Defines BEFORE any function that calls it.

```javascript
function syncDOMState() {
  const app = document.getElementById('app');
  if (!app) return;
  app.dataset.phase = gameState.phase;
  app.dataset.lives = gameState.lives;
  app.dataset.score = gameState.score || 0;
  app.dataset.round = gameState.currentRound;
}
```

**Phase transitions (ALL MANDATORY):**
- Page loads → `gameState.phase = 'start'` → `syncDOMState()` (before transitionScreen.show({...start object...}))
- `startGame()` → `gameState.phase = 'playing'` → `syncDOMState()` (before transitionScreen.hide())
- `endGame(true)` → `gameState.phase = 'results'` → `syncDOMState()` (before transitionScreen.show({...victory object...}))
- `endGame(false)` → `gameState.phase = 'game_over'` → `syncDOMState()` (before transitionScreen.show({...game_over object...}))
- Life lost (second wrong, skip, or timeout) → `gameState.lives--` → `syncDOMState()` (before checking game_over condition)

---

## 7. Core Logic

### 7.1 startGame()

```javascript
function startGame() {
  gameState.isActive = true;
  gameState.startTime = Date.now();
  gameState.currentRound = 0;
  gameState.lives = 3;
  gameState.score = 0;
  gameState.attemptsThisRound = 0;
  gameState.firstAttemptCorrect = false;
  gameState.totalFirstAttemptCorrect = 0;
  gameState.workedExampleShown = false;
  gameState.attempts = [];
  gameState.events = [];
  gameState.gameEnded = false;
  gameState.isProcessing = false;
  gameState.phase = 'playing';
  syncDOMState();                   // GEN-PHASE-001 MANDATORY
  transitionScreen.hide();
  document.getElementById('game-area').style.display = 'block';
  progressBar.setLives(3);
  loadRound(1);
}
```

### 7.2 loadRound(roundNumber)

```javascript
function loadRound(roundNumber) {
  const round = gameState.content.rounds[roundNumber - 1];
  gameState.currentRound = roundNumber;
  gameState.attemptsThisRound = 0;
  gameState.firstAttemptCorrect = false;
  gameState.workedExampleShown = false;
  gameState.isProcessing = false;

  // Update scenario text
  document.getElementById('scenario-text').textContent = round.scenario;

  // Update question text
  document.getElementById('question-text').textContent = round.question;

  // Hide worked-example panel (always hidden at round start)
  const panel = document.getElementById('worked-example-panel');
  panel.classList.add('hidden');
  document.getElementById('worked-example-content').innerHTML = '';

  // Render 3 option buttons (always Mean / Median / Mode — from round.options)
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';
  round.options.forEach((measure, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-testid', 'option-' + i);
    btn.setAttribute('data-value', measure);
    btn.textContent = measure;
    btn.addEventListener('click', () => handleMeasureSelect(measure));
    grid.appendChild(btn);
  });

  // Hide answer feedback
  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.textContent = '';
  feedbackEl.classList.add('hidden');

  // Update progress bar
  progressBar.setRound(roundNumber);
  syncDOMState();

  // (Re)start timer
  timer.reset();
  timer.start();
}
```

### 7.3 handleMeasureSelect(selectedMeasure)

```javascript
function handleMeasureSelect(selectedMeasure) {
  // Guard: prevent double-fire and post-endGame clicks
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  // Stop timer
  timer.pause();

  // Disable all buttons
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

  const round = gameState.content.rounds[gameState.currentRound - 1];
  const isCorrect = (selectedMeasure === round.correctMeasure);

  // Track attempt
  gameState.attemptsThisRound++;
  gameState.attempts.push({
    round: gameState.currentRound,
    selected: selectedMeasure,
    correct: round.correctMeasure,
    isCorrect,
    attemptNumber: gameState.attemptsThisRound,
    timestamp: Date.now()
  });

  if (isCorrect) {
    // Correct answer
    if (gameState.attemptsThisRound === 1) {
      gameState.firstAttemptCorrect = true;
      gameState.totalFirstAttemptCorrect++;
    }
    gameState.score += 10;

    // Visual feedback on button
    document.querySelectorAll('.option-btn').forEach(btn => {
      if (btn.getAttribute('data-value') === round.correctMeasure) {
        btn.classList.add('correct');
      }
    });

    // Brief text feedback
    const feedbackEl = document.getElementById('answer-feedback');
    feedbackEl.textContent = round.feedbackCorrect;
    feedbackEl.classList.remove('hidden');

    FeedbackManager.sound('correct');
    FeedbackManager.playDynamicFeedback('correct', gameState.score);

    gameState.events.push({ type: gameState.attemptsThisRound === 1 ? 'measure_correct_first' : 'measure_correct_second', round: gameState.currentRound, timestamp: Date.now() });

    setTimeout(() => {
      feedbackEl.classList.add('hidden');
      feedbackEl.textContent = '';
      gameState.isProcessing = false;
      advanceGame();
    }, 1200);

  } else if (gameState.attemptsThisRound === 1) {
    // FIRST wrong attempt — show worked example panel, NO life deducted
    gameState.workedExampleShown = true;

    // Mark selected button as incorrect, reveal correct
    document.querySelectorAll('.option-btn').forEach(btn => {
      if (btn.getAttribute('data-value') === selectedMeasure) btn.classList.add('incorrect');
      if (btn.getAttribute('data-value') === round.correctMeasure) btn.classList.add('correct');
    });

    // Show worked example
    const panel = document.getElementById('worked-example-panel');
    document.getElementById('worked-example-content').innerHTML = round.workedExampleHtml;
    panel.classList.remove('hidden');

    gameState.events.push({ type: 'worked_example_shown', round: gameState.currentRound, wrongChoice: selectedMeasure, timestamp: Date.now() });

    FeedbackManager.sound('incorrect');

    // Re-enable only the un-selected buttons (allow a second attempt)
    document.querySelectorAll('.option-btn').forEach(btn => {
      if (btn.getAttribute('data-value') !== selectedMeasure) {
        btn.disabled = false;
        btn.classList.remove('correct');  // reset visual state for re-attempt
      }
    });

    gameState.isProcessing = false;

  } else {
    // SECOND wrong attempt — deduct life, advance round
    document.querySelectorAll('.option-btn').forEach(btn => {
      if (btn.getAttribute('data-value') === round.correctMeasure) btn.classList.add('correct');
      if (btn.getAttribute('data-value') === selectedMeasure) btn.classList.add('incorrect');
    });

    gameState.lives--;
    progressBar.loseLife();
    syncDOMState();
    FeedbackManager.sound('incorrect');

    const feedbackEl = document.getElementById('answer-feedback');
    feedbackEl.textContent = round.feedbackSkip;
    feedbackEl.classList.remove('hidden');

    gameState.events.push({ type: 'measure_wrong_second', round: gameState.currentRound, timestamp: Date.now() });

    setTimeout(() => {
      feedbackEl.classList.add('hidden');
      feedbackEl.textContent = '';
      gameState.isProcessing = false;
      advanceGame();
    }, 1500);
  }
}
```

### 7.4 handleSkip() — called by Skip button in worked-example panel

```javascript
function handleSkip() {
  // Guard
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  timer.pause();

  // Disable all buttons and hide panel
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  document.getElementById('worked-example-panel').classList.add('hidden');

  const round = gameState.content.rounds[gameState.currentRound - 1];

  // Deduct life (same as second wrong attempt)
  gameState.lives--;
  progressBar.loseLife();
  syncDOMState();
  FeedbackManager.sound('incorrect');

  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.textContent = round.feedbackSkip;
  feedbackEl.classList.remove('hidden');

  gameState.events.push({ type: 'round_skipped', round: gameState.currentRound, timestamp: Date.now() });
  gameState.attempts.push({
    round: gameState.currentRound,
    selected: 'skip',
    correct: round.correctMeasure,
    isCorrect: false,
    attemptNumber: gameState.attemptsThisRound + 1,
    timestamp: Date.now()
  });

  setTimeout(() => {
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
    gameState.isProcessing = false;
    advanceGame();
  }, 1500);
}
```

**Skip button wired in DOMContentLoaded:**
```javascript
document.getElementById('skip-btn').addEventListener('click', handleSkip);
```

### 7.5 handleTimeout()

```javascript
function handleTimeout() {
  if (gameState.isProcessing || gameState.gameEnded) return;
  gameState.isProcessing = true;

  // Disable all buttons and hide worked example panel
  document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);
  document.getElementById('worked-example-panel').classList.add('hidden');

  const round = gameState.content.rounds[gameState.currentRound - 1];

  // Reveal correct answer
  document.querySelectorAll('.option-btn').forEach(btn => {
    if (btn.getAttribute('data-value') === round.correctMeasure) {
      btn.classList.add('correct');
    }
  });

  // Feedback
  const feedbackEl = document.getElementById('answer-feedback');
  feedbackEl.textContent = 'Time\'s up! ' + round.feedbackSkip;
  feedbackEl.classList.remove('hidden');

  gameState.lives--;
  progressBar.loseLife();
  syncDOMState();
  FeedbackManager.sound('incorrect');

  gameState.attempts.push({
    round: gameState.currentRound,
    selected: null,
    correct: round.correctMeasure,
    isCorrect: false,
    timeout: true,
    timestamp: Date.now()
  });
  gameState.events.push({ type: 'timeout', round: gameState.currentRound, timestamp: Date.now() });

  setTimeout(() => {
    feedbackEl.classList.add('hidden');
    feedbackEl.textContent = '';
    gameState.isProcessing = false;
    advanceGame();
  }, 1500);
}
```

### 7.6 advanceGame()

```javascript
function advanceGame() {
  // Check lives first
  if (gameState.lives <= 0) {
    endGame(false);
    return;
  }

  // Check rounds
  if (gameState.currentRound >= gameState.totalRounds) {
    endGame(true);
    return;
  }

  loadRound(gameState.currentRound + 1);
}
```

### 7.7 nextRound() — exposed on window for test harness

```javascript
function nextRound() {
  advanceGame();
}
window.nextRound = nextRound;
```

### 7.8 restartGame()

```javascript
function restartGame() {
  // MANDATORY: destroy old timer before recreating
  if (timer) {
    timer.destroy();
    timer = null;
  }
  timer = new TimerComponent('timer-container', {
    timerType: 'decrease',
    format: 'sec',
    startTime: 30,
    endTime: 0,
    autoStart: false,
    onEnd: () => handleTimeout()
  });

  startGame();
}
```

**State reset — all fields reset through startGame():** currentRound=0, lives=3, score=0, attemptsThisRound=0, firstAttemptCorrect=false, totalFirstAttemptCorrect=0, workedExampleShown=false, attempts=[], events=[], gameEnded=false, isProcessing=false.

### 7.9 Timer Configuration

```javascript
timer = new TimerComponent('timer-container', {
  timerType: 'decrease',
  format: 'sec',
  startTime: 30,
  endTime: 0,
  autoStart: false,
  onEnd: () => handleTimeout()
});
```

**Timer is created once in DOMContentLoaded, then destroyed + recreated in `restartGame()`.**

---

## 8. Validation

```javascript
function validateAnswer(selected, correct) {
  return String(selected).trim() === String(correct).trim();
}
```

String equality only. `correctMeasure` is always 'Mean', 'Median', or 'Mode'. `selectedMeasure` comes from `data-value` attribute (also one of those three strings). The comparison is exact string equality.

---

## 9. EndGame Metrics

```javascript
function endGame(isVictory) {
  if (gameState.gameEnded) return;
  gameState.gameEnded = true;
  gameState.isActive = false;

  // Stop timer
  timer.pause();

  // Set phase
  gameState.phase = isVictory ? 'results' : 'game_over';
  syncDOMState();   // MANDATORY on BOTH paths

  // Compute stars based on first-attempt correct count
  const firstCorrect = gameState.totalFirstAttemptCorrect;
  let stars = 0;
  if (firstCorrect >= 8) stars = 3;
  else if (firstCorrect >= 6) stars = 2;
  else if (firstCorrect >= 3) stars = 1;
  else stars = 0;

  const accuracy = Math.round((gameState.totalFirstAttemptCorrect / gameState.totalRounds) * 100);

  // PostMessage — game_complete on BOTH victory AND game_over (MANDATORY)
  window.parent.postMessage({
    type: 'game_complete',
    gameId: 'stats-which-measure',
    score: gameState.score,
    stars: stars,
    correctAnswers: gameState.totalFirstAttemptCorrect,
    incorrectAnswers: gameState.totalRounds - gameState.totalFirstAttemptCorrect,
    totalRounds: gameState.totalRounds,
    accuracy: accuracy,
    roundsCompleted: gameState.currentRound,
    livesRemaining: gameState.lives,
    isVictory: isVictory,
    duration: Date.now() - gameState.startTime,
    attempts: gameState.attempts
  }, '*');

  // Show transition screen
  if (isVictory) {
    transitionScreen.show({
      title: 'Well done!',
      subtitle: 'You chose the right measure for every scenario.',
      icons: ['📊'],
      buttons: [{ label: 'Play again', action: 'restart', style: 'primary' }]
    });
  } else {
    transitionScreen.show({
      title: 'Game Over',
      subtitle: 'Keep practising — analysing data gets easier with experience.',
      icons: ['💔'],
      buttons: [{ label: 'Try again', action: 'restart', style: 'primary' }]
    });
  }
}

// MANDATORY window assignments — at the BOTTOM of DOMContentLoaded callback:
window.endGame = endGame;
window.restartGame = restartGame;
window.nextRound = nextRound;
window.gameState = gameState;   // also set at module scope above
// REQUIRED for test harness __ralph.jumpToRound():
window.loadRound = function(n) {
  gameState.currentRound = n - 1;
  gameState.gameEnded = false;
  gameState.isProcessing = false;
  loadRound(n);
};
```

---

## 10. CSS

```css
/* === Base Layout === */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--mathai-background, #f8fafc);
  color: #1e293b;
  min-height: 100vh;
}

#app {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

/* === Game Area === */
#game-area {
  padding-top: 8px;
}

/* === Scenario Card === */
.scenario-card {
  background: #fff;
  border: 2px solid #cbd5e1;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.scenario-text {
  font-size: 0.97rem;
  color: #334155;
  line-height: 1.6;
}

/* === Question Text === */
.question-text {
  font-size: 1.0rem;
  font-weight: 600;
  color: #334155;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.4;
}

/* === MCQ Options Grid (1×3 column) === */
.options-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.option-btn {
  min-height: 52px;
  min-width: 44px;
  width: 100%;
  padding: 12px 16px;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e40af;
  background: #fff;
  border: 2.5px solid #3b82f6;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  outline: none;
  text-align: center;
}

.option-btn:hover:not(:disabled) {
  background: #eff6ff;
  border-color: #2563eb;
}

.option-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.option-btn.correct {
  background: #22c55e;
  border-color: #16a34a;
  color: #fff;
}

.option-btn.incorrect {
  background: #ef4444;
  border-color: #dc2626;
  color: #fff;
}

/* === Worked Example Panel === */
.worked-example-panel {
  background: #fefce8;
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 12px;
}

.worked-example-panel.hidden {
  display: none;
}

.worked-example-header {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #92400e;
  margin-bottom: 8px;
}

.worked-example-content {
  font-size: 0.93rem;
  color: #1e293b;
  line-height: 1.6;
  margin-bottom: 12px;
}

.worked-example-content strong {
  color: #b45309;
}

.skip-btn {
  min-height: 44px;
  padding: 8px 18px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  border: 1.5px solid #f59e0b;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.skip-btn:hover {
  background: #fde68a;
}

/* === Answer Feedback === */
.answer-feedback {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 8px;
  border-left: 4px solid #3b82f6;
  line-height: 1.5;
}

.answer-feedback.hidden {
  display: none;
}

/* === Results Screen — MANDATORY position:fixed z-index:100 === */
#results-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.results-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 12px;
}

.results-stars {
  font-size: 2.5rem;
  margin-bottom: 16px;
  letter-spacing: 0.1em;
}

.results-stat {
  font-size: 1.1rem;
  color: #475569;
  margin-bottom: 8px;
}

.results-stat strong {
  color: #1e293b;
}
```

---

## 11. PostMessage Protocol

### Incoming: `game_init`

```json
{
  "type": "game_init",
  "data": {
    "rounds": [ ... ]
  }
}
```

Handler sets `gameState.content = data`, then shows start TransitionScreen.

### Outgoing: `game_complete` — MANDATORY on BOTH victory AND game-over paths

```javascript
// Sent in endGame(isVictory) — called on BOTH victory and game_over:
window.parent.postMessage({
  type: 'game_complete',
  gameId: 'stats-which-measure',
  score: gameState.score,
  stars: stars,                        // 0–3
  correctAnswers: gameState.totalFirstAttemptCorrect,
  incorrectAnswers: gameState.totalRounds - gameState.totalFirstAttemptCorrect,
  totalRounds: gameState.totalRounds,
  accuracy: accuracy,                  // 0–100 integer (first-attempt rate)
  roundsCompleted: gameState.currentRound,
  livesRemaining: gameState.lives,
  isVictory: isVictory,
  duration: Date.now() - gameState.startTime,
  attempts: gameState.attempts
}, '*');
```

**Contract requirement:** The message type MUST be `'game_complete'` (not `'game_end'` or `'GAME_COMPLETE'`). Contract tests assert this exact string on BOTH the victory path AND the game_over path.

---

## 12. ScreenLayout Configuration

```javascript
ScreenLayout.inject('app', {
  slots: {
    progressBar: true,
    transitionScreen: true
  }
});
```

---

## 13. ProgressBar Configuration

```javascript
progressBar = new ProgressBarComponent({
  slotId: 'mathai-progress-slot',
  totalRounds: 9,
  totalLives: 3
});
```

**`slotId: 'mathai-progress-slot'` is MANDATORY.** The CDN injects the progress bar into the DOM slot with this ID. A missing or wrong `slotId` causes the progress bar to never render, and `progressBar.loseLife()` / `progressBar.setRound()` to throw.

---

## 13b. TransitionScreen Configuration (GEN-TRANSITION-API — object form MANDATORY)

**NEVER use `transitionScreen.show('string')` — the CDN has NO string-mode support. Always pass an object.**

```javascript
// Initialization (inside waitForPackages callback):
transitionScreen = new TransitionScreenComponent({
  onRestart: restartGame
});

// Show start screen (after content loaded):
transitionScreen.show({
  title: 'Measure Selector',
  subtitle: 'Choose Mean, Median, or Mode — 9 scenarios, 3 lives, 30 seconds each',
  icons: ['📊'],
  buttons: [{ label: 'Play', action: 'restart', style: 'primary' }]
});

// Show in endGame(true) — victory:
transitionScreen.show({
  title: 'Well done!',
  subtitle: 'You chose the right measure for every scenario.',
  icons: ['📊'],
  buttons: [{ label: 'Play again', action: 'restart', style: 'primary' }]
});

// Show in endGame(false) — game over:
transitionScreen.show({
  title: 'Game Over',
  subtitle: 'Keep practising — analysing data gets easier with experience.',
  icons: ['💔'],
  buttons: [{ label: 'Try again', action: 'restart', style: 'primary' }]
});
```

**`action: 'restart'` triggers `onRestart` (restartGame). Icons must be emoji strings only — never SVG.**

---

## 14. Test Scenarios (15 rows)

| # | Category | Scenario | Steps | Expected |
|---|---|---|---|---|
| TC-001 | game-flow | start-screen | Navigate to game URL. Do not click anything. | `document.getElementById('app').dataset.phase === 'start'` AND start button visible. |
| TC-002 | game-flow | game-start | Click the Play button. | `data-phase === 'playing'` AND `window.gameState.currentRound === 1` AND 3 buttons with `data-testid="option-0/1/2"` visible. |
| TC-003 | game-flow | correct-first-attempt-advances | Start game. Click the button whose `data-value` matches round 1 `correctMeasure`. | `[data-testid="answer-feedback"]` becomes visible with correct feedback. After 1200ms, `window.gameState.currentRound === 2`. `totalFirstAttemptCorrect === 1`. |
| TC-004 | game-flow | wrong-first-attempt-shows-example | Start game. Click a button whose `data-value` does NOT match `correctMeasure`. | `[data-testid="worked-example-panel"]` becomes visible (no `.hidden` class). `window.gameState.lives === 3` (NO life deducted). Buttons re-enabled for second attempt. |
| TC-005 | game-flow | wrong-second-attempt-loses-life | Start game. Answer round 1 wrong twice. | `window.gameState.lives === 2`. `[data-testid="answer-feedback"]` shows feedbackSkip text. |
| TC-006 | game-flow | skip-btn-loses-life | Start game. Answer wrong (panel shows). Click skip button. | `window.gameState.lives === 2`. Round advances. |
| TC-007 | game-flow | timeout-loses-life | Start game. Wait 31 seconds without clicking. | `window.gameState.lives === 2`. Correct button gets `.correct` class. `[data-testid="answer-feedback"]` shows "Time's up!" message. |
| TC-008 | game-flow | victory-after-9-rounds | Complete all 9 rounds without losing all lives. | `data-phase === 'results'` AND `game_complete` postMessage sent with `isVictory: true`. |
| TC-009 | game-flow | game-over-on-zero-lives | Lose 3 lives before completing all 9 rounds. | `data-phase === 'game_over'` AND `game_complete` postMessage sent with `isVictory: false`. |
| TC-010 | game-flow | restart-resets-state | Reach game-over, click Try again. | `data-phase === 'playing'` AND `window.gameState.currentRound === 1` AND `window.gameState.lives === 3` AND `window.gameState.totalFirstAttemptCorrect === 0`. |
| TC-011 | mechanics | first-attempt-score | Start game. Answer round 1 correctly on first attempt. | `window.gameState.score === 10` AND `window.gameState.totalFirstAttemptCorrect === 1`. |
| TC-012 | mechanics | three-star-threshold | Answer 8 or 9 rounds correctly on first attempt. | `game_complete` message has `stars === 3`. |
| TC-013 | mechanics | zero-star-threshold | Answer 0–2 rounds correctly on first attempt. | `game_complete` message has `stars === 0`. |
| TC-014 | state-sync | data-phase-playing | After clicking Play. | `document.getElementById('app').dataset.phase === 'playing'`. |
| TC-015 | contract | game-complete-both-paths | Trigger both victory (complete 9 rounds) and game-over (lose 3 lives) in separate runs. | Both runs produce `postMessage` with `type === 'game_complete'` (not `'game_end'`). Both include `duration` and `attempts`. |

---

## 15. Anti-Pattern Checklist (PART-026)

The LLM generating this game MUST verify each item before finalising the HTML:

1. **Do NOT call `FeedbackManager.init()`** — audio permission popup breaks Playwright tests. Use `.sound()` and `.playDynamicFeedback()` only.
2. **Do NOT assign `window.gameState` inside DOMContentLoaded** — it must be at module scope, immediately after the `gameState` object declaration.
3. **Do NOT forget `window.endGame = endGame; window.restartGame = restartGame; window.nextRound = nextRound`** — assign at the bottom of DOMContentLoaded. Also add `window.loadRound = function(n) { ... }` for test harness `__ralph.jumpToRound()`.
4. **Do NOT deduct a life on the FIRST wrong attempt** — the first wrong answer shows the worked-example panel only. Life is deducted only on the SECOND wrong attempt, Skip button click, or timeout.
5. **Do NOT keep all buttons disabled after first wrong attempt** — re-enable the two un-selected buttons so the learner can make a second attempt. Only the already-selected (wrong) button stays disabled.
6. **Do NOT hide the worked-example panel without re-enabling buttons** — if panel is shown and learner makes a correct second attempt, the panel should collapse (add `.hidden`) and the round should advance.
7. **Do NOT hardcode option button text in HTML** — all 3 buttons MUST be generated dynamically in `loadRound()` from `round.options[]`.
8. **Do NOT forget `data-testid="option-N"` (positional) AND `data-value="<measure>"` on every button** — tests use both selectors.
9. **Do NOT forget `data-testid="answer-feedback"` on the feedback div** — and `aria-live="polite"` and `role="status"`.
10. **Do NOT forget `data-testid="worked-example-panel"` on the panel div** — tests assert its visibility.
11. **Do NOT forget `data-testid="skip-btn"` on the skip button** — tests click it directly.
12. **Do NOT reuse the destroyed timer in restartGame()** — ALWAYS call `timer.destroy()` then `timer = new TimerComponent(...)` before `startGame()`.
13. **Do NOT skip the `isProcessing` guard** — fast taps can fire `handleMeasureSelect` twice. Set `isProcessing = true` at entry. Reset to `false` in the `setTimeout` callback OR after showing worked-example panel (for re-attempt).
14. **Do NOT set `gameState.phase` without immediately calling `syncDOMState()`** — no code between phase assignment and syncDOMState call.
15. **Do NOT send `type: 'game_end'` in the postMessage** — the contract requires `type: 'game_complete'`.
16. **Do NOT forget `#results-screen { position: fixed; z-index: 100 }`** — without this the results screen is invisible to Playwright.
17. **Do NOT reset only some fields in restartGame()** — `startGame()` must reset ALL: lives=3, score=0, currentRound=0, attemptsThisRound=0, firstAttemptCorrect=false, totalFirstAttemptCorrect=0, workedExampleShown=false, attempts=[], events=[], gameEnded=false, isProcessing=false.
18. **Do NOT call `transitionScreen.show('string')` — always pass an object with title/subtitle/icons/buttons.**
19. **Do NOT set `waitForPackages` maxWait to anything less than 180000** — 10000ms is too short for CDN cold-load.
20. **Do NOT forget `progressBar.setRound(roundNumber)` in `loadRound()`** — if omitted, the progress bar never advances.
