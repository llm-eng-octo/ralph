/**
 * ScreenLayoutComponent
 * Injects MathAI game wrapper structure with named slots
 *
 * v2: 4-section layout (header, questionText, progressBar, playArea)
 *     + optional previewScreen slot (sibling of game layout, mutually exclusive)
 * Backwards compatible with v1 slot config (progressBar, previewScreen, transitionScreen)
 *
 * @version 2.1.0
 * @license MIT
 */

(function(window) {
  'use strict';

  // Skip if already loaded
  if (typeof window.ScreenLayoutComponent !== "undefined") {
    console.log("[ScreenLayoutComponent] Already loaded, skipping duplicate execution");
    return;
  }

  // Default section IDs
  var DEFAULT_IDS = {
    header: 'mathai-header-slot',
    questionText: 'mathai-question-slot',
    progressBar: 'mathai-progress-slot',
    playArea: 'gameContent',
    transitionSlot: 'mathai-transition-slot',
    previewSlot: 'mathai-preview-slot'
  };

  // Default CSS injected by the component
  var LAYOUT_STYLE_ID = 'mathai-screen-layout-styles';

  /**
   * Inject layout CSS (once per page)
   */
  function injectLayoutStyles() {
    if (document.getElementById(LAYOUT_STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = LAYOUT_STYLE_ID;
    style.textContent = [
      '/* ScreenLayout v2 base styles */',

      '.mathai-layout-root {',
      '  display: flex;',
      '  flex-direction: column;',
      '  height: 100dvh;',
      '  width: 100%;',
      '  max-width: 480px;',
      '  margin: 0 auto;',
      '  overflow: hidden;',
      '}',

      /* --- Header: sticky at top --- */
      '.mathai-layout-header {',
      '  flex-shrink: 0;',
      '  position: sticky;',
      '  top: 0;',
      '  z-index: 10;',
      '  background: inherit;',
      '}',

      /* --- Scrollable body (question + progress + play area) --- */
      '.mathai-layout-body {',
      '  flex: 1;',
      '  overflow-y: auto;',
      '  overflow-x: hidden;',
      '  -webkit-overflow-scrolling: touch;',
      '  display: flex;',
      '  flex-direction: column;',
      '}',

      /* --- Individual sections --- */
      '.mathai-layout-question {',
      '  flex-shrink: 0;',
      '}',

      '.mathai-layout-progress {',
      '  flex-shrink: 0;',
      '}',

      '.mathai-layout-playarea {',
      '  flex: 1;',
      '  position: relative;',
      '  min-height: 0;',
      '}',

      /* --- Backwards compat: old classes still work --- */
      '.page-center { display: flex; justify-content: center; width: 100%; }',
      '.game-wrapper {',
      '  width: 100%;',
      '  display: flex;',
      '  flex-direction: column;',
      '  height: 100dvh;',
      '}',
      '.game-stack {',
      '  flex: 1;',
      '  display: flex;',
      '  flex-direction: column;',
      '  overflow-y: auto;',
      '  overflow-x: hidden;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  /**
   * Resolve a slot config value to an ID string or null.
   *   true        -> default ID
   *   'custom-id' -> 'custom-id'
   *   false/undef -> null
   */
  function resolveSlotId(value, defaultId) {
    if (typeof value === 'string') return value;
    if (value === true) return defaultId;
    return null;
  }

  /**
   * ScreenLayoutComponent
   * Creates base game structure with optional component slots
   */
  class ScreenLayoutComponent {
    /**
     * Inject game layout into container.
     *
     * --- v2 config (preferred) ---
     * @param {string} containerId - DOM element ID to inject into
     * @param {object} config
     * @param {object} config.sections - Which sections to create
     * @param {boolean|string} config.sections.header         - Header slot (default true)
     * @param {boolean|string} config.sections.questionText   - Question text slot
     * @param {boolean|string} config.sections.progressBar    - Progress bar slot
     * @param {boolean|string} config.sections.playArea       - Play area / game content (always created)
     * @param {boolean|string} config.sections.transitionScreen - Transition screen slot (inside play area)
     * @param {boolean|string} config.sections.previewScreen  - Preview screen slot (sibling outside game layout, mutually exclusive with game)
     * @param {object} config.styles - Custom CSS per section (merged onto the element)
     * @param {object} config.styles.header
     * @param {object} config.styles.questionText
     * @param {object} config.styles.progressBar
     * @param {object} config.styles.playArea
     * @param {object} config.styles.body - the scrollable wrapper
     *
     * --- v1 config (backwards compat, deprecated) ---
     * @param {object} config.slots
     * @param {boolean|string} config.slots.progressBar
     * @param {boolean|string} config.slots.previewScreen  - Preview screen slot
     * @param {boolean|string} config.slots.transitionScreen
     *
     * @returns {object} Created slot IDs
     */
    static inject(containerId, config) {
      if (config === undefined) config = {};

      var container = document.getElementById(containerId);
      if (!container) {
        throw new Error('ScreenLayout: Container #' + containerId + ' not found');
      }

      // Inject layout CSS
      injectLayoutStyles();

      // ----- Detect v1 vs v2 mode -----
      var isV1 = !config.sections && !!config.slots;

      if (isV1) {
        return ScreenLayoutComponent._injectV1(container, config);
      }

      return ScreenLayoutComponent._injectV2(container, config);
    }

    /**
     * v1 backwards-compatible inject (deprecated, old slot model).
     * Produces the SAME DOM structure as v1 so existing games keep working.
     * Supports: progressBar, previewScreen, transitionScreen slots.
     */
    static _injectV1(container, config) {
      var slots = config.slots || {};

      var slotIds = {
        progressSlot: resolveSlotId(slots.progressBar, DEFAULT_IDS.progressBar),
        previewSlot: resolveSlotId(slots.previewScreen, DEFAULT_IDS.previewSlot),
        transitionSlot: resolveSlotId(slots.transitionScreen, DEFAULT_IDS.transitionSlot),
        gameContent: DEFAULT_IDS.playArea
      };

      var html = '<div class="page-center">';

      // Preview screen slot OUTSIDE game-wrapper (sibling) — mutually exclusive with game
      if (slotIds.previewSlot) {
        html += '<div id="' + slotIds.previewSlot + '" style="display:none;"></div>';
      }

      html += '<section class="game-wrapper">';

      if (slotIds.progressSlot) {
        html += '<div id="' + slotIds.progressSlot + '"></div>';
      }

      html += '<div class="game-stack">';
      html += '<div id="gameContent" class="game-block"></div>';

      if (slotIds.transitionSlot) {
        html += '<div id="' + slotIds.transitionSlot + '" class="game-block" style="display:none;"></div>';
      }

      html += '</div></section></div>';

      container.innerHTML = html;

      console.log('[ScreenLayout] v1 layout injected with slots:', slotIds);
      return slotIds;
    }

    /**
     * v2 inject: 4-section layout + optional preview slot
     *
     * DOM produced:
     *   [#mathai-preview-slot]                                ← optional, sibling of root, display:none
     *   .mathai-layout-root
     *     .mathai-layout-header   (#mathai-header-slot)       ← sticky
     *     .mathai-layout-body                                 ← single scrollable area
     *       .mathai-layout-question (#mathai-question-slot)
     *       .mathai-layout-progress (#mathai-progress-slot)
     *       .mathai-layout-playarea (#gameContent)
     *       [#mathai-transition-slot]                          ← sibling of playArea
     *
     * TransitionScreen compatibility: The transition slot is a sibling of
     * #gameContent inside .mathai-layout-body. TransitionScreen toggles
     * gameContent.style.display to swap between game content and transition
     * cards. Question text + progress bar stay visible above both.
     */
    static _injectV2(container, config) {
      var sec = config.sections || {};
      var styles = config.styles || {};

      // Resolve IDs — header and playArea always created
      var ids = {
        header: resolveSlotId(sec.header !== undefined ? sec.header : true, DEFAULT_IDS.header),
        questionText: resolveSlotId(sec.questionText, DEFAULT_IDS.questionText),
        progressBar: resolveSlotId(sec.progressBar, DEFAULT_IDS.progressBar),
        playArea: resolveSlotId(sec.playArea !== undefined ? sec.playArea : true, DEFAULT_IDS.playArea),
        transitionSlot: resolveSlotId(sec.transitionScreen, DEFAULT_IDS.transitionSlot),
        previewSlot: resolveSlotId(sec.previewScreen, DEFAULT_IDS.previewSlot)
      };

      // Clear container
      container.innerHTML = '';

      // --- Preview screen slot (outside layout root, sibling — mutually exclusive with game) ---
      if (ids.previewSlot) {
        var previewEl = document.createElement('div');
        previewEl.id = ids.previewSlot;
        previewEl.style.display = 'none';
        container.appendChild(previewEl);
      }

      // Build DOM (using createElement for clean structure)
      var root = document.createElement('div');
      root.className = 'mathai-layout-root';

      // --- Header ---
      var headerEl = null;
      if (ids.header) {
        headerEl = document.createElement('div');
        headerEl.id = ids.header;
        headerEl.className = 'mathai-layout-header';
        if (styles.header) applyStyles(headerEl, styles.header);
        root.appendChild(headerEl);
      }

      // --- Scrollable body ---
      var bodyEl = document.createElement('div');
      bodyEl.className = 'mathai-layout-body';
      if (styles.body) applyStyles(bodyEl, styles.body);

      // --- Question text ---
      var questionEl = null;
      if (ids.questionText) {
        questionEl = document.createElement('div');
        questionEl.id = ids.questionText;
        questionEl.className = 'mathai-layout-question';
        if (styles.questionText) applyStyles(questionEl, styles.questionText);
        bodyEl.appendChild(questionEl);
      }

      // --- Progress bar ---
      var progressEl = null;
      if (ids.progressBar) {
        progressEl = document.createElement('div');
        progressEl.id = ids.progressBar;
        progressEl.className = 'mathai-layout-progress';
        if (styles.progressBar) applyStyles(progressEl, styles.progressBar);
        bodyEl.appendChild(progressEl);
      }

      // --- Play area (always) ---
      var playAreaEl = document.createElement('div');
      playAreaEl.id = ids.playArea || DEFAULT_IDS.playArea;
      playAreaEl.className = 'mathai-layout-playarea';
      if (styles.playArea) applyStyles(playAreaEl, styles.playArea);
      bodyEl.appendChild(playAreaEl);

      // --- Transition slot (sibling of play area, NOT nested inside it) ---
      // TransitionScreen toggles gameContent.display to swap between them.
      // Question text and progress bar stay visible above both.
      if (ids.transitionSlot) {
        var transEl = document.createElement('div');
        transEl.id = ids.transitionSlot;
        transEl.className = 'game-block';
        transEl.style.display = 'none';
        bodyEl.appendChild(transEl);
      }

      root.appendChild(bodyEl);
      container.appendChild(root);

      // Build return object (backwards-compat shape + new keys)
      var result = {
        // v2 keys
        header: ids.header,
        questionText: ids.questionText,
        progressBar: ids.progressBar,
        playArea: ids.playArea || DEFAULT_IDS.playArea,
        transitionSlot: ids.transitionSlot,
        previewSlot: ids.previewSlot,
        // v1 compat aliases
        progressSlot: ids.progressBar,
        gameContent: ids.playArea || DEFAULT_IDS.playArea
      };

      console.log('[ScreenLayout] v2 layout injected with sections:', result);
      return result;
    }

    /**
     * Check if layout exists (works for both v1 and v2)
     * @returns {boolean}
     */
    static exists() {
      return !!(
        document.querySelector('.mathai-layout-root') ||
        document.querySelector('.page-center .game-wrapper .game-stack')
      );
    }

    /**
     * Get game content / play area element
     * @returns {HTMLElement|null}
     */
    static getGameContent() {
      return document.getElementById(DEFAULT_IDS.playArea);
    }

    /**
     * Get a section element by name (v2 only)
     * @param {string} section - 'header' | 'questionText' | 'progressBar' | 'playArea' | 'previewSlot'
     * @returns {HTMLElement|null}
     */
    static getSection(section) {
      var id = DEFAULT_IDS[section];
      return id ? document.getElementById(id) : null;
    }
  }

  /**
   * Apply a styles object to an element
   */
  function applyStyles(el, stylesObj) {
    if (!stylesObj || typeof stylesObj !== 'object') return;
    var keys = Object.keys(stylesObj);
    for (var i = 0; i < keys.length; i++) {
      el.style[keys[i]] = stylesObj[keys[i]];
    }
  }

  // Export globally
  window.ScreenLayoutComponent = ScreenLayoutComponent;
  window.ScreenLayout = ScreenLayoutComponent; // Alias for convenience

  console.log('[MathAI] ScreenLayoutComponent v2 loaded');

})(window);
