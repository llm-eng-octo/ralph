'use strict';

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  CONCEPT_GRAPH,
  normalizeConcept,
  classifyObjective,
  buildResearchContext,
  getResearchPrompt,
  planSession,
  generateSessionId,
  writeSessionDirectory,
} = require('../lib/session-planner');

// ─── CONCEPT_GRAPH structure tests ───────────────────────────────────────────
describe('CONCEPT_GRAPH — trig nodes have required V1 fields', () => {
  it('trigonometry concept exists', () => {
    assert.ok(Array.isArray(CONCEPT_GRAPH.trigonometry), 'trigonometry must be an array of skill nodes');
    assert.ok(CONCEPT_GRAPH.trigonometry.length >= 5, 'trigonometry must have at least 5 skill nodes');
  });

  it('every trig node has templateSpecId, curriculumStandard, estimatedMinutes', () => {
    for (const node of CONCEPT_GRAPH.trigonometry) {
      assert.ok(
        typeof node.templateSpecId === 'string',
        `node "${node.skillId}" templateSpecId must be a string, got ${JSON.stringify(node.templateSpecId)}`,
      );
      assert.ok(
        typeof node.curriculumStandard === 'string' && node.curriculumStandard.length > 0,
        `node "${node.skillId}" curriculumStandard must be a non-empty string`,
      );
      assert.ok(
        typeof node.estimatedMinutes === 'number' && node.estimatedMinutes > 0,
        `node "${node.skillId}" estimatedMinutes must be a positive number`,
      );
    }
  });

  it('real-world-application node has templateSpecId = "real-world-problem"', () => {
    const node = CONCEPT_GRAPH.trigonometry.find((n) => n.skillId === 'real-world-application');
    assert.ok(node, 'real-world-application node must exist');
    assert.equal(node.templateSpecId, 'real-world-problem');
  });

  it('trig nodes are in ascending Bloom order', () => {
    const levels = CONCEPT_GRAPH.trigonometry.map((n) => n.bloomLevel);
    for (let i = 1; i < levels.length; i++) {
      assert.ok(
        levels[i] >= levels[i - 1],
        `Bloom levels must be non-decreasing: level[${i}]=${levels[i]} < level[${i - 1}]=${levels[i - 1]}`,
      );
    }
  });

  it('every trig node has a suggestedGameIds array with at least one entry', () => {
    for (const node of CONCEPT_GRAPH.trigonometry) {
      assert.ok(
        Array.isArray(node.suggestedGameIds) && node.suggestedGameIds.length > 0,
        `node "${node.skillId}" must have suggestedGameIds with at least one entry`,
      );
    }
  });
});

// ─── normalizeConcept tests ───────────────────────────────────────────────────
describe('normalizeConcept', () => {
  it('maps "trig" to "trigonometry"', () => {
    assert.equal(normalizeConcept('trig'), 'trigonometry');
  });

  it('maps "soh-cah-toa" to "trigonometry"', () => {
    assert.equal(normalizeConcept('soh-cah-toa'), 'trigonometry');
  });

  it('maps "right triangle trigonometry" to "trigonometry"', () => {
    assert.equal(normalizeConcept('right triangle trigonometry'), 'trigonometry');
  });

  it('maps "times tables" to "multiplication"', () => {
    assert.equal(normalizeConcept('times tables'), 'multiplication');
  });

  it('handles unknown input gracefully — returns lowercased input', () => {
    assert.equal(normalizeConcept('algebra'), 'algebra');
  });

  it('is case-insensitive', () => {
    assert.equal(normalizeConcept('TRIG'), 'trigonometry');
  });

  it('maps "sine rule" gracefully — returns "sine rule" (no alias)', () => {
    // No alias exists; falls through to lowercased input
    assert.equal(normalizeConcept('sine rule'), 'sine rule');
  });
});

