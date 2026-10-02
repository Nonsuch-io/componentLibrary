<template>
  <div
    v-bind="$attrs"
    :class="[
      'ns-radio-buttons',
      `ns-radio-buttons--${orientation}`,
      `ns-radio-buttons--${variant}`,
    ]"
  >
    <div v-if="label || caption" class="ns-radio-buttons__header">
      <span v-if="label" class="ns-radio-buttons__label">{{ label }}</span>
      <span v-if="caption" class="ns-radio-buttons__caption">{{ caption }}</span>
    </div>
    <div class="ns-radio-buttons__options">
      <NsRadio
        v-for="option in options"
        :key="String(option.value)"
        :value="option.value"
        :model-value="modelValue"
        :label="option.label"
        :disable="disable || option.disable"
        :name="groupName"
        @update:model-value="$emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import NsRadio from '../NsRadio/NsRadio.vue'
import type { NsRadioValue } from '../NsRadio/NsRadio.vue'

defineOptions({ inheritAttrs: false })

let _gid = 0

export type NsRadioButtonsOrientation = 'horizontal' | 'vertical'
export type NsRadioButtonsVariant = 'simple' | 'card'

export interface NsRadioOption {
  value: NsRadioValue
  label: string
  disable?: boolean
}

export interface NsRadioButtonsProps {
  /** Group label shown above the options */
  label?: string
  /** Optional helper text shown below the group label */
  caption?: string
  /** Current selected value (v-model) */
  modelValue?: NsRadioValue
  /** Radio options */
  options: NsRadioOption[]
  /** Layout direction */
  orientation?: NsRadioButtonsOrientation
  /** Visual style — 'card' variant TBD */
  variant?: NsRadioButtonsVariant
  /** Disable all options */
  disable?: boolean
}

withDefaults(defineProps<NsRadioButtonsProps>(), {
  label: undefined,
  caption: undefined,
  modelValue: undefined,
  orientation: 'vertical',
  variant: 'simple',
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: NsRadioValue]
}>()

const groupName = `ns-radio-group-${++_gid}`
</script>

<style lang="scss" scoped>
.ns-radio-buttons {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
}

.ns-radio-buttons__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ns-radio-buttons__label {
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 19.6px;
  color: var(--ns-color-text-primary);
}

.ns-radio-buttons__caption {
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 16px;
  color: var(--ns-color-text-primary);
}

.ns-radio-buttons__options {
  display: flex;
  gap: 12px; // reduced from 20px per design feedback
}

.ns-radio-buttons--horizontal .ns-radio-buttons__options {
  flex-direction: row;
  align-items: center;
}

.ns-radio-buttons--vertical .ns-radio-buttons__options {
  flex-direction: column;
  align-items: flex-start;
}
</style>
