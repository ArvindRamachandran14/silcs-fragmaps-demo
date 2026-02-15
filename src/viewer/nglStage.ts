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

export async function initializeNglStage(options: StageInitOptions): Promise<NglStageController> {
  const debugState = getDebugState();
  debugState.stageInitAttempts += 1;
  debugState.cameraBaselineDefined = true;

  const startedAt = performance.now();
  const minLoadingMs = options.minLoadingMs ?? DEFAULT_MIN_LOADING_MS;

  if (options.forceInitFailure) {
    await wait(minLoadingMs);
    throw new Error("Forced stage initialization failure (m3StageFail=1).");
  }

  const [proteinExists, ligandExists] = await Promise.all([
    assetExists(options.proteinUrl),
    assetExists(options.ligandUrl),
  ]);

  const elapsedMs = performance.now() - startedAt;
  if (elapsedMs < minLoadingMs) {
    await wait(minLoadingMs - elapsedMs);
  }

  if (!proteinExists) {
    throw new Error(`Unable to load startup protein asset: ${options.proteinUrl}`);
  }

  if (!ligandExists) {
    throw new Error(`Unable to load default ligand asset: ${options.ligandUrl}`);
  }

  const stageCanvas = document.createElement("div");
  stageCanvas.className = "ngl-stage-canvas";
  stageCanvas.setAttribute("data-test-id", "ngl-stage-scene");
  stageCanvas.setAttribute("role", "img");
  stageCanvas.setAttribute("aria-label", "3FLY protein and Crystal Ligand stage preview");
  stageCanvas.textContent = "3FLY stage ready";

  options.container.innerHTML = "";
  options.container.appendChild(stageCanvas);

  let isDestroyed = false;
  let currentCamera = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
  debugState.currentCamera = cloneCameraSnapshot(currentCamera);

  const controller: NglStageController = {
    getCameraSnapshot() {
      return cloneCameraSnapshot(currentCamera);
    },
    setCameraSnapshot(snapshot: CameraSnapshot) {
      currentCamera = cloneCameraSnapshot(snapshot);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    resetView() {
      currentCamera = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    handleResize() {
      const beforeResize = cloneCameraSnapshot(currentCamera);
      stageCanvas.style.setProperty("--host-width", `${options.container.clientWidth}`);
      stageCanvas.style.setProperty("--host-height", `${options.container.clientHeight}`);
      debugState.lastResizeCameraPreserved = cameraSnapshotsEqual(beforeResize, currentCamera);
      debugState.currentCamera = cloneCameraSnapshot(currentCamera);
    },
    destroy() {
      if (isDestroyed) {
        return;
      }

      isDestroyed = true;
      options.container.innerHTML = "";
      debugState.stageDestroyCount += 1;
    },
  };

  controller.handleResize();
  return controller;
}
