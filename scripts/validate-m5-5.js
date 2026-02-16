const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4182;
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

function isoInputSelector(rowId) {
  return panelSelector(`fragmap-iso-input-${rowId}`);
}

function isoDecrementSelector(rowId) {
  return panelSelector(`fragmap-iso-decrement-${rowId}`);
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

async function getInputValue(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000 });
  return page.inputValue(selector);
}

async function expandAdvancedSection(page) {
  await assertVisible(page, panelSelector("fragmap-advanced-toggle"), "Advanced toggle button is missing.");
  const expanded = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
  if (expanded !== "true") {
    await page.click(panelSelector("fragmap-advanced-toggle"));
  }
  await assertVisible(page, panelSelector("fragmap-advanced-content"), "Advanced section did not expand.");
}

async function runBulkActionFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m55Marker = `m55-${Date.now()}`;
    return window.__m55Marker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  await assertVisible(page, panelSelector("fragmap-hide-all"), "Hide all button is missing.");
  await assertVisible(page, panelSelector("fragmap-reset-defaults"), "Reset defaults button is missing.");
  const resetViewButtonCount = await page.locator(panelSelector("fragmap-reset-view")).count();
  assert(resetViewButtonCount === 0, "FragMap panel must not include an in-panel Reset view button.");

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded");

  await page.click(toggleSelector(APOLAR_ID));
  await waitForStatusIncludes(page, statusSelector(APOLAR_ID), "Loaded");
  await waitForVisibleCount(page, 2);

  await page.click(isoDecrementSelector(DONOR_ID));
  await page.click(isoDecrementSelector(DONOR_ID));
  await page.click(isoDecrementSelector(DONOR_ID));
  const donorIsoEdited = await getInputValue(page, isoInputSelector(DONOR_ID));
  assert(donorIsoEdited === "-1.1", `Expected donor iso to update to -1.1 before reset (got ${donorIsoEdited}).`);

  const cameraBeforeResetDefaults = await getText(page, panelSelector("camera-snapshot"));
  await page.click(panelSelector("fragmap-reset-defaults"));
  await waitForVisibleCount(page, 2);

  const donorCheckedAfterReset = await page.isChecked(toggleSelector(DONOR_ID));
  const apolarCheckedAfterReset = await page.isChecked(toggleSelector(APOLAR_ID));
  assert(donorCheckedAfterReset && apolarCheckedAfterReset, "Reset defaults must preserve current map visibility.");

  const donorIsoDefault = await getInputValue(page, isoInputSelector(DONOR_ID));
  const apolarIsoDefault = await getInputValue(page, isoInputSelector(APOLAR_ID));
  assert(donorIsoDefault === "-0.8", `Reset defaults must restore donor iso to -0.8 (got ${donorIsoDefault}).`);
  assert(apolarIsoDefault === "-1.0", `Reset defaults must restore apolar iso to -1.0 (got ${apolarIsoDefault}).`);

  await expandAdvancedSection(page);
  const waterIsoDefault = await getInputValue(page, isoInputSelector(WATER_ID));
  assert(waterIsoDefault === "-0.3", `Reset defaults must restore water iso to -0.3 (got ${waterIsoDefault}).`);

  const cameraAfterResetDefaults = await getText(page, panelSelector("camera-snapshot"));
  assert(cameraAfterResetDefaults === cameraBeforeResetDefaults, "Camera changed after Reset defaults action.");

  await page.click(panelSelector("fragmap-hide-all"));
  await waitForVisibleCount(page, 0);

  const donorCheckedAfterHideAll = await page.isChecked(toggleSelector(DONOR_ID));
  const apolarCheckedAfterHideAll = await page.isChecked(toggleSelector(APOLAR_ID));
  assert(!donorCheckedAfterHideAll && !apolarCheckedAfterHideAll, "Hide all must clear visible map checkboxes.");
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Cached");
  await waitForStatusIncludes(page, statusSelector(APOLAR_ID), "Cached");

  const cameraAfterHideAll = await getText(page, panelSelector("camera-snapshot"));
  assert(cameraAfterHideAll === cameraBeforeResetDefaults, "Camera changed after Hide all action.");

  const debugCounts = await page.evaluate(() => {
    return {
      hideAllCount: window.__viewerM5Debug?.hideAllCount || 0,
      resetDefaultsCount: window.__viewerM5Debug?.resetDefaultsCount || 0,
    };
  });
  assert(debugCounts.hideAllCount >= 1, "Hide all debug counter did not increment.");
  assert(debugCounts.resetDefaultsCount >= 1, "Reset defaults debug counter did not increment.");

  const markerAfter = await page.evaluate(() => window.__m55Marker);
  assert(markerAfter === marker, "Bulk actions flow triggered a page reload.");
  assert(page.url() === viewerUrl, "Bulk actions flow changed route URL.");
}

async function runRetryIsolationFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200&m5FailMap=3fly.tipo.gfe.dx");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state for retry flow.");

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded");
  await waitForVisibleCount(page, 1);

  await expandAdvancedSection(page);
  await page.click(toggleSelector(WATER_ID));
  await assertVisible(page, errorSelector(WATER_ID), "Water Oxygen row should show a load error.");
  const waterDisabledAfterFailure = await page.isDisabled(toggleSelector(WATER_ID));
  assert(waterDisabledAfterFailure, "Water Oxygen row should be disabled after forced load failure.");

  const retryCountBefore = await page.evaluate((rowId) => {
    return (window.__viewerM5Debug?.retryAttemptById && window.__viewerM5Debug.retryAttemptById[rowId]) || 0;
  }, WATER_ID);

  await page.click(panelSelector("fragmap-reset-defaults"));
  await waitForVisibleCount(page, 1);
  await page.waitForTimeout(300);

  const retryCountAfter = await page.evaluate((rowId) => {
    return (window.__viewerM5Debug?.retryAttemptById && window.__viewerM5Debug.retryAttemptById[rowId]) || 0;
  }, WATER_ID);
  assert(retryCountAfter === retryCountBefore, "Reset defaults must not trigger row retries.");

  const waterDisabledAfterReset = await page.isDisabled(toggleSelector(WATER_ID));
  assert(waterDisabledAfterReset, "Failed row should remain disabled after reset defaults.");
  await assertVisible(page, errorSelector(WATER_ID), "Failed row error should remain visible after reset defaults.");

  const donorCheckedAfterReset = await page.isChecked(toggleSelector(DONOR_ID));
  assert(donorCheckedAfterReset, "Reset defaults must preserve unaffected row visibility.");

  const donorDisabled = await page.isDisabled(toggleSelector(DONOR_ID));
  assert(!donorDisabled, "Unaffected rows should remain interactive after reset defaults.");
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
    await runBulkActionFlow(page);
    await runRetryIsolationFlow(page);
    console.log("M5.5 validation passed:");
    console.log("- FragMap action row exposes Hide all + Reset defaults only (no in-panel Reset view)");
    console.log("- Hide all clears visible maps in place while preserving cached state");
    console.log("- Reset defaults restores canonical per-map iso values while preserving visibility");
    console.log("- Reset defaults does not trigger row retries or recovery side-effects");
    console.log("- Bulk actions preserve camera and do not trigger route reload");
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
  console.error(`M5.5 validation failed: ${message}`);
  process.exit(1);
});
