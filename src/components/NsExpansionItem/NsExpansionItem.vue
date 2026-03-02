<template>
  <q-expansion-item v-bind="$attrs" class="ns-expansion-item">
    <slot />
  </q-expansion-item>
</template>

<script setup lang="ts">
/**
 * NsExpansionItem — A styled wrapper around Quasar's QExpansionItem.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QExpansionItem props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsExpansionItemProps {}

defineProps<NsExpansionItemProps>()
</script>

<style lang="sass" scoped>
.ns-expansion-item
  font-family: var(--ns-font-family-text)
</style>
