# stats-mode — Game Dashboard

## Status

| Field | Value |
|---|---|
| **Status** | spec-written |
| **Session** | Statistics Session 2 — Game 4 of 4 |
| **Bloom Level** | L3 Apply |
| **Interaction** | MCQ (4 options) — find mode of ungrouped data or grouped frequency table |
| **Rounds** | 9 (3 easy / 3 medium / 3 hard) |
| **Lives** | 3 |
| **Timer** | 45 seconds per round |
| **Builds** | None yet |
| **Last approved build** | — |
| **Spec written** | 2026-03-23 |
| **Spec author** | Education slot agent |

---

## Session Context

**Predecessor:** `stats-median` (L3 — find the median of ungrouped data)
**This game:** `stats-mode` (L3 — find the mode of ungrouped and grouped data)
**Successor:** (none — terminal game of Statistics Session 2)

---

## Pedagogical Rationale

This game follows NCERT Class 10 Chapter 13 Section 13.3 (Mode of Grouped Data). Students who can find the mean (Game 2) and median (Game 3) now apply the mode algorithm. Mode = the value that appears most frequently.

Three difficulty tiers:

- **Easy (R1–R3):** Small ungrouped datasets (n=7–9) with a single dominant mode. Distractors target mean confusion (computing the average instead of counting frequencies) and maximum/minimum value errors. R3 has mode ≠ median ≠ mean — all three distractors are distinct values, making it the cleanest easy round.
- **Medium (R4–R6):** Bimodal datasets (R4, R5) requiring students to report BOTH modes, and a tricky single-mode round (R6) where the median coincides with the 2nd-most-frequent value — a very compelling distractor. R4 and R5 directly target the M-multiple-mode misconception documented in Enisoğlu (2014): "forming incomplete data set" where students report only one of two equal-frequency values.
- **Hard (R7–R9):** Grouped frequency table data requiring the NCERT empirical formula: `Mode = L + [(f₁−f₀)/(2f₁−f₀−f₂)] × h`. All three hard rounds use NCERT Chapter 13 exercise data. R7 is the NCERT Example 6 marks distribution (modal class at end of table — f₂=0). R8 is NCERT Exercise 13.2 Q1 (hospital patient ages). R9 is NCERT Exercise 13.2 Q2 (electrical component lifetimes). Distractors in hard rounds target formula substitution errors (swapping f₀ and f₂, using only the lower limit, using the modal class midpoint).

**Key difference from stats-median:** The display layer must switch between two modes — number list (ungrouped, R1–R6) and HTML frequency table (grouped, R7–R9). `loadQuestion()` must toggle `#dataset-display` and `#frequency-table-container` based on `round.dataType`. This is spec Rule 16 in the anti-pattern checklist.

Primary misconceptions targeted:
- **M-mean-confusion** — student computes arithmetic mean instead of counting frequencies (Enisoğlu 2014 "averaging algorithm")
- **M-median-confusion** — student picks the middle-positioned value instead of the most frequent (IASE SERJ 2023 "inconsistent routine")
- **M-multiple-mode** — student reports only one mode in a bimodal dataset (Enisoğlu 2014 "incomplete data set")
- **M-formula-error** — for grouped data, student substitutes f₀ and f₂ incorrectly (NCERT Ch 13 §13.3)
- **M-freq-extremum** — student picks the maximum or minimum value instead of the most frequent

Research sources:
- NCERT Class 10 Ch 13 §13.3 (ncert.nic.in/textbook/pdf/jemh113.pdf, 2024-25) — canonical mode formula, Examples 5 & 6, Exercises 13.2 Q1 & Q2
- IASE SERJ — "Undergraduate students' inconsistent routines when engaging in statistical reasoning concerning mode" (iase-pub.org, 2023) — "disconnection between routine and endorsed narrative" explains M-median-confusion
- Enisoğlu (2014) — "Seventh grade students' errors regarding mean, median and mode" (METU) — "inappropriate averaging algorithm" (M-mean-confusion) and "incomplete data set" (M-multiple-mode)

---

## Build Queue Notes

**Before queuing first build:**
1. Create template dir on server and deploy spec: `sudo mkdir -p /opt/ralph/warehouse/templates/stats-mode && scp games/stats-mode/spec.md ... /opt/ralph/warehouse/templates/stats-mode/spec.md`
2. Check DB for running builds before restart
3. Run local verification after first build completes (download GCP HTML, run diagnostic.js)

**Expected build behaviour:**
- Easy rounds (R1–R3): Straightforward frequency counting. LLM should generate cleanly. Verify that `dataset-display` is visible and contains the number list.
- Medium rounds (R4–R5): Bimodal correctAnswer is a STRING with format `'X and Y'`. Verify string comparison in validation: `'3 and 6' === '3 and 6'`. The button's `data-value` must be exactly `'3 and 6'` — not `'3 And 6'` or `'3, 6'`.
- Hard rounds (R7–R9): Frequency table must render as `<table>` inside `#frequency-table-container`. Test TC-016 uses `__ralph.jumpToRound(7)` to verify. Verify `#dataset-display` is hidden during grouped rounds.
- Feedback strings in hard rounds contain math formula notation (Unicode minus, times sign) — verify they render correctly in the DOM without encoding issues.

---

## RCA Log

No builds yet.

---

## Next Action

Queue first build after confirming spec is deployed to server warehouse.
