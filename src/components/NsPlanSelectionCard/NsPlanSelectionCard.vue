<template>
  <section class="ns-plan-selection-card" :aria-labelledby="titleId">
    <component
      :is="headingTag"
      :id="titleId"
      class="ns-plan-selection-card__title ns-heading-md-regular"
    >
      {{ title }}
    </component>
    <slot />
  </section>
</template>

<script setup lang="ts">
/**
 * NsPlanSelectionCard — the titled surface card each plan-selection option
 * sits in. The design draws it twice as an `NsCard` frame with identical
 * tokens and only the heading and contents differing: "Option 1: Build Your
 * Plan" around NsPlanBuilder (170:6802) and "Option 2: Choose a Combo"
 * around an NsCombo (NsChooseACombo, 170:7387). One piece of chrome, so one
 * component; NsPlanBuilder renders inside it and NsChooseACombo is this
 * card with an NsCombo in the slot (componentLibrary-lrw.6.3).
 *
 * MEASURED (get_variable_defs on both, 2026-09-15): bg-surface, 1px
 * color-border-subtle, radius-md = 12 (--ns-radius-md, since 56l aligned
 * the names with the design's), padding 20
 * including the stroke, 12px between the heading and the contents; the
 * heading is "Medium heading regular" 20/400/25. 910 wide at desktop with
 * 870 inside; 350 at mobile with 310 inside.
 */
import { computed, useId } from 'vue'

export interface NsPlanSelectionCardProps {
  /** "Option 2: Choose a Combo" — the consumer's words. */
  title: string
  /** Heading level. 2 by default: the options sit under the page's h1. Clamped 1–6. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsPlanSelectionCardProps>(), { level: 2 })

const titleId = useId()
const headingTag = computed(() => {
  const level = Number.isFinite(props.level) ? Math.round(props.level) : 2
  return `h${Math.min(6, Math.max(1, level))}`
})
</script>

<style lang="scss" scoped>
.ns-plan-selection-card {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + the 1px border = the design's 20 inset (a Figma stroke takes no layout space).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-subtle);
  border-radius: var(--ns-radius-md);
  background: var(--ns-color-bg-surface);
  color: var(--ns-color-text-primary);

  &__title {
    margin: 0;
  }
}
</style>
