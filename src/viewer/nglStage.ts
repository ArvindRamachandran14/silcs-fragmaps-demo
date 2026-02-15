import { resolveRuntimeUrl } from "@/data/manifest";
import { assetExists } from "@/viewer/loaders";

export interface CameraSnapshot {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
  zoom: number;
}

export interface StageInitOptions {
  container: HTMLElement;
  proteinUrl: string;
  ligandUrl: string;
  forceInitFailure?: boolean;
  minLoadingMs?: number;
}

export interface NglStageController {
  getCameraBaseline(): CameraSnapshot;
  getCameraSnapshot(): CameraSnapshot;
  setCameraSnapshot(snapshot: CameraSnapshot): void;
  resetView(): void;
  handleResize(): void;
  destroy(): void;
}

export interface ViewerM3DebugState {
  stageInitAttempts: number;
  stageDestroyCount: number;
  activeResizeListeners: number;
  peakResizeListeners: number;
  lastResizeCameraPreserved: boolean;
  cameraBaselineDefined: boolean;
  baselineCamera: CameraSnapshot;
  currentCamera: CameraSnapshot;
  startupRenderEngine: "none" | "ngl";
  startupProteinAssetUrl: string | null;
  startupLigandAssetUrl: string | null;
  startupProteinLoaded: boolean;
  startupLigandLoaded: boolean;
  startupProteinRepresentation: string | null;
  startupLigandRepresentation: string | null;
  startupContentReady: boolean;
}

declare global {
  interface Window {
    __viewerM3Debug?: ViewerM3DebugState;
  }
}

const DEFAULT_MIN_LOADING_MS = 180;

export const CAMERA_BASELINE_SNAPSHOT: CameraSnapshot = {
  position: [25.4, -2.8, 18.6],
  target: [0.4, 0.2, -0.8],
  up: [0, 1, 0],
  zoom: 1.12,
};

function cloneCameraSnapshot(snapshot: CameraSnapshot): CameraSnapshot {
  return {
    position: [...snapshot.position] as [number, number, number],
    target: [...snapshot.target] as [number, number, number],
    up: [...snapshot.up] as [number, number, number],
    zoom: snapshot.zoom,
  };
}

