const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4178;
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

const PRIMARY_IDS = ["3fly.hbdon.gfe.dx", "3fly.hbacc.gfe.dx", "3fly.apolar.gfe.dx"];
const EXCLUSION_ID = "3fly.excl.dx";
const EXCLUSION_COLOR = "#9e9e9e";

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

async function getFragMapRenderDebug(page, mapId) {
  return page.evaluate((id) => {
    return (window.__viewerM5Debug && window.__viewerM5Debug.fragMapRenderById[id]) || null;
  }, mapId);
}

async function forceLoadExclusionMapForStyleCheck(page) {
  const result = await page.evaluate(
    async ({ mapId }) => {
      function findViewerVm(vm) {
        if (!vm) {
          return null;
        }

        if (vm.stageController && typeof vm.stageController.setFragMapVisibility === "function") {
          return vm;
        }

        const children = vm.$children || [];
        for (const child of children) {
          const found = findViewerVm(child);
          if (found) {
            return found;
          }
        }

        return null;
      }

      const appRoot = document.querySelector("#app");
      const rootVm = appRoot && appRoot.__vue__;
      const viewerVm = findViewerVm(rootVm);
      if (!viewerVm || !viewerVm.stageController) {
        return { ok: false, reason: "Unable to find ViewerPage stage controller instance." };
      }

      await viewerVm.stageController.setFragMapVisibility(
        {
          id: mapId,
          dxUrl: "/assets/maps/3fly.excl.dx",
          color: "#ff00ff",
        },
        true,
      );
      await viewerVm.stageController.setFragMapVisibility(
        {
          id: mapId,
          dxUrl: "/assets/maps/3fly.excl.dx",
          color: "#ff00ff",
        },
        false,
      );

      return { ok: true };
    },
    { mapId: EXCLUSION_ID },
  );

  assert(result && result.ok, result && result.reason ? result.reason : "Failed to force-load exclusion map.");
}

function normalizeColor(value) {
  return String(value || "").trim().toLowerCase();
}

async function runWireframeChecks(page) {
  const viewerUrl = appUrl("/viewer?m3LoadMs=1200&m5MapLoadMs=1200");
  await page.goto(viewerUrl, { waitUntil: "domcontentloaded" });
  await assertVisible(page, '[data-test-id="viewer-ready-state"]', "Viewer did not reach ready state.");

  const marker = await page.evaluate(() => {
    window.__m52aMarker = `m52a-${Date.now()}`;
    return window.__m52aMarker;
  });

  await assertVisible(page, panelSelector("controls-tab-fragmap"), "FragMap tab button is missing.");
  const fragMapTabSelected = await page.getAttribute(panelSelector("controls-tab-fragmap"), "aria-selected");
  assert(fragMapTabSelected === "true", "FragMap tab must be active by default.");

  const cameraBefore = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();

  for (const rowId of PRIMARY_IDS) {
    await page.click(toggleSelector(rowId));
    await page.waitForFunction(
      ({ selector }) => {
        const element = document.querySelector(selector);
        return Boolean(element) && element.textContent && element.textContent.includes("Loaded");
      },
      { selector: statusSelector(rowId) },
    );

    const renderDebug = await getFragMapRenderDebug(page, rowId);
    assert(renderDebug, `Missing render debug entry for ${rowId}.`);
    assert(renderDebug.representationType === "surface", `Expected surface rep for ${rowId}.`);
    assert(renderDebug.wireframe === true, `Expected wireframe=true for ${rowId}.`);
    assert(typeof renderDebug.isolevel === "number", `Expected numeric isolevel for ${rowId}.`);
    assert(renderDebug.opacity === 1, `Expected opacity=1 for ${rowId}.`);
  }

  for (const rowId of PRIMARY_IDS) {
    await page.click(toggleSelector(rowId));
  }

  await forceLoadExclusionMapForStyleCheck(page);
  const exclusionDebug = await getFragMapRenderDebug(page, EXCLUSION_ID);
  assert(exclusionDebug, "Missing render debug entry for exclusion map.");
  assert(exclusionDebug.representationType === "surface", "Exclusion map rep must be surface.");
  assert(exclusionDebug.wireframe === true, "Exclusion map must render in wireframe mode.");
  assert(
    normalizeColor(exclusionDebug.color) === EXCLUSION_COLOR,
    `Exclusion map color must be fixed ${EXCLUSION_COLOR} (got ${exclusionDebug.color}).`,
  );

  const cameraAfter = ((await page.textContent(panelSelector("camera-snapshot"))) || "").trim();
  assert(cameraAfter === cameraBefore, "Camera changed during M5.2a style checks.");

  const markerAfter = await page.evaluate(() => window.__m52aMarker);
  assert(markerAfter === marker, "M5.2a style checks triggered a page reload.");
  assert(page.url() === viewerUrl, "M5.2a style checks changed route URL.");
}

async function run() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    throw new Error("dist/index.html not found. Run `npm run build` before validation.");
  }

  const server = await startServer();
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

  try {
    await runWireframeChecks(page);

    console.log("M5.2a validation passed:");
    console.log("- Primary FragMap rows render as surface wireframes with numeric isolevels");
    console.log(`- Exclusion map enforces fixed gray wireframe style (${EXCLUSION_COLOR})`);
    console.log("- Camera snapshot remains unchanged during style checks");
    console.log("- Interactions remain in-place with no route reload/navigation");
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
  console.error(`M5.2a validation failed: ${message}`);
  process.exit(1);
});
