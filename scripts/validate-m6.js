const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const DIST_DIR = path.resolve(__dirname, "..", "dist");
const INDEX_HTML_PATH = path.join(DIST_DIR, "index.html");
const PORT = 4184;
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

async function main() {
  assert(fs.existsSync(INDEX_HTML_PATH), "dist/index.html missing. Run `npm run build`.");

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
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    await page.goto(appUrl("/"), { waitUntil: "networkidle" });

    await assertVisible(page, '[data-test-id="home-page"]', "Home page did not render.");

    const headingCount = await page.locator('[data-test-id="home-page"] h1').count();
    assert(headingCount === 1, "Home page must contain exactly one top-level heading.");

    const paragraphLoc = page.locator('[data-test-id="home-overview-paragraph"]');
    const paragraphCount = await paragraphLoc.count();
    assert(
      paragraphCount === 1 || paragraphCount === 2,
      `Narrative must have 1-2 paragraphs, found ${paragraphCount}.`,
    );

    const paragraphText = (await paragraphLoc.allTextContents()).join(" ").toLowerCase();
    assert(paragraphText.includes("p38 map kinase") && paragraphText.includes("3fly"), "Missing P38 MAP Kinase (3FLY) concept.");
    assert(
      paragraphText.includes("crystal ligand") && paragraphText.includes("3fly_cryst_lig"),
      "Missing crystal ligand context concept.",
    );
    assert(paragraphText.includes("silcs fragmaps"), "Missing SILCS FragMaps concept.");
    assert(
      paragraphText.includes("ligand binding") || paragraphText.includes("pose quality"),
      "Missing FragMap interpretation value concept.",
    );
    const hasBaselineOrOriginal = paragraphText.includes("baseline") || paragraphText.includes("original");
    const hasRefined = paragraphText.includes("refined");
    const hasMapInspection =
      paragraphText.includes("map-assisted") ||
      paragraphText.includes("map assisted") ||
      (paragraphText.includes("fragmap") &&
        (paragraphText.includes("toggle") ||
          paragraphText.includes("inspect") ||
          paragraphText.includes("explore")));
    const hasLigandComparison =
      paragraphText.includes("compare ligands") ||
      paragraphText.includes("switch between") ||
      paragraphText.includes("toggle between") ||
      paragraphText.includes("featured ligand") ||
      paragraphText.includes("p38_goldstein_05_2e");

    assert(
      hasBaselineOrOriginal && hasRefined && hasMapInspection && hasLigandComparison,
      "Missing user exploration concept (baseline/original + refined + map inspection + ligand comparison/switching).",
    );

    const ctaSelector = '[data-test-id="home-go-viewer"]';
    await assertVisible(page, ctaSelector, "Go to Viewer CTA is missing.");
    const ctaText = ((await page.textContent(ctaSelector)) || "").trim();
    assert(ctaText === "Go to Viewer", `Unexpected CTA label: "${ctaText}".`);

    const marker = await page.evaluate(() => {
      window.__m6SpaMarker = `marker-${Date.now()}`;
      return window.__m6SpaMarker;
    });

    await page.focus(ctaSelector);
    await page.keyboard.press("Enter");
    await page.waitForURL(appUrl("/viewer"), { timeout: 8000 });
    await assertVisible(page, '[data-test-id="viewer-page"]', "CTA did not navigate to /viewer.");

    const markerAfterNav = await page.evaluate(() => window.__m6SpaMarker);
    assert(markerAfterNav === marker, "CTA navigation triggered a full page reload.");

    await page.click('[data-test-id="nav-home"]');
    await page.waitForURL(appUrl("/"), { timeout: 8000 });
    await assertVisible(page, '[data-test-id="home-page"]', "Failed to return to home page.");

    const linkSelector = '[data-test-id="home-link-3fly"]';
    await assertVisible(page, linkSelector, "Required RCSB 3FLY link is missing.");
    const href = await page.getAttribute(linkSelector, "href");
    const target = await page.getAttribute(linkSelector, "target");
    const rel = (await page.getAttribute(linkSelector, "rel")) || "";
    const linkText = ((await page.textContent(linkSelector)) || "").trim();

    assert(href === "https://www.rcsb.org/structure/3FLY", "RCSB 3FLY link href is incorrect.");
    assert(target === "_blank", "RCSB 3FLY link must open in a new tab.");
    assert(rel.includes("noopener"), "RCSB 3FLY link must include noopener rel.");
    assert(linkText.toLowerCase().includes("3fly") && linkText.toLowerCase().includes("rcsb"), "External link text is not descriptive.");

    const popupPromise = page.waitForEvent("popup", { timeout: 8000 });
    await page.click(linkSelector);
    const popup = await popupPromise;
    await popup.close();

    await assertVisible(page, '[data-test-id="home-page"]', "Home page became unusable after external link click.");
    await assertVisible(page, ctaSelector, "CTA became unusable after external link click.");

    const nglHostCount = await page.locator('[data-test-id="ngl-stage-host"]').count();
    const controlsPanelCount = await page.locator('[data-test-id="controls-panel"]').count();
    const viewerPageCount = await page.locator('[data-test-id="viewer-page"]').count();
    assert(nglHostCount === 0 && controlsPanelCount === 0 && viewerPageCount === 0, "Home page is not text-first; viewer UI elements are present.");

    console.log("M6 validation passed:");
    console.log("- / renders overview content with no runtime errors");
    console.log("- narrative is 1-2 paragraphs and includes all required concepts");
    console.log("- Go to Viewer CTA routes client-side to /viewer");
    console.log("- required external link is present and opens in a new tab");
    console.log("- overview remains text-first with no viewer/control UI elements");
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

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`M6 validation failed: ${message}`);
  process.exit(1);
});