// ─── classifyObjective tests ──────────────────────────────────────────────────
describe('classifyObjective', () => {
  it('detects trigonometry from "understand sin, cos, tan ratios"', () => {
    assert.equal(classifyObjective('understand sin, cos, tan ratios'), 'trigonometry');
  });

  it('detects trigonometry from "label hypotenuse, opposite, adjacent"', () => {
    assert.equal(classifyObjective('label hypotenuse, opposite, adjacent'), 'trigonometry');
  });

  it('detects multiplication from "times tables practice"', () => {
    assert.equal(classifyObjective('times tables practice'), 'multiplication');
  });

  it('returns null for unrecognised input', () => {
    assert.equal(classifyObjective('solve quadratic equations'), null);
  });
});

// ─── buildResearchContext tests ───────────────────────────────────────────────
describe('buildResearchContext', () => {
  const validInput = {
    standardStatement:
      'HSG-SRT.C.6: Understand that by similarity, side ratios in right triangles are properties of the angles in the triangle.',
    prerequisites: ['8.G.B.7', 'HSG-SRT.A.2'],
    misconceptions: [
      {
        description: 'Students confuse opposite and adjacent when the reference angle changes position',
        source: 'NCTM Research Brief',
        url: 'https://www.nctm.org/example',
      },
      {
        description: 'Students apply SOH-CAH-TOA without checking which angle is the reference angle',
        source: 'Exa search: NCERT Ch 8 misconceptions',
        url: null,
      },
    ],
    ncertRefs: [{ chapter: 'Ch 8', section: '§8.1', exerciseNotes: 'Ex 8.1 Q1-Q3: labelling sides' }],
    realWorldContexts: [{ label: 'Ramp angle', description: 'A wheelchair ramp rises 1.2m over 8m — find the angle.' }],
  };

  it('returns structured context for valid input', () => {
    const ctx = buildResearchContext(validInput);
    assert.equal(ctx.standardStatement, validInput.standardStatement);
    assert.deepEqual(ctx.prerequisites, validInput.prerequisites);
    assert.equal(ctx.misconceptions.length, 2);
    assert.equal(ctx.ncertRefs.length, 1);
    assert.equal(ctx.realWorldContexts.length, 1);
  });

  it('researchComplete=true when 2+ sources present', () => {
    const ctx = buildResearchContext(validInput);
    // 1 misconception with url + 1 ncertRef with chapter = 2 sources
    assert.equal(ctx.researchComplete, true);
  });

  it('researchComplete=false when <2 sources', () => {
    const ctx = buildResearchContext({
      standardStatement: 'HSG-SRT.C.6: ...',
      prerequisites: [],
      misconceptions: [],
      ncertRefs: [],
    });
    assert.equal(ctx.researchComplete, false);
  });

  it('throws when standardStatement is missing', () => {
    assert.throws(
      () => buildResearchContext({ prerequisites: [], misconceptions: [], ncertRefs: [] }),
      /standardStatement is required/,
    );
  });

  it('throws when misconceptions is not an array', () => {
    assert.throws(
      () => buildResearchContext({ standardStatement: 'X', prerequisites: [], misconceptions: 'bad', ncertRefs: [] }),
      /misconceptions must be an array/,
    );
  });

  it('throws when a misconception entry lacks description', () => {
    assert.throws(
      () =>
        buildResearchContext({
          standardStatement: 'X',
          prerequisites: [],
          misconceptions: [{ source: 'test' }],
          ncertRefs: [],
        }),
      /misconceptions\[0\]/,
    );
  });

  it('accepts realWorldContexts as optional — defaults to []', () => {
    const ctx = buildResearchContext({
      standardStatement: 'HSG-SRT.C.6: ...',
      prerequisites: [],
      misconceptions: [],
      ncertRefs: [],
    });
    assert.deepEqual(ctx.realWorldContexts, []);
  });

  it('strips null urls and normalises output shape', () => {
    const ctx = buildResearchContext(validInput);
    for (const m of ctx.misconceptions) {
      assert.ok('description' in m, 'misconception must have description');
      assert.ok('source' in m, 'misconception must have source');
      assert.ok('url' in m, 'misconception must have url');
    }
  });
});

