<template>
  <q-breadcrumbs-el v-bind="$attrs" class="ns-breadcrumb-element">
    <slot />
  </q-breadcrumbs-el>
</template>

<script setup lang="ts">
/**
 * NsBreadcrumbElement — A styled wrapper around Quasar's QBreadcrumbsEl.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QBreadcrumbsEl props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsBreadcrumbElementProps {}

defineProps<NsBreadcrumbElementProps>()
</script>

<style lang="sass" scoped>
.ns-breadcrumb-element
  font-family: var(--ns-font-family-text)
</style>
