const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4177;
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

const PRIMARY_IDS = [
  "3fly.hbdon.gfe.dx",
  "3fly.hbacc.gfe.dx",
  "3fly.apolar.gfe.dx",
];

const ADVANCED_IDS = [
  "3fly.mamn.gfe.dx",
  "3fly.acec.gfe.dx",
  "3fly.meoo.gfe.dx",
  "3fly.tipo.gfe.dx",
  "3fly.excl.dx",
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
  assert(text.includes(expectedText), `${message} (expected to include "${expectedText}", got "${text}")`);
}

async function runPrimaryFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m52Marker = `m52-${Date.now()}`;
    return window.__m52Marker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  for (const rowId of PRIMARY_IDS) {
    await assertVisible(page, toggleSelector(rowId), `Primary row toggle missing: ${rowId}`);
    const disabled = await page.isDisabled(toggleSelector(rowId));
    assert(!disabled, `Primary row toggle should be enabled by default: ${rowId}`);
    const checked = await page.isChecked(toggleSelector(rowId));
    assert(!checked, `Primary row toggle should be unchecked by default: ${rowId}`);
  }

  for (const rowId of ADVANCED_IDS) {
    const selector = toggleSelector(rowId);
    await assertVisible(page, selector, `Advanced row toggle missing: ${rowId}`);
    const disabled = await page.isDisabled(selector);
    assert(disabled, `Advanced row toggle should remain disabled in M5.2: ${rowId}`);
  }

  const cameraBefore = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  await page.click(toggleSelector("3fly.hbdon.gfe.dx"));
  await assertTextIncludes(
    page,
    statusSelector("3fly.hbdon.gfe.dx"),
    "Loading",
    "Donor row did not enter loading state on first toggle.",
  );

  const acceptorDisabledDuringLoad = await page.isDisabled(toggleSelector("3fly.hbacc.gfe.dx"));
  const apolarDisabledDuringLoad = await page.isDisabled(toggleSelector("3fly.apolar.gfe.dx"));
  assert(
    acceptorDisabledDuringLoad && apolarDisabledDuringLoad,
    "Non-loading Primary rows should be temporarily disabled during first-load lock.",
  );

  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.includes("Loaded");
    },
    { selector: statusSelector("3fly.hbdon.gfe.dx") },
  );
  await page.waitForFunction(
    ({ selector }) => {
      const input = document.querySelector(selector);
      return Boolean(input) && !input.disabled;
    },
    { selector: toggleSelector("3fly.hbacc.gfe.dx") },
  );

  const visibleCountAfterOn = ((await page.textContent(panelSelector("visible-fragmaps-state"))) || "").trim();
  assert(visibleCountAfterOn === "1", `Visible FragMap count mismatch after toggle-on (got ${visibleCountAfterOn}).`);

  const cameraAfterOn = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(cameraAfterOn === cameraBefore, "Camera changed after Primary first-load toggle.");

  await page.click(toggleSelector("3fly.hbdon.gfe.dx"));
  const visibleCountAfterOff = ((await page.textContent(panelSelector("visible-fragmaps-state"))) || "").trim();
  assert(visibleCountAfterOff === "0", `Visible FragMap count mismatch after toggle-off (got ${visibleCountAfterOff}).`);
  await assertTextIncludes(
    page,
    statusSelector("3fly.hbdon.gfe.dx"),
    "Cached",
    "Donor row should show cached state after hiding.",
  );

  await page.click(toggleSelector("3fly.hbdon.gfe.dx"));
  await assertTextIncludes(
    page,
    statusSelector("3fly.hbdon.gfe.dx"),
    "Loaded from cache",
    "Donor row should show inline cache-hit text on cached toggle-on.",
  );

  const cameraAfterCacheHit = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(cameraAfterCacheHit === cameraBefore, "Camera changed after cached toggle-on.");

  const markerAfter = await page.evaluate(() => window.__m52Marker);
  assert(markerAfter === marker, "Primary toggle flow triggered a page reload.");
  assert(page.url() === viewerUrl, "Primary toggle flow changed route URL.");
}

async function runFailureFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5FailMap=3fly.hbacc.gfe.dx");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state for failure flow.");

  await page.click(toggleSelector("3fly.hbacc.gfe.dx"));
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Failure toast missing for failed Primary row.");
  const toastText = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(toastText.includes("failed to load"), "Failure toast should include map load failure context.");

  const failedRowDisabled = await page.isDisabled(toggleSelector("3fly.hbacc.gfe.dx"));
  const unaffectedRowDisabled = await page.isDisabled(toggleSelector("3fly.hbdon.gfe.dx"));
  assert(failedRowDisabled, "Failed Primary row should be disabled after load failure.");
  assert(!unaffectedRowDisabled, "Unaffected Primary rows should remain enabled after row-level failure.");

  await page.click(toggleSelector("3fly.hbdon.gfe.dx"));
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.trim() === "1";
    },
    { selector: panelSelector("visible-fragmaps-state") },
  );
  const visibleCount = ((await page.textContent(panelSelector("visible-fragmaps-state"))) || "").trim();
  assert(visibleCount === "1", `Unaffected row should still toggle on after failure (got ${visibleCount}).`);
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
    await runPrimaryFlow(page);
    await runFailureFlow(page);

    console.log("M5.2 validation passed:");
    console.log("- Primary-3 rows are interactive while Advanced rows remain disabled in this slice");
    console.log("- First toggle performs lazy load and temporarily locks non-loading Primary rows");
    console.log("- Toggle-off preserves cache and cached toggle-on shows inline 'Loaded from cache' text");
    console.log("- Camera snapshot remains unchanged during map toggle flow");
    console.log("- Row-level failure isolation disables only failed row and keeps unaffected rows usable");
    console.log("- Primary map interactions are in-place with no route reload/navigation");
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
  console.error(`M5.2 validation failed: ${message}`);
  process.exit(1);
});
