/**
 * ProgressBarComponent
 * Shows round progress label, lives (hearts), and a slim progress track.
 *
 * v2: Clean minimal UI matching reference designs. Fully customizable styles.
 * Backwards compatible with v1 constructor config.
 *
 * @version 2.0.0
 * @license MIT
 */

(function(window) {
  'use strict';

  // Skip if already loaded
  if (typeof window.ProgressBarComponent !== "undefined") {
    console.log("[ProgressBarComponent] Already loaded, skipping duplicate execution");
    return;
  }

  var STYLE_ID = 'mathai-progress-bar-styles';

  /**
   * Inject component CSS (once per page)
   */
  function injectDefaultStyles() {
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      /* Container — no background/border by default (game controls that) */
      '.mathai-pb-root {',
      '  width: 100%;',
      '  font-family: var(--mathai-font-family, "Inter", -apple-system, BlinkMacSystemFont, sans-serif);',
      '}',

      /* Header row: label left, lives right */
      '.mathai-pb-header {',
      '  display: flex;',
      '  justify-content: space-between;',
      '  align-items: center;',
      '  margin-bottom: 10px;',
      '}',

      /* Round label */
      '.mathai-pb-label {',
      '  font-size: 16px;',
      '  font-weight: 700;',
      '  color: #3A3A3A;',
      '}',

      /* Lives display */
      '.mathai-pb-lives {',
      '  display: flex;',
      '  gap: 4px;',
      '  align-items: center;',
      '  font-size: 20px;',
      '  line-height: 1;',
      '}',

      /* Track */
      '.mathai-pb-track {',
      '  width: 100%;',
      '  height: 6px;',
      '  background: #E4E6ED;',
      '  border-radius: 3px;',
      '  overflow: hidden;',
      '}',

      /* Fill */
      '.mathai-pb-fill {',
      '  height: 100%;',
      '  background: #2F66E6;',
      '  border-radius: 3px;',
      '  transition: width 0.3s ease;',
      '  width: 0%;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
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

  /**
   * ProgressBarComponent
   * Displays round progress and lives using hearts
   */
  class ProgressBarComponent {
    /**
     * @param {object} config
     * @param {boolean}  config.autoInject  - Auto-find slot and inject (default: true)
     * @param {string}   config.slotId      - Slot ID to inject into (default: 'mathai-progress-slot')
     * @param {number}   config.totalRounds  - Total rounds (required)
     * @param {number}   config.totalLives   - Total lives/hearts (required)
     * @param {string}   config.labelFormat  - Label template. Use {current} and {total} placeholders.
     *                                         Default: 'Round {current}/{total}'
     * @param {string}   config.filledHeart  - Emoji for filled heart (default: '❤️')
     * @param {string}   config.emptyHeart   - Emoji for empty heart (default: '🤍')
     * @param {boolean}  config.showLives    - Show lives display (default: true)
     * @param {boolean}  config.showTrack    - Show progress bar track (default: true)
     * @param {boolean}  config.showLabel    - Show round label (default: true)
     * @param {object}   config.styles       - Custom styles per sub-element
     * @param {object}   config.styles.root     - Styles for root container
     * @param {object}   config.styles.header   - Styles for header row
     * @param {object}   config.styles.label    - Styles for round label
     * @param {object}   config.styles.lives    - Styles for lives display
     * @param {object}   config.styles.track    - Styles for progress track
     * @param {object}   config.styles.fill     - Styles for progress fill bar
     */
    constructor(config) {
      if (config === undefined) config = {};

      this.config = {
        autoInject: true,
        slotId: 'mathai-progress-slot',
        totalRounds: 5,
        totalLives: 3,
        labelFormat: 'Round {current}/{total}',
        filledHeart: '\u2764\uFE0F',   // ❤️
        emptyHeart: '\uD83E\uDD0D',     // 🤍
        showLives: true,
        showTrack: true,
        showLabel: true,
        styles: {}
      };

      // Merge config (shallow for top-level, shallow for styles)
      var keys = Object.keys(config);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i] === 'styles') {
          this.config.styles = config.styles || {};
        } else {
          this.config[keys[i]] = config[keys[i]];
        }
      }

      this.currentRound = 0;
      this.currentLives = this.config.totalLives;
      this.container = null;
      this.uniqueId = 'pb-' + Date.now();

      // Element references
      this._labelEl = null;
      this._livesEl = null;
      this._trackEl = null;
      this._fillEl = null;

      // Inject CSS
      injectDefaultStyles();

      if (this.config.autoInject) {
        this.injectIntoSlot();
      }

      this.render();
    }

    /**
     * Find and inject into slot
     */
    injectIntoSlot() {
      this.container = document.getElementById(this.config.slotId);

      if (!this.container) {
        console.warn('ProgressBar: Slot #' + this.config.slotId + ' not found');

        // Fallback: top of .mathai-layout-body (v2) or .game-wrapper (v1)
        var parent = document.querySelector('.mathai-layout-body') || document.querySelector('.game-wrapper');
        if (parent) {
          this.container = document.createElement('div');
          this.container.id = this.config.slotId;
          parent.insertBefore(this.container, parent.firstChild);
          console.log('[ProgressBar] Created fallback slot in', parent.className);
        } else {
          throw new Error('ProgressBar: No layout container found. Call ScreenLayout.inject() first.');
        }
      }
    }

    /**
     * Format the label string
     */
    _formatLabel(current, total) {
      return this.config.labelFormat
        .replace('{current}', current)
        .replace('{total}', total);
    }

    /**
     * Build hearts string
     */
    _buildHearts(currentLives) {
      var filled = '';
      var empty = '';
      for (var i = 0; i < this.config.totalLives; i++) {
        if (i < currentLives) {
          filled += this.config.filledHeart;
        } else {
          empty += this.config.emptyHeart;
        }
      }
      return filled + empty;
    }

    /**
     * Render the progress bar HTML
     */
    render() {
      if (!this.container) return;

      var uid = this.uniqueId;
      var cfg = this.config;
      var customStyles = cfg.styles || {};

      // Root
      var root = document.createElement('div');
      root.className = 'mathai-pb-root';
      if (customStyles.root) applyStyles(root, customStyles.root);

      // Header row (label + lives)
      var showHeader = cfg.showLabel || cfg.showLives;
      if (showHeader) {
        var header = document.createElement('div');
        header.className = 'mathai-pb-header';
        if (customStyles.header) applyStyles(header, customStyles.header);

        // Label
        if (cfg.showLabel) {
          var label = document.createElement('span');
          label.className = 'mathai-pb-label';
          label.id = uid + '-label';
          label.textContent = this._formatLabel(0, cfg.totalRounds);
          if (customStyles.label) applyStyles(label, customStyles.label);
          header.appendChild(label);
          this._labelEl = label;
        }

        // Lives
        if (cfg.showLives) {
          var lives = document.createElement('span');
          lives.className = 'mathai-pb-lives';
          lives.id = uid + '-lives';
          lives.setAttribute('aria-label', 'Lives remaining');
          lives.textContent = this._buildHearts(cfg.totalLives);
          if (customStyles.lives) applyStyles(lives, customStyles.lives);
          header.appendChild(lives);
          this._livesEl = lives;
        }

        root.appendChild(header);
      }

      // Track
      if (cfg.showTrack) {
        var track = document.createElement('div');
        track.className = 'mathai-pb-track';
        if (customStyles.track) applyStyles(track, customStyles.track);

        var fill = document.createElement('div');
        fill.className = 'mathai-pb-fill';
        fill.id = uid + '-fill';
        fill.style.width = '0%';
        if (customStyles.fill) applyStyles(fill, customStyles.fill);

        track.appendChild(fill);
        root.appendChild(track);

        this._trackEl = track;
        this._fillEl = fill;
      }

      // Inject
      this.container.innerHTML = '';
      this.container.appendChild(root);

      console.log('[ProgressBar] Rendered');
    }

    /**
     * Update progress display
     * @param {number} currentRound - Current round number (rounds COMPLETED)
     * @param {number} currentLives - Remaining lives
     */
    update(currentRound, currentLives) {
      this.currentRound = currentRound;
      this.currentLives = currentLives;

      if (this._labelEl) {
        this._labelEl.textContent = this._formatLabel(currentRound, this.config.totalRounds);
      }

      if (this._fillEl) {
        var pct = this.config.totalRounds > 0
          ? (currentRound / this.config.totalRounds * 100)
          : 0;
        this._fillEl.style.width = pct + '%';
      }

      if (this._livesEl) {
        this._livesEl.textContent = this._buildHearts(currentLives);
      }
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.container) {
        this.container.innerHTML = '';
      }
      this._labelEl = null;
      this._livesEl = null;
      this._trackEl = null;
      this._fillEl = null;
      console.log('[ProgressBar] Destroyed');
    }
  }

  // ---- Backwards compat: expose old element name aliases ----
  Object.defineProperty(ProgressBarComponent.prototype, 'textEl', {
    get: function() { return this._labelEl; }
  });
  Object.defineProperty(ProgressBarComponent.prototype, 'livesEl', {
    get: function() { return this._livesEl; }
  });
  Object.defineProperty(ProgressBarComponent.prototype, 'barEl', {
    get: function() { return this._fillEl; }
  });

  // Export globally
  window.ProgressBarComponent = ProgressBarComponent;

  console.log('[MathAI] ProgressBarComponent v2 loaded');

})(window);
