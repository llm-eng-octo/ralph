# UI/UX Audit Log

**Created:** March 23, 2026
**Maintained by:** UI/UX Slot (mandatory active slot — see CLAUDE.md Rule 16)

---

## Purpose

Track visual and interaction quality audits of generated games. Each entry records: what was audited, what issues were found, how they were classified, and what action was taken.

**Issue classification:**
- **Gen prompt rule** → add to CDN_CONSTRAINTS_BLOCK or VISUAL_CONSTRAINTS_BLOCK in lib/prompts.js
- **Spec addition** → add visual requirement to game spec (docs/education/trig-session.md etc.)
- **CDN constraint** → add T1 check in lib/validate-static.js

---

## Active Audit Target

**Game:** name-the-sides (Build #557)
**Status:** COMPLETE — 2026-03-23

---

## Completed Audits

| Date | Game | Build | Issues Found | Actions Taken |
|------|------|-------|-------------|---------------|
| 2026-03-23 | name-the-sides | #557 | 10 issues (5a, 3b, 2 low) | 5 gen prompt rules proposed; 3 spec additions documented; rebuild needed |
| 2026-03-23 | which-ratio | #560 | 8 issues (4a, 2b, 2c) | 4 gen prompt rules proposed; 2 spec additions documented; 2 CDN constraints noted |

---

## name-the-sides Audit (2026-03-23)

See [warehouse/templates/name-the-sides/ui-ux.md](../../warehouse/templates/name-the-sides/ui-ux.md)

---

## which-ratio Audit (2026-03-23)

See [warehouse/templates/which-ratio/ui-ux.md](../../warehouse/templates/which-ratio/ui-ux.md)

---

## Known Visual Issue Patterns

| Pattern | First seen | Also seen in | Classification | Status |
|---------|-----------|-------------|---------------|--------|
| CSS stylesheet stripped during JS-only surgical fix | which-ratio #560 | name-the-sides #557 | (a) gen prompt rule + T1 check | Proposed |
| Dynamic feedback elements missing aria-live | which-ratio #560 | name-the-sides #557 | (a) gen prompt rule | Proposed |
| Option buttons missing explicit 44px touch targets | which-ratio #560 | name-the-sides #557 | (a) gen prompt rule | Proposed |
| SVG muted lines using low-contrast colour (#94a3b8) | which-ratio #560 | — | (a) gen prompt rule | Proposed |
| Results screen is static-position (not overlay) | name-the-sides #557 | — | (a) gen prompt rule | Proposed |
| progressBar.update() emits Invalid count value error | name-the-sides #557 | — | (a) gen prompt rule | Proposed |
| CSS-trick triangle (border-based) breaks without CSS | name-the-sides #557 | — | (a) gen prompt rule | Proposed — prefer SVG |
| Two-triangle layout on mobile causes excessive scroll | name-the-sides #557 | — | (b) spec addition | Proposed |

---

## Gen Prompt Rules Added via UI/UX Slot

*(Track which CDN_CONSTRAINTS_BLOCK rules originated from UI/UX audits)*

| Rule | Source audit | Confirmed also in | Date | Status |
|------|-------------|------------------|------|--------|
| Never strip CSS stylesheet | which-ratio #560 | name-the-sides #557 | 2026-03-23 | Proposed — not yet in prompts.js |
| Explicit 44px touch targets on all buttons | which-ratio #560 | name-the-sides #557 | 2026-03-23 | Proposed — not yet in prompts.js |
| ARIA live regions on dynamic feedback | which-ratio #560 | name-the-sides #557 | 2026-03-23 | Proposed — not yet in prompts.js |
| SVG diagram contrast + fallback dimensions | which-ratio #560 | — | 2026-03-23 | Proposed — not yet in prompts.js |
| Results screen must be position:fixed full-screen overlay | name-the-sides #557 | — | 2026-03-23 | Proposed — not yet in prompts.js |
| progressBar.update() completed arg must be >= 0 | name-the-sides #557 | — | 2026-03-23 | Proposed — not yet in prompts.js |
