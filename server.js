'use strict';

const express = require('express');
const crypto = require('crypto');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const db = require('./lib/db');
const slack = require('./lib/slack');
const logger = require('./lib/logger');
const sentry = require('./lib/sentry');
const metrics = require('./lib/metrics');

// ─── Initialize observability ───────────────────────────────────────────────
sentry.init('ralph-server');
logger.initCloudLogging();

// ─── Configuration ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3000', 10);
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const BULK_THRESHOLD = parseInt(process.env.RALPH_BULK_THRESHOLD || '5', 10);

// ─── Redis + Queue ──────────────────────────────────────────────────────────
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const queue = new Queue('ralph-builds', { connection });

// ─── Express app ────────────────────────────────────────────────────────────
const app = express();

// Raw body for webhook signature verification, then JSON parse
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── GitHub webhook signature verification ──────────────────────────────────
function verifyGitHubSignature(req, res, next) {
  if (!GITHUB_WEBHOOK_SECRET) {
    console.warn('[webhook] No GITHUB_WEBHOOK_SECRET configured — skipping verification');
    // Parse raw body to JSON
    try {
      req.body = JSON.parse(req.body.toString());
    } catch {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    return next();
  }

  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', GITHUB_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Parse raw body to JSON after verification
  try {
    req.body = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  next();
}

// ─── Extract changed spec game IDs from push event ──────────────────────────
function extractChangedSpecs(payload) {
  const gameIds = new Set();
  const commits = payload.commits || [];

  for (const commit of commits) {
    const files = [
      ...(commit.added || []),
      ...(commit.modified || []),
    ];
    for (const file of files) {
      // Match game-spec/templates/{game-id}/spec.md
      const match = file.match(/game-spec\/templates\/([^/]+)\/spec\.md$/);
      if (match) {
        gameIds.add(match[1]);
      }
    }
  }

  return gameIds;
}

// ─── Get next midnight in timezone for overnight scheduling ─────────────────
function getNextMidnight(timezone) {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const currentHour = parseInt(formatter.format(now), 10);

  // If before midnight, schedule for tonight; else tomorrow
  const hoursUntilMidnight = (24 - currentHour) % 24 || 24;
  return now.getTime() + hoursUntilMidnight * 60 * 60 * 1000;
}

// ═════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════════════════════════════════════

// ─── GitHub webhook endpoint ────────────────────────────────────────────────
app.post('/webhook/github', verifyGitHubSignature, async (req, res) => {
  const event = req.headers['x-github-event'];

  if (event !== 'push') {
    return res.json({ ignored: true, reason: `event type: ${event}` });
  }

  const ref = req.body.ref || '';
  if (!ref.endsWith('/c_code') && !ref.endsWith('/main')) {
    return res.json({ ignored: true, reason: `branch: ${ref}` });
  }

  const changedSpecs = extractChangedSpecs(req.body);

  if (changedSpecs.size === 0) {
    return res.json({ queued: 0, reason: 'no spec changes detected' });
  }

  const commitSha = req.body.after || null;

  if (changedSpecs.size > BULK_THRESHOLD) {
    // Bulk — schedule overnight
    const midnight = getNextMidnight('Asia/Kolkata');
    const delay = midnight - Date.now();

    for (const gameId of changedSpecs) {
      const buildId = db.createBuild(gameId, commitSha);
      await queue.add('build-game', { gameId, commitSha, buildId }, { delay });
    }

    await slack.notifyBulkQueued(changedSpecs.size);
    logger.info(`${changedSpecs.size} games queued for overnight build`, { event: 'bulk_queue' });
    return res.json({ queued: changedSpecs.size, scheduled: 'overnight' });
  }

  // Small batch — run now
  for (const gameId of changedSpecs) {
    const buildId = db.createBuild(gameId, commitSha);
    await queue.add('build-game', { gameId, commitSha, buildId });
  }

  logger.info(`${changedSpecs.size} games queued for immediate build`, { event: 'immediate_queue' });
  return res.json({ queued: changedSpecs.size, scheduled: 'immediate' });
});

// ─── Manual build trigger ───────────────────────────────────────────────────
app.post('/api/build', async (req, res) => {
  const { gameId, all, specPath } = req.body;

  if (all) {
    // Queue all templates — schedule overnight if many
    // Caller should provide a list or we discover from filesystem
    return res.status(501).json({
      error: 'Bulk rebuild not yet implemented via API. Use webhook or provide individual gameId.',
    });
  }

  if (!gameId) {
    return res.status(400).json({ error: 'gameId is required' });
  }

  const buildId = db.createBuild(gameId, null);
  await queue.add('build-game', {
    gameId,
    buildId,
    specPath: specPath || null,
  });

  logger.info(`Build queued for ${gameId}`, { gameId, buildId, event: 'manual_build' });
  return res.json({ queued: true, buildId, gameId });
});

// ─── Build status and history ───────────────────────────────────────────────
app.get('/api/builds', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const builds = db.getRecentBuilds(limit);
  const stats = db.getBuildStats();
  res.json({ stats, builds });
});

app.get('/api/builds/:id', (req, res) => {
  const build = db.getBuild(parseInt(req.params.id, 10));
  if (!build) {
    return res.status(404).json({ error: 'Build not found' });
  }
  // Parse JSON fields for response
  if (build.test_results) build.test_results = JSON.parse(build.test_results);
  if (build.models) build.models = JSON.parse(build.models);
  res.json(build);
});

app.get('/api/games/:gameId/builds', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
  const builds = db.getBuildsByGame(req.params.gameId, limit);
  res.json(builds);
});

// ─── Metrics endpoint (Prometheus) ──────────────────────────────────────────
app.get('/metrics', metrics.metricsMiddleware);

// ─── Metrics JSON endpoint ──────────────────────────────────────────────────
app.get('/api/metrics', (req, res) => {
  res.json(metrics.getMetricsJson());
});

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const stats = db.getBuildStats();
  let redisOk = false;
  try {
    await connection.ping();
    redisOk = true;
  } catch { /* ignore */ }

  const queueCounts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed');

  res.json({
    status: 'ok',
    redis: redisOk,
    queue: queueCounts,
    builds: stats,
  });
});

// ─── Sentry error handler (must be after all routes) ────────────────────────
app.use(sentry.expressErrorHandler());

// ─── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[ralph-server] Listening on port ${PORT}`);
  console.log(`[ralph-server] Webhook: POST /webhook/github`);
  console.log(`[ralph-server] API:     POST /api/build`);
  console.log(`[ralph-server] Status:  GET  /api/builds`);
  console.log(`[ralph-server] Health:  GET  /health`);
});

// ─── Graceful shutdown ──────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[ralph-server] Shutting down...');
  await queue.close();
  await connection.quit();
  db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[ralph-server] Shutting down...');
  await queue.close();
  await connection.quit();
  db.close();
  process.exit(0);
});
