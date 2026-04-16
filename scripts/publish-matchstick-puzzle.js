#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const CORE_API_URL = process.env.CORE_API_URL;
const CORE_API_TOKEN = process.env.CORE_API_TOKEN;

if (!CORE_API_URL || !CORE_API_TOKEN) {
  console.error('Missing CORE_API_URL or CORE_API_TOKEN in .env');
  process.exit(1);
}

const htmlFile = path.join(__dirname, '..', 'games', 'matchstick-puzzle', 'index.html');
if (!fs.existsSync(htmlFile)) {
  console.error('HTML not found:', htmlFile);
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
const version = '1.0.0-b' + Date.now();

// Infer inputSchema from fallbackContent
function inferSchema(obj) {
  if (Array.isArray(obj)) {
    return { type: 'array', items: obj.length > 0 ? inferSchema(obj[0]) : {} };
  }
  if (obj !== null && typeof obj === 'object') {
    const properties = {};
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = inferSchema(v);
    }
    return { type: 'object', properties, required: Object.keys(properties) };
  }
  return { type: typeof obj };
}

// Extract fallbackContent from HTML
let fallbackContent = null;
const match = htmlContent.match(/(?:const|var|let)\s+fallbackContent\s*=\s*(\{[\s\S]*?\});/);
if (match) {
  try {
    fallbackContent = new Function(`return ${match[1]}`)();
    console.log('Extracted fallbackContent:', fallbackContent.rounds.length, 'rounds');
  } catch (e) {
    console.warn('Could not parse fallbackContent:', e.message);
  }
}

const inputSchema = fallbackContent ? inferSchema(fallbackContent) : { type: 'object', properties: {}, required: [] };

(async () => {
  // 1. Register game
  console.log('Registering matchstick-puzzle with version:', version);
  const res = await fetch(`${CORE_API_URL}/api/games/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CORE_API_TOKEN}`,
    },
    body: JSON.stringify({
      name: 'Matchstick Puzzle',
      version,
      metadata: {
        title: 'Matchstick Puzzle — Seven Segment Challenge',
        description: 'Move matchsticks between segments of a seven-segment display to transform one number into another. Limited moves per round with increasing difficulty.',
        concepts: ['number-sense', 'spatial-reasoning', 'logic', 'problem-solving'],
        difficulty: 'medium',
        estimatedTime: 300,
        minGrade: 2,
        maxGrade: 8,
        type: 'practice',
      },
      capabilities: { tracks: ['accuracy', 'time', 'stars'], provides: ['score', 'stars'] },
      inputSchema,
      artifactContent: htmlContent,
      publishedBy: 'ralph-pipeline',
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error('Registration FAILED:', res.status, JSON.stringify(body, null, 2));
    process.exit(1);
  }

  const publishedGameId = body.data?.id;
  const artifactUrl = body.data?.artifactUrl;
  console.log('SUCCESS: Game registered');
  console.log('  Game ID:', publishedGameId);
  console.log('  Artifact URL:', artifactUrl);

  // 2. Create default content set from fallbackContent
  let contentSetId = null;
  if (fallbackContent) {
    const csRes = await fetch(`${CORE_API_URL}/api/content-sets/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CORE_API_TOKEN}`,
      },
      body: JSON.stringify({
        gameId: publishedGameId,
        name: 'Matchstick Puzzle — Default',
        description: 'Default content set with 5 rounds of increasing difficulty. Single-digit and multi-digit matchstick puzzles using seven-segment displays.',
        grade: 2,
        difficulty: 'medium',
        concepts: ['number-sense', 'spatial-reasoning', 'logic', 'problem-solving'],
        content: fallbackContent,
        createdBy: 'ralph-pipeline',
      }),
    });

    if (csRes.ok) {
      const csBody = await csRes.json();
      contentSetId = csBody.data?.id;
      console.log('  Content set created:', contentSetId);
    } else {
      const errBody = await csRes.text();
      console.error('  Content set FAILED:', csRes.status, errBody.slice(0, 300));
    }
  }

  // 3. Print game links
  console.log('');
  console.log('=== MATHAI GAME LINKS ===');
  if (contentSetId) {
    console.log(`https://learn.mathai.ai/game/${publishedGameId}/${contentSetId}`);
  } else {
    console.log(`https://learn.mathai.ai/game/${publishedGameId}`);
  }
})();
