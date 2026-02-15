const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4175;
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
  const text = ((await page.textContent(selector)) || "").trim();
  assert(text === expected, `${message} (expected "${expected}", got "${text}")`);
}

async function assertChecked(page, selector, expected, message) {
  const checked = await page.isChecked(selector);
  assert(checked === expected, `${message} (expected ${expected}, got ${checked})`);
}

async function runDefaultFlow(page) {
  await page.goto(appUrl("/viewer?m3LoadMs=1200"), { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m4aMarker = `m4a-${Date.now()}`;
    return window.__m4aMarker;
  });

  await assertText(page, '[data-test-id="default-ligand-id"]', "3fly_cryst_lig", "Default ligand mismatch.");
  await assertChecked(page, '[data-test-id="ligand-pose-baseline"]', true, "Baseline should start checked.");
  await assertChecked(page, '[data-test-id="ligand-pose-refined"]', false, "Refined should start unchecked.");

  await page.click('[data-test-id="ligand-pose-refined"]');
  await assertText(page, '[data-test-id="refined-pose-state"]', "ON", "Refined did not toggle on.");
  await assertVisible(page, '[data-test-id="ligand-both-visible-legend"]', "Legend did not render for both-visible.");

  await page.click('[data-test-id="ligand-pose-baseline"]');
  await assertText(page, '[data-test-id="baseline-pose-state"]', "OFF", "Baseline did not toggle off.");
  await assertText(page, '[data-test-id="refined-pose-state"]', "ON", "Refined should remain on.");

  await page.click('[data-test-id="ligand-pose-refined"]');
  await assertText(page, '[data-test-id="refined-pose-state"]', "OFF", "Refined did not toggle off.");
  await assertChecked(page, '[data-test-id="ligand-pose-baseline"]', false, "Baseline checkbox should be unchecked.");
  await assertChecked(page, '[data-test-id="ligand-pose-refined"]', false, "Refined checkbox should be unchecked.");

  await page.click('[data-test-id="ligand-pose-baseline"]');
  await page.click('[data-test-id="ligand-pose-refined"]');
  await assertText(page, '[data-test-id="baseline-pose-state"]', "ON", "Baseline did not restore after re-check.");
  await assertText(page, '[data-test-id="refined-pose-state"]', "ON", "Refined did not restore after re-check.");
  await assertVisible(page, '[data-test-id="ligand-both-visible-legend"]', "Legend missing after restoring both.");

  await page.click('[data-test-id="ligand-zoom-action"]');
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Zoom toast missing.");
  const zoomToast = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(zoomToast.includes("Zoomed to selected ligand"), "Zoom toast text mismatch.");

  const markerAfter = await page.evaluate(() => window.__m4aMarker);
  assert(markerAfter === marker, "Pose interactions triggered a page reload.");
}

async function runFailureIsolationFlow(page) {
  await page.goto(appUrl("/viewer?m4FailPose=refined"), { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer not ready for failure flow.");

  await page.click('[data-test-id="ligand-pose-refined"]');
  await assertVisible(page, '[data-test-id="viewer-toast"]', "Failure toast missing.");
  const toastText = ((await page.textContent('[data-test-id="viewer-toast"]')) || "").trim();
  assert(toastText.includes("Refined pose failed"), "Failure toast did not include refined context.");

  const refinedDisabled = await page.isDisabled('[data-test-id="ligand-pose-refined"]');
  const baselineDisabled = await page.isDisabled('[data-test-id="ligand-pose-baseline"]');
  assert(refinedDisabled, "Refined control should be disabled after failure.");
  assert(!baselineDisabled, "Baseline control should remain enabled after refined failure.");
  await assertChecked(page, '[data-test-id="ligand-pose-baseline"]', true, "Baseline should remain visible after refined failure.");
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
    await runDefaultFlow(page);
    await runFailureIsolationFlow(page);

    console.log("M4A validation passed:");
    console.log("- default ligand and pose state are correct");
    console.log("- four pose visibility states work in place");
    console.log("- both-unchecked is represented directly by unchecked pose toggles");
    console.log("- both-visible legend is shown");
    console.log("- zoom is explicit and non-routing");
    console.log("- per-pose failure isolation keeps unaffected control active");
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
  console.error(`M4A validation failed: ${error.message}`);
  process.exit(1);
});
