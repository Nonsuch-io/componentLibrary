<template>
  <q-chip
    v-bind="$attrs"
    :class="[
      'ns-chip',
      `ns-chip--${variant}`,
      { 'ns-chip--outline': outline, 'ns-chip--dense': dense },
    ]"
  >
    <slot />
  </q-chip>
</template>

<script setup lang="ts">
/**
 * NsChip — A styled chip wrapping Quasar's QChip.
 *
 * Phase 1 of the Figma restyle: colour variants + outline + dense
 * size. Icon support and the removable/dismiss button land in
 * Phase 2.
 */
export type NsChipVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'info'
  | 'warning'

export interface NsChipProps {
  variant?: NsChipVariant
  /** Outlined (transparent) style. Pairs with the variant's accent colour. */
  outline?: boolean
  /** Compact size — smaller padding and font. */
  dense?: boolean
}

withDefaults(defineProps<NsChipProps>(), {
  variant: 'primary',
  outline: false,
  dense: false,
})
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 16px;
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  white-space: nowrap;
}

// ---- Dense ----
.ns-chip--dense {
  padding: 2px 8px;
  font-size: 10px;
  line-height: 16px;
}

// ---- Filled colour variants ----
.ns-chip--primary {
  background: var(--ns-color-bg-brand);
  color: var(--ns-color-on-primary);
}

.ns-chip--secondary {
  background: var(--ns-color-bg-menu-hover);
  color: var(--ns-color-text-brand);
  border-color: var(--ns-color-bg-brand);
}

.ns-chip--accent {
  background: var(--ns-color-accent);
  color: var(--ns-color-on-accent);
}

.ns-chip--positive {
  background: var(--ns-color-success);
  color: var(--ns-color-on-background);
}

.ns-chip--negative {
  background: var(--ns-color-error);
  color: var(--ns-color-on-primary);
}

.ns-chip--info {
  background: var(--ns-color-info);
  color: var(--ns-color-on-primary);
}

.ns-chip--warning {
  background: var(--ns-color-warning);
  color: var(--ns-color-on-background);
}

// ---- Outline overrides ----
// Outlined chips share a pattern: surface background, coloured border,
// coloured text. Each variant picks a high-contrast accent for both
// border and text.
.ns-chip--outline {
  background: var(--ns-color-surface);

  &.ns-chip--primary {
    border-color: var(--ns-color-bg-brand);
    color: var(--ns-color-bg-brand);
  }

  &.ns-chip--secondary {
    border-color: var(--ns-color-bg-brand);
    color: var(--ns-color-bg-brand);
  }

  &.ns-chip--accent {
    border-color: var(--ns-color-accent-active);
    color: var(--ns-color-accent-active);
  }

  &.ns-chip--positive {
    border-color: var(--ns-color-border-positive);
    color: var(--ns-color-border-positive);
  }

  &.ns-chip--negative {
    border-color: var(--ns-color-error);
    color: var(--ns-color-error);
  }

  &.ns-chip--info {
    border-color: var(--ns-color-info);
    color: var(--ns-color-info);
  }

  &.ns-chip--warning {
    border-color: var(--ns-color-border-warning);
    color: var(--ns-color-border-warning);
  }
}

// ---- Disabled (applied by QChip when `disable` prop is set) ----
:deep(.ns-chip.disabled),
.ns-chip:disabled {
  background: var(--ns-color-bg-disabled);
  color: var(--ns-color-text-disabled);
  border-color: var(--ns-color-text-tertiary);
}
</style>
