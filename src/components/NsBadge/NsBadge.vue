<template>
  <span v-bind="$attrs" :class="['ns-badge', `ns-badge--${variant}`, `ns-badge--${size}`]">
    <slot />
  </span>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

export type NsBadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'info'
  | 'warning'
  | 'ghost'
  | 'neutral'

export type NsBadgeSize = 'small' | 'medium'

export interface NsBadgeProps {
  variant?: NsBadgeVariant
  size?: NsBadgeSize
}

withDefaults(defineProps<NsBadgeProps>(), {
  variant: 'primary',
  size: 'small',
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--ns-radius-md);
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  white-space: nowrap;
}

// ---- Sizes ----
.ns-badge--small {
  font-size: 10px;
  line-height: 16px;
}

.ns-badge--medium {
  font-size: 12px;
  line-height: 16.8px;
}

// ---- Primary ----
.ns-badge--primary {
  background: var(--ns-color-btn-primary-bg);
  color: var(--ns-color-text-on-primary);
}

// ---- Secondary ----
.ns-badge--secondary {
  background: var(--ns-color-btn-secondary-bg);
  color: var(--ns-color-text-on-secondary);
  box-shadow: inset 0 0 0 1px var(--ns-color-text-on-secondary);
}

// ---- Accent ----
.ns-badge--accent {
  background: var(--ns-color-bg-accent);
  color: var(--ns-color-text-on-accent);
}

// ---- Positive ----
.ns-badge--positive {
  background: var(--ns-color-positive);
  color: var(--ns-color-text-on-positive);
}

// ---- Negative ----
.ns-badge--negative {
  background: var(--ns-color-negative);
  color: var(--ns-color-text-on-negative);
}

// ---- Info ----
.ns-badge--info {
  background: var(--ns-color-info);
  color: var(--ns-color-text-on-info);
}

// ---- Warning ----
.ns-badge--warning {
  background: var(--ns-color-bg-warning);
  color: var(--ns-color-text-on-warning);
}

// ---- Ghost ----
.ns-badge--ghost {
  background: transparent;
  color: var(--ns-color-text-primary);
}

// ---- Neutral ----
.ns-badge--neutral {
  background: var(--ns-color-status-neutral);
  color: var(--ns-color-text-primary);
  box-shadow: inset 0 0 0 1px var(--ns-color-border-subtle);
}
</style>
