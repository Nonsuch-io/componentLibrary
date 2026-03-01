<template>
  <q-spinner v-bind="$attrs" class="ns-spinner">
    <slot />
  </q-spinner>
</template>

<script setup lang="ts">
/**
 * NsSpinner — A styled wrapper around Quasar's QSpinner.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QSpinner props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsSpinnerProps {}

defineProps<NsSpinnerProps>()
</script>

<style lang="sass" scoped>
.ns-spinner
  font-family: var(--ns-font-family-text)
</style>
