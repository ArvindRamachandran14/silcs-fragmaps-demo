const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4174;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const MIME_TYPES = {
  ".css": "text/css; charset=UTF-8",
  ".html": "text/html; charset=UTF-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".map": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=UTF-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function detectPublicBaseFromIndexHtml() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    return "/";
  }

  const html = fs.readFileSync(INDEX_HTML_PATH, "utf-8");
  const scriptSrcMatch = html.match(/<script[^>]+src="([^"]+)"/i);
  if (!scriptSrcMatch) {
    return "/";
  }

  const scriptUrl = scriptSrcMatch[1];
  const jsSegmentIndex = scriptUrl.indexOf("/js/");
  if (jsSegmentIndex === -1) {
    return "/";
  }

  const candidateBase = scriptUrl.slice(0, jsSegmentIndex + 1);
  if (!candidateBase.startsWith("/")) {
    return "/";
  }

  return candidateBase.endsWith("/") ? candidateBase : `${candidateBase}/`;
}

const PUBLIC_BASE = detectPublicBaseFromIndexHtml();

function appUrl(routePath = "/") {
  const normalizedPath = routePath.startsWith("/") ? routePath.slice(1) : routePath;
  return `${BASE_URL}${PUBLIC_BASE}${normalizedPath}`;
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

function resolveRequestPath(urlPath) {
  const cleanUrl = urlPath.split("?")[0].split("#")[0];
  let appRelativePath = cleanUrl;
  if (cleanUrl === PUBLIC_BASE.slice(0, -1) || cleanUrl === PUBLIC_BASE) {
    appRelativePath = "/";
  } else if (cleanUrl.startsWith(PUBLIC_BASE)) {
    appRelativePath = `/${cleanUrl.slice(PUBLIC_BASE.length)}`;
  }

  const normalizedPath = appRelativePath === "/" ? "/index.html" : appRelativePath;
  const requestedPath = path.join(DIST_DIR, decodeURIComponent(normalizedPath));
  const safeRequestedPath = path.normalize(requestedPath);

  if (!safeRequestedPath.startsWith(DIST_DIR)) {
    return null;
  }

  if (fs.existsSync(safeRequestedPath) && fs.statSync(safeRequestedPath).isFile()) {
    return safeRequestedPath;
  }

  return path.join(DIST_DIR, "index.html");
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const filePath = resolveRequestPath(req.url || "/");

      if (!filePath || !fs.existsSync(filePath)) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": getMimeType(filePath) });
      fs.createReadStream(filePath).pipe(res);
    });

    server.on("error", reject);
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function assertVisible(page, selector, message) {
  await page.waitForSelector(selector, { timeout: 5000 });
  const visible = await page.isVisible(selector);
  assert(visible, message);
}

