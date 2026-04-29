/**
 * Playwright tests for VoiceInput package (with UI).
 *
 * Tests: DOM rendering, toolbar, states, recording flow, transcription,
 * drawer behavior, public API, event system.
 *
 * Usage: node test.js
 */

const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 9899;

function createTestHTML() {
  var packageJS = fs.readFileSync(path.join(__dirname, "index.js"), "utf-8");
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>VoiceInput Test</title></head>
<body>
<div id="vi-container"></div>
<div id="vi2"></div>
<script>${packageJS}</script>
</body></html>`;
}

(async function () {
  var passed = 0, failed = 0;

  function pass(msg) { passed++; console.log("  [PASS] " + msg); }
  function fail(msg) { failed++; console.log("  [FAIL] " + msg); }

  var html = createTestHTML();
  var server = http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  });
  await new Promise(function (r) { server.listen(PORT, r); });

  var browser = await chromium.launch({ headless: true });
  var context = await browser.newContext();
  await context.grantPermissions(["microphone"]);
  var page = await context.newPage();

  // Mock getUserMedia
  await page.addInitScript(function () {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.mediaDevices.getUserMedia = function (constraints) {
      if (constraints && constraints.audio) {
        var ctx = new AudioContext();
        var osc = ctx.createOscillator();
        osc.frequency.value = 440;
        var dest = ctx.createMediaStreamDestination();
        osc.connect(dest);
        osc.start();
        return Promise.resolve(dest.stream);
      }
      return Promise.reject(new Error("Not supported"));
    };
  });

  await page.goto("http://localhost:" + PORT);

  console.log("\n========== VoiceInput Package Tests ==========\n");

  // 1. Global exists
  var exists = await page.evaluate(function () {
    return typeof window.VoiceInput === "function";
  });
  exists ? pass("window.VoiceInput is a function") : fail("window.VoiceInput not found");

  // 2. Throws on missing container
  var throwsOnMissing = await page.evaluate(function () {
    try { new VoiceInput("nonexistent"); return false; }
    catch (e) { return e.message.indexOf("not found") !== -1; }
  });
  throwsOnMissing ? pass("Throws when container not found") : fail("Doesn't throw on missing container");

  // 3. Renders textarea
  var hasTa = await page.evaluate(function () {
    var vi = new VoiceInput("vi-container", { placeholder: "Test placeholder" });
    window._vi = vi;
    return {
      hasTextarea: !!document.querySelector("#vi-container .vi-textarea"),
      hasToolbar: !!document.querySelector("#vi-container .vi-toolbar"),
      hasDrawer: !!document.querySelector(".vi-drawer"),
    };
  });
  hasTa.hasTextarea ? pass("Renders textarea") : fail("Missing textarea");
  hasTa.hasToolbar ? pass("Renders toolbar") : fail("Missing toolbar");
  hasTa.hasDrawer ? pass("Renders drawer (hidden)") : fail("Missing drawer");

  // 4. Toolbar has mic, keyboard, reset buttons
  var toolButtons = await page.evaluate(function () {
    return {
      mic: !!document.querySelector("#vi-container .vi-tool-mic"),
      keyboard: !!document.querySelector("#vi-container .vi-tool-keyboard"),
      reset: !!document.querySelector("#vi-container .vi-tool-reset"),
    };
  });
  toolButtons.mic ? pass("Toolbar has mic button") : fail("Missing mic button");
  toolButtons.keyboard ? pass("Toolbar has keyboard button") : fail("Missing keyboard button");
  toolButtons.reset ? pass("Toolbar has reset button") : fail("Missing reset button");

  // 5. Drawer is hidden initially
  var drawerHidden = await page.evaluate(function () {
    return document.querySelector(".vi-drawer").classList.contains("vi-hidden");
  });
  drawerHidden ? pass("Drawer hidden initially") : fail("Drawer visible initially");

  // 6. Clicking mic tool shows drawer
  var drawerShown = await page.evaluate(function () {
    document.querySelector("#vi-container .vi-tool-mic").click();
    return !document.querySelector(".vi-drawer").classList.contains("vi-hidden");
  });
  drawerShown ? pass("Clicking mic shows drawer") : fail("Drawer not shown after mic click");

  // 7. Mic icon color changes when active
  var micActive = await page.evaluate(function () {
    var svg = document.querySelector("#vi-container .vi-tool-mic svg path");
    return svg && svg.getAttribute("fill") === "#000FFF";
  });
  micActive ? pass("Mic icon turns blue when active") : fail("Mic icon color wrong");

  // 8. Clicking keyboard hides drawer, enables textarea
  var kbClick = await page.evaluate(function () {
    document.querySelector("#vi-container .vi-tool-keyboard").click();
    var drawerHidden = document.querySelector(".vi-drawer").classList.contains("vi-hidden");
    var taInteractive = !document.querySelector("#vi-container .vi-textarea").classList.contains("vi-no-pointer");
    var kbSvg = document.querySelector("#vi-container .vi-tool-keyboard svg path");
    var kbBlue = kbSvg && kbSvg.getAttribute("fill") === "#000FFF";
    return { drawerHidden: drawerHidden, taInteractive: taInteractive, kbBlue: kbBlue };
  });
  kbClick.drawerHidden ? pass("Keyboard click hides drawer") : fail("Drawer still visible after keyboard click");
  kbClick.taInteractive ? pass("Textarea interactive in keyboard mode") : fail("Textarea not interactive");
  kbClick.kbBlue ? pass("Keyboard icon turns blue when active") : fail("Keyboard icon color wrong");

  // 9. Reset clears input
  var resetWorks = await page.evaluate(function () {
    var vi = window._vi;
    vi.setValue("hello world");
    document.querySelector("#vi-container .vi-tool-reset").click();
    return { value: vi.getValue(), taValue: document.querySelector("#vi-container .vi-textarea").value };
  });
  (resetWorks.value === "" && resetWorks.taValue === "")
    ? pass("Reset clears input")
    : fail("Reset didn't clear: " + JSON.stringify(resetWorks));

  // 10. setValue / getValue
  var setGet = await page.evaluate(function () {
    var vi = window._vi;
    vi.setValue("test 123");
    var g = vi.getValue();
    var dom = document.querySelector("#vi-container .vi-textarea").value;
    return { get: g, dom: dom };
  });
  (setGet.get === "test 123" && setGet.dom === "test 123")
    ? pass("setValue/getValue work")
    : fail("setValue/getValue failed: " + JSON.stringify(setGet));

  // 11. clear()
  var cleared = await page.evaluate(function () {
    var vi = window._vi;
    vi.clear();
    return vi.getValue();
  });
  (cleared === "") ? pass("clear() works") : fail("clear() didn't clear");

  // 12. value property (read-only)
  var valueProp = await page.evaluate(function () {
    var vi = window._vi;
    vi.setValue("prop test");
    return vi.value === "prop test";
  });
  valueProp ? pass("value property returns current input") : fail("value property wrong");

  // 13. markCorrect / markWrong / clearMark
  var marks = await page.evaluate(function () {
    var vi = window._vi;
    var ta = document.querySelector("#vi-container .vi-textarea");
    vi.markCorrect();
    var hasCorrect = ta.classList.contains("vi-bg-correct");
    vi.markWrong();
    var hasWrong = ta.classList.contains("vi-bg-wrong");
    var noCorrectAfterWrong = !ta.classList.contains("vi-bg-correct");
    vi.clearMark();
    var hasNeutral = ta.classList.contains("vi-bg-neutral");
    var noWrong = !ta.classList.contains("vi-bg-wrong");
    return { hasCorrect: hasCorrect, hasWrong: hasWrong, noCorrectAfterWrong: noCorrectAfterWrong, hasNeutral: hasNeutral, noWrong: noWrong };
  });
  marks.hasCorrect ? pass("markCorrect() adds green bg") : fail("markCorrect failed");
  (marks.hasWrong && marks.noCorrectAfterWrong) ? pass("markWrong() replaces with red bg") : fail("markWrong failed");
  (marks.hasNeutral && marks.noWrong) ? pass("clearMark() restores neutral bg") : fail("clearMark failed");

  // 14. disable / enable
  var disState = await page.evaluate(function () {
    var vi = window._vi;
    vi.disable();
    var disabled = document.querySelector("#vi-container .vi-textarea").classList.contains("vi-disabled");
    vi.enable();
    var enabled = !document.querySelector("#vi-container .vi-textarea").classList.contains("vi-disabled");
    return { disabled: disabled, enabled: enabled };
  });
  disState.disabled ? pass("disable() disables textarea") : fail("disable() failed");
  disState.enabled ? pass("enable() enables textarea") : fail("enable() failed");

  // 15. Event system: input_change fires on setValue
  var evtFired = await page.evaluate(function () {
    var vi = window._vi;
    var received = [];
    vi.on("input_change", function (d) { received.push(d.value); });
    vi.setValue("evt1");
    vi.setValue("evt2");
    vi.clear();
    return received;
  });
  (evtFired.length === 3 && evtFired[0] === "evt1" && evtFired[1] === "evt2" && evtFired[2] === "")
    ? pass("input_change events fire correctly")
    : fail("Events wrong: " + JSON.stringify(evtFired));

  // 16. off() removes listener
  var offWorks = await page.evaluate(function () {
    var vi = window._vi;
    var count = 0;
    var fn = function () { count++; };
    vi.on("input_change", fn);
    vi.setValue("a");
    vi.off("input_change", fn);
    vi.setValue("b");
    return count;
  });
  (offWorks === 1) ? pass("off() removes listener") : fail("off() didn't work: " + offWorks);

  // 17. isRecording defaults false
  var recDefault = await page.evaluate(function () {
    return window._vi.isRecording === false;
  });
  recDefault ? pass("isRecording defaults to false") : fail("isRecording not false");

  // 18. isLoading defaults false
  var loadDefault = await page.evaluate(function () {
    return window._vi.isLoading === false;
  });
  loadDefault ? pass("isLoading defaults to false") : fail("isLoading not false");

  // 19. Click outside hides drawer
  var outsideClick = await page.evaluate(function () {
    // First show drawer
    document.querySelector("#vi-container .vi-tool-mic").click();
    var shown = !document.querySelector(".vi-drawer").classList.contains("vi-hidden");
    // Click outside
    document.body.click();
    var hidden = document.querySelector(".vi-drawer").classList.contains("vi-hidden");
    return { shown: shown, hidden: hidden };
  });
  (outsideClick.shown && outsideClick.hidden)
    ? pass("Click outside hides drawer")
    : fail("Outside click: " + JSON.stringify(outsideClick));

  // 20. CSS injected
  var cssOk = await page.evaluate(function () {
    var styles = document.querySelectorAll("style");
    for (var i = 0; i < styles.length; i++) {
      if (styles[i].textContent.indexOf("vi-textarea") !== -1 &&
          styles[i].textContent.indexOf("vi-mic-toggle") !== -1 &&
          styles[i].textContent.indexOf("vi-smoothPadAfter") !== -1) return true;
    }
    return false;
  });
  cssOk ? pass("CSS injected with animations") : fail("CSS not found");

  // 21. Full record → transcription pipeline
  var pipeline = await page.evaluate(function () {
    return new Promise(function (resolve) {
      var vi = window._vi;
      vi.clear();

      // Mock XHR
      var OrigXHR = window.XMLHttpRequest;
      window.XMLHttpRequest = function () {
        var xhr = {
          _headers: {},
          open: function (m, url) { xhr._url = url; },
          setRequestHeader: function () {},
          send: function () {
            setTimeout(function () {
              if (xhr._url.indexOf("getSignedUrlForUpload") !== -1) {
                xhr.status = 200;
                xhr.responseText = JSON.stringify({ url: "https://mock.test/up", cdn_url: "https://mock.test/a.wav" });
                if (xhr.onload) xhr.onload();
              } else if (xhr._url.indexOf("speechToText") !== -1) {
                xhr.status = 200;
                xhr.responseText = JSON.stringify({ transcription: "hello world" });
                if (xhr.onload) xhr.onload();
              }
            }, 10);
          },
          timeout: 0, onload: null, onerror: null, ontimeout: null,
        };
        return xhr;
      };
      var origFetch = window.fetch;
      window.fetch = function (url, opts) {
        if (opts && opts.method === "PUT") return Promise.resolve({ ok: true });
        return origFetch(url, opts);
      };

      // Listen for transcript event
      vi.on("transcript", function (d) {
        window.XMLHttpRequest = OrigXHR;
        window.fetch = origFetch;
        resolve({ text: d.text, fullText: d.fullText, value: vi.getValue() });
      });

      vi.on("error", function (d) {
        window.XMLHttpRequest = OrigXHR;
        window.fetch = origFetch;
        resolve({ error: d.type + ": " + d.message });
      });

      // Show drawer and click mic toggle
      document.querySelector("#vi-container .vi-tool-mic").click();

      // Small delay for drawer to appear
      setTimeout(function () {
        // Click mic toggle to start recording
        document.querySelector(".vi-mic-toggle").click();

        // Wait for recording, then stop
        setTimeout(function () {
          document.querySelector(".vi-mic-toggle").click();
        }, 300);
      }, 50);
    });
  });

  if (pipeline.text === "hello world") {
    pass("Full pipeline: transcript event with '" + pipeline.text + "'");
  } else {
    fail("Pipeline failed: " + JSON.stringify(pipeline));
  }
  if (pipeline.value === "hello world") {
    pass("Input value updated after transcription");
  } else {
    fail("Input not updated: " + pipeline.value);
  }

  // 22. Highlight / unhighlight
  var highlight = await page.evaluate(function () {
    var vi = window._vi;
    vi.highlight();
    var has = document.querySelector("#vi-container .vi-wrapper").classList.contains("vi-highlight");
    vi.unhighlight();
    var gone = !document.querySelector("#vi-container .vi-wrapper").classList.contains("vi-highlight");
    return { has: has, gone: gone };
  });
  highlight.has ? pass("highlight() adds glow") : fail("highlight() failed");
  highlight.gone ? pass("unhighlight() removes glow") : fail("unhighlight() failed");

  // 23. Configurable tools (subset)
  var subsetTools = await page.evaluate(function () {
    var vi = new VoiceInput("vi2", { tools: ["mic", "keyboard"] });
    return {
      hasMic: !!document.querySelector("#vi2 .vi-tool-mic"),
      hasKb: !!document.querySelector("#vi2 .vi-tool-keyboard"),
      hasReset: !!document.querySelector("#vi2 .vi-tool-reset"),
    };
  });
  (subsetTools.hasMic && subsetTools.hasKb && !subsetTools.hasReset)
    ? pass("Configurable tools: mic+keyboard only, no reset")
    : fail("Tool config failed: " + JSON.stringify(subsetTools));

  // 24. Destroy
  var destroyed = await page.evaluate(function () {
    var vi = window._vi;
    vi.destroy();
    return {
      containerEmpty: document.getElementById("vi-container").innerHTML === "",
      drawerGone: !document.querySelector(".vi-drawer"),
    };
  });
  destroyed.containerEmpty ? pass("destroy() clears container") : fail("Container not cleared");

  // Summary
  console.log("\n========================================");
  console.log("  VoiceInput Tests: " + passed + " passed, " + failed + " failed");
  console.log("========================================\n");

  await browser.close();
  server.close();
  process.exit(failed > 0 ? 1 : 0);
})();
