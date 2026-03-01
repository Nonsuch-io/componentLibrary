<template>
  <q-table v-bind="$attrs" :rows="rows" class="ns-table">
    <slot />
  </q-table>
</template>

<script setup lang="ts">
/**
 * NsTable — A styled wrapper around Quasar's QTable.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTable props and events are forwarded via $attrs.
 */
export interface NsTableProps {
  /** Row data for the table */
  rows?: Record<string, unknown>[]
}

withDefaults(defineProps<NsTableProps>(), {
  rows: () => [],
})
</script>

<style lang="sass" scoped>
.ns-table
  font-family: var(--ns-font-family-text)
</style>
