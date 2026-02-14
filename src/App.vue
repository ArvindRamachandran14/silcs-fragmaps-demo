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
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",
});
</script>
