<template>
  <section class="viewer-page" data-test-id="viewer-page">
    <viewer-top-bar
      :status="viewerStatus"
      :can-reset="canResetView"
      @reset-view="handleResetView"
      @toggle-controls="mobileControlsOpen = true"
    />

    <v-alert
      v-if="catastrophicError"
      data-test-id="viewer-startup-fallback"
      type="error"
      outlined
      dense
      class="mb-0"
    >
      <div class="text-subtitle-2 mb-2">Viewer startup failed</div>
      <p class="mb-2">{{ catastrophicError }}</p>
      <p class="mb-3">Retry startup or go back to Home. The app remains responsive.</p>
      <div class="viewer-page__fallback-actions">
        <v-btn small color="error" data-test-id="viewer-retry-startup" @click="retryInitialization">
          Retry startup
        </v-btn>
        <v-btn small text color="primary" data-test-id="viewer-fallback-home" to="/">
          Go to Home
        </v-btn>
      </div>
    </v-alert>

    <template v-else>
      <v-row
        no-gutters
        class="viewer-page__layout"
      >
        <v-col
          cols="12"
          md="8"
          lg="9"
          class="viewer-page__viewport-col"
        >
          <ngl-viewport ref="viewport" :status="viewerStatus" />
        </v-col>
        <v-col
          cols="12"
          md="4"
          lg="3"
          class="d-none d-md-block viewer-page__controls-col"
        >
          <controls-panel
            :featured-ligands="featuredLigands"
            :selected-ligand-id="viewerState.selectedLigandId"
            :selected-ligand-label="viewerState.selectedLigandLabel"
            :ligand-switch-loading="viewerState.ligandSwitchLoading"
            :baseline-pose-visible="viewerState.baselinePoseVisible"
            :refined-pose-visible="viewerState.refinedPoseVisible"
            :baseline-pose-disabled="viewerState.baselinePoseDisabled"
            :refined-pose-disabled="viewerState.refinedPoseDisabled"
            :baseline-pose-loading="viewerState.baselinePoseLoading"
            :refined-pose-loading="viewerState.refinedPoseLoading"
            :baseline-pose-error="viewerState.baselinePoseError"
            :refined-pose-error="viewerState.refinedPoseError"
            :visible-frag-map-ids="viewerState.visibleFragMapIds"
            :camera-baseline="viewerState.cameraBaseline"
            :camera-snapshot="viewerState.cameraSnapshot"
            :can-reset="canResetView"
            @reset-view="handleResetView"
            @toggle-pose="handlePoseToggle"
            @select-featured-ligand="handleFeaturedLigandSwitch"
            @show-baseline="handleShowBaseline"
            @show-refined="handleShowRefined"
            @show-both="handleShowBoth"
            @zoom-ligand="handleZoomLigand"
          />
        </v-col>
      </v-row>

      <v-navigation-drawer
        v-model="mobileControlsOpen"
        temporary
        right
        width="320"
        class="d-md-none"
        data-test-id="viewer-controls-drawer"
      >
        <controls-panel
          :featured-ligands="featuredLigands"
          :selected-ligand-id="viewerState.selectedLigandId"
          :selected-ligand-label="viewerState.selectedLigandLabel"
          :ligand-switch-loading="viewerState.ligandSwitchLoading"
          :baseline-pose-visible="viewerState.baselinePoseVisible"
          :refined-pose-visible="viewerState.refinedPoseVisible"
          :baseline-pose-disabled="viewerState.baselinePoseDisabled"
          :refined-pose-disabled="viewerState.refinedPoseDisabled"
          :baseline-pose-loading="viewerState.baselinePoseLoading"
          :refined-pose-loading="viewerState.refinedPoseLoading"
          :baseline-pose-error="viewerState.baselinePoseError"
          :refined-pose-error="viewerState.refinedPoseError"
          :visible-frag-map-ids="viewerState.visibleFragMapIds"
          :camera-baseline="viewerState.cameraBaseline"
          :camera-snapshot="viewerState.cameraSnapshot"
          :can-reset="canResetView"
          @reset-view="handleResetView"
          @toggle-pose="handlePoseToggle"
          @select-featured-ligand="handleFeaturedLigandSwitch"
          @show-baseline="handleShowBaseline"
          @show-refined="handleShowRefined"
          @show-both="handleShowBoth"
          @zoom-ligand="handleZoomLigand"
        />
      </v-navigation-drawer>
    </template>

    <v-snackbar
      v-model="showToast"
      timeout="3200"
      top
      right
      class="viewer-page__toast"
      data-test-id="viewer-toast"
    >
      {{ toastMessage }}
    </v-snackbar>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import ControlsPanel from "@/components/ControlsPanel.vue";
