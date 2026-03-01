<template>
  <q-separator v-bind="$attrs" class="ns-separator">
    <slot />
  </q-separator>
</template>

<script setup lang="ts">
/**
 * NsSeparator — A styled wrapper around Quasar's QSeparator.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QSeparator props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsSeparatorProps {}

defineProps<NsSeparatorProps>()
</script>

<style lang="sass" scoped>
.ns-separator
  font-family: var(--ns-font-family-text)
</style>
