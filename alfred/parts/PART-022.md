### PART-022: Game Buttons
**Purpose:** Standard button patterns for game interactions.
**Buttons:** Reset (always visible), Submit (after interaction), Retry (after incorrect), Next (after correct/round complete)
**Key rules:**
- Mutual exclusivity: only one action button visible at a time (Submit OR Retry OR Next)
- Reset is separate, always visible during gameplay
- Use `.game-btn` class with `.btn-primary` (green) or `.btn-secondary` (blue/gray)
