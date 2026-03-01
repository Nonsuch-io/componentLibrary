<template>
  <q-inner-loading v-bind="$attrs" class="ns-inner-loading">
    <slot />
  </q-inner-loading>
</template>

<script setup lang="ts">
/**
 * NsInnerLoading — A styled wrapper around Quasar's QInnerLoading.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QInnerLoading props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsInnerLoadingProps {}

defineProps<NsInnerLoadingProps>()
</script>

<style lang="sass" scoped>
.ns-inner-loading
  font-family: var(--ns-font-family-text)
</style>
