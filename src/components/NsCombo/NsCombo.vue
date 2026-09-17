<template>
  <article class="ns-combo" :aria-labelledby="nameId">
    <p v-if="bestFor?.trim()" class="ns-combo__best-for ns-overline">{{ bestFor }}</p>

    <NsPlanHeader
      :heading-id="nameId"
      class="ns-combo__header"
      :name="name"
      :price="price"
      :period="period"
      :level="level"
    />

    <NsPlanHighlights
      v-if="highlights.length"
      :highlights="highlights"
      :label="locale.plan.highlights"
    />

    <NsPlanFeatures v-if="features.length" :features="features" :label="locale.plan.features" />

    <div v-if="actionLabel?.trim()" class="ns-combo__actions">
      <NsButton
        variant="primary"
        :size="isDesktop ? 'md' : 'lg'"
        class="ns-combo__action"
        :aria-describedby="nameId"
        @click="$emit('select')"
      >
        {{ actionLabel }}
      </NsButton>
    </div>
  </article>
</template>

<script setup lang="ts">
/**
 * NsCombo — one pre-built plan offered as a whole: a "best for" overline, a
 * name with its price, the modules it bundles, the features it includes,
 * and one call to action (design `NsCombo`, componentLibrary-lrw.5; measured
 * 2026-09-15 on 178:9614 at 350 and inside NsChooseACombo 170:7387 at 870).
 *
 * CHROME ONLY (componentLibrary-jas): everything shown is a prop handed in
 * by the consumer — the price already formatted, the module names, the
 * feature lines, the button's words — and choosing the plan is an emit.
 * Which combos exist, what they cost and what selecting one does are butiq's.
 *
 * MEASURED: a surface-alt card with a 1px default border, radius 8 (the
 * design's `radius-sm`, --ns-radius-sm since 56l aligned the names),
 * 20px padding INCLUDING the stroke (so 19 + 1 here), 12px between parts.
 * Parts, top to bottom: overline ("Overline label small", 12/500/18, brand,
 * uppercase — the ramp's `.ns-overline`, corrected to this node);
 * NsPlanHeader; NsPlanHighlights; NsPlanFeatures; Actions. The card is 275
 * tall at 870 with three features, 382 at 350 where the name and the
 * highlights wrap. The action is a primary button — md, right-aligned on
 * desktop (I170:7391;6260:11234); lg and full width on mobile (I178:9614;
 * 6263:7165, 310x45), the footer's pairing, chosen by the same media query
 * the stylesheet uses (useNsIsDesktop).
 *
 * ACCESSIBILITY: an <article> named by the plan's name (a heading, `level`
 * 3 by default so it sits under NsChooseACombo's title), and the button is
 * described by it — several combos on a page each have a "Continue With
 * This Plan", and the description is what tells them apart.
 */
import { useId } from 'vue'
import NsButton from '../NsButton/NsButton.vue'
import NsPlanHeader from '../NsPlanHeader/NsPlanHeader.vue'
import NsPlanHighlights from '../NsPlanHighlights/NsPlanHighlights.vue'
import NsPlanFeatures from '../NsPlanFeatures/NsPlanFeatures.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { useNsIsDesktop } from '../../composables/useNsIsDesktop'

export interface NsComboProps {
  /** The overline — "Best For: Sellers with one physical location". Rendered uppercase. */
  bestFor?: string
  name: string
  /** Formatted by the consumer — "$133". */
  price?: string
  /** "/mo" — the consumer's words. */
  period?: string
  /** The bundled modules, shown pipe-separated. */
  highlights?: readonly string[]
  /** What the plan includes, one per line with a check. */
  features?: readonly string[]
  /** The call to action; omitted → no button. */
  actionLabel?: string
  /** Heading level of the plan name. Clamped 1–6. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

withDefaults(defineProps<NsComboProps>(), {
  bestFor: undefined,
  price: undefined,
  period: undefined,
  highlights: () => [],
  features: () => [],
  actionLabel: undefined,
  level: 3,
})

defineEmits<{ select: [] }>()

const locale = useNsLocale()
const nameId = useId()
const isDesktop = useNsIsDesktop()
</script>

<style lang="scss" scoped>
.ns-combo {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + the 1px border = the design's 20px inset (a Figma stroke takes no
  // layout space; a CSS border does — NsChecklistBanner measured 1176
  // against 1178 with the padding at face value).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-default);
  border-radius: var(--ns-radius-sm);
  background: var(--ns-color-bg-surface-alt);
  color: var(--ns-color-text-primary);

  &__best-for {
    margin: 0;
    color: var(--ns-color-text-brand);
  }

  // Mobile (I178:9614;6263:7165): the action fills the row.
  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__action {
    flex: 1 1 auto;
  }
}

// Desktop (I170:7391;6260:11234): right-aligned at content width.
@media (min-width: 1024px) {
  .ns-combo__action {
    flex: 0 0 auto;
  }
}
</style>
