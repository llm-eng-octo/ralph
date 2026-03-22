'use strict';

const db = require('./db');

// ─── Concept Graph ────────────────────────────────────────────────────────────
// Each concept maps to an ordered array of skill nodes in dependency order.
// bloomLevel: 1=Remember, 2=Understand, 3=Apply, 4=Analyze, 5=Evaluate, 6=Create
// templateSpecId: the gameId in warehouse/templates/ (null if not yet available)
const CONCEPT_GRAPH = {
  trigonometry: [
    {
      skillId: 'label-triangle-sides',
      skillName: 'Label right triangle sides (hypotenuse, opposite, adjacent)',
      bloomLevel: 1,
      bloomLabel: 'Remember',
      prerequisiteSkillIds: [],
      suggestedGameIds: ['name-the-sides'],
      templateSpecId: 'name-the-sides',
      curriculumStandard: 'NCERT Class 10 Ch 8 §8.1, CC HSG-SRT.C.6',
      estimatedMinutes: 4,
    },
    {
      skillId: 'identify-ratio',
      skillName: 'Identify which trig ratio to use (sin, cos, or tan)',
      bloomLevel: 2,
      bloomLabel: 'Understand',
      prerequisiteSkillIds: ['label-triangle-sides'],
      suggestedGameIds: ['which-ratio'],
      templateSpecId: 'which-ratio',
      curriculumStandard: 'NCERT Class 10 Ch 8 §8.1, CC HSG-SRT.C.6',
      estimatedMinutes: 4,
    },
    {
      skillId: 'compute-ratio',
      skillName: 'Compute sin, cos, or tan given side lengths',
      bloomLevel: 3,
      bloomLabel: 'Apply',
      prerequisiteSkillIds: ['identify-ratio'],
      suggestedGameIds: ['soh-cah-toa-worked-example'],
      templateSpecId: 'soh-cah-toa-worked-example',
      curriculumStandard: 'NCERT Class 10 Ch 8 §8.1-8.2, CC HSG-SRT.C.7',
      estimatedMinutes: 5,
    },
    {
      skillId: 'find-side',
      skillName: 'Find an unknown side length using a trig ratio',
      bloomLevel: 3,
      bloomLabel: 'Apply',
      prerequisiteSkillIds: ['compute-ratio'],
      suggestedGameIds: ['find-triangle-side'],
      templateSpecId: 'find-triangle-side',
      curriculumStandard: 'NCERT Class 10 Ch 8 §8.2, CC HSG-SRT.C.8',
      estimatedMinutes: 5,
    },
    {
      skillId: 'real-world-application',
      skillName: 'Apply trigonometry to real-world problems (height, distance, slope)',
      bloomLevel: 4,
      bloomLabel: 'Analyze',
      prerequisiteSkillIds: ['find-side'],
      suggestedGameIds: ['real-world-problem'],
      templateSpecId: 'real-world-problem',
      curriculumStandard: 'NCERT Class 10 Ch 9, CC HSG-SRT.C.8',
      estimatedMinutes: 6,
    },
  ],

  multiplication: [
    {
      skillId: 'multiplication-basics',
      skillName: 'Recall multiplication facts (times tables)',
      bloomLevel: 1,
      bloomLabel: 'Remember',
      prerequisiteSkillIds: [],
      suggestedGameIds: ['multiplication-tables'],
      templateSpecId: 'multiplication-tables',
      curriculumStandard: 'CC 3.OA.C.7',
      estimatedMinutes: 5,
    },
    {
      skillId: 'multiplication-word-problems',
      skillName: 'Solve multiplication word problems',
      bloomLevel: 2,
      bloomLabel: 'Understand',
      prerequisiteSkillIds: ['multiplication-basics'],
      suggestedGameIds: ['multiplication-word-problems'],
      templateSpecId: 'multiplication-word-problems',
      curriculumStandard: 'CC 3.OA.D.8',
      estimatedMinutes: 5,
    },
  ],
};

