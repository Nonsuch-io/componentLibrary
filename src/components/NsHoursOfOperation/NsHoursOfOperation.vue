<template>
  <div
    v-bind="attrsWithoutDisabled"
    class="ns-hours-of-operation"
    :class="{ 'ns-hours-of-operation--disabled': resolvedDisable }"
    role="group"
    :aria-label="label"
    :aria-disabled="resolvedDisable || undefined"
  >
    <div v-for="key in days" :key="key" class="ns-hours-of-operation__day">
      <NsHoursRow
        v-for="(range, index) in value[key].ranges"
        :key="index"
        :ref="(el) => setRowRef(key, index, el)"
        :day-label="dayLabel(key)"
        :index="index"
        :count="value[key].ranges.length"
        :range="range"
        :closed="value[key].closed"
        :options="resolvedOptions"
        :disable="resolvedDisable"
        :error="rangeError(key, index)"
        :error-id="`${baseId}-${key}-${index}-error`"
        :described-by-extra="dayError(key) ? `${baseId}-${key}-error` : undefined"
        :add-size="addSize"
        @update:range="setRange(key, index, $event)"
        @update:closed="setClosed(key, $event)"
        @add="addRange(key)"
        @remove="removeRange(key, index)"
      />
      <p
        v-if="dayError(key)"
        :id="`${baseId}-${key}-error`"
        class="ns-hours-of-operation__error ns-body-sm"
      >
        {{ dayError(key) }}
      </p>
    </div>

    <div class="ns-hours-of-operation__live" aria-live="polite" aria-atomic="true">
      {{ announcement }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * NsHoursOfOperation — a weekly hours editor: one or more open–close ranges
 * per day, a Closed toggle, add and remove. The largest component in the
 * Sign Up / Onboarding flow (componentLibrary-f6b), found nested inside
 * NsFormSectionOnboardingShopHours 198:21794.
 *
 * WHAT THIS COMPONENT DOES NOT DO, by contract with butiq (types.ts): it does
 * not validate. It never compares open to close, never rejects an overnight
 * span, never reorders or merges ranges, never knows a timezone. Errors come
 * IN through `errors` and are shown beside the range they name. The one
 * shape rule it keeps — every day has at least one range — is the design's
 * (the first row of a day has no remove button) and is enforced by never
 * emitting an empty array, not by rejecting one: a value handed in with an
 * empty `ranges` renders no rows for that day and warns in dev.
 *
 * A value missing a day named in `days` is FILLED for rendering, and the
 * fill is what goes out: the first edit to ANY day emits a value carrying
 * every day in `days`, including the ones the caller never had. That is the
 * shape the caller asked to edit, and butiq's seven-key BusinessHours meets
 * it on the first keystroke — documented here because a one-key record
 * silently becoming an eight-key one is the kind of thing that surprises.
 *
 * MEASURED (componentLibrary-f6b, 2026-09-14): the design's default instance
 * is a column at a 20px gap of EIGHT days — Mondays through Sundays and
 * Holidays — each an NsHoursDay of one or more NsHoursRow at a 12px gap. The
 * per-row geometry is in NsHoursRow.vue. One instance has a separator after
 * Mondays only; sample size 1, not reproduced until a second instance shows
 * it is a pattern rather than an artefact.
 *
 * KEYBOARD AND SCREEN READER. Each range is a `role="group"` named
 * "{day}, hours {n} of {m}"; each select is named "Opens, …" / "Closes, …"
 * with the same suffix, so a control's name says where it is without the
 * group. Add focuses the new row's open select; Remove focuses the day's Add
 * Hours button (always present on the last row, and never the thing the
 * user just pressed — focusing the next remove button would make a second
 * Enter remove another range). Both are announced through a polite live
 * region, serialised the same way as NsImageUpload's.
 *
 * `label` is REQUIRED and is the group's accessible name; it is not rendered.
 * The design's instance sits inside an NsFormSection whose title is the
 * visible heading, and this component must not render a second one.
 */
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  toRaw,
  useId,
  watch,
  type ComponentPublicInstance,
} from 'vue'

import NsHoursRow from './NsHoursRow.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { useNsDisabled } from '../../composables/useNsDisabled'
import { fill } from './fill'
import {
  NS_HOURS_DAY_KEYS,
  createNsHoursDay,
  createNsHoursOfOperationValue,
  createNsHoursRange,
  nsHoursTimeOptions,
  type NsHoursDayKey,
  type NsHoursOfOperationErrors,
  type NsHoursOfOperationValue,
  type NsHoursRange,
  type NsHoursTimeOption,
} from './types'

// Same declaration as useNsAttrConflictWarning: the one string every bundler defines.
declare const process: { env: { NODE_ENV?: string } } | undefined

