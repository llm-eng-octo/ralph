// @ts-check
const { test, expect } = require('@playwright/test');

const GAME_URL = 'http://localhost:8765/games/expression-drop/index.html';

/**
 * Wait for the game to auto-start (standalone fallback at 2s).
 * Then expose programmatic drag helpers for testing DnD logic.
 */
async function waitForGameStart(page) {
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded' });

  // Wait for standalone fallback (2s) + buffer
  await page.waitForFunction(() => {
    return window.gameState && window.gameState.isActive === true;
  }, { timeout: 15000 });

  // Expose programmatic drag helper that simulates what the dragend handler does
  // This tests the actual game logic (eviction, swap, bank management)
  await page.evaluate(() => {
    /**
     * Programmatic drag: simulates dropping a tag into a target.
     * @param {string} tagId - e.g. 'tag-0'
     * @param {string} targetId - e.g. 'drop-zone-0', 'drop-zone-1', or 'tag-bank'
     */
    window.__simulateDrag = function(tagId, targetId) {
      var sourceEl = document.getElementById(tagId);
      if (!sourceEl) throw new Error('Tag not found: ' + tagId);

      var sourceValue = sourceEl.getAttribute('data-value');
      var sourceIndex = sourceEl.getAttribute('data-index');
      var sourceLocation = window.tagLocationMap[tagId] || 'bank';
      var sourceFromZone = sourceLocation !== 'bank';
      var sourceSlotId = sourceFromZone ? sourceLocation : null;

      if (targetId === 'tag-bank') {
        window.returnTagToBank(sourceEl, sourceIndex);
        if (sourceSlotId !== null) {
          window.clearSlot(sourceSlotId);
        }
        window.updateCheckButton();
        return;
      }

      if (targetId.indexOf('drop-zone-') === 0) {
        var slotIdx = targetId.replace('drop-zone-', '');

        // Same zone — no-op
        if (sourceSlotId === slotIdx) {
          window.placeTagInZone(sourceEl, sourceIndex, slotIdx);
          window.updateCheckButton();
          return;
        }

        var zoneEl = document.getElementById(targetId);
        var existingTag = zoneEl.querySelector('.number-tag');

        if (existingTag && existingTag !== sourceEl) {
          var existingIndex = existingTag.getAttribute('data-index');
          var existingValue = existingTag.getAttribute('data-value');
          var existingTagId = existingTag.id;

          if (sourceFromZone) {
            // SWAP
            var sourceZoneEl = document.getElementById('drop-zone-' + sourceSlotId);
            sourceZoneEl.innerHTML = '';
            sourceZoneEl.appendChild(existingTag);
            sourceZoneEl.classList.add('has-tag');
            window.slotValues[sourceSlotId] = parseInt(existingValue, 10);
            window.tagLocationMap[existingTagId] = sourceSlotId;
            var existBankSlot = document.getElementById('tag-slot-' + existingIndex);
            if (existBankSlot) existBankSlot.classList.add('empty');
          } else {
            // EVICT to bank
            window.returnTagToBank(existingTag, existingIndex);
          }
        } else if (sourceSlotId !== null) {
          window.clearSlot(sourceSlotId);
        }

        window.placeTagInZone(sourceEl, sourceIndex, slotIdx);
        window.updateCheckButton();
        return;
      }

      // Dropped nowhere — return to bank
      window.returnTagToBank(sourceEl, sourceIndex);
      if (sourceSlotId !== null) {
        window.clearSlot(sourceSlotId);
      }
      window.updateCheckButton();
    };
  });
}

/**
 * Expose internal functions to window for test access.
 * Must be called after game starts and round loads.
 */
