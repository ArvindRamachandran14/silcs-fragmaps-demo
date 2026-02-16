<template>
  <aside class="controls-panel" data-test-id="controls-panel">
    <div class="controls-panel__tabs-row">
      <div class="controls-panel__tabs" role="tablist" aria-label="Right controls tabs">
        <button
          type="button"
          role="tab"
          class="controls-panel__tab"
          :class="{ 'controls-panel__tab--active': activeTab === 'fragmap' }"
          :aria-selected="activeTab === 'fragmap' ? 'true' : 'false'"
          aria-controls="controls-tab-panel-fragmap"
          data-test-id="controls-tab-fragmap"
          @click="activeTab = 'fragmap'"
        >
          FragMap
        </button>
        <button
          type="button"
          role="tab"
          class="controls-panel__tab"
          :class="{ 'controls-panel__tab--active': activeTab === 'ligand' }"
          :aria-selected="activeTab === 'ligand' ? 'true' : 'false'"
          aria-controls="controls-tab-panel-ligand"
          data-test-id="controls-tab-ligand"
          @click="activeTab = 'ligand'"
        >
          Ligand
        </button>
      </div>
      <label class="controls-panel__protein-toggle" data-test-id="fragmap-show-protein-control">
        <span class="controls-panel__tab-label">Show Protein</span>
        <input
          data-test-id="fragmap-protein-toggle"
          type="checkbox"
          :checked="proteinVisible"
          :disabled="proteinToggleDisabled"
          @change="onProteinToggle"
        >
      </label>
    </div>

    <section
      v-show="activeTab === 'fragmap'"
      id="controls-tab-panel-fragmap"
      role="tabpanel"
      aria-labelledby="controls-tab-fragmap"
      data-test-id="controls-tab-panel-fragmap"
    >
      <h2 class="text-subtitle-1 mb-3">FragMap Controls</h2>

      <div class="controls-panel__fragmap-actions mb-3" data-test-id="fragmap-action-row">
        <button type="button" class="controls-panel__action" data-test-id="fragmap-hide-all" disabled>
          Hide all
        </button>
        <button type="button" class="controls-panel__action" data-test-id="fragmap-reset-defaults" disabled>
          Reset defaults
        </button>
        <button type="button" class="controls-panel__action" data-test-id="fragmap-reset-view" disabled>
          Reset view
        </button>
      </div>

      <div class="controls-panel__fragmap-section mb-3" data-test-id="fragmap-primary-section">
        <h3 class="text-subtitle-2 mb-2">Primary</h3>
        <p class="controls-panel__muted mb-2" data-test-id="fragmap-default-hidden-note">
          All maps are hidden by default.
        </p>
        <div class="controls-panel__column-header-row">
          <span class="controls-panel__column-header" data-test-id="fragmap-column-header-primary">FragMap</span>
          <span class="controls-panel__iso-column-header" data-test-id="fragmap-gfe-header-primary">GFE (kcal/mol)</span>
        </div>
        <div
          v-for="row in primaryFragMapRows"
          :key="row.id"
          class="controls-panel__map-row-group"
          :data-test-id="`fragmap-row-${row.id}`"
        >
          <div class="controls-panel__map-row">
            <label class="controls-panel__map-toggle">
              <input
                :data-test-id="`fragmap-toggle-${row.id}`"
                type="checkbox"
                :checked="isFragMapRowChecked(row.id)"
                :disabled="isFragMapRowDisabled(row)"
                @change="onFragMapToggle(row.id, $event)"
              >
              <span class="controls-panel__map-swatch" :style="{ backgroundColor: row.color }" aria-hidden="true" />
              <span class="controls-panel__map-label">{{ row.label }}</span>
            </label>
            <div class="controls-panel__iso-row" :data-test-id="`fragmap-iso-row-${row.id}`">
              <button
                type="button"
                class="controls-panel__iso-action"
                :data-test-id="`fragmap-iso-decrement-${row.id}`"
                :disabled="isFragMapIsoControlDisabled(row)"
                @click="onFragMapIsoStep(row.id, -1)"
              >
                -
              </button>
              <input
                :data-test-id="`fragmap-iso-input-${row.id}`"
                class="controls-panel__iso-input"
                type="text"
                inputmode="decimal"
                :value="isIsoAdjustableRow(row) ? fragMapIsoValueText(row.id) : 'fixed'"
                :disabled="isFragMapIsoControlDisabled(row)"
                @change="onFragMapIsoInput(row.id, $event)"
              >
              <button
                type="button"
                class="controls-panel__iso-action"
                :data-test-id="`fragmap-iso-increment-${row.id}`"
                :disabled="isFragMapIsoControlDisabled(row)"
                @click="onFragMapIsoStep(row.id, 1)"
              >
                +
              </button>
            </div>
          </div>
          <p
            v-if="!isIsoAdjustableRow(row)"
            class="controls-panel__map-meta controls-panel__iso-note"
            :data-test-id="`fragmap-row-iso-note-${row.id}`"
          >
            Iso is fixed; editable controls are disabled.
          </p>
          <p
            v-if="fragMapStatusText(row.id)"
            class="controls-panel__map-status"
            :data-test-id="`fragmap-row-status-${row.id}`"
          >
            {{ fragMapStatusText(row.id) }}
          </p>
          <p
            v-if="fragMapErrorText(row.id)"
            class="controls-panel__error"
            :data-test-id="`fragmap-row-error-${row.id}`"
          >
            {{ fragMapErrorText(row.id) }}
          </p>
        </div>
      </div>

      <div class="controls-panel__fragmap-section mb-3" data-test-id="fragmap-advanced-section">
        <div class="controls-panel__section-header mb-2">
          <h3 class="text-subtitle-2 mb-0">Advanced</h3>
          <button
            type="button"
            class="controls-panel__section-toggle"
            :aria-expanded="advancedExpanded ? 'true' : 'false'"
            data-test-id="fragmap-advanced-toggle"
            @click="advancedExpanded = !advancedExpanded"
          >
            {{ advancedExpanded ? "Collapse" : "Expand" }}
          </button>
        </div>
        <div
          v-show="advancedExpanded"
          data-test-id="fragmap-advanced-content"
        >
          <div class="controls-panel__column-header-row">
            <span class="controls-panel__column-header" data-test-id="fragmap-column-header-advanced">FragMap</span>
            <span class="controls-panel__iso-column-header" data-test-id="fragmap-gfe-header-advanced">GFE (kcal/mol)</span>
          </div>
          <div
            v-for="row in advancedFragMapRows"
            :key="row.id"
            class="controls-panel__map-row-group"
            :data-test-id="`fragmap-row-${row.id}`"
          >
            <div class="controls-panel__map-row">
              <label class="controls-panel__map-toggle">
                <input
                  :data-test-id="`fragmap-toggle-${row.id}`"
                  type="checkbox"
                  :checked="isFragMapRowChecked(row.id)"
                  :disabled="isFragMapRowDisabled(row)"
                  @change="onFragMapToggle(row.id, $event)"
                >
                <span class="controls-panel__map-swatch" :style="{ backgroundColor: row.color }" aria-hidden="true" />
                <span class="controls-panel__map-label">{{ row.label }}</span>
              </label>
              <div class="controls-panel__iso-row" :data-test-id="`fragmap-iso-row-${row.id}`">
                <button
                  type="button"
                  class="controls-panel__iso-action"
                  :data-test-id="`fragmap-iso-decrement-${row.id}`"
                  :disabled="isFragMapIsoControlDisabled(row)"
                  @click="onFragMapIsoStep(row.id, -1)"
                >
                  -
                </button>
                <input
                  :data-test-id="`fragmap-iso-input-${row.id}`"
                  class="controls-panel__iso-input"
                  type="text"
                  inputmode="decimal"
                  :value="isIsoAdjustableRow(row) ? fragMapIsoValueText(row.id) : 'fixed'"
                  :disabled="isFragMapIsoControlDisabled(row)"
                  @change="onFragMapIsoInput(row.id, $event)"
                >
                <button
                  type="button"
                  class="controls-panel__iso-action"
                  :data-test-id="`fragmap-iso-increment-${row.id}`"
                  :disabled="isFragMapIsoControlDisabled(row)"
                  @click="onFragMapIsoStep(row.id, 1)"
                >
                  +
                </button>
              </div>
            </div>
            <p
              v-if="!isIsoAdjustableRow(row)"
              class="controls-panel__map-meta controls-panel__iso-note"
              :data-test-id="`fragmap-row-iso-note-${row.id}`"
            >
              Iso is fixed; editable controls are disabled.
            </p>
            <p
              v-if="fragMapStatusText(row.id)"
              class="controls-panel__map-status"
              :data-test-id="`fragmap-row-status-${row.id}`"
            >
              {{ fragMapStatusText(row.id) }}
            </p>
            <p
              v-if="fragMapErrorText(row.id)"
              class="controls-panel__error"
              :data-test-id="`fragmap-row-error-${row.id}`"
            >
              {{ fragMapErrorText(row.id) }}
            </p>
          </div>
        </div>
        <p
          v-show="!advancedExpanded"
          class="controls-panel__muted mb-0"
          data-test-id="fragmap-advanced-collapsed-note"
        >
          Expand to view Advanced FragMap rows.
        </p>
      </div>

      <p class="controls-panel__muted mb-4" data-test-id="fragmap-shell-scope-note">
        M5.4 scope: per-map iso controls are active for adjustable rows. Bulk actions and reliability handling remain deferred.
      </p>
    </section>

    <section
      v-show="activeTab === 'ligand'"
      id="controls-tab-panel-ligand"
      role="tabpanel"
      aria-labelledby="controls-tab-ligand"
      data-test-id="controls-tab-panel-ligand"
    >
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
    </section>

    <div class="controls-panel__diagnostics" aria-hidden="true">
      <p data-test-id="viewer-context-caption">
        Showing 3FLY protein with <strong>{{ selectedLigandLabel }}</strong>, baseline pose
        {{ baselinePoseVisible ? "visible" : "hidden" }}, refined pose
        {{ refinedPoseVisible ? "visible" : "hidden" }}, and {{ visibleFragMapIds.length }} visible FragMaps.
      </p>
      <span data-test-id="default-ligand-id">{{ selectedLigandId }}</span>
      <span data-test-id="baseline-pose-state">{{ baselinePoseVisible ? "ON" : "OFF" }}</span>
      <span data-test-id="refined-pose-state">{{ refinedPoseVisible ? "ON" : "OFF" }}</span>
      <span data-test-id="visible-fragmaps-state">{{ visibleFragMapIds.length }}</span>
      <span data-test-id="protein-visibility-state">{{ proteinVisible ? "ON" : "OFF" }}</span>
      <pre data-test-id="camera-baseline-contract">{{ baselineText }}</pre>
      <pre data-test-id="camera-snapshot">{{ currentCameraText }}</pre>
    </div>
  </aside>
