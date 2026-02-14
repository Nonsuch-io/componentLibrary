<template>
  <q-checkbox
    v-bind="$attrs"
    :model-value="modelValue"
    :label="label"
    :color="color"
    :dense="dense"
    :disable="disable"
    class="ns-checkbox"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
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

withDefaults(defineProps<NsCheckboxProps>(), {
  label: undefined,
  modelValue: false,
  color: 'primary',
  dense: false,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style lang="sass" scoped>
.ns-checkbox
  font-family: var(--ns-font-family-text)
</style>
