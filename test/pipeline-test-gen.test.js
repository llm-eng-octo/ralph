'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Tests for lintGeneratedTests() in lib/pipeline-test-gen.js
//
// Validates that each lint rule fires on matching content and is silent on
// clean content. Each test constructs a minimal fake test file and asserts
// the expected violation count and rule IDs.
// ─────────────────────────────────────────────────────────────────────────────

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { lintGeneratedTests } = require('../lib/pipeline-test-gen');

// Silence lint WARN output during tests
const silentLog = () => {};

describe('lintGeneratedTests — M13: immediate getLives/getScore/getRound assertion', () => {
  it('flags getLives() directly chained to .toBe()', () => {
    const content = `
test('lives check', async ({ page }) => {
  const lives = await getLives(page);
  expect(lives).toBe(3);
});
`;
    // M13 regex checks for getLives(...).toBe — this pattern has the value extracted first,
    // then asserted. The lint rule catches the chained form: getLives(page).toBe(...)
    const chainedContent = `
test('lives check', async ({ page }) => {
  expect(await getLives(page)).toBe(3);
});
`;
    // The pattern requires the method call directly followed by .toBe on the same line
    const directContent = `  expect(getLives(page)).toBe(3);`;
    const { violations } = lintGeneratedTests({ mechanics: directContent }, silentLog);
    const m13 = violations.filter((v) => v.rule === 'M13');
    assert.equal(m13.length, 1, 'Should flag M13 for immediate getLives().toBe()');
    assert.equal(m13[0].category, 'mechanics');
  });

  it('does not flag getLives inside expect.poll()', () => {
    const content = `
test('lives check', async ({ page }) => {
  await expect.poll(() => getLives(page), { timeout: 3000 }).toBe(3);
});
`;
    const { violations } = lintGeneratedTests({ mechanics: content }, silentLog);
    const m13 = violations.filter((v) => v.rule === 'M13');
    assert.equal(m13.length, 0, 'Should not flag M13 when inside expect.poll()');
  });
});

describe('lintGeneratedTests — M15: immediate .toHaveClass for state class', () => {
  it('flags immediate .toHaveClass("correct")', () => {
    const content = `  expect(btn).toHaveClass('correct');`;
    const { violations } = lintGeneratedTests({ mechanics: content }, silentLog);
    const m15 = violations.filter((v) => v.rule === 'M15');
    assert.equal(m15.length, 1, 'Should flag M15 for immediate .toHaveClass("correct")');
  });

  it('flags immediate .toHaveClass("wrong")', () => {
    const content = `  expect(option).toHaveClass('wrong');`;
    const { violations } = lintGeneratedTests({ 'edge-cases': content }, silentLog);
    const m15 = violations.filter((v) => v.rule === 'M15');
    assert.equal(m15.length, 1, 'Should flag M15 for .toHaveClass("wrong")');
    assert.equal(m15[0].category, 'edge-cases');
  });

  it('does not flag .toHaveClass("game-button") (non-state class)', () => {
    const content = `  expect(btn).toHaveClass('game-button');`;
    const { violations } = lintGeneratedTests({ mechanics: content }, silentLog);
    const m15 = violations.filter((v) => v.rule === 'M15');
    assert.equal(m15.length, 0, 'Should not flag M15 for non-state class names');
  });
});

describe('lintGeneratedTests — CT7: wrong postMessage type "gameOver"', () => {
  it('flags msg.type === "gameOver"', () => {
    const content = `  expect(msg.type === 'gameOver').toBe(true);`;
    const { violations } = lintGeneratedTests({ contract: content }, silentLog);
    const ct7 = violations.filter((v) => v.rule === 'CT7');
    assert.equal(ct7.length, 1, 'Should flag CT7 for msg.type === "gameOver"');
  });

  it('does not flag msg.type === "game_complete"', () => {
    const content = `  assert.equal(msg.type, 'game_complete');`;
    const { violations } = lintGeneratedTests({ contract: content }, silentLog);
    const ct7 = violations.filter((v) => v.rule === 'CT7');
    assert.equal(ct7.length, 0, 'Should not flag CT7 for correct "game_complete" type');
  });
});

