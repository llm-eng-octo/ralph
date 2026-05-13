# Interaction Validator Map

Use this file only when a build/review failure cites a validator ID or when checking docs drift against `alfred/scripts/validate-static.js`. Every rule cited in `SKILL.md`, `state-and-guards.md`, or per-pattern files should appear below with its live status.

## P6 Drag-and-Drop validators

| Rule id | What it checks | Status |
|---|---|---|
| `GEN-DND-KIT` | P6 games use `@dnd-kit/dom` — hand-rolled `pointerdown`/`pointermove`/`pointerup` drag sensors are rejected. | LIVE |
| `GEN-DND-MOVE-ELEMENT` | The element is actually reparented to the drop zone on `dragend` (not just a CSS class swap). | LIVE |
| `GEN-DND-SOURCE-FROM-STATE` | Source origin in `dragend` is read from a game-controlled `locations` map, never inferred from `parentElement`/`closest`. | LIVE |
| `GEN-DND-DESTROY-PER-ROUND` | Previous-round DnD instances (manager, draggables, droppables) are destroyed before new ones are created. | LIVE |
| `GEN-DND-DRAGSTART-GUARD` | `manager.monitor` `dragstart` handler rejects the drag when any of the three universal guards fail (`isActive`, `isProcessing`, `gameEnded`). | LIVE |
| `GEN-DND-BANK-COLLAPSE-CSS` | Bank slots collapse via `display: none`, not `visibility: hidden`, so remaining tags re-center. | LIVE |
| `GEN-DND-BANK-COLLAPSE-TOGGLE` | The bank slot collapse class is toggled on placement and removed on return. | LIVE |
| `GEN-DND-SENSOR-DISTANCE` | `PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 3 })] })` is used; default 250ms hold-delay is overridden. | LIVE |
| `GEN-DND-SENSOR-NO-DELAY` | No `PointerActivationConstraints.Delay` constraint is configured. | LIVE |
| `GEN-DND-SENSOR-SUBPATH` | `PointerSensor` imported from `@dnd-kit/dom` root, never from a `/sensors` sub-path (which 404s on esm.sh). | LIVE |

## Feedback-audio validators relevant to interaction handlers

| Rule id | What it checks | Status |
|---|---|---|
| `GEN-FEEDBACK-TTS-AWAIT` | Submit-handler `playDynamicFeedback(...)` is **awaited**, not fire-and-forget. Single canonical rule — interaction skill defers to feedback skill on this. | LIVE |
| `GEN-ROUND-BOUNDARY-STOP` | Round-boundary handlers stop sound + stream before mutation. | LIVE |
| `GEN-PHASE-SEQUENCE` | Cleanup / phase assignment / `syncDOMState()` ordering on round / end-game transitions. | LIVE |

Full feedback validator list lives in [`alfred/skills/feedback/reference/validator-map.md`](../../feedback/reference/validator-map.md).

## Phantom / retired

| Rule id | Status | Notes |
|---|---|---|
| `L-VI-002` | **NOT A VALIDATOR** | Historical lesson tag from `docs/lessons-learned.md` (2026-04-23) advocating fire-and-forget TTS. Superseded by the feedback skill audit (2026-05-12) — canonical rule is now AWAIT, enforced by `GEN-FEEDBACK-TTS-AWAIT`. Do not cite `L-VI-002` in new docs. |

## Rules

- **Validator IDs are surface area.** If a doc cites an ID that does not appear in this table, the ID is either retired, never shipped, or fabricated. Treat it as the latter unless the table proves otherwise.
- **When adding a new validator** to `alfred/scripts/validate-static.js`, add a row here in the same change.
- **When retiring a validator**, mark it `RETIRED YYYY-MM` here; do not delete the row (so old docs that still cite it resolve to a clear status).
