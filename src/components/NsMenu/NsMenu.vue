<template>
  <q-menu v-bind="$attrs" class="ns-menu">
    <slot />
  </q-menu>
</template>

<script setup lang="ts">
/**
 * NsMenu — A styled wrapper around Quasar's QMenu.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QMenu props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsMenuProps {}

defineProps<NsMenuProps>()
</script>

<style lang="sass" scoped>
.ns-menu
  font-family: var(--ns-font-family-text)
</style>
