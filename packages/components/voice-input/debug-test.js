const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = __dirname;
const PORT = 9877;

// Simple static file server
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let filePath = path.join(DIR, req.url === "/" ? "demo.html" : req.url);
      const ext = path.extname(filePath);
      const mimeTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
      };
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
        res.end(data);
      });
    });
    server.listen(PORT, () => {
      console.log(`[Server] Listening on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

(async () => {
  const server = await startServer();
  const consoleLogs = [];

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      permissions: ["microphone"],
    });

    // Mock getUserMedia before any page loads
    await context.addInitScript(() => {
      // Override getUserMedia to return a fake audio stream
      const originalGetUserMedia =
        navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      navigator.mediaDevices.getUserMedia = async function (constraints) {
        if (constraints && constraints.audio) {
          console.log(
            "[MOCK] getUserMedia called with audio constraint — returning fake stream"
          );
          const audioCtx = new AudioContext();
          const oscillator = audioCtx.createOscillator();
          oscillator.frequency.setValueAt && oscillator.frequency.setValueAt(440);
          const dest = audioCtx.createMediaStreamDestination();
          oscillator.connect(dest);
          oscillator.start();
          // Return the fake stream
          return dest.stream;
        }
        // For non-audio, fall through to original
        return originalGetUserMedia(constraints);
      };
    });

    const page = await context.newPage();

    // Capture ALL console logs
    page.on("console", (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
    });

    // Also capture page errors
    page.on("pageerror", (err) => {
      consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
    });

    console.log("[Test] Navigating to demo.html...");
    await page.goto(`http://localhost:${PORT}/demo.html`, {
      waitUntil: "networkidle",
    });

    // Wait a bit for permission checks to complete
    await page.waitForTimeout(1000);

    // Step 4: Screenshot after page load
    const ssDir = DIR;
    await page.screenshot({
      path: path.join(ssDir, "screenshot-1-page-loaded.png"),
      fullPage: true,
    });
    console.log("[Test] Screenshot 1: page loaded");

    // Step 5: Click the mic icon in the FIRST card's toolbar
    // The first card contains #demo-basic, its toolbar has a .vi-tool-mic button
    const firstMicBtn = page.locator("#demo-basic .vi-tool-mic").first();
    await firstMicBtn.click();
    console.log("[Test] Clicked mic icon in first card toolbar");

    // Wait for drawer to appear
    await page.waitForTimeout(500);

    // Step 6: Screenshot showing drawer open
    await page.screenshot({
      path: path.join(ssDir, "screenshot-2-drawer-open.png"),
      fullPage: true,
    });
    console.log("[Test] Screenshot 2: drawer open");

    // Step 7: Click the big mic toggle button in the drawer to start recording
    // The drawer's mic toggle has class .vi-mic-toggle
    // There are multiple drawers (one per VoiceInput instance), find the visible one
    const visibleMicToggle = page
      .locator(".vi-drawer:not(.vi-hidden) .vi-mic-toggle")
      .first();
    await visibleMicToggle.click();
    console.log("[Test] Clicked big mic toggle to start recording");

    // Step 8: Wait 500ms
    await page.waitForTimeout(500);

    // Step 9: Click the big mic toggle again to stop recording
    // After recording starts, the button may still be in the visible drawer
    const stopToggle = page
      .locator(".vi-drawer:not(.vi-hidden) .vi-mic-toggle")
      .first();
    await stopToggle.click();
    console.log("[Test] Clicked big mic toggle to stop recording");

    // Wait for any async processing
    await page.waitForTimeout(1000);

    // Step 10: Screenshot after stop
    await page.screenshot({
      path: path.join(ssDir, "screenshot-3-after-stop.png"),
      fullPage: true,
    });
    console.log("[Test] Screenshot 3: after stop recording");

    await browser.close();
  } catch (err) {
    console.error("[Test] Error:", err);
  } finally {
    server.close();
  }

  // Step 11: Print ALL captured console logs
  console.log("\n" + "=".repeat(70));
  console.log("ALL CAPTURED CONSOLE LOGS (" + consoleLogs.length + " entries)");
  console.log("=".repeat(70));
  consoleLogs.forEach((log, i) => {
    console.log(`  ${i + 1}. ${log}`);
  });
  console.log("=".repeat(70));
})();
