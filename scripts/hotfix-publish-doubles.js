#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs');

const CORE_API_URL = process.env.CORE_API_URL;
const CORE_API_TOKEN = process.env.CORE_API_TOKEN;
const htmlContent = fs.readFileSync('data/games/doubles/builds/28/index.html', 'utf-8');
const inputSchema = JSON.parse(fs.readFileSync('data/games/doubles/builds/28/inputSchema.json', 'utf-8'));
const newVersion = '1.0.1-b' + Date.now();

(async () => {
  // 1. Register new game
  console.log('Registering game with version:', newVersion);
  const res = await fetch(`${CORE_API_URL}/api/games/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CORE_API_TOKEN}`,
    },
    body: JSON.stringify({
      name: 'Doubles',
      version: newVersion,
      metadata: {
        title: 'Doubles — Find the Chain of Doubles',
        description: 'Find chain of doubles in 3x3 grid',
        concepts: ['doubles', 'multiplication'],
        difficulty: 'medium',
        estimatedTime: 300,
        minGrade: 1,
        maxGrade: 12,
        type: 'practice',
      },
      capabilities: { tracks: ['accuracy', 'time', 'stars'], provides: ['score', 'stars'] },
      inputSchema,
      artifactContent: htmlContent,
      publishedBy: 'ralph-pipeline-hotfix',
    }),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error('Registration FAILED:', res.status, JSON.stringify(body));
    process.exit(1);
  }

  const publishedGameId = body.data?.id;
  const artifactUrl = body.data?.artifactUrl;
  console.log('SUCCESS: Game registered');
  console.log('  Game ID:', publishedGameId);
  console.log('  Artifact URL:', artifactUrl);

  // 2. Create content sets from existing files
  const contentFiles = [
    { file: 'data/games/doubles/builds/28/content-1-easy.json', name: 'Starter Doubles — Small Numbers', difficulty: 'easy', grade: 1 },
    { file: 'data/games/doubles/builds/28/content-2-easy.json', name: 'Growing Doubles — Medium Numbers', difficulty: 'easy', grade: 2 },
    { file: 'data/games/doubles/builds/28/content-3-medium.json', name: 'Challenge Doubles — Larger Chains', difficulty: 'medium', grade: 3 },
    { file: 'data/games/doubles/builds/28/content-4-hard.json', name: 'Advanced Doubles — High Numbers', difficulty: 'hard', grade: 4 },
    { file: 'data/games/doubles/builds/28/content-5-hard.json', name: 'Expert Doubles — Mixed Start Points', difficulty: 'hard', grade: 5 },
  ];

  const contentSets = [];
  for (const cf of contentFiles) {
    if (!fs.existsSync(cf.file)) {
      console.warn('  Skipping missing file:', cf.file);
      continue;
    }
    const content = JSON.parse(fs.readFileSync(cf.file, 'utf-8'));

    const csRes = await fetch(`${CORE_API_URL}/api/content-sets/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CORE_API_TOKEN}`,
      },
      body: JSON.stringify({
        gameId: publishedGameId,
        name: cf.name,
        description: `Auto-generated: ${cf.name}`,
        grade: cf.grade,
        difficulty: cf.difficulty,
        concepts: ['doubles', 'multiplication'],
        content,
        createdBy: 'ralph-pipeline-hotfix',
      }),
    });

    if (csRes.ok) {
      const csBody = await csRes.json();
      const csId = csBody.data?.id;
      console.log('  Content set created:', cf.name, '→', csId);
      contentSets.push({ id: csId, name: cf.name, difficulty: cf.difficulty, grade: cf.grade });
    } else {
      const errBody = await csRes.text();
      console.error('  Content set FAILED:', cf.name, '→', csRes.status, errBody.slice(0, 200));
    }
  }

  // 3. Print game links
  console.log('');
  console.log('=== GAME LINKS ===');
  const mediumCs = contentSets.find((cs) => cs.difficulty === 'medium');
  const defaultCs = mediumCs || contentSets[0];
  if (defaultCs) {
    console.log('Default:', `https://learn.mathai.ai/game/${publishedGameId}/${defaultCs.id}`);
  }
  for (const cs of contentSets) {
    console.log(`${cs.name}: https://learn.mathai.ai/game/${publishedGameId}/${cs.id}`);
  }
})();
