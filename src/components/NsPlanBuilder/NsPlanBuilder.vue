<template>
  <NsPlanSelectionCard :title="title" :level="level" class="ns-plan-builder">
    <!--
      The design's root IS the selection card (170:6802's NsCard, 910 wide
      with 870 inside) — the same card "Option 2" sits in. The builder
      renders in it rather than leaving the card to the consumer, so both
      options line up. (This comment sits INSIDE the root: one before it
      would make the template a fragment.)
    -->
    <!-- The base plan: a brand surface (NsBannerbutiqBase, 2361:191348). -->
    <NsBanner type="brand" class="ns-plan-builder__base">
      <div class="ns-plan-builder__base-row">
        <span class="ns-plan-builder__base-name">{{ base.name }}</span>
        <span v-if="base.price" class="ns-plan-builder__base-details">
          <span class="ns-plan-builder__base-price">{{ base.price }}</span>
          <span v-if="base.period" class="ns-plan-builder__base-period">{{ base.period }}</span>
          <span v-if="base.note" class="ns-plan-builder__base-note">{{ base.note }}</span>
        </span>
      </div>
    </NsBanner>

    <NsSeparator />

    <h3 class="ns-plan-builder__add-ons-title ns-heading-sm">
      {{ addOnsLabel ?? locale.plan.chooseAddOns }}
    </h3>

    <div class="ns-plan-builder__add-ons">
      <NsTabs
        v-if="categories.length > 1"
        :model-value="active?.id"
        dense
        align="left"
        no-caps
        class="ns-plan-builder__tabs"
        @update:model-value="setCategory"
      >
        <NsTab
          v-for="c in categories"
          :key="c.id"
          :name="c.id"
          :icon="c.icon && toRaw(c.icon)"
          :aria-controls="`${panelId}-${c.id}`"
        >
          {{ c.label }}
        </NsTab>
      </NsTabs>

      <NsPlanAddOn
        v-if="active"
        :id="`${panelId}-${active.id}`"
        :category="active"
        :button-size="buttonSize"
        @add="$emit('add', $event, active)"
        @remove="$emit('remove', $event, active)"
      />
    </div>

    <NsSeparator />

    <!-- The total: an accent surface (NsBannerPlanTotal, 2361:191733). -->
    <NsBanner type="accent" class="ns-plan-builder__total">
      <div :id="totalId" class="ns-plan-builder__total-row">
        <div class="ns-plan-builder__total-heading">
          <span class="ns-plan-builder__total-label ns-overline">{{ locale.plan.total }}</span>
          <span class="ns-plan-builder__total-price">
            <span class="ns-plan-builder__total-amount ns-heading-xl">{{ total.price }}</span>
            <span v-if="total.period" class="ns-plan-builder__total-period ns-heading-sm-regular">
              {{ total.period }}
            </span>
          </span>
        </div>
        <p v-if="total.note" class="ns-plan-builder__total-note ns-heading-sm">{{ total.note }}</p>
      </div>
    </NsBanner>

    <div v-if="actionLabel?.trim()" class="ns-plan-builder__actions">
      <NsButton
        variant="primary"
        :size="buttonSize"
        class="ns-plan-builder__action"
        :aria-describedby="actionDescribedBy"
        @click="$emit('select')"
      >
        {{ actionLabel }}
      </NsButton>
    </div>
  </NsPlanSelectionCard>
</template>

<script setup lang="ts">
/**
 * NsPlanBuilder — build a plan from a base and add-ons (design
 * `NsPlanBuilder`, 170:6802 at 910x743 and 177:7123 at 350x938, read via
 * selection on 2026-09-15; componentLibrary-lrw.6.2). One column at both
 * widths: heading, the base plan on a brand surface, a rule, "Choose
 * Add-Ons", the category tabs and the active category's card, a rule, the
 * total on an accent surface, the action. The reflow lives inside the
 * add-on card (337 → 531) and the base banner's type sizes, not here.
 *
 * CHROME OURS, RULES THEIRS (componentLibrary-jas). The bead said not to
 * build to the "running total" inference; the frame has one, NsBannerPlanTotal,
 * and what the frame cannot say is whether it SUMS. It does not: `total`
 * is a formatted string the consumer computed, like NsCombo's price; every
 * price here is display text; add and remove are EMITTED with the option
 * and its category and nothing changes until the consumer changes it.
 * Which category is shown is a v-model (`category`) with an uncontrolled
 * fallback to the first.
 *
 * `level` is the card title's heading level (2 by default). MEASURED: base
 * banner 61 desktop / 53 mobile (name 24/600 → 16/600, price
 * 24/600 → 16/600, period 16 → 14, note 20/600 → 16/600); total banner 91
 * at both ("Your Total" overline small, XL price, 16/400 period; the note
 * 16/600 to the right on desktop); tabs 217x36 (dense, icons); action md
 * right-aligned / lg full width. The two banners are the library's NsBanner
 * with its new `brand` and `accent` surface tones, because the design draws
 * them as frames NAMED NsBanner with no shared variant — Kale's call.
 */