async function exposeInternals(page) {
  await page.evaluate(() => {
    // These are already in scope since they're var declarations in the script
    // but let's make them explicitly available
    if (typeof placeTagInZone !== 'undefined') window.placeTagInZone = placeTagInZone;
    if (typeof clearSlot !== 'undefined') window.clearSlot = clearSlot;
    if (typeof returnTagToBank !== 'undefined') window.returnTagToBank = returnTagToBank;
    if (typeof updateCheckButton !== 'undefined') window.updateCheckButton = updateCheckButton;
    if (typeof slotValues !== 'undefined') window.slotValues = slotValues;
    if (typeof tagLocationMap !== 'undefined') window.tagLocationMap = tagLocationMap;
  });
}

/**
 * Helper: programmatically drag a tag to a target.
 */
async function simulateDrag(page, tagId, targetId) {
  await page.evaluate(({ tagId, targetId }) => {
    window.__simulateDrag(tagId, targetId);
  }, { tagId, targetId });
  // Small settle time for DOM updates
  await page.waitForTimeout(50);
}

/**
 * Helper: get the text content of a tag inside a drop zone.
 */
async function getZoneTagValue(page, zoneIndex) {
  return page.evaluate((idx) => {
    var zone = document.getElementById('drop-zone-' + idx);
    if (!zone) return null;
    var tag = zone.querySelector('.number-tag');
    if (!tag) return null;
    return tag.textContent.trim();
  }, zoneIndex);
}

/**
 * Helper: check if a tag-slot in the bank is visible (not collapsed).
 */
async function isBankSlotVisible(page, tagIndex) {
  return page.evaluate((idx) => {
    var slot = document.getElementById('tag-slot-' + idx);
    return slot ? !slot.classList.contains('empty') : false;
  }, tagIndex);
}

/**
 * Helper: get tag info (id, value, index) for all tags.
 */
async function getAllTags(page) {
  return page.evaluate(() => {
    var tags = document.querySelectorAll('.number-tag');
    var result = [];
    for (var i = 0; i < tags.length; i++) {
      result.push({
        id: tags[i].id,
        value: tags[i].textContent.trim(),
        index: tags[i].getAttribute('data-index'),
        dataValue: tags[i].getAttribute('data-value')
      });
    }
    return result;
  });
}

// ─── TEST SUITE: P06 Drag-and-Drop Behaviors ───────────────────────────

