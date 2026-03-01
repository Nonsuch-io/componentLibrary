<template>
  <q-item v-bind="$attrs" class="ns-item">
    <slot />
  </q-item>
</template>

<script setup lang="ts">
/**
 * NsItem — A styled wrapper around Quasar's QItem.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QItem props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsItemProps {}

defineProps<NsItemProps>()
</script>

<style lang="sass" scoped>
.ns-item
  font-family: var(--ns-font-family-text)
</style>
