# P7 Required Input Behaviors

Companion to `p07-text-input.md`. This file defines the P7 interaction contract only; exact HTML attributes, font sizing, `visualViewport` handling, scroll margins, and CSS values are owned by the mobile skill.

## Required Behaviors

Every P7 game must provide:

1. **Submit by Enter and button.** The input's Enter key and Submit button both call the same guarded submit handler from `p07-text-input.md`.
2. **Keyboard dismissal on submit.** Blur the active input before awaited feedback begins.
3. **Auto-focus and scroll into view.** On tap/focus and round transition, the input remains reachable above the virtual keyboard. Implement with the mobile skill's current keyboard/viewport rules.
4. **Auto-growing input width.** The input starts compact, grows with typed content, caps at a readable maximum, and shrinks on delete. Use the mobile skill for actual sizing values.
5. **Clear transient visual state while editing.** Remove `.input-correct` / `.input-wrong` when the student changes the value.
6. **Numeric filtering only when the game is numeric.** Do not filter free-text or subjective responses.

## Interaction-Owned Checks

- [ ] Enter calls `preventDefault()` and then the same submit handler as the button.
- [ ] The submit handler starts with the three universal guards.
- [ ] Empty values return without telemetry, score mutation, or feedback.
- [ ] Transient `.input-correct` / `.input-wrong` classes clear when the value changes or a new round renders.
- [ ] The value passed to `recordAttempt(...)` is exactly what the student submitted after game-specific normalization.

## Mobile-Owned Checks

Verify these in `skills/mobile/SKILL.md`, not here:

- input attributes (`type`, `inputmode`, autocomplete, pattern)
- iOS zoom prevention / font sizing
- `visualViewport` resize handling
- scroll-into-view block choice and user-scroll guard
- input width values and CSS transitions
- touch target and spacing values

Do not copy old P7 CSS or viewport snippets into this file. If a P7 game needs concrete layout code, load the mobile skill and implement the current mobile contract there.
