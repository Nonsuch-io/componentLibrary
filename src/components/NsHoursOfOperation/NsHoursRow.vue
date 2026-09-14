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
            <span
              class="ns-hours-row__value"
              :class="{ 'ns-hours-row__placeholder': range.open === null }"
            >
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
            <span
              class="ns-hours-row__value"
              :class="{ 'ns-hours-row__placeholder': range.close === null }"
            >
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
        <PhX :size="REMOVE_ICON_SIZE" weight="regular" />
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
        <PhX :size="REMOVE_ICON_SIZE" weight="regular" />
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
import { fill } from '../../locale/fill'
import type { NsHoursRange } from './types'

/**
 * Phosphor SVGs in a button's default slot are not `.q-icon`s, so NsButton's
 * per-size icon rule (componentLibrary-4l2) does not reach them and the size
 * is given here. Add Hours is md/lg — a 20px icon sits inside either line box
 * (20 / 21). The X is `sm` icon-only with a 16px icon: an icon-only button
 * has no text, so its content is the SVG and it renders 8 + 16 + 8 = 32 —
 * the design's 32 exactly (2440:260552), with no new button size. MEASURED
 * in Chromium; an earlier comment reasoned "33" from the 17px line box, and
 * review measured 36 when the X carried the 20px icon. An icon-only button
 * is as tall as its icon plus padding, whatever the line box says.
 */
const ICON_SIZE = 20
const REMOVE_ICON_SIZE = 16

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
    // 95 is the design's column and not every label fits it: "Wednesdays" in
    // Fixel is 96 and bleeds 1px into the gap; French names wrap to two lines
    // inside the 50px row. Both measured in review, both invisible in use.

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

    // DELIBERATE DEVIATION on mobile rows that carry the inline X. The design
    // (2440:260515) gives those selects 108px, and 108 minus Quasar's 16px
    // side padding and the arrow leaves ~52px for the value — narrower than
    // "11:30 p.m.", the widest label en-CA produces. Measured in review: two
    // lines inside the 50px control. An 8px gap and 8px side padding give
    // the value ~74px. The first row (no X, 132px selects) keeps the design's
    // 16 / 16.
    .ns-hours-row:not(.ns-hours-row--first) > & {
      gap: var(--ns-space-2);

      :deep(.q-field__control) {
        padding: 0 var(--ns-space-2);
      }
    }
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
    :deep(.q-field__control) {
      padding: 0 var(--ns-space-4); // the design's selector: px 16 (6283:19919)
    }
    :deep(.q-field__native) {
      min-height: 0;
    }
  }

  &__placeholder {
    color: var(--ns-color-text-tertiary);
  }

  // A time is one line or it is wrong. Review measured "11:30 p.m." wrapping
  // to two lines inside a 50px control on the mobile row that carries an X;
  // nowrap makes an overflow a measurable overflow instead of a quiet stack.
  &__value {
    white-space: nowrap;
  }

  &__to {
    flex: 0 0 auto;
    color: var(--ns-color-text-secondary);
  }

  &__actions {
    // Mobile: the actions row exists on the LAST row of a day only (Closed +
    // Add on a single row, Add on the bottom of a split day). A middle row's
    // actions div holds only the desktop X, which is hidden here — an earlier
    // `:empty` rule missed it (a hidden child is not empty) and review
    // measured a phantom 8px gap under every middle row. The design's empty
    // 44px "Field Row" on those variants is the variant system holding frame
    // heights and is deliberately not reproduced (componentLibrary-f6b).
    display: none;
    flex-wrap: wrap; // French "Ajouter des heures" does not fit beside Closed in 310px
    align-items: center;
    gap: var(--ns-space-5);

    .ns-hours-row--last > & {
      display: flex;
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
    grid-column: 1 / -1;
    // The tracks are NsHoursOfOperation's — 95px | 1fr | minmax(263px,
    // max-content) — inherited through subgrid so every row across every day
    // shares one actions column. 263 is the design's, and it is EXACTLY
    // Closed (118) + 20 + Add Hours (125) in en-CA — zero slack. max-content
    // lets it grow for a longer language (fr-CA's "Ajouter des heures" is
    // 179 wide; review measured it 54px past the row at a fixed 263), and
    // sizing it ONCE at the editor is what keeps a split day's rows aligned
    // with a single day's (review measured 263 vs 317 when each row sized
    // its own). The times cell, the flexible one, gives the space up.
    grid-template-columns: subgrid;
    // Without subgrid (Chrome < 117, Safari < 16, Firefox < 71 — below the
    // library's Baseline-widely-available floor) the declaration above is
    // dropped and the row would render as a single-column stack. Fall back
    // to the row sizing its own tracks: the design's numbers in English,
    // and in French a split day misaligned with a single day — the defect
    // subgrid exists to fix, which is still a working editor. `@supports
    // not` rather than a duplicate declaration, so a minifier cannot fold it.
    @supports not (grid-template-columns: subgrid) {
      grid-template-columns: 95px minmax(0, 1fr) minmax(263px, max-content);
    }
    // Restated: the mobile `gap` above would override the inherited one.
    column-gap: var(--ns-space-6);
    // The error row: INFERRED, the design has no error state for this row.
    // 8 rather than the column gap's 24, which is what a `gap` shorthand
    // would have given it (review measured the message 24px under the field).
    row-gap: var(--ns-space-2);
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

      // Same selector as the mobile deviation above, so it wins here.
      .ns-hours-row:not(.ns-hours-row--first) > & {
        gap: 20px;

        :deep(.q-field__control) {
          padding: 0 var(--ns-space-4);
        }
      }
    }

    &__remove--inline {
      display: none;
    }
    &__remove--column {
      display: inline-flex;
    }

    &__actions {
      display: flex;
      flex-wrap: nowrap;

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
