<template>
  <section class="ns-plan-add-on" :aria-labelledby="titleId">
    <header class="ns-plan-add-on__header">
      <!-- toRaw: a category held in reactive state hands over a PROXY of the icon component, which Vue warns about. -->
      <component
        :is="toRaw(category.icon)"
        v-if="category.icon"
        :size="24"
        weight="regular"
        aria-hidden="true"
        class="ns-plan-add-on__icon"
      />
      <div class="ns-plan-add-on__details">
        <component :is="headingTag" :id="titleId" class="ns-plan-add-on__name ns-label-md">
          {{ category.name }}
        </component>
        <p v-if="category.description" class="ns-plan-add-on__description ns-body-sm">
          {{ category.description }}
        </p>
      </div>
    </header>

    <!-- role="list" restated for WebKit (list-style: none), as on every list in the library. -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-redundant-roles -->
    <ul class="ns-plan-add-on__options" role="list">
      <li
        v-for="option in category.options"
        :key="option.id"
        class="ns-plan-add-on__option"
        :class="{ 'ns-plan-add-on__option--added': option.added }"
      >
        <div class="ns-plan-add-on__option-main">
          <div class="ns-plan-add-on__option-details">
            <span :id="`${titleId}-${option.id}`" class="ns-plan-add-on__option-name ns-label-md">
              {{ option.name }}
            </span>
            <NsBadge v-if="option.added" class="ns-plan-add-on__added">
              <PhCheck :size="16" weight="regular" aria-hidden="true" />
              {{ locale.plan.added }}
            </NsBadge>
          </div>
          <p v-if="option.price" class="ns-plan-add-on__price">
            <span class="ns-plan-add-on__amount ns-label-md">{{ option.price }}</span>
            <span v-if="option.period" class="ns-plan-add-on__period ns-body-sm">
              {{ option.period }}
            </span>
          </p>
        </div>

        <div class="ns-plan-add-on__action">
          <NsButton
            v-if="option.added"
            variant="tertiary"
            :size="buttonSize"
            class="ns-plan-add-on__remove"
            :aria-describedby="`${titleId}-${option.id}`"
            @click="$emit('remove', option)"
          >
            <PhX :size="20" weight="regular" aria-hidden="true" />
            {{ locale.plan.remove }}
          </NsButton>
          <NsButton
            v-else
            variant="primary"
            :size="buttonSize"
            class="ns-plan-add-on__add"
            :aria-describedby="`${titleId}-${option.id}`"
            @click="$emit('add', option)"
          >
            {{ locale.plan.add }}
          </NsButton>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
/**
 * NsPlanAddOn — one add-on CATEGORY (the design's `NsAddOn`, variants
 * addOn × state × device, read from NsPlanBuilder 170:6802 via selection on
 * 2026-09-15): a surface-alt card with the category's icon, name and
 * description, then its priced OPTIONS one per row, rules between them.
 * Each option shows its name, an "Added" badge once added, its price with a
 * period, and one button — Add, or a remove once added. Internal to
 * NsPlanBuilder; the tabs above pick which category is shown.
 *
 * Desktop: an option is one row — details (flex 1) | price | button (md,
 * right). Mobile: details and price on one line, then the button full width
 * (lg) — the footer's pairing, decided by the builder and passed down.
 *
 * The design's instance carries placeholder copy for names and the remove
 * button ("Click Me", "Small label"), so those are chrome decisions here:
 * the remove is a tertiary button with an X and "Remove" from the locale.
 * (The design draws it in text-negative; there is no tertiary-negative
 * variant in NsButton — componentLibrary-ksg.)
 */
import { computed, toRaw, useId } from 'vue'
import { PhCheck, PhX } from '@phosphor-icons/vue'
import NsBadge from '../NsBadge/NsBadge.vue'
import NsButton from '../NsButton/NsButton.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import type { NsPlanAddOnCategory, NsPlanOption } from './types'

const props = withDefaults(
  defineProps<{
    category: NsPlanAddOnCategory
    buttonSize: 'md' | 'lg'
    /** The card name's heading level — two below the builder's title, clamped. */
    level?: number
  }>(),
  { level: 4 },
)

const headingTag = computed(() => `h${Math.min(6, Math.max(1, Math.round(props.level)))}`)

defineEmits<{
  add: [option: NsPlanOption]
  remove: [option: NsPlanOption]
}>()

const locale = useNsLocale()
const titleId = useId()
</script>

<style lang="scss" scoped>
.ns-plan-add-on {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-3);
  // 19 + 1px border = the design's 20 inset (the stroke takes no space in Figma).
  padding: calc(var(--ns-space-5) - 1px);
  border: 1px solid var(--ns-color-border-default);
  border-radius: var(--ns-radius-sm);
  background: var(--ns-color-bg-surface-alt);
  color: var(--ns-color-text-primary);

  &__header {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }

  &__icon {
    flex: 0 0 auto;
  }

  &__details {
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    gap: var(--ns-space-1);
    min-width: 0;
  }

  &__name,
  &__description {
    margin: 0;
  }

  &__description {
    color: var(--ns-color-text-secondary);
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  // A rule between options (the design's NsSeparator inside the card).
  &__option {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);

    & + & {
      padding-top: var(--ns-space-3);
      border-top: 1px solid var(--ns-color-border-default);
    }
  }

  &__option-main {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
  }

  &__option-details {
    display: flex;
    flex: 1 1 0;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ns-space-1);
    min-width: 0;
  }

  &__added {
    display: inline-flex;
    align-items: center;
    gap: var(--ns-space-1);
    padding: var(--ns-space-0) var(--ns-space-2);
    border-radius: var(--ns-radius-sm);
    background: var(--ns-color-bg-positive);
    color: var(--ns-color-text-on-bg-positive);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
  }

  &__price {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ns-space-1);
    margin: 0;
  }

  &__period {
    color: var(--ns-color-text-secondary);
  }

  &__action {
    display: flex;
    justify-content: flex-end;

    > * {
      flex: 1 1 auto;
    }
  }
}

@media (min-width: 1024px) {
  .ns-plan-add-on {
    &__option {
      flex-direction: row;
      align-items: center;
    }

    &__option-main {
      flex: 1 1 0;
      min-height: 42px; // the design's Add-On Details frame, like NsCombo's task text
    }

    &__action {
      flex: 0 0 auto;

      > * {
        flex: 0 0 auto;
      }
    }
  }
}
</style>