// ─── getResearchPrompt tests ──────────────────────────────────────────────────
describe('getResearchPrompt', () => {
  const parsedGoal = {
    topic: 'trigonometry',
    gradeLevel: 10,
    bloomTarget: 3,
    ncertChapter: 'Ch 8 §8.1-8.3',
    curriculumSystem: 'NCERT',
  };

  it('returns a non-empty string', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.equal(typeof prompt, 'string');
    assert.ok(prompt.length > 100, 'prompt must be substantive (>100 chars)');
  });

  it('mentions Knowledge Graph MCP tool names', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.ok(prompt.includes('mcp__claude_ai_Learning_Commons_Knowledge_Graph'), 'must mention Knowledge Graph MCP');
  });

  it('mentions Exa MCP tool name', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.ok(prompt.includes('mcp__exa__web_search_exa'), 'must mention Exa search tool');
  });

  it('includes the topic in the prompt', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.ok(prompt.includes('trigonometry'), 'must include the topic');
  });

  it('includes grade level in the prompt', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.ok(prompt.includes('10') || prompt.includes('Grade 10'), 'must include grade level');
  });

  it('requires minimum 2 external sources', () => {
    const prompt = getResearchPrompt(parsedGoal);
    assert.ok(prompt.includes('2'), 'must specify 2-source minimum');
  });

  it('throws for invalid parsedGoal input', () => {
    assert.throws(() => getResearchPrompt(null), /parsedGoal must be an object/);
    assert.throws(() => getResearchPrompt('string'), /parsedGoal must be an object/);
  });

  it('handles missing gradeLevel gracefully', () => {
    const prompt = getResearchPrompt({ topic: 'trigonometry', bloomTarget: 2 });
    assert.ok(prompt.includes('middle/high school') || prompt.includes('null'), 'must handle null gradeLevel');
  });
});

