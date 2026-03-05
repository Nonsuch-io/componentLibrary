<template>
  <q-icon v-bind="$attrs" class="ns-icon">
    <slot />
  </q-icon>
</template>

<script setup lang="ts">
/**
 * NsIcon — A styled wrapper around Quasar's QIcon.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QIcon props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsIconProps {}

defineProps<NsIconProps>()
</script>

<style lang="sass" scoped>
// No font-family override — icons must use their icon font (e.g. Material Icons)
</style>
