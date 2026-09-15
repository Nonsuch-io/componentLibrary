import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, toRaw } from 'vue'
import NsHoursOfOperation from './NsHoursOfOperation.vue'
import NsHoursRow from './NsHoursRow.vue'
import NsCheckbox from '../NsCheckbox/NsCheckbox.vue'
import NsSelect from '../NsSelect/NsSelect.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'
import { fill } from '../../locale/fill'
import {
  NS_HOURS_DAY_KEYS,
  createNsHoursDay,
  createNsHoursOfOperationValue,
  nsHoursTimeOptions,
  type NsHoursOfOperationValue,
} from './types'

/**
 * NOTHING HERE MEASURES A PIXEL. happy-dom has no layout, so the design's
 * geometry (grid columns, 50px selects, md/lg buttons, the mobile stack) is
 * asserted in the stories under the Chromium project. These tests are the
 * contract: what goes out, what never goes out, and what a screen reader is
 * told.
 */

const split = (): NsHoursOfOperationValue => {
  const v = createNsHoursOfOperationValue()
  v.monday = {
    closed: false,
    ranges: [
      { open: '09:00', close: '12:00' },
      { open: '13:00', close: '17:30' },
    ],
  }
  return v
}

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsHoursOfOperation, {
    props: { label: 'Hours of operation', ...props },
    attachTo: document.body,
  })

const rowsOf = (w: ReturnType<typeof mountWith>, day: string) =>
  w.findAllComponents(NsHoursRow).filter((r) => r.props('dayLabel') === day)

