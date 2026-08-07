<template>
  <q-expansion-item v-bind="$attrs" :disable="resolvedDisable" class="ns-expansion-item">
    <slot />
  </q-expansion-item>
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsExpansionItem — A styled wrapper around Quasar's QExpansionItem.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QExpansionItem props and events are forwarded via $attrs.
 */
export interface NsExpansionItemProps {
  /** Disable the expansion item */
  disable?: boolean
}

const props = withDefaults(defineProps<NsExpansionItemProps>(), {
  disable: false,
})

// Accepts the `disabled` spelling too — see useNsDisabled.
const resolvedDisable = useNsDisabled('NsExpansionItem', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-expansion-item
  font-family: var(--ns-font-family-text)
</style>
