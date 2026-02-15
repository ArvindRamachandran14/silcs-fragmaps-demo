<template>
  <aside class="controls-panel" data-test-id="controls-panel">
    <h2 class="text-subtitle-1 mb-3">Ligand Controls</h2>

    <div class="controls-panel__featured mb-3">
      <p class="text-caption font-weight-bold mb-2">Featured Ligands</p>
      <div class="controls-panel__chips" data-test-id="ligand-featured-chip-list">
        <button
          v-for="ligand in featuredLigands"
          :key="ligand.id"
          type="button"
          class="controls-panel__chip"
          :class="{
            'controls-panel__chip--active': selectedLigandId === ligand.id,
            'controls-panel__chip--disabled': ligand.disabled,
          }"
          :data-test-id="`ligand-featured-chip-${ligand.id}`"
          :disabled="ligandSwitchLoading || ligand.disabled || selectedLigandId === ligand.id"
          @click="onFeaturedLigandSelect(ligand.id)"
        >
          {{ ligand.label }}
        </button>
      </div>
      <p
        v-if="ligandSwitchLoading"
        class="controls-panel__loading mt-2 mb-0"
        data-test-id="ligand-switch-loading"
      >
        Loading selected ligand poses...
      </p>
      <p
        v-else-if="disabledFeaturedLigandLabels"
        class="controls-panel__muted mt-2 mb-0"
        data-test-id="ligand-featured-disabled-summary"
      >
        Unavailable: {{ disabledFeaturedLigandLabels }}
      </p>
    </div>

    <p class="mb-2" data-test-id="ligand-selection-summary">
      Active ligand: <strong>{{ selectedLigandLabel }}</strong>
      <span class="controls-panel__muted">(M4B featured-ligand scope)</span>
    </p>

    <div class="controls-panel__pose-group mb-3">
      <label class="controls-panel__checkbox-row" data-test-id="ligand-baseline-row">
        <input
          data-test-id="ligand-pose-baseline"
          type="checkbox"
          :checked="baselinePoseVisible"
          :disabled="baselinePoseDisabled || baselinePoseLoading || ligandSwitchLoading"
          @change="onPoseCheckboxChange('baseline', $event)"
        >
        <span>Baseline</span>
      </label>
      <p v-if="baselinePoseError" class="controls-panel__error" data-test-id="ligand-baseline-error">
        {{ baselinePoseError }}
      </p>

      <label class="controls-panel__checkbox-row mt-2" data-test-id="ligand-refined-row">
        <input
          data-test-id="ligand-pose-refined"
          type="checkbox"
          :checked="refinedPoseVisible"
          :disabled="refinedPoseDisabled || refinedPoseLoading || ligandSwitchLoading"
          @change="onPoseCheckboxChange('refined', $event)"
        >
        <span>Refined</span>
      </label>
      <p v-if="refinedPoseError" class="controls-panel__error" data-test-id="ligand-refined-error">
        {{ refinedPoseError }}
      </p>
    </div>

    <div
      v-if="bothVisible"
      class="controls-panel__legend mb-3"
      data-test-id="ligand-both-visible-legend"
    >
      <div class="text-caption font-weight-bold mb-1">Legend</div>
      <div class="text-caption">Baseline: thinner and lower opacity</div>
      <div class="text-caption">Refined: thicker and higher opacity</div>
    </div>

    <v-btn
      small
      color="primary"
      class="mb-3"
      data-test-id="ligand-zoom-action"
      :disabled="baselinePoseLoading || refinedPoseLoading || ligandSwitchLoading"
      @click="$emit('zoom-ligand')"
    >
      Zoom
    </v-btn>

    <h2 class="text-subtitle-1 mb-3">Viewer Context</h2>

    <p class="mb-3" data-test-id="viewer-context-caption">
      Showing 3FLY protein with <strong>{{ selectedLigandLabel }}</strong>, baseline pose
      {{ baselinePoseVisible ? "visible" : "hidden" }}, refined pose
      {{ refinedPoseVisible ? "visible" : "hidden" }}, and {{ visibleFragMapIds.length }} visible FragMaps.
    </p>

    <dl class="controls-panel__list mb-4">
      <div>
        <dt>Ligand</dt>
        <dd data-test-id="default-ligand-id">{{ selectedLigandId }}</dd>
      </div>
      <div>
        <dt>Baseline Pose</dt>
        <dd data-test-id="baseline-pose-state">{{ baselinePoseVisible ? "ON" : "OFF" }}</dd>
      </div>
      <div>
        <dt>Refined Pose</dt>
        <dd data-test-id="refined-pose-state">{{ refinedPoseVisible ? "ON" : "OFF" }}</dd>
      </div>
      <div>
        <dt>Visible FragMaps</dt>
        <dd data-test-id="visible-fragmaps-state">{{ visibleFragMapIds.length }}</dd>
      </div>
    </dl>

    <v-btn
      small
      text
      color="primary"
      class="mb-3"
      data-test-id="controls-reset-view"
      :disabled="!canReset"
      @click="$emit('reset-view')"
    >
      Reset view
    </v-btn>

    <div class="controls-panel__code-block">
      <h3 class="text-caption mb-1">Camera Baseline Contract</h3>
      <pre data-test-id="camera-baseline-contract">{{ baselineText }}</pre>
    </div>

    <div class="controls-panel__code-block mt-3">
      <h3 class="text-caption mb-1">Current Camera Snapshot</h3>
      <pre data-test-id="camera-snapshot">{{ currentCameraText }}</pre>
    </div>
  </aside>
