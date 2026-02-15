<template>
  <aside class="controls-panel" data-test-id="controls-panel">
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

function formatCamera(snapshot: CameraSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}

export default Vue.extend({
  name: "ControlsPanel",
  props: {
    selectedLigandId: {
      type: String,
      required: true,
    },
    selectedLigandLabel: {
      type: String,
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
    baselineText(): string {
      return formatCamera(this.cameraBaseline as CameraSnapshot);
    },
    currentCameraText(): string {
      return formatCamera(this.cameraSnapshot as CameraSnapshot);
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
