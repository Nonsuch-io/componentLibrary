<template>
  <q-page v-bind="$attrs" class="ns-page">
    <slot />
  </q-page>
</template>

<script setup lang="ts">
/**
 * NsPage — A styled wrapper around Quasar's QPage.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QPage props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsPageProps {}

defineProps<NsPageProps>()
</script>

<style lang="sass" scoped>
.ns-page
  font-family: var(--ns-font-family-text)
</style>
