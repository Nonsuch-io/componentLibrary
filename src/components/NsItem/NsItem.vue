<template>
  <q-item v-bind="$attrs" :disable="disable" class="ns-item">
    <slot />
  </q-item>
</template>

<script setup lang="ts">
/**
 * NsItem — A styled wrapper around Quasar's QItem.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QItem props and events are forwarded via $attrs.
 */
export interface NsItemProps {
  /** Put the item in disabled mode (Quasar spells it `disable`, not `disabled`) */
  disable?: boolean
}

withDefaults(defineProps<NsItemProps>(), {
  disable: false,
})
</script>

<style lang="sass" scoped>
.ns-item
  font-family: var(--ns-font-family-text)
</style>
