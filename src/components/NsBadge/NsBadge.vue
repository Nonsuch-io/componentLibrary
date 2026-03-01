<template>
  <q-badge v-bind="$attrs" class="ns-badge">
    <slot />
  </q-badge>
</template>

<script setup lang="ts">
/**
 * NsBadge — A styled wrapper around Quasar's QBadge.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QBadge props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsBadgeProps {}

defineProps<NsBadgeProps>()
</script>

<style lang="sass" scoped>
.ns-badge
  font-family: var(--ns-font-family-text)
</style>
