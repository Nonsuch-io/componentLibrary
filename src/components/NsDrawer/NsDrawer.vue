<template>
  <q-drawer v-bind="$attrs" class="ns-drawer">
    <slot />
  </q-drawer>
</template>

<script setup lang="ts">
/**
 * NsDrawer — A styled wrapper around Quasar's QDrawer.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QDrawer props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsDrawerProps {}

defineProps<NsDrawerProps>()
</script>

<style lang="sass" scoped>
.ns-drawer
  font-family: var(--ns-font-family-text)
</style>
