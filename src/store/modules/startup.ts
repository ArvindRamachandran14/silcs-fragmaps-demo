import { ActionTree, Module, MutationTree } from "vuex";
import { AssetManifest, loadAssetManifest } from "@/data/manifest";
import { runStartupValidation, StartupValidationReport } from "@/startup/startupValidation";
import type { RootState } from "@/store";

export interface StartupState {
  status: "idle" | "loading" | "ready";
  manifest: AssetManifest | null;
  report: StartupValidationReport | null;
  error: string | null;
}

const state: StartupState = {
  status: "idle",
  manifest: null,
  report: null,
  error: null,
};

const mutations: MutationTree<StartupState> = {
  setLoading(currentState) {
    currentState.status = "loading";
    currentState.error = null;
  },
  setReady(
    currentState,
    payload: {
      manifest: AssetManifest;
      report: StartupValidationReport;
    },
  ) {
    currentState.status = "ready";
    currentState.manifest = payload.manifest;
    currentState.report = payload.report;
    currentState.error = null;
  },
  setError(currentState, errorMessage: string) {
    currentState.status = "ready";
    currentState.error = errorMessage;
  },
};

const actions: ActionTree<StartupState, RootState> = {
  async runValidation({ commit }) {
    commit("setLoading");

    try {
      const manifest = await loadAssetManifest();
      const report = await runStartupValidation(manifest);
      commit("setReady", { manifest, report });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      commit("setError", `Startup validation skipped: ${message}`);
    }
  },
};

const startupModule: Module<StartupState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
};

export default startupModule;
