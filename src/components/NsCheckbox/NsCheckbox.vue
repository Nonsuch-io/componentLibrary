<template>
  <label
    v-bind="$attrs"
    :for="inputId"
    :class="['ns-checkbox', { 'ns-checkbox--disabled': disable }]"
  >
    <!-- Visually hidden native input — handles keyboard, a11y, and form submission -->
    <input
      :id="inputId"
      ref="inputRef"
      type="checkbox"
      class="ns-checkbox__input"
      :checked="modelValue === true"
      :disabled="disable"
      @change="onChange"
    />

    <!-- Custom visual box -->
    <span class="ns-checkbox__box" aria-hidden="true">
      <!-- Checked checkmark — outer rect is the border colour, inner rect is the fill -->
      <svg
        v-if="modelValue === true"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="18"
          height="18"
          rx="4"
          fill="var(--checkbox-border, var(--ns-color-text-secondary))"
        />
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx="2"
          fill="var(--checkbox-fill, var(--ns-color-accent))"
        />
        <path
          d="M4 9L7.5 12.5L14 6"
          stroke="var(--checkbox-stroke, white)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <!-- Indeterminate dash — same two-rect border technique -->
      <svg
        v-else-if="modelValue === null"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="18"
          height="18"
          rx="4"
          fill="var(--checkbox-border, var(--ns-color-text-secondary))"
        />
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx="2"
          fill="var(--checkbox-fill, var(--ns-color-accent))"
        />
        <path
          d="M4.5 9H13.5"
          stroke="var(--checkbox-stroke, white)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </span>

    <!-- Label and optional caption -->
    <span v-if="label || caption" class="ns-checkbox__text">
      <span v-if="label" class="ns-checkbox__label">{{ label }}</span>
      <span v-if="caption" class="ns-checkbox__caption">{{ caption }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

let _uid = 0

defineOptions({ inheritAttrs: false })

export interface NsCheckboxProps {
  /** Checkbox label text */
  label?: string
  /** Optional helper text shown below the label */
  caption?: string
  /** Checked state — true, false, or null (indeterminate) */
  modelValue?: boolean | null
  /** Disable the checkbox */
  disable?: boolean
}

const props = withDefaults(defineProps<NsCheckboxProps>(), {
  label: undefined,
  caption: undefined,
  modelValue: false,
  disable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | null]
}>()

const inputId = `ns-checkbox-${++_uid}`
const inputRef = ref<HTMLInputElement>()

// Sync native indeterminate property (can't be set via HTML attribute)
watchEffect(() => {
  if (inputRef.value) {
    inputRef.value.indeterminate = props.modelValue === null
  }
})

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<style lang="scss" scoped>
// ---- Root ----
.ns-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;

  &--disabled {
    cursor: not-allowed;
  }
}

// ---- Hidden native input ----
.ns-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

// ---- Visual box ----
// box-shadow (inset) is used for the unchecked border so it doesn't affect box dimensions.
// This means checked (SVG fills full 18×18) and unchecked (border inset) are always the same size.
.ns-checkbox__box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--ns-color-bg-surface);
  box-shadow: inset 0 0 0 2px var(--ns-color-text-secondary);
  overflow: hidden;
  transition: box-shadow var(--ns-duration-fast) var(--ns-easing-default);

  svg {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
  }
}

// Checked / indeterminate — SVG handles the visual (border + fill), remove CSS border
.ns-checkbox:has(input:checked) .ns-checkbox__box,
.ns-checkbox:has(input:indeterminate) .ns-checkbox__box {
  box-shadow: none;
  background: transparent;
}

// Disabled unchecked — grey fill + grey border
.ns-checkbox--disabled .ns-checkbox__box {
  box-shadow: inset 0 0 0 2px var(--ns-color-text-disabled);
  background: var(--ns-color-bg-disabled);
}

// Disabled checked / indeterminate — grey border, grey fill, grey mark
.ns-checkbox--disabled:has(input:checked) .ns-checkbox__box,
.ns-checkbox--disabled:has(input:indeterminate) .ns-checkbox__box {
  box-shadow: none;
  background: transparent;
  --checkbox-border: var(--ns-color-text-disabled);
  --checkbox-fill: var(--ns-color-bg-disabled);
  --checkbox-stroke: var(--ns-color-text-disabled);
}

// ---- Text ----
.ns-checkbox__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ns-checkbox__label {
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 19.6px;
  color: var(--ns-color-text-primary);
}

.ns-checkbox__caption {
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 16px;
  color: var(--ns-color-text-primary);
}

.ns-checkbox--disabled {
  .ns-checkbox__label,
  .ns-checkbox__caption {
    color: var(--ns-color-text-disabled);
  }
}

// Keyboard focus ring
.ns-checkbox__input:focus-visible ~ .ns-checkbox__box {
  outline: 2px solid var(--ns-color-border-focus);
  outline-offset: 2px;
}
</style>
