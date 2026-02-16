const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const DESKTOP_PANEL = ".viewer-page__controls-col";
const PRIMARY_ROW_ID = "3fly.hbdon.gfe.dx";

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

async function getText(page, selector) {
  await page.waitForSelector(selector, { timeout: 15000, state: "attached" });
  return ((await page.textContent(selector)) || "").trim();
}

async function runLoadingLockCheck(page) {
  const loadingUrl = appUrl("/viewer?m3LoadMs=2500");
  await page.goto(loadingUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, panelSelector("fragmap-show-protein-control"), "Show Protein control is missing.");

  const proteinToggleSelector = panelSelector("fragmap-protein-toggle");
  const disabledWhileLoading = await page.isDisabled(proteinToggleSelector);
  assert(disabledWhileLoading, "Show Protein toggle should be disabled while viewer is loading.");

  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state after loading.");
  const disabledAfterReady = await page.isDisabled(proteinToggleSelector);
  assert(!disabledAfterReady, "Show Protein toggle should be enabled once viewer is ready.");
}

async function runProteinToggleFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m52bMarker = `m52b-${Date.now()}`;
    return window.__m52bMarker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  const proteinToggleSelector = panelSelector("fragmap-protein-toggle");
  await assertVisible(page, panelSelector("fragmap-show-protein-control"), "Show Protein control is missing.");
  const proteinToggleChecked = await page.isChecked(proteinToggleSelector);
  assert(proteinToggleChecked, "Show Protein should default to checked (ON).");
  const initialProteinState = await getText(page, panelSelector("protein-visibility-state"));
  assert(initialProteinState === "ON", `Expected protein state ON by default (got "${initialProteinState}").`);

  await page.click(toggleSelector(PRIMARY_ROW_ID));
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.includes("Loaded");
    },
    { selector: statusSelector(PRIMARY_ROW_ID) },
  );

  const mapCountBeforeProteinToggle = await getText(page, panelSelector("visible-fragmaps-state"));
  assert(mapCountBeforeProteinToggle === "1", "Expected one visible FragMap before protein toggle checks.");
  const baselineBefore = await getText(page, panelSelector("baseline-pose-state"));
  const refinedBefore = await getText(page, panelSelector("refined-pose-state"));
  const cameraBeforeProteinToggle = await getText(page, panelSelector("camera-snapshot"));

  await page.click(proteinToggleSelector);
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.trim() === "OFF";
    },
    { selector: panelSelector("protein-visibility-state") },
  );

  const mapCountAfterOff = await getText(page, panelSelector("visible-fragmaps-state"));
  const baselineAfterOff = await getText(page, panelSelector("baseline-pose-state"));
  const refinedAfterOff = await getText(page, panelSelector("refined-pose-state"));
  const cameraAfterOff = await getText(page, panelSelector("camera-snapshot"));

  assert(mapCountAfterOff === mapCountBeforeProteinToggle, "Protein OFF should not change visible FragMap count.");
  assert(baselineAfterOff === baselineBefore, "Protein OFF should not change baseline pose state.");
  assert(refinedAfterOff === refinedBefore, "Protein OFF should not change refined pose state.");
  assert(cameraAfterOff === cameraBeforeProteinToggle, "Camera changed after toggling protein OFF.");

  await page.click(proteinToggleSelector);
  await page.waitForFunction(
    ({ selector }) => {
      const element = document.querySelector(selector);
      return Boolean(element) && element.textContent && element.textContent.trim() === "ON";
    },
    { selector: panelSelector("protein-visibility-state") },
  );

  const mapCountAfterOn = await getText(page, panelSelector("visible-fragmaps-state"));
  const cameraAfterOn = await getText(page, panelSelector("camera-snapshot"));
  assert(mapCountAfterOn === mapCountBeforeProteinToggle, "Protein ON should not change visible FragMap count.");
  assert(cameraAfterOn === cameraBeforeProteinToggle, "Camera changed after toggling protein ON.");

  await page.click(panelSelector("controls-tab-ligand"));
  await assertVisible(page, panelSelector("controls-tab-panel-ligand"), "Ligand tab panel did not open.");
  await assertVisible(page, panelSelector("ligand-pose-baseline"), "Ligand baseline control is missing.");
  const baselineCheckboxChecked = await page.isChecked(panelSelector("ligand-pose-baseline"));
  assert(baselineCheckboxChecked, "Ligand baseline checkbox should remain checked.");

  await page.click(panelSelector("controls-tab-fragmap"));
  await assertVisible(page, panelSelector("controls-tab-panel-fragmap"), "FragMap tab panel did not restore.");
  const proteinToggleCheckedAgain = await page.isChecked(proteinToggleSelector);
  assert(proteinToggleCheckedAgain, "Show Protein toggle should remain checked after tab switches.");

  const markerAfter = await page.evaluate(() => window.__m52bMarker);
  assert(markerAfter === marker, "Protein toggle flow triggered a page reload.");
  assert(page.url() === viewerUrl, "Protein toggle flow changed route URL.");
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
    await runLoadingLockCheck(page);
    await runProteinToggleFlow(page);

    console.log("M5.2b validation passed:");
    console.log("- Show Protein toggle is present, default ON, and disabled during startup loading");
    console.log("- Protein toggle updates happen in-place with no route reload/navigation");
    console.log("- Protein toggle does not change visible map count, ligand pose states, or camera snapshot");
    console.log("- Ligand tab controls remain functional after protein toggle interactions");
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
  console.error(`M5.2b validation failed: ${message}`);
  process.exit(1);
});
