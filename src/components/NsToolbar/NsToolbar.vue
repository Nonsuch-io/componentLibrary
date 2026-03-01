<template>
  <q-toolbar v-bind="$attrs" class="ns-toolbar">
    <slot />
  </q-toolbar>
</template>

<script setup lang="ts">
/**
 * NsToolbar — A styled wrapper around Quasar's QToolbar.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QToolbar props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsToolbarProps {}

defineProps<NsToolbarProps>()
</script>

<style lang="sass" scoped>
.ns-toolbar
  font-family: var(--ns-font-family-text)
</style>
