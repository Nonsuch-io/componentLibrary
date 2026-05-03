<template>
  <q-badge v-bind="$attrs" :class="['ns-badge', `ns-badge--${variant}`, `ns-badge--${size}`]">
    <slot />
  </q-badge>
</template>

<script setup lang="ts">
/**
 * NsBadge — A styled wrapper around Quasar's QBadge.
 *
 * Provides Nonsuch design-token integration with the variants
 * defined in the butiq Figma design system.
 * All QBadge attrs (e.g. `floating`, `transparent`, ARIA) are
 * forwarded via $attrs.
 */
export type NsBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'positive'
  | 'positive-subtle'
  | 'negative'
  | 'negative-subtle'
  | 'info'
  | 'warning'
  | 'warning-subtle'
  | 'ghost'

export type NsBadgeSize = 'dense' | 'medium'

export interface NsBadgeProps {
  variant?: NsBadgeVariant
  size?: NsBadgeSize
}

withDefaults(defineProps<NsBadgeProps>(), {
  variant: 'primary',
  size: 'dense',
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-family: var(--ns-font-family-text);
  white-space: nowrap;
}

// ---- Sizes ----
.ns-badge--dense {
  font-size: 10px;
  font-weight: 400;
  line-height: 1.6;
}

.ns-badge--medium {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

// ---- Color variants ----
.ns-badge--primary {
  background: var(--ns-color-bg-brand);
  color: var(--ns-color-on-primary);
}

.ns-badge--secondary {
  background: transparent;
  color: var(--ns-color-bg-brand);
  border-color: var(--ns-color-bg-brand);
}

.ns-badge--accent {
  background: var(--ns-color-accent);
  color: var(--ns-color-on-background);
}

.ns-badge--positive {
  background: var(--ns-color-success);
  color: var(--ns-color-on-background);
}

.ns-badge--positive-subtle {
  background: var(--ns-color-success-light);
  color: var(--ns-color-on-background);
  border-color: var(--ns-color-border-positive);
}

.ns-badge--negative {
  background: var(--ns-color-error);
  color: var(--ns-color-on-primary);
}

.ns-badge--negative-subtle {
  background: var(--ns-color-error-light);
  color: var(--ns-color-on-background);
  border-color: var(--ns-color-border-negative);
}

.ns-badge--info {
  background: var(--ns-color-info);
  color: var(--ns-color-on-primary);
}

.ns-badge--warning {
  background: var(--ns-color-warning);
  color: var(--ns-color-on-background);
}

.ns-badge--warning-subtle {
  background: var(--ns-color-warning-light);
  color: var(--ns-color-on-background);
}

.ns-badge--ghost {
  background: transparent;
  color: var(--ns-color-on-background);
}
</style>
