# Supervisor Game Approval Flow
**For use in Claude Desktop**

---

## Overview

A 3-step flow for approving new game specs before they enter the Ralph build pipeline.

```
Clarification → Visualization → Register Spec
```

The supervisor runs this entirely inside **Claude Desktop**. Once a spec is registered, Ralph posts a summary to Slack for final build approval.

---

## Prerequisites

Claude Desktop must have the Ralph MCP server connected:

```json
{
  "mcpServers": {
    "ralph": {
      "url": "http://34.93.153.206:3000/mcp",
      "headers": {
        "Authorization": "Bearer <MCP_SECRET>"
      }
    }
  }
}
```

---

## Step 1 — Game Clarification

**What the supervisor does:** Describe the game idea in plain language.

**Prompt to use:**
```
I want to create a new math game. Here is my idea:

[Describe the game — topic, grade level, what students do,
how they win/lose, how many rounds]
```

**What Claude does:**
1. Asks up to 5 clarifying questions (one at a time):
   - What grade / curriculum level?
   - What is the specific learning objective? (e.g. "recognise acute vs obtuse angles")
   - How many rounds / questions per game?
   - Lives system or time-based?
   - Any example questions or round data?
2. Looks up the matching curriculum standard via the Knowledge Graph MCP
3. Produces a structured spec draft for review

**Output:** A draft spec the supervisor can read and correct before moving to Step 2.

---

## Step 2 — Visualization

**What the supervisor does:** Ask Claude to show a preview.

**Prompt to use:**
```
Show me a visual preview of this game.
```

**What Claude does:**
1. Generates a minimal interactive HTML prototype (rendered as an Artifact)
2. The prototype includes:
   - Start screen with the game title and "Let's go!" button
   - One sample round (using example data from Step 1)
   - Answer buttons or input that respond to clicks
   - A simple results screen
3. Supervisor can interact with it directly in the Artifact pane

**What to check:**
- [ ] Does the interaction feel right? (tap to answer, drag, fill in blank, etc.)
- [ ] Is the round structure correct? (number of options, number of rounds)
- [ ] Is the difficulty appropriate for the target grade?
- [ ] Are the example questions representative?

**To revise:** Tell Claude what to change — it updates the preview in place.

---

## Step 3 — Register Spec

**What the supervisor does:** Approve the spec and register it.

**Prompt to use:**
```
This looks good. Register the spec for [gameId].
```

**What Claude does:**
1. Calls `register_spec` MCP tool → writes final spec to `warehouse/templates/<gameId>/spec.md` on the Ralph server
2. Posts a summary to Slack (channel `#ralph-builds`) tagging Mithilesh:
   ```
   📋 New spec registered: [Game Name] (#gameId)
   Curriculum: [standard]
   Rounds: N | Lives: Y/N | Mechanic: [description]
   → Ready to queue build. Reply ✅ to proceed.
   ```
3. Returns a confirmation with the spec path and Slack link

**Mithilesh approves on Slack** by reacting ✅ or replying — Ralph worker picks it up.

---

## Example: Two Games

### Game A — Stats: Identify the Class

**Clarification prompt:**
```
I want a game where students see a dataset and identify whether
it is ungrouped or grouped data. Grade 9, CBSE stats chapter.
5 rounds, no lives, MCQ format.
```

**Expected spec output:** `warehouse/templates/stats-identify-class/spec.md`

---

### Game B — Light-Up Puzzle

**Clarification prompt:**
```
A logic puzzle game — students place light bulbs on a grid to
illuminate all white cells. No lives, 1 puzzle per session,
timer shown. For logic / reasoning, any grade.
```

**Expected spec output:** `warehouse/templates/light-up/spec.md`

---

## Flow Summary

| Step | Action | Tool used | Output |
|------|--------|-----------|--------|
| 1. Clarify | Describe game idea | Knowledge Graph MCP | Draft spec |
| 2. Visualize | Ask for preview | Claude Artifacts | Interactive HTML prototype |
| 3. Register | Approve + register | `register_spec` MCP tool | Spec file + Slack notification |

---

## MCP Tools Required

| Tool | Description | Status |
|------|-------------|--------|
| `list_games` | List all games with status | ✅ live |
| `get_spec` | Read a game's current spec | ✅ live |
| `register_spec` | Write spec to warehouse + notify Slack | ✅ live (commit 152d636) |
| `queue_build` | Queue a build for a gameId | ✅ live |
| `plan_session` | Plan a full session from a teaching objective | ✅ live (commit 152d636) |

All tools are live. The supervisor flow is fully operational.

---

## Notes for Supervisor

- **You can correct at any step** — if the spec draft is wrong, just say what to fix. Claude will update and re-show.
- **Visualization is a sketch, not the final game** — the actual Ralph build will produce a fully polished version following all CDN rules and the complete spec.
- **Slack approval is the final gate** — the build does not queue until Mithilesh reacts ✅ in Slack.
