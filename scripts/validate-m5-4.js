const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4181;
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

const DONOR_ID = "3fly.hbdon.gfe.dx";
const EXCLUSION_ID = "3fly.excl.dx";
const ADJUSTABLE_IDS = [
  "3fly.hbdon.gfe.dx",
  "3fly.hbacc.gfe.dx",
  "3fly.apolar.gfe.dx",
  "3fly.mamn.gfe.dx",
  "3fly.acec.gfe.dx",
  "3fly.meoo.gfe.dx",
  "3fly.tipo.gfe.dx",
];

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

function isoInputSelector(rowId) {
  return panelSelector(`fragmap-iso-input-${rowId}`);
}

function isoIncrementSelector(rowId) {
  return panelSelector(`fragmap-iso-increment-${rowId}`);
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

async function getInputValue(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000 });
  return page.inputValue(selector);
}

async function getText(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000, state: "attached" });
  return ((await page.textContent(selector)) || "").trim();
}

async function setIsoInputRaw(page, rowId, value) {
  const selector = isoInputSelector(rowId);
  await page.fill(selector, value);
  await page.dispatchEvent(selector, "change");
}

async function expandAdvancedSection(page) {
  await assertVisible(page, panelSelector("fragmap-advanced-toggle"), "Advanced toggle button is missing.");
  const expanded = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
  if (expanded !== "true") {
    await page.click(panelSelector("fragmap-advanced-toggle"));
  }
  await assertVisible(page, panelSelector("fragmap-advanced-content"), "Advanced rows did not expand.");
}

async function getFragMapRenderDebug(page, mapId) {
  return page.evaluate((id) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.fragMapRenderById[id]) || null;
  }, mapId);
}

