const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCE_BASELINE_DIR = path.join(ROOT_DIR, "from_silcsbio", "ligands");
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const MANIFEST_PATH = path.join(PUBLIC_DIR, "assets", "manifest.json");

const EXPECTED_FRAGMAPS = [
  { id: "3fly.hbdon.gfe.dx", label: "Generic Donor" },
  { id: "3fly.hbacc.gfe.dx", label: "Generic Acceptor" },
  { id: "3fly.apolar.gfe.dx", label: "Generic Apolar" },
  { id: "3fly.mamn.gfe.dx", label: "Positively Charged" },
  { id: "3fly.acec.gfe.dx", label: "Negatively Charged" },
  { id: "3fly.meoo.gfe.dx", label: "Hydroxyl Oxygen" },
  { id: "3fly.tipo.gfe.dx", label: "Water Oxygen" },
  { id: "3fly.excl.dx", label: "Exclusion Map" },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function listBaselineLigandIds() {
  return fs
    .readdirSync(SOURCE_BASELINE_DIR)
    .filter((fileName) => fileName.endsWith(".sdf"))
    .map((fileName) => path.basename(fileName, ".sdf"))
    .sort((left, right) => left.localeCompare(right));
}

function toLocalPath(assetUrl) {
  const normalized = assetUrl.startsWith("/") ? assetUrl.slice(1) : assetUrl;
  return path.join(PUBLIC_DIR, normalized.replace(/^assets\//, "assets/"));
}

function buildValidationReport(manifest, existsFn) {
  const issues = [];
  const disabledControlIntents = {
    proteinControl: false,
    ligandPoseControls: {},
    fragMapControls: {},
  };

  for (const ligand of manifest.ligands) {
    disabledControlIntents.ligandPoseControls[ligand.id] = {
      baseline: false,
      refined: false,
    };
  }

  for (const fragMap of manifest.fragMaps) {
    disabledControlIntents.fragMapControls[fragMap.id] = false;
  }

  if (!existsFn(manifest.protein.pdbUrl)) {
    disabledControlIntents.proteinControl = true;
    issues.push({ kind: "protein", id: manifest.protein.id });
  }

  for (const ligand of manifest.ligands) {
    if (!existsFn(ligand.baselineSdfUrl)) {
      disabledControlIntents.ligandPoseControls[ligand.id].baseline = true;
      issues.push({ kind: "ligand-baseline", id: ligand.id });
    }

    const refinedSdfExists = ligand.refinedSdfUrl ? existsFn(ligand.refinedSdfUrl) : false;
    const refinedPdbExists = ligand.refinedPdbFallbackUrl ? existsFn(ligand.refinedPdbFallbackUrl) : false;
    if (!refinedSdfExists && !refinedPdbExists) {
      disabledControlIntents.ligandPoseControls[ligand.id].refined = true;
      issues.push({ kind: "ligand-refined", id: ligand.id });
    }
  }

  for (const fragMap of manifest.fragMaps) {
    if (!existsFn(fragMap.dxUrl)) {
      disabledControlIntents.fragMapControls[fragMap.id] = true;
      issues.push({ kind: "fragmap", id: fragMap.id });
    }
  }

  return {
    isBlocking: false,
    hasErrors: issues.length > 0,
    issues,
    disabledControlIntents,
  };
}

function validateFragMapInventory(manifest) {
  const expected = new Set(EXPECTED_FRAGMAPS.map((entry) => `${entry.id}|${entry.label}`));
  const actual = new Set(manifest.fragMaps.map((entry) => `${entry.id}|${entry.label}`));
  const mismatches = [];

  if (manifest.fragMaps.length !== EXPECTED_FRAGMAPS.length) {
    mismatches.push(
      `Expected ${EXPECTED_FRAGMAPS.length} fragmaps, found ${manifest.fragMaps.length}.`,
    );
  }

  for (const entry of EXPECTED_FRAGMAPS) {
    if (!actual.has(`${entry.id}|${entry.label}`)) {
      mismatches.push(`Missing mapping ${entry.id} -> ${entry.label}`);
    }
  }

  for (const entry of manifest.fragMaps) {
    if (!expected.has(`${entry.id}|${entry.label}`)) {
      mismatches.push(`Unexpected mapping ${entry.id} -> ${entry.label}`);
    }
  }

  return mismatches;
}

function main() {
  assert(fs.existsSync(MANIFEST_PATH), "Missing runtime manifest. Run `npm run stage:assets` first.");
  const manifest = readJson(MANIFEST_PATH);

  const baselineLigandIds = listBaselineLigandIds();
  const manifestLigandIds = new Set(manifest.ligands.map((ligand) => ligand.id));

  assert(manifestLigandIds.has("3fly_cryst_lig"), "Manifest must include 3fly_cryst_lig.");
  for (const baselineId of baselineLigandIds) {
    assert(manifestLigandIds.has(baselineId), `Manifest missing baseline ligand: ${baselineId}`);
  }

  const existsFn = (assetUrl) => fs.existsSync(toLocalPath(assetUrl));
  const normalReport = buildValidationReport(manifest, existsFn);
  assert(
    normalReport.issues.length === 0,
    `Startup validation found missing assets in normal staging: ${JSON.stringify(normalReport.issues)}`,
  );

  const missingSimulationManifest = JSON.parse(JSON.stringify(manifest));
  const targetLigand = missingSimulationManifest.ligands.find((ligand) => ligand.id !== "3fly_cryst_lig");
  assert(Boolean(targetLigand), "Missing-asset simulation requires at least one non-crystal ligand.");
  targetLigand.baselineSdfUrl = "/assets/ligands/baseline/__missing__.sdf";

  const missingReport = buildValidationReport(missingSimulationManifest, existsFn);
  assert(missingReport.isBlocking === false, "Missing-asset simulation must remain non-blocking.");
  assert(missingReport.hasErrors, "Missing-asset simulation must produce validation issues.");
  assert(
    missingReport.disabledControlIntents.ligandPoseControls[targetLigand.id].baseline === true,
    "Missing-asset simulation must mark baseline ligand control as disabled intent.",
  );

  const fragMapMismatches = validateFragMapInventory(manifest);
  assert(fragMapMismatches.length === 0, `FragMap mapping mismatch: ${fragMapMismatches.join("; ")}`);

  console.log("M2 validation passed:");
  console.log("- Manifest covers crystal and all baseline ligands");
  console.log("- Startup validation checks runtime assets");
  console.log("- Missing-asset simulation is non-blocking and sets disable intent metadata");
  console.log("- FragMap IDs and labels match spec inventory");
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`M2 validation failed: ${message}`);
  process.exit(1);
}
