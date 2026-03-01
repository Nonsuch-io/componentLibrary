<template>
  <q-toolbar-title v-bind="$attrs" class="ns-toolbar-title">
    <slot />
  </q-toolbar-title>
</template>

<script setup lang="ts">
/**
 * NsToolbarTitle — A styled wrapper around Quasar's QToolbarTitle.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QToolbarTitle props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsToolbarTitleProps {}

defineProps<NsToolbarTitleProps>()
</script>

<style lang="sass" scoped>
.ns-toolbar-title
  font-family: var(--ns-font-family-text)
</style>
