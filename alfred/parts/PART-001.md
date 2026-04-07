### PART-001: HTML Shell
**Purpose:** Single-file HTML structure for every game.
**Structure:** `<!DOCTYPE html>` with `<style>` in `<head>`, game HTML in `<body>`, single `<script>` at end of `<body>`.
**Key rules:**
- All CSS in one `<style>` block, all JS in one `<script>` block
- No external CSS/JS files (except CDN package scripts from PART-002)
- Package scripts go in `<body>` before game scripts (see PART-030 for order)