async function main() {
  assert(fs.existsSync(INDEX_HTML_PATH), "dist/index.html missing. Run `npm run build`.");

  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(appUrl("/viewer?m3LoadMs=1200"), { waitUntil: "domcontentloaded" });

    await assertVisible(page, '[data-test-id="viewer-loading-state"]', "Viewer loading state did not render.");
    await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not transition to ready state.");

    const loadingStillVisible = await page.isVisible('[data-test-id="viewer-loading-state"]');
    assert(!loadingStillVisible, "Loading state remained visible after ready state.");

    const ligandState = await page.textContent('[data-test-id="default-ligand-id"]');
    const baselineState = await page.textContent('[data-test-id="baseline-pose-state"]');
    const refinedState = await page.textContent('[data-test-id="refined-pose-state"]');
    const mapsState = await page.textContent('[data-test-id="visible-fragmaps-state"]');

    assert((ligandState || "").trim() === "3fly_cryst_lig", "Default ligand was not 3fly_cryst_lig.");
    assert((baselineState || "").trim() === "ON", "Baseline pose was not ON by default.");
    assert((refinedState || "").trim() === "OFF", "Refined pose was not OFF by default.");
    assert((mapsState || "").trim() === "0", "FragMaps were not hidden by default.");

    const desktopLayoutFit = await page.evaluate(() => {
      const controlsPanel = document.querySelector('[data-test-id="controls-panel"]');
      if (!controlsPanel) {
        return { hasPanel: false, isClipped: true, hasOverflow: true };
      }

      const panelRect = controlsPanel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const bodyHasHorizontalOverflow = document.documentElement.scrollWidth > viewportWidth;
      const panelIsClipped = panelRect.right > viewportWidth + 1 || panelRect.left < -1;

      return {
        hasPanel: true,
        hasOverflow: bodyHasHorizontalOverflow,
        isClipped: panelIsClipped,
      };
    });

    assert(desktopLayoutFit.hasPanel, "Desktop controls panel did not render.");
    assert(!desktopLayoutFit.hasOverflow, "Viewer page has horizontal overflow on desktop.");
    assert(!desktopLayoutFit.isClipped, "Desktop controls panel is clipped off-screen.");

    const baselineCamera = await page.textContent('[data-test-id="camera-baseline-contract"]');
    assert(Boolean((baselineCamera || "").includes('"position"')), "Camera baseline contract block missing.");

    await page.click('[data-test-id="viewer-reset-view"]');
    const currentCameraAfterReset = await page.textContent('[data-test-id="camera-snapshot"]');
    assert(
      (baselineCamera || "").trim() === (currentCameraAfterReset || "").trim(),
      "Reset view did not resolve to the baseline camera snapshot.",
    );

    const cameraBeforeResize = await page.textContent('[data-test-id="camera-snapshot"]');
    await page.setViewportSize({ width: 1180, height: 760 });
    await page.evaluate(() => {
      window.dispatchEvent(new Event("resize"));
    });
    await page.waitForTimeout(100);

    const cameraAfterResize = await page.textContent('[data-test-id="camera-snapshot"]');
    assert(cameraBeforeResize === cameraAfterResize, "Camera snapshot changed after resize.");

    const resizePreserved = await page.evaluate(() => {
      return window.__viewerM3Debug && window.__viewerM3Debug.lastResizeCameraPreserved;
    });
    assert(Boolean(resizePreserved), "Resize handler did not report camera preservation.");

    const listenerStatsInitial = await page.evaluate(() => {
      return {
        active: window.__viewerM3Debug && window.__viewerM3Debug.activeResizeListeners,
        peak: window.__viewerM3Debug && window.__viewerM3Debug.peakResizeListeners,
      };
    });

    assert(listenerStatsInitial.active === 1, "Expected one active resize listener after startup.");

    await page.click('[data-test-id="viewer-go-home"]');
    await page.waitForURL(appUrl("/"));
    await page.goto(appUrl("/viewer"), { waitUntil: "domcontentloaded" });
    await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not remount to ready state.");

    const listenerStatsAfterRemount = await page.evaluate(() => {
      return {
        active: window.__viewerM3Debug && window.__viewerM3Debug.activeResizeListeners,
        peak: window.__viewerM3Debug && window.__viewerM3Debug.peakResizeListeners,
      };
    });

    assert(listenerStatsAfterRemount.active === 1, "Active resize listeners were duplicated after remount.");
    assert(listenerStatsAfterRemount.peak === 1, "Peak resize listeners exceeded one, indicating duplicate binds.");

    await page.goto(appUrl("/viewer?m3StageFail=1"), { waitUntil: "networkidle" });
    await assertVisible(page, '[data-test-id="viewer-startup-fallback"]', "Fallback UI did not render on forced failure.");
    await assertVisible(page, '[data-test-id="viewer-retry-startup"]', "Retry action missing in fallback UI.");
    await assertVisible(page, '[data-test-id="viewer-fallback-home"]', "Home navigation action missing in fallback UI.");

    await page.click('[data-test-id="viewer-retry-startup"]');
    await page.waitForURL((url) => {
      const viewerPath = `${PUBLIC_BASE}viewer`;
      return url.pathname === viewerPath && !url.searchParams.has("m3StageFail");
    });
    await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Retry action did not recover viewer startup.");

    await page.goto(appUrl("/viewer?m3StageFail=1"), { waitUntil: "networkidle" });
    await assertVisible(page, '[data-test-id="viewer-startup-fallback"]', "Fallback UI did not render for home-action check.");
    await page.click('[data-test-id="viewer-fallback-home"]');
    await page.waitForURL(appUrl("/"));

    console.log("M3 validation passed:");
    console.log("- /viewer shows loading then ready state");
    console.log("- default state contract is applied");
    console.log("- desktop layout keeps controls panel fully visible with no horizontal overflow");
    console.log("- camera baseline contract and reset-view target are enforced");
    console.log("- resize preserves camera snapshot");
    console.log("- unmount/remount avoids listener duplication");
    console.log("- forced stage-init failure shows fallback with retry/home recovery");
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`M3 validation failed: ${message}`);
  process.exit(1);
});
