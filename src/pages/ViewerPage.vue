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
            :frag-map-shell-rows="fragMapShellRows"
            :selected-ligand-id="viewerState.selectedLigandId"
            :selected-ligand-label="viewerState.selectedLigandLabel"
            :ligand-switch-loading="viewerState.ligandSwitchLoading"
            :protein-visible="viewerState.proteinVisible"
            :protein-toggle-disabled="viewerStatus !== 'ready' || proteinVisibilityLoading"
            :baseline-pose-visible="viewerState.baselinePoseVisible"
            :refined-pose-visible="viewerState.refinedPoseVisible"
            :baseline-pose-disabled="viewerState.baselinePoseDisabled"
            :refined-pose-disabled="viewerState.refinedPoseDisabled"
            :baseline-pose-loading="viewerState.baselinePoseLoading"
            :refined-pose-loading="viewerState.refinedPoseLoading"
            :baseline-pose-error="viewerState.baselinePoseError"
            :refined-pose-error="viewerState.refinedPoseError"
            :visible-frag-map-ids="viewerState.visibleFragMapIds"
            :frag-map-loading-row-id="fragMapLoadingRowId"
            :frag-map-disabled-row-ids="fragMapDisabledRowIds"
            :frag-map-status-by-id="fragMapStatusById"
            :frag-map-iso-by-id="fragMapIsoById"
            :frag-map-error-by-id="fragMapErrorById"
            :frag-map-actions-disabled="fragMapActionsDisabled"
            :camera-baseline="viewerState.cameraBaseline"
            :camera-snapshot="viewerState.cameraSnapshot"
            @toggle-protein="handleProteinToggle"
            @toggle-fragmap="handleFragMapToggle"
            @adjust-fragmap-iso="handleFragMapIsoStep"
            @set-fragmap-iso="handleFragMapIsoInput"
            @hide-all-fragmaps="handleHideAllFragMaps"
            @reset-default-fragmaps="handleResetDefaultFragMaps"
            @toggle-pose="handlePoseToggle"
            @select-featured-ligand="handleFeaturedLigandSwitch"
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
          :frag-map-shell-rows="fragMapShellRows"
          :selected-ligand-id="viewerState.selectedLigandId"
          :selected-ligand-label="viewerState.selectedLigandLabel"
          :ligand-switch-loading="viewerState.ligandSwitchLoading"
          :protein-visible="viewerState.proteinVisible"
          :protein-toggle-disabled="viewerStatus !== 'ready' || proteinVisibilityLoading"
          :baseline-pose-visible="viewerState.baselinePoseVisible"
          :refined-pose-visible="viewerState.refinedPoseVisible"
          :baseline-pose-disabled="viewerState.baselinePoseDisabled"
          :refined-pose-disabled="viewerState.refinedPoseDisabled"
          :baseline-pose-loading="viewerState.baselinePoseLoading"
          :refined-pose-loading="viewerState.refinedPoseLoading"
          :baseline-pose-error="viewerState.baselinePoseError"
          :refined-pose-error="viewerState.refinedPoseError"
          :visible-frag-map-ids="viewerState.visibleFragMapIds"
          :frag-map-loading-row-id="fragMapLoadingRowId"
          :frag-map-disabled-row-ids="fragMapDisabledRowIds"
          :frag-map-status-by-id="fragMapStatusById"
          :frag-map-iso-by-id="fragMapIsoById"
          :frag-map-error-by-id="fragMapErrorById"
          :frag-map-actions-disabled="fragMapActionsDisabled"
          :camera-baseline="viewerState.cameraBaseline"
          :camera-snapshot="viewerState.cameraSnapshot"
          @toggle-protein="handleProteinToggle"
          @toggle-fragmap="handleFragMapToggle"
          @adjust-fragmap-iso="handleFragMapIsoStep"
          @set-fragmap-iso="handleFragMapIsoInput"
          @hide-all-fragmaps="handleHideAllFragMaps"
          @reset-default-fragmaps="handleResetDefaultFragMaps"
          @toggle-pose="handlePoseToggle"
          @select-featured-ligand="handleFeaturedLigandSwitch"
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
import { AssetManifest, FragMapAsset, LigandAsset, loadAssetManifest } from "@/data/manifest";
import { RootState } from "@/store";
import { ViewerState, DEFAULT_LIGAND_ID } from "@/store/modules/viewer";
import type { PoseKind } from "@/store/modules/viewer";
import { StartupState } from "@/store/modules/startup";
import {
  getForcedFragMapFailuresFromQuery,
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
const M5_ISO_MIN = -3.0;
const M5_ISO_MAX = 0.0;
const M5_ISO_STEP = 0.1;
const M5_ISO_PRECISION = 1;
const M5_EXCLUSION_ROW_ID = "3fly.excl.dx";

interface FeaturedLigandChip {
  id: string;
  label: string;
  disabled: boolean;
  disabledReason: string | null;
}

interface FragMapShellRow {
  id: string;
  label: string;
  color: string;
  section: "primary" | "advanced";
  dxUrl?: string;
  defaultIso?: number;
}

interface FragMapRuntimeState {
  loaded: boolean;
  loading: boolean;
  disabled: boolean;
  statusText: string | null;
  error: string | null;
}

interface FragMapIsoStepPayload {
  id: string;
  direction: -1 | 1;
}

interface FragMapIsoInputPayload {
  id: string;
  value: string;
}

const M5_FRAGMAP_SHELL_ROWS: FragMapShellRow[] = [
  {
    id: "3fly.hbdon.gfe.dx",
    label: "Generic Donor",
    color: "#1976d2",
    section: "primary",
    dxUrl: "/assets/maps/3fly.hbdon.gfe.dx",
    defaultIso: -0.8,
  },
  {
    id: "3fly.hbacc.gfe.dx",
    label: "Generic Acceptor",
    color: "#d32f2f",
    section: "primary",
    dxUrl: "/assets/maps/3fly.hbacc.gfe.dx",
    defaultIso: -0.8,
  },
  {
    id: "3fly.apolar.gfe.dx",
    label: "Generic Apolar",
    color: "#2e7d32",
    section: "primary",
    dxUrl: "/assets/maps/3fly.apolar.gfe.dx",
    defaultIso: -1.0,
  },
  {
    id: "3fly.mamn.gfe.dx",
    label: "Positively Charged",
    color: "#f57c00",
    section: "advanced",
    dxUrl: "/assets/maps/3fly.mamn.gfe.dx",
    defaultIso: -1.2,
  },
  {
    id: "3fly.acec.gfe.dx",
    label: "Negatively Charged",
    color: "#c2185b",
    section: "advanced",
    dxUrl: "/assets/maps/3fly.acec.gfe.dx",
    defaultIso: -1.2,
  },
  {
    id: "3fly.meoo.gfe.dx",
    label: "Hydroxyl Oxygen",
    color: "#0097a7",
    section: "advanced",
    dxUrl: "/assets/maps/3fly.meoo.gfe.dx",
    defaultIso: -0.8,
  },
  {
    id: "3fly.tipo.gfe.dx",
    label: "Water Oxygen",
    color: "#f9a825",
    section: "advanced",
    dxUrl: "/assets/maps/3fly.tipo.gfe.dx",
    defaultIso: -0.3,
  },
  {
    id: "3fly.excl.dx",
    label: "Exclusion Map",
    color: "#9e9e9e",
    section: "advanced",
    dxUrl: "/assets/maps/3fly.excl.dx",
  },
];

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
      proteinVisibilityLoading: false,
      fragMapRuntime: {} as Record<string, FragMapRuntimeState>,
      fragMapIsoById: {} as Record<string, number>,
      fragMapLoadingRowId: null as string | null,
      fragMapBulkActionLoading: false,
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
    fragMapShellRows(): FragMapShellRow[] {
      if (!this.manifest) {
        return M5_FRAGMAP_SHELL_ROWS;
      }

      const rowsById = new Map(
        this.manifest.fragMaps.map((entry: FragMapAsset) => [
          entry.id,
          {
            id: entry.id,
            label: entry.label,
            color: entry.color,
            section: entry.section,
            dxUrl: entry.dxUrl,
            defaultIso: entry.defaultIso,
          } as FragMapShellRow,
        ]),
      );
      return M5_FRAGMAP_SHELL_ROWS.map((entry) => rowsById.get(entry.id) || entry);
    },
    fragMapDisabledRowIds(): string[] {
      return Object.entries(this.fragMapRuntime)
        .filter(([, runtime]) => runtime.disabled)
        .map(([rowId]) => rowId);
    },
    fragMapStatusById(): Record<string, string> {
      return Object.entries(this.fragMapRuntime).reduce((accumulator, [rowId, runtime]) => {
        if (runtime.statusText) {
          accumulator[rowId] = runtime.statusText;
        }
        return accumulator;
      }, {} as Record<string, string>);
    },
    fragMapErrorById(): Record<string, string> {
      return Object.entries(this.fragMapRuntime).reduce((accumulator, [rowId, runtime]) => {
        if (runtime.error) {
          accumulator[rowId] = runtime.error;
        }
        return accumulator;
      }, {} as Record<string, string>);
    },
    fragMapActionsDisabled(): boolean {
      return (
        this.viewerStatus !== "ready" ||
        !this.stageController ||
        this.proteinVisibilityLoading ||
        this.viewerState.ligandSwitchLoading ||
        this.fragMapBulkActionLoading ||
        Boolean(this.fragMapLoadingRowId)
      );
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
    isIsoAdjustableRow(row: FragMapShellRow): boolean {
      return row.id !== M5_EXCLUSION_ROW_ID && typeof row.defaultIso === "number";
    },
    normalizeIsoValue(candidate: number): number {
      const clamped = Math.min(M5_ISO_MAX, Math.max(M5_ISO_MIN, candidate));
      return Number(clamped.toFixed(M5_ISO_PRECISION));
    },
    resetFragMapIsoState() {
      const nextIsoById: Record<string, number> = {};
      for (const row of this.fragMapShellRows) {
        if (this.isIsoAdjustableRow(row)) {
          nextIsoById[row.id] = this.normalizeIsoValue(row.defaultIso as number);
        }
      }
      this.fragMapIsoById = nextIsoById;
    },
    getFragMapIsoValue(rowId: string): number | null {
      const value = this.fragMapIsoById[rowId];
      return typeof value === "number" && !Number.isNaN(value) ? value : null;
    },
    getFragMapVisibilityOptions(row: FragMapShellRow) {
      return {
        id: row.id,
        dxUrl: row.dxUrl || `/assets/maps/${row.id}`,
        color: row.color,
        defaultIso: row.defaultIso,
        isoValue: this.getFragMapIsoValue(row.id) ?? undefined,
      };
    },
    incrementM5DebugCounter(key: "hideAllCount" | "resetDefaultsCount") {
      const globalWindow = window as Window & {
        __viewerM5Debug?: {
          hideAllCount?: number;
          resetDefaultsCount?: number;
        };
      };

      const debugState = globalWindow.__viewerM5Debug;
      if (!debugState) {
        return;
      }

      debugState[key] = (debugState[key] || 0) + 1;
    },
    resetFragMapRuntime() {
      const nextState: Record<string, FragMapRuntimeState> = {};
      for (const row of this.fragMapShellRows) {
        nextState[row.id] = {
          loaded: false,
          loading: false,
          disabled: false,
          statusText: null,
          error: null,
        };
      }
      this.fragMapRuntime = nextState;
      this.resetFragMapIsoState();
      this.fragMapLoadingRowId = null;
      this.$store.commit("viewer/setVisibleFragMapIds", []);
    },
    getFragMapRowById(rowId: string): FragMapShellRow | null {
      return this.fragMapShellRows.find((entry) => entry.id === rowId) || null;
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
      this.proteinVisibilityLoading = false;
      this.resetFragMapRuntime();
      this.$store.commit("viewer/setLoading");

      try {
        const manifest = await this.getManifest();
        this.manifest = manifest;
        this.featuredLigands = this.buildFeaturedLigands(manifest);
        this.resetFragMapRuntime();
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
          forcedFragMapFailures: getForcedFragMapFailuresFromQuery(this.$route.query.m5FailMap),
          forceInitFailure: isForcedStageFailureFromQuery(this.$route.query.m3StageFail),
          minLoadingMs: getMinLoadingMsFromQuery(this.$route.query.m3LoadMs),
          minFragMapLoadingMs: getMinLoadingMsFromQuery(this.$route.query.m5MapLoadMs),
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
    async handleProteinToggle(payload: { visible: boolean }) {
      if (!this.stageController || this.viewerStatus !== "ready" || this.proteinVisibilityLoading) {
        return;
      }

      if (this.viewerState.proteinVisible === payload.visible) {
        return;
      }

      this.proteinVisibilityLoading = true;
      try {
        this.stageController.setProteinVisibility(payload.visible);
        this.$store.commit("viewer/setProteinVisible", payload.visible);
        this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.toastMessage = `Protein visibility update failed: ${message}`;
        this.showToast = true;
      } finally {
        this.proteinVisibilityLoading = false;
      }
    },
    async handleFragMapToggle(payload: { id: string; visible: boolean }) {
      if (!this.stageController || !this.manifest || this.viewerStatus !== "ready") {
        return;
      }

      const row = this.getFragMapRowById(payload.id);
      if (!row) {
        return;
      }

      const runtimeState = this.fragMapRuntime[payload.id];
      if (!runtimeState) {
        return;
      }

      if (runtimeState.disabled || this.fragMapLoadingRowId) {
        return;
      }

      const isCurrentlyVisible = this.viewerState.visibleFragMapIds.includes(payload.id);
      if (isCurrentlyVisible === payload.visible) {
        return;
      }

      const isFirstLoad = payload.visible && !runtimeState.loaded;
      if (isFirstLoad) {
        runtimeState.loading = true;
        runtimeState.statusText = "Loading...";
        runtimeState.error = null;
        this.fragMapLoadingRowId = payload.id;
      } else {
        runtimeState.error = null;
      }

      try {
        const visibilityResult = await this.stageController.setFragMapVisibility(
          this.getFragMapVisibilityOptions(row),
          payload.visible,
        );

        const nextVisibleIds = new Set(this.viewerState.visibleFragMapIds);
        if (payload.visible) {
          nextVisibleIds.add(payload.id);
        } else {
          nextVisibleIds.delete(payload.id);
        }
        this.$store.commit("viewer/setVisibleFragMapIds", Array.from(nextVisibleIds));
        this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());

        runtimeState.loaded = runtimeState.loaded || visibilityResult.firstLoad || visibilityResult.loadedFromCache;
        runtimeState.disabled = false;
        runtimeState.error = null;

        if (payload.visible) {
          runtimeState.statusText = visibilityResult.loadedFromCache ? "Loaded from cache" : "Loaded";
        } else {
          runtimeState.statusText = runtimeState.loaded ? "Cached" : null;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        runtimeState.loading = false;
        runtimeState.disabled = true;
        runtimeState.error = message;
        runtimeState.statusText = null;
        this.toastMessage = `${row.label} failed to load: ${message}`;
        this.showToast = true;
      } finally {
        runtimeState.loading = false;
        if (this.fragMapLoadingRowId === payload.id) {
          this.fragMapLoadingRowId = null;
        }
      }
    },
    async applyFragMapIsoValue(rowId: string, nextIso: number) {
      const row = this.getFragMapRowById(rowId);
      if (!row || !this.isIsoAdjustableRow(row)) {
        return;
      }

      const normalizedIso = this.normalizeIsoValue(nextIso);
      this.fragMapIsoById = {
        ...this.fragMapIsoById,
        [rowId]: normalizedIso,
      };

      if (!this.stageController || this.viewerStatus !== "ready") {
        return;
      }

      if (!this.viewerState.visibleFragMapIds.includes(rowId)) {
        return;
      }

      this.stageController.setFragMapIso(
        {
          ...this.getFragMapVisibilityOptions(row),
          isoValue: normalizedIso,
        },
        normalizedIso,
      );
      this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
    },
    async handleFragMapIsoStep(payload: FragMapIsoStepPayload) {
      if (this.fragMapBulkActionLoading) {
        return;
      }

      const row = this.getFragMapRowById(payload.id);
      if (!row || !this.isIsoAdjustableRow(row)) {
        return;
      }

      const runtimeState = this.fragMapRuntime[payload.id];
      if (runtimeState?.disabled || runtimeState?.loading || this.fragMapLoadingRowId) {
        return;
      }

      const currentIso = this.getFragMapIsoValue(payload.id);
      if (currentIso === null) {
        return;
      }

      const nextIso = currentIso + payload.direction * M5_ISO_STEP;
      await this.applyFragMapIsoValue(payload.id, nextIso);
    },
    async handleFragMapIsoInput(payload: FragMapIsoInputPayload) {
      if (this.fragMapBulkActionLoading) {
        return;
      }

      const row = this.getFragMapRowById(payload.id);
      if (!row || !this.isIsoAdjustableRow(row)) {
        return;
      }

      const runtimeState = this.fragMapRuntime[payload.id];
      if (runtimeState?.disabled || runtimeState?.loading || this.fragMapLoadingRowId) {
        return;
      }

      const lastValidIso = this.getFragMapIsoValue(payload.id);
      if (lastValidIso === null) {
        return;
      }

      const parsedValue = Number(payload.value);
      if (!Number.isFinite(parsedValue)) {
        this.fragMapIsoById = {
          ...this.fragMapIsoById,
          [payload.id]: lastValidIso,
        };
        return;
      }

      await this.applyFragMapIsoValue(payload.id, parsedValue);
    },
    async handleHideAllFragMaps() {
      if (this.fragMapActionsDisabled) {
        return;
      }

      this.fragMapBulkActionLoading = true;
      this.incrementM5DebugCounter("hideAllCount");

      try {
        const visibleRowIds = [...this.viewerState.visibleFragMapIds];
        for (const rowId of visibleRowIds) {
          await this.handleFragMapToggle({ id: rowId, visible: false });
        }

        if (visibleRowIds.length > 0) {
          this.toastMessage = "All FragMaps hidden.";
          this.showToast = true;
        }
      } finally {
        this.fragMapBulkActionLoading = false;
      }
    },
    async handleResetDefaultFragMaps() {
      if (this.fragMapActionsDisabled) {
        return;
      }

      this.fragMapBulkActionLoading = true;
      this.incrementM5DebugCounter("resetDefaultsCount");

      try {
        this.resetFragMapIsoState();

        if (this.stageController) {
          const visibleRowIds = [...this.viewerState.visibleFragMapIds];
          for (const rowId of visibleRowIds) {
            const nextIso = this.getFragMapIsoValue(rowId);
            if (nextIso === null) {
              continue;
            }

            const row = this.getFragMapRowById(rowId);
            if (!row) {
              continue;
            }

            this.stageController.setFragMapIso(
              {
                ...this.getFragMapVisibilityOptions(row),
                isoValue: nextIso,
              },
              nextIso,
            );
          }

          this.$store.commit("viewer/setCameraSnapshot", this.stageController.getCameraSnapshot());
        }

        const failedRows = Object.entries(this.fragMapRuntime)
          .filter(([, runtime]) => runtime.disabled)
          .map(([rowId]) => this.getFragMapRowById(rowId))
          .filter((row): row is FragMapShellRow => Boolean(row));

        if (failedRows.length > 0) {
          const failedLabels = failedRows.map((row) => row.label).join(", ");
          this.toastMessage = `Iso defaults restored. Disabled rows remain unchanged: ${failedLabels}.`;
        } else {
          this.toastMessage = "FragMap iso defaults restored.";
        }
        this.showToast = true;
      } finally {
        this.fragMapBulkActionLoading = false;
      }
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

@media (min-width: 960px) {
  .viewer-page__controls-col {
    padding-left: 16px !important;
  }
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
