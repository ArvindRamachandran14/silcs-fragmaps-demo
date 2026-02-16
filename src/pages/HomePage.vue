<template>
  <section
    class="home-overview"
    data-test-id="home-page"
  >
    <h1 class="text-h4 mb-4 home-overview__title">Overview</h1>

    <p
      class="mb-4 home-overview__paragraph"
      data-test-id="home-overview-paragraph"
    >
      p38 MAP kinase is a stress-activated serine/threonine kinase that plays a central role in inflammatory
      signaling and cellular stress responses. Because it regulates cytokine production and immune pathways, it has
      been widely studied as a therapeutic target. The demo starts from the baseline pose of the crystal ligand
      (3fly_cryst_lig), displayed as Crystal Ligand, but offers the option to view three additional featured
      ligands (p38_goldstein_05_2e, p38_goldstein_06_2f, and p38_goldstein_07_2g).
    </p>

    <p
      class="mb-6 home-overview__paragraph"
      data-test-id="home-overview-paragraph"
    >
      SILCS FragMaps are three-dimensional free-energy maps generated from simulations with small probe fragments.
      Each map highlights regions in the binding site that favor particular chemical features, such as hydrogen-bond
      donors, acceptors, hydrophobic groups, or charged functionalities. By comparing these maps with the ligand
      pose, users can assess how well specific parts of the molecule align with favorable interaction regions,
      helping interpret ligand binding and evaluate pose quality. In this demo, you can view the p38 MAP protein,
      toggle between its individual FragMaps, adjust their isosurface levels, and switch between original and refined
      ligand poses to explore how fragment-based energetics help guide pose refinement.
    </p>

    <div class="home-overview__actions mb-4">
      <v-btn
        color="primary"
        data-test-id="home-go-viewer"
        to="/viewer"
      >
        Go to Viewer
      </v-btn>
    </div>

    <div
      class="home-overview__links"
      data-test-id="home-external-links"
    >
      <a
        class="home-overview__link"
        data-test-id="home-link-3fly"
        href="https://www.rcsb.org/structure/3FLY"
        rel="noopener noreferrer"
        target="_blank"
      >
        PDB 3FLY entry (RCSB)
      </a>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "HomePage",
});
</script>

<style scoped>
.home-overview {
  margin: 0 auto;
  max-width: 960px;
}

.home-overview__title {
  color: #1f2e3c;
}

.home-overview__paragraph {
  color: #2f3f53;
  line-height: 1.7;
}

.home-overview__link {
  color: #2f6db0;
  font-weight: 600;
  text-decoration: none;
}

.home-overview__link:focus,
.home-overview__link:hover {
  text-decoration: underline;
}
</style>