function cameraSnapshotsEqual(left: CameraSnapshot, right: CameraSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getDebugState(): ViewerM3DebugState {
  if (!window.__viewerM3Debug) {
    const baseline = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
    window.__viewerM3Debug = {
      stageInitAttempts: 0,
      stageDestroyCount: 0,
      activeResizeListeners: 0,
      peakResizeListeners: 0,
      lastResizeCameraPreserved: true,
      cameraBaselineDefined: true,
      baselineCamera: baseline,
      currentCamera: cloneCameraSnapshot(baseline),
      startupRenderEngine: "none",
      startupProteinAssetUrl: null,
      startupLigandAssetUrl: null,
      startupProteinLoaded: false,
      startupLigandLoaded: false,
      startupProteinRepresentation: null,
      startupLigandRepresentation: null,
      startupContentReady: false,
    };
  }

  return window.__viewerM3Debug;
}

export function getViewerM3DebugState(): ViewerM3DebugState {
  return getDebugState();
}

export function isForcedStageFailureFromQuery(queryValue: unknown): boolean {
  if (Array.isArray(queryValue)) {
    return queryValue.includes("1");
  }

  return queryValue === "1";
}

export function getMinLoadingMsFromQuery(queryValue: unknown): number | undefined {
  const candidate = Array.isArray(queryValue) ? queryValue[0] : queryValue;
  if (typeof candidate !== "string" || candidate.trim() === "") {
    return undefined;
  }

  const parsedValue = Number(candidate);
  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  const normalized = Math.trunc(parsedValue);
  if (normalized < 0) {
    return undefined;
  }

  return Math.min(normalized, 20000);
}

function toCameraSnapshotTuple(values: number[]): [number, number, number] {
  return [values[0], values[1], values[2]];
}

function readStageCameraSnapshot(stage: any, fallback: CameraSnapshot): CameraSnapshot {
  const camera = stage?.viewer?.camera;
  if (!camera?.position || !camera?.up) {
    return cloneCameraSnapshot(fallback);
  }

  const controlsTarget = stage?.viewerControls?.position;
  const target =
    controlsTarget && typeof controlsTarget.x === "number" && typeof controlsTarget.y === "number"
      ? [controlsTarget.x, controlsTarget.y, controlsTarget.z]
      : fallback.target;

  const position = [camera.position.x, camera.position.y, camera.position.z];
  const up = [camera.up.x, camera.up.y, camera.up.z];
  const zoom = typeof camera.zoom === "number" ? camera.zoom : fallback.zoom;

  return {
    position: toCameraSnapshotTuple(position),
    target: toCameraSnapshotTuple(target),
    up: toCameraSnapshotTuple(up),
    zoom,
  };
}

function applyStageCameraSnapshot(stage: any, snapshot: CameraSnapshot): void {
  const camera = stage?.viewer?.camera;
  if (!camera?.position || !camera?.up) {
    return;
  }

  const controlsTarget = stage?.viewerControls?.position;
  if (controlsTarget?.set) {
    controlsTarget.set(snapshot.target[0], snapshot.target[1], snapshot.target[2]);
  }

  camera.position.set(snapshot.position[0], snapshot.position[1], snapshot.position[2]);
  camera.up.set(snapshot.up[0], snapshot.up[1], snapshot.up[2]);
  camera.zoom = snapshot.zoom;
  if (camera.lookAt) {
    camera.lookAt(snapshot.target[0], snapshot.target[1], snapshot.target[2]);
  }
  if (camera.updateProjectionMatrix) {
    camera.updateProjectionMatrix();
  }

  stage?.viewer?.requestRender?.();
}

export async function initializeNglStage(options: StageInitOptions): Promise<NglStageController> {
  const debugState = getDebugState();
  debugState.stageInitAttempts += 1;
  debugState.cameraBaselineDefined = true;
  debugState.startupRenderEngine = "none";
  debugState.startupProteinLoaded = false;
  debugState.startupLigandLoaded = false;
  debugState.startupProteinRepresentation = null;
  debugState.startupLigandRepresentation = null;
  debugState.startupContentReady = false;

  const startedAt = performance.now();
  const minLoadingMs = options.minLoadingMs ?? DEFAULT_MIN_LOADING_MS;
  const proteinRuntimeUrl = resolveRuntimeUrl(options.proteinUrl);
  const ligandRuntimeUrl = resolveRuntimeUrl(options.ligandUrl);
  debugState.startupProteinAssetUrl = proteinRuntimeUrl;
  debugState.startupLigandAssetUrl = ligandRuntimeUrl;

  if (options.forceInitFailure) {
    await wait(minLoadingMs);
    throw new Error("Forced stage initialization failure (m3StageFail=1).");
  }

  const [proteinExists, ligandExists] = await Promise.all([
    assetExists(options.proteinUrl),
    assetExists(options.ligandUrl),
  ]);

  if (!proteinExists) {
    throw new Error(`Unable to load startup protein asset: ${options.proteinUrl}`);
  }

  if (!ligandExists) {
    throw new Error(`Unable to load default ligand asset: ${options.ligandUrl}`);
  }

  options.container.innerHTML = "";
  options.container.setAttribute("role", "img");
  options.container.setAttribute("aria-label", "3FLY protein and Crystal Ligand stage");

  let stage: any = null;
  let runtimeCameraBaseline = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
  try {
    const nglModule = (await import("ngl")) as any;
    const StageConstructor = nglModule.Stage || nglModule.default?.Stage;
    if (typeof StageConstructor !== "function") {
      throw new Error("NGL Stage constructor is unavailable in this build.");
    }

    stage = new StageConstructor(options.container, {
      backgroundColor: "white",
    });
    debugState.startupRenderEngine = "ngl";

    const proteinComponent = await stage.loadFile(proteinRuntimeUrl, { defaultRepresentation: false });
    proteinComponent.addRepresentation("cartoon", { colorScheme: "chainname" });
    debugState.startupProteinLoaded = true;
    debugState.startupProteinRepresentation = "cartoon";

    const ligandComponent = await stage.loadFile(ligandRuntimeUrl, { defaultRepresentation: false });
    ligandComponent.addRepresentation("ball+stick", { colorScheme: "element" });
    debugState.startupLigandLoaded = true;
    debugState.startupLigandRepresentation = "ball+stick";

    stage.autoView?.(0);
    stage?.viewer?.requestRender?.();
    runtimeCameraBaseline = readStageCameraSnapshot(stage, CAMERA_BASELINE_SNAPSHOT);
    debugState.baselineCamera = cloneCameraSnapshot(runtimeCameraBaseline);

    const elapsedMs = performance.now() - startedAt;
    if (elapsedMs < minLoadingMs) {
      await wait(minLoadingMs - elapsedMs);
    }
  } catch (error) {
    stage?.dispose?.();
    options.container.innerHTML = "";
    throw error;
  }

  let isDestroyed = false;
  let currentCamera = cloneCameraSnapshot(runtimeCameraBaseline);
  debugState.currentCamera = cloneCameraSnapshot(currentCamera);
  debugState.startupContentReady =
    debugState.startupRenderEngine === "ngl" &&
    debugState.startupProteinLoaded &&
    debugState.startupLigandLoaded &&
    debugState.startupProteinRepresentation === "cartoon" &&
    debugState.startupLigandRepresentation === "ball+stick";

  const controller: NglStageController = {
    getCameraBaseline() {
      return cloneCameraSnapshot(runtimeCameraBaseline);
    },
    getCameraSnapshot() {
      currentCamera = readStageCameraSnapshot(stage, currentCamera);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
      return cloneCameraSnapshot(currentCamera);
    },
    setCameraSnapshot(snapshot: CameraSnapshot) {
      currentCamera = cloneCameraSnapshot(snapshot);
      applyStageCameraSnapshot(stage, currentCamera);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    resetView() {
      stage?.autoView?.(0);
      stage?.viewer?.requestRender?.();
      currentCamera = readStageCameraSnapshot(stage, runtimeCameraBaseline);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    handleResize() {
      const beforeResize = readStageCameraSnapshot(stage, currentCamera);
      stage?.handleResize?.();
      currentCamera = readStageCameraSnapshot(stage, beforeResize);
      debugState.lastResizeCameraPreserved = cameraSnapshotsEqual(beforeResize, currentCamera);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    destroy() {
      if (isDestroyed) {
        return;
      }

      isDestroyed = true;
      stage?.dispose?.();
      options.container.innerHTML = "";
      debugState.stageDestroyCount += 1;
      debugState.startupContentReady = false;
    },
  };

  controller.handleResize();
  return controller;
}
