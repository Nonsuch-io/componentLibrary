<template>
  <q-tabs v-bind="$attrs" class="ns-tabs">
    <slot />
  </q-tabs>
</template>

<script setup lang="ts">
/**
 * NsTabs — A styled wrapper around Quasar's QTabs.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTabs props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsTabsProps {}

defineProps<NsTabsProps>()
</script>

<style lang="sass" scoped>
.ns-tabs
  font-family: var(--ns-font-family-text)
</style>
