(function (window) {
  "use strict";

  if (typeof window.VoiceInput !== "undefined") {
    console.log("[VoiceInput] Already loaded, skipping duplicate execution");
    return;
  }

  /* ============================================================
     CONSTANTS
     ============================================================ */
  var API_BASE = "https://test3-api.homeworkapp.ai/test/ts";
  var SIGNED_URL_ENDPOINT = API_BASE + "/prod/hw/getSignedUrlForUpload";
  var STT_ENDPOINT = API_BASE + "/v3/personalizedLearning/speechToText";
  var GCS_BUCKET = "mathai-temp-assets";
  var STT_TIMEOUT = 60000;

  var MIC_ON_SOUND = "https://cdn.homeworkapp.ai/sets-gamify-assets/math-ai-assets/assets/sounds/mic-on.mp3";
  var MIC_OFF_SOUND = "https://cdn.homeworkapp.ai/sets-gamify-assets/math-ai-assets/assets/sounds/mic-off.mp3";
  var STT_LOADING_SOUND = "https://cdn.homeworkapp.ai/sets-gamify-assets/math-ai-assets/assets/sounds/speech_to_text.mp3";
  var STT_FAILED_SOUND = "https://cdn.homeworkapp.ai/sets-gamify-assets/math-ai-assets/assets/sounds/speech_to_text_failed.mp3";
  var STT_TIMEOUT_SOUND = "https://cdn.homeworkapp.ai/sets-gamify-assets/math-ai-assets/assets/sounds/speech_to_text_timeout.mp3";

  /* ============================================================
     SVG ICONS
     ============================================================ */
  var MIC_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15C13.66 15 14.99 13.66 14.99 12L15 6C15 4.34 13.66 3 12 3C10.34 3 9 4.34 9 6V12C9 13.66 10.34 15 12 15ZM18.08 12C17.66 12 17.31 12.3 17.25 12.71C16.88 15.32 14.53 17.1 12 17.1C9.47 17.1 7.12 15.33 6.75 12.71C6.69 12.3 6.33 12 5.92 12C5.4 12 5 12.46 5.07 12.97C5.53 15.94 8.03 18.27 11 18.72V21C11 21.55 11.45 22 12 22C12.55 22 13 21.55 13 21V18.72C15.96 18.29 18.47 15.94 18.93 12.97C19 12.46 18.6 12 18.08 12Z" fill="FILL_COLOR"/></svg>';
  var KEYBOARD_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 3H4C2.9 3 2.01 3.9 2.01 5L2 15C2 16.1 2.9 17 4 17H20C21.1 17 22 16.1 22 15V5C22 3.9 21.1 3 20 3ZM11 6H13V8H11V6ZM11 9H13V11H11V9ZM8 6H10V8H8V6ZM8 9H10V11H8V9ZM7 11H5V9H7V11ZM7 8H5V6H7V8ZM15 15H9C8.45 15 8 14.55 8 14C8 13.45 8.45 13 9 13H15C15.55 13 16 13.45 16 14C16 14.55 15.55 15 15 15ZM16 11H14V9H16V11ZM16 8H14V6H16V8ZM19 11H17V9H19V11ZM19 8H17V6H19V8ZM12.35 22.65L15.14 19.86C15.45 19.55 15.23 19.01 14.79 19.01H9.21C8.76 19.01 8.54 19.55 8.86 19.86L11.65 22.65C11.84 22.84 12.16 22.84 12.35 22.65Z" fill="FILL_COLOR"/></svg>';
  var RESET_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#vi-clip)"><path d="M12.5 8C9.85 8 7.45 8.99 5.6 10.6L3.71 8.71C3.08 8.08 2 8.52 2 9.41V15C2 15.55 2.45 16 3 16H8.59C9.48 16 9.93 14.92 9.3 14.29L7.39 12.38C8.78 11.22 10.55 10.5 12.51 10.5C15.67 10.5 18.4 12.34 19.7 15C19.97 15.56 20.61 15.84 21.2 15.64C21.91 15.41 22.27 14.6 21.95 13.92C20.23 10.42 16.65 8 12.5 8Z" fill="FILL_COLOR"/></g><defs><clipPath id="vi-clip"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>';
  var STOP_ICON = '<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.6667 8H21.3333C22.8 8 24 9.2 24 10.6667V21.3333C24 22.8 22.8 24 21.3333 24H10.6667C9.2 24 8 22.8 8 21.3333V10.6667C8 9.2 9.2 8 10.6667 8Z" fill="white"/></svg>';

  /* ============================================================
     CSS (injected once)
     ============================================================ */
  /* ============================================================
     GLOBAL PERMISSION STATE (shared across all instances)
     ============================================================ */
  var _globalPermission = {
    state: "idle",        // "idle" | "pending" | "resolved"
    permitted: false,     // whether mic is granted
    callbacks: [],        // callbacks waiting for the result
  };

  function globalCheckPermission(cb) {
    // If already fully resolved, return immediately
    if (_globalPermission.state === "resolved") {
      console.log("[VoiceInput][globalCheckPermission] Already resolved, permitted:", _globalPermission.permitted);
      cb(_globalPermission.permitted);
      return;
    }

    // Queue this callback
    _globalPermission.callbacks.push(cb);

    // If a check is already in-flight, just wait for it
    if (_globalPermission.state === "pending") {
      console.log("[VoiceInput][globalCheckPermission] Check already in-flight, queued callback (total queued:", _globalPermission.callbacks.length + ")");
      return;
    }

    // First caller — start the check
    _globalPermission.state = "pending";
    console.log("[VoiceInput][globalCheckPermission] Starting global permission check... (protocol:", window.location.protocol, "origin:", window.location.origin + ")");

    if (!navigator.permissions || !navigator.permissions.query) {
      console.log("[VoiceInput][globalCheckPermission] permissions.query not available, defaulting to not-yet-granted");
      globalResolve(false);
      return;
    }

    navigator.permissions.query({ name: "microphone" })
      .then(function (status) {
        console.log("[VoiceInput][globalCheckPermission] Permission query result: state =", status.state);
        if (status.state === "granted") {
          console.log("[VoiceInput][globalCheckPermission] Already granted — no getUserMedia needed");
          globalResolve(true);
        } else {
          console.log("[VoiceInput][globalCheckPermission] State is '" + status.state + "' — waiting for user-triggered recording to request access");
          globalResolve(false);
        }

        // Listen for future changes
        status.onchange = function () {
          console.log("[VoiceInput][globalCheckPermission] Permission state changed to:", status.state);
          _globalPermission.permitted = (status.state === "granted");
        };
      })
      .catch(function (err) {
        console.log("[VoiceInput][globalCheckPermission] permissions.query failed:", err);
        globalResolve(false);
      });
  }

  function globalResolve(permitted) {
    _globalPermission.permitted = permitted;
    _globalPermission.state = "resolved";
    console.log("[VoiceInput][globalResolve] Resolved. permitted:", permitted, "notifying", _globalPermission.callbacks.length, "instances");
    var cbs = _globalPermission.callbacks;
    _globalPermission.callbacks = [];
    for (var i = 0; i < cbs.length; i++) {
      cbs[i](permitted);
    }
  }

  var CSS_INJECTED = false;
  function injectCSS() {
    if (CSS_INJECTED) return;
    CSS_INJECTED = true;
    var style = document.createElement("style");
    style.textContent = [
      /* textarea */
      ".vi-textarea {",
      "  overflow: hidden; border-radius: 0; border: 0.5px solid #4F4F4F;",
      "  padding: 8px; resize: none; width: 300px; min-height: 100px;",
      "  font-family: inherit; font-size: 14px; background: #F9F8F8;",
      "  outline: none; box-sizing: border-box; display: block;",
      "}",
      ".vi-textarea:focus { border-color: #FFDE49; border-bottom-color: #4F4F4F; }",
      ".vi-textarea.vi-focused { border-color: #FFDE49; border-bottom-color: #4F4F4F; }",
      ".vi-textarea.vi-no-pointer { pointer-events: none; }",
      ".vi-textarea.vi-bg-correct { background: #D9F8D9; }",
      ".vi-textarea.vi-bg-wrong { background: #FFD9D9; }",
      ".vi-textarea.vi-bg-neutral { background: #F9F8F8; }",
      ".vi-textarea.vi-disabled { opacity: 0.5; pointer-events: none; }",

      /* toolbar */
      ".vi-toolbar {",
      "  background-color: #F5F5F5; border: 0.5px solid #4F4F4F;",
      "  width: 300px; height: 40px; padding-inline: 4px;",
      "  display: flex; flex-direction: row; gap: 8px;",
      "  box-sizing: border-box; align-items: center;",
      "}",
      ".vi-toolbar button {",
      "  background: none; border: none; cursor: pointer;",
      "  padding: 0; height: 100%; display: flex; align-items: center;",
      "}",
      ".vi-toolbar .vi-tool-reset { order: 2; margin-left: auto; }",

      /* wrapper */
      ".vi-wrapper {",
      "  display: grid; gap: 0; padding: 8px; margin: 8px;",
      "  border-collapse: collapse; position: relative;",
      "}",
      ".vi-wrapper.vi-highlight {",
      "  border-radius: 8px; box-shadow: 0px 0px 4px 2px #000fff;",
      "}",
      ".vi-outer { display: flex; width: 100%; justify-content: center; }",

      /* bottom drawer */
      ".vi-drawer {",
      "  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);",
      "  z-index: 999; display: flex; flex-direction: column; align-items: center;",
      "  justify-content: center; width: 100%; max-width: 500px;",
      "  background: #fff; padding-bottom: 16px; padding-top: 48px;",
      "",
      "}",
      ".vi-drawer.vi-hidden { display: none; }",
      ".vi-drawer-label {",
      "  margin-top: -32px; font-size: 12px; line-height: 150%;",
      "  text-align: center;",
      "}",

      /* mic toggle button (big circle) */
      ".vi-mic-toggle {",
      "  position: relative; display: block; border-radius: 50%;",
      "  background-color: #000fff; padding: 16px; margin-bottom: 4rem;",
      "  border: none; cursor: pointer;",
      "}",
      ".vi-mic-toggle:after, .vi-mic-toggle:before {",
      "  --pad: 0rem; content: ''; display: block; position: absolute;",
      "  z-index: 0; top: var(--pad); left: var(--pad);",
      "  right: var(--pad); bottom: var(--pad); border-radius: 50%;",
      "}",
      ".vi-mic-toggle:after {",
      "  --pad: -2rem; transition: 0.4s;",
      "  background-color: rgba(0, 15, 255, 0.2);",
      "}",
      ".vi-mic-toggle:before {",
      "  --pad: -1rem; transition: 0.4s;",
      "  background-color: rgba(0, 15, 255, 0.2);",
      "}",
      ".vi-mic-toggle svg { position: relative; z-index: 1; }",
      ".vi-mic-toggle.vi-recording:after {",
      "  animation: vi-smoothPadAfter 0.6s ease-in alternate-reverse forwards infinite;",
      "}",
      ".vi-mic-toggle.vi-recording:before {",
      "  animation: vi-smoothPadBefore 0.6s ease-in alternate-reverse forwards infinite;",
      "}",
      ".vi-mic-toggle:disabled { opacity: 0.5; cursor: not-allowed; }",

      "@keyframes vi-smoothPadAfter {",
      "  0% { top: -2rem; left: -2rem; right: -2rem; bottom: -2rem; }",
      "  100% { top: -1rem; left: -1rem; right: -1rem; bottom: -1rem; }",
      "}",
      "@keyframes vi-smoothPadBefore {",
      "  0% { top: -1rem; left: -1rem; right: -1rem; bottom: -1rem; }",
      "  100% { top: -0.5rem; left: -0.5rem; right: -0.5rem; bottom: -0.5rem; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);
  }

  /* ============================================================
     WAV RECORDER (inline polyfill)
     ============================================================ */
  function WavRecorder(stream) {
    this.stream = stream;
    this.state = "inactive";
    this.ondataavailable = null;
    this.onstop = null;
    this._audioContext = null;
    this._source = null;
    this._processor = null;
    this._chunks = [];
  }

  WavRecorder.prototype.start = function () {
    var self = this;
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    self._audioContext = new AudioContext({ sampleRate: 16000 });
    if (self._audioContext.state === "suspended") {
      self._audioContext.resume();
    }
    self._source = self._audioContext.createMediaStreamSource(self.stream);
    self._processor = self._audioContext.createScriptProcessor(4096, 1, 1);
    self._chunks = [];
    self._processor.onaudioprocess = function (e) {
      if (self.state === "recording") {
        self._chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
      }
    };
    self._source.connect(self._processor);
    self._processor.connect(self._audioContext.destination);
    self.state = "recording";
  };

  WavRecorder.prototype.stop = function () {
    var self = this;
    if (self.state !== "recording") return;
    self.state = "inactive";
    var sampleRate = self._audioContext ? self._audioContext.sampleRate : 16000;
    var wavBlob = encodeWAV(self._chunks, sampleRate);
    if (self._processor) { self._processor.disconnect(); self._processor = null; }
    if (self._source) { self._source.disconnect(); self._source = null; }
    if (self._audioContext) { self._audioContext.close().catch(function () {}); self._audioContext = null; }
    if (self.ondataavailable) self.ondataavailable({ data: wavBlob });
    if (self.onstop) self.onstop();
  };

  function encodeWAV(chunks, sampleRate) {
    var totalLength = 0;
    for (var i = 0; i < chunks.length; i++) totalLength += chunks[i].length;
    var merged = new Float32Array(totalLength);
    var offset = 0;
    for (var j = 0; j < chunks.length; j++) { merged.set(chunks[j], offset); offset += chunks[j].length; }
    var pcm = new Int16Array(merged.length);
    for (var k = 0; k < merged.length; k++) {
      var s = Math.max(-1, Math.min(1, merged[k]));
      pcm[k] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    var buf = new ArrayBuffer(44 + pcm.length * 2);
    var v = new DataView(buf);
    writeStr(v, 0, "RIFF"); v.setUint32(4, 36 + pcm.length * 2, true);
    writeStr(v, 8, "WAVE"); writeStr(v, 12, "fmt ");
    v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    writeStr(v, 36, "data"); v.setUint32(40, pcm.length * 2, true);
    var o = 44;
    for (var m = 0; m < pcm.length; m++) { v.setInt16(o, pcm[m], true); o += 2; }
    return new Blob([v], { type: "audio/wav" });
  }

  function writeStr(view, offset, str) {
    for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  /* ============================================================
     HELPERS
     ============================================================ */
  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function playSound(url) {
    try {
      var a = new Audio(url);
      a.volume = 0.6;
      a.play().catch(function () {});
      return a;
    } catch (e) { return null; }
  }

  function icon(svgStr, color) {
    return svgStr.replace("FILL_COLOR", color);
  }

  /* ============================================================
     VOICE INPUT CLASS
     ============================================================ */
  function VoiceInput(containerId, options) {
    var opts = options || {};

    // Resolve container
    var container;
    if (typeof containerId === "string") {
      container = document.getElementById(containerId);
    } else if (typeof containerId === "object" && containerId.containerId) {
      opts = containerId;
      container = document.getElementById(containerId.containerId);
    }
    if (!container) throw new Error("VoiceInput: container not found");

    this._container = container;
    this._tools = opts.tools || ["mic", "keyboard", "reset"];
    this._defaultTool = opts.defaultTool || this._tools[0];
    this._placeholder = opts.placeholder || "type here..";
    this._disabled = false;

    // State
    this._input = "";
    this._isFocused = false;
    this._activeOption = null;
    this._isRecording = false;
    this._isLoading = false;
    this._stream = null;
    this._recorder = null;
    this._skipAppend = false;
    this._background = "1"; // "1"=neutral, "2"=correct, "3"=wrong
    this._loadingAudio = null;

    // Event listeners
    this._listeners = {};

    // Inject CSS + build DOM
    injectCSS();
    this._buildDOM();
    this._bindEvents();
    this._checkPermission();
  }

  /* --- Read-only properties --- */
  Object.defineProperty(VoiceInput.prototype, "value", {
    get: function () { return this._input; },
  });

  Object.defineProperty(VoiceInput.prototype, "isRecording", {
    get: function () { return this._isRecording; },
  });

  Object.defineProperty(VoiceInput.prototype, "isLoading", {
    get: function () { return this._isLoading; },
  });

  /* ============================================================
     DOM CONSTRUCTION
     ============================================================ */
  VoiceInput.prototype._buildDOM = function () {
    var self = this;

    // Outer
    var outer = document.createElement("div");
    outer.className = "vi-outer";

    // Wrapper
    var wrapper = document.createElement("div");
    wrapper.className = "vi-wrapper";
    this._wrapperEl = wrapper;

    // Textarea
    var textarea = document.createElement("textarea");
    textarea.className = "vi-textarea vi-no-pointer";
    textarea.autocomplete = "off";
    textarea.placeholder = "";
    textarea.setAttribute("rows", "3");
    this._textareaEl = textarea;

    // Toolbar
    var toolbar = document.createElement("div");
    toolbar.className = "vi-toolbar";
    this._toolbarEl = toolbar;

    // Tool buttons
    if (this._tools.indexOf("mic") !== -1) {
      var micBtn = document.createElement("button");
      micBtn.className = "vi-tool-mic";
      if (this._defaultTool !== "mic") micBtn.style.order = "1";
      micBtn.innerHTML = icon(MIC_ICON, "#4F4F4F");
      micBtn.addEventListener("click", function () {
        self._onToolClick("mic");
      });
      toolbar.appendChild(micBtn);
      this._micBtnEl = micBtn;
    }

    if (this._tools.indexOf("keyboard") !== -1) {
      var kbBtn = document.createElement("button");
      kbBtn.className = "vi-tool-keyboard";
      if (this._defaultTool !== "keyboard") kbBtn.style.order = "1";
      kbBtn.innerHTML = icon(KEYBOARD_ICON, "#4F4F4F");
      kbBtn.addEventListener("click", function () {
        self._onToolClick("keyboard");
      });
      toolbar.appendChild(kbBtn);
      this._kbBtnEl = kbBtn;
    }

    if (this._tools.indexOf("reset") !== -1) {
      var resetBtn = document.createElement("button");
      resetBtn.className = "vi-tool-reset";
      resetBtn.innerHTML = icon(RESET_ICON, "#4F4F4F");
      resetBtn.addEventListener("click", function () {
        self._onToolClick("reset");
      });
      toolbar.appendChild(resetBtn);
      this._resetBtnEl = resetBtn;
    }

    // Bottom drawer (mic recording panel)
    var drawer = document.createElement("div");
    drawer.className = "vi-drawer vi-hidden";

    var micToggle = document.createElement("button");
    micToggle.className = "vi-mic-toggle";
    micToggle.innerHTML = icon(MIC_ICON, "#fff");
    this._micToggleEl = micToggle;

    var drawerLabel = document.createElement("div");
    drawerLabel.className = "vi-drawer-label";
    drawerLabel.textContent = "Tap to speak";
    this._drawerLabelEl = drawerLabel;

    drawer.appendChild(micToggle);
    drawer.appendChild(drawerLabel);
    this._drawerEl = drawer;

    micToggle.addEventListener("click", function () {
      self._onMicToggleClick();
    });

    // Assemble
    wrapper.appendChild(textarea);
    wrapper.appendChild(toolbar);
    outer.appendChild(wrapper);

    // Drawer goes at body level (fixed positioning)
    document.body.appendChild(drawer);

    this._container.innerHTML = "";
    this._container.appendChild(outer);
  };

  /* ============================================================
     EVENT BINDING
     ============================================================ */
  VoiceInput.prototype._bindEvents = function () {
    var self = this;

    // Textarea focus
    this._textareaEl.addEventListener("focus", function () {
      self._setActiveOption("keyboard");
    });

    // Textarea input
    this._textareaEl.addEventListener("input", function (e) {
      self._input = e.target.value;
      self._emit("input_change", { value: self._input });
    });

    // Prevent paste & context menu
    this._textareaEl.addEventListener("contextmenu", function (e) { e.preventDefault(); });
    this._textareaEl.addEventListener("paste", function (e) { e.preventDefault(); });

    // Click outside to unfocus
    this._outsideClickHandler = function (e) {
      // If a tool button was just clicked, it already set the correct state — skip
      if (self._toolClicked) {
        self._toolClicked = false;
        return;
      }
      if (self._wrapperEl && !self._wrapperEl.contains(e.target) &&
          self._drawerEl && !self._drawerEl.contains(e.target)) {
        self._setFocused(false);
        self._setActiveOption(null);
      } else if (self._wrapperEl && self._wrapperEl.contains(e.target)) {
        self._setFocused(true);
      }
    };
    document.addEventListener("click", this._outsideClickHandler);
  };

  /* ============================================================
     TOOL CLICK HANDLERS
     ============================================================ */
  VoiceInput.prototype._onToolClick = function (tool) {
    // Set focused + activeOption directly (not via _setFocused which may override activeOption)
    this._isFocused = true;
    this._toolClicked = true; // flag to prevent outsideClickHandler from overriding

    if (tool === "mic") {
      this._activeOption = "mic";
      this._textareaEl.blur();
    } else if (tool === "keyboard") {
      if (this._isRecording) this._cancelRecording();
      if (this._isLoading) this._skipAppend = true;
      this._activeOption = "keyboard";
      this._textareaEl.focus();
    } else if (tool === "reset") {
      if (this._isRecording) this._cancelRecording();
      if (this._isLoading) this._skipAppend = true;
      this._activeOption = "reset";
      this._input = "";
      this._textareaEl.value = "";
      this._emit("input_change", { value: "" });
    }
    this._syncUI();
  };

  /* ============================================================
     MIC TOGGLE (big drawer button)
     ============================================================ */
  VoiceInput.prototype._onMicToggleClick = function () {
    var self = this;
    console.log("[VoiceInput][_onMicToggleClick] Mic toggle clicked. isRecording:", this._isRecording, "isLoading:", this._isLoading, "_isPermitted:", this._isPermitted);
    if (this._isLoading) return;

    if (this._isRecording) {
      // Stop recording
      this._isRecording = false;
      if (this._recorder && this._recorder.state === "recording") {
        this._recorder.stop();
      }
      playSound(MIC_OFF_SOUND);
      this._syncUI();
    } else {
      // Start recording
      this._startRecording();
    }
  };

  /* ============================================================
     RECORDING
     ============================================================ */
  VoiceInput.prototype._startRecording = function () {
    var self = this;
    console.log("[VoiceInput][_startRecording] Starting recording flow. _isPermitted:", self._isPermitted);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      self._emit("error", { type: "mic_error", message: "getUserMedia is not available in this browser/context" });
      return;
    }

    console.log("[VoiceInput][_startRecording] Calling getUserMedia({ audio: true }) for recording stream...");
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function (stream) {
      console.log("[VoiceInput][_startRecording] getUserMedia SUCCESS — got recording stream");
      if (!self._isPermitted) {
        self._isPermitted = true;
        self._emit("permission_change", { permitted: true });
      }
      self._stream = stream;
      var recorder = new WavRecorder(stream);
      self._recorder = recorder;
      var blob = null;

      recorder.ondataavailable = function (e) { blob = e.data; };
      recorder.onstop = function () {
        // Release stream
        if (self._stream) {
          self._stream.getTracks().forEach(function (t) { t.stop(); });
          self._stream = null;
        }
        self._recorder = null;

        if (!blob || blob.size === 0) {
          self._emit("error", { type: "no_audio", message: "No audio data recorded" });
          return;
        }

        // Convert to base64 and transcribe
        var reader = new FileReader();
        reader.onloadend = function () {
          var base64 = reader.result.split(",")[1];
          if (!base64) {
            self._emit("error", { type: "no_audio", message: "No audio data" });
            return;
          }
          self._transcribe(base64);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      self._isRecording = true;
      playSound(MIC_ON_SOUND);
      self._syncUI();
    }).catch(function (err) {
      console.log("[VoiceInput][_startRecording] getUserMedia FAILED:", err.name, err.message);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError" ||
          err.message === "permission_denied") {
        self._isPermitted = false;
        self._emit("permission_change", { permitted: false });
        self._emit("error", { type: "permission_denied", message: "Microphone permission denied" });
      } else {
        self._emit("error", { type: "mic_error", message: err.message });
      }
    });
  };

  VoiceInput.prototype._cancelRecording = function () {
    if (this._recorder && this._recorder.state === "recording") {
      this._recorder.ondataavailable = null;
      this._recorder.onstop = null;
      this._recorder.stop();
    }
    if (this._stream) {
      this._stream.getTracks().forEach(function (t) { t.stop(); });
      this._stream = null;
    }
    this._recorder = null;
    this._isRecording = false;
    this._syncUI();
  };

  /* ============================================================
     TRANSCRIPTION
     ============================================================ */
  VoiceInput.prototype._transcribe = function (base64) {
    var self = this;
    self._isLoading = true;
    self._textareaEl.placeholder = "Converting to text";
    self._loadingAudio = playSound(STT_LOADING_SOUND);
    self._syncUI();

    var key = "speech-" + uuid() + ".wav";
    var cdnUrl;

    // Step 1: Get signed URL
    postJSON(SIGNED_URL_ENDPOINT, { bucket: GCS_BUCKET, key: key })
      .then(function (resp) {
        if (!resp.url) throw new Error("Could not get upload URL");
        cdnUrl = resp.cdn_url;

        // Step 2: Upload
        var bin = atob(base64);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return fetch(resp.url, {
          method: "PUT",
          body: bytes.buffer,
          headers: { "Content-Type": "audio/wav" },
        });
      })
      .then(function (uploadResp) {
        if (!uploadResp.ok) throw new Error("Upload failed: " + uploadResp.status);

        // Step 3: Transcribe
        return postJSON(STT_ENDPOINT, { data: { audio_url: cdnUrl } });
      })
      .then(function (sttResp) {
        self._stopLoadingAudio();
        self._isLoading = false;
        self._textareaEl.placeholder = self._placeholder;

        if (!sttResp.transcription) {
          playSound(STT_FAILED_SOUND);
          self._emit("error", { type: "transcription_empty", message: "No transcription returned" });
          self._syncUI();
          return;
        }

        // Append transcription
        if (!self._skipAppend) {
          var newVal = self._input ? self._input + " " + sttResp.transcription : sttResp.transcription;
          self._input = newVal;
          self._textareaEl.value = newVal;
          self._emit("input_change", { value: newVal });
          self._emit("transcript", { text: sttResp.transcription, fullText: newVal });
        }
        self._skipAppend = false;
        self._setFocused(false);
        self._syncUI();
      })
      .catch(function (err) {
        self._stopLoadingAudio();
        self._isLoading = false;
        self._textareaEl.placeholder = self._placeholder;
        if (err.message === "Request timeout") {
          playSound(STT_TIMEOUT_SOUND);
          self._emit("error", { type: "timeout", message: "Transcription timed out" });
        } else {
          playSound(STT_FAILED_SOUND);
          self._emit("error", { type: "transcription_failed", message: err.message });
        }
        self._syncUI();
      });
  };

  VoiceInput.prototype._stopLoadingAudio = function () {
    if (this._loadingAudio) {
      try { this._loadingAudio.pause(); } catch (e) {}
      this._loadingAudio = null;
    }
  };

  /* ============================================================
     PERMISSION — detect on init, request only from user-triggered recording
     ============================================================ */
  VoiceInput.prototype._checkPermission = function () {
    var self = this;
    self._isPermitted = false;
    globalCheckPermission(function (permitted) {
      self._isPermitted = permitted;
      console.log("[VoiceInput][_checkPermission] Instance notified. _isPermitted:", permitted);
      self._emit("permission_change", { permitted: permitted });
    });
  };

  /* ============================================================
     STATE MANAGEMENT
     ============================================================ */
  VoiceInput.prototype._setFocused = function (focused) {
    this._isFocused = focused;
    if (focused && !this._activeOption) {
      this._setActiveOption(this._defaultTool);
    }
    if (!focused) {
      this._activeOption = null;
    }
    this._syncUI();
  };

  VoiceInput.prototype._setActiveOption = function (option) {
    this._activeOption = option;
    if (option === "mic") {
      this._textareaEl.blur();
    }
    this._syncUI();
  };

  /* ============================================================
     UI SYNC — single function that updates all DOM to match state
     ============================================================ */
  VoiceInput.prototype._syncUI = function () {
    var ta = this._textareaEl;

    // Textarea pointer events: only interactive when keyboard or reset is active
    var canType = this._activeOption === "keyboard" || this._activeOption === "reset";
    if (canType) {
      ta.classList.remove("vi-no-pointer");
    } else {
      ta.classList.add("vi-no-pointer");
    }

    // Textarea focus styling
    if (this._isFocused) {
      ta.classList.add("vi-focused");
    } else {
      ta.classList.remove("vi-focused");
    }

    // Background
    ta.classList.remove("vi-bg-correct", "vi-bg-wrong", "vi-bg-neutral");
    if (this._background === "2") ta.classList.add("vi-bg-correct");
    else if (this._background === "3") ta.classList.add("vi-bg-wrong");
    else ta.classList.add("vi-bg-neutral");

    // Placeholder — only show when keyboard/reset active or loading
    if (canType || this._isLoading) {
      ta.placeholder = this._isLoading ? "Converting to text" : this._placeholder;
    } else {
      ta.placeholder = "";
    }

    // Disabled
    if (this._disabled) {
      ta.classList.add("vi-disabled");
    } else {
      ta.classList.remove("vi-disabled");
    }

    // Toolbar icon colors
    var activeColor = "#000FFF";
    var defaultColor = "#4F4F4F";
    if (this._micBtnEl) this._micBtnEl.innerHTML = icon(MIC_ICON, this._activeOption === "mic" ? activeColor : defaultColor);
    if (this._kbBtnEl) this._kbBtnEl.innerHTML = icon(KEYBOARD_ICON, this._activeOption === "keyboard" ? activeColor : defaultColor);
    if (this._resetBtnEl) this._resetBtnEl.innerHTML = icon(RESET_ICON, this._activeOption === "reset" ? activeColor : defaultColor);

    // Drawer visibility
    var showDrawer = ((this._isFocused && this._activeOption === "mic") || this._isRecording) && !this._isLoading;
    if (showDrawer) {
      this._drawerEl.classList.remove("vi-hidden");
    } else {
      this._drawerEl.classList.add("vi-hidden");
    }

    // Mic toggle button state
    if (this._isRecording) {
      this._micToggleEl.classList.add("vi-recording");
      this._micToggleEl.innerHTML = STOP_ICON;
    } else {
      this._micToggleEl.classList.remove("vi-recording");
      this._micToggleEl.innerHTML = icon(MIC_ICON, "#fff");
    }
    this._micToggleEl.disabled = this._isLoading;

    // Drawer label
    if (this._isLoading) {
      this._drawerLabelEl.textContent = "Converting to text";
    } else if (this._isRecording) {
      this._drawerLabelEl.textContent = "Tap to stop recording";
    } else {
      this._drawerLabelEl.textContent = "Tap to speak";
    }
  };

  /* ============================================================
     PUBLIC API
     ============================================================ */
  /** Get the current input value */
  VoiceInput.prototype.getValue = function () {
    return this._input;
  };

  /** Set input value programmatically */
  VoiceInput.prototype.setValue = function (text) {
    this._input = text;
    this._textareaEl.value = text;
    this._emit("input_change", { value: text });
  };

  /** Clear input */
  VoiceInput.prototype.clear = function () {
    this.setValue("");
  };

  /** Mark correct (green background) */
  VoiceInput.prototype.markCorrect = function () {
    this._background = "2";
    this._syncUI();
  };

  /** Mark wrong (red background) */
  VoiceInput.prototype.markWrong = function () {
    this._background = "3";
    this._syncUI();
  };

  /** Clear mark (neutral background) */
  VoiceInput.prototype.clearMark = function () {
    this._background = "1";
    this._syncUI();
  };

  /** Disable all interaction */
  VoiceInput.prototype.disable = function () {
    this._disabled = true;
    if (this._isRecording) this._cancelRecording();
    this._syncUI();
  };

  /** Enable interaction */
  VoiceInput.prototype.enable = function () {
    this._disabled = false;
    this._syncUI();
  };

  /** Highlight wrapper (blue glow) */
  VoiceInput.prototype.highlight = function () {
    this._wrapperEl.classList.add("vi-highlight");
  };

  /** Remove highlight */
  VoiceInput.prototype.unhighlight = function () {
    this._wrapperEl.classList.remove("vi-highlight");
  };

  /** Destroy instance and clean up */
  VoiceInput.prototype.destroy = function () {
    if (this._isRecording) this._cancelRecording();
    if (this._drawerEl && this._drawerEl.parentNode) {
      this._drawerEl.parentNode.removeChild(this._drawerEl);
    }
    if (this._outsideClickHandler) {
      document.removeEventListener("click", this._outsideClickHandler);
    }
    this._container.innerHTML = "";
    this._listeners = {};
  };

  /* ============================================================
     EVENT SYSTEM
     ============================================================ */
  VoiceInput.prototype.on = function (event, fn) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(fn);
  };

  VoiceInput.prototype.off = function (event, fn) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(function (f) { return f !== fn; });
  };

  VoiceInput.prototype._emit = function (event, data) {
    var fns = this._listeners[event];
    if (!fns) return;
    for (var i = 0; i < fns.length; i++) {
      try { fns[i](data); } catch (e) { console.error("[VoiceInput] Event handler error:", e); }
    }
  };

  /* ============================================================
     HTTP HELPER
     ============================================================ */
  function postJSON(url, body) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = STT_TIMEOUT;
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { reject(new Error("Invalid JSON response")); }
        } else {
          reject(new Error("HTTP " + xhr.status));
        }
      };
      xhr.onerror = function () { reject(new Error("Network error")); };
      xhr.ontimeout = function () { reject(new Error("Request timeout")); };
      xhr.send(JSON.stringify(body));
    });
  }

  /* ============================================================
     EXPORT
     ============================================================ */
  window.VoiceInput = VoiceInput;

})(window);
