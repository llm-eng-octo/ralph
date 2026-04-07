# Knowledgebase Principles

15 principles for a clean, maintainable knowledgebase consumable by both humans and AI agents.

---

## 1. Single source with pointers

Every concept lives in one place; others link, never restate.

## 2. Atomic scope

Each entry covers one concept with explicit boundaries; large topics split into linked entries.

## 3. Purpose-driven

Every entry answers a clear question: what to do, how it works, or why a decision was made.

## 4. Rationale-inline

The "why" lives next to the "what", visually distinct but never physically separated.

## 5. Weighted

Explicit priority per entry: critical (violation = failure), standard, advisory.

## 6. Discoverable

Indexed by type, topic, and trigger condition; any entry findable in one lookup.

## 7. Trigger-scoped

States WHEN it applies ("before deploying", "when build fails"), not just what topic it covers.

## 8. Summary-first

First sentence is a standalone summary; detail follows; minimal at every layer.

## 9. Minimal prose, maximal signal

No filler, but never cut examples, edge cases, or trigger conditions.

## 10. Example-anchored

Non-trivial rules include one positive and one negative example.

## 11. State-separated

Permanent knowledge and ephemeral status live in separate files with distinct naming.

## 12. Owned

Every entry has an accountable maintainer (person or process) and a deletion trigger.

## 13. Conflict-resolved

Explicit precedence: specificity wins, recency breaks ties.

## 14. Token-budget-aware

Critical knowledge always loaded; reference knowledge retrieved on demand.

## 15. Structurally placed

Every file has exactly one place to live. Folder structure is predictable and uniform. No loose files — everything belongs to a category.

**Structural rules:**
- Top-level folders are categories: design/, skills/, principles/, reviews/, templates/, reference/
- Every skill is a folder, never a loose file
- Skill folder root has ONLY: SKILL.md (entrypoint) + eval.md (test cases)
- Reference material goes in reference/ subfolder within the skill
- Data schemas go in schemas/ subfolder within the skill
- No file exists without a folder that gives it meaning

---

## Review Notes

### Dropped from original draft

| Principle | Reason |
|-----------|--------|
| Self-contained | Merged into #1 + #2; conflicts with no-duplication |
| Tagged/indexed | Merged into #6 (tagging is just the mechanism for discoverability) |
| Separates what from why | Reversed into #4; separation damages comprehension |
| Audience-aware | Too vague; replaced by concrete principles #7, #8, #14 |
| Current | Replaced by #12 (ownership); "last verified" metadata itself goes stale |

### Added

| Principle | Why |
|-----------|-----|
| Weighted (#5) | Agents can't distinguish "violation = data loss" from "style preference" without explicit priority |
| Trigger-scoped (#7) | "Read this BEFORE doing X" is more useful than topic labels for retrieval |
| Example-anchored (#10) | Agents pattern-match from examples far better than abstract rules |
| Owned (#12) | Unowned knowledge rots regardless of other principles |
| Conflict-resolved (#13) | When two entries contradict, agents need a declared resolution mechanism |
| Token-budget-aware (#14) | Context windows are finite; critical vs. reference knowledge must be distinguished |
| Structurally placed (#15) | Without structural rules, knowledge bases accumulate loose files with no home. Every file must have exactly one correct location determinable from the folder convention alone. |

### Key Tensions Resolved

- **Self-contained vs. no-duplication**: resolved by "single source with pointers" — entries are understandable standalone but link rather than restate
- **Minimal vs. actionable**: resolved by "minimal prose, maximal signal" — cut filler, never cut examples or trigger conditions
- **Categorization breaks on cross-cutting knowledge**: resolved by trigger-scoping (when to read) rather than rigid topic taxonomy
- **Flat vs. nested**: resolved by "structurally placed" — uniform convention (skill = folder, SKILL.md + eval.md at root, reference/ for details) eliminates ambiguity about where any file belongs
