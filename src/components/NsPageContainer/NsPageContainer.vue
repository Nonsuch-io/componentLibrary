<template>
  <q-page-container v-bind="$attrs" class="ns-page-container">
    <slot />
  </q-page-container>
</template>

<script setup lang="ts">
/**
 * NsPageContainer — A styled wrapper around Quasar's QPageContainer.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QPageContainer props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsPageContainerProps {}

defineProps<NsPageContainerProps>()
</script>

<style lang="sass" scoped>
.ns-page-container
  font-family: var(--ns-font-family-text)
</style>
