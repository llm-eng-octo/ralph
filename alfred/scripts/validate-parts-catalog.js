#!/usr/bin/env node
// validate-parts-catalog.js — catalog-vs-disk consistency check.
//
// Asserts that every PART-NNN file in alfred/parts/ has a row in
// alfred/parts/README.md, and that every PART-NNN row in README points at a
// file that exists on disk. Catches the failure mode where someone adds a new
// PART file but forgets to register it in the catalog (or vice versa).
//
// Exit 0 when catalog ↔ disk match. Exit 1 with a diff when they don't.
//
// Usage:
//   node alfred/scripts/validate-parts-catalog.js

'use strict';

const fs = require('fs');
const path = require('path');

const PARTS_DIR = path.join(__dirname, '..', 'parts');
const CATALOG = path.join(PARTS_DIR, 'README.md');

function fail(msg, extra) {
  console.error('CATALOG DRIFT — ' + msg);
  if (extra && extra.length) {
    for (const line of extra) console.error('  ' + line);
  }
  process.exit(1);
}

if (!fs.existsSync(CATALOG)) {
  fail('alfred/parts/README.md is missing — the catalog is supposed to live here');
}

// Collect distinct PART-NNN identifiers from filenames.
// PART-NNN.md and PART-NNN-<short-name>.md collapse to the same identifier.
const onDisk = new Set();
for (const name of fs.readdirSync(PARTS_DIR)) {
  const m = name.match(/^(PART-\d+)(?:-[a-z][a-z0-9-]*)?\.md$/);
  if (m) onDisk.add(m[1]);
}

// Collect PART-NNN identifiers cited as table rows in README.md.
const catalogText = fs.readFileSync(CATALOG, 'utf8');
const inCatalog = new Set();
for (const m of catalogText.matchAll(/\[(PART-\d+)\]\(/g)) {
  inCatalog.add(m[1]);
}

const missingFromCatalog = [...onDisk].filter(p => !inCatalog.has(p)).sort();
const missingFromDisk = [...inCatalog].filter(p => !onDisk.has(p)).sort();

if (missingFromCatalog.length === 0 && missingFromDisk.length === 0) {
  console.log('parts/README.md catalog matches disk (' + onDisk.size + ' PARTs).');
  process.exit(0);
}

const lines = [];
if (missingFromCatalog.length) {
  lines.push('On disk but NOT in catalog (add a row to alfred/parts/README.md):');
  for (const p of missingFromCatalog) lines.push('  + ' + p);
}
if (missingFromDisk.length) {
  lines.push('In catalog but NOT on disk (delete the row, or restore the file):');
  for (const p of missingFromDisk) lines.push('  - ' + p);
}
fail('alfred/parts/README.md is out of sync with alfred/parts/', lines);
