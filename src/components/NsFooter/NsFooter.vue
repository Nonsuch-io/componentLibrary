<template>
  <q-footer v-bind="$attrs" class="ns-footer">
    <slot />
  </q-footer>
</template>

<script setup lang="ts">
/**
 * NsFooter — A styled wrapper around Quasar's QFooter.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QFooter props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsFooterProps {}

defineProps<NsFooterProps>()
</script>

<style lang="sass" scoped>
.ns-footer
  font-family: var(--ns-font-family-text)
</style>