// ─── Aliases ─────────────────────────────────────────────────────────────────
const CONCEPT_ALIASES = {
  trig: 'trigonometry',
  'soh-cah-toa': 'trigonometry',
  sohcahtoa: 'trigonometry',
  'right-triangle-trig': 'trigonometry',
  'right triangle trigonometry': 'trigonometry',
  'times tables': 'multiplication',
  multiply: 'multiplication',
  multiplying: 'multiplication',
};

// ─── Keyword → concept mapping for free-text objective parsing ────────────────
const OBJECTIVE_KEYWORDS = {
  trigonometry: [
    'trig', 'sin', 'cos', 'tan', 'sine', 'cosine', 'tangent',
    'triangle', 'ratio', 'soh', 'cah', 'toa', 'hypotenuse', 'opposite', 'adjacent',
  ],
  multiplication: ['multipl', 'times table', 'product'],
};

// ─── Bloom label map ──────────────────────────────────────────────────────────
const BLOOM_LABELS = {
  1: 'Remember',
  2: 'Understand',
  3: 'Apply',
  4: 'Analyze',
  5: 'Evaluate',
  6: 'Create',
};

// ─── Normalise concept input ──────────────────────────────────────────────────
function normalizeConcept(raw) {
  const lower = raw.toLowerCase().trim();
  return CONCEPT_ALIASES[lower] || lower;
}

// ─── Classify free-text objective to a concept key (V1 keyword fallback) ─────
function classifyObjective(objective) {
  const lower = objective.toLowerCase();
  for (const [concept, keywords] of Object.entries(OBJECTIVE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return concept;
    }
  }
  return null;
}

// ─── parseGoal — classify teacher objective via one LLM call ─────────────────
async function parseGoal(objectiveText) {
  if (!objectiveText || typeof objectiveText !== 'string' || !objectiveText.trim()) {
    throw new Error('parseGoal: objectiveText is required and must be a non-empty string');
  }

  const { callLlm } = require('./llm');
  const model = process.env.TRIAGE_MODEL || process.env.RALPH_TRIAGE_MODEL || 'claude-haiku-4-5';

  const systemPrompt = [
    'You are a curriculum classifier. Given a teacher\'s learning objective, extract:',
    '- topic: canonical math topic key (e.g. "trigonometry", "quadratic-equations", "multiplication")',
    '- gradeLevel: numeric grade level (e.g. 10) — null if not stated',
    '- bloomTarget: highest Bloom level intended (1=Remember, 2=Understand, 3=Apply, 4=Analyze, 5=Evaluate, 6=Create)',
    '- ncertChapter: chapter string if applicable (e.g. "Ch 8 §8.1-8.3") — null if not applicable',
    '- curriculumSystem: "NCERT" or "CC" (Common Core) — default to "NCERT" if unclear',
    '',
    'Return ONLY a JSON object. No explanation, no markdown, no code fences.',
    'Example: {"topic":"trigonometry","gradeLevel":10,"bloomTarget":3,"ncertChapter":"Ch 8 §8.1-8.3","curriculumSystem":"NCERT"}',
  ].join('\n');

  const prompt = `${systemPrompt}\n\nTeacher objective: ${objectiveText.trim()}`;
  const raw = await callLlm('parseGoal', prompt, model, { maxTokens: 256 });

  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`parseGoal: LLM returned non-JSON response: ${raw.slice(0, 200)}`);
  }

  return {
    topic: typeof parsed.topic === 'string' ? parsed.topic.toLowerCase().trim() : null,
    gradeLevel: typeof parsed.gradeLevel === 'number' ? parsed.gradeLevel : null,
    bloomTarget: typeof parsed.bloomTarget === 'number' ? Math.min(6, Math.max(1, parsed.bloomTarget)) : 3,
    ncertChapter: parsed.ncertChapter || null,
    curriculumSystem: parsed.curriculumSystem === 'CC' ? 'CC' : 'NCERT',
  };
}

