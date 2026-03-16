# Ralph Pipeline

Automated game-building pipeline. Takes game specs (Markdown), generates validated HTML game artifacts using LLMs, runs Playwright tests, and produces approval/failure reports.

## Architecture

```
GitHub webhook → server.js (Express) → BullMQ queue → worker.js → ralph.sh (bash pipeline)
                                                                      ↓
                                                              CLIProxyAPI → Claude/Gemini/Codex
```

- **server.js** — Webhook receiver + REST API. Verifies HMAC-SHA256, extracts changed specs, queues jobs. Refuses to start without webhook secret in production.
- **worker.js** — BullMQ consumer. Runs ralph.sh via `execFile`, reads ralph-report.json, updates DB + Slack.
- **ralph.sh** — Core 677-line bash pipeline: generate HTML → static validation → generate tests → test/fix loop (up to 5 iterations with smart retry escalation) → review.
- **lib/** — Shared modules: db (SQLite), metrics (Prometheus), slack, logger, sentry, validate-static, llm.

## Commands

```bash
npm start          # Start webhook server (port 3000)
npm run worker     # Start BullMQ worker
npm test           # Run all 132 tests (11 test files)
npm run validate   # Run static HTML validator on a file
```

## Testing

Tests use Node.js built-in test runner (`node --test`). No external test framework.

```bash
node --test test/*.test.js           # All 132 tests
node --test test/db.test.js          # Single file
```

Tests mock external dependencies (Redis, fetch, filesystem) — no infrastructure needed.

**Test files:** db, llm, logger, metrics, sentry, server, slack, validate-static, worker, ralph-sh, e2e.

## Key Files

| File | Purpose |
|------|---------|
| server.js | Express app: webhook + API routes |
| worker.js | BullMQ worker: job processing |
| ralph.sh | Bash pipeline: LLM generation + validation |
| lib/db.js | SQLite: builds table, CRUD, stats |
| lib/metrics.js | Prometheus counters/gauges/histograms |
| lib/validate-static.js | T1 static HTML checks (CLI tool, 10 error checks + 2 warnings) |
| lib/slack.js | Slack webhook notifications |
| lib/logger.js | Structured JSON logging (optional GCP) |
| lib/sentry.js | Error monitoring (optional Sentry, v8 API normalized) |
| lib/llm.js | Node.js LLM client (currently unused — ralph.sh uses curl) |
| Dockerfile | Multi-stage build: node:20-slim, non-root user, healthcheck |
| monitoring/alerts.yml | 6 Prometheus alert rules |
| monitoring/grafana-dashboard.json | 5-row Grafana dashboard |

## Environment

Requires Node.js >=20, Redis for BullMQ. See `.env.example` for all 39 config vars.

Optional: `@sentry/node` (SENTRY_DSN), `@google-cloud/logging` (GOOGLE_CLOUD_PROJECT), Slack (SLACK_WEBHOOK_URL). These are `optionalDependencies` — install failures won't block the app.

**Critical:** `GITHUB_WEBHOOK_SECRET` is required when `NODE_ENV=production`.

## Code Style

- `'use strict'` in all modules
- CommonJS (`require`/`module.exports`)
- No TypeScript, no ESLint configured
- Express 4.x (not 5) — async routes need manual try/catch
- SQLite via better-sqlite3 (synchronous API)
- `lastInsertRowid` must be wrapped in `Number()` (BigInt issue)

## Known Constraints

- `llm.js` is dead code — ralph.sh calls CLIProxyAPI via curl directly. Keep for future E3 (API migration).
- validate-static.js checks `id="gameContent"` via regex (improved from bare string match).
- Express 4.x requires manual try/catch in async routes (consider Express 5 migration).

## Roadmap

See `ROADMAP.md` for full tracking across 6 pillars (53 items, 37 done, 16 planned).
