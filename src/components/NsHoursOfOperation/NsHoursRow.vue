<template>
  <div
    class="ns-hours-row"
    :class="{
      'ns-hours-row--first': isFirst,
      'ns-hours-row--last': isLast,
      'ns-hours-row--single': isSingle,
    }"
    role="group"
    :aria-label="fill(locale.hours.range, names)"
    :aria-describedby="describedBy"
  >
    <!--
      The day label is rendered on the FIRST row only and the column is kept
      on the others (desktop) so the time selects line up down the day. In the
      design every desktop row carries a 95px NsText; the later ones show a
      placeholder style rather than a word, which is a spacer by any other
      name. aria-hidden because the group's own name already says the day.
    -->
    <span class="ns-hours-row__day ns-heading-sm" aria-hidden="true">
      <template v-if="isFirst">{{ dayLabel }}</template>
    </span>

    <div class="ns-hours-row__times">
      <span ref="openWrap" class="ns-hours-row__select">
        <NsSelect
          :model-value="range.open"
          :options="options"
          emit-value
          map-options
          :disable="disable || closed"
          :aria-label="fill(locale.hours.opens, names)"
          :aria-invalid="error ? 'true' : undefined"
          @update:model-value="update('open', $event)"
        >
          <template #selected>
            <span :class="{ 'ns-hours-row__placeholder': range.open === null }">
              {{ labelFor(range.open) }}
            </span>
          </template>
        </NsSelect>
      </span>

      <span class="ns-hours-row__to ns-body-md" aria-hidden="true">{{ locale.hours.to }}</span>

      <span class="ns-hours-row__select">
        <NsSelect
          :model-value="range.close"
          :options="options"
          emit-value
          map-options
          :disable="disable || closed"
          :aria-label="fill(locale.hours.closes, names)"
          :aria-invalid="error ? 'true' : undefined"
          @update:model-value="update('close', $event)"
        >
          <template #selected>
            <span :class="{ 'ns-hours-row__placeholder': range.close === null }">
              {{ labelFor(range.close) }}
            </span>
          </template>
        </NsSelect>
      </span>

      <!-- Mobile: the remove button sits inline with the selects (2440:260515). -->
      <NsButton
        v-if="!isFirst"
        variant="tertiary"
        size="sm"
        icon-only
        class="ns-hours-row__remove ns-hours-row__remove--inline"
        :aria-label="fill(locale.hours.removeHours, names)"
        :disable="disable"
        @click="$emit('remove')"
      >
        <PhX :size="ICON_SIZE" weight="regular" />
      </NsButton>
    </div>

    <div class="ns-hours-row__actions">
      <!-- Desktop: the remove button lives in the actions column (2440:260512). -->
      <NsButton
        v-if="!isFirst"
        variant="tertiary"
        size="sm"
        icon-only
        class="ns-hours-row__remove ns-hours-row__remove--column"
        :aria-label="fill(locale.hours.removeHours, names)"
        :disable="disable"
        @click="$emit('remove')"
      >
        <PhX :size="ICON_SIZE" weight="regular" />
      </NsButton>

      <!--
        The Closed checkbox exists on a SINGLE-range day only. Once a day has
        more than one range the design's "Top Row of Multiple" drops it —
        you cannot be closed and have two ranges — and it returns when the
        day is back to one. The ranges are kept while closed (types.ts).
      -->
      <span v-if="isSingle" class="ns-hours-row__closed">
        <NsCheckbox
          :model-value="closed"
          :label="locale.hours.closed"
          :disable="disable"
          @update:model-value="$emit('update:closed', $event)"
        />
      </span>

      <NsButton
        v-if="isLast"
        ref="addEl"
        variant="secondary"
        :size="addSize"
        class="ns-hours-row__add"
        :aria-label="fill(locale.hours.addHoursFor, names)"
        :disable="disable || closed"
        @click="$emit('add')"
      >
        <PhPlus :size="ICON_SIZE" weight="regular" />
        {{ locale.hours.addHours }}
      </NsButton>
    </div>

    <p v-if="error" :id="errorId" class="ns-hours-row__error ns-body-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * NsHoursRow — one open–close range of one day. INTERNAL to
 * NsHoursOfOperation; not exported. It knows nothing about validity: the
 * only rule it enforces is the design's, that the first range of a day cannot
 * be removed (the day keeps at least one), and that is a shape rule, not a
 * business one.
 *
 * The design's four row types (Top Row, Top Row of Multiple, Middle Row,
 * Bottom Row — NsHoursRow 2440:260508–260515) are `index`/`count` arithmetic:
 *   single  = count 1              label | times | [Closed] [Add Hours]
 *   first   = index 0, count > 1   label | times |
 *   middle                         (col) | times | [X]
 *   last    = index count-1        (col) | times | [X]          [Add Hours]
 * Mobile stacks the three cells, drops the label after the first row, and
 * moves [X] inline with the selects. Both remove buttons are in the template
 * and CSS shows one per breakpoint; they share a name so a screen reader user
 * hears one control whichever is visible.
 */
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { PhPlus, PhX } from '@phosphor-icons/vue'
import NsSelect, { type NsSelectOption } from '../NsSelect/NsSelect.vue'
import NsCheckbox from '../NsCheckbox/NsCheckbox.vue'
import NsButton from '../NsButton/NsButton.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { fill } from './fill'
import type { NsHoursRange } from './types'