// ─── getResearchPrompt — returns the agent prompt to gather curriculum evidence ─
function getResearchPrompt(parsedGoal) {
  if (!parsedGoal || typeof parsedGoal !== 'object') {
    throw new Error('getResearchPrompt: parsedGoal must be an object');
  }

  const { topic, gradeLevel, bloomTarget, ncertChapter, curriculumSystem } = parsedGoal;

  const gradeStr = gradeLevel ? `Grade ${gradeLevel}` : 'middle/high school';
  const ncertRef = ncertChapter ? `NCERT ${ncertChapter}` : 'the relevant NCERT chapter';
  const bloomLabel = BLOOM_LABELS[bloomTarget] || 'Apply';

  return [
    `You are a curriculum research agent. Gather evidence for a ${gradeStr} session on: **${topic}**`,
    `Target Bloom level: ${bloomLabel} (L${bloomTarget}). Curriculum: ${curriculumSystem}.`,
    '',
    'REQUIRED: Call ALL of the following tools and report results:',
    '',
    '1. Knowledge Graph MCP — find the standard statement:',
    `   mcp__claude_ai_Learning_Commons_Knowledge_Graph__find_standard_statement`,
    `   Query: the primary CC standard for ${topic} at grade ${gradeLevel || 10}`,
    '',
    '2. Knowledge Graph MCP — find prerequisite progression:',
    `   mcp__claude_ai_Learning_Commons_Knowledge_Graph__find_standards_progression_from_standard`,
    '',
    '3. Exa search — find 2+ misconception research sources:',
    '   mcp__exa__web_search_exa',
    `   Query: "${topic} misconceptions students grade ${gradeLevel || 10} NCERT"`,
    '',
    `4. Exa search — find NCERT chapter reference for ${ncertRef}:`,
    '   mcp__exa__web_search_exa',
    `   Query: "NCERT ${topic} ${ncertRef} problems exercises"`,
    '',
    'Report all results in this JSON structure:',
    '{',
    '  "standardStatement": "string — the CC standard statement verbatim",',
    '  "prerequisites": ["array of prerequisite standard codes"],',
    '  "misconceptions": [{"description":"...","source":"...","url":"...or null"}],',
    '  "ncertRefs": [{"chapter":"...","section":"...","exerciseNotes":"..."}],',
    '  "realWorldContexts": [{"label":"...","description":"..."}]',
    '}',
    '',
    'Minimum 2 external sources required (misconceptions or NCERT refs with URLs).',
  ].join('\n');
}

// ─── buildResearchContext — validates and normalises the agent research output ─
function buildResearchContext(raw) {
  if (!raw || !raw.standardStatement) {
    throw new Error('buildResearchContext: standardStatement is required');
  }
  if (!Array.isArray(raw.misconceptions)) {
    throw new Error('buildResearchContext: misconceptions must be an array');
  }
  for (let i = 0; i < raw.misconceptions.length; i++) {
    if (!raw.misconceptions[i] || typeof raw.misconceptions[i].description !== 'string') {
      throw new Error(`buildResearchContext: misconceptions[${i}] must have a description string`);
    }
  }

  const misconceptions = raw.misconceptions.map((m) => ({
    description: m.description,
    source: m.source || 'unknown',
    url: m.url || null,
  }));

  const ncertRefs = Array.isArray(raw.ncertRefs) ? raw.ncertRefs : [];
  const realWorldContexts = Array.isArray(raw.realWorldContexts) ? raw.realWorldContexts : [];
  const prerequisites = Array.isArray(raw.prerequisites) ? raw.prerequisites : [];

  // Count sources with external URLs
  const urlSources = misconceptions.filter((m) => m.url).length + ncertRefs.filter((r) => r.chapter).length;
  const researchComplete = urlSources >= 2 || misconceptions.length + ncertRefs.length >= 2;

  return {
    standardStatement: raw.standardStatement,
    prerequisites,
    misconceptions,
    ncertRefs,
    realWorldContexts,
    researchComplete,
    sourceCount: urlSources,
  };
}

