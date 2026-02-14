<template>
  <section data-test-id="viewer-page">
    <h1 class="text-h4 mb-3">Viewer</h1>
    <p class="mb-6">
      This is the M1 viewer placeholder route.
    </p>
    <v-btn text color="primary" data-test-id="viewer-go-home" to="/">
      Back to Home
    </v-btn>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ViewerPage",
});
</script>