</template>

<script lang="ts">
import Vue from "vue";
import { CameraSnapshot } from "@/viewer/nglStage";
import type { PoseKind } from "@/store/modules/viewer";
import { FragMapSection } from "@/data/manifest";

interface FragMapShellRow {
  id: string;
  label: string;
  color: string;
  section: FragMapSection;
  defaultIso?: number;
}

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
    fragMapShellRows: {
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
    proteinVisible: {
      type: Boolean,
      required: true,
    },
    proteinToggleDisabled: {
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
    fragMapLoadingRowId: {
      type: String,
      required: false,
      default: null,
    },
    fragMapDisabledRowIds: {
      type: Array,
      required: false,
      default: () => [],
    },
    fragMapStatusById: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    fragMapIsoById: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    fragMapErrorById: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    cameraBaseline: {
      type: Object,
      required: true,
    },
    cameraSnapshot: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      activeTab: "fragmap" as "fragmap" | "ligand",
      advancedExpanded: false,
    };
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
    primaryFragMapRows(): FragMapShellRow[] {
      return (this.fragMapShellRows as FragMapShellRow[]).filter((entry) => entry.section === "primary");
    },
    advancedFragMapRows(): FragMapShellRow[] {
      return (this.fragMapShellRows as FragMapShellRow[]).filter((entry) => entry.section === "advanced");
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
    onProteinToggle(event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("toggle-protein", { visible: target.checked });
    },
    onFragMapToggle(rowId: string, event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("toggle-fragmap", { id: rowId, visible: target.checked });
    },
    onFragMapIsoStep(rowId: string, direction: -1 | 1) {
      this.$emit("adjust-fragmap-iso", { id: rowId, direction });
    },
    onFragMapIsoInput(rowId: string, event: Event) {
      const target = event.target as HTMLInputElement;
      this.$emit("set-fragmap-iso", { id: rowId, value: target.value });
    },
    isFragMapRowChecked(rowId: string): boolean {
      return (this.visibleFragMapIds as string[]).includes(rowId);
    },
    isFragMapRowDisabled(row: FragMapShellRow): boolean {
      if (this.fragMapLoadingRowId) {
        return true;
      }

      return (this.fragMapDisabledRowIds as string[]).includes(row.id);
    },
    fragMapStatusText(rowId: string): string | null {
      const statusById = this.fragMapStatusById as Record<string, string>;
      return statusById[rowId] || null;
    },
    fragMapErrorText(rowId: string): string | null {
      const errorById = this.fragMapErrorById as Record<string, string>;
      return errorById[rowId] || null;
    },
    isExclusionRow(rowId: string): boolean {
      return rowId === "3fly.excl.dx";
    },
    isIsoAdjustableRow(row: FragMapShellRow): boolean {
      return !this.isExclusionRow(row.id) && typeof row.defaultIso === "number";
    },
    isFragMapIsoControlDisabled(row: FragMapShellRow): boolean {
      return !this.isIsoAdjustableRow(row) || this.isFragMapRowDisabled(row);
    },
    fragMapIsoValueText(rowId: string): string {
      const isoById = this.fragMapIsoById as Record<string, number>;
      const value = isoById[rowId];
      if (typeof value !== "number" || Number.isNaN(value)) {
        return "";
      }
      return value.toFixed(1);
    },
  },
});
</script>