import { computed, ref, toRaw, useId, watch } from 'vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsSeparator from '../NsSeparator/NsSeparator.vue'
import NsPlanSelectionCard from '../NsPlanSelectionCard/NsPlanSelectionCard.vue'
import NsTabs from '../NsTabs/NsTabs.vue'
import NsTab from '../NsTab/NsTab.vue'
import NsPlanAddOn from './NsPlanAddOn.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { useNsIsDesktop } from '../../composables/useNsIsDesktop'
import type { NsPlanAddOnCategory, NsPlanBase, NsPlanOption, NsPlanTotal } from './types'

export interface NsPlanBuilderProps {
  /** "Option 1: Build Your Plan". */
  title: string
  base: NsPlanBase
  categories: readonly NsPlanAddOnCategory[]
  /**
   * v-model:category — the active category's id. Omitted → the first,
   * toggling on its own. An id not in `categories` shows the first WITHOUT
   * emitting — the model is yours to fix; healing it from here would be an
   * unsolicited write that can loop with a parent that normalises.
   */
  category?: string
  total: NsPlanTotal
  /** "Choose Add-Ons"; from the locale by default. */
  addOnsLabel?: string
  /** "Continue With This Plan"; omitted → no button. */
  actionLabel?: string
  /** Heading level of the card's title. 2 by default; clamped 1–6 by the card. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(defineProps<NsPlanBuilderProps>(), {
  category: undefined,
  addOnsLabel: undefined,
  actionLabel: undefined,
  level: 2,
})

const emit = defineEmits<{
  'update:category': [id: string]
  add: [option: NsPlanOption, category: NsPlanAddOnCategory]
  remove: [option: NsPlanOption, category: NsPlanAddOnCategory]
  select: []
}>()

const locale = useNsLocale()
const panelId = useId()
// The action is described by the TOTAL rather than the card's title: with
// two selection cards on a page, "Continue With This Plan" next to "$114
// /mo" is the description that tells them apart.
const totalId = useId()
const actionDescribedBy = totalId
const isDesktop = useNsIsDesktop()
const buttonSize = computed<'md' | 'lg'>(() => (isDesktop.value ? 'md' : 'lg'))

const fallbackCategory = ref<string | undefined>(props.categories[0]?.id)
watch(
  () => props.category,
  (next, previous) => {
    if (next == null && previous != null) fallbackCategory.value = previous
  },
)
const activeId = computed(() => props.category ?? fallbackCategory.value)
// The RESOLVED category, which is what both the tabs and the card show: an
// unknown or stale id (a consumer filtered its categories, or a typo) falls
// back to the first. Review found the tabs bound to the raw id — no tab
// selected while the card showed the first category.
const active = computed(
  () => props.categories.find((c) => c.id === activeId.value) ?? props.categories[0] ?? undefined,
)

function setCategory(id: unknown) {
  if (typeof id !== 'string') return
  // Always written, even while controlled: `activeId` prefers the prop, and
  // the watch above re-seeds this from the last controlled value when the
  // parent releases control, so a guard here decided nothing — review
  // removed one and every test stayed green. What a tab click does while
  // controlled is emit and wait for the parent.
  fallbackCategory.value = id
  emit('update:category', id)
}
</script>

<style lang="scss" scoped>
.ns-plan-builder {
  &__add-ons-title,
  &__total-note {
    margin: 0;
  }

  // Base banner (2361:191349 mobile / 191348 desktop): name left, details
  // right, one row at both widths; only the type sizes change.
  &__base-row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }

  &__base-name {
    flex: 1 1 0;
    min-width: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &__base-details {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ns-space-2);
  }

  &__base-price,
  &__base-note {
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
  }

  &__base-period {
    font-size: 0.875rem;
    line-height: 1.4;
  }

  &__add-ons {
    display: flex;
    flex-direction: column;
    gap: 10px; // NsTabs 36 at y=0, NsAddOn at y=46 (I170:6802;6260:9491)
  }

  // The design's tab (I2440:373512;6231:12413) is icon BESIDE label, 36
  // tall; Quasar stacks a component icon above the label and grows to 53.
  // Quasar 2.x internals — revisit on a major bump.
  &__tabs {
    align-self: flex-start;

    :deep(.q-tab) {
      min-height: 36px;
      padding: 0 var(--ns-space-4);
    }

    :deep(.q-tab__content) {
      flex-direction: row;
      align-items: center;
      gap: var(--ns-space-2);
      min-height: 36px;
    }

    :deep(.q-tab__icon) {
      margin: 0;
    }
  }

  // Total banner (2361:191734 mobile / 191733 desktop): heading left, the
  // note beside it; on mobile the note stacks under.
  &__total-row {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
  }

  &__total-heading {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: var(--ns-space-1);
    min-width: 0;
  }

  &__total-price {
    display: flex;
    align-items: baseline;
    gap: var(--ns-space-1);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
  }

  &__action {
    flex: 1 1 auto;
  }
}

@media (min-width: 1024px) {
  .ns-plan-builder {
    &__base-name,
    &__base-price {
      font-size: 1.5rem;
      line-height: 1.2;
    }

    &__base-note {
      font-size: 1.25rem;
      line-height: 1.25;
    }

    &__base-period {
      font-size: 1rem;
      line-height: 1.3;
    }

    &__total-row {
      flex-direction: row;
      align-items: center;
      gap: var(--ns-space-5);
    }

    &__total-note {
      flex: 0 0 auto;
    }

    &__action {
      flex: 0 0 auto;
    }
  }
}
</style>
