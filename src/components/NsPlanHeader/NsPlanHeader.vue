<template>
  <div class="ns-plan-header">
    <component :is="headingTag" :id="headingId" class="ns-plan-header__name ns-heading-lg">
      {{ name }}
    </component>
    <p v-if="price" class="ns-plan-header__price">
      <span class="ns-plan-header__amount ns-heading-xl">{{ price }}</span>
      <span v-if="period" class="ns-plan-header__period ns-heading-md-regular">{{ period }}</span>
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * NsPlanHeader — a plan's name and price on one line that wraps to two
 * (design `NsPlanHeader`, I170:7391;6260:11164, measured 2026-09-15 inside
 * NsCombo): the name is "Large heading" and takes the room; the price is
 * "XL heading" in brand with its period in "Medium heading regular", 12px
 * apart; the row is 37 tall at 870 and 107 at 310, where the name wraps and
 * the price drops beneath it.
 *
 * `price` and `period` are DISPLAY strings ("$133", "/mo"). Formatting money
 * is a rule — currency, locale, tax inclusion — and it is butiq's; this
 * renders what it is handed (componentLibrary-lrw.5, the chrome/rules split).
 * Shared by NsCombo and, next, NsPlanBuilder.
 */
import { computed } from 'vue'

export interface NsPlanHeaderProps {
  name: string
  /** Formatted by the consumer — "$133". Omitted → no price row. */
  price?: string
  /** "/mo", "/yr" — the consumer's words. */
  period?: string
  /** Heading level of the name. 3 by default: a plan sits under a section title. Clamped 1–6. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Id for the heading, so a parent can be `aria-labelledby` the NAME rather than the whole row. */
  headingId?: string
}

const props = withDefaults(defineProps<NsPlanHeaderProps>(), {
  price: undefined,
  period: undefined,
  level: 3,
  headingId: undefined,
})

const headingTag = computed(() => {
  const level = Number.isFinite(props.level) ? Math.round(props.level) : 3
  return `h${Math.min(6, Math.max(1, level))}`
})
</script>

<style lang="scss" scoped>
.ns-plan-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ns-space-3);
  color: var(--ns-color-text-primary);

  &__name {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }

  &__price {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ns-space-3);
    margin: 0;
    color: var(--ns-color-text-brand);
  }
}
</style>
