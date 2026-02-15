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
            :selected-ligand-id="viewerState.selectedLigandId"
            :selected-ligand-label="viewerState.selectedLigandLabel"
            :baseline-pose-visible="viewerState.baselinePoseVisible"
            :refined-pose-visible="viewerState.refinedPoseVisible"
            :visible-frag-map-ids="viewerState.visibleFragMapIds"
            :camera-baseline="viewerState.cameraBaseline"
            :camera-snapshot="viewerState.cameraSnapshot"
            :can-reset="canResetView"
            @reset-view="handleResetView"
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
          :selected-ligand-id="viewerState.selectedLigandId"
          :selected-ligand-label="viewerState.selectedLigandLabel"
          :baseline-pose-visible="viewerState.baselinePoseVisible"
          :refined-pose-visible="viewerState.refinedPoseVisible"
          :visible-frag-map-ids="viewerState.visibleFragMapIds"
          :camera-baseline="viewerState.cameraBaseline"
          :camera-snapshot="viewerState.cameraSnapshot"
          :can-reset="canResetView"
          @reset-view="handleResetView"
        />
      </v-navigation-drawer>
    </template>

    <v-snackbar v-model="showToast" timeout="3200" top right data-test-id="viewer-toast">
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
import { StartupState } from "@/store/modules/startup";
import {
  getMinLoadingMsFromQuery,
  getViewerM3DebugState,
  isForcedStageFailureFromQuery,
  NglStageController,
  initializeNglStage,
} from "@/viewer/nglStage";

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
      this.$store.commit("viewer/setLoading");

      try {
        const manifest = await this.getManifest();
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
</style>
