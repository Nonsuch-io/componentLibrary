<template>
  <q-item-label v-bind="$attrs" class="ns-item-label">
    <slot />
  </q-item-label>
</template>

<script setup lang="ts">
/**
 * NsItemLabel — A styled wrapper around Quasar's QItemLabel.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QItemLabel props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsItemLabelProps {}

defineProps<NsItemLabelProps>()
</script>

<style lang="sass" scoped>
.ns-item-label
  font-family: var(--ns-font-family-text)
</style>
