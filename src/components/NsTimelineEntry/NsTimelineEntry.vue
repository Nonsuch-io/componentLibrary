<template>
  <q-timeline-entry v-bind="$attrs" class="ns-timeline-entry">
    <slot />
  </q-timeline-entry>
</template>

<script setup lang="ts">
/**
 * NsTimelineEntry — A styled wrapper around Quasar's QTimelineEntry.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTimelineEntry props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsTimelineEntryProps {}

defineProps<NsTimelineEntryProps>()
</script>

<style lang="sass" scoped>
.ns-timeline-entry
  font-family: var(--ns-font-family-text)
</style>
