import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { provide, ref } from 'vue'
import NsHoursOfOperation from './NsHoursOfOperation.vue'
import NsFormSection from '../NsFormSection/NsFormSection.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'
import {
  createNsHoursOfOperationValue,
  type NsHoursOfOperationErrors,
  type NsHoursOfOperationValue,
} from './types'

const meta: Meta<typeof NsHoursOfOperation> = {
  title: 'Components/NsHoursOfOperation',
  component: NsHoursOfOperation,
  tags: ['autodocs'],
  args: { label: 'Hours of operation' },
}

export default meta
type Story = StoryObj<typeof meta>

const withTwoOnMonday = (): NsHoursOfOperationValue => {
  const v = createNsHoursOfOperationValue()
  v.monday = {
    closed: false,
    ranges: [
      { open: '09:00', close: '12:00' },
      { open: '13:00', close: '17:30' },
    ],
  }
  v.sunday = { closed: true, ranges: [{ open: null, close: null }] }
  return v
}

const withThreeOnMonday = (): NsHoursOfOperationValue => {
  const v = withTwoOnMonday()
  v.monday.ranges = [
    { open: '09:00', close: '11:30' },
    { open: '13:30', close: '17:30' },
    { open: '19:00', close: '23:30' },
  ]
  return v
}

/**
 * Fixel is loaded asynchronously and the layout stories pin widths that
 * depend on it ("Add Hours" is 125px in Fixel and 127.56 in the fallback,
 * which moves the bottom row's button off 138). Review ran the desktop story
 * ALONE and it failed; it had only ever passed because six stories ran first.
 */
const fontsReady = () => document.fonts.ready

const controlled = (
  initial: NsHoursOfOperationValue = createNsHoursOfOperationValue(),
  extra = '',
) => ({
  components: { NsHoursOfOperation },
  setup: () => ({ value: ref(initial) }),
  template: `<div style="max-width: 910px"><NsHoursOfOperation v-model="value" label="Hours of operation" ${extra} /></div>`,
})

/** The design's default instance: eight days, one empty range each. */
export const Default: Story = { render: () => controlled() }

/** Mondays split into two ranges (a lunch break); Sundays closed. */
export const SplitAndClosed: Story = { render: () => controlled(withTwoOnMonday()) }

/**
 * THE CONTRACT MADE VISIBLE: 22:00–02:00 renders with NO error. The overnight
 * rule is butiq's (types.ts); the component shows only what `errors` hands
 * it, and here nothing is handed.
 */
export const OvernightSpanIsNotAnError: Story = {
  render: () => {
    const v = createNsHoursOfOperationValue()
    v.friday = { closed: false, ranges: [{ open: '22:00', close: '02:00' }] }
    return controlled(v)
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[aria-invalid="true"]')).toBeNull()
    await expect(canvasElement.querySelectorAll('.ns-hours-row__error').length).toBe(0)
  },
}