export interface NsHoursOfOperationProps {
  /** Accessible name of the editor. Not rendered — the enclosing section carries the visible title. */
  label: string
  /** v-model. Omitted → every day open with one empty range (`createNsHoursOfOperationValue()`). */
  modelValue?: NsHoursOfOperationValue
  /** Which days to show, in order. Defaults to all eight, Mondays first, Holidays last. */
  days?: readonly NsHoursDayKey[]
  /** The pick-list. Defaults to every 30 minutes from 00:00, labelled by `Intl` for `localeTag`. */
  options?: NsHoursTimeOption[]
  /** BCP 47 tag for the default option labels only; ignored when `options` is given. */
  localeTag?: string
  /** Messages from the consumer's rules — a string per day, or one per range. Never produced here. */
  errors?: NsHoursOfOperationErrors
  /** Disable every control. */
  disable?: boolean
}

const props = withDefaults(defineProps<NsHoursOfOperationProps>(), {
  modelValue: undefined,
  days: () => NS_HOURS_DAY_KEYS,
  options: undefined,
  localeTag: 'en-CA',
  errors: () => ({}),
  disable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: NsHoursOfOperationValue]
}>()

defineOptions({ inheritAttrs: false })

const locale = useNsLocale()
const baseId = useId()
const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled(
  'NsHoursOfOperation',
  () => props.disable,
)

/**
 * Uncontrolled fallback so an omitted v-model still edits, and emits a full
 * value on first change. `== null` throughout, not `=== undefined`: a store
 * that defaults the field to `null` is controlled-by-nothing in exactly the
 * same way, and review found the two checks disagreeing — an edit was
 * emitted, never written to the fallback, and reverted on the next render.
 */
const fallback = ref<NsHoursOfOperationValue>(createNsHoursOfOperationValue())
const isUncontrolled = () => props.modelValue == null

// A controlled instance that becomes uncontrolled keeps the last value it was
// given rather than snapping back to the initial default — the React
// controlled→uncontrolled trap, closed at the boundary instead of warned about.
watch(
  () => props.modelValue,
  (next, previous) => {
    if (next == null && previous != null) fallback.value = toRaw(previous)
  },
)

/**
 * Every day named in `days` exists here, whatever the caller handed over.
 * A value missing a key (butiq's existing BusinessHours has seven days and
 * no `holidays`) would otherwise read `.ranges` of undefined in the template
 * — a crash, where every other contract slip in this component is a quiet
 * no-op and a dev warning. Missing days render open with one empty range and
 * are reported by the same warning as empty ones. Untouched days keep their
 * identity: the spread copies references, not objects.
 */
const value = computed<NsHoursOfOperationValue>(() => {
  const source = props.modelValue ?? fallback.value
  let out = source
  for (const key of props.days) {
    // `?.ranges` and Array.isArray, not a truthiness check on the day: a day
    // object with no `ranges` (a partial update from a backend) passed the
    // first version of this guard and crashed the dev warning one line down.
    if (Array.isArray(source[key]?.ranges)) continue
    if (out === source) out = { ...source }
    out[key] = createNsHoursDay()
  }
  return out
})

const resolvedOptions = computed(() => props.options ?? nsHoursTimeOptions(30, props.localeTag))

/**
 * md on desktop, lg on mobile — the footer's pairing, decided here because
 * the rows are ours. Read from the SAME media query the stylesheet switches
 * on, so the button size and the layout cannot disagree; `$q.screen` was
 * tried first and lagged the viewport in the story runner (measured: md
 * rendered inside a 320px iframe), which is a disagreement of exactly that
 * kind. Desktop until mounted — the shape a server render should carry —
 * then whatever the query says.
 */
const DESKTOP_QUERY = '(min-width: 1024px)'
const isDesktop = ref(true)
let mediaQuery: MediaQueryList | null = null
const onMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
  isDesktop.value = e.matches
}
onMounted(() => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  mediaQuery = window.matchMedia(DESKTOP_QUERY)
  onMediaChange(mediaQuery)
  mediaQuery.addEventListener('change', onMediaChange)
})
onBeforeUnmount(() => mediaQuery?.removeEventListener('change', onMediaChange))
const addSize = computed<'md' | 'lg'>(() => (isDesktop.value ? 'md' : 'lg'))

/** `hours.dayMonday` etc. — flat keys, because locale sections are one level deep by convention. */
function dayLabel(key: NsHoursDayKey): string {
  return locale.hours[`day${key.charAt(0).toUpperCase()}${key.slice(1)}` as DayLabelKey]
}
type DayLabelKey = `day${Capitalize<NsHoursDayKey>}`

function dayError(key: NsHoursDayKey): string | null {
  const e = props.errors[key]
  return typeof e === 'string' && e.trim() ? e : null
}

function rangeError(key: NsHoursDayKey, index: number): string | null {
  const e = props.errors[key]
  if (!Array.isArray(e)) return null
  const message = e[index]
  return typeof message === 'string' && message.trim() ? message : null
}

// ---- Mutation: always a NEW value, never a mutation of the prop ----

function commit(next: NsHoursOfOperationValue) {
  if (isUncontrolled()) fallback.value = next
  emit('update:modelValue', next)
}

