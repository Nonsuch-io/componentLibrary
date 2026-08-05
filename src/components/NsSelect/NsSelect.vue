<template>
  <q-select
    v-bind="$attrs"
    :model-value="modelValue"
    :label="label"
    :options="options"
    :outlined="outlined"
    :dense="dense"
    :rules="rules"
    :multiple="multiple"
    :emit-value="emitValue"
    :map-options="mapOptions"
    :disable="disable"
    class="ns-select"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
/**
 * NsSelect — A styled select/dropdown wrapping Quasar's QSelect.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { ValidationRule } from 'quasar'

export type NsSelectOption = string | { label: string; value: unknown; [key: string]: unknown }

export interface NsSelectProps {
  /** Select label text */
  label?: string
  /** v-model value */
  modelValue?: unknown
  /** Dropdown options */
  options?: NsSelectOption[]
  /** Use outlined style */
  outlined?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Allow multiple selections */
  multiple?: boolean
  /** Emit only the value instead of the full option object */
  emitValue?: boolean
  /** Map values to labels when using emit-value */
  mapOptions?: boolean
  /** Validation rules — array of Quasar validation rules */
  rules?: ValidationRule[]
  /** Disable the select */
  disable?: boolean
}

withDefaults(defineProps<NsSelectProps>(), {
  label: undefined,
  modelValue: undefined,
  options: () => [],
  outlined: true,
  dense: false,
  multiple: false,
  emitValue: false,
  mapOptions: false,
  rules: undefined,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: unknown]
}>()
</script>

<style lang="sass" scoped>
.ns-select
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-md)
</style>
