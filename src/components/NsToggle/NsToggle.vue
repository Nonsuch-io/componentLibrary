<template>
  <label
    v-bind="$attrs"
    :for="toggleId"
    :class="['ns-toggle', { 'ns-toggle--on': modelValue, 'ns-toggle--disabled': disable }]"
  >
    <!-- Native input — provides keyboard, a11y, and form semantics -->
    <input
      :id="toggleId"
      type="checkbox"
      role="switch"
      class="ns-toggle__input"
      :checked="modelValue"
      :disabled="disable"
      :aria-checked="modelValue"
      @change="onChange"
    />

    <!-- Visual track + thumb -->
    <span class="ns-toggle__track" aria-hidden="true" />

    <!-- Label row + optional caption -->
    <span v-if="label || caption" class="ns-toggle__text">
      <span class="ns-toggle__label-row">
        <span v-if="label" class="ns-toggle__label">{{ label }}</span>
        <NsBadge v-if="badgeLabel" variant="positive" size="small" class="ns-toggle__badge">
          {{ badgeLabel }}
        </NsBadge>
      </span>
      <span v-if="caption" class="ns-toggle__caption">{{ caption }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
import NsBadge from '../NsBadge/NsBadge.vue'

defineOptions({ inheritAttrs: false })

let _uid = 0

export interface NsToggleProps {
  /** Toggle label text */
  label?: string
  /** Optional helper text shown below the label */
  caption?: string
  /** Optional badge label shown after the label (positive colour) */
  badgeLabel?: string
  /** v-model value */
  modelValue?: boolean
  /** Disable the toggle */
  disable?: boolean
}

const props = withDefaults(defineProps<NsToggleProps>(), {
  label: undefined,
  caption: undefined,
  badgeLabel: undefined,
  modelValue: false,
  disable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const toggleId = `ns-toggle-${++_uid}`

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).checked)
}
</script>

<style lang="scss" scoped>
// ---- Root ----
.ns-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  &--disabled {
    cursor: not-allowed;
  }
}

// ---- Hidden native input ----
.ns-toggle__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

// ---- Track + thumb ----
// All enabled states share the same #757575 (text-tertiary) outline.
// Off: very light grey fill (#f5f7fc = border-subtle), On: accent blue fill.
// Thumb: 14×14px circle (r=7 in SVG), white fill, same grey outline.
.ns-toggle__track {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 22px;
  border-radius: 11px;
  background: var(--ns-color-border-subtle); // #f5f7fc
  box-shadow: inset 0 0 0 2px var(--ns-color-text-tertiary); // #757575
  transition:
    background var(--ns-duration-normal) var(--ns-easing-default),
    box-shadow var(--ns-duration-normal) var(--ns-easing-default);

  // Thumb — 16×16 outer (border-box), 2px border matching track outline thickness
  // top=3 leaves 1px gap from track inner fill edge (y=2); centre = 3+8 = 11 = SVG cy
  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    box-sizing: border-box;
    border-radius: 50%;
    background: white;
    border: 2px solid var(--ns-color-text-tertiary);
    top: 3px;
    left: 4px;
    transition: left var(--ns-duration-normal) var(--ns-easing-default);
  }
}

// On — accent blue fill, same outline, thumb moves right
.ns-toggle--on .ns-toggle__track {
  background: var(--ns-color-accent); // #79caf3

  &::after {
    left: 20px; // cx=28 - r=8 = 20
  }
}

// Disabled (any state) — grey fill + disabled outline + grey thumb matching track
// Placed after --on so disabled wins when both classes are present
.ns-toggle--disabled .ns-toggle__track {
  background: var(--ns-color-bg-disabled); // #e0e0e0
  box-shadow: inset 0 0 0 2px var(--ns-color-text-disabled); // #909090

  &::after {
    background: var(--ns-color-bg-disabled);
    border-color: var(--ns-color-text-disabled);
  }
}

// Keyboard focus ring
.ns-toggle__input:focus-visible ~ .ns-toggle__track {
  outline: 2px solid var(--ns-color-border-focus);
  outline-offset: 2px;
}

// ---- Label area ----
.ns-toggle__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ns-toggle__label-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ns-toggle__label {
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 19.6px;
  color: var(--ns-color-text-primary);
}

.ns-toggle__caption {
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 16px;
  color: var(--ns-color-text-primary);
}

.ns-toggle--disabled {
  .ns-toggle__label,
  .ns-toggle__caption {
    color: var(--ns-color-text-disabled);
  }
}
</style>