function withDay(
  key: NsHoursDayKey,
  patch: (day: NsHoursOfOperationValue[NsHoursDayKey]) => NsHoursOfOperationValue[NsHoursDayKey],
): NsHoursOfOperationValue {
  // Each day through toRaw, so the untouched ones go out as the consumer's
  // own objects rather than reactive proxies of them: a consumer diffing by
  // identity then sees exactly one day change, which is what happened. Per
  // day, not on the whole: `value` may be a normalised copy holding proxies.
  const current = Object.fromEntries(
    Object.entries(value.value).map(([k, day]) => [k, toRaw(day)]),
  ) as NsHoursOfOperationValue
  return { ...current, [key]: patch(current[key]) }
}

function setRange(key: NsHoursDayKey, index: number, range: NsHoursRange) {
  commit(
    withDay(key, (day) => ({
      ...day,
      ranges: day.ranges.map((r, i) => (i === index ? range : r)),
    })),
  )
}

function setClosed(key: NsHoursDayKey, closed: boolean) {
  commit(withDay(key, (day) => ({ ...day, closed })))
}

async function addRange(key: NsHoursDayKey) {
  const count = value.value[key].ranges.length + 1
  commit(withDay(key, (day) => ({ ...day, ranges: [...day.ranges, createNsHoursRange()] })))
  await nextTick()
  rows.get(rowKey(key, count - 1))?.focusOpen()
  void announce(
    fill(locale.hours.hoursAdded, {
      day: dayLabel(key),
      index: String(count),
      count: String(count),
    }),
  )
}

async function removeRange(key: NsHoursDayKey, index: number) {
  // The first range is not removable by design (no button), and this guard
  // is what keeps `ranges.length >= 1` true even if a caller reaches in.
  if (index === 0 || value.value[key].ranges.length <= 1) return
  const remaining = value.value[key].ranges.length - 1
  commit(withDay(key, (day) => ({ ...day, ranges: day.ranges.filter((_, i) => i !== index) })))
  await nextTick()
  rows.get(rowKey(key, remaining - 1))?.focusAdd()
  void announce(fill(locale.hours.hoursRemoved, { day: dayLabel(key), count: String(remaining) }))
}

// ---- Row refs, for the focus choreography ----

type RowInstance = ComponentPublicInstance & { focusOpen: () => void; focusAdd: () => void }
const rows = new Map<string, RowInstance>()
const rowKey = (key: NsHoursDayKey, index: number) => `${key}:${index}`

function setRowRef(
  key: NsHoursDayKey,
  index: number,
  el: Element | ComponentPublicInstance | null,
) {
  if (el) rows.set(rowKey(key, index), el as RowInstance)
  else rows.delete(rowKey(key, index))
}

// ---- Live region, serialised (NsImageUpload has the measurements) ----

const announcement = ref('')
let announcing: Promise<void> = Promise.resolve()

function announce(text: string): Promise<void> {
  const run = async () => {
    announcement.value = ''
    await nextTick()
    announcement.value = text
    await nextTick()
  }
  announcing = announcing.then(run, run)
  return announcing
}

// ---- Dev warning: a day with no ranges is a contract violation upstream ----

if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warned = false
  watch(
    () => {
      const source = props.modelValue ?? fallback.value
      return props.days.filter((key) => !(source[key]?.ranges?.length > 0))
    },
    (bad) => {
      if (warned || bad.length === 0) return
      warned = true
      console.warn(
        `[NsHoursOfOperation] ${bad.join(', ')}: missing from the value, or \`ranges\` is ` +
          'empty. Every day named in `days` must be present with at least one range ' +
          '(types.ts). A missing day is shown as open with one empty range; an empty one ' +
          'renders no rows, so the user cannot add hours to it. Start days from ' +
          '`createNsHoursDay()` and the whole value from `createNsHoursOfOperationValue()`.',
      )
    },
    { immediate: true },
  )
}
</script>

<style lang="scss" scoped>
// Column of days at a 20px gap (6290:11757); rows within a day at 12
// (NsHoursDay 2440:260577).
.ns-hours-of-operation {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-5);

  &__day {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
  }

  // Desktop: ONE grid for the whole editor, days and rows as subgrids, so the
  // three columns are sized once across every row. Each row used to be its
  // own grid, and when the actions track was allowed to grow for French,
  // review measured a split day's rows at 263 and a single day's at 317 —
  // the selects no longer lined up down the form. The track widths live
  // here; NsHoursRow declares `subgrid` and inherits them. `position:
  // relative` so the live region's absolute box stays inside the editor.
  @media (min-width: 1024px) {
    position: relative;
    display: grid;
    grid-template-columns: 95px minmax(0, 1fr) minmax(263px, max-content);
    column-gap: var(--ns-space-6);
    row-gap: var(--ns-space-5);

    &__day {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      // A subgrid's own gap overrides the inherited one, and the mobile
      // block above sets a `gap` shorthand here — restate the column gap.
      column-gap: var(--ns-space-6);
      row-gap: var(--ns-space-3);
    }

    &__error {
      grid-column: 2 / -1;
    }
  }

  &__error {
    margin: 0;
    color: var(--ns-color-text-negative);
  }

  // Visually hidden, not display:none — a hidden live region is a silent one.
  &__live {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
