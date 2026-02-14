export interface ProteinAsset {
  id: string;
  pdbUrl: string;
}

export interface LigandAsset {
  id: string;
  label: string;
  featured: boolean;
  baselineSdfUrl: string;
  refinedSdfUrl?: string;
  refinedPdbFallbackUrl?: string;
}

export type FragMapSection = "primary" | "advanced";

export interface FragMapAsset {
  id: string;
  label: string;
  dxUrl: string;
  color: string;
  isoAdjustable: boolean;
  defaultIso?: number;
  section: FragMapSection;
}

export interface AssetManifest {
  protein: ProteinAsset;
  ligands: LigandAsset[];
  fragMaps: FragMapAsset[];
}

export interface FragMapInventoryItem {
  id: string;
  label: string;
}

export const EXPECTED_FRAGMAP_INVENTORY: ReadonlyArray<FragMapInventoryItem> = [
  { id: "3fly.hbdon.gfe.dx", label: "Generic Donor" },
  { id: "3fly.hbacc.gfe.dx", label: "Generic Acceptor" },
  { id: "3fly.apolar.gfe.dx", label: "Generic Apolar" },
  { id: "3fly.mamn.gfe.dx", label: "Positively Charged" },
  { id: "3fly.acec.gfe.dx", label: "Negatively Charged" },
  { id: "3fly.meoo.gfe.dx", label: "Hydroxyl Oxygen" },
  { id: "3fly.tipo.gfe.dx", label: "Water Oxygen" },
  { id: "3fly.excl.dx", label: "Exclusion Map" },
];

function getBaseUrl(): string {
  const baseUrl = process.env.BASE_URL || "/";
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

export function resolveRuntimeUrl(assetPath: string): string {
  const normalizedPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;
  return `${getBaseUrl()}${normalizedPath}`;
}

function isManifestPayload(payload: unknown): payload is AssetManifest {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<AssetManifest>;
  return Boolean(candidate.protein && Array.isArray(candidate.ligands) && Array.isArray(candidate.fragMaps));
}

export async function loadAssetManifest(fetcher: typeof fetch = fetch): Promise<AssetManifest> {
  const response = await fetcher(resolveRuntimeUrl("/assets/manifest.json"), { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to fetch runtime manifest: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as unknown;
  if (!isManifestPayload(payload)) {
    throw new Error("Runtime manifest payload is malformed.");
  }

  return payload;
}

export function validateFragMapInventory(manifest: AssetManifest): string[] {
  const actualPairs = manifest.fragMaps.map((mapAsset) => ({ id: mapAsset.id, label: mapAsset.label }));
  const expectedPairSet = new Set(EXPECTED_FRAGMAP_INVENTORY.map((entry) => `${entry.id}|${entry.label}`));
  const actualPairSet = new Set(actualPairs.map((entry) => `${entry.id}|${entry.label}`));

  const issues: string[] = [];

  if (actualPairs.length !== EXPECTED_FRAGMAP_INVENTORY.length) {
    issues.push(
      `FragMap inventory size mismatch. Expected ${EXPECTED_FRAGMAP_INVENTORY.length}, found ${actualPairs.length}.`,
    );
  }

  for (const expected of EXPECTED_FRAGMAP_INVENTORY) {
    const pairKey = `${expected.id}|${expected.label}`;
    if (!actualPairSet.has(pairKey)) {
      issues.push(`Missing FragMap mapping: ${expected.id} -> ${expected.label}`);
    }
  }

  for (const actual of actualPairs) {
    const pairKey = `${actual.id}|${actual.label}`;
    if (!expectedPairSet.has(pairKey)) {
      issues.push(`Unexpected FragMap mapping: ${actual.id} -> ${actual.label}`);
    }
  }

  return issues;
}
