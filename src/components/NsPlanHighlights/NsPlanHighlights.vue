<template>
  <ul v-if="items.length" class="ns-plan-highlights ns-body-md" :aria-label="label">
    <li v-for="(item, i) in items" :key="i" class="ns-plan-highlights__item">{{ item }}</li>
  </ul>
</template>

<script setup lang="ts">
/**
 * NsPlanHighlights — the plan's included modules as a wrapping, pipe-
 * separated line: "butiq Basic | Inventory Management | NFC Payments"
 * (design `NsPlanHighlights`, I170:7391;6260:11286, measured 2026-09-15:
 * "Medium body text", 8px gaps, wraps to two lines at 310). The pipes are
 * CSS, not content, so a screen reader hears a list of items and not a run
 * of bars; the list carries `label` as its accessible name. Blank items
 * are dropped rather than rendered as an empty slot between two pipes.
 */
import { computed } from 'vue'

export interface NsPlanHighlightsProps {
  highlights: readonly string[]
  /** Accessible name of the list — "Included modules". */
  label?: string
}

const props = withDefaults(defineProps<NsPlanHighlightsProps>(), { label: undefined })

const items = computed(() => props.highlights.map((h) => h.trim()).filter(Boolean))
</script>

<style lang="scss" scoped>
.ns-plan-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ns-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ns-color-text-primary);

  &__item {
    display: flex;
    gap: var(--ns-space-2);

    // The separator lives on the item AFTER it, so a wrapped line never
    // starts with a bare pipe and the last item never trails one.
    & + &::before {
      content: '|';
    }
  }
}
</style>
