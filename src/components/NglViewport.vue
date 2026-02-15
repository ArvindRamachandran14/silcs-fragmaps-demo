<template>
  <section class="ngl-viewport" data-test-id="viewer-viewport">
    <div ref="host" class="ngl-stage-host" data-test-id="ngl-stage-host" />

    <div v-if="isLoading" class="ngl-viewport__overlay" data-test-id="viewer-loading-state">
      <div class="ngl-viewport__status-card">
        <strong>Loading viewer...</strong>
        <p class="mb-0">Preparing 3FLY protein and crystal ligand.</p>
      </div>
    </div>

    <div v-else-if="isReady" class="ngl-viewport__ready" data-test-id="viewer-ready-state">
      Ready
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";
import { ViewerStatus } from "@/store/modules/viewer";

export default Vue.extend({
  name: "NglViewport",
  props: {
    status: {
      type: String,
      required: true,
    },
  },
  computed: {
    isLoading(): boolean {
      return (this.status as ViewerStatus) === "loading";
    },
    isReady(): boolean {
      return (this.status as ViewerStatus) === "ready";
    },
  },
  methods: {
    getHostElement(): HTMLElement | null {
      return this.$refs.host as HTMLElement | null;
    },
  },
});
</script>

<style scoped>
.ngl-viewport {
  background: radial-gradient(circle at top left, #edf4ff 0%, #d6e6ff 40%, #c7d7ee 100%);
  border: 1px solid #b7c7de;
  border-radius: 10px;
  min-height: 460px;
  overflow: hidden;
  position: relative;
}

.ngl-stage-host {
  height: 100%;
  min-height: 460px;
  width: 100%;
}

.ngl-viewport__overlay {
  align-items: center;
  background: rgba(10, 30, 60, 0.45);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: absolute;
}

.ngl-viewport__status-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  color: #17355a;
  max-width: 320px;
  padding: 14px 16px;
}

.ngl-viewport__ready {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 999px;
  color: #1e4b85;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  position: absolute;
  right: 10px;
  top: 10px;
}

.ngl-stage-host ::v-deep canvas {
  display: block;
  height: 100% !important;
  width: 100% !important;
}
</style>