/**
 * 20px, the line box of a 14px button (componentLibrary-4l2); NsButton's own
 * icon rule sizes a `.q-icon`, but a Phosphor SVG in the default slot is not
 * one, so the size is given here.
 */
const ICON_SIZE = 20

const props = withDefaults(
  defineProps<{
    dayLabel: string
    index: number
    count: number
    range: NsHoursRange
    closed: boolean
    options: NsSelectOption[]
    disable?: boolean
    error?: string | null
    errorId: string
    /** Extra ids the group is described by (a day-level message). */
    describedByExtra?: string
    /** md on desktop, lg on mobile — the footer's pairing (2440:260508 / 260509). */
    addSize?: 'md' | 'lg'
  }>(),
  { disable: false, error: null, describedByExtra: undefined, addSize: 'md' },
)

const emit = defineEmits<{
  'update:range': [value: NsHoursRange]
  'update:closed': [value: boolean]
  add: []
  remove: []
}>()

const locale = useNsLocale()
const openWrap = ref<HTMLElement | null>(null)
const addEl = ref<ComponentPublicInstance | null>(null)

const isFirst = computed(() => props.index === 0)
const isLast = computed(() => props.index === props.count - 1)
const isSingle = computed(() => props.count === 1)

const names = computed(() => ({
  day: props.dayLabel,
  index: String(props.index + 1),
  count: String(props.count),
}))

