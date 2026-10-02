<template>
  <div
    v-bind="$attrs"
    :class="['ns-banner', `ns-banner--${type}`]"
    :role="ariaRole"
    :aria-live="ariaLive"
  >
    <component
      :is="iconComponent"
      v-if="iconComponent"
      :size="20"
      class="ns-banner__icon"
      aria-hidden="true"
    />

    <div class="ns-banner__content">
      <slot />
    </div>

    <div v-if="$slots.action" class="ns-banner__action">
      <slot name="action" />
    </div>

    <button
      v-if="removable"
      class="ns-banner__remove"
      :aria-label="removeLabel"
      @click="$emit('remove')"
    >
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        <path
          d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { PhCheckCircle, PhInfo, PhXCircle, PhWarning, PhMegaphoneSimple } from '@phosphor-icons/vue'

export type NsBannerType =
  | 'positive'
  | 'info'
  | 'negative'
  | 'warning'
  | 'neutral'
  | 'attention'
  | 'accent'

export interface NsBannerProps {
  /** Semantic type controlling colour and icon */
  type?: NsBannerType
  /** Show a dismiss button — emits `remove` when clicked */
  removable?: boolean
  /** Aria label for the dismiss button */
  removeLabel?: string
}

const props = withDefaults(defineProps<NsBannerProps>(), {
  type: 'info',
  removable: false,
  removeLabel: 'Dismiss',
})

defineEmits<{ remove: [] }>()

const iconMap: Partial<Record<NsBannerType, object>> = {
  positive: PhCheckCircle,
  info: PhInfo,
  negative: PhXCircle,
  warning: PhWarning,
  attention: PhMegaphoneSimple,
}

const iconComponent = computed(() => iconMap[props.type] ?? null)

const ariaRole = computed(() =>
  props.type === 'negative' || props.type === 'warning' ? 'alert' : 'status',
)
const ariaLive = computed(() =>
  props.type === 'negative' || props.type === 'warning' ? 'assertive' : 'polite',
)
</script>

<style lang="scss" scoped>
// ---- Base ----
.ns-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--ns-radius-md);
  border: 1px solid transparent;
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 1.4;
  color: var(--ns-color-text-primary);
  width: 100%;
}

.ns-banner__icon {
  flex-shrink: 0;
}

.ns-banner__content {
  flex: 1;
  min-width: 0;
}

.ns-banner__action {
  flex-shrink: 0;
}

.ns-banner__remove {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--ns-color-text-primary);
  border-radius: var(--ns-radius-sm);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }
}

// ---- Types ----
.ns-banner--positive {
  background: var(--ns-color-bg-positive);
  border-color: var(--ns-color-border-positive);

  .ns-banner__icon {
    color: var(--ns-color-border-positive);
  }
}

.ns-banner--info {
  background: var(--ns-color-bg-info);
  border-color: var(--ns-color-border-info);

  .ns-banner__icon {
    color: var(--ns-color-border-info);
  }
}

.ns-banner--negative {
  background: var(--ns-color-bg-negative);
  border-color: var(--ns-color-border-negative);

  .ns-banner__icon {
    color: var(--ns-color-border-negative);
  }
}

.ns-banner--warning {
  background: var(--ns-color-bg-warning);
  border-color: var(--ns-color-border-warning);

  .ns-banner__icon {
    color: var(--ns-color-border-warning);
  }
}

.ns-banner--neutral {
  background: var(--ns-color-bg-app-header);
  border-color: var(--ns-color-border-primary-subtle);
}

.ns-banner--attention {
  background: var(--ns-color-bg-primary-subtle);
  border-color: var(--ns-color-border-primary);

  .ns-banner__icon {
    color: var(--ns-color-text-brand);
  }
}

.ns-banner--accent {
  background: var(--ns-color-bg-accent);
  border: none;
}
</style>
