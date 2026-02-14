const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(ROOT_DIR, "from_silcsbio");
const OUTPUT_ASSETS_DIR = path.join(ROOT_DIR, "public", "assets");

const PROTEIN_SOURCE = path.join(SOURCE_DIR, "3fly.pdb");
const CRYSTAL_BASELINE_SOURCE = path.join(SOURCE_DIR, "3fly_cryst_lig.sdf");
const CRYSTAL_REFINED_SDF_SOURCE = path.join(SOURCE_DIR, "3fly_cryst_lig_posref.sdf");
const CRYSTAL_REFINED_PDB_SOURCE = path.join(SOURCE_DIR, "3fly_cryst_lig_posref.pdb");

const BASELINE_LIGANDS_DIR = path.join(SOURCE_DIR, "ligands");
const REFINED_LIGANDS_DIR = path.join(SOURCE_DIR, "ligands_posref");
const MAPS_DIR = path.join(SOURCE_DIR, "maps");

const FEATURED_LIGANDS = new Set([
  "3fly_cryst_lig",
  "p38_goldstein_05_2e",
  "p38_goldstein_06_2f",
  "p38_goldstein_07_2g",
  "p38_goldstein_08_2h",
  "p38_goldstein_09_2i",
]);

const FRAGMAPS = [
  {
    id: "3fly.hbdon.gfe.dx",
    label: "Generic Donor",
    color: "#1976d2",
    isoAdjustable: true,
    defaultIso: -0.8,
    section: "primary",
  },
  {
    id: "3fly.hbacc.gfe.dx",
    label: "Generic Acceptor",
    color: "#d32f2f",
    isoAdjustable: true,
    defaultIso: -0.8,
    section: "primary",
  },
  {
    id: "3fly.apolar.gfe.dx",
    label: "Generic Apolar",
    color: "#2e7d32",
    isoAdjustable: true,
    defaultIso: -1.0,
    section: "primary",
  },
  {
    id: "3fly.mamn.gfe.dx",
    label: "Positively Charged",
    color: "#f57c00",
    isoAdjustable: true,
    defaultIso: -1.2,
    section: "advanced",
  },
  {
    id: "3fly.acec.gfe.dx",
    label: "Negatively Charged",
    color: "#c2185b",
    isoAdjustable: true,
    defaultIso: -1.2,
    section: "advanced",
  },
  {
    id: "3fly.meoo.gfe.dx",
    label: "Hydroxyl Oxygen",
    color: "#0097a7",
    isoAdjustable: true,
    defaultIso: -0.8,
    section: "advanced",
  },
  {
    id: "3fly.tipo.gfe.dx",
    label: "Water Oxygen",
    color: "#f9a825",
    isoAdjustable: true,
    defaultIso: -0.3,
    section: "advanced",
  },
  {
    id: "3fly.excl.dx",
    label: "Exclusion Map",
    color: "#9e9e9e",
    isoAdjustable: false,
    section: "advanced",
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function copyRequired(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing required source file: ${sourcePath}`);
  }
  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

function copyOptional(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }
  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
  return true;
}

function toPublicUrl(relativePath) {
  return `/${relativePath.replace(/\\/g, "/")}`;
}

function listBaselineLigandIds() {
  return fs
    .readdirSync(BASELINE_LIGANDS_DIR)
    .filter((fileName) => fileName.endsWith(".sdf"))
    .map((fileName) => path.basename(fileName, ".sdf"))
    .sort((left, right) => left.localeCompare(right));
}

function stageAssets() {
  const proteinOutputDir = path.join(OUTPUT_ASSETS_DIR, "protein");
  const ligandBaselineOutputDir = path.join(OUTPUT_ASSETS_DIR, "ligands", "baseline");
  const ligandRefinedOutputDir = path.join(OUTPUT_ASSETS_DIR, "ligands", "refined");
  const mapsOutputDir = path.join(OUTPUT_ASSETS_DIR, "maps");

  cleanDir(OUTPUT_ASSETS_DIR);
  ensureDir(proteinOutputDir);
  ensureDir(ligandBaselineOutputDir);
  ensureDir(ligandRefinedOutputDir);
  ensureDir(mapsOutputDir);

  copyRequired(PROTEIN_SOURCE, path.join(proteinOutputDir, "3fly.pdb"));

  const baselineLigandIds = listBaselineLigandIds();
  const ligandIds = ["3fly_cryst_lig", ...baselineLigandIds];
  const ligands = [];

  for (const ligandId of ligandIds) {
    const baselineSource =
      ligandId === "3fly_cryst_lig"
        ? CRYSTAL_BASELINE_SOURCE
        : path.join(BASELINE_LIGANDS_DIR, `${ligandId}.sdf`);
    const refinedSdfSource =
      ligandId === "3fly_cryst_lig"
        ? CRYSTAL_REFINED_SDF_SOURCE
        : path.join(REFINED_LIGANDS_DIR, `${ligandId}.sdf`);
    const refinedPdbSource =
      ligandId === "3fly_cryst_lig"
        ? CRYSTAL_REFINED_PDB_SOURCE
        : path.join(REFINED_LIGANDS_DIR, `${ligandId}.pdb`);

    const baselineOutputPath = path.join(ligandBaselineOutputDir, `${ligandId}.sdf`);
    const refinedSdfOutputPath = path.join(ligandRefinedOutputDir, `${ligandId}.sdf`);
    const refinedPdbOutputPath = path.join(ligandRefinedOutputDir, `${ligandId}.pdb`);

    copyRequired(baselineSource, baselineOutputPath);
    const hasRefinedSdf = copyOptional(refinedSdfSource, refinedSdfOutputPath);
    const hasRefinedPdbFallback = copyOptional(refinedPdbSource, refinedPdbOutputPath);

    if (!hasRefinedSdf && !hasRefinedPdbFallback) {
      throw new Error(
        `Missing refined ligand assets for ${ligandId}. Expected at least one of: ${refinedSdfSource} or ${refinedPdbSource}`,
      );
    }

    ligands.push({
      id: ligandId,
      label: ligandId === "3fly_cryst_lig" ? "Crystal Ligand" : ligandId,
      featured: FEATURED_LIGANDS.has(ligandId),
      baselineSdfUrl: toPublicUrl(path.join("assets", "ligands", "baseline", `${ligandId}.sdf`)),
      refinedSdfUrl: hasRefinedSdf
        ? toPublicUrl(path.join("assets", "ligands", "refined", `${ligandId}.sdf`))
        : undefined,
      refinedPdbFallbackUrl: hasRefinedPdbFallback
        ? toPublicUrl(path.join("assets", "ligands", "refined", `${ligandId}.pdb`))
        : undefined,
    });
  }

  for (const fragMap of FRAGMAPS) {
    const sourcePath = path.join(MAPS_DIR, fragMap.id);
    const outputPath = path.join(mapsOutputDir, fragMap.id);
    copyRequired(sourcePath, outputPath);
  }

  const manifest = {
    protein: {
      id: "3fly",
      pdbUrl: toPublicUrl(path.join("assets", "protein", "3fly.pdb")),
    },
    ligands,
    fragMaps: FRAGMAPS.map((fragMap) => ({
      id: fragMap.id,
      label: fragMap.label,
      dxUrl: toPublicUrl(path.join("assets", "maps", fragMap.id)),
      color: fragMap.color,
      isoAdjustable: fragMap.isoAdjustable,
      defaultIso: fragMap.defaultIso,
      section: fragMap.section,
    })),
  };

  fs.writeFileSync(
    path.join(OUTPUT_ASSETS_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf-8",
  );

  console.log("Staged runtime assets successfully.");
  console.log(`- Ligands staged: ${manifest.ligands.length}`);
  console.log(`- FragMaps staged: ${manifest.fragMaps.length}`);
}

try {
  stageAssets();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Asset staging failed: ${message}`);
  process.exit(1);
}
