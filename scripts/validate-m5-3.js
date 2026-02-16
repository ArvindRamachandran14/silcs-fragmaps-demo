const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4180;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DESKTOP_PANEL = ".viewer-page__controls-col";

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

const ADVANCED_IDS = [
  "3fly.mamn.gfe.dx",
  "3fly.acec.gfe.dx",
  "3fly.meoo.gfe.dx",
  "3fly.tipo.gfe.dx",
  "3fly.excl.dx",
];
const EXCLUSION_ID = "3fly.excl.dx";
const EXCLUSION_COLOR = "#9e9e9e";
const EXCLUSION_ISOLEVEL = 0.5;
const ADVANCED_SAMPLE_ID = "3fly.mamn.gfe.dx";

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

async function assertTextIncludes(page, selector, expectedText, message) {
  await page.waitForSelector(selector, { timeout: 15000 });
  const text = ((await page.textContent(selector)) || "").trim();
  assert(text.includes(expectedText), `${message} (expected "${expectedText}", got "${text}")`);
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

async function expandAdvancedSection(page) {
  await assertVisible(page, panelSelector("fragmap-advanced-toggle"), "Advanced toggle button is missing.");
  const expanded = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
  if (expanded !== "true") {
    await page.click(panelSelector("fragmap-advanced-toggle"));
  }
  await assertVisible(page, panelSelector("fragmap-advanced-content"), "Advanced content did not expand.");
}

async function getFragMapRenderDebug(page, mapId) {
  return page.evaluate((id) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.fragMapRenderById[id]) || null;
  }, mapId);
}

function normalizeColor(value) {
  return String(value || "").trim().toLowerCase();
}

async function runAdvancedFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m53Marker = `m53-${Date.now()}`;
    return window.__m53Marker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  const advancedExpandedByDefault = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
  assert(advancedExpandedByDefault === "false", "Advanced section should be collapsed by default.");

  await expandAdvancedSection(page);
  for (const rowId of ADVANCED_IDS) {
    await assertVisible(page, toggleSelector(rowId), `Advanced row toggle missing: ${rowId}`);
    const disabled = await page.isDisabled(toggleSelector(rowId));
    assert(!disabled, `Advanced row toggle should be enabled in M5.3: ${rowId}`);
    const checked = await page.isChecked(toggleSelector(rowId));
    assert(!checked, `Advanced row toggle should be unchecked by default: ${rowId}`);
  }

  await assertVisible(
    page,
    panelSelector(`fragmap-row-iso-note-${EXCLUSION_ID}`),
    "Exclusion row should display fixed/disabled iso note.",
  );

  const exclusionEditableIsoCount = await page.locator(`${panelSelector(`fragmap-row-${EXCLUSION_ID}`)} input[type="number"]`).count();
  assert(exclusionEditableIsoCount === 0, "Exclusion row should not expose editable iso numeric controls in M5.3.");

  const cameraBefore = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();

  await page.click(toggleSelector(ADVANCED_SAMPLE_ID));
  await waitForStatusIncludes(page, statusSelector(ADVANCED_SAMPLE_ID), "Loaded");
  await assertTextIncludes(
    page,
    statusSelector(ADVANCED_SAMPLE_ID),
    "Loaded",
    "Advanced sample row did not reach loaded status.",
  );
  const visibleAfterAdvancedOn = ((await page.textContent(panelSelector("visible-fragmaps-state"))) || "").trim();
  assert(visibleAfterAdvancedOn === "1", "Expected one visible map after advanced toggle-on.");

  const cameraAfterAdvancedOn = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(cameraAfterAdvancedOn === cameraBefore, "Camera changed after advanced toggle-on.");

  await page.click(toggleSelector(ADVANCED_SAMPLE_ID));
  await assertTextIncludes(
    page,
    statusSelector(ADVANCED_SAMPLE_ID),
    "Cached",
    "Advanced sample row should show cached state after toggle-off.",
  );

  await page.click(toggleSelector(EXCLUSION_ID));
  await waitForStatusIncludes(page, statusSelector(EXCLUSION_ID), "Loaded");
  await assertTextIncludes(page, statusSelector(EXCLUSION_ID), "Loaded", "Exclusion row did not load.");
  const exclusionDebug = await getFragMapRenderDebug(page, EXCLUSION_ID);
  assert(exclusionDebug, "Missing render debug entry for exclusion map.");
  assert(exclusionDebug.representationType === "surface", "Exclusion map rep must be surface.");
  assert(exclusionDebug.wireframe === true, "Exclusion map must render in wireframe mode.");
  assert(
    normalizeColor(exclusionDebug.color) === EXCLUSION_COLOR,
    `Exclusion map color must be fixed ${EXCLUSION_COLOR} (got ${exclusionDebug.color}).`,
  );
  assert(
    Number(exclusionDebug.isolevel) === EXCLUSION_ISOLEVEL,
    `Exclusion map isolevel must be fixed at ${EXCLUSION_ISOLEVEL} (got ${exclusionDebug.isolevel}).`,
  );

  const markerAfter = await page.evaluate(() => window.__m53Marker);
  assert(markerAfter === marker, "M5.3 advanced flow triggered a page reload.");
  assert(page.url() === viewerUrl, "M5.3 advanced flow changed route URL.");
}

async function runFailureIsolationFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5FailMap=3fly.excl.dx");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state for failure flow.");

  await expandAdvancedSection(page);
  await page.click(toggleSelector(EXCLUSION_ID));
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Failure toast missing for exclusion row.");
  const toastText = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(toastText.includes("failed to load"), "Failure toast should include map load failure context.");

  const exclusionDisabled = await page.isDisabled(toggleSelector(EXCLUSION_ID));
  const unaffectedAdvancedDisabled = await page.isDisabled(toggleSelector(ADVANCED_SAMPLE_ID));
  assert(exclusionDisabled, "Failed exclusion row should be disabled after load failure.");
  assert(!unaffectedAdvancedDisabled, "Unaffected advanced rows should remain enabled after exclusion failure.");

  await page.click(toggleSelector(ADVANCED_SAMPLE_ID));
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.trim() === "1";
    },
    { selector: panelSelector("visible-fragmaps-state") },
  );
  const visibleCount = ((await page.textContent(panelSelector("visible-fragmaps-state"))) || "").trim();
  assert(visibleCount === "1", `Unaffected advanced row should still toggle on after exclusion failure (got ${visibleCount}).`);
  assert(page.url() === viewerUrl, "Failure isolation flow changed route URL.");
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
    await runAdvancedFlow(page);
    await runFailureIsolationFlow(page);

    console.log("M5.3 validation passed:");
    console.log("- Advanced section is collapsed by default and expands in-place");
    console.log("- Advanced rows are toggleable with lazy-load/cache behavior preserved");
    console.log("- Exclusion row is toggleable, wireframe, fixed gray, and iso-editing remains disabled");
    console.log("- Exclusion row failure is isolated and does not disable unaffected rows");
    console.log("- Advanced/exclusion interactions are in-place with no route reload/navigation");
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
  console.error(`M5.3 validation failed: ${message}`);
  process.exit(1);
});
