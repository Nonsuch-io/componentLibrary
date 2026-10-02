<template>
  <label
    v-bind="$attrs"
    :for="radioId"
    :class="[
      'ns-radio',
      {
        'ns-radio--selected': isSelected,
        'ns-radio--disabled': disable,
        'ns-radio--has-content': hasContent,
      },
    ]"
  >
    <input
      :id="radioId"
      type="radio"
      class="ns-radio__input"
      :value="value"
      :checked="isSelected"
      :disabled="disable"
      :name="name"
      @change="onChange"
    />

    <!-- Visual circle — aligns to top when content slot is used -->
    <span class="ns-radio__circle" aria-hidden="true" />

    <!-- Label row + optional inline field + optional revealed content below -->
    <span v-if="label || hasInline || hasContent" class="ns-radio__body">
      <span
        :class="[
          'ns-radio__label-row',
          { 'ns-radio__label-row--inline-left': inlinePosition === 'left' },
        ]"
      >
        <slot v-if="inlinePosition === 'left'" name="inline" />
        <span v-if="label" class="ns-radio__label">{{ label }}</span>
        <slot v-if="inlinePosition !== 'left'" name="inline" />
      </span>
      <div v-if="hasContent" class="ns-radio__content">
        <slot />
      </div>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

defineOptions({ inheritAttrs: false })

let _uid = 0

export type NsRadioValue = string | number | boolean

export interface NsRadioProps {
  /** The value this radio button represents */
  value: NsRadioValue
  /** Current selected value (v-model) */
  modelValue?: NsRadioValue
  /** Radio group name — share across a group for native exclusivity */
  name?: string
  /** Label text — omit for a label-less (icon-only) radio */
  label?: string
  /** Position of the inline field relative to the label text */
  inlinePosition?: 'left' | 'right'
  /** Disable this radio button */
  disable?: boolean
}

const props = withDefaults(defineProps<NsRadioProps>(), {
  modelValue: undefined,
  name: undefined,
  label: undefined,
  inlinePosition: 'right',
  disable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: NsRadioValue]
}>()

const slots = useSlots()
const radioId = `ns-radio-${++_uid}`

const isSelected = computed(() => props.modelValue === props.value)
const hasContent = computed(() => !!slots.default)
const hasInline = computed(() => !!slots.inline)

function onChange() {
  emit('update:modelValue', props.value)
}
</script>

<style lang="scss" scoped>
// ---- Root ----
.ns-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &--disabled {
    cursor: not-allowed;
  }

  // When revealed-content slot is present, align to top so it can extend below.
  &--has-content {
    align-items: flex-start;
  }
}

// ---- Hidden native input ----
.ns-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

// ---- Visual circle ----
.ns-radio__circle {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ns-color-bg-surface);
  box-shadow: inset 0 0 0 2px var(--ns-color-text-secondary);
  transition: box-shadow var(--ns-duration-fast) var(--ns-easing-default);

  // Inner dot — accent blue when selected, hidden when not
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--ns-color-bg-accent);
    top: 5px;
    left: 5px;
    opacity: 0;
    transition: opacity var(--ns-duration-fast) var(--ns-easing-default);
  }
}

.ns-radio--selected .ns-radio__circle::after {
  opacity: 1;
}

// Disabled
.ns-radio--disabled .ns-radio__circle {
  background: var(--ns-color-bg-disabled);
  box-shadow: inset 0 0 0 2px var(--ns-color-text-disabled);

  &::after {
    background: var(--ns-color-text-disabled);
  }
}

// ---- Body (label row + revealed content) ----
.ns-radio__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

// Label and inline field sit side by side in the same row
.ns-radio__label-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ns-radio__label {
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 19.6px;
  color: var(--ns-color-text-primary);
}

.ns-radio__content {
  // Content appears below the label, aligned with label text
}

.ns-radio--disabled {
  .ns-radio__label {
    color: var(--ns-color-text-disabled);
  }
}

// Keyboard focus ring
.ns-radio__input:focus-visible ~ .ns-radio__circle {
  outline: 2px solid var(--ns-color-border-focus);
  outline-offset: 2px;
}
</style>
