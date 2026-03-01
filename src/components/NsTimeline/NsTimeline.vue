<template>
  <q-timeline v-bind="$attrs" class="ns-timeline">
    <slot />
  </q-timeline>
</template>

<script setup lang="ts">
/**
 * NsTimeline — A styled wrapper around Quasar's QTimeline.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTimeline props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsTimelineProps {}

defineProps<NsTimelineProps>()
</script>

<style lang="sass" scoped>
.ns-timeline
  font-family: var(--ns-font-family-text)
</style>