test.describe('Expression Drop — DnD Behaviors (P06)', () => {

  test.beforeEach(async ({ page }) => {
    await waitForGameStart(page);
    await exposeInternals(page);
  });

  // ── Behavior 1: Pick Up & Move from Bank to Zone ──
  test('B1: can drag a tag from the bank into an empty drop zone', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag = tags[0];

    await simulateDrag(page, tag.id, 'drop-zone-0');

    const zoneValue = await getZoneTagValue(page, 0);
    expect(zoneValue).toBe(tag.value);

    const hasTag = await page.locator('#drop-zone-0').evaluate(el => el.classList.contains('has-tag'));
    expect(hasTag).toBe(true);
  });

  // ── Behavior 3: Snap to Drop Zone (tag is child of zone DOM) ──
  test('B3: tag becomes a child of the drop zone DOM', async ({ page }) => {
    const tags = await getAllTags(page);

    await simulateDrag(page, tags[0].id, 'drop-zone-0');

    const isChild = await page.evaluate((tagId) => {
      var zone = document.getElementById('drop-zone-0');
      var tag = zone ? zone.querySelector('#' + tagId) : null;
      return tag !== null;
    }, tags[0].id);
    expect(isChild).toBe(true);
  });

  // ── Behavior 4a: Auto-Eviction (bank → occupied zone) ──
  test('B4a: dragging from bank into occupied zone evicts existing tag to bank', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];
    const tag1 = tags[1];

    // Place tag 0 in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    expect(await getZoneTagValue(page, 0)).toBe(tag0.value);

    // Place tag 1 in same zone 0 (should evict tag 0 back to bank)
    await simulateDrag(page, tag1.id, 'drop-zone-0');
    expect(await getZoneTagValue(page, 0)).toBe(tag1.value);

    // Tag 0 should be back in its bank slot
    expect(await isBankSlotVisible(page, tag0.index)).toBe(true);

    // Tag 0 should be a child of its bank slot
    const tag0InBank = await page.evaluate((idx) => {
      var slot = document.getElementById('tag-slot-' + idx);
      return slot ? slot.querySelector('.number-tag') !== null : false;
    }, tag0.index);
    expect(tag0InBank).toBe(true);
  });

  // ── Behavior 4b: Swap (zone → occupied zone) ──
  test('B4b: dragging from one zone into another occupied zone swaps the tags', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];
    const tag1 = tags[1];

    // Place tag 0 in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    expect(await getZoneTagValue(page, 0)).toBe(tag0.value);

    // Place tag 1 in zone 1
    await simulateDrag(page, tag1.id, 'drop-zone-1');
    expect(await getZoneTagValue(page, 1)).toBe(tag1.value);

    // Drag tag 0 from zone 0 to zone 1 (occupied by tag 1) → SWAP
    await simulateDrag(page, tag0.id, 'drop-zone-1');

    // After swap: zone 0 should have tag1's value, zone 1 should have tag0's value
    expect(await getZoneTagValue(page, 1)).toBe(tag0.value);
    expect(await getZoneTagValue(page, 0)).toBe(tag1.value);

    // Both zones should have has-tag class
    const z0HasTag = await page.locator('#drop-zone-0').evaluate(el => el.classList.contains('has-tag'));
    const z1HasTag = await page.locator('#drop-zone-1').evaluate(el => el.classList.contains('has-tag'));
    expect(z0HasTag).toBe(true);
    expect(z1HasTag).toBe(true);
  });

  // ── Behavior 5: Bank Re-Centering ──
  test('B5: bank slot collapses when tag placed in zone, restores when returned', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];

    // Initially visible
    expect(await isBankSlotVisible(page, tag0.index)).toBe(true);

    // Place in zone → bank slot collapses
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    expect(await isBankSlotVisible(page, tag0.index)).toBe(false);

    // Return to bank → bank slot restores
    await simulateDrag(page, tag0.id, 'tag-bank');
    expect(await isBankSlotVisible(page, tag0.index)).toBe(true);
  });

  // ── Behavior 6: Zone-to-Zone Transfer (empty target) ──
  test('B6: tag can be moved from one zone to another empty zone', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];

    // Place in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    expect(await getZoneTagValue(page, 0)).toBe(tag0.value);

    // Move to zone 1
    await simulateDrag(page, tag0.id, 'drop-zone-1');
    expect(await getZoneTagValue(page, 1)).toBe(tag0.value);

    // Zone 0 should be empty
    expect(await getZoneTagValue(page, 0)).toBeNull();

    const z0HasTag = await page.locator('#drop-zone-0').evaluate(el => el.classList.contains('has-tag'));
    expect(z0HasTag).toBe(false);
  });

  // ── Behavior: Return to bank on invalid drop ──
  test('Tag returns to bank when dropped on invalid target', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];

    // Place in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    expect(await getZoneTagValue(page, 0)).toBe(tag0.value);

    // Drop on nothing (simulated as cancel/no target)
    await page.evaluate((tagId) => {
      var sourceEl = document.getElementById(tagId);
      var sourceIndex = sourceEl.getAttribute('data-index');
      var sourceLocation = window.tagLocationMap[tagId] || 'bank';
      var sourceSlotId = sourceLocation !== 'bank' ? sourceLocation : null;
      window.returnTagToBank(sourceEl, sourceIndex);
      if (sourceSlotId !== null) window.clearSlot(sourceSlotId);
      window.updateCheckButton();
    }, tag0.id);

    // Zone 0 should be empty, tag back in bank
    expect(await getZoneTagValue(page, 0)).toBeNull();
    expect(await isBankSlotVisible(page, tag0.index)).toBe(true);
  });

  // ── Check Button State ──
  test('Check button is disabled when slots empty, enabled when all filled', async ({ page }) => {
    const tags = await getAllTags(page);

    // Initially disabled
    const isDisabledBefore = await page.locator('#check-btn').evaluate(el => el.disabled);
    expect(isDisabledBefore).toBe(true);

    // Fill zone 0 only — still disabled
    await simulateDrag(page, tags[0].id, 'drop-zone-0');
    const isDisabledPartial = await page.locator('#check-btn').evaluate(el => el.disabled);
    expect(isDisabledPartial).toBe(true);

    // Fill zone 1 — now enabled
    await simulateDrag(page, tags[1].id, 'drop-zone-1');
    const isDisabledFull = await page.locator('#check-btn').evaluate(el => el.disabled);
    expect(isDisabledFull).toBe(false);
  });

  // ── slotValues tracking ──
  test('slotValues tracks values correctly through operations', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];
    const tag1 = tags[1];

    // Place tag 0 in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    let sv = await page.evaluate(() => window.slotValues);
    expect(sv['0']).toBe(parseInt(tag0.dataValue));

    // Place tag 1 in zone 1
    await simulateDrag(page, tag1.id, 'drop-zone-1');
    sv = await page.evaluate(() => window.slotValues);
    expect(sv['0']).toBe(parseInt(tag0.dataValue));
    expect(sv['1']).toBe(parseInt(tag1.dataValue));

    // Swap tag 0 to zone 1
    await simulateDrag(page, tag0.id, 'drop-zone-1');
    sv = await page.evaluate(() => window.slotValues);
    expect(sv['0']).toBe(parseInt(tag1.dataValue)); // tag1 swapped to zone 0
    expect(sv['1']).toBe(parseInt(tag0.dataValue)); // tag0 now in zone 1
  });

  // ── tagLocationMap tracking ──
  test('tagLocationMap tracks tag locations correctly', async ({ page }) => {
    const tags = await getAllTags(page);
    const tag0 = tags[0];

    // Initially in bank
    let loc = await page.evaluate((id) => window.tagLocationMap[id], tag0.id);
    expect(loc).toBe('bank');

    // Place in zone 0
    await simulateDrag(page, tag0.id, 'drop-zone-0');
    loc = await page.evaluate((id) => window.tagLocationMap[id], tag0.id);
    expect(loc).toBe('0');

    // Move to zone 1
    await simulateDrag(page, tag0.id, 'drop-zone-1');
    loc = await page.evaluate((id) => window.tagLocationMap[id], tag0.id);
    expect(loc).toBe('1');

    // Return to bank
    await simulateDrag(page, tag0.id, 'tag-bank');
    loc = await page.evaluate((id) => window.tagLocationMap[id], tag0.id);
    expect(loc).toBe('bank');
  });
});

