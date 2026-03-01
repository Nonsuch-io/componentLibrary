<template>
  <q-spinner-dots v-bind="$attrs" class="ns-spinner-dots">
    <slot />
  </q-spinner-dots>
</template>

<script setup lang="ts">
/**
 * NsSpinnerDots — A styled wrapper around Quasar's QSpinnerDots.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QSpinnerDots props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsSpinnerDotsProps {}

defineProps<NsSpinnerDotsProps>()
</script>

<style lang="sass" scoped>
.ns-spinner-dots
  font-family: var(--ns-font-family-text)
</style>
