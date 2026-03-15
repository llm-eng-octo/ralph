'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Test the runRalph function logic in isolation by replicating path resolution logic

describe('worker path resolution', () => {
  const REPO_DIR = '/mock/repo';

  function resolveGameDir(gameId, specPath) {
    return specPath
      ? path.join(path.dirname(specPath), '..', 'game')
      : path.join(REPO_DIR, 'game-spec', 'templates', gameId, 'game');
  }

  function resolveSpecFile(gameId, specPath) {
    return specPath
      || path.join(REPO_DIR, 'game-spec', 'templates', gameId, 'spec.md');
  }

  it('resolves default game dir from gameId', () => {
    const dir = resolveGameDir('doubles', null);
    assert.equal(dir, '/mock/repo/game-spec/templates/doubles/game');
  });

  it('resolves default spec file from gameId', () => {
    const spec = resolveSpecFile('doubles', null);
    assert.equal(spec, '/mock/repo/game-spec/templates/doubles/spec.md');
  });

  it('resolves custom game dir from specPath', () => {
    const dir = resolveGameDir('doubles', '/custom/path/templates/doubles/spec.md');
    assert.equal(dir, path.join('/custom/path/templates', 'game'));
  });

  it('uses specPath directly when provided', () => {
    const spec = resolveSpecFile('doubles', '/custom/spec.md');
    assert.equal(spec, '/custom/spec.md');
  });
});

describe('worker report parsing', () => {
  it('parses valid ralph-report.json', () => {
    const report = {
      status: 'APPROVED',
      iterations: 2,
      generation_time_s: 30.5,
      total_time_s: 47.3,
      test_results: [
        { iteration: 1, passed: 8, failures: 2 },
        { iteration: 2, passed: 10, failures: 0 },
      ],
      review_result: 'Approved - all checks pass',
      models: { generation: 'claude-opus-4-6', review: 'claude-sonnet-4-6' },
    };

    // Simulate what worker does: write then read
    const tmpFile = path.join(os.tmpdir(), 'ralph-report-test.json');
    fs.writeFileSync(tmpFile, JSON.stringify(report));
    const parsed = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    fs.unlinkSync(tmpFile);

    assert.equal(parsed.status, 'APPROVED');
    assert.equal(parsed.iterations, 2);
    assert.equal(parsed.total_time_s, 47.3);
    assert.equal(parsed.test_results.length, 2);
    assert.equal(parsed.models.generation, 'claude-opus-4-6');
  });

  it('handles FAILED report', () => {
    const report = {
      status: 'FAILED',
      iterations: 5,
      generation_time_s: 120,
      total_time_s: 180,
      test_results: [
        { iteration: 5, passed: 7, failures: 3 },
      ],
      review_result: null,
      models: { generation: 'claude-sonnet-4-6' },
    };

    const tmpFile = path.join(os.tmpdir(), 'ralph-report-fail.json');
    fs.writeFileSync(tmpFile, JSON.stringify(report));
    const parsed = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    fs.unlinkSync(tmpFile);

    assert.equal(parsed.status, 'FAILED');
    assert.equal(parsed.iterations, 5);
    assert.equal(parsed.review_result, null);
  });

  it('handles REJECTED report', () => {
    const report = {
      status: 'REJECTED',
      iterations: 1,
      generation_time_s: 25,
      total_time_s: 35,
      test_results: [{ iteration: 1, passed: 10, failures: 0 }],
      review_result: 'Code quality issues found: excessive global variables',
      models: { generation: 'claude-opus-4-6', review: 'claude-sonnet-4-6' },
    };

    const tmpFile = path.join(os.tmpdir(), 'ralph-report-reject.json');
    fs.writeFileSync(tmpFile, JSON.stringify(report));
    const parsed = JSON.parse(fs.readFileSync(tmpFile, 'utf-8'));
    fs.unlinkSync(tmpFile);

    assert.equal(parsed.status, 'REJECTED');
    assert.ok(parsed.review_result.includes('Code quality'));
  });
});

describe('worker error handling patterns', () => {
  it('iterations fallback to 0 when undefined', () => {
    const report = { status: 'FAILED' };
    const iterations = report.iterations || 0;
    assert.equal(iterations, 0);
  });

  it('models fallback object has no crash on .generation access', () => {
    // This simulates the failed-job handler path where models = {}
    const failedReport = {
      status: 'FAILED', iterations: 0, total_time_s: 0,
      test_results: [], review_result: null, models: {},
    };
    const model = failedReport.models?.generation || 'unknown';
    assert.equal(model, 'unknown');
  });

  it('optional chaining protects against null models', () => {
    const report = { status: 'APPROVED', models: null };
    const model = report.models?.generation || 'unknown';
    assert.equal(model, 'unknown');
  });

  it('optional chaining protects against undefined models', () => {
    const report = { status: 'APPROVED' };
    const model = report.models?.generation || 'unknown';
    assert.equal(model, 'unknown');
  });
});

describe('worker concurrency and rate limit config', () => {
  it('default concurrency is 2', () => {
    const concurrency = parseInt(process.env.RALPH_CONCURRENCY || '2', 10);
    assert.equal(concurrency, 2);
  });

  it('default rate limit is 10 per hour', () => {
    const max = parseInt(process.env.RALPH_RATE_MAX || '10', 10);
    const duration = parseInt(process.env.RALPH_RATE_DURATION || '3600000', 10);
    assert.equal(max, 10);
    assert.equal(duration, 3600000);
  });
});
