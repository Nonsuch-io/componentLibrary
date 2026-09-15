<template>
  <ul v-if="items.length" class="ns-plan-features ns-body-md" :aria-label="label">
    <li v-for="(item, i) in items" :key="i" class="ns-plan-features__item">
      <span>{{ item }}</span>
      <PhCheck :size="16" weight="regular" aria-hidden="true" class="ns-plan-features__check" />
    </li>
  </ul>
</template>

<script setup lang="ts">
/**
 * NsPlanFeatures — what a plan includes, one line each with a check after
 * the text (design `NsPlanFeatures`, I170:7391;6260:11287, measured
 * 2026-09-15: "Medium body text" in text-secondary, a 16px Phosphor Check
 * at a 4px gap, 8px between rows). The check is decoration: every listed
 * feature is included, so the list's name says so and the icon says it
 * again to the eye only. Blank items are dropped.
 */
import { computed } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'

export interface NsPlanFeaturesProps {
  features: readonly string[]
  /** Accessible name of the list — "Included features". */
  label?: string
}

const props = withDefaults(defineProps<NsPlanFeaturesProps>(), { label: undefined })

const items = computed(() => props.features.map((f) => f.trim()).filter(Boolean))
</script>

<style lang="scss" scoped>
.ns-plan-features {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ns-color-text-secondary);

  &__item {
    display: flex;
    align-items: center;
    gap: var(--ns-space-1);
  }

  &__check {
    flex: 0 0 auto;
  }
}
</style>
