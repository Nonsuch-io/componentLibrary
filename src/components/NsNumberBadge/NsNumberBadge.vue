<template>
  <span
    v-bind="$attrs"
    :class="['ns-number-badge', `ns-number-badge--${variant}`, `ns-number-badge--${size}`]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import type { NsBadgeVariant } from '../NsBadge/NsBadge.vue'

defineOptions({ inheritAttrs: false })

export type NsNumberBadgeSize = 'small' | 'medium'

export interface NsNumberBadgeProps {
  variant?: NsBadgeVariant
  size?: NsNumberBadgeSize
}

withDefaults(defineProps<NsNumberBadgeProps>(), {
  variant: 'primary',
  size: 'small',
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-number-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--ns-radius-full);
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  white-space: nowrap;
}

// ---- Sizes ----
.ns-number-badge--small {
  width: 20px;
  height: 20px;
  padding: 4px;
  font-size: 10px;
  line-height: 16px;
}

.ns-number-badge--medium {
  width: 24px;
  height: 24px;
  padding: 4px;
  font-size: 12px;
  line-height: 16.8px;
}

// ---- Primary ----
.ns-number-badge--primary {
  background: var(--ns-color-btn-primary-bg);
  color: var(--ns-color-text-on-primary);
}

// ---- Secondary ----
.ns-number-badge--secondary {
  background: var(--ns-color-btn-secondary-bg);
  color: var(--ns-color-text-on-secondary);
  box-shadow: inset 0 0 0 1px var(--ns-color-text-on-secondary);
}

// ---- Accent ----
.ns-number-badge--accent {
  background: var(--ns-color-bg-accent);
  color: var(--ns-color-text-on-accent);
}

// ---- Positive ----
.ns-number-badge--positive {
  background: var(--ns-color-positive);
  color: var(--ns-color-text-on-positive);
}

// ---- Negative ----
.ns-number-badge--negative {
  background: var(--ns-color-negative);
  color: var(--ns-color-text-on-negative);
}

// ---- Info ----
.ns-number-badge--info {
  background: var(--ns-color-info);
  color: var(--ns-color-text-on-info);
}

// ---- Warning ----
.ns-number-badge--warning {
  background: var(--ns-color-bg-warning);
  color: var(--ns-color-text-on-warning);
}

// ---- Ghost ----
.ns-number-badge--ghost {
  background: transparent;
  color: var(--ns-color-text-primary);
}

// ---- Neutral ----
.ns-number-badge--neutral {
  background: var(--ns-color-status-neutral);
  color: var(--ns-color-text-primary);
  box-shadow: inset 0 0 0 1px var(--ns-color-border-subtle);
}
</style>