// ─── planSession — map parsedGoal + researchContext → session plan ────────────
function planSession(parsedGoal, researchContext) {
  if (!parsedGoal || typeof parsedGoal !== 'object') {
    throw new Error('planSession: parsedGoal is required and must be an object');
  }

  const rawTopic = parsedGoal.topic || '';
  const concept = classifyObjective(rawTopic) || normalizeConcept(rawTopic);
  if (!CONCEPT_GRAPH[concept]) {
    return {
      error: 'concept_not_found',
      message: `Unknown concept: "${rawTopic}". Available: ${Object.keys(CONCEPT_GRAPH).join(', ')}`,
      availableConcepts: Object.keys(CONCEPT_GRAPH),
    };
  }

  const bloomTarget = typeof parsedGoal.bloomTarget === 'number' ? parsedGoal.bloomTarget : 6;
  const allSkills = CONCEPT_GRAPH[concept];
  const skills = allSkills.filter((s) => s.bloomLevel <= bloomTarget);

  if (skills.length === 0) {
    return {
      error: 'no_skills_in_range',
      message: `No skills found for concept "${concept}" with bloomTarget <= ${bloomTarget}`,
      games: [],
    };
  }

  const rc = researchContext || {};
  const misconceptions = Array.isArray(rc.misconceptions) ? rc.misconceptions : [];

  const games = skills.map((skill, idx) => ({
    position: idx + 1,
    gameId: skill.suggestedGameIds[0],
    title: skill.skillName,
    bloomLevel: skill.bloomLevel,
    bloomLabel: skill.bloomLabel,
    estimatedMinutes: skill.estimatedMinutes || 5,
    skillTaught: skill.skillName,
    templateSpecId: skill.templateSpecId,
    curriculumStandard: skill.curriculumStandard,
    status: skill.templateSpecId ? 'template_exists' : 'not_available',
    targetedMisconception: misconceptions[idx] || null,
  }));

  const estimatedMinutes = games.reduce((sum, g) => sum + g.estimatedMinutes, 0);
  const bloomLevels = games.map((g) => g.bloomLevel);
  const bloomRange = [Math.min(...bloomLevels), Math.max(...bloomLevels)];

  return {
    sessionTitle: `${concept.charAt(0).toUpperCase() + concept.slice(1)} — Prerequisite-Ordered Session`,
    concept,
    gradeLevel: parsedGoal.gradeLevel || null,
    estimatedMinutes,
    bloomRange,
    games,
    prerequisites: rc.prerequisites || [],
    standardStatement: rc.standardStatement || null,
    researchComplete: rc.researchComplete || false,
  };
}

// ─── Build a session plan (V1 API: { objective, gradeLevel, curriculumHint }) ─
async function buildSessionPlan({ objective, gradeLevel, curriculumHint = 'NCERT' } = {}) {
  if (!objective) throw new Error('objective is required');

  const concept = classifyObjective(objective) || normalizeConcept(objective);
  if (!CONCEPT_GRAPH[concept]) {
    return {
      error: 'concept_not_found',
      message: `Could not map objective to a known concept. Available concepts: ${Object.keys(CONCEPT_GRAPH).join(', ')}`,
      availableConcepts: Object.keys(CONCEPT_GRAPH),
    };
  }

  const skills = CONCEPT_GRAPH[concept];
  const bloomLevels = skills.map((s) => s.bloomLevel);
  const bloomRange = [Math.min(...bloomLevels), Math.max(...bloomLevels)];
  const estimatedMinutes = skills.reduce((sum, s) => sum + (s.estimatedMinutes || 5), 0);
  const planId = `${concept}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const games = skills.map((skill, idx) => ({
    position: idx + 1,
    gameId: skill.suggestedGameIds[0],
    title: skill.skillName,
    bloomLevel: skill.bloomLevel,
    bloomLabel: skill.bloomLabel,
    estimatedMinutes: skill.estimatedMinutes || 5,
    skillTaught: skill.skillName,
    templateSpecId: skill.templateSpecId,
    curriculumStandard: skill.curriculumStandard,
    status: skill.templateSpecId ? 'template_exists' : 'not_available',
  }));

  const plan = {
    planId,
    sessionTitle: `${concept.charAt(0).toUpperCase() + concept.slice(1)} — Prerequisite-Ordered Session`,
    concept,
    gradeLevel: gradeLevel || null,
    curriculumHint,
    estimatedMinutes,
    bloomRange,
    games,
  };

  db.createSession(planId, concept, games, null);

  return plan;
}

module.exports = {
  buildSessionPlan,
  normalizeConcept,
  classifyObjective,
  CONCEPT_GRAPH,
  parseGoal,
  getResearchPrompt,
  buildResearchContext,
  planSession,
};
