<template>
  <q-table v-bind="props" class="ns-table">
    <!-- `loading` is excluded here and handled explicitly below; forwarding it
         twice would render the consumer's slot AND our default. -->
    <template v-for="(_, name) in forwardedSlotNames" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>

    <!--
      A NAMED LOADING INDICATOR. QTable renders its own only when no `loading`
      slot exists (QTable.js:704), and that one is a role="progressbar" with no
      accessible name inside an empty <th> — axe reports aria-progressbar-name and
      empty-table-header. Providing the slot replaces it (QTable.js:1190).
      Accessibility is never inherited (ADR 0002 rule 1); componentLibrary-057.
    -->
    <template #loading>
      <slot name="loading">
        <div class="ns-table__loading" role="progressbar" :aria-label="loadingLabel">
          <q-linear-progress indeterminate aria-hidden="true" />
        </div>
      </slot>
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
import { computed, useSlots } from 'vue'
import { QLinearProgress } from 'quasar'
import type { NsTableProps } from './types'

const props = withDefaults(defineProps<NsTableProps>(), {
  rows: () => [],
})

const slots = useSlots()

// `loading` is rendered explicitly in the template, so it must not also come
// through the generic forwarder.
const forwardedSlotNames = computed(() =>
  Object.fromEntries(Object.entries(slots).filter(([name]) => name !== 'loading')),
)

// Quasar's own default is `$q.lang.table.loading`; ours is a literal until
// componentLibrary-1ps sorts out hardcoded strings across the library.
const loadingLabel = computed(() => props.loadingLabel ?? 'Loading')
</script>

<style lang="sass" scoped>
.ns-table
  font-family: var(--ns-font-family-text)
</style>
