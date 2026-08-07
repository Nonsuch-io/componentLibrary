<template>
  <q-checkbox
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :label="label"
    :color="color"
    :dense="dense"
    :disable="resolvedDisable"
    class="ns-checkbox"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsCheckbox — A styled checkbox wrapping Quasar's QCheckbox.
 *
 * Provides opinionated defaults: token-based colours and font styling.
 */

export interface NsCheckboxProps {
  /** Checkbox label text */
  label?: string
  /** v-model value */
  modelValue?: boolean
  /** Quasar colour name */
  color?: string
  /** Use dense (compact) size */
  dense?: boolean
  /** Disable the checkbox */
  disable?: boolean
}

const props = withDefaults(defineProps<NsCheckboxProps>(), {
  label: undefined,
  modelValue: false,
  color: 'primary',
  dense: false,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Accepts the `disabled` spelling too — on a QCheckbox it would otherwise
// land on the wrapper div and leave the control fully live. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsCheckbox', () => props.disable)
</script>

<style lang="sass" scoped>
.ns-checkbox
  font-family: var(--ns-font-family-text)
</style>
