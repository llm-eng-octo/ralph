### PART-024: TransitionScreen Component (v2)

**Source of truth:** `warehouse/parts/PART-024-transition-screen.md`

**Purpose:** Welcome, round intro, level / section intro, motivation, victory, game over, stars collected — every between-phase screen except Preview.

**API:** `new TransitionScreenComponent({ autoInject: true })` → `.show({ icons, stars, title, subtitle, buttons, duration, persist, content, styles, onMounted })` → `.hide()`.

Injects into `#mathai-transition-slot` (sibling of `#gameContent` inside `.game-stack`).

**Invariants:**
- **Every transition MUST play audio** — no silent transitions. Silent = not mathai-equivalent. Fire audio via the `onMounted` callback: `onMounted: () => FeedbackManager.sound.play('<id>', { sticker })`. Approved IDs: `vo_game_start`, `sound_game_complete`, `sound_game_over`, `vo_level_start_N`, `vo_motivation`, `sound_correct`, etc.
- **Audio awaited before dependent state change.** For Victory / Game Over: `await` the `transitionScreen.show(...)` Promise (resolves when buttons tap or `duration` elapses). The audio started by `onMounted` plays in parallel; if a button click should stop it, call `FeedbackManager.sound.stopAll()` in the click handler.
- **`show()` takes ONE options-object argument.** Never a string title as the first arg (GEN-TRANSITION-API).
- **`icons[]` accepts emoji strings only** — never SVG / HTML / path markup (GEN-TRANSITION-ICONS).
- **Button labels come from `pre-generation/screens.md`.** Never invent buttons (e.g. an `Exit` button the plan didn't list). Count, labels, order match the screen's Elements table.
- **Results / Game Over content mounts here, not in a separate `#results-screen` div.** Pass `content: metricsHTML, persist: true, buttons: [...]`. Do NOT create a top-level results overlay.
- **No `duration` + `buttons` on the same screen.** Use one or the other.
- **`voGameStartPlayed` guard** prevents duplicate Welcome VO when restart skips preview + welcome.

**ScreenLayout requirement:** `ScreenLayout.inject({ slots: { ..., transitionScreen: true } })` or `sections.transitionScreen: true` — slot must exist.

**Typical patterns:** `auto-dismiss` (round intro, stars collected) → `await FeedbackManager.sound.play(...); ts.hide();`. `tap-dismiss` (welcome, motivation, victory, game over) → button click handler calls `ts.hide()`.

See `warehouse/parts/PART-024-transition-screen.md` for full detail.