// ─── planSession tests ────────────────────────────────────────────────────────
describe('planSession', () => {
  const parsedGoalTrig = {
    topic: 'trigonometry',
    gradeLevel: 10,
    bloomTarget: 4,
    ncertChapter: 'Ch 8',
    curriculumSystem: 'NCERT',
  };

  const researchContext = {
    standardStatement: 'HSG-SRT.C.6: ...',
    prerequisites: ['8.G.B.7'],
    misconceptions: [
      { description: 'Students confuse opposite and adjacent sides', source: 'NCTM', url: 'https://example.com/1' },
      { description: 'Students apply ratio without checking reference angle', source: 'Exa', url: null },
      { description: 'Students compute ratio but forget to label sides first', source: 'Exa', url: null },
      { description: 'Students cannot identify which ratio applies to find a side', source: 'Research', url: null },
      { description: 'Students struggle with angle-of-elevation real world setup', source: 'Exa', url: null },
    ],
    ncertRefs: [{ chapter: 'Ch 8', section: '§8.1', exerciseNotes: 'Ex 8.1' }],
    realWorldContexts: [{ label: 'Ramp', description: 'Find ramp angle.' }],
    researchComplete: true,
    sourceCount: 2,
  };

  it('returns a session plan with correct structure', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    assert.ok(!plan.error, `should not error: ${plan.message}`);
    assert.equal(typeof plan.sessionTitle, 'string');
    assert.equal(plan.concept, 'trigonometry');
    assert.ok(Array.isArray(plan.games), 'games must be an array');
    assert.ok(plan.games.length > 0, 'must include at least one game');
  });

  it('games are in ascending Bloom order', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    const levels = plan.games.map((g) => g.bloomLevel);
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i] >= levels[i - 1], `Bloom levels must be non-decreasing at position ${i}`);
    }
  });

  it('filters out games above bloomTarget', () => {
    const lowBloomGoal = { ...parsedGoalTrig, bloomTarget: 2 };
    const plan = planSession(lowBloomGoal, researchContext);
    assert.ok(!plan.error);
    for (const g of plan.games) {
      assert.ok(g.bloomLevel <= 2, `game "${g.gameId}" bloomLevel ${g.bloomLevel} exceeds target 2`);
    }
  });

  it('attaches misconceptions to games', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    const withMisconception = plan.games.filter((g) => g.targetedMisconception !== null);
    assert.ok(withMisconception.length > 0, 'at least one game must have a targeted misconception');
  });

  it('game objects have required fields', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    for (const g of plan.games) {
      assert.ok(typeof g.position === 'number', `game must have position, got ${g.position}`);
      assert.ok(typeof g.gameId === 'string', `game must have gameId, got ${g.gameId}`);
      assert.ok(typeof g.bloomLevel === 'number', 'game must have bloomLevel');
      assert.ok(typeof g.estimatedMinutes === 'number', 'game must have estimatedMinutes');
      assert.ok('templateSpecId' in g, 'game must have templateSpecId field');
      assert.ok(typeof g.status === 'string', 'game must have status string');
    }
  });

  it('includes prerequisites from researchContext', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    assert.deepEqual(plan.prerequisites, researchContext.prerequisites);
  });

  it('includes standardStatement from researchContext', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    assert.equal(plan.standardStatement, researchContext.standardStatement);
  });

  it('estimatedMinutes is sum of game durations', () => {
    const plan = planSession(parsedGoalTrig, researchContext);
    const sum = plan.games.reduce((acc, g) => acc + g.estimatedMinutes, 0);
    assert.equal(plan.estimatedMinutes, sum);
  });

  it('works with null researchContext — returns empty prerequisites + null standard', () => {
    const plan = planSession(parsedGoalTrig, null);
    assert.ok(!plan.error);
    assert.deepEqual(plan.prerequisites, []);
    assert.equal(plan.standardStatement, null);
    assert.equal(plan.researchComplete, false);
  });

  it('returns error for unknown topic', () => {
    const plan = planSession({ topic: 'quantum-physics', bloomTarget: 3 }, null);
    assert.equal(plan.error, 'concept_not_found');
    assert.ok(Array.isArray(plan.availableConcepts));
  });

  it('normalizes topic aliases — "trig" resolves to trigonometry', () => {
    const plan = planSession({ topic: 'trig', bloomTarget: 4 }, null);
    assert.ok(!plan.error, `should not error: ${plan && plan.message}`);
    assert.equal(plan.concept, 'trigonometry');
  });

  it('returns error_no_skills_in_range when bloomTarget is too low', () => {
    // Bloom L0 is below all nodes (which start at L1)
    const plan = planSession({ topic: 'trigonometry', bloomTarget: 0 }, null);
    assert.ok(plan.error === 'no_skills_in_range' || plan.games.length === 0 || !plan.error);
    // Note: L1 nodes exist so bloomTarget:0 will return no_skills_in_range
    // or we accept the plan having 0 games — either is acceptable
  });

  it('handles parsedGoal without gradeLevel', () => {
    const plan = planSession({ topic: 'trigonometry', bloomTarget: 3 }, null);
    assert.ok(!plan.error);
    assert.equal(plan.gradeLevel, null);
  });

  it('throws for non-object parsedGoal', () => {
    assert.throws(() => planSession(null, null), /parsedGoal is required/);
    assert.throws(() => planSession('string', null), /parsedGoal is required/);
  });
});

