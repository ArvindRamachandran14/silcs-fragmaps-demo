import { Module, MutationTree } from "vuex";
import { CameraSnapshot, CAMERA_BASELINE_SNAPSHOT } from "@/viewer/nglStage";
import type { RootState } from "@/store";

export type ViewerStatus = "idle" | "loading" | "ready" | "error";

export const DEFAULT_LIGAND_ID = "3fly_cryst_lig";
export const DEFAULT_LIGAND_LABEL = "Crystal Ligand";

export interface ViewerState {
  status: ViewerStatus;
  selectedLigandId: string;
  selectedLigandLabel: string;
  baselinePoseVisible: boolean;
  refinedPoseVisible: boolean;
  visibleFragMapIds: string[];
  cameraBaseline: CameraSnapshot;
  cameraSnapshot: CameraSnapshot;
  lastError: string | null;
  initAttemptCount: number;
}

function cloneCameraSnapshot(snapshot: CameraSnapshot): CameraSnapshot {
  return {
    position: [...snapshot.position] as [number, number, number],
    target: [...snapshot.target] as [number, number, number],
    up: [...snapshot.up] as [number, number, number],
    zoom: snapshot.zoom,
  };
}

function applyDefaultViewerState(targetState: ViewerState): void {
  targetState.selectedLigandId = DEFAULT_LIGAND_ID;
  targetState.selectedLigandLabel = DEFAULT_LIGAND_LABEL;
  targetState.baselinePoseVisible = true;
  targetState.refinedPoseVisible = false;
  targetState.visibleFragMapIds = [];
  targetState.cameraBaseline = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
  targetState.cameraSnapshot = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
}

const state: ViewerState = {
  status: "idle",
  selectedLigandId: DEFAULT_LIGAND_ID,
  selectedLigandLabel: DEFAULT_LIGAND_LABEL,
  baselinePoseVisible: true,
  refinedPoseVisible: false,
  visibleFragMapIds: [],
  cameraBaseline: cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT),
  cameraSnapshot: cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT),
  lastError: null,
  initAttemptCount: 0,
};

const mutations: MutationTree<ViewerState> = {
  setLoading(currentState) {
    currentState.status = "loading";
    currentState.lastError = null;
    currentState.initAttemptCount += 1;
    applyDefaultViewerState(currentState);
  },
  setReady(
    currentState,
    payload?: {
      cameraBaseline?: CameraSnapshot;
      cameraSnapshot?: CameraSnapshot;
      selectedLigandLabel?: string;
    },
  ) {
    currentState.status = "ready";
    currentState.lastError = null;

    if (payload?.cameraBaseline) {
      currentState.cameraBaseline = cloneCameraSnapshot(payload.cameraBaseline);
    }

    if (payload?.cameraSnapshot) {
      currentState.cameraSnapshot = cloneCameraSnapshot(payload.cameraSnapshot);
    }

    if (payload?.selectedLigandLabel) {
      currentState.selectedLigandLabel = payload.selectedLigandLabel;
    }
  },
  setError(currentState, message: string) {
    currentState.status = "error";
    currentState.lastError = message;
  },
  setCameraSnapshot(currentState, snapshot: CameraSnapshot) {
    currentState.cameraSnapshot = cloneCameraSnapshot(snapshot);
  },
};

const viewerModule: Module<ViewerState, RootState> = {
  namespaced: true,
  state,
  mutations,
};

export default viewerModule;