const lastEmitted = (w: ReturnType<typeof mountWith>) => {
  const all = w.emitted('update:modelValue')
  return all?.[all.length - 1]?.[0] as NsHoursOfOperationValue | undefined
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('NsHoursOfOperation — the value model', () => {
  it('renders eight days by default, Mondays first and Holidays last, one row each', () => {
    const w = mountWith()
    const rows = w.findAllComponents(NsHoursRow)
    expect(rows.length).toBe(8)
    expect(rows[0].props('dayLabel')).toBe('Mondays')
    expect(rows[7].props('dayLabel')).toBe('Holidays')
    expect(NS_HOURS_DAY_KEYS.length).toBe(8)
    w.unmount()
  })

  it('renders only `days`, in the order given', () => {
    const w = mountWith({ days: ['saturday', 'monday'] })
    const labels = w.findAllComponents(NsHoursRow).map((r) => r.props('dayLabel'))
    expect(labels).toEqual(['Saturdays', 'Mondays'])
    w.unmount()
  })

  it('emits a NEW value with the changed range and leaves the prop untouched', async () => {
    const value = createNsHoursOfOperationValue()
    const snapshot = JSON.stringify(value)
    const w = mountWith({ modelValue: value })
    const row = rowsOf(w, 'Tuesdays')[0]
    await row.vm.$emit('update:range', { open: '10:00', close: '18:00' })

    const next = lastEmitted(w)!
    expect(next.tuesday.ranges[0]).toEqual({ open: '10:00', close: '18:00' })
    expect(next).not.toBe(value)
    expect(next.tuesday).not.toBe(value.tuesday)
    // Untouched days are the same objects — a consumer diffing by identity sees one change.
    expect(next.monday).toBe(value.monday)
    expect(JSON.stringify(value)).toBe(snapshot)
    w.unmount()
  })

  it('adds a range to the end of the day and never removes the first', async () => {
    const w = mountWith({ modelValue: createNsHoursOfOperationValue() })
    await rowsOf(w, 'Mondays')[0].vm.$emit('add')
    let next = lastEmitted(w)!
    expect(next.monday.ranges.length).toBe(2)
    expect(next.monday.ranges[1]).toEqual({ open: null, close: null })

    // A remove on index 0, or on a single-range day, is a no-op — the
    // template renders no button for either, and the guard is what holds the
    // invariant if a caller reaches past the template.
    await w.setProps({ modelValue: next })
    const before = w.emitted('update:modelValue')!.length
    await rowsOf(w, 'Mondays')[0].vm.$emit('remove')
    expect(w.emitted('update:modelValue')!.length).toBe(before)

    await rowsOf(w, 'Mondays')[1].vm.$emit('remove')
    next = lastEmitted(w)!
    expect(next.monday.ranges.length).toBe(1)
    w.unmount()
  })

  it('closing a day KEEPS its ranges so reopening restores them', async () => {
    const w = mountWith({ modelValue: split() })
    // Sundays is single-range, so it has the checkbox.
    await rowsOf(w, 'Sundays')[0].vm.$emit('update:closed', true)
    const next = lastEmitted(w)!
    expect(next.sunday.closed).toBe(true)
    expect(next.sunday.ranges.length).toBe(1)
    w.unmount()
  })

  it('never emits an empty ranges array from any sequence of add and remove', async () => {
    const w = mountWith({ modelValue: createNsHoursOfOperationValue() })
    for (const action of ['add', 'add', 'remove', 'remove', 'remove', 'add', 'remove'] as const) {
      const rows = rowsOf(w, 'Fridays')
      await rows[rows.length - 1].vm.$emit(action)
      const emitted = lastEmitted(w)
      if (emitted) await w.setProps({ modelValue: emitted })
    }
    for (const value of w
      .emitted('update:modelValue')!
      .map((e) => e[0] as NsHoursOfOperationValue)) {
      expect(value.friday.ranges.length).toBeGreaterThanOrEqual(1)
    }
    w.unmount()
  })

  it('edits without a v-model and emits the full value on the first change', async () => {
    const w = mountWith()
    await rowsOf(w, 'Holidays')[0].vm.$emit('update:closed', true)
    const next = lastEmitted(w)!
    expect(Object.keys(next).sort()).toEqual([...NS_HOURS_DAY_KEYS].sort())
    expect(next.holidays.closed).toBe(true)
    // …and reflects it, since it owns the fallback.
    expect(rowsOf(w, 'Holidays')[0].props('closed')).toBe(true)
    w.unmount()
  })
})

describe('NsHoursOfOperation — values the caller got wrong', () => {
  it('renders a day named in `days` but missing from the value as open with one empty range', () => {
    // butiq's existing BusinessHours has seven keys and no `holidays`; this
    // is the first value the component will meet. Review reproduced a
    // TypeError on `.ranges` of undefined here before the fix.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const partial = { monday: createNsHoursDay() } as unknown as NsHoursOfOperationValue
    const w = mountWith({ modelValue: partial, days: ['monday', 'holidays'] })
    expect(rowsOf(w, 'Mondays').length).toBe(1)
    expect(rowsOf(w, 'Holidays').length).toBe(1)
    expect(rowsOf(w, 'Holidays')[0].props('range')).toEqual({ open: null, close: null })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('[NsHoursOfOperation] holidays')
    warn.mockRestore()
    w.unmount()
  })

  it("emits the filled day alongside the caller's own, untouched", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const monday = createNsHoursDay()
    const partial = { monday } as unknown as NsHoursOfOperationValue
    const w = mountWith({ modelValue: partial, days: ['monday', 'holidays'] })
    await rowsOf(w, 'Holidays')[0].vm.$emit('update:closed', true)
    const next = lastEmitted(w)!
    expect(next.holidays.closed).toBe(true)
    expect(next.monday).toBe(monday)
    warn.mockRestore()
    w.unmount()
  })

  it('fills a day that is present but has no `ranges`, without the dev warning itself crashing', () => {
    // Review: `{ closed: false }` with no `ranges` passed a truthiness check
    // on the day and then threw inside the warning watcher — the safety net
    // was the crash. Same class as the missing-day fix, one field deeper.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (const monday of [
      { closed: false },
      { closed: false, ranges: 'abc' }, // a double-encoded backend field: truthy length, not an array
      { closed: false, ranges: { length: 2 } },
      null,
    ]) {
      warn.mockClear()
      const v = createNsHoursOfOperationValue()
      ;(v as Record<string, unknown>).monday = monday
      const w = mountWith({ modelValue: v, days: ['monday'] })
      expect(rowsOf(w, 'Mondays').length, JSON.stringify(monday)).toBe(1)
      expect(warn, JSON.stringify(monday)).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain('[NsHoursOfOperation] monday')
      w.unmount()
    }
    warn.mockRestore()
  })

  it('editing a day the caller HAS also emits the days it lacked, filled', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const partial = { monday: createNsHoursDay() } as unknown as NsHoursOfOperationValue
    const w = mountWith({ modelValue: partial, days: ['monday', 'tuesday'] })
    await rowsOf(w, 'Mondays')[0].vm.$emit('update:closed', true)
    const next = lastEmitted(w)!
    expect(Object.keys(next).sort()).toEqual(['monday', 'tuesday'])
    expect(next.tuesday).toEqual(createNsHoursDay())
    warn.mockRestore()
    w.unmount()
  })

  it('treats a null modelValue as uncontrolled — the edit is kept, not emitted and then dropped', async () => {
    const w = mount(NsHoursOfOperation, {
      props: { label: 'x', modelValue: null as unknown as undefined, days: ['monday'] },
    })
    await rowsOf(w, 'Mondays')[0].vm.$emit('update:closed', true)
    expect(lastEmitted(w)!.monday.closed).toBe(true)
    // Still shown after the parent does nothing with the emit.
    expect(rowsOf(w, 'Mondays')[0].props('closed')).toBe(true)
    w.unmount()
  })

  it('keeps the last controlled value when modelValue becomes undefined', async () => {
    const v = createNsHoursOfOperationValue()
    v.monday = { closed: false, ranges: [{ open: '09:00', close: '17:00' }] }
    const w = mountWith({ modelValue: v, days: ['monday'] })
    await w.setProps({ modelValue: undefined })
    expect(rowsOf(w, 'Mondays')[0].props('range')).toEqual({ open: '09:00', close: '17:00' })
    w.unmount()
  })
})

