<template>
  <section
    class="ns-feature-card"
    :class="`ns-feature-card--${columns}`"
    :aria-labelledby="titleId"
  >
    <header class="ns-feature-card__header">
      <!-- toRaw: an area held in reactive state hands over a PROXY of the icon component. -->
      <component
        :is="toRaw(area.icon)"
        v-if="area.icon"
        :size="24"
        weight="regular"
        aria-hidden="true"
        class="ns-feature-card__icon"
      />
      <component :is="headingTag" :id="titleId" class="ns-feature-card__title ns-heading-sm">
        {{ area.title }}
      </component>
    </header>

    <!-- role="list" restated for WebKit (list-style: none), as on every list in the library. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ul class="ns-feature-card__features ns-body-md" role="list">
      <li v-for="feature in area.features" :key="feature.id" class="ns-feature-card__feature">
        <span class="ns-feature-card__text">{{ feature.text }}</span>
        <button
          v-if="feature.tooltip"
          type="button"
          class="ns-feature-card__tip"
          :aria-label="fill(locale.baseSummary.moreAbout, { feature: feature.text })"
          @click="tips.get(feature.id)?.toggle()"
        >
          <PhInfo :size="16" weight="regular" aria-hidden="true" />
          <NsTooltip :ref="(el) => setTip(feature.id, el)">{{ feature.tooltip }}</NsTooltip>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * NsFeatureCard — one product area of the base plan (the design's
 * NsPosFeatureCard 2440:236254 and NsInventoryFeatureCard 2440:236267, read
 * 2026-09-16 inside NsBaseSummary 166:6346): a bordered card with an icon
 * and a title, then the area's features as a bulleted list, some with an
 * info tip. Internal to NsBaseSummary, as NsPlanAddOn is to NsPlanBuilder.
 *
 * MEASURED: 1px border-primary, radius 8, 20px inset including the stroke,
 * 12 between the header and the list; the header a 24px icon and a 16/600
 * text-secondary title, 8 apart; features 14/400 with a bullet at a 21px
 * indent, 8 between rows; a tip is a 16px info icon 8 after the text. The
 * inventory card flows its seven features into TWO columns 20 apart — ONE
 * list here (it is one list: "Inventory Management, list, 7 items") in CSS
 * columns, which balance by HEIGHT: the design's 3 | 4 split is not
 * hand-placed, it is what balances the one feature that wraps to two
 * lines ("250 inventory items with unlimited stock count", 94 | 102). A
 * grid flowing down-then-across put it 4 | 3 and cost the card 20px.
 *
 * The tip is a BUTTON so a keyboard reaches it; NsTooltip names it as the
 * button's description, shows on focus and hover, and hides on Escape. Its
 * accessible name is "More about {feature}" from the locale. A CLICK or
 * TAP toggles it too: review read QTooltip's touch path as press-and-hold,
 * so a tap on iOS (no focus, no hover) showed nothing — the button now
 * drives the tooltip it holds.
 */
import { computed, toRaw, useId, type ComponentPublicInstance } from 'vue'
import { PhInfo } from '@phosphor-icons/vue'
import NsTooltip from '../NsTooltip/NsTooltip.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { fill } from '../../locale/fill'
import type { NsBaseSummaryArea } from './types'

const props = withDefaults(
  defineProps<{
    area: NsBaseSummaryArea
    /** The title's heading level — one below the summary's title, clamped. */
    level?: number
  }>(),
  { level: 3 },
)

const locale = useNsLocale()
const titleId = useId()
const columns = computed(() => (props.area.columns === 2 ? 2 : 1))

// One tooltip instance per feature, by id (a v-for ref array is unordered).
type TipInstance = { toggle: () => void }
const tips = new Map<string, TipInstance>()
function setTip(id: string, el: Element | ComponentPublicInstance | null) {
  if (el && 'toggle' in el) tips.set(id, el as unknown as TipInstance)
  else tips.delete(id)
}
const headingTag = computed(() => `h${Math.min(6, Math.max(1, Math.round(props.level)))}`)
</script>

<style lang="scss" scoped>
.ns-feature-card {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  box-sizing: border-box;
  min-width: 0;
  // 19 + the 1px border = the design's 20 inset (the stroke takes no space in Figma).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-primary);
  border-radius: var(--ns-radius-md);
  color: var(--ns-color-text-primary);

  &__header {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
  }

  &__icon {
    flex: 0 0 auto;
    color: var(--ns-color-text-secondary);
  }

  // The design's "Small heading" is Fixel TEXT; the global sheet gives every
  // h1–h6 Fixel Display, which is wider and wrapped "Core POS & Check Out
  // Tools" at the design's width ().
  &__title {
    flex: 1 1 0;
    min-width: 0;
    margin: 0;
    font-family: var(--ns-font-family-text);
    color: var(--ns-color-text-secondary);
  }

  &__features {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // The design's bullet: its NsText's list marker, a dot with the text at
  // a 21px indent — drawn here (13px dot column + the 8px gap) so it
  // survives `list-style: none`, which WebKit needs the role for.
  &__feature {
    display: flex;
    align-items: center;
    gap: var(--ns-space-2);
    min-width: 0;

    &::before {
      content: '·';
      flex: 0 0 13px;
      text-align: center;
    }
  }

  &__text {
    min-width: 0;
  }

  // A 24px hit area around the 16px icon at no layout cost (2.5.8).
  &__tip {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    padding: var(--ns-space-1);
    margin: calc(-1 * var(--ns-space-1));
    border: 0;
    border-radius: var(--ns-radius-sm);
    background: transparent;
    color: var(--ns-color-text-primary);
    cursor: help;

    &:focus-visible {
      outline: 2px solid var(--ns-color-border-focus);
      outline-offset: 2px;
    }
  }
}

// Desktop: the two-column card balances its list across two columns; the
// 8px row gap becomes a margin, which multi-column keeps.
@media (min-width: 1024px) {
  .ns-feature-card--2 .ns-feature-card__features {
    display: block;
    column-count: 2;
    column-gap: var(--ns-space-5);
  }

  .ns-feature-card--2 .ns-feature-card__feature {
    break-inside: avoid;
    margin-bottom: var(--ns-space-2);

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