/** Errors IN: a day-level message and a per-range message, from the consumer's rules. */
export const WithErrors: Story = {
  render: () => ({
    components: { NsHoursOfOperation },
    setup: () => {
      const errors: NsHoursOfOperationErrors = {
        monday: [null, 'This range overlaps the one before it'],
        tuesday: 'Choose an opening and a closing time',
      }
      return { value: ref(withTwoOnMonday()), errors }
    },
    template: `<div style="max-width: 910px"><NsHoursOfOperation v-model="value" label="Hours of operation" :errors="errors" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    if (window.innerWidth < 1024) return
    // A per-range message sits 8px under its field (INFERRED — no design
    // error row), not the 24 a `gap` shorthand gave it before review.
    const row = canvasElement.querySelectorAll<HTMLElement>('.ns-hours-row')[1]
    const control = row.querySelector('.q-field__control') as HTMLElement
    const error = row.querySelector('.ns-hours-row__error') as HTMLElement
    await expect(error.getBoundingClientRect().top - control.getBoundingClientRect().bottom).toBe(8)
  },
}

/**
 * FRENCH FITS. "Ajouter des heures" is 179px (md) / 201px (lg) against
 * "Add Hours" at 125 / 139, and the design's 263px actions column is exactly
 * Closed + gap + Add Hours in English — zero slack. Review measured the French
 * button 54px past the desktop row and 29px past a 310px phone. The desktop
 * track now grows and the mobile actions wrap; this pins the button inside
 * the row in both.
 */
const french = (width: string) => ({
  components: { NsHoursOfOperation },
  setup: () => {
    provide(NsLocaleKey, nsLocaleFrCA)
    return { value: ref(withTwoOnMonday()) }
  },
  template: `<div style="width: ${width}"><NsHoursOfOperation v-model="value" label="Heures d'ouverture" :days="['monday', 'tuesday']" /></div>`,
})

const frenchFits = async (canvasElement: HTMLElement) => {
  await fontsReady()
  const root = canvasElement.querySelector('.ns-hours-of-operation') as HTMLElement
  const right = root.getBoundingClientRect().right
  for (const row of canvasElement.querySelectorAll<HTMLElement>('.ns-hours-row')) {
    await expect(row.getBoundingClientRect().right).toBeLessThanOrEqual(right)
    for (const el of row.querySelectorAll<HTMLElement>(
      '.ns-hours-row__add, .ns-hours-row__closed',
    )) {
      await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(right + 0.5)
    }
  }
  await expect(canvasElement.querySelector('.ns-hours-row__add')!.textContent).toContain(
    'Ajouter des heures',
  )
}

export const FrenchFitsOnDesktop: Story = {
  render: () => french('910px'),
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    await frenchFits(canvasElement)
  },
}

export const FrenchFitsOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => french('310px'),
  play: async ({ canvasElement }) => {
    await expect(window.innerWidth).toBeLessThan(1024)
    await frenchFits(canvasElement)
  },
}

export const Disabled: Story = {
  render: () => controlled(withTwoOnMonday(), 'disable'),
}

/** As the design places it: inside NsFormSection, under the "don't display" checkbox. */
export const InsideAFormSection: Story = {
  render: () => ({
    components: { NsHoursOfOperation, NsFormSection },
    setup: () => ({ value: ref(createNsHoursOfOperationValue()) }),
    template: `
      <NsFormSection title="Shop hours" style="max-width: 700px">
        <NsHoursOfOperation v-model="value" label="Hours of operation" :days="['monday', 'tuesday', 'wednesday']" />
      </NsFormSection>
    `,
  }),
}

/**
 * DESKTOP GEOMETRY IS REAL — measured against NsHoursRow 2440:260508 (Top Row,
 * Desktop/Tablet, 910x50) and 2440:260512 (Bottom Row). jsdom loads no
 * stylesheet, so only Chromium can see whether the grid, the 50px select or
 * the 263px actions column exist at all. Rendered at the design's 910.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: () => controlled(withTwoOnMonday(), ":days=\"['monday', 'tuesday']\""),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    await expect(document.fonts.check('600 14px "Fixel Text"')).toBe(true)
    const rows = canvasElement.querySelectorAll<HTMLElement>('.ns-hours-row')
    await expect(rows.length).toBe(3)

    const single = rows[2] // Tuesdays, one range
    const rect = single.getBoundingClientRect()
    await expect(rect.width).toBe(910)
    await expect(rect.height).toBe(50)

    // 95px label | 24 | times | 24 | 263px actions: the times cell begins at
    // 119 and the actions cell at 647 of 910 (2440:260517 / 260521).
    const times = single.querySelector('.ns-hours-row__times')!.getBoundingClientRect()
    const actions = single.querySelector('.ns-hours-row__actions')!.getBoundingClientRect()
    await expect(times.left - rect.left).toBe(119)
    await expect(actions.left - rect.left).toBe(647)
    await expect(actions.width).toBe(263)

    // Selects are 50 tall, not Quasar's 56 (every NsSelect in 2440:260508–515).
    const control = single.querySelector('.q-field__control') as HTMLElement
    await expect(control.getBoundingClientRect().height).toBe(50)

    // Add Hours is md (36) at the design's x=138 within the actions cell
    // (2440:260524), on the single row and on the bottom row of a split day.
    const addSingle = single.querySelector('.ns-hours-row__add') as HTMLElement
    await expect(addSingle.getBoundingClientRect().height).toBe(36)
    await expect(addSingle.getBoundingClientRect().width).toBe(125) // 2440:260524, in Fixel
    await expect(addSingle.getBoundingClientRect().left - actions.left).toBe(138)

    const bottom = rows[1] // Mondays, range 2 of 2
    const bottomActions = bottom.querySelector('.ns-hours-row__actions')!.getBoundingClientRect()
    const remove = bottom.querySelector('.ns-hours-row__remove--column') as HTMLElement
    const addBottom = bottom.querySelector('.ns-hours-row__add') as HTMLElement
    await expect(getComputedStyle(remove).display).not.toBe('none')
    await expect(remove.getBoundingClientRect().left - bottomActions.left).toBe(0)
    // sm icon-only with a 16px icon: 8 + 16 + 8 = the design's 32
    // (2440:260552). An icon-only button is its icon plus padding, not its
    // line box. Review measured 36 with a 20px icon, which is why the size
    // is pinned through the button rather than trusted from the constant.
    await expect(remove.getBoundingClientRect().height).toBe(32)
    await expect(remove.getBoundingClientRect().width).toBe(32)
    await expect(addBottom.getBoundingClientRect().left - bottomActions.left).toBe(138)
    // The mobile remove button is the hidden one here.
    const inline = bottom.querySelector('.ns-hours-row__remove--inline') as HTMLElement
    await expect(getComputedStyle(inline).display).toBe('none')

    // The first row of a split day has neither Closed nor Add (Top Row of Multiple).
    await expect(rows[0].querySelector('.ns-hours-row__closed')).toBeNull()
    await expect(rows[0].querySelector('.ns-hours-row__add')).toBeNull()
  },
}

/**
 * MOBILE GEOMETRY IS REAL — 2440:260509 (Top Row, Mobile, 310x132): label,
 * then the times row, then the actions row, 8px apart; Add Hours is lg (45)
 * and the remove button sits inline with the selects (2440:260515).
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => ({
    components: { NsHoursOfOperation },
    setup: () => ({ value: ref(withThreeOnMonday()) }),
    template: `<div style="width: 310px"><NsHoursOfOperation v-model="value" label="Hours of operation" :days="['monday', 'tuesday']" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const rows = canvasElement.querySelectorAll<HTMLElement>('.ns-hours-row')
    await expect(rows.length).toBe(4)
    const single = rows[3]
    await expect(getComputedStyle(single).display).toBe('flex')
    await expect(getComputedStyle(single).flexDirection).toBe('column')

    const rect = single.getBoundingClientRect()
    const times = single.querySelector('.ns-hours-row__times')!.getBoundingClientRect()
    const actions = single.querySelector('.ns-hours-row__actions')!.getBoundingClientRect()
    await expect(rect.width).toBe(310)
    await expect(rect.height).toBe(132) // 2440:260509
    await expect(times.top - rect.top).toBe(29) // 21px label + 8
    await expect(actions.top - times.bottom).toBe(8)
    await expect(single.querySelector('.ns-hours-row__add')!.getBoundingClientRect().height).toBe(
      45,
    )

    // A MIDDLE row is its times row and nothing else: 50px, no phantom
    // actions row underneath. Review measured 58 (an 8px gap under a hidden
    // desktop X) with two-range data, which has no middle row to show it.
    const middle = rows[1]
    await expect(middle.getBoundingClientRect().height).toBe(50)
    await expect(getComputedStyle(middle.querySelector('.ns-hours-row__actions')!).display).toBe(
      'none',
    )
    // …and the day's rhythm is NsHoursDay's 12 between every pair of rows.
    await expect(rows[1].getBoundingClientRect().top - rows[0].getBoundingClientRect().bottom).toBe(
      12,
    )
    await expect(rows[2].getBoundingClientRect().top - rows[1].getBoundingClientRect().bottom).toBe(
      12,
    )

    // Two-digit times stay on ONE line inside the 50px control on the rows
    // that carry an X ("11:30 p.m." is the widest en-CA label). Review
    // measured two lines at the design's 16px gap and padding.
    for (const row of [rows[1], rows[2]]) {
      for (const value of row.querySelectorAll<HTMLElement>('.ns-hours-row__value')) {
        const native = value.closest('.q-field__native') as HTMLElement
        await expect(value.getBoundingClientRect().height).toBeLessThan(30)
        await expect(native.scrollWidth).toBeLessThanOrEqual(native.clientWidth)
      }
    }

    const bottom = rows[2]
    const inline = bottom.querySelector('.ns-hours-row__remove--inline') as HTMLElement
    const column = bottom.querySelector('.ns-hours-row__remove--column') as HTMLElement
    await expect(getComputedStyle(inline).display).not.toBe('none')
    await expect(getComputedStyle(column).display).toBe('none')
    // Only the first row of the day shows the label.
    await expect(getComputedStyle(bottom.querySelector('.ns-hours-row__day')!).display).toBe('none')
    await expect(getComputedStyle(rows[0].querySelector('.ns-hours-row__day')!).display).not.toBe(
      'none',
    )
  },
}

/**
 * THE KEYBOARD PATH, in a real browser. Add moves focus into the new row's
 * open select; Remove moves it to the day's Add Hours button — never onto
 * another remove button, where a second Enter would remove a second range.
 * Announced through the live region both times.
 */
export const AddAndRemoveMoveFocus: Story = {
  render: () => controlled(createNsHoursOfOperationValue(), ':days="[\'monday\']"'),
  play: async ({ canvasElement }) => {
    const live = canvasElement.querySelector('[aria-live="polite"]') as HTMLElement
    const add = canvasElement.querySelector('.ns-hours-row__add') as HTMLElement
    add.focus()
    await userEvent.keyboard('{Enter}')

    await waitFor(() => expect(canvasElement.querySelectorAll('.ns-hours-row').length).toBe(2))
    const opens = canvasElement.querySelector(
      '[aria-label="Opens, Mondays, hours 2 of 2"]',
    ) as HTMLElement
    await expect(opens).not.toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(opens))
    await waitFor(() => expect(live.textContent?.trim()).toBe('Hours added for Mondays, 2 of 2'))

    // The single-row Closed checkbox is gone now that the day is split.
    await expect(canvasElement.querySelector('.ns-hours-row__closed')).toBeNull()

    const remove = canvasElement.querySelector(
      '[aria-label="Remove hours 2 of 2 for Mondays"].ns-hours-row__remove--column',
    ) as HTMLElement
    remove.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(canvasElement.querySelectorAll('.ns-hours-row').length).toBe(1))
    const addAgain = canvasElement.querySelector('.ns-hours-row__add') as HTMLElement
    await waitFor(() => expect(document.activeElement).toBe(addAgain))
    await waitFor(() =>
      expect(live.textContent?.trim()).toBe('Hours removed for Mondays, 1 remaining'),
    )
    // …and Closed is back.
    await expect(canvasElement.querySelector('.ns-hours-row__closed')).not.toBeNull()
  },
}
