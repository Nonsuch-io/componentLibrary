<template>
  <q-header v-bind="$attrs" class="ns-header">
    <slot />
  </q-header>
</template>

<script setup lang="ts">
/**
 * NsHeader — A styled wrapper around Quasar's QHeader.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QHeader props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsHeaderProps {}

defineProps<NsHeaderProps>()
</script>

<style lang="sass" scoped>
.ns-header
  font-family: var(--ns-font-family-text)
</style>
