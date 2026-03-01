<template>
  <q-card-actions v-bind="$attrs" class="ns-card-actions">
    <slot />
  </q-card-actions>
</template>

<script setup lang="ts">
/**
 * NsCardActions — A styled wrapper around Quasar's QCardActions.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QCardActions props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsCardActionsProps {}

defineProps<NsCardActionsProps>()
</script>

<style lang="sass" scoped>
.ns-card-actions
  font-family: var(--ns-font-family-text)
</style>
