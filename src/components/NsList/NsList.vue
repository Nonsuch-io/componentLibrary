<template>
  <q-list
    v-bind="$attrs"
    :bordered="bordered"
    :separator="separator"
    :dense="dense"
    class="ns-list"
  >
    <slot />
  </q-list>
</template>

<script setup lang="ts">
/**
 * NsList — A styled list wrapping Quasar's QList.
 *
 * Provides opinionated defaults: separator enabled for visual clarity,
 * token-based font styling. Use with QItem/QItemSection from Quasar directly.
 */

export interface NsListProps {
  /** Show a border around the list */
  bordered?: boolean
  /** Show separators between items */
  separator?: boolean
  /** Use dense (compact) spacing */
  dense?: boolean
}

withDefaults(defineProps<NsListProps>(), {
  bordered: false,
  separator: true,
  dense: false,
})
</script>

<style lang="sass" scoped>
.ns-list
  font-family: var(--ns-font-family-text)
  border-radius: var(--ns-radius-md)
</style>