describe('lintGeneratedTests — CT7_GAMEOVER: wrong phase name "game_over"', () => {
  it('flags waitForPhase(page, "game_over")', () => {
    const content = `  await waitForPhase(page, 'game_over');`;
    const { violations } = lintGeneratedTests({ contract: content }, silentLog);
    const ct7go = violations.filter((v) => v.rule === 'CT7_GAMEOVER');
    assert.equal(ct7go.length, 1, 'Should flag CT7_GAMEOVER for waitForPhase with "game_over"');
  });

  it('does not flag waitForPhase(page, "gameover")', () => {
    const content = `  await waitForPhase(page, 'gameover');`;
    const { violations } = lintGeneratedTests({ contract: content }, silentLog);
    const ct7go = violations.filter((v) => v.rule === 'CT7_GAMEOVER');
    assert.equal(ct7go.length, 0, 'Should not flag CT7_GAMEOVER for correct "gameover" phase');
  });
});

describe('lintGeneratedTests — TRANSITION_SLOT: #mathai-transition-slot button selector in non-CDN context', () => {
  it('flags #mathai-transition-slot button selector', () => {
    const content = `  await page.locator('#mathai-transition-slot button').click();`;
    const { violations } = lintGeneratedTests({ 'level-progression': content }, silentLog);
    const ts = violations.filter((v) => v.rule === 'TRANSITION_SLOT');
    assert.equal(ts.length, 1, 'Should flag TRANSITION_SLOT rule');
    assert.equal(ts[0].category, 'level-progression');
  });

  it('does not flag #mathai-transition-slot alone (without button)', () => {
    const content = `  const slot = page.locator('#mathai-transition-slot');`;
    const { violations } = lintGeneratedTests({ 'game-flow': content }, silentLog);
    const ts = violations.filter((v) => v.rule === 'TRANSITION_SLOT');
    assert.equal(ts.length, 0, 'Should not flag #mathai-transition-slot without button');
  });
});

describe('lintGeneratedTests — RULE-DUP: duplicate data-testid across categories', () => {
  it('flags duplicate data-testid values across two categories', () => {
    const mechanics = `  await page.locator('[data-testid="answer-btn"]').click();`;
    const contract = `  const btn = page.locator('[data-testid="answer-btn"]');`;
    const { violations } = lintGeneratedTests({ mechanics, contract }, silentLog);
    const dups = violations.filter((v) => v.rule === 'RULE-DUP');
    assert.equal(dups.length, 1, 'Should flag one RULE-DUP violation for duplicate testid');
  });

  it('does not flag unique data-testid values', () => {
    const mechanics = `  await page.locator('[data-testid="submit-btn"]').click();`;
    const contract = `  const btn = page.locator('[data-testid="answer-btn"]');`;
    const { violations } = lintGeneratedTests({ mechanics, contract }, silentLog);
    const dups = violations.filter((v) => v.rule === 'RULE-DUP');
    assert.equal(dups.length, 0, 'Should not flag unique data-testid values');
  });
});

describe('lintGeneratedTests — warningCount and return shape', () => {
  it('returns zero violations for clean test content', () => {
    const clean = `
test.describe('Clean mechanics', () => {
  test('answers correctly', async ({ page }) => {
    await startGame(page);
    await answer(page, true);
    await expect.poll(() => getScore(page), { timeout: 3000 }).toBeGreaterThan(0);
  });
});
`;
    const { violations, warningCount } = lintGeneratedTests({ mechanics: clean }, silentLog);
    assert.equal(warningCount, 0, 'Clean content should produce no violations');
    assert.deepEqual(violations, []);
  });

  it('warningCount matches violations array length', () => {
    const bad = `
  expect(btn).toHaveClass('correct');
  await waitForPhase(page, 'game_over');
`;
    const { violations, warningCount } = lintGeneratedTests({ mechanics: bad }, silentLog);
    assert.equal(warningCount, violations.length, 'warningCount must equal violations.length');
  });

  it('handles empty testFiles map gracefully', () => {
    const { violations, warningCount } = lintGeneratedTests({}, silentLog);
    assert.equal(warningCount, 0);
    assert.deepEqual(violations, []);
  });

  it('handles null/undefined content gracefully', () => {
    const { violations, warningCount } = lintGeneratedTests({ mechanics: null, contract: undefined }, silentLog);
    assert.equal(warningCount, 0);
    assert.deepEqual(violations, []);
  });
});
