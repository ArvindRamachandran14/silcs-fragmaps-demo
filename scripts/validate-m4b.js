const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4175;
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

const FEATURED_IDS = [
  "3fly_cryst_lig",
  "p38_goldstein_05_2e",
  "p38_goldstein_06_2f",
  "p38_goldstein_07_2g",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function panelSelector(testId) {
  return `${DESKTOP_PANEL} [data-test-id="${testId}"]`;
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

async function assertText(page, selector, expected, message) {
  await page.waitForFunction(
    ({ cssSelector, target }) => {
      const element = document.querySelector(cssSelector);
      return Boolean(element) && element.textContent && element.textContent.trim() === target;
    },
    { cssSelector: selector, target: expected },
  );

  const text = ((await page.textContent(selector)) || "").trim();
  assert(text === expected, `${message} (expected "${expected}", got "${text}")`);
}

async function selectLigandTab(page) {
  await assertVisible(page, panelSelector("controls-tab-ligand"), "Ligand tab button is missing.");
  await page.click(panelSelector("controls-tab-ligand"));
  await assertVisible(page, panelSelector("controls-tab-panel-ligand"), "Ligand tab panel did not render.");
}

async function runSwitchingFlow(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");
  await selectLigandTab(page);

  for (const ligandId of FEATURED_IDS) {
    await assertVisible(
      page,
      panelSelector(`ligand-featured-chip-${ligandId}`),
      `Featured chip for ${ligandId} is missing.`,
    );
  }

  const hasSearchSelector = await page.evaluate((scope) => {
    return Boolean(document.querySelector(`${scope} [data-test-id=\"ligand-search-selector\"]`));
  }, DESKTOP_PANEL);
  assert(!hasSearchSelector, "Searchable full-ligand selector should not appear in M4B.");

  const marker = await page.evaluate(() => {
    window.__m4bMarker = `m4b-${Date.now()}`;
    return window.__m4bMarker;
  });

  const initialCameraSnapshot = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  await assertText(page, panelSelector("default-ligand-id"), "3fly_cryst_lig", "Default ligand mismatch.");

  await page.click(panelSelector("ligand-featured-chip-p38_goldstein_05_2e"));
  await assertText(page, panelSelector("default-ligand-id"), "p38_goldstein_05_2e", "Ligand switch to 05_2e failed.");
  assert(page.url() === viewerUrl, "Ligand switch changed route URL unexpectedly.");

  const cameraAfterFirstSwitch = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(
    cameraAfterFirstSwitch === initialCameraSnapshot,
    "Camera snapshot changed after featured ligand switch.",
  );

  await page.click(panelSelector("ligand-pose-refined"));
  await assertText(page, panelSelector("refined-pose-state"), "ON", "Refined pose did not toggle on after switch.");
  await assertVisible(
    page,
    panelSelector("ligand-both-visible-legend"),
    "Both-visible legend missing after enabling refined pose.",
  );

  await page.click(panelSelector("ligand-featured-chip-p38_goldstein_06_2f"));
  await assertText(page, panelSelector("default-ligand-id"), "p38_goldstein_06_2f", "Ligand switch to 06_2f failed.");
  await assertText(page, panelSelector("refined-pose-state"), "ON", "Refined pose state did not persist across switch.");

  await page.click(panelSelector("ligand-featured-chip-p38_goldstein_07_2g"));
  await assertText(page, panelSelector("default-ligand-id"), "p38_goldstein_07_2g", "Ligand switch to 07_2g failed.");

  const baselineCameraContract = ((await page.textContent(panelSelector("camera-baseline-contract"))) || "").trim();
  await page.click('[data-test-id="viewer-reset-view"]');
  await page.waitForFunction(
    ({ selector, expected }) => {
      const currentCamera = document.querySelector(selector);
      return Boolean(currentCamera) && currentCamera.textContent && currentCamera.textContent.trim() === expected;
    },
    { selector: panelSelector("camera-snapshot"), expected: baselineCameraContract },
  );

  const cameraAfterReset = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(
    cameraAfterReset === baselineCameraContract,
    "Reset view did not return to the baseline camera contract after featured ligand switching.",
  );

  const markerAfter = await page.evaluate(() => window.__m4bMarker);
  assert(markerAfter === marker, "Featured ligand switches triggered a page reload.");
}

async function runFailureIsolationFlow(page) {
  await page.goto(appUrl("/viewer?m4FailPose=refined"), { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer not ready for M4B failure flow.");
  await selectLigandTab(page);

  await page.click(panelSelector("ligand-featured-chip-p38_goldstein_05_2e"));
  await assertText(page, panelSelector("default-ligand-id"), "p38_goldstein_05_2e", "Failure-flow ligand switch failed.");

  await page.click(panelSelector("ligand-pose-refined"));
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Failure toast missing for refined pose.");
  const toastText = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(toastText.includes("Refined pose failed"), "Failure toast did not include refined-pose context.");

  const refinedDisabled = await page.isDisabled(panelSelector("ligand-pose-refined"));
  const baselineDisabled = await page.isDisabled(panelSelector("ligand-pose-baseline"));
  assert(refinedDisabled, "Refined control should be disabled after refined failure.");
  assert(!baselineDisabled, "Baseline control should remain enabled after refined failure.");
}

async function runFallbackDisableFlow(page) {
  await page.goto(appUrl("/viewer?m4FailPose=baseline"), { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer not ready for fallback-disable flow.");
  await selectLigandTab(page);

  await page.click(panelSelector("ligand-featured-chip-p38_goldstein_05_2e"));
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Switch failure toast missing.");
  const toastText = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(toastText.includes("Failed to switch"), "Switch failure toast text mismatch.");

  await assertText(page, panelSelector("default-ligand-id"), "3fly_cryst_lig", "Failed switch changed selected ligand.");
  const disabledChip = await page.isDisabled(panelSelector("ligand-featured-chip-p38_goldstein_05_2e"));
  assert(disabledChip, "Failed featured ligand did not transition to disabled state.");
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
    await runSwitchingFlow(page);
    await runFailureIsolationFlow(page);
    await runFallbackDisableFlow(page);

    console.log("M4B validation passed:");
    console.log("- featured quick-pick chips are present for the approved M4B subset");
    console.log("- ligand switches are in-place with no route reload");
    console.log("- camera snapshot is preserved on ligand switch");
    console.log("- M4A pose interactions remain functional after switch");
    console.log("- per-pose failure isolation and failed-feature disable fallback are enforced");
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
  console.error(`M4B validation failed: ${error.message}`);
  process.exit(1);
});
