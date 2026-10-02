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
        'ns-radio--card': card,
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

    <!-- Visual circle — aligns to top when content slot is used (non-card only) -->
    <span class="ns-radio__circle" aria-hidden="true" />

    <!-- Optional icon between circle and label (card variant) -->
    <span v-if="hasIcon" class="ns-radio__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <!-- Body: label row + optional caption + optional revealed content (non-card) -->
    <span v-if="label || hasInline || hasContent || hasCaption" class="ns-radio__body">
      <span
        :class="[
          'ns-radio__label-row',
          {
            'ns-radio__label-row--inline-left': inlinePosition === 'left',
            'ns-radio__label-row--wrap': hasCaption && captionLayout === 'inline',
          },
        ]"
      >
        <slot v-if="inlinePosition === 'left'" name="inline" />
        <span v-if="label" class="ns-radio__label">{{ label }}</span>
        <slot v-if="inlinePosition !== 'left'" name="inline" />
        <!-- Inline caption flows after the label in the same wrapping row -->
        <span v-if="hasCaption && captionLayout === 'inline'" class="ns-radio__caption">
          <slot name="caption" />
        </span>
      </span>

      <!-- Below caption: sits under the label row -->
      <div v-if="hasCaption && captionLayout === 'below'" class="ns-radio__caption">
        <slot name="caption" />
      </div>

      <!-- Revealed content: appears below the label in both simple and card modes -->
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
  /** Render as a selectable card instead of a bare radio */
  card?: boolean
  /** Where the #caption slot content appears relative to the label */
  captionLayout?: 'below' | 'inline'
}

const props = withDefaults(defineProps<NsRadioProps>(), {
  modelValue: undefined,
  name: undefined,
  label: undefined,
  inlinePosition: 'right',
  disable: false,
  card: false,
  captionLayout: 'below',
})

const emit = defineEmits<{
  'update:modelValue': [value: NsRadioValue]
}>()

const slots = useSlots()
const radioId = `ns-radio-${++_uid}`

const isSelected = computed(() => props.modelValue === props.value)
const hasContent = computed(() => !!slots.default)
const hasInline = computed(() => !!slots.inline)
const hasIcon = computed(() => !!slots.icon)
const hasCaption = computed(() => !!slots.caption)

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

// ---- Body (label row + caption + revealed content) ----
.ns-radio__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

// Label and inline field sit side by side in the same row
.ns-radio__label-row {
  display: flex;
  align-items: center;
  gap: 8px;

  // Inline caption mode: switch to block so label + caption flow as one text run
  &--wrap {
    display: block;

    .ns-radio__label {
      display: inline;
    }

    .ns-radio__caption {
      display: inline;
      margin-left: 8px;
    }
  }
}

.ns-radio__label {
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 19.6px;
  color: var(--ns-color-text-primary);
}

// ---- Caption ----
.ns-radio__caption {
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 18px;
  color: var(--ns-color-text-secondary);
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

// ---- Revealed content (non-card) ----
.ns-radio__content {
  // Content appears below the label, aligned with label text
}

.ns-radio--disabled {
  .ns-radio__label {
    color: var(--ns-color-text-disabled);
  }

  .ns-radio__caption {
    color: var(--ns-color-text-disabled);
  }
}

// Keyboard focus ring
.ns-radio__input:focus-visible ~ .ns-radio__circle {
  outline: 2px solid var(--ns-color-border-focus);
  outline-offset: 2px;
}

// ---- Card variant ----
.ns-radio--card {
  display: flex;
  align-items: center;
  gap: var(--ns-space-3);
  padding: var(--ns-space-4);
  background: var(--ns-color-bg-surface);
  border: 1px solid var(--ns-color-border-default);
  border-radius: var(--ns-radius-lg);
  width: 100%;
  cursor: pointer;
  transition:
    border-color var(--ns-duration-fast) var(--ns-easing-default),
    box-shadow var(--ns-duration-fast) var(--ns-easing-default);

  // Keep circle vertically centred even when content pushes the body taller
  &.ns-radio--has-content {
    align-items: center;
  }

  &.ns-radio--selected {
    border-color: var(--ns-color-border-focus);
    box-shadow: 0 0 0 1px var(--ns-color-border-focus);
  }

  &.ns-radio--disabled {
    background: var(--ns-color-bg-disabled);
    border-color: var(--ns-color-border-disabled);
    box-shadow: none;
    cursor: not-allowed;
  }

  .ns-radio__icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--ns-color-text-primary);
  }

  .ns-radio__label {
    font-weight: var(--ns-font-weight-semibold);
  }
}
</style>
