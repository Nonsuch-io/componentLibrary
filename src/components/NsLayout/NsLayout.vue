<template>
  <q-layout v-bind="$attrs" class="ns-layout">
    <slot />
  </q-layout>
</template>

<script setup lang="ts">
/**
 * NsLayout — A styled wrapper around Quasar's QLayout.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QLayout props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsLayoutProps {}

defineProps<NsLayoutProps>()
</script>

<style lang="sass" scoped>
.ns-layout
  font-family: var(--ns-font-family-text)
</style>
