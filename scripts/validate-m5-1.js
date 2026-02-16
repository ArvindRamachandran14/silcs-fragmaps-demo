const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4176;
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

const FRAGMAP_ROW_IDS = [
  "3fly.hbdon.gfe.dx",
  "3fly.hbacc.gfe.dx",
  "3fly.apolar.gfe.dx",
  "3fly.mamn.gfe.dx",
  "3fly.acec.gfe.dx",
  "3fly.meoo.gfe.dx",
  "3fly.tipo.gfe.dx",
  "3fly.excl.dx",
];
const ADVANCED_ROW_IDS = FRAGMAP_ROW_IDS.slice(3);

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
    const viewerUrl = appUrl("/viewer?m3LoadMs=1200");
    await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
    await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

    const marker = await page.evaluate(() => {
      window.__m51Marker = `m51-${Date.now()}`;
      return window.__m51Marker;
    });

    await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
    await assertVisible(page, panelSelector("controls-tab-panel-fragmap"), "FragMap tab panel is missing.");

    const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
    const ligandTabSelected = await page.getAttribute(panelSelector("controls-tab-ligand"), "aria-selected");
    assert(fragMapTabSelected === "true", "FragMap tab is not selected by default.");
    assert(ligandTabSelected === "false", "Ligand tab should be inactive by default.");

    for (const actionId of ["fragmap-hide-all", "fragmap-reset-defaults", "fragmap-reset-view"]) {
      const selector = panelSelector(actionId);
      await assertVisible(page, selector, `Missing action button ${actionId}.`);
      const disabled = await page.isDisabled(selector);
      assert(disabled, `${actionId} must be disabled in M5.1 shell scope.`);
    }

    await assertVisible(page, panelSelector("fragmap-primary-section"), "Primary section is missing.");
    await assertVisible(page, panelSelector("fragmap-advanced-section"), "Advanced section is missing.");
    await assertVisible(page, panelSelector("fragmap-advanced-toggle"), "Advanced toggle button is missing.");

    const advancedExpandedByDefault = await page.getAttribute(panelSelector("fragmap-advanced-toggle"), "aria-expanded");
    assert(advancedExpandedByDefault === "false", "Advanced section should be collapsed by default.");

    await page.click(panelSelector("fragmap-advanced-toggle"));
    await assertVisible(page, panelSelector("fragmap-advanced-content"), "Advanced content did not expand.");

    for (const rowId of FRAGMAP_ROW_IDS) {
      const rowSelector = panelSelector(`fragmap-row-${rowId}`);
      const checkboxSelector = `${rowSelector} input[type="checkbox"]`;
      await assertVisible(page, rowSelector, `Missing FragMap row ${rowId}.`);

      const checked = await page.isChecked(checkboxSelector);
      assert(!checked, `FragMap row ${rowId} checkbox must be unchecked by default.`);
    }

    for (const rowId of ADVANCED_ROW_IDS) {
      const checkboxSelector = panelSelector(`fragmap-toggle-${rowId}`);
      const disabled = await page.isDisabled(checkboxSelector);
      assert(!disabled, `Advanced FragMap row ${rowId} should be enabled in M5.3+ runtime.`);
    }

    await page.click(panelSelector("controls-tab-ligand"));
    await assertVisible(page, panelSelector("controls-tab-panel-ligand"), "Ligand panel did not render after tab switch.");
    await assertVisible(page, panelSelector("ligand-pose-baseline"), "Ligand controls are missing under Ligand tab.");

    await page.click(panelSelector("controls-tab-fragmap"));
    await assertVisible(page, panelSelector("controls-tab-panel-fragmap"), "FragMap panel did not restore after tab switch.");

    const markerAfter = await page.evaluate(() => window.__m51Marker);
    assert(markerAfter === marker, "Tab switching triggered a page reload.");
    assert(page.url() === viewerUrl, "Tab switching changed route URL unexpectedly.");

    console.log("M5.1 validation passed:");
    console.log("- FragMap tab is default active and Ligand tab is inactive by default");
    console.log("- FragMap shell action row is present and disabled by design in M5.1");
    console.log("- Primary and Advanced canonical rows are present and unchecked by default");
    console.log("- Advanced section is collapsed by default and can be expanded in-place");
    console.log("- Ligand tab remains reachable and exposes existing ligand controls");
    console.log("- Tab switching is in-place (no route reload/navigation)");
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
  console.error(`M5.1 validation failed: ${message}`);
  process.exit(1);
});