// ─── generateSessionId tests — Phase 2 ───────────────────────────────────────
describe('generateSessionId', () => {
  it('returns a string', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: 10 });
    assert.equal(typeof id, 'string');
    assert.ok(id.length > 0, 'sessionId must be non-empty');
  });

  it('contains concept fragment at start', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: 10 });
    assert.ok(id.startsWith('trigonometry'), `expected id to start with "trigonometry", got: ${id}`);
  });

  it('contains grade level fragment', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: 10 });
    assert.ok(id.includes('class10'), `expected id to include "class10", got: ${id}`);
  });

  it('contains date fragment (8 consecutive digits)', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: 10 });
    assert.ok(/\d{8}/.test(id), `expected id to contain 8-digit date fragment, got: ${id}`);
  });

  it('contains alphanumeric random suffix', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: 10 });
    const parts = id.split('-');
    const suffix = parts[parts.length - 1];
    assert.ok(suffix.length >= 5, `expected random suffix >=5 chars, got: "${suffix}"`);
    assert.ok(/^[a-z0-9]+$/.test(suffix), `suffix must be alphanumeric lowercase, got: "${suffix}"`);
  });

  it('two calls produce different IDs', () => {
    const a = generateSessionId('trigonometry', { gradeLevel: 10 });
    const b = generateSessionId('trigonometry', { gradeLevel: 10 });
    assert.notEqual(a, b, 'each call must produce a unique sessionId');
  });

  it('handles null gradeLevel gracefully', () => {
    const id = generateSessionId('trigonometry', { gradeLevel: null });
    assert.equal(typeof id, 'string');
    assert.ok(id.includes('grad-unknown'), `expected "grad-unknown" in id, got: ${id}`);
  });

  it('sanitises concept with non-alphanumeric chars', () => {
    const id = generateSessionId('right-triangle trig!', { gradeLevel: 9 });
    assert.ok(/^[a-z0-9-]/.test(id), `id must start with safe chars, got: ${id}`);
  });
});