<style scoped>
.controls-panel {
  --fragmap-iso-column-width: 122px;
  border: 1px solid #d9dee7;
  border-radius: 10px;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 16px;
}

.controls-panel__tabs-row {
  align-items: center;
  border-bottom: 1px solid #d8dfeb;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.controls-panel__tabs {
  display: flex;
  gap: 6px;
}

.controls-panel__tab {
  background: #f5f7fb;
  border: 1px solid #ccd6e6;
  border-radius: 6px;
  color: #2a3d57;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
}

.controls-panel__tab--active {
  background: #1f6fbf;
  border-color: #1f6fbf;
  color: #ffffff;
}

.controls-panel__tab-label {
  color: #5f6b73;
  font-size: 12px;
  font-weight: 700;
}

.controls-panel__protein-toggle {
  align-items: center;
  background: #eceff1;
  border: 1px solid #c7d0d6;
  border-radius: 999px;
  display: inline-flex;
  gap: 8px;
  margin-left: auto;
  min-height: 30px;
  padding: 4px 10px;
}

.controls-panel__fragmap-actions {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.controls-panel__action {
  background: #eef2f9;
  border: 1px solid #ccd6e6;
  border-radius: 6px;
  color: #59708f;
  font-size: 12px;
  font-weight: 600;
  min-height: 30px;
  padding: 4px 6px;
}

.controls-panel__action:disabled {
  cursor: not-allowed;
  opacity: 1;
}

.controls-panel__fragmap-section {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
}

.controls-panel__section-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.controls-panel__section-toggle {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  min-height: 26px;
  padding: 4px 8px;
}

.controls-panel__map-row {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  line-height: 1.2;
}

.controls-panel__map-row-group + .controls-panel__map-row-group {
  margin-top: 8px;
}

.controls-panel__map-toggle {
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: 8px;
  min-width: 0;
}

.controls-panel__map-label {
  min-width: 0;
}

.controls-panel__iso-row {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  justify-content: space-between;
  margin: 0;
  width: var(--fragmap-iso-column-width);
}

.controls-panel__iso-action {
  background: #eef2f9;
  border: 1px solid #ccd6e6;
  border-radius: 4px;
  color: #2a3d57;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  height: 22px;
  line-height: 1;
  padding: 0;
  width: 22px;
}

.controls-panel__iso-action:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.controls-panel__iso-input {
  border: 1px solid #ccd6e6;
  border-radius: 4px;
  color: #2a3d57;
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  height: 22px;
  padding: 2px 6px;
  width: 64px;
}

.controls-panel__iso-input:disabled {
  background: #f3f4f6;
  color: #94a3b8;
}

.controls-panel__map-swatch {
  border-radius: 999px;
  display: inline-block;
  height: 10px;
  width: 10px;
}

.controls-panel__map-status {
  color: #64748b;
  font-size: 11px;
  margin: 4px 0 0 24px;
}

.controls-panel__map-meta {
  color: #6b7280;
  font-size: 11px;
  margin: 4px 0 0 24px;
}

.controls-panel__column-header-row {
  align-items: flex-end;
  display: flex;
  justify-content: space-between;
  margin: -2px 0 6px;
}

.controls-panel__column-header {
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.controls-panel__iso-column-header {
  color: #64748b;
  flex: 0 0 var(--fragmap-iso-column-width);
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.controls-panel__iso-note {
  margin-top: 4px;
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

.controls-panel__diagnostics {
  display: none;
}
</style>
