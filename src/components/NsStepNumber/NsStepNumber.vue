<template>
  <span
    class="ns-step-number"
    :class="[`ns-step-number--${size}`, `ns-step-number--${state}`]"
    aria-hidden="true"
  >
    <PhCheck v-if="state === 'complete'" :size="checkSize" weight="regular" />
    <template v-else>{{ number }}</template>
  </span>
</template>

<script setup lang="ts">
/**
 * NsStepNumber — the design's `NsStepNumber` (2440:237124 Completed/Number,
 * 2440:237126 Not Completed, 2440:237128 Complete/Check, 2440:237127 the
 * 20px Not Completed): a circle that says where a step stands.
 *
 *   complete  brand fill, white check (20px icon in the 28 circle)
 *   current   brand fill, white number — the design calls this "Completed"
 *   upcoming  surface fill, brand border, brand number
 *
 * Two sizes, measured: 28 (the stepper; 14/600 number) and 20 (the
 * checklist banner; 12/600 number). DECORATION, `aria-hidden` always: the
 * number is the position in an <ol> and the state is what the parent says
 * in text or with aria-current. Used by NsOnboardingStepper and
 * NsChecklistBanner.
 */
import { computed } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'

export type NsStepNumberState = 'complete' | 'current' | 'upcoming'

export interface NsStepNumberProps {
  number: number | string
  state?: NsStepNumberState
  size?: 20 | 28
}

const props = withDefaults(defineProps<NsStepNumberProps>(), { state: 'upcoming', size: 28 })

// The 28 circle carries a 20px check (2440:237134); the 20 circle a 14.
const checkSize = computed(() => (props.size === 28 ? 20 : 14))
</script>

<style lang="scss" scoped>
.ns-step-number {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid var(--ns-color-border-primary);
  border-radius: var(--ns-radius-full);
  font-family: var(--ns-font-family-text);
  font-weight: 600;
  line-height: 1;

  &--28 {
    width: 28px;
    height: 28px;
    font-size: 0.875rem;
  }

  &--20 {
    width: 20px;
    height: 20px;
    font-size: 0.75rem;
  }

  &--upcoming {
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-text-brand);
  }

  &--current,
  &--complete {
    background: var(--ns-color-bg-primary);
    color: var(--ns-color-text-on-brand);
  }
}
</style>