describe('NsHoursOfOperation — no validation, by contract', () => {
  it('shows an overnight span with no error of its own', () => {
    const v = createNsHoursOfOperationValue()
    v.friday = { closed: false, ranges: [{ open: '22:00', close: '02:00' }] }
    const w = mountWith({ modelValue: v })
    expect(w.find('[aria-invalid="true"]').exists()).toBe(false)
    expect(w.findAll('.ns-hours-row__error').length).toBe(0)
    w.unmount()
  })

  it('passes 22:00–02:00 through unchanged on the next edit', async () => {
    const v = createNsHoursOfOperationValue()
    v.friday = { closed: false, ranges: [{ open: '22:00', close: '02:00' }] }
    const w = mountWith({ modelValue: v })
    await rowsOf(w, 'Fridays')[0].vm.$emit('update:range', { open: '23:00', close: '02:00' })
    expect(lastEmitted(w)!.friday.ranges[0]).toEqual({ open: '23:00', close: '02:00' })
    w.unmount()
  })

  it('renders a per-range error beside that range only, and wires it to both selects', () => {
    const w = mountWith({
      modelValue: split(),
      errors: { monday: [null, 'Overlaps the range before it'] },
    })
    const [first, second] = rowsOf(w, 'Mondays')
    expect(first.find('.ns-hours-row__error').exists()).toBe(false)
    const message = second.find('.ns-hours-row__error')
    expect(message.text()).toBe('Overlaps the range before it')

    // On the COMBOBOX, where Quasar places a field's aria-* — not on the
    // field's root label, which no assistive technology reads as the control.
    const selects = second.findAllComponents(NsSelect)
    expect(selects.length).toBe(2)
    for (const s of selects) {
      expect(s.find('[role="combobox"]').attributes('aria-invalid')).toBe('true')
    }
    expect(second.attributes('aria-describedby')).toBe(message.attributes('id'))
    for (const s of first.findAllComponents(NsSelect)) {
      expect(s.find('[aria-invalid]').exists()).toBe(false)
    }
    w.unmount()
  })

  it('renders a day-level error under the day and describes every row of it', () => {
    const w = mountWith({ modelValue: split(), errors: { monday: 'Pick both times' } })
    const day = w.find('.ns-hours-of-operation__day')
    const message = day.find('.ns-hours-of-operation__error')
    expect(message.text()).toBe('Pick both times')
    for (const row of rowsOf(w, 'Mondays')) {
      expect(row.attributes('aria-describedby')).toBe(message.attributes('id'))
      // Day-level is not a range-level error: the selects are not invalid.
      expect(row.find('[aria-invalid]').exists()).toBe(false)
    }
    w.unmount()
  })

  it('treats a blank message as no message', () => {
    const w = mountWith({ modelValue: split(), errors: { monday: '   ', tuesday: ['', null] } })
    expect(w.findAll('.ns-hours-of-operation__error').length).toBe(0)
    expect(w.findAll('.ns-hours-row__error').length).toBe(0)
    w.unmount()
  })
})

