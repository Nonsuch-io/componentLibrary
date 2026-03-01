<template>
  <q-breadcrumbs v-bind="$attrs" class="ns-breadcrumbs">
    <slot />
  </q-breadcrumbs>
</template>

<script setup lang="ts">
/**
 * NsBreadcrumbs — A styled wrapper around Quasar's QBreadcrumbs.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QBreadcrumbs props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsBreadcrumbsProps {}

defineProps<NsBreadcrumbsProps>()
</script>

<style lang="sass" scoped>
.ns-breadcrumbs
  font-family: var(--ns-font-family-text)
</style>
