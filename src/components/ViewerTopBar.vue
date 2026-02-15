<template>
  <header class="viewer-top-bar" data-test-id="viewer-top-bar">
    <div>
      <h1 class="text-h5 mb-1">Interactive Viewer</h1>
      <p class="mb-0 caption" data-test-id="viewer-status-label">
        {{ statusLabel }}
      </p>
    </div>

    <div class="viewer-top-bar__actions">
      <v-btn
        class="d-md-none"
        text
        color="primary"
        data-test-id="viewer-open-controls"
        @click="$emit('toggle-controls')"
      >
        Controls
      </v-btn>
      <v-btn
        text
        color="primary"
        data-test-id="viewer-reset-view"
        :disabled="!canReset"
        @click="$emit('reset-view')"
      >
        Reset view
      </v-btn>
      <v-btn text color="primary" data-test-id="viewer-go-home" to="/">
        Home
      </v-btn>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from "vue";
import { ViewerStatus } from "@/store/modules/viewer";

export default Vue.extend({
  name: "ViewerTopBar",
  props: {
    status: {
      type: String,
      required: true,
    },
    canReset: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    statusLabel(): string {
      const status = this.status as ViewerStatus;
      if (status === "loading") {
        return "Loading startup scene (protein + crystal ligand)...";
      }
      if (status === "ready") {
        return "Viewer ready";
      }
      if (status === "error") {
        return "Viewer startup failed";
      }

      return "Viewer idle";
    },
  },
});
</script>

<style scoped>
.viewer-top-bar {
  align-items: flex-start;
  border-bottom: 1px solid #d9dee7;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.viewer-top-bar > div:first-child {
  min-width: 0;
}

.viewer-top-bar__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

[data-test-id="viewer-status-label"] {
  overflow-wrap: anywhere;
}
</style>
