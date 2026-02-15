<template>
  <v-app data-test-id="app-shell">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>SILCS FragMaps Demo</v-toolbar-title>
      <v-spacer />
      <v-btn data-test-id="nav-home" text to="/" exact>
        Home
      </v-btn>
      <v-btn data-test-id="nav-viewer" text to="/viewer">
        Viewer
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container
        fluid
        class="py-6 app-shell__container"
      >
        <v-alert
          v-if="startupError"
          data-test-id="startup-validation-warning"
          dense
          outlined
          type="warning"
          class="mb-4"
        >
          {{ startupError }}
        </v-alert>
        <v-alert
          v-else-if="startupHasIssues"
          data-test-id="startup-validation-warning"
          dense
          outlined
          type="warning"
          class="mb-4"
        >
          Startup asset validation found {{ startupIssueCount }} issue(s). The app remains usable, and affected
          controls are marked in disable-intent metadata.
        </v-alert>
        <pre
          v-if="startupHasIssues"
          data-test-id="startup-disable-intents"
          class="mb-4"
        >{{ startupDisableIntents }}</pre>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { RootState } from "@/store";
import { DisabledControlIntents, StartupValidationReport } from "@/startup/startupValidation";

export default Vue.extend({
  name: "App",
  computed: {
    startupState() {
      return (this.$store.state as RootState).startup;
    },
    startupError(): string | null {
      return this.startupState.error;
    },
    startupReport(): StartupValidationReport | null {
      return this.startupState.report;
    },
    startupHasIssues(): boolean {
      return Boolean(this.startupReport && this.startupReport.hasErrors);
    },
    startupIssueCount(): number {
      return this.startupReport ? this.startupReport.issues.length : 0;
    },
    startupDisableIntents(): string {
      const emptyIntents: DisabledControlIntents = {
        proteinControl: false,
        ligandPoseControls: {},
        fragMapControls: {},
      };
      return JSON.stringify(
        this.startupReport ? this.startupReport.disabledControlIntents : emptyIntents,
        null,
        2,
      );
    },
  },
});
</script>

<style scoped>
.app-shell__container {
  max-width: 100%;
}

pre {
  border: 1px solid #d7ccc8;
  border-radius: 4px;
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  overflow-x: auto;
  padding: 12px;
  white-space: pre-wrap;
}
</style>
