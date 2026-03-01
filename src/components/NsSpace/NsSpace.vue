<template>
  <q-space v-bind="$attrs" class="ns-space">
    <slot />
  </q-space>
</template>

<script setup lang="ts">
/**
 * NsSpace — A styled wrapper around Quasar's QSpace.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QSpace props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsSpaceProps {}

defineProps<NsSpaceProps>()
</script>

<style lang="sass" scoped>
.ns-space
  font-family: var(--ns-font-family-text)
</style>