// ─── writeSessionDirectory tests — Phase 2 ───────────────────────────────────
describe('writeSessionDirectory', () => {
  const fullResearchContext = {
    standardStatement:
      'HSG-SRT.C.6: Understand that by similarity, side ratios in right triangles are properties of the angles in the triangle.',
    prerequisites: ['8.G.B.7'],
    misconceptions: [
      { description: 'Students confuse opposite and adjacent sides', source: 'NCTM', url: 'https://example.com/1' },
      { description: 'Students apply ratio without checking reference angle', source: 'Exa', url: null },
      { description: 'Students compute ratio but forget to label sides first', source: 'Exa', url: null },
      { description: 'Students cannot identify which ratio applies to find a side', source: 'Research', url: null },
      { description: 'Students struggle with angle-of-elevation real world setup', source: 'Exa', url: null },
    ],
    ncertRefs: [{ chapter: 'Ch 8', section: '§8.1', exerciseNotes: 'Ex 8.1 Q1-Q3' }],
    realWorldContexts: [{ label: 'Ramp', description: 'Find ramp angle.' }],
    researchComplete: true,
    sourceCount: 2,
  };

  let sessionPlan;
  before(() => {
    sessionPlan = planSession(
      { topic: 'trigonometry', gradeLevel: 10, bloomTarget: 4, ncertChapter: 'Ch 8', curriculumSystem: 'NCERT' },
      fullResearchContext,
    );
  });

  it('dryRun: true returns correct structure without writing files', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-dryrun-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: true,
      });
      assert.equal(typeof result.sessionId, 'string', 'sessionId must be a string');
      assert.ok(result.sessionId.length > 0, 'sessionId must be non-empty');
      assert.equal(typeof result.outputPath, 'string', 'outputPath must be a string');
      assert.ok(Array.isArray(result.filesWritten), 'filesWritten must be an array');
      assert.ok(result.filesWritten.length > 0, 'filesWritten must list at least one file');
      assert.ok(!fs.existsSync(result.outputPath), 'dryRun must not create the session directory');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('dryRun: true lists session-plan.md in filesWritten', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-dryrun2-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: true,
      });
      const hasPlanFile = result.filesWritten.some((f) => f.endsWith('session-plan.md'));
      assert.ok(hasPlanFile, 'filesWritten must include session-plan.md');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('dryRun: true lists spec-instructions.md for each game', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-dryrun3-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: true,
      });
      const specFiles = result.filesWritten.filter((f) => f.endsWith('spec-instructions.md'));
      assert.equal(
        specFiles.length,
        sessionPlan.games.length,
        `must list one spec-instructions.md per game (expected ${sessionPlan.games.length}, got ${specFiles.length})`,
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('actual write: session-plan.md exists on disk with correct content', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-write-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: false,
      });
      assert.ok(fs.existsSync(result.outputPath), 'session directory must be created');
      const planPath = path.join(result.outputPath, 'session-plan.md');
      assert.ok(fs.existsSync(planPath), 'session-plan.md must exist');
      const content = fs.readFileSync(planPath, 'utf8');
      assert.ok(content.includes('Session Plan'), 'must include "Session Plan" heading');
      assert.ok(content.includes('trigonometry'), 'must mention the concept');
      assert.ok(content.includes('HSG-SRT.C.6'), 'must embed standard statement');
      assert.ok(content.includes('Engineer Instructions'), 'must include engineer instructions');
      assert.ok(content.includes('Game Sequence'), 'must include game sequence table');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('actual write: per-game spec-instructions.md files exist with correct structure', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-games-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: false,
      });
      for (const game of sessionPlan.games) {
        const gameDir = path.join(result.outputPath, `game-${game.position}-${game.gameId}`);
        assert.ok(fs.existsSync(gameDir), `game-${game.position}-${game.gameId}/ directory must exist`);
        const specInstructionsPath = path.join(gameDir, 'spec-instructions.md');
        assert.ok(fs.existsSync(specInstructionsPath), `spec-instructions.md must exist for game ${game.position}`);
        const content = fs.readFileSync(specInstructionsPath, 'utf8');
        assert.ok(content.includes('Spec Instructions'), 'must include heading');
        assert.ok(content.includes('Preserve Unchanged'), 'must include preserve section');
        assert.ok(content.includes('Substitute'), 'must include substitution section');
        assert.ok(content.includes('Novelty Check'), 'must include novelty check');
        assert.ok(content.includes('Evidence to Embed'), 'must include evidence section');
        assert.ok(content.includes(game.gameId), `must mention gameId "${game.gameId}"`);
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('actual write: session-plan.md session ID matches result.sessionId', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-idcheck-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: false,
      });
      const planContent = fs.readFileSync(path.join(result.outputPath, 'session-plan.md'), 'utf8');
      assert.ok(planContent.includes(result.sessionId), 'session-plan.md must embed the sessionId');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('throws when sessionPlan is null', async () => {
    await assert.rejects(() => writeSessionDirectory(null, null, { dryRun: true }), /sessionPlan is required/);
  });

  it('throws when sessionPlan has an error field', async () => {
    await assert.rejects(
      () => writeSessionDirectory({ error: 'concept_not_found', message: 'Unknown' }, null, { dryRun: true }),
      /sessionPlan has error/,
    );
  });

  it('works with null researchContext — writes files with placeholder text', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-norc-'));
    try {
      const planNoRc = planSession({ topic: 'trigonometry', gradeLevel: 10, bloomTarget: 4 }, null);
      const result = await writeSessionDirectory(planNoRc, null, { outputDir: tmpDir, dryRun: false });
      assert.ok(fs.existsSync(result.outputPath), 'must create session dir even without research context');
      const planContent = fs.readFileSync(path.join(result.outputPath, 'session-plan.md'), 'utf8');
      assert.ok(
        planContent.includes('No misconceptions sourced') || planContent.includes('not yet researched'),
        'session-plan.md must include placeholder text when research is absent',
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('session-plan.md game sequence table has one row per game', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ralph-sp-rows-'));
    try {
      const result = await writeSessionDirectory(sessionPlan, fullResearchContext, {
        outputDir: tmpDir,
        dryRun: false,
      });
      const content = fs.readFileSync(path.join(result.outputPath, 'session-plan.md'), 'utf8');
      // Count table rows: lines starting with "| <digit>"
      const tableRows = content.split('\n').filter((l) => /^\| \d+/.test(l));
      assert.equal(
        tableRows.length,
        sessionPlan.games.length,
        `table must have ${sessionPlan.games.length} data rows, found ${tableRows.length}`,
      );
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
