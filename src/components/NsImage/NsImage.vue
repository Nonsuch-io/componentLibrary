<template>
  <q-img v-bind="$attrs" class="ns-image">
    <slot />
  </q-img>
</template>

<script setup lang="ts">
/**
 * NsImage — A styled wrapper around Quasar's QImg.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QImg props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsImageProps {}

defineProps<NsImageProps>()
</script>

<style lang="sass" scoped>
.ns-image
  font-family: var(--ns-font-family-text)
</style>