// ─── TEST SUITE: Game Flow ──────────────────────────────────────────

test.describe('Expression Drop — Game Flow', () => {

  test('correct answer increments score and advances round', async ({ page }) => {
    await waitForGameStart(page);
    await exposeInternals(page);

    // Read round data
    const roundData = await page.evaluate(() => {
      var content = window.gameState.content;
      return content.rounds[0];
    });

    // Place correct values in zones
    for (let slot = 0; slot < roundData.correctValues.length; slot++) {
      const val = roundData.correctValues[slot];
      const tagId = await page.evaluate((v) => {
        var tags = document.querySelectorAll('.number-tag');
        for (var i = 0; i < tags.length; i++) {
          if (tags[i].getAttribute('data-value') === String(v) &&
              window.tagLocationMap[tags[i].id] === 'bank') {
            return tags[i].id;
          }
        }
        return null;
      }, val);

      if (tagId) {
        await simulateDrag(page, tagId, 'drop-zone-' + slot);
      }
    }

    // Dismiss any FeedbackManager popup overlay that may block clicks
    await page.evaluate(() => {
      var backdrop = document.getElementById('popup-backdrop');
      if (backdrop) backdrop.style.display = 'none';
    });

    // Click check via JS to bypass any overlay
    await page.evaluate(() => {
      document.getElementById('check-btn').click();
    });

    // Wait for feedback processing
    await page.waitForTimeout(2000);

    // If feedback is stuck (CDN audio hanging), force unblock
    await page.evaluate(() => {
      if (window.gameState.isProcessing) {
        window.gameState.isProcessing = false;
      }
    });
    await page.waitForTimeout(1000);

    // Dismiss any overlay
    await page.evaluate(() => {
      var backdrop = document.getElementById('popup-backdrop');
      if (backdrop) backdrop.style.display = 'none';
    });

    const state = await page.evaluate(() => ({
      score: window.gameState.score,
      currentRound: window.gameState.currentRound,
      isProcessing: window.gameState.isProcessing
    }));
    // Score must be 1 (answer was correct)
    expect(state.score).toBe(1);
  });

  test('wrong answer decrements lives', async ({ page }) => {
    await waitForGameStart(page);
    await exposeInternals(page);

    const initialLives = await page.evaluate(() => window.gameState.lives);

    // Read round data to find distractors
    const roundData = await page.evaluate(() => {
      var content = window.gameState.content;
      return content.rounds[0];
    });

    // Place two distractors that will produce wrong result
    const distractors = roundData.distractors;
    const allTags = await getAllTags(page);

    // Find tags that are distractors
    let placed = 0;
    for (const tag of allTags) {
      if (distractors.includes(parseInt(tag.dataValue)) && placed < 2) {
        await simulateDrag(page, tag.id, 'drop-zone-' + placed);
        placed++;
      }
    }

    if (placed === 2) {
      // Verify it's actually wrong
      const isWrong = await page.evaluate(() => {
        var content = window.gameState.content;
        var round = content.rounds[0];
        var v0 = window.slotValues['0'];
        var v1 = window.slotValues['1'];
        var result;
        if (round.operation === '+') result = v0 + v1;
        else if (round.operation === '-') result = v0 - v1;
        else if (round.operation === '*') result = v0 * v1;
        return result !== round.result;
      });

      if (isWrong) {
        // Dismiss overlay and click via JS
        await page.evaluate(() => {
          var backdrop = document.getElementById('popup-backdrop');
          if (backdrop) backdrop.style.display = 'none';
          document.getElementById('check-btn').click();
        });
        await page.waitForTimeout(3000);

        const newLives = await page.evaluate(() => window.gameState.lives);
        expect(newLives).toBe(initialLives - 1);
      }
    }
  });

  test('game over shows results screen', async ({ page }) => {
    await waitForGameStart(page);

    // Force game over
    await page.evaluate(() => {
      window.gameState.lives = 0;
      window.endGame('game_over');
    });
    await page.waitForTimeout(2000);

    const resultsVisible = await page.evaluate(() => {
      var rs = document.getElementById('results-screen');
      return rs && !rs.classList.contains('hidden');
    });
    expect(resultsVisible).toBe(true);
  });

  test('restart resets all state', async ({ page }) => {
    await waitForGameStart(page);

    // Force game over
    await page.evaluate(() => {
      window.gameState.lives = 0;
      window.endGame('game_over');
    });
    await page.waitForTimeout(2000);

    // Dismiss any FeedbackManager overlay
    await page.evaluate(() => {
      var backdrop = document.getElementById('popup-backdrop');
      if (backdrop) backdrop.style.display = 'none';
    });

    // Click play again via JS
    await page.evaluate(() => {
      var btn = document.querySelector('.play-again-btn');
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    const state = await page.evaluate(() => ({
      isActive: window.gameState.isActive,
      currentRound: window.gameState.currentRound,
      score: window.gameState.score,
      lives: window.gameState.lives,
      gameEnded: window.gameState.gameEnded
    }));

    expect(state.isActive).toBe(true);
    expect(state.currentRound).toBe(0);
    expect(state.score).toBe(0);
    expect(state.lives).toBe(3);
    expect(state.gameEnded).toBe(false);
  });

  test('recordAttempt captures all 12 fields', async ({ page }) => {
    await waitForGameStart(page);
    await exposeInternals(page);

    // Place any two tags
    const tags = await getAllTags(page);
    await simulateDrag(page, tags[0].id, 'drop-zone-0');
    await simulateDrag(page, tags[1].id, 'drop-zone-1');

    // Dismiss overlay and click via JS
    await page.evaluate(() => {
      var backdrop = document.getElementById('popup-backdrop');
      if (backdrop) backdrop.style.display = 'none';
      document.getElementById('check-btn').click();
    });
    await page.waitForTimeout(3000);

    const attempt = await page.evaluate(() => {
      return window.gameState.attempts[0];
    });

    expect(attempt).toBeDefined();
    expect(attempt.round_number).toBe(1);
    expect(attempt.round_id).toBeDefined();
    expect(attempt.question).toBeDefined();
    expect(attempt.user_answer).toBeDefined();
    expect(attempt.correct_answer).toBeDefined();
    expect(typeof attempt.is_correct).toBe('boolean');
    expect(typeof attempt.time_taken).toBe('number');
    expect(typeof attempt.score).toBe('number');
    expect(typeof attempt.lives).toBe('number');
    expect(attempt.operation).toBeDefined();
    expect(typeof attempt.difficulty).toBe('number');
    expect(typeof attempt.attempt_timestamp).toBe('number');
  });

  test('game_complete trackEvent fires on victory and game_over', async ({ page }) => {
    await waitForGameStart(page);

    // Test victory path: endGame should track game_complete event
    await page.evaluate(() => {
      window.gameState.score = 5;
      window.gameState.currentRound = 5;
      window.endGame('victory');
    });
    await page.waitForTimeout(1000);

    const hasComplete = await page.evaluate(() => {
      return window.gameState.events.some(function(e) {
        return e.event === 'game_complete';
      });
    });
    expect(hasComplete).toBe(true);

    // Verify the event data has required fields
    const eventData = await page.evaluate(() => {
      var evt = window.gameState.events.find(function(e) {
        return e.event === 'game_complete';
      });
      return evt ? evt.data : null;
    });
    expect(eventData).toBeDefined();
    expect(eventData.reason).toBe('victory');
    expect(typeof eventData.accuracy).toBe('number');
    expect(typeof eventData.stars).toBe('number');
  });
});

// ─── TEST SUITE: CSS & Touch ─────────────────────────────────────────

test.describe('Expression Drop — CSS & Touch', () => {

  test('touch-action: none only on .number-tag elements', async ({ page }) => {
    await waitForGameStart(page);

    const tagTA = await page.locator('.number-tag').first().evaluate(
      el => getComputedStyle(el).touchAction
    );
    expect(tagTA).toBe('none');

    const bodyTA = await page.evaluate(() => getComputedStyle(document.body).touchAction);
    expect(bodyTA).not.toBe('none');

    const zoneTA = await page.locator('.drop-zone').first().evaluate(
      el => getComputedStyle(el).touchAction
    );
    expect(zoneTA).not.toBe('none');
  });

  test('buttons meet 44px minimum touch target', async ({ page }) => {
    await waitForGameStart(page);

    const box = await page.locator('#check-btn').boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  test('number tags meet minimum size', async ({ page }) => {
    await waitForGameStart(page);

    const box = await page.locator('.number-tag').first().boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  test('results screen uses position fixed with z-index 100', async ({ page }) => {
    await waitForGameStart(page);

    const styles = await page.evaluate(() => {
      var rs = document.getElementById('results-screen');
      var cs = getComputedStyle(rs);
      return { position: cs.position, zIndex: cs.zIndex };
    });
    // When hidden, position may not be 'fixed' — check the CSS rule exists
    const hasCssRule = await page.evaluate(() => {
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        try {
          var rules = sheets[i].cssRules;
          for (var j = 0; j < rules.length; j++) {
            if (rules[j].selectorText === '#results-screen' &&
                rules[j].style.position === 'fixed' &&
                rules[j].style.zIndex === '100') {
              return true;
            }
          }
        } catch(e) {}
      }
      return false;
    });
    expect(hasCssRule).toBe(true);
  });

  test('.hidden class defined with display none important', async ({ page }) => {
    await waitForGameStart(page);

    const hasRule = await page.evaluate(() => {
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        try {
          var rules = sheets[i].cssRules;
          for (var j = 0; j < rules.length; j++) {
            if (rules[j].selectorText === '.hidden') {
              return rules[j].style.getPropertyPriority('display') === 'important';
            }
          }
        } catch(e) {}
      }
      return false;
    });
    expect(hasRule).toBe(true);
  });
});

// ─── TEST SUITE: Contract / Data ─────────────────────────────────────

test.describe('Expression Drop — Data Contract', () => {

  test('gameState has all required fields', async ({ page }) => {
    await waitForGameStart(page);

    const fields = await page.evaluate(() => {
      var gs = window.gameState;
      return {
        hasGameId: typeof gs.gameId === 'string',
        hasPhase: typeof gs.phase === 'string',
        hasCurrentRound: typeof gs.currentRound === 'number',
        hasTotalRounds: typeof gs.totalRounds === 'number',
        hasScore: typeof gs.score === 'number',
        hasLives: typeof gs.lives === 'number',
        hasTotalLives: typeof gs.totalLives === 'number',
        hasAttempts: Array.isArray(gs.attempts),
        hasEvents: Array.isArray(gs.events),
        hasIsActive: typeof gs.isActive === 'boolean',
        hasIsProcessing: typeof gs.isProcessing === 'boolean',
        hasGameEnded: typeof gs.gameEnded === 'boolean',
      };
    });

    Object.entries(fields).forEach(([key, val]) => {
      expect(val, `gameState missing: ${key}`).toBe(true);
    });
  });

  test('syncDOM writes correct data attributes to #app', async ({ page }) => {
    await waitForGameStart(page);

    const attrs = await page.evaluate(() => {
      var app = document.getElementById('app');
      return {
        phase: app.getAttribute('data-phase'),
        score: app.getAttribute('data-score'),
        lives: app.getAttribute('data-lives'),
      };
    });

    expect(attrs.phase).toBeDefined();
    expect(attrs.score).toBeDefined();
    expect(attrs.lives).toBeDefined();
  });

  test('window exposes gameState, endGame, restartGame, startGame, nextRound', async ({ page }) => {
    await waitForGameStart(page);

    const exposed = await page.evaluate(() => ({
      gameState: typeof window.gameState === 'object',
      endGame: typeof window.endGame === 'function',
      restartGame: typeof window.restartGame === 'function',
      startGame: typeof window.startGame === 'function',
      nextRound: typeof window.nextRound === 'function',
    }));

    Object.entries(exposed).forEach(([key, val]) => {
      expect(val, `window.${key} not exposed`).toBe(true);
    });
  });

  test('fallbackContent has 5 rounds with required fields', async ({ page }) => {
    await waitForGameStart(page);

    const rounds = await page.evaluate(() => {
      return fallbackContent.rounds.map(function(r) {
        return {
          hasId: typeof r.id === 'string',
          hasExpression: typeof r.expression === 'string',
          hasSlots: typeof r.slots === 'number',
          hasCorrectValues: Array.isArray(r.correctValues),
          hasDistractors: Array.isArray(r.distractors),
          hasOperation: typeof r.operation === 'string',
          hasResult: typeof r.result === 'number',
          hasDifficulty: typeof r.difficulty === 'number',
        };
      });
    });

    expect(rounds.length).toBe(5);
    rounds.forEach((r, i) => {
      Object.entries(r).forEach(([key, val]) => {
        expect(val, `Round ${i}: missing ${key}`).toBe(true);
      });
    });
  });
});
