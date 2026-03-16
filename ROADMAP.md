# Ralph Pipeline — Roadmap

**Last updated:** March 16, 2026
**Status legend:** done | in-progress | planned | blocked

---

## P0 — Deployment Blockers

| Item | Status | File(s) | Notes |
|------|--------|---------|-------|
| HMAC-SHA256 webhook verification | done | server.js:35-70 | Length-safe `timingSafeEqual` |
| BigInt serialization crash | done | db.js:48 | `Number(result.lastInsertRowid)` |
| Async Express error handling | done | server.js:122,174 | try/catch in all async routes |
| LLM infinite recursion on 429 | done | llm.js:19-50 | Max 5 retries with exponential backoff |
| Metrics NaN corruption guard | done | metrics.js:observeHistogram | Rejects null/undefined/NaN |
| Health endpoint crash (Redis down) | done | server.js:243-247 | `getJobCounts` inside try/catch |
| Server reference for graceful shutdown | done | server.js:261 | `const server = app.listen(...)` |
| Refuse to start without webhook secret | done | server.js:23-26 | `process.exit(1)` in production mode |
| Dockerfile for Node.js app | done | Dockerfile | Multi-stage: builder (native addons) → runtime (node:20-slim) |
| .dockerignore | done | .dockerignore | Excludes node_modules, .git, data, .env, test/ |
| CI/CD pipeline (lint + test) | done | .github/workflows/ci.yml | `node --check`, `bash -n ralph.sh`, `npm test` |
| CI/CD deploy workflow | done | .github/workflows/deploy.yml | SSH deploy, manual trigger, requires CI pass |

## P1 — Testing & Validation

