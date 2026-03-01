<template>
  <q-tab v-bind="$attrs" class="ns-tab">
    <slot />
  </q-tab>
</template>

<script setup lang="ts">
/**
 * NsTab — A styled wrapper around Quasar's QTab.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTab props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsTabProps {}

defineProps<NsTabProps>()
</script>

<style lang="sass" scoped>
.ns-tab
  font-family: var(--ns-font-family-text)
</style>