const describedBy = computed(() => {
  const ids = [props.error ? props.errorId : null, props.describedByExtra ?? null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

function labelFor(value: string | null): string {
  if (value === null) return locale.hours.select
  // A stored value with no option (a 15-minute time against a 30-minute
  // grid, or a consumer's list that omits it) shows AS ITSELF rather than as
  // the placeholder: hiding a real value behind "Select" would invite the
  // user to overwrite it without knowing it was there.
  const found = props.options.find((o) => typeof o !== 'string' && o.value === value)
  return found && typeof found !== 'string' ? found.label : value
}

function update(field: 'open' | 'close', value: unknown) {
  // QSelect can hand back null on clear; anything else is one of our string values.
  const next = typeof value === 'string' ? value : null
  emit('update:range', { ...props.range, [field]: next })
}

/**
 * Focus targets for the parent's add/remove choreography. QSelect's focusable
 * element is the `.q-field__native` div with tabindex; NsSelect does not
 * expose `focus()`, so it is found by tabindex inside the open select's
 * wrapper — the one element there that takes focus.
 */
function focusOpen() {
  openWrap.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()
}

function focusAdd() {
  const el = addEl.value?.$el as HTMLElement | undefined
  el?.focus()
}

defineExpose({ focusOpen, focusAdd })
</script>

<style lang="scss" scoped>
// Mobile first (2440:260509 Top Row / Mobile, 310 wide): the three cells
// stack with an 8px gap; the label is a row of its own; the actions row is
// [Closed] [Add Hours lg] with a 20px gap.
.ns-hours-row {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-2);
  color: var(--ns-color-text-primary);

  &__day {
    display: block;
    min-height: 21px; // the 95x21 NsText; keeps the first row's rhythm when the label wraps

    // Mobile drops the label column after the first row (2440:260515 has no
    // NsText at all); desktop keeps it as an empty cell for alignment.
    .ns-hours-row:not(.ns-hours-row--first) > & {
      display: none;
    }
  }

  &__times {
    display: flex;
    align-items: center;
    gap: var(--ns-space-4); // 16 on mobile (2440:260526), 20 on desktop below
    min-width: 0;
  }

  &__select {
    flex: 1 1 0;
    min-width: 0;

    // The design's select is 50px tall (every NsSelect in 2440:260508–515);
    // Quasar's outlined field is 56. Set on the control AND the marginal
    // (the arrow column), which Quasar sizes separately.
    :deep(.q-field__control),
    :deep(.q-field__marginal) {
      height: 50px;
      min-height: 50px;
    }
    :deep(.q-field__native) {
      min-height: 0;
    }
  }

  &__placeholder {
    color: var(--ns-color-text-tertiary);
  }

  &__to {
    flex: 0 0 auto;
    color: var(--ns-color-text-secondary);
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--ns-space-5);

    // Nothing to show on the first-of-multiple row on mobile, and an empty
    // flex row still takes the gap — collapse it. (The design keeps a 44px
    // empty "Field Row" there; that is the variant system holding frame
    // heights, deliberately not reproduced. componentLibrary-f6b.)
    &:empty {
      display: none;
    }
  }

  &__closed {
    flex: 1 1 auto;
    min-width: 118px; // the checkbox Field Row (2440:260522)
  }

  &__add {
    flex: 0 0 auto;
  }

  // The column remove button is desktop's; the inline one is mobile's.
  &__remove--column {
    display: none;
  }

  &__error {
    margin: 0;
    color: var(--ns-color-text-negative);
  }
}

// Desktop / Tablet (2440:260508, 910 wide): 95px label | times | 263px actions,
// 24px gaps, 50px tall. 1024 rather than 600 because the row is 660 in the
// section instance and does not fit beside an app shell's navigation before
// the md breakpoint — the same reasoning as NsFormFooter.
@media (min-width: 1024px) {
  .ns-hours-row {
    display: grid;
    grid-template-columns: 95px minmax(0, 1fr) 263px;
    gap: var(--ns-space-6);
    align-items: center;
    min-height: 50px;

    &__day {
      // An empty 95px cell on the later rows: `display: none` would collapse
      // the grid track's content but the track stays 95px, so this is only
      // about keeping the rule symmetrical with mobile.
      .ns-hours-row:not(.ns-hours-row--first) > & {
        display: block;
      }
    }

    &__times {
      gap: 20px; // 2440:260517: selects at 0 and 279, "to" 14 wide at 245
    }

    &__remove--inline {
      display: none;
    }
    &__remove--column {
      display: inline-flex;
    }

    &__actions {
      // Bottom row: X at 0, Add Hours at 138 of 263 (2440:260551) — the
      // space between is what justify gives, not a fixed gap.
      .ns-hours-row--last:not(.ns-hours-row--single) > & {
        justify-content: space-between;
      }
    }

    &__error {
      grid-column: 2 / -1;
    }
  }
}
</style>
