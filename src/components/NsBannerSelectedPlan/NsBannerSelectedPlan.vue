<template>
  <article class="ns-banner-selected-plan" :aria-labelledby="nameId">
    <NsBanner type="brand" class="ns-banner-selected-plan__banner">
      <div class="ns-banner-selected-plan__body">
        <NsPlanHeader
          :heading-id="nameId"
          class="ns-banner-selected-plan__header"
          :name="name"
          :price="price"
          :period="period"
          :level="level"
          size="md"
        />

        <NsPlanHighlights
          v-if="highlights.length"
          :highlights="highlights"
          :label="locale.plan.highlights"
        />

        <NsPlanFeatures
          v-if="features.length"
          :features="features"
          :label="locale.plan.features"
          class="ns-banner-selected-plan__features"
        />

        <div v-if="actionLabel?.trim()" class="ns-banner-selected-plan__actions">
          <NsButton
            variant="secondary"
            size="md"
            class="ns-banner-selected-plan__action"
            :aria-describedby="nameId"
            @click="$emit('change')"
          >
            {{ actionLabel }}
          </NsButton>
        </div>
      </div>
    </NsBanner>
  </article>
</template>

<script setup lang="ts">
/**
 * NsBannerSelectedPlan — the plan the customer has chosen, restated on the
 * order summary (design `NsBannerSelectedPlan` 2440:278611, inside
 * NsOrderSummary 185:10182; componentLibrary-rbe.1). Read 2026-09-16 via
 * Kale's selection: ONE instance, 342 wide, Desktop/Tablet the only device
 * variant — there is no mobile frame, so the column below simply narrows.
 *
 * NsCombo's shape one step smaller on NsBanner's `brand` surface: the name
 * and price (NsPlanHeader `md`), the highlights, the features, and one
 * SECONDARY action, "Change Plan" in the design — the words are the
 * consumer's (`actionLabel`), the click is an emit (`change`). Everything
 * shown is a display string handed in; what the plan costs and what
 * changing it does are butiq's (componentLibrary-jas).
 *
 * MEASURED: bg-app-header with a 1px primary-subtle border and radius 8 (the
 * banner's brand tone), 16px inset including the stroke, 20px between the
 * parts; the header row 29 tall; highlights 14/400 secondary; features
 * 14/400 in TEXT-PRIMARY here where NsCombo's are secondary — the surface's
 * text colour, set on the banner and inherited; the action row 36 tall with
 * the md button at the right (114 wide for "Change Plan").
 *
 * ACCESSIBILITY: an <article> named by the plan's name (a heading, `level`
 * 3 by default: it sits under the order summary's title), and the button is
 * described by it, as NsCombo's is.
 */
import { useId } from 'vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsPlanHeader from '../NsPlanHeader/NsPlanHeader.vue'
import NsPlanHighlights from '../NsPlanHighlights/NsPlanHighlights.vue'
import NsPlanFeatures from '../NsPlanFeatures/NsPlanFeatures.vue'
import { useNsLocale } from '../../composables/useNsLocale'

export interface NsBannerSelectedPlanProps {
  /** "butiq Base + Add-Ons". */
  name: string
  /** Formatted by the consumer — "$133". Omitted → no price. */
  price?: string
  /** "/mo" — the consumer's words. */
  period?: string
  /** "Billed monthly on the 13th", "Cancel anytime" — shown with pipes between. */
  highlights?: readonly string[]
  /** "butiq Base $99/mo", one per line with a check. */
  features?: readonly string[]
  /** "Change Plan"; omitted → no button. */
  actionLabel?: string
  /** Heading level of the name. 3 by default. Clamped 1–6 by NsPlanHeader. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

withDefaults(defineProps<NsBannerSelectedPlanProps>(), {
  price: undefined,
  period: undefined,
  highlights: () => [],
  features: () => [],
  actionLabel: undefined,
  level: 3,
})

defineEmits<{ change: [] }>()

const locale = useNsLocale()
const nameId = useId()
</script>

<style lang="scss" scoped>
.ns-banner-selected-plan {
  &__body {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-5);
  }

  // The features take the surface's text colour (2440:278621 draws them in
  // text-primary; NsPlanFeatures' own default is secondary, NsCombo's card).
  &__features {
    color: inherit;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