</template>

<script lang="ts">
import Vue from "vue";
import { CameraSnapshot } from "@/viewer/nglStage";
import type { PoseKind } from "@/store/modules/viewer";

function formatCamera(snapshot: CameraSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export default Vue.extend({
  name: "ControlsPanel",
  props: {
    featuredLigands: {
      type: Array,
      required: true,
    },
    selectedLigandId: {
      type: String,
      required: true,
    },
    selectedLigandLabel: {
      type: String,
      required: true,
    },
    ligandSwitchLoading: {
      type: Boolean,
      required: true,
    },
    baselinePoseVisible: {
      type: Boolean,
      required: true,
    },
    refinedPoseVisible: {
      type: Boolean,
      required: true,
    },
    baselinePoseDisabled: {
      type: Boolean,
      required: true,
    },
    refinedPoseDisabled: {
      type: Boolean,
      required: true,
    },
    baselinePoseLoading: {
      type: Boolean,
      required: true,
    },
    refinedPoseLoading: {
      type: Boolean,
      required: true,
    },
    baselinePoseError: {
      type: String,
      required: false,
      default: null,
    },
    refinedPoseError: {
      type: String,
      required: false,
      default: null,
    },
    visibleFragMapIds: {
      type: Array,
      required: true,
    },
    cameraBaseline: {
      type: Object,
      required: true,
    },
    cameraSnapshot: {
      type: Object,
      required: true,
    },
    canReset: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    bothVisible(): boolean {
      return this.baselinePoseVisible && this.refinedPoseVisible;
    },
    baselineText(): string {
      return formatCamera(this.cameraBaseline as CameraSnapshot);
    },
    currentCameraText(): string {
      return formatCamera(this.cameraSnapshot as CameraSnapshot);
    },
    disabledFeaturedLigandLabels(): string {
      const entries = (this.featuredLigands as Array<{ label: string; disabled: boolean }>).filter(
        (entry) => entry.disabled,
      );
      return entries.map((entry) => entry.label).join(", ");
    },
  },
  methods: {
    onFeaturedLigandSelect(ligandId: string) {
      this.$emit("select-featured-ligand", ligandId);
    },
    onPoseCheckboxChange(kind: PoseKind, event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("toggle-pose", { kind, visible: target.checked });
    },
  },
});
</script>

<style scoped>
.controls-panel {
  border: 1px solid #d9dee7;
  border-radius: 10px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 16px;
}

.controls-panel__list {
  display: grid;
  gap: 8px;
  margin: 0;
}

.controls-panel__list dt {
  color: #445165;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.controls-panel__list dd {
  color: #1f2c3d;
  font-size: 14px;
  margin: 0;
  overflow-wrap: anywhere;
}

.controls-panel__muted {
  color: #6b7280;
  font-size: 12px;
}

.controls-panel__featured {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
}

.controls-panel__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.controls-panel__chip {
  background: #edf2fb;
  border: 1px solid #9fb4d8;
  border-radius: 999px;
  color: #26456f;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  min-height: 30px;
  padding: 7px 12px;
}

.controls-panel__chip--active {
  background: #1f6fbf;
  border-color: #1f6fbf;
  color: #ffffff;
}

.controls-panel__chip--disabled {
  background: #f3f4f6;
  border-color: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

.controls-panel__loading {
  color: #7b5b00;
  font-size: 12px;
}

.controls-panel__pose-group {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
}

.controls-panel__checkbox-row {
  align-items: center;
  display: flex;
  gap: 8px;
}

.controls-panel__legend {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  border-radius: 6px;
  padding: 8px;
}

.controls-panel__error {
  color: #b91c1c;
  font-size: 12px;
  margin: 4px 0 0;
}

.controls-panel__code-block {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  max-width: 100%;
  overflow-x: auto;
  padding: 8px;
}

.controls-panel__code-block pre {
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  margin: 0;
  overflow-x: auto;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
