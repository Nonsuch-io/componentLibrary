<template>
  <q-tab-panel v-bind="$attrs" :name="name" class="ns-tab-panel">
    <slot />
  </q-tab-panel>
</template>

<script setup lang="ts">
/**
 * NsTabPanel — A styled wrapper around Quasar's QTabPanel.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTabPanel props and events are forwarded via $attrs.
 */
export interface NsTabPanelProps {
  /** Unique panel name (must match the tab's name) */
  name: string | number
}

defineProps<NsTabPanelProps>()
</script>

<style lang="sass" scoped>
.ns-tab-panel
  font-family: var(--ns-font-family-text)
</style>