| Item | Status | File(s) | Notes |
|------|--------|---------|-------|
| Unit tests (101 cases) | done | test/*.test.js | db, metrics, slack, llm, logger, sentry, server, worker, validate-static |
| ralph.sh smoke tests (31 cases) | done | test/ralph-sh.test.js | Syntax, structure, extract_html, extract_tests, validate_spec, config defaults, report format |
| E2E integration test | done | test/e2e.test.js | Full build lifecycle, HMAC signatures, concurrent builds, failure paths |
| T1 validator: warnings → errors | done | lib/validate-static.js | answer handler, gameState, star thresholds, 480px — all now errors |
| T1 validator: fix pattern matching | done | lib/validate-static.js | `id="gameContent"` regex; star thresholds use `/0\.8\b/`, `/80\s*%/` |
| Contract tests (CLIProxyAPI) | planned | test/proxy-contract.test.js | Validate request/response format against proxy |
| T2 contract validation layer | planned | lib/validate-contract.js | JSON Schema validation of gameState, postMessage, metrics against warehouse schemas |
| Load/stress tests | planned | test/load/ | Verify queue behavior under 47-template bulk runs |

**Test count: 132 tests, 25 suites, 0 failures**

## P2 — Spec Compliance & Feature Completeness

| Item | Status | File(s) | Notes |
|------|--------|---------|-------|
| `all: true` bulk rebuild API | done | server.js:184-210 | Discovers templates from filesystem, schedules overnight |
| Slack format: show call count | done | lib/slack.js:29-33 | `"N calls"` instead of `gen=model` |
| Column name: `duration_s` alias | done | lib/db.js:93 | `SELECT total_time_s AS duration_s` |
| `commit.removed` handling | done | server.js:82 | Deleted spec files now trigger builds |
| T6 inputSchema.json generation | planned | ralph.sh | POST_GEN step; blocks P3 (Content Generator) integration |
| E5 event schema validation | planned | Playwright tests | Validate postMessage payloads against warehouse schemas |

## P3 — DevOps & Operations

| Item | Status | File(s) | Notes |
|------|--------|---------|-------|
| systemd service units | done | systemd/*.service | Server + worker |
| Docker Compose (Redis + proxy) | done | docker-compose.yml | |
| .env.example | done | .env.example | 39 env vars documented |
| Dockerfile (app) | done | Dockerfile | Multi-stage with non-root user, healthcheck, volume for SQLite |
| CI/CD: lint + test | done | .github/workflows/ci.yml | JS syntax check, bash syntax check, npm test |
| CI/CD: deploy | done | .github/workflows/deploy.yml | SSH deploy with secrets, manual trigger |
| Prometheus alert rules | done | monitoring/alerts.yml | 6 rules: failure rate, stuck builds, backlog, rate limits, worker down, high duration |
| Grafana dashboard | done | monitoring/grafana-dashboard.json | 5 rows: overview, duration, LLM, queue, per-game table |
| Deployment runbook | done | docs/deployment.md | First deploy, updates, troubleshooting (6 scenarios) |
| Log rotation | done | systemd/ralph-logrotate.conf | Daily rotation, 14 days retention, compress |
| Nginx reverse proxy config | planned | docs/deployment.md (inline) | Documented in runbook but no standalone config file |

## P4 — Code Quality & Architecture

| Item | Status | File(s) | Notes |
|------|--------|---------|-------|
| Sentry v8 API alignment | done | lib/sentry.js:93-115 | Wrapper normalizes v8 Span to v7-compatible interface |
| Optional dependencies | done | package.json | `@google-cloud/logging` and `@sentry/node` moved to `optionalDependencies` |
| CLAUDE.md project context | done | CLAUDE.md | Architecture, commands, key files, code style, known constraints |
| Remove or keep llm.js | planned | lib/llm.js | Currently unused; ralph.sh uses curl. Keep if E3 (API migration) is planned |
| Express 5 migration | planned | package.json | Express 5 handles async rejections natively; removes need for try/catch wrappers |
| ESLint + Prettier | planned | .eslintrc.js | No linter configured currently |

## P5 — Scalability & Intelligence (from spec E1-E10)

| Item | Status | Notes |
|------|--------|-------|
| E1 parallel batch runner | done | BullMQ concurrency=2 + rate limiter handles this |
| E2 smart retry escalation | done | ralph.sh:562-568, diagnosis mode on iteration 3+ |
| E3 migrate CLI to API | planned | Replace `claude -p` / curl with direct API calls; enables cost tracking, streaming, structured I/O |
| E4 warehouse-aware context | planned | Deterministic Stage 1: spec → capability matrix → dependency graph → assembled prompt |
| E6 caching / incremental runs | planned | Skip regeneration when spec checksum unchanged |
| E7 failure pattern database | planned | Track systematic failures across 47 templates to improve warehouse |
| E8 diff-based fix prompts | planned | Send only failing test + relevant HTML section instead of full context |
| E9 spec validation against warehouse | planned | Pre-flight: verify referenced parts exist, deps resolved |
| E10 deployment step | planned | After APPROVED: register artifact, generate inputSchema, version tag |

---

## Summary

| Pillar | Done | Planned | Total |
|--------|------|---------|-------|
| P0 Deployment Blockers | 12 | 0 | 12 |
| P1 Testing & Validation | 6 | 3 | 9 |
| P2 Spec Compliance | 4 | 2 | 6 |
| P3 DevOps & Operations | 10 | 1 | 11 |
| P4 Code Quality | 3 | 3 | 6 |
| P5 Scalability | 2 | 7 | 9 |
| **Total** | **37** | **16** | **53** |

## What's Next (suggested sprint order)

1. **T2 contract validation layer** — JSON Schema validation closes the gap between static checks and Playwright
2. **ESLint + Prettier** — enforce consistent code style
3. **Contract tests for CLIProxyAPI** — validate proxy request/response format
4. **E3 migrate to API** — enables cost tracking, structured I/O, and makes llm.js useful
5. **E6 caching** — save time on re-runs when specs haven't changed
6. **E10 deployment step** — auto-register approved artifacts
