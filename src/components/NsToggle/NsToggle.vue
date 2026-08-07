<template>
  <q-toggle
    v-bind="$attrs"
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
const resolvedDisable = useNsDisabled('NsToggle', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-toggle
  font-family: var(--ns-font-family-text)
</style>
