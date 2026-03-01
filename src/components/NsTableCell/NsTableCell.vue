<template>
  <q-td v-bind="$attrs" class="ns-table-cell">
    <slot />
  </q-td>
</template>

<script setup lang="ts">
/**
 * NsTableCell — A styled wrapper around Quasar's QTd.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTd props and events are forwarded via $attrs.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NsTableCellProps {}

defineProps<NsTableCellProps>()
</script>

<style lang="sass" scoped>
.ns-table-cell
  font-family: var(--ns-font-family-text)
</style>