import NglViewport from "@/components/NglViewport.vue";
import ViewerTopBar from "@/components/ViewerTopBar.vue";
import { AssetManifest, LigandAsset, loadAssetManifest } from "@/data/manifest";
import { RootState } from "@/store";
import { ViewerState, DEFAULT_LIGAND_ID } from "@/store/modules/viewer";
import type { PoseKind } from "@/store/modules/viewer";
import { StartupState } from "@/store/modules/startup";
import {
  getForcedPoseFailuresFromQuery,
  getMinLoadingMsFromQuery,
  getViewerM3DebugState,
  isForcedStageFailureFromQuery,
  LigandSwitchResult,
  NglStageController,
  initializeNglStage,
} from "@/viewer/nglStage";

const M4B_FEATURED_LIGAND_IDS = [
  DEFAULT_LIGAND_ID,
  "p38_goldstein_05_2e",
  "p38_goldstein_06_2f",
  "p38_goldstein_07_2g",
];

interface FeaturedLigandChip {
  id: string;
  label: string;
  disabled: boolean;
  disabledReason: string | null;
}

export default Vue.extend({
  name: "ViewerPage",
  components: {
    ControlsPanel,
    NglViewport,
    ViewerTopBar,
  },
  data() {
    return {
      stageController: null as NglStageController | null,
      removeResizeListener: null as (() => void) | null,
      catastrophicError: null as string | null,
      mobileControlsOpen: false,
      initSequence: 0,
      manifest: null as AssetManifest | null,
      featuredLigands: [] as FeaturedLigandChip[],
      showToast: false,
      toastMessage: "",
    };
  },
  computed: {
    startupState(): StartupState {
      return (this.$store.state as RootState).startup;
    },
    viewerState(): ViewerState {
      return (this.$store.state as RootState).viewer;
    },
    viewerStatus(): string {
      return this.viewerState.status;
    },
    canResetView(): boolean {
      return this.viewerStatus === "ready" && Boolean(this.stageController);
    },
  },
  mounted() {
    void this.initializeStage();
  },
  beforeDestroy() {
    this.teardownStage();
  },
  methods: {
    async getManifest(): Promise<AssetManifest> {
      if (this.startupState.manifest) {
        return this.startupState.manifest;
      }

      return loadAssetManifest();
    },
    getDefaultLigand(manifest: AssetManifest): LigandAsset {
      const ligand = manifest.ligands.find((entry) => entry.id === DEFAULT_LIGAND_ID);
      if (!ligand) {
        throw new Error(`Manifest missing default ligand ${DEFAULT_LIGAND_ID}.`);
      }

      return ligand;
    },
    getLigandById(ligandId: string): LigandAsset | null {
      if (!this.manifest) {
        return null;
      }

      return this.manifest.ligands.find((entry) => entry.id === ligandId) || null;
    },
    buildFeaturedLigands(manifest: AssetManifest): FeaturedLigandChip[] {
      const ligandsById = new Map(manifest.ligands.map((ligand) => [ligand.id, ligand] as const));
      const disableIntents = this.startupState.report?.disabledControlIntents.ligandPoseControls || {};

      return M4B_FEATURED_LIGAND_IDS.map((ligandId) => {
        const ligand = ligandsById.get(ligandId);
        const baselineDisabled = Boolean(disableIntents[ligandId]?.baseline);
        if (!ligand) {
          return {
            id: ligandId,
            label: ligandId,
            disabled: true,
            disabledReason: "Unavailable",
          };
        }

        return {
          id: ligand.id,
          label: ligand.label,
          disabled: baselineDisabled,
          disabledReason: baselineDisabled ? "Unavailable" : null,
        };
      });
    },
    disableFeaturedLigand(ligandId: string, reason: string) {
      this.featuredLigands = this.featuredLigands.map((entry) =>
        entry.id === ligandId
          ? {
              ...entry,
              disabled: true,
              disabledReason: reason,
            }
          : entry,
      );
    },
    attachResizeListener() {
      this.detachResizeListener();

      const handler = () => {
        if (!this.stageController) {
          return;
        }

        this.stageController.handleResize();
        this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
      };

      window.addEventListener("resize", handler);

      const debugState = getViewerM3DebugState();
      debugState.activeResizeListeners += 1;
      debugState.peakResizeListeners = Math.max(debugState.peakResizeListeners, debugState.activeResizeListeners);

      this.removeResizeListener = () => {
        window.removeEventListener("resize", handler);
        const currentDebug = getViewerM3DebugState();
        currentDebug.activeResizeListeners = Math.max(0, currentDebug.activeResizeListeners - 1);
      };
    },
    detachResizeListener() {
      if (!this.removeResizeListener) {
        return;
      }

      this.removeResizeListener();
      this.removeResizeListener = null;
    },
    teardownStage() {
      this.detachResizeListener();

      if (this.stageController) {
        this.stageController.destroy();
        this.stageController = null;
      }
    },
    async initializeStage() {
      const currentSequence = ++this.initSequence;
      this.teardownStage();
      this.catastrophicError = null;
      this.manifest = null;
      this.featuredLigands = [];
      this.$store.commit("viewer/setLoading");

      try {
        const manifest = await this.getManifest();
        this.manifest = manifest;
        this.featuredLigands = this.buildFeaturedLigands(manifest);
        const defaultLigand = this.getDefaultLigand(manifest);
        const viewport = this.$refs.viewport as Vue & {
          getHostElement?: () => HTMLElement | null;
        };

        const hostElement = viewport.getHostElement ? viewport.getHostElement() : null;
        if (!hostElement) {
          throw new Error("NGL viewport host is unavailable.");
        }

        const stageController = await initializeNglStage({
          container: hostElement,
          proteinUrl: manifest.protein.pdbUrl,
          ligandUrl: defaultLigand.baselineSdfUrl,
          refinedLigandUrl: defaultLigand.refinedSdfUrl,
          refinedLigandFallbackUrl: defaultLigand.refinedPdbFallbackUrl,
          forcedPoseFailures: getForcedPoseFailuresFromQuery(this.$route.query.m4FailPose),
          forceInitFailure: isForcedStageFailureFromQuery(this.$route.query.m3StageFail),
          minLoadingMs: getMinLoadingMsFromQuery(this.$route.query.m3LoadMs),
        });

        if (currentSequence !== this.initSequence) {
          stageController.destroy();
          return;
        }

        this.stageController = stageController;
        this.attachResizeListener();

        this.$store.commit("viewer/setReady", {
          cameraBaseline: stageController.getCameraBaseline(),
          cameraSnapshot: stageController.getCameraSnapshot(),
          selectedLigandLabel: defaultLigand.label,
        });
        this.$store.commit("viewer/setLigandSwitchLoading", false);
      } catch (error) {
        if (currentSequence !== this.initSequence) {
          return;
        }

        const message = error instanceof Error ? error.message : String(error);
        this.catastrophicError = message;
        this.$store.commit("viewer/setError", message);
        this.toastMessage = `Viewer startup failed: ${message}`;
        this.showToast = true;
      }
    },
    handleResetView() {
      if (!this.stageController) {
        return;
      }

      this.stageController.resetView();
      this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
      this.toastMessage = "Camera reset to baseline view.";
      this.showToast = true;
    },
    async setPoseVisibility(kind: PoseKind, visible: boolean): Promise<boolean> {
      if (!this.stageController) {
        return false;
      }

      const disabled =
        kind === "baseline" ? this.viewerState.baselinePoseDisabled : this.viewerState.refinedPoseDisabled;
      const loading = kind === "baseline" ? this.viewerState.baselinePoseLoading : this.viewerState.refinedPoseLoading;

      if ((disabled && visible) || loading || this.viewerState.ligandSwitchLoading) {
        return false;
      }

      this.$store.commit("viewer/setPoseLoading", { kind, loading: true });
      this.$store.commit("viewer/setPoseError", { kind, error: null });

      try {
        await this.stageController.setPoseVisibility(kind, visible);
        this.$store.commit("viewer/setPoseVisibility", { kind, visible });
        this.$store.commit("viewer/setPoseDisabled", { kind, disabled: false });
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.$store.commit("viewer/setPoseVisibility", { kind, visible: false });
        this.$store.commit("viewer/setPoseDisabled", { kind, disabled: true });
        this.$store.commit("viewer/setPoseError", { kind, error: message });
        this.toastMessage = `${kind === "baseline" ? "Baseline" : "Refined"} pose failed: ${message}`;
        this.showToast = true;
        return false;
      } finally {
        this.$store.commit("viewer/setPoseLoading", { kind, loading: false });
        this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
      }
    },
    async handlePoseToggle(payload: { kind: PoseKind; visible: boolean }) {
      await this.setPoseVisibility(payload.kind, payload.visible);
    },
    async handleFeaturedLigandSwitch(ligandId: string) {
      if (!this.stageController || !this.manifest || this.viewerState.ligandSwitchLoading) {
        return;
      }

      if (ligandId === this.viewerState.selectedLigandId) {
        return;
      }

      const ligand = this.getLigandById(ligandId);
      if (!ligand) {
        this.disableFeaturedLigand(ligandId, "Unavailable");
        this.toastMessage = `Ligand ${ligandId} is unavailable in this build.`;
        this.showToast = true;
        return;
      }

      const chip = this.featuredLigands.find((entry) => entry.id === ligandId);
      if (chip?.disabled) {
        this.toastMessage = `${chip.label} is unavailable.`;
        this.showToast = true;
        return;
      }

      const baselineVisible = this.viewerState.baselinePoseVisible;
      const refinedVisible = this.viewerState.refinedPoseVisible;
      this.$store.commit("viewer/setLigandSwitchLoading", true);
      this.$store.commit("viewer/setPoseError", { kind: "baseline", error: null });
      this.$store.commit("viewer/setPoseError", { kind: "refined", error: null });

      try {
        const switchResult: LigandSwitchResult = await this.stageController.switchLigand({
          baselineLigandUrl: ligand.baselineSdfUrl,
          refinedLigandUrl: ligand.refinedSdfUrl,
          refinedLigandFallbackUrl: ligand.refinedPdbFallbackUrl,
          baselineVisible,
          refinedVisible,
        });

        this.$store.commit("viewer/setSelectedLigand", { id: ligand.id, label: ligand.label });
        this.$store.commit("viewer/setPoseVisibility", { kind: "baseline", visible: switchResult.baselineVisible });
        this.$store.commit("viewer/setPoseVisibility", { kind: "refined", visible: switchResult.refinedVisible });
        this.$store.commit("viewer/setPoseDisabled", { kind: "baseline", disabled: false });
        this.$store.commit("viewer/setPoseDisabled", {
          kind: "refined",
          disabled: Boolean(switchResult.refinedError),
        });
        this.$store.commit("viewer/setPoseError", {
          kind: "refined",
          error: switchResult.refinedError,
        });
        this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());

        if (switchResult.refinedError) {
          this.toastMessage = `Switched to ${ligand.label}; refined pose unavailable: ${switchResult.refinedError}`;
        } else {
          this.toastMessage = `Switched to ${ligand.label}.`;
        }
        this.showToast = true;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.disableFeaturedLigand(ligand.id, "Load failed");
        this.toastMessage = `Failed to switch to ${ligand.label}: ${message}`;
        this.showToast = true;
      } finally {
        this.$store.commit("viewer/setLigandSwitchLoading", false);
      }
    },
    async handleShowBaseline() {
      await this.setPoseVisibility("baseline", true);
      await this.setPoseVisibility("refined", false);
    },
    async handleShowRefined() {
      await this.setPoseVisibility("baseline", false);
      await this.setPoseVisibility("refined", true);
    },
    async handleShowBoth() {
      await this.setPoseVisibility("baseline", true);
      await this.setPoseVisibility("refined", true);
    },
    handleZoomLigand() {
      if (!this.stageController) {
        return;
      }

      this.stageController.zoomToLigand();
      this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
      this.toastMessage = "Zoomed to selected ligand.";
      this.showToast = true;
    },
    async retryInitialization() {
      if (isForcedStageFailureFromQuery(this.$route.query.m3StageFail)) {
        const nextQuery = { ...this.$route.query };
        delete nextQuery.m3StageFail;
        await this.$router.replace({ path: this.$route.path, query: nextQuery });
      }

      await this.initializeStage();
    },
  },
});
</script>

<style scoped>
.viewer-page {
  min-width: 0;
}

.viewer-page__layout {
  margin: 0;
  width: 100%;
}

.viewer-page__viewport-col,
.viewer-page__controls-col {
  min-width: 0;
  padding: 8px;
}

.viewer-page__controls-col {
  display: flex;
}

.viewer-page__controls-col > * {
  min-width: 0;
  width: 100%;
}

.viewer-page__fallback-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.viewer-page__toast {
  pointer-events: none;
}
</style>
