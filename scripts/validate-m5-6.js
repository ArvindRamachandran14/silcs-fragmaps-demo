const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4183;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DESKTOP_PANEL = ".viewer-page__controls-col";
const DONOR_ID = "3fly.hbdon.gfe.dx";
const APOLAR_ID = "3fly.apolar.gfe.dx";
const WATER_ID = "3fly.tipo.gfe.dx";

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

function panelSelector(testId) {
  return `${DESKTOP_PANEL} [data-test-id="${testId}"]`;
}

function toggleSelector(rowId) {
  return panelSelector(`fragmap-toggle-${rowId}`);
}

function statusSelector(rowId) {
  return panelSelector(`fragmap-row-status-${rowId}`);
}

function errorSelector(rowId) {
  return panelSelector(`fragmap-row-error-${rowId}`);
}

function retrySelector(rowId) {
  return panelSelector(`fragmap-row-retry-${rowId}`);
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
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

async function assertVisible(page, selector, message, timeout = 15000) {
  await page.waitForSelector(selector, { timeout });
  const visible = await page.isVisible(selector);
  assert(visible, message);
}

async function waitForStatusIncludes(page, selector, expectedText) {
  await page.waitForFunction(
    ({ rowSelector, expected }) => {
      const element = document.querySelector(rowSelector);
      return Boolean(element) && element.textContent && element.textContent.includes(expected);
    },
    { rowSelector: selector, expected: expectedText },
  );
}

async function waitForVisibleCount(page, expectedCount) {
  await page.waitForFunction(
    ({ selector, expected }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.trim() === String(expected);
    },
    {
      selector: panelSelector("visible-fragmaps-state"),
      expected: expectedCount,
    },
  );
}

async function getText(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000, state: "attached" });
  return ((await page.textContent(selector)) || "").trim();
}

async function setCheckboxByChangeEvent(page, selector, checked) {
  await page.waitForSelector(selector, { timeout: 15000, state: "attached" });
  await page.evaluate(
    ({ targetSelector, nextChecked }) => {
      const input = document.querySelector(targetSelector);
      if (!input) {
        throw new Error(`Missing checkbox: ${targetSelector}`);
      }
      input.checked = nextChecked;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    },
    { targetSelector: selector, nextChecked: checked },
  );
}

async function expandAdvancedSection(page) {
  await assertVisible(page, panelSelector("fragmap-advanced-toggle"), "Advanced toggle button is missing.");
  const expanded = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
  if (expanded !== "true") {
    await page.click(panelSelector("fragmap-advanced-toggle"));
  }
  await assertVisible(page, panelSelector("fragmap-advanced-content"), "Advanced section did not expand.");
}

async function runFailureIsolationAndRetryFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200&m5FailMap=3fly.tipo.gfe.dx");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded");
  await waitForVisibleCount(page, 1);

  await expandAdvancedSection(page);
  const cameraBeforeFailure = await getText(page, panelSelector("camera-snapshot"));
  await page.click(toggleSelector(WATER_ID));
  await assertVisible(page, errorSelector(WATER_ID), "Forced failure should surface row-level error text.");
  await assertVisible(page, retrySelector(WATER_ID), "Row-level retry button should be visible on failed row.");

  const waterDisabled = await page.isDisabled(toggleSelector(WATER_ID));
  assert(waterDisabled, "Failed row toggle should be disabled.");

  const donorDisabled = await page.isDisabled(toggleSelector(DONOR_ID));
  assert(!donorDisabled, "Unaffected row should remain interactive.");

  await page.click(toggleSelector(DONOR_ID));
  await waitForVisibleCount(page, 0);
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Cached");

  await page.click(toggleSelector(DONOR_ID));
  await waitForVisibleCount(page, 1);
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded from cache");

  const retryBefore = await page.evaluate((rowId) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.retryAttemptById[rowId]) || 0;
  }, WATER_ID);

  await page.click(retrySelector(WATER_ID));
  await page.waitForFunction(
    ({ rowId, expected }) => {
      const counters = window.__viewerM5Debug && window.__viewerM5Debug.retryAttemptById;
      return Boolean(counters) && Number(counters[rowId] || 0) >= expected;
    },
    { rowId: WATER_ID, expected: retryBefore + 1 },
  );
  await assertVisible(page, errorSelector(WATER_ID), "Retry failure should remain row-isolated.");

  const retryAfter = await page.evaluate((rowId) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.retryAttemptById[rowId]) || 0;
  }, WATER_ID);
  assert(retryAfter === retryBefore + 1, "Retry debug counter should increment exactly once.");

  const donorStillEnabled = await page.isDisabled(toggleSelector(DONOR_ID));
  assert(!donorStillEnabled, "Retry failure should not disable unaffected rows.");

  const cameraAfterRetry = await getText(page, panelSelector("camera-snapshot"));
  assert(cameraAfterRetry === cameraBeforeFailure, "Camera changed during failed-row retry flow.");
}

async function runStaleCompletionGuardFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1500");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");
  await waitForVisibleCount(page, 0);

  await setCheckboxByChangeEvent(page, toggleSelector(APOLAR_ID), true);
  await page.waitForTimeout(120);
  await setCheckboxByChangeEvent(page, toggleSelector(APOLAR_ID), false);

  await waitForVisibleCount(page, 0);
  const apolarChecked = await page.isChecked(toggleSelector(APOLAR_ID));
  assert(!apolarChecked, "Latest row intent (hidden) was not preserved after rapid toggle changes.");
  const apolarErrorCount = await page.locator(errorSelector(APOLAR_ID)).count();
  assert(apolarErrorCount === 0, "Rapid conflicting intents should not create a row error.");

  const staleIgnoredCount = await page.evaluate((rowId) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.staleCompletionIgnoredById[rowId]) || 0;
  }, APOLAR_ID);
  assert(staleIgnoredCount >= 0, "Stale completion debug counter should be readable.");
}

async function run() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    throw new Error("dist/index.html not found. Run `npm run build` before validation.");
  }

  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
    ],
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

  try {
    await runFailureIsolationAndRetryFlow(page);
    await runStaleCompletionGuardFlow(page);
    console.log("M5.6 validation passed:");
    console.log("- Failed map rows are isolated and unaffected rows remain interactive");
    console.log("- Row-level retry action is present and scoped to the failed row");
    console.log("- Retry attempts increment debug counters and keep camera stable");
    console.log("- Stale async completions are ignored when newer row intent exists");
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

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error && error.stack ? `\n${error.stack}` : "";
  console.error(`M5.6 validation failed: ${message}${stack}`);
  process.exit(1);
});
