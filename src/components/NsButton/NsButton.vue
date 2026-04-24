<template>
  <q-btn
    v-bind="$attrs"
    unelevated
    no-caps
    :ripple="false"
    :loading="loading"
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
import { QSpinnerDots } from 'quasar'

export type NsButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'

export type NsButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface NsButtonProps {
  variant?: NsButtonVariant
  size?: NsButtonSize
  /** Square icon-only layout — use when no label slot is provided */
  iconOnly?: boolean
  loading?: boolean
}

withDefaults(defineProps<NsButtonProps>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  loading: false,
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
    min-height: unset;
    padding: 0;
  }

  :deep(.q-btn__content) {
    gap: 4px;
  }
}

// ---- Sizes ----
.ns-btn--xs {
  font-size: 12px;

  :deep(.q-btn__wrapper) {
    padding: 4px 8px;
  }

  &.ns-btn--icon-only :deep(.q-btn__wrapper) {
    padding: 8px;
  }
}

.ns-btn--sm {
  font-size: 12px;

  :deep(.q-btn__wrapper) {
    padding: 8px 12px;
  }

  &.ns-btn--icon-only :deep(.q-btn__wrapper) {
    padding: 8px;
  }
}

.ns-btn--md {
  font-size: 14px;

  :deep(.q-btn__wrapper) {
    padding: 8px 16px;
  }

  &.ns-btn--icon-only :deep(.q-btn__wrapper) {
    padding: 8px;
  }
}

.ns-btn--lg {
  font-size: 16px;

  :deep(.q-btn__wrapper) {
    padding: 12px 16px;
  }

  :deep(.q-btn__content) {
    gap: 8px;
  }

  &.ns-btn--icon-only :deep(.q-btn__wrapper) {
    padding: 12px;
  }
}

.ns-btn--xl {
  font-size: 20px;

  :deep(.q-btn__wrapper) {
    padding: 20px;
  }

  :deep(.q-btn__content) {
    gap: 12px;
  }

  &.ns-btn--icon-only {
    border-radius: 12px;

    :deep(.q-btn__wrapper) {
      padding: 12px;
    }
  }
}

// ---- Primary ----
.ns-btn--primary {
  background: #d56307; // color-bg-brand (primary-400)
  color: #ffffff;

  &:hover:not(.disabled) {
    background: #ef7c20; // color-bg-brand-hover
  }

  &:active:not(.disabled) {
    background: #cc3c00; // color-bg-brand-active
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Secondary ----
.ns-btn--secondary {
  background: var(--ns-color-background);
  color: var(--ns-color-text-brand);
  box-shadow: inset 0 0 0 1px var(--ns-color-border-brand);

  &:hover:not(.disabled) {
    background: var(--ns-color-surface);
    color: var(--ns-color-bg-brand-hover);
    box-shadow: inset 0 0 0 1px var(--ns-color-bg-brand-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-bg-header);
    color: var(--ns-color-primary);
    box-shadow: inset 0 0 0 1px var(--ns-color-primary);
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
  background: var(--ns-color-accent);
  color: var(--ns-color-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-accent-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-accent-active);
    color: var(--ns-color-on-primary);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Positive ----
.ns-btn--positive {
  background: var(--ns-color-success);
  color: var(--ns-color-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-success-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-success-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Negative ----
.ns-btn--negative {
  background: var(--ns-color-error);
  color: var(--ns-color-on-primary);

  &:hover:not(.disabled) {
    background: var(--ns-color-error-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-error-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}

// ---- Warning ----
.ns-btn--warning {
  background: #f4c75a; // color-status-warning (warning-400) — between --ns-color-warning tokens
  color: var(--ns-color-on-accent);

  &:hover:not(.disabled) {
    background: var(--ns-color-warning-hover);
  }

  &:active:not(.disabled) {
    background: var(--ns-color-warning-active);
  }

  &.disabled {
    background: var(--ns-color-bg-disabled);
    color: var(--ns-color-text-disabled);
  }
}
</style>
