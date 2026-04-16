<template>
  <q-table v-bind="props" class="ns-table">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
/**
 * NsTable — A styled wrapper around Quasar's QTable.
 *
 * Drop-in compatible with the full QTable API: columns, pagination, rowKey,
 * loading, flat, bordered, hide-pagination, selection, and every scoped slot
 * (body-cell-<name>, header-cell, top, no-data, …) pass through unchanged.
 *
 * Consumers should import `NsTableColumn`, `NsTableProps`,
 * `NsTableBodyCellSlotProps`, and `NsTableCellProps` from this library rather
 * than reaching into the `quasar` package for type definitions.
 */
import type { NsTableProps } from './types'

const props = withDefaults(defineProps<NsTableProps>(), {
  rows: () => [],
})
</script>

<style lang="sass" scoped>
.ns-table
  font-family: var(--ns-font-family-text)
</style>
