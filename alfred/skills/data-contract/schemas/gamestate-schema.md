# gameState Schema

Per **PART-007** (Game State Object). See `parts/PART-007.md` for the full schema — required fields, conditional fields, types, initial values, and duration_data sub-schema.

## Alfred-specific additions (not in PART-007)

| Field | Why Alfred requires it |
|-------|----------------------|
| `correctAnswer` | Set each round in renderRound. Tests verify correct answers via this. Per GEN-CORRECT-ANSWER-EXPOSURE. |
| `streak` | Consecutive correct count for streak celebration. See feedback skill. |
| `consecutiveWrongs` | Consecutive wrong count for failure recovery (soften language at 3+). See feedback skill. |

## Key rules for game-building

- `gameId` MUST be the FIRST field in the object literal (per GEN-GAMEID).
- Expose as `window.gameState` — test harness, VisibilityTracker, and debugGame read it directly.
- All required fields per PART-007 MUST be present at init. Missing fields = contract violation.
