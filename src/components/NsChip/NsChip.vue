<template>
  <q-chip
    v-bind="$attrs"
    :disable="disabled"
    :clickable="clickable"
    :class="[
      'ns-chip',
      `ns-chip--${variant}`,
      `ns-chip--${size}`,
      { 'ns-chip--outline': outline, 'ns-chip--disabled': disabled },
    ]"
  >
    <PhCheck v-if="selected && !disabled" :size="16" class="ns-chip__check" />
    <slot />
    <PhXCircle
      v-if="removable && !disabled"
      :size="16"
      class="ns-chip__remove"
      tabindex="-1"
      @click.stop="$emit('remove')"
    />
  </q-chip>
</template>

<script setup lang="ts">
import { PhCheck, PhXCircle } from '@phosphor-icons/vue'

export type NsChipVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'info'
  | 'warning'

export type NsChipSize = 'sm' | 'md' | 'lg'

export interface NsChipProps {
  variant?: NsChipVariant
  size?: NsChipSize
  /** Outline (unselected) visual style — no background fill */
  outline?: boolean
  /** Shows the checkmark icon — use for filter/toggle chips to indicate active selection */
  selected?: boolean
  removable?: boolean
  clickable?: boolean
  disabled?: boolean
}

withDefaults(defineProps<NsChipProps>(), {
  variant: 'primary',
  size: 'md',
  outline: false,
  selected: false,
  removable: false,
  clickable: false,
  disabled: false,
})

defineEmits<{
  remove: []
}>()
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-chip {
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  border-radius: 16px;
  transition:
    background var(--ns-duration-fast) var(--ns-easing-default),
    color var(--ns-duration-fast) var(--ns-easing-default),
    box-shadow var(--ns-duration-fast) var(--ns-easing-default);

  :deep(.q-chip__content) {
    gap: 4px;
  }

  :deep(.q-focus-helper) {
    display: none;
  }
}

.ns-chip__check,
.ns-chip__remove {
  flex-shrink: 0;
}

.ns-chip__remove {
  cursor: pointer;
}

// ---- Sizes (padding same across all; only font-size changes) ----
.ns-chip--sm {
  font-size: 12px;
  padding: 4px 12px;
}

.ns-chip--md {
  font-size: 14px;
  padding: 4px 12px;
}

.ns-chip--lg {
  font-size: 16px;
  padding: 4px 12px;
}

// ---- Primary ----
.ns-chip--primary {
  background: var(--ns-color-btn-primary-bg);
  color: var(--ns-color-text-on-primary);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-brand);
    box-shadow: inset 0 0 0 1px var(--ns-color-btn-primary-bg);
  }
}

// ---- Secondary ----
// Filled and outline look identical per Figma — secondary is inherently a light bordered style.
.ns-chip--secondary {
  background: var(--ns-color-btn-secondary-bg);
  color: var(--ns-color-text-on-secondary);
  box-shadow: inset 0 0 0 1px var(--ns-color-text-on-secondary);
}

// ---- Accent ----
.ns-chip--accent {
  background: var(--ns-color-bg-accent);
  color: var(--ns-color-text-on-accent);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-accent);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-accent);
  }
}

// ---- Positive ----
.ns-chip--positive {
  background: var(--ns-color-positive);
  color: var(--ns-color-text-on-positive);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-positive);
    box-shadow: inset 0 0 0 1px var(--ns-color-positive);
  }
}

// ---- Negative ----
.ns-chip--negative {
  background: var(--ns-color-negative);
  color: var(--ns-color-text-on-negative);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-negative);
    box-shadow: inset 0 0 0 1px var(--ns-color-negative);
  }
}

// ---- Info ----
.ns-chip--info {
  background: var(--ns-color-info);
  color: var(--ns-color-text-on-info);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-info);
    box-shadow: inset 0 0 0 1px var(--ns-color-info);
  }
}

// ---- Warning ----
// Figma uses the soft tint (color-bg-warning) not the saturated amber (color-warning).
.ns-chip--warning {
  background: var(--ns-color-bg-warning);
  color: var(--ns-color-text-on-warning);

  &.ns-chip--outline {
    background: var(--ns-color-bg-surface-alt);
    color: var(--ns-color-text-warning);
    box-shadow: inset 0 0 0 1px var(--ns-color-text-warning);
  }
}

// ---- Disabled ----
.ns-chip--disabled {
  background: var(--ns-color-btn-disabled-bg) !important;
  color: var(--ns-color-text-disabled) !important;
  box-shadow: inset 0 0 0 1px var(--ns-color-btn-disabled-bg-border) !important;
  opacity: 1 !important;
  cursor: not-allowed;
  pointer-events: none;
}
</style>
