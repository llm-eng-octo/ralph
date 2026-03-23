# stats-which-measure — Human Decision Dashboard

| Field | Value |
|-------|-------|
| **Status** | 📝 Spec ready |
| **Session** | Statistics Session 2 — Game 5 of 5 |
| **Bloom Level** | L4 Analyze |
| **Interaction** | MCQ + Worked Example on Wrong |
| **Spec written** | 2026-03-23 |
| **Build #** | — |
| **Iterations** | — |
| **Build time** | — |
| **UI/UX audit** | ❌ Pending |
| **Next action** | Human approval needed to queue — stats-identify-class must be approved and built first (session ordering rule) |

---

## Spec summary

9 rounds, 3 lives, 30-second timer. Learner analyzes a real-world data scenario and chooses the most appropriate measure of central tendency (Mean / Median / Mode). On first wrong answer: worked-example panel expands explaining why that measure is wrong — no life deducted. On second wrong answer, Skip, or timeout: life deducted, advance.

**Round distribution:**
- Mean (3 rounds): symmetric exam scores (R1), bell-shaped heights (R5), symmetric temperature (R9)
- Median (3 rounds): CEO salary outlier (R3), luxury house prices (R6), open-ended class interval (R8)
- Mode (3 rounds): shoe size demand (R2), blood group survey (R4), favourite subject survey (R7)

**Misconception coverage:**
- `MC-always-use-mean` — rounds 2, 8 (defaults to mean for categorical/open-ended data)
- `MC-outlier-ignore` — rounds 3, 6 (fails to notice extreme values)
- `MC-categorical-mean` — rounds 4, 7 (tries to average nominal data)
- `MC-symmetric-median` — rounds 1, 5, 9 (picks median even for symmetric data)

**NCERT alignment:** Class 10 Ch 14 §14.4 (relationship between Mean, Median, Mode — appropriate use by context). 5 Exa research sources embedded in spec.

---

## Build history

| Build # | Status | Iterations | Cost | Notes |
|---------|--------|-----------|------|-------|
| — | — | — | — | Not yet queued |

---

## Action required

Human review before queuing. **Prerequisite:** stats-identify-class → stats-mean-direct → stats-median → stats-mode must all be approved first (session ordering rule). This is the L4 cap game — queue last in the stats session.
