import { Module, MutationTree } from "vuex";
import { CameraSnapshot, CAMERA_BASELINE_SNAPSHOT } from "@/viewer/nglStage";
import type { RootState } from "@/store";

export type ViewerStatus = "idle" | "loading" | "ready" | "error";
export type PoseKind = "baseline" | "refined";

export const DEFAULT_LIGAND_ID = "3fly_cryst_lig";
export const DEFAULT_LIGAND_LABEL = "Crystal Ligand";

export interface ViewerState {
  status: ViewerStatus;
  selectedLigandId: string;
  selectedLigandLabel: string;
  ligandSwitchLoading: boolean;
  baselinePoseVisible: boolean;
  refinedPoseVisible: boolean;
  baselinePoseDisabled: boolean;
  refinedPoseDisabled: boolean;
  baselinePoseLoading: boolean;
  refinedPoseLoading: boolean;
  baselinePoseError: string | null;
  refinedPoseError: string | null;
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
  targetState.ligandSwitchLoading = false;
  targetState.baselinePoseVisible = true;
  targetState.refinedPoseVisible = false;
  targetState.baselinePoseDisabled = false;
  targetState.refinedPoseDisabled = false;
  targetState.baselinePoseLoading = false;
  targetState.refinedPoseLoading = false;
  targetState.baselinePoseError = null;
  targetState.refinedPoseError = null;
  targetState.visibleFragMapIds = [];
  targetState.cameraBaseline = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
  targetState.cameraSnapshot = cloneCameraSnapshot(CAMERA_BASELINE_SNAPSHOT);
}

const state: ViewerState = {
  status: "idle",
  selectedLigandId: DEFAULT_LIGAND_ID,
  selectedLigandLabel: DEFAULT_LIGAND_LABEL,
  ligandSwitchLoading: false,
  baselinePoseVisible: true,
  refinedPoseVisible: false,
  baselinePoseDisabled: false,
  refinedPoseDisabled: false,
  baselinePoseLoading: false,
  refinedPoseLoading: false,
  baselinePoseError: null,
  refinedPoseError: null,
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
  setSelectedLigand(
    currentState,
    payload: {
      id: string;
      label: string;
    },
  ) {
    currentState.selectedLigandId = payload.id;
    currentState.selectedLigandLabel = payload.label;
  },
  setLigandSwitchLoading(currentState, loading: boolean) {
    currentState.ligandSwitchLoading = loading;
  },
  setError(currentState, message: string) {
    currentState.status = "error";
    currentState.lastError = message;
  },
  setCameraSnapshot(currentState, snapshot: CameraSnapshot) {
    currentState.cameraSnapshot = cloneCameraSnapshot(snapshot);
  },
  setPoseVisibility(currentState, payload: { kind: PoseKind; visible: boolean }) {
    if (payload.kind === "baseline") {
      currentState.baselinePoseVisible = payload.visible;
      return;
    }

    currentState.refinedPoseVisible = payload.visible;
  },
  setPoseLoading(currentState, payload: { kind: PoseKind; loading: boolean }) {
    if (payload.kind === "baseline") {
      currentState.baselinePoseLoading = payload.loading;
      return;
    }

    currentState.refinedPoseLoading = payload.loading;
  },
  setPoseDisabled(currentState, payload: { kind: PoseKind; disabled: boolean }) {
    if (payload.kind === "baseline") {
      currentState.baselinePoseDisabled = payload.disabled;
      return;
    }

    currentState.refinedPoseDisabled = payload.disabled;
  },
  setPoseError(currentState, payload: { kind: PoseKind; error: string | null }) {
    if (payload.kind === "baseline") {
      currentState.baselinePoseError = payload.error;
      return;
    }

    currentState.refinedPoseError = payload.error;
  },
  setVisibleFragMapIds(currentState, visibleIds: string[]) {
    currentState.visibleFragMapIds = [...visibleIds];
  },
};

const viewerModule: Module<ViewerState, RootState> = {
  namespaced: true,
  state,
  mutations,
};

export default viewerModule;