async function runIsoFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m54Marker = `m54-${Date.now()}`;
    return window.__m54Marker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  const globalIsoCount = await page.locator(`${DESKTOP_PANEL} [data-test-id="fragmap-global-iso"]`).count();
  assert(globalIsoCount === 0, "Global iso control should not be present.");

  await expandAdvancedSection(page);
  await assertVisible(page, panelSelector("fragmap-gfe-header-primary"), "Primary GFE header is missing.");
  await assertVisible(page, panelSelector("fragmap-gfe-header-advanced"), "Advanced GFE header is missing.");
  await assertVisible(page, panelSelector("fragmap-column-header-primary"), "Primary FragMap column header is missing.");
  await assertVisible(page, panelSelector("fragmap-column-header-advanced"), "Advanced FragMap column header is missing.");
  const primaryColumnHeader = await getText(page, panelSelector("fragmap-column-header-primary"));
  const advancedColumnHeader = await getText(page, panelSelector("fragmap-column-header-advanced"));
  const primaryHeader = await getText(page, panelSelector("fragmap-gfe-header-primary"));
  const advancedHeader = await getText(page, panelSelector("fragmap-gfe-header-advanced"));
  assert(primaryColumnHeader === "FragMap", `Unexpected primary FragMap header text: ${primaryColumnHeader}`);
  assert(advancedColumnHeader === "FragMap", `Unexpected advanced FragMap header text: ${advancedColumnHeader}`);
  assert(primaryHeader === "GFE (kcal/mol)", `Unexpected primary GFE header text: ${primaryHeader}`);
  assert(advancedHeader === "GFE (kcal/mol)", `Unexpected advanced GFE header text: ${advancedHeader}`);

  for (const rowId of ADJUSTABLE_IDS) {
    await assertVisible(page, isoDecrementSelector(rowId), `Iso decrement control missing: ${rowId}`);
    await assertVisible(page, isoInputSelector(rowId), `Iso input control missing: ${rowId}`);
    await assertVisible(page, isoIncrementSelector(rowId), `Iso increment control missing: ${rowId}`);
    const disabled = await page.isDisabled(isoInputSelector(rowId));
    assert(!disabled, `Iso input should be enabled for adjustable row: ${rowId}`);
    const inlineIsoControls = await page.evaluate((id) => {
      const row = document.querySelector(`[data-test-id="fragmap-row-${id}"]`);
      const mapRow = row && row.querySelector(".controls-panel__map-row");
      const isoRow = row && row.querySelector(`[data-test-id="fragmap-iso-row-${id}"]`);
      return Boolean(mapRow && isoRow && mapRow.contains(isoRow));
    }, rowId);
    assert(inlineIsoControls, `Iso controls should be inline in map row for ${rowId}.`);
  }

  await assertVisible(page, isoInputSelector(EXCLUSION_ID), "Exclusion iso input is missing.");
  const exclusionIsoDisabled = await page.isDisabled(isoInputSelector(EXCLUSION_ID));
  assert(exclusionIsoDisabled, "Exclusion iso input should be disabled.");

  const donorDefaultIso = await getInputValue(page, isoInputSelector(DONOR_ID));
  const apolarDefaultIso = await getInputValue(page, isoInputSelector("3fly.apolar.gfe.dx"));
  const advancedDefaultIso = await getInputValue(page, isoInputSelector("3fly.mamn.gfe.dx"));
  assert(donorDefaultIso === "-0.8", `Expected donor default iso -0.8 (got ${donorDefaultIso}).`);
  assert(apolarDefaultIso === "-1.0", `Expected apolar default iso -1.0 (got ${apolarDefaultIso}).`);
  assert(advancedDefaultIso === "-1.2", `Expected advanced default iso -1.2 (got ${advancedDefaultIso}).`);

  const cameraBefore = await getText(page, panelSelector("camera-snapshot"));

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded");

  const donorDebugAfterLoad = await getFragMapRenderDebug(page, DONOR_ID);
  assert(donorDebugAfterLoad, "Missing debug render entry for donor row.");
  assert(Number(donorDebugAfterLoad.isolevel) === -0.8, "Donor should load with default iso -0.8.");

  await page.click(isoIncrementSelector(DONOR_ID));
  await page.waitForFunction(
    ({ selector, expected }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && input.value === expected;
    },
    { selector: isoInputSelector(DONOR_ID), expected: "-0.7" },
  );

  const donorDebugAfterStep = await getFragMapRenderDebug(page, DONOR_ID);
  assert(Number(donorDebugAfterStep.isolevel) === -0.7, "Donor isolevel should update to -0.7 after + step.");

  await setIsoInputRaw(page, DONOR_ID, "abc");
  await page.waitForFunction(
    ({ selector, expected }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && input.value === expected;
    },
    { selector: isoInputSelector(DONOR_ID), expected: "-0.7" },
  );

  await setIsoInputRaw(page, DONOR_ID, "-3.8");
  await page.waitForFunction(
    ({ selector, expected }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && input.value === expected;
    },
    { selector: isoInputSelector(DONOR_ID), expected: "-3.0" },
  );
  const donorDebugAfterMinClamp = await getFragMapRenderDebug(page, DONOR_ID);
  assert(Number(donorDebugAfterMinClamp.isolevel) === -3.0, "Donor isolevel should clamp to min -3.0.");

  await setIsoInputRaw(page, DONOR_ID, "0.2");
  await page.waitForFunction(
    ({ selector, expected }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && input.value === expected;
    },
    { selector: isoInputSelector(DONOR_ID), expected: "0.0" },
  );
  const donorDebugAfterMaxClamp = await getFragMapRenderDebug(page, DONOR_ID);
  assert(Number(donorDebugAfterMaxClamp.isolevel) === 0.0, "Donor isolevel should clamp to max 0.0.");

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Cached");

  await setIsoInputRaw(page, DONOR_ID, "-1.4");
  await page.waitForFunction(
    ({ selector, expected }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && input.value === expected;
    },
    { selector: isoInputSelector(DONOR_ID), expected: "-1.4" },
  );

  await page.click(toggleSelector(DONOR_ID));
  await waitForStatusIncludes(page, statusSelector(DONOR_ID), "Loaded");
  const donorDebugAfterHiddenEdit = await getFragMapRenderDebug(page, DONOR_ID);
  assert(Number(donorDebugAfterHiddenEdit.isolevel) === -1.4, "Hidden-row iso edit should apply on next toggle-on.");

  const cameraAfter = await getText(page, panelSelector("camera-snapshot"));
  assert(cameraAfter === cameraBefore, "Camera changed during per-map iso interactions.");

  const markerAfter = await page.evaluate(() => window.__m54Marker);
  assert(markerAfter === marker, "M5.4 iso flow triggered a page reload.");
  assert(page.url() === viewerUrl, "M5.4 iso flow changed route URL.");
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
    await runIsoFlow(page);

    console.log("M5.4 validation passed:");
    console.log("- Per-map iso controls exist for adjustable rows with default canonical values");
    console.log("- Exclusion row iso controls are present but disabled/non-editable");
    console.log("- Step updates and typed values enforce clamp/revert numeric contract");
    console.log("- Hidden-row iso edits are stored and applied on next toggle-on");
    console.log("- No global iso control is present");
    console.log("- Iso interactions are in-place with camera preserved and no route reload/navigation");
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
  console.error(`M5.4 validation failed: ${message}`);
  process.exit(1);
});
