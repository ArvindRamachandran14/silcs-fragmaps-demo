import { AssetManifest, validateFragMapInventory } from "@/data/manifest";
import { assetExists } from "@/viewer/loaders";

type LigandPose = "baseline" | "refined";

export interface MissingAssetIssue {
  kind: "protein" | "ligand-baseline" | "ligand-refined" | "fragmap" | "fragmap-mapping";
  id: string;
  path?: string;
  message: string;
}

export interface DisabledControlIntents {
  proteinControl: boolean;
  ligandPoseControls: Record<string, Record<LigandPose, boolean>>;
  fragMapControls: Record<string, boolean>;
}

export interface StartupValidationReport {
  isBlocking: false;
  hasErrors: boolean;
  issues: MissingAssetIssue[];
  disabledControlIntents: DisabledControlIntents;
}

function createDefaultDisabledControls(manifest: AssetManifest): DisabledControlIntents {
  const ligandPoseControls: DisabledControlIntents["ligandPoseControls"] = {};
  const fragMapControls: DisabledControlIntents["fragMapControls"] = {};

  for (const ligand of manifest.ligands) {
    ligandPoseControls[ligand.id] = {
      baseline: false,
      refined: false,
    };
  }

  for (const fragMap of manifest.fragMaps) {
    fragMapControls[fragMap.id] = false;
  }

  return {
    proteinControl: false,
    ligandPoseControls,
    fragMapControls,
  };
}

export async function runStartupValidation(manifest: AssetManifest): Promise<StartupValidationReport> {
  const issues: MissingAssetIssue[] = [];
  const disabledControls = createDefaultDisabledControls(manifest);

  const proteinExists = await assetExists(manifest.protein.pdbUrl);
  if (!proteinExists) {
    disabledControls.proteinControl = true;
    issues.push({
      kind: "protein",
      id: manifest.protein.id,
      path: manifest.protein.pdbUrl,
      message: `Missing protein asset: ${manifest.protein.pdbUrl}`,
    });
  }

  for (const ligand of manifest.ligands) {
    const baselineExists = await assetExists(ligand.baselineSdfUrl);
    if (!baselineExists) {
      disabledControls.ligandPoseControls[ligand.id].baseline = true;
      issues.push({
        kind: "ligand-baseline",
        id: ligand.id,
        path: ligand.baselineSdfUrl,
        message: `Missing baseline ligand asset: ${ligand.baselineSdfUrl}`,
      });
    }

    let refinedExists = false;
    if (ligand.refinedSdfUrl) {
      refinedExists = await assetExists(ligand.refinedSdfUrl);
      if (!refinedExists && ligand.refinedPdbFallbackUrl) {
        refinedExists = await assetExists(ligand.refinedPdbFallbackUrl);
      }
    } else if (ligand.refinedPdbFallbackUrl) {
      refinedExists = await assetExists(ligand.refinedPdbFallbackUrl);
    }

    if (!refinedExists) {
      disabledControls.ligandPoseControls[ligand.id].refined = true;
      issues.push({
        kind: "ligand-refined",
        id: ligand.id,
        path: ligand.refinedSdfUrl || ligand.refinedPdbFallbackUrl,
        message: `Missing refined ligand asset(s) for ${ligand.id}`,
      });
    }
  }

  for (const fragMap of manifest.fragMaps) {
    const fragMapExists = await assetExists(fragMap.dxUrl);
    if (!fragMapExists) {
      disabledControls.fragMapControls[fragMap.id] = true;
      issues.push({
        kind: "fragmap",
        id: fragMap.id,
        path: fragMap.dxUrl,
        message: `Missing FragMap asset: ${fragMap.dxUrl}`,
      });
    }
  }

  const mappingIssues = validateFragMapInventory(manifest);
  if (mappingIssues.length > 0) {
    for (const fragMap of manifest.fragMaps) {
      disabledControls.fragMapControls[fragMap.id] = true;
    }
    for (const message of mappingIssues) {
      issues.push({
        kind: "fragmap-mapping",
        id: "fragmap-inventory",
        message,
      });
    }
  }

  return {
    isBlocking: false,
    hasErrors: issues.length > 0,
    issues,
    disabledControlIntents: disabledControls,
  };
}
