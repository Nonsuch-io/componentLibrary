<template>
  <q-toggle
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :label="label"
    :color="color"
    :dense="dense"
    :disable="resolvedDisable"
    role="switch"
    :aria-checked="modelValue"
    class="ns-toggle"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsToggle — A styled toggle switch wrapping Quasar's QToggle.
 *
 * Provides opinionated defaults: token-based colours and font styling.
 */

export interface NsToggleProps {
  /** Toggle label text */
  label?: string
  /** v-model value */
  modelValue?: boolean
  /** Quasar colour name */
  color?: string
  /** Use dense (compact) size */
  dense?: boolean
  /** Disable the toggle */
  disable?: boolean
}

const props = withDefaults(defineProps<NsToggleProps>(), {
  label: undefined,
  modelValue: false,
  color: 'primary',
  dense: false,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Accepts the `disabled` spelling too — on a QToggle it would otherwise land
// on the wrapper and leave the control fully live. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsToggle', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-toggle
  font-family: var(--ns-font-family-text)
</style>