describe('NsHoursOfOperation — what a screen reader is told', () => {
  it('names the editor from `label` without rendering it', () => {
    const w = mountWith({ label: 'Hours of operation' })
    expect(w.attributes('role')).toBe('group')
    expect(w.attributes('aria-label')).toBe('Hours of operation')
    expect(w.text()).not.toContain('Hours of operation')
    w.unmount()
  })

  it('names every range group and every select with the day and its position', () => {
    const w = mountWith({ modelValue: split() })
    const [first, second] = rowsOf(w, 'Mondays')
    expect(first.attributes('aria-label')).toBe('Mondays, hours 1 of 2')
    expect(second.attributes('aria-label')).toBe('Mondays, hours 2 of 2')
    const [opens, closes] = second.findAllComponents(NsSelect)
    const nameOf = (s: typeof opens) => s.find('[role="combobox"]').attributes('aria-label')
    expect(nameOf(opens)).toBe('Opens, Mondays, hours 2 of 2')
    expect(nameOf(closes)).toBe('Closes, Mondays, hours 2 of 2')
    // The visible day label is aria-hidden: the group already says it.
    expect(first.find('.ns-hours-row__day').attributes('aria-hidden')).toBe('true')
    expect(first.find('.ns-hours-row__day').text()).toBe('Mondays')
    expect(second.find('.ns-hours-row__day').text()).toBe('')
    w.unmount()
  })

  it('names the add and remove buttons by action and day, and renders Closed on single days only', () => {
    const w = mountWith({ modelValue: split() })
    const [first, second] = rowsOf(w, 'Mondays')
    expect(first.find('[aria-label="Add hours for Mondays"]').exists()).toBe(false)
    expect(second.find('[aria-label="Add hours for Mondays"]').exists()).toBe(true)
    expect(second.findAll('[aria-label="Remove hours 2 of 2 for Mondays"]').length).toBe(2)
    expect(first.findComponent(NsCheckbox).exists()).toBe(false)

    const tuesday = rowsOf(w, 'Tuesdays')[0]
    expect(tuesday.findComponent(NsCheckbox).exists()).toBe(true)
    expect(tuesday.find('[aria-label="Add hours for Tuesdays"]').exists()).toBe(true)
    expect(tuesday.find('[aria-label^="Remove"]').exists()).toBe(false)
    w.unmount()
  })

  it('announces add and remove through one polite live region', async () => {
    const w = mountWith({ modelValue: createNsHoursOfOperationValue(), days: ['monday'] })
    const live = w.find('[aria-live="polite"]')
    expect(live.attributes('aria-atomic')).toBe('true')
    expect(live.text()).toBe('')

    await rowsOf(w, 'Mondays')[0].vm.$emit('add')
    await w.setProps({ modelValue: lastEmitted(w) })
    for (let i = 0; i < 4; i++) await nextTick()
    expect(live.text()).toBe('Hours added for Mondays, 2 of 2')

    await rowsOf(w, 'Mondays')[1].vm.$emit('remove')
    await w.setProps({ modelValue: lastEmitted(w) })
    for (let i = 0; i < 4; i++) await nextTick()
    expect(live.text()).toBe('Hours removed for Mondays, 1 remaining')
    w.unmount()
  })

  it('speaks the injected locale', () => {
    const w = mount(NsHoursOfOperation, {
      props: { label: 'Heures', modelValue: split() },
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    const [, second] = rowsOf(w, 'Les lundis')
    expect(second.attributes('aria-label')).toBe('Les lundis, plage 2 sur 2')
    expect(second.find('[aria-label="Retirer la plage 2 sur 2 pour Les lundis"]').exists()).toBe(
      true,
    )
    w.unmount()
  })
})

describe('NsHoursOfOperation — options and disabling', () => {
  it('defaults to 48 half-hour options with HH:mm values', () => {
    const w = mountWith()
    const options = rowsOf(w, 'Mondays')[0].props('options') as { value: string }[]
    expect(options.length).toBe(48)
    expect(options[0].value).toBe('00:00')
    expect(options[1].value).toBe('00:30')
    expect(options[47].value).toBe('23:30')
    w.unmount()
  })

  it('uses the consumer list when `options` is given', () => {
    const options = [{ label: 'Nine', value: '09:00' }]
    const w = mountWith({ options })
    expect(toRaw(rowsOf(w, 'Mondays')[0].props('options'))).toBe(options)
    w.unmount()
  })

  it('shows a stored value that is not in the list AS ITSELF, not as the placeholder', () => {
    const v = createNsHoursOfOperationValue()
    v.monday = { closed: false, ranges: [{ open: '09:15', close: null }] }
    const w = mountWith({ modelValue: v })
    const [opens, closes] = rowsOf(w, 'Mondays')[0].findAllComponents(NsSelect)
    expect(opens.text()).toContain('09:15')
    expect(opens.find('.ns-hours-row__placeholder').exists()).toBe(false)
    expect(closes.text()).toContain('Select')
    expect(closes.find('.ns-hours-row__placeholder').exists()).toBe(true)
    w.unmount()
  })

  it('disables every control, and a closed day disables its times and Add but not Closed', () => {
    const w = mountWith({ modelValue: split(), disable: true })
    expect(w.attributes('aria-disabled')).toBe('true')
    for (const row of w.findAllComponents(NsHoursRow)) {
      expect(row.props('disable')).toBe(true)
      for (const s of row.findAllComponents(NsSelect)) expect(s.props('disable')).toBe(true)
    }
    w.unmount()

    const v = createNsHoursOfOperationValue()
    v.sunday = { closed: true, ranges: [{ open: null, close: null }] }
    const w2 = mountWith({ modelValue: v })
    const sunday = rowsOf(w2, 'Sundays')[0]
    for (const s of sunday.findAllComponents(NsSelect)) expect(s.props('disable')).toBe(true)
    expect(sunday.find('.ns-hours-row__add').attributes('disabled')).toBeDefined()
    expect(sunday.findComponent(NsCheckbox).props('disable')).toBe(false)
    w2.unmount()
  })

  it('accepts the `disabled` spelling through useNsDisabled', () => {
    const w = mount(NsHoursOfOperation, {
      props: { label: 'x' },
      attrs: { disabled: true },
    })
    expect(w.attributes('aria-disabled')).toBe('true')
    expect(w.attributes('disabled')).toBeUndefined()
    w.unmount()
  })
})

describe('NsHoursOfOperation — dev warning', () => {
  it('warns ONCE when a day arrives with no ranges, naming the day', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const v = createNsHoursOfOperationValue()
    v.wednesday = { closed: false, ranges: [] }
    const w = mountWith({ modelValue: v })
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('[NsHoursOfOperation] wednesday')
    expect(rowsOf(w, 'Wednesdays').length).toBe(0)

    v.thursday = { closed: false, ranges: [] }
    await w.setProps({ modelValue: { ...v } })
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
    w.unmount()
  })

  it('does not warn for a well-formed value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const w = mountWith({ modelValue: split() })
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
    w.unmount()
  })
})

describe('helpers', () => {
  it('fill() replaces known placeholders and leaves unknown ones visible', () => {
    expect(
      fill('{day}, hours {index} of {count}', { day: 'Mondays', index: '1', count: '2' }),
    ).toBe('Mondays, hours 1 of 2')
    expect(fill('Add hours for {day}', {})).toBe('Add hours for {day}')
  })

  it('nsHoursTimeOptions() steps as asked, falls back to 30 on nonsense, and labels by locale', () => {
    expect(nsHoursTimeOptions(15).length).toBe(96)
    expect(nsHoursTimeOptions(60)[13].value).toBe('13:00')
    expect(nsHoursTimeOptions(0).length).toBe(48)
    expect(nsHoursTimeOptions(Number.NaN).length).toBe(48)
    const fr = nsHoursTimeOptions(60, 'fr-CA')[13].label
    const en = nsHoursTimeOptions(60, 'en-CA')[13].label
    expect(fr).not.toBe(en)
    expect(en).toMatch(/1:00/)
  })

  it('createNsHoursDay() is one open empty range', () => {
    expect(createNsHoursDay()).toEqual({ closed: false, ranges: [{ open: null, close: null }] })
  })
})
