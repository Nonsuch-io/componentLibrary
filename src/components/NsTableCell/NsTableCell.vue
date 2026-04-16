<template>
  <q-td v-bind="$attrs" class="ns-table-cell">
    <slot />
  </q-td>
</template>

<script setup lang="ts">
/**
 * NsTableCell — A styled wrapper around Quasar's QTd.
 *
 * Drop-in compatible with QTd's API — pass the body-cell slot scope via
 * `:props="cellProps"` the same way you would with `<q-td>`.
 */
import type { NsTableCellProps } from '../NsTable/types'

defineProps<NsTableCellProps>()
</script>

<style lang="sass" scoped>
.ns-table-cell
  font-family: var(--ns-font-family-text)
</style>
