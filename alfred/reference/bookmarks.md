# Bookmarks

Tools, frameworks, and references to evaluate or adopt as Alfred matures.

## Frameworks

### AgentField

- **URL:** https://github.com/Agent-Field/agentfield
- **What:** Control plane that turns AI agents into production microservices. Routing, human-in-the-loop (pause/resume), memory (KV + vector), observability (DAG visualization), canary deployments, durable async execution, harness for Claude Code/Codex.
- **When useful:** Phase 2+ — when Alfred moves from local Claude Code to a production service with multiple creators, observability, versioning, and audit trails.
- **What it solves that Alfred currently lacks:** Observability (which skills fail and how often), human-in-the-loop as infrastructure (not prompt markers), skill versioning with canary rollout, cross-agent routing.
- **What it doesn't solve:** Alfred's skills are .md files, not code. Orchestration is a prompt, not a control plane. Current stage needs skill authoring and eval proving, not deployment infrastructure.
- **Evaluate after:** One game ships end-to-end through Alfred.
