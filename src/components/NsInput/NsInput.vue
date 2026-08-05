<template>
  <q-input
    v-bind="$attrs"
    :model-value="modelValue"
    :label="label"
    :outlined="outlined"
    :dense="dense"
    :rules="rules"
    :disable="disable"
    class="ns-input"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
/**
 * NsInput — A styled text input wrapping Quasar's QInput.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { ValidationRule } from 'quasar'

export interface NsInputProps {
  /** Input label text */
  label?: string
  /** v-model value */
  modelValue?: string
  /** Use outlined style */
  outlined?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Validation rules — array of Quasar validation rules */
  rules?: ValidationRule[]
  /** Disable the input */
  disable?: boolean
}

withDefaults(defineProps<NsInputProps>(), {
  label: undefined,
  modelValue: undefined,
  outlined: true,
  dense: false,
  rules: undefined,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()
</script>

<style lang="sass" scoped>
.ns-input
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-md)
</style>
