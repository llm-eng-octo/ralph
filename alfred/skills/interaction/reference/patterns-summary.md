# 16 Interaction Patterns — Quick Reference

| # | Pattern | What happens | Events | Step type |
|---|---------|-------------|--------|-----------|
| **P1** | **Tap-Select (Single)** | Tap one option → immediate eval → round done | `click` | Single |
| **P2** | **Tap-Select (Sequential Chain)** | Tap tiles in order to build a chain; wrong tap resets chain | `click` | Multi |
| **P3** | **Tap-Select (Two-Phase Match)** | Tap item A (left), then tap matching item B (right); two taps = one eval | `click` | Multi |
| **P4** | **Tap + Swipe** | Tap to select piece, swipe to slide it in a direction | `pointerdown` + `pointerup` | Multi |
| **P5** | **Continuous Drag (Path)** | Press and drag across grid cells to draw a path; backtrack by dragging backwards | `pointerdown` + `pointermove` + `pointerup` | Multi |
| **P6** | **Drag-and-Drop (Pick & Place)** | Pick up item, drag it, drop into a target zone; snap-back on miss | `pointerdown` + `pointermove` + `pointerup` | Multi |
| **P7** | **Text/Number Input** | Type answer + Enter/Submit → immediate eval → round done | `keydown` + `click` | Single |
| **P8** | **Click-to-Toggle** | Click cells to flip on/off; board auto-validates against constraints | `click` | Multi |
| **P9** | **Stepper (+/-)** | Tap +/- buttons to adjust values, then submit a typed answer | `click` | Multi |
| **P10** | **Multi-Select + Submit** | Toggle multiple items on/off, then press Submit to evaluate all at once | `click` + submit | Multi |
| **P11** | **Same-Grid Pair Selection** | Tap two items from the same pool that form a valid pair (e.g., sum to target) | `click` | Multi |
| **P12** | **Tap-to-Assign (Palette)** | Pick a colour/category from palette, then tap items to paint them | `click` | Multi |
| **P13** | **Directional Drag (Constrained Axis)** | Drag blocks along their locked axis (horizontal OR vertical); Rush Hour style | `pointerdown` + `pointermove` + `pointerup` | Multi |
| **P14** | **Edge/Segment Toggle** | Tap between dots to toggle line segments on/off; form a closed loop | `click` | Multi |
| **P15** | **Cell Select → Number Picker** | Tap cell → popup picker appears → tap number to place it; tap again to clear | `click` | Multi |
| **P16** | **Sequence Replay** | Watch elements flash in order (observe), then tap them back in same order (reproduce) | `click` | Multi |

---

## Modifiers

| Modifier | What it does | Used by |
|----------|-------------|---------|
| **Observe-then-Respond** | Memorize/watch phase before interaction begins | Visual Memory, Simon Says, Associations, Disappearing Numbers, Face Memory, Keep Track, Listen and Add, Totals in a Flash, Word Pairs, Matrix Memory |
| **Multi-Step MCQ** | P1 used N times within one round as sub-steps | Expression Completer, Sequence Builder, Aided Game, Two-Digit Doubles Aided |
