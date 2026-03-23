# stats-which-measure — Human Decision Dashboard

| Field | Value |
|-------|-------|
| **Status** | 📝 Spec ready |
| **Session** | Statistics Session 2 — Game 5 of 5 |
| **Bloom Level** | L4 Analyze |
| **Interaction** | MCQ — 3 options each with justification text |
| **Spec written** | 2026-03-23 |
| **Build #** | — |
| **Iterations** | — |
| **Build time** | — |
| **UI/UX audit** | ❌ Pending |
| **Next action** | Human review before queuing — queue last in stats session (L4 cap) |

---

## Spec summary

6 rounds, 3 lives, 60-second timer per round. Learner analyzes a real-world data scenario and chooses the most appropriate measure of central tendency (Mean / Median / Mode). Each option button displays both the measure name and a brief justification — learner must evaluate competing reasoning, not just recall a label. Wrong answer or timeout deducts a life immediately (no worked-example-on-wrong).

**Round distribution (fixed order, no shuffle):**
- Round 1: Salaries [18k–120k] → **Median** (CEO outlier skews mean)
- Round 2: Shoe sizes [38–42] → **Mode** (peak demand for discrete size)
- Round 3: Test scores [45–95, symmetric] → **Mean** (no outliers, symmetric)
- Round 4: House prices [4.2L–18.9L] → **Median** (luxury penthouse outlier)
- Round 5: Favourite colours (categorical) → **Mode** (cannot average category names)
- Round 6: Daily rainfall [0,0,0…45mm] → **Median** (zeros + extreme storm spike)

**Misconception coverage:**
- `MC-outlier-ignore` — rounds 1, 4, 6 (fails to notice extreme values that distort mean)
- `MC-mode-discrete` — round 2 (misses that mode identifies peak demand for discrete data)
- `MC-symmetric-median` — round 3 (picks median even for symmetric data)
- `MC-categorical-mean` — round 5 (tries to average nominal category labels)

**NCERT alignment:** Class 10 Ch 14 §14.4 (relationship between Mean, Median, Mode — appropriate use by context). 5 Exa research sources embedded in spec.

---

## Build history

| Build # | Status | Iterations | Cost | Notes |
|---------|--------|-----------|------|-------|
| — | — | — | — | Not yet queued |

---

## Action required

Human review before queuing. **Prerequisite:** stats-identify-class → stats-mean-direct → stats-median → stats-mode must all be approved first (session ordering rule). This is the L4 cap game — queue last in the stats session.
