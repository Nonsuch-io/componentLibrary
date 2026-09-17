<template>
  <section class="ns-base-summary" :aria-labelledby="titleId">
    <component :is="headingTag" :id="titleId" class="ns-base-summary__title ns-heading-md-regular">
      {{ title }}
    </component>
    <p v-if="subtitle?.trim()" class="ns-base-summary__subtitle ns-heading-sm">{{ subtitle }}</p>

    <div v-if="areas.length" class="ns-base-summary__areas" :style="areasStyle">
      <NsFeatureCard
        v-for="area in areas"
        :key="area.id"
        :area="area"
        :level="clampedLevel + 1"
        class="ns-base-summary__area"
      />
    </div>

    <NsBanner v-if="alert?.trim()" type="promo" class="ns-base-summary__alert">
      <div class="ns-base-summary__alert-row">
        <PhMegaphone
          :size="24"
          weight="regular"
          aria-hidden="true"
          class="ns-base-summary__alert-icon"
        />
        <p class="ns-base-summary__alert-text ns-heading-sm">{{ alert }}</p>
      </div>
    </NsBanner>
  </section>
</template>

<script setup lang="ts">
/**
 * NsBaseSummary — what every plan starts with: the base's product areas as
 * feature cards, and a callout (design `NsBaseSummary` 166:6346, read
 * 2026-09-16; componentLibrary-lrw.9, found by verifying u9z — it is NOT
 * NsOrderSummary's base, it is the "All plans start with the butiq Base"
 * card on Build Plan). ONE instance, 910 wide; no mobile frame.
 *
 * MEASURED: a surface-alt card with a 1px default border, radius 8, 20px
 * inset including the stroke, 12 between parts: the title ("Medium heading
 * regular" 20/400), a subtitle ("Small heading" 16/600 in brand), the
 * Product Areas row — NsPosFeatureCard 280 and NsInventoryFeatureCard 570,
 * 20 apart, 180 tall — and NsBannerMarketAlert, NsBanner's new `promo`
 * tone with a 24px megaphone and 16/600 brand text, 56 tall.
 *
 * The row's split is chrome: a card's share is its column count (the POS
 * card one column, inventory two → 283 / 567 of the 850, against the
 * design's 280 / 570). Below 1024 the cards stack and each flows one
 * column — INFERRED; the flow's mobile frame was not readable.
 *
 * CHROME ONLY: the copy, the areas, their features and tips are props; the
 * design's words are in the story. `alert` omitted → no callout.
 *
 * ACCESSIBILITY: a section named by the title (`level` 2 by default), each
 * area a section named by its own heading one level down, each feature
 * list a real list, and each tip a button named "More about {feature}"
 * that NsTooltip describes.
 */
import { computed, useId } from 'vue'
import { PhMegaphone } from '@phosphor-icons/vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsFeatureCard from './NsFeatureCard.vue'
import type { NsBaseSummaryArea } from './types'

export interface NsBaseSummaryProps {
  /** "All plans start with the butiq Base." */
  title: string
  /** "What's included in butiq's Base?" — brand, under the title. */
  subtitle?: string
  areas?: readonly NsBaseSummaryArea[]
  /** The callout's text; omitted → no callout. */
  alert?: string
  /** Heading level of the title. 2 by default; the areas take the next. Clamped 1–6. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsBaseSummaryProps>(), {
  subtitle: undefined,
  areas: () => [],
  alert: undefined,
  level: 2,
})

const titleId = useId()
const clampedLevel = computed(() => {
  const level = Number.isFinite(props.level) ? Math.round(props.level) : 2
  return Math.min(6, Math.max(1, level))
})
const headingTag = computed(() => `h${clampedLevel.value}`)

// A card's share of the desktop row is its column count, as `fr` tracks —
// fr shares OUTER widths, where `flex-basis: 0` would keep each card's
// padding and border outside the ratio (measured 297 / 553, not 283 / 567).
const areasStyle = computed(() => ({
  '--ns-base-summary-columns': props.areas.map((a) => `${a.columns === 2 ? 2 : 1}fr`).join(' '),
}))
</script>

<style lang="scss" scoped>
.ns-base-summary {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + the 1px border = the design's 20 inset (the stroke takes no space in Figma).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-default);
  border-radius: var(--ns-radius-sm);
  background: var(--ns-color-bg-surface-alt);
  color: var(--ns-color-text-primary);

  &__title,
  &__subtitle,
  &__alert-text {
    margin: 0;
  }

  // "Medium heading regular" is Fixel TEXT in the design; the global sheet's
  // h1–h6 rule would make this Display ().
  &__title {
    font-family: var(--ns-font-family-text);
  }

  &__subtitle {
    color: var(--ns-color-text-brand);
  }

  // Mobile first: the areas stack.
  &__areas {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-5);
  }

  &__alert-row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
  }

  &__alert-icon {
    flex: 0 0 auto;
  }

  &__alert-text {
    flex: 1 1 0;
    min-width: 0;
  }
}

// Desktop (166:6346): the areas in one row, each card's share its column count.
@media (min-width: 1024px) {
  .ns-base-summary__areas {
    display: grid;
    grid-template-columns: var(--ns-base-summary-columns, 1fr);
    align-items: stretch;
  }
}
</style>
