<template>
  <q-linear-progress v-bind="$attrs" class="ns-linear-progress">
    <slot />
  </q-linear-progress>
</template>

<script setup lang="ts">
/**
 * NsLinearProgress — A styled wrapper around Quasar's QLinearProgress.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QLinearProgress props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsLinearProgressProps {}

defineProps<NsLinearProgressProps>()
</script>

<style lang="sass" scoped>
.ns-linear-progress
  font-family: var(--ns-font-family-text)
</style>
