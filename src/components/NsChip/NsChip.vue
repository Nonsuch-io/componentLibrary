<template>
  <q-chip
    v-bind="attrsWithoutDisabled"
    :color="color"
    :text-color="textColor"
    :outline="outline"
    :dense="dense"
    :removable="removable"
    :clickable="clickable"
    :disable="resolvedDisable"
    class="ns-chip"
    @remove="$emit('remove')"
  >
    <slot />
  </q-chip>
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsChip — A styled chip wrapping Quasar's QChip.
 *
 * Useful for tags, filters, and selections with
 * token-based styling.
 */

export interface NsChipProps {
  /** Background colour */
  color?: string
  /** Text colour */
  textColor?: string
  /** Use outline style */
  outline?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Show a remove button */
  removable?: boolean
  /** Make the chip clickable */
  clickable?: boolean
  /** Disable the chip */
  disable?: boolean
}

const props = withDefaults(defineProps<NsChipProps>(), {
  color: 'primary',
  textColor: 'white',
  outline: false,
  dense: false,
  removable: false,
  clickable: false,
  disable: false,
})

defineEmits<{
  remove: []
}>()

// Accepts the `disabled` spelling too — see useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsChip', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-chip
  font-family: var(--ns-font-family-text)
  border-radius: var(--ns-radius-full, 9999px)
</style>
