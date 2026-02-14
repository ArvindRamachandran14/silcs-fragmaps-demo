const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const PORT = 4173;
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

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

function resolveRequestPath(urlPath) {
  const cleanUrl = urlPath.split("?")[0].split("#")[0];
  const normalizedPath = cleanUrl === "/" ? "/index.html" : cleanUrl;
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

async function assertVisible(page, selector, message) {
  await page.waitForSelector(selector, { timeout: 5000 });
  const visible = await page.isVisible(selector);
  if (!visible) {
    throw new Error(message);
  }
}

async function run() {
  if (!fs.existsSync(path.join(DIST_DIR, "index.html"))) {
    throw new Error("dist/index.html not found. Run `npm run build` before validation.");
  }

  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
    await assertVisible(page, '[data-test-id="home-page"]', "Home route did not render.");

    const marker = await page.evaluate(() => {
      window.__m1SpaMarker = `marker-${Date.now()}`;
      return window.__m1SpaMarker;
    });

    await page.click('[data-test-id="nav-viewer"]');
    await page.waitForURL(`${BASE_URL}/viewer`, { timeout: 5000 });
    await assertVisible(page, '[data-test-id="viewer-page"]', "Viewer route did not render.");

    const markerAfterViewerNav = await page.evaluate(() => window.__m1SpaMarker);
    if (markerAfterViewerNav !== marker) {
      throw new Error("Navigation / -> /viewer triggered a full page reload.");
    }

    await page.click('[data-test-id="nav-home"]');
    await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
    await assertVisible(page, '[data-test-id="home-page"]', "Home route did not render after navigating back.");

    const markerAfterHomeNav = await page.evaluate(() => window.__m1SpaMarker);
    if (markerAfterHomeNav !== marker) {
      throw new Error("Navigation /viewer -> / triggered a full page reload.");
    }

    await page.goto(`${BASE_URL}/unknown-route`, { waitUntil: "networkidle" });
    await assertVisible(page, '[data-test-id="app-shell"]', "Unknown route caused app shell failure.");
    await assertVisible(page, '[data-test-id="home-page"]', "Unknown route did not recover to a valid page.");

    console.log("M1 validation passed:");
    console.log("- / renders");
    console.log("- /viewer renders");
    console.log("- / <-> /viewer navigation stays client-side");
    console.log("- unknown route does not crash the app");
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
  console.error(`M1 validation failed: ${error.message}`);
  process.exit(1);
});
