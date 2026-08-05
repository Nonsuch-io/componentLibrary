<template>
  <q-btn
    v-bind="$attrs"
    unelevated
    no-caps
    :ripple="false"
    :loading="loading"
    :padding="buttonPadding"
    :aria-busy="loading"
    :class="['ns-btn', `ns-btn--${variant}`, `ns-btn--${size}`, { 'ns-btn--icon-only': iconOnly }]"
  >
    <slot />
    <template #loading>
      <slot name="loading">
        <q-spinner-dots />
      </slot>
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { QSpinnerDots } from 'quasar'
import { useNsAttrConflictWarning } from '../../composables/useNsAttrConflictWarning'

export type NsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'marketing'
  | 'marketing-pushed'

export type NsButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface NsButtonProps {
  variant?: NsButtonVariant
  size?: NsButtonSize
  /** Square icon-only layout — use when no label slot is provided */
  iconOnly?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<NsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  loading: false,
})

// componentLibrary-nk3: NsButton declares neither `color` nor `flat` (and
// friends), so they fall through $attrs to QBtn and can silently collide
// with the `.ns-btn--*` variant CSS below (e.g. flat + color="primary"
// renders orange text on an orange background — both systems agree on the
// same brand colour, which is exactly what makes it invisible). This is a
// dev-only warning, not a reconciliation: it does NOT make the combination
// render correctly, it only makes the collision loud instead of silent.
useNsAttrConflictWarning('NsButton', [
  { attrs: ['color'], useInstead: 'variant' },
  { attrs: ['text-color', 'textColor'], useInstead: 'variant' },
  { attrs: ['flat'], useInstead: 'variant' },
  { attrs: ['outline'], useInstead: 'variant' },
  { attrs: ['unelevated'], useInstead: 'variant' },
  { attrs: ['push'], useInstead: 'variant' },
  { attrs: ['glossy'], useInstead: 'variant' },
])

const paddingMap: Record<NsButtonSize, { default: string; iconOnly: string }> = {
  xs: { default: '4px 8px', iconOnly: '8px' },
  sm: { default: '8px 12px', iconOnly: '8px' },
  md: { default: '8px 16px', iconOnly: '8px' },
  lg: { default: '12px 16px', iconOnly: '12px' },
  xl: { default: '20px', iconOnly: '12px' },
}

const buttonPadding = computed(() => {
  if (props.variant === 'marketing' || props.variant === 'marketing-pushed')
    return props.iconOnly ? '12px' : '16px 20px'
  return paddingMap[props.size][props.iconOnly ? 'iconOnly' : 'default']
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-btn {
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  border-radius: 8px;
  transition:
    background 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;

  :deep(.q-btn__wrapper) {
    min-height: unset; /* Quasar 2.x internal — revisit on major Quasar bump */
  }

  :deep(.q-btn__content) {
    gap: 4px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }
}

// ---- Sizes ----
.ns-btn--xs {
  font-size: 12px;
}

.ns-btn--sm {
  font-size: 12px;
}

.ns-btn--md {
  font-size: 14px;
}

.ns-btn--lg {
  font-size: 16px;

  :deep(.q-btn__content) {
    gap: 8px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }
}

.ns-btn--xl {
  font-size: 20px;

  :deep(.q-btn__content) {
    gap: 12px; /* Quasar 2.x internal — revisit on major Quasar bump */
  }

  &.ns-btn--icon-only {
    border-radius: 12px;
  }
}

// ---- Primary ----
.ns-btn--primary {
  background: var(--ns-color-bg-brand);
  color: var(--ns-color-text-on-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-bg-brand-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Secondary ----
.ns-btn--secondary {
  background: var(--ns-color-bg-canvas);
  color: var(--ns-color-text-brand);
  box-shadow: inset 0 0 0 1px var(--ns-color-border-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-bg-brand-hover);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-bg-header);
    color: var(--ns-color-bg-brand-active);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-brand-active);
  }

  &.disabled {
    background: transparent;
    color: var(--ns-color-text-disabled);
    box-shadow: inset 0 0 0 1px var(--ns-color-text-disabled);
  }
}

// ---- Tertiary ----
.ns-btn--tertiary {
  background: transparent;
  color: var(--ns-color-text-brand);

  &:hover:not(.disabled) {
    color: var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    color: var(--ns-color-text-brand);
  }

  &.disabled {
    color: var(--ns-color-bg-disabled);
  }
}

// ---- Accent ----
.ns-btn--accent {
  background: var(--ns-color-status-accent);
  color: var(--ns-color-text-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-accent-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-accent-active);
    color: var(--ns-color-text-on-brand);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Positive ----
.ns-btn--positive {
  background: var(--ns-color-status-positive);
  color: var(--ns-color-text-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-positive-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-positive-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Negative ----
.ns-btn--negative {
  background: var(--ns-color-status-negative);
  color: var(--ns-color-text-on-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-negative-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-negative-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Warning ----
.ns-btn--warning {
  background: var(--ns-color-status-warning);
  color: var(--ns-color-text-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-status-warning-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-warning-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Marketing (shared base) ----
.ns-btn--marketing,
.ns-btn--marketing-pushed {
  border-radius: 9999px;
  font-size: 1.5rem;

  :deep(.q-btn__content) {
    gap: 12px;
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);

    :deep(img) {
      filter: brightness(0.565);
    }
  }
}

// ---- Marketing ----
.ns-btn--marketing {
  // componentLibrary-nk3: was var(--ns-color-text-primary), a TEXT token
  // that flips with the theme (#2d0b00 light / #fef7ee dark) while the
  // `color: white` below is hardcoded and cannot flip — 1.06:1 contrast in
  // dark mode. --ns-color-bg-dark is #2d0b00 in BOTH modes (it doesn't flip),
  // so this preserves the light-mode look exactly and fixes dark mode.
  background: var(--ns-color-bg-dark);
  color: white;

  :deep(img) {
    filter: brightness(0) invert(1);
  }

  &:hover:not(.disabled) {
    background: #3d1500;
  }

  &:active:not(.disabled) {
    background: #1e0700;
  }
}

// ---- Marketing pushed ----
.ns-btn--marketing-pushed {
  background: var(--ns-color-status-positive);
  color: var(--ns-color-text-on-accent);

  :deep(img) {
    filter: none;
  }

  &:hover:not(.disabled) {
    background: var(--ns-color-status-positive-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-status-positive-active);
  }
}
</style>
