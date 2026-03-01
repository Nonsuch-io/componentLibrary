<template>
  <q-item-section v-bind="$attrs" class="ns-item-section">
    <slot />
  </q-item-section>
</template>

<script setup lang="ts">
/**
 * NsItemSection — A styled wrapper around Quasar's QItemSection.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QItemSection props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsItemSectionProps {}

defineProps<NsItemSectionProps>()
</script>

<style lang="sass" scoped>
.ns-item-section
  font-family: var(--ns-font-family-text)
</style>
