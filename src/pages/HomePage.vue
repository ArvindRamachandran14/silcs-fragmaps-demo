<template>
  <section data-test-id="home-page">
    <h1 class="text-h4 mb-3">Overview</h1>
    <p class="mb-6">
      This is the M1 scaffold route for the SILCS FragMaps demo.
    </p>
    <v-btn color="primary" data-test-id="home-go-viewer" to="/viewer">
      Go to Viewer
    </v-btn>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "HomePage",
});
</script>
