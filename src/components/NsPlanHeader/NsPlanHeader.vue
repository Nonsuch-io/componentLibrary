<template>
  <div class="ns-plan-header" :class="`ns-plan-header--${size}`">
    <component
      :is="headingTag"
      :id="headingId"
      class="ns-plan-header__name"
      :class="size === 'md' ? 'ns-heading-md' : 'ns-heading-lg'"
    >
      {{ name }}
    </component>
    <p v-if="price" class="ns-plan-header__price">
      <span
        class="ns-plan-header__amount"
        :class="size === 'md' ? 'ns-heading-lg' : 'ns-heading-xl'"
      >
        {{ price }}
      </span>
      <span
        v-if="period"
        class="ns-plan-header__period"
        :class="size === 'md' ? 'ns-heading-sm-regular' : 'ns-heading-md-regular'"
      >
        {{ period }}
      </span>
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
 * Shared by NsCombo and NsBannerSelectedPlan.
 *
 * `size`: `lg` is the row above; `md` is one step down, the SELECTED plan's
 * row on NsBannerSelectedPlan (2440:278614, measured 2026-09-16 via
 * selection): name "Medium heading" 20/600, price "Large heading" 24/600 in
 * TEXT-PRIMARY rather than brand — it sits on the brand surface already —
 * with its period "Small heading regular" 16/400, 8px apart and bottom-
 * aligned. The colour rides on the size because the size IS that surface:
 * the design has no small brand-coloured price anywhere.
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
  /** `lg` (default) — the combo card's row; `md` — the selected-plan banner's, one step smaller. */
  size?: 'lg' | 'md'
}

const props = withDefaults(defineProps<NsPlanHeaderProps>(), {
  price: undefined,
  period: undefined,
  level: 3,
  headingId: undefined,
  size: 'lg',
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

  // md (2440:278614): the design's row is justify-between with the details
  // FLUSH against the heading frame (222 + 88 = the 310 inside the banner),
  // so the gap here is the 4px minimum that keeps a long name off the price
  // rather than the lg row's 12 — at 12 the design's own copy wrapped at 342.
  &--md {
    justify-content: space-between;
    gap: var(--ns-space-1);
  }

  // 8px between amount and period, bottom-aligned, in the surrounding text
  // colour (2440:278617).
  &--md &__price {
    align-items: flex-end;
    gap: var(--ns-space-2);
    color: inherit;
  }
}
</style>
