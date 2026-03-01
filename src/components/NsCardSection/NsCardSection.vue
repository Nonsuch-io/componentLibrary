<template>
  <q-card-section v-bind="$attrs" class="ns-card-section">
    <slot />
  </q-card-section>
</template>

<script setup lang="ts">
/**
 * NsCardSection — A styled wrapper around Quasar's QCardSection.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QCardSection props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsCardSectionProps {}

defineProps<NsCardSectionProps>()
</script>

<style lang="sass" scoped>
.ns-card-section
  font-family: var(--ns-font-family-text)
</style>
