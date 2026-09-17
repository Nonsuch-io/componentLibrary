import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsOnboardingStepper from './NsOnboardingStepper.vue'
import NsStepNumber from '../NsStepNumber/NsStepNumber.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — the 28px row, the equal connectors and
 * the mobile hiding are in the stories under Chromium. These are the state
 * derivation (chrome from a step graph it does not own) and what a screen
 * reader is told.
 */

const steps = [
  { id: 'name', label: 'Name' },
  { id: 'contact', label: 'Contact' },
  { id: 'address', label: 'Address' },
  { id: 'photo', label: 'Photo' },
]

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsOnboardingStepper, { props: { steps, current: 'address', ...props } })

/** The circle's variant is the state's appearance: complete → check, current → filled, upcoming → outlined. */
const APPEARANCE = { check: 'complete', filled: 'current', outlined: 'upcoming' } as const
const statesOf = (w: ReturnType<typeof mountWith>) =>
  w
    .findAllComponents(NsStepNumber)
    .map((c) => APPEARANCE[c.props('variant') as keyof typeof APPEARANCE])

describe('NsOnboardingStepper — state from the step graph', () => {
  it('marks steps before the current complete, the current current, the rest upcoming', () => {
    expect(statesOf(mountWith())).toEqual(['complete', 'complete', 'current', 'upcoming'])
    expect(statesOf(mountWith({ current: 'name' }))).toEqual([
      'current',
      'upcoming',
      'upcoming',
      'upcoming',
    ])
    expect(statesOf(mountWith({ current: 'photo' }))).toEqual([
      'complete',
      'complete',
      'complete',
      'current',
    ])
  })

  it('lets a step override the default in either direction', () => {
    const w = mountWith({
      steps: [
        steps[0],
        { ...steps[1], complete: false }, // skipped
        steps[2],
        { ...steps[3], complete: true }, // done out of order
      ],
    })
    expect(statesOf(w)).toEqual(['complete', 'upcoming', 'current', 'complete'])
  })

  it('has no current step for an unknown or missing id, and nothing complete by default', () => {
    expect(statesOf(mountWith({ current: 'nope' }))).toEqual(Array(4).fill('upcoming'))
    expect(statesOf(mountWith({ current: undefined }))).toEqual(Array(4).fill('upcoming'))
  })

  it('numbers from the position, not the id', () => {
    const w = mountWith()
    expect(w.findAllComponents(NsStepNumber).map((c) => c.props('number'))).toEqual([1, 2, 3, 4])
  })
})

describe('NsOnboardingStepper — what a screen reader is told', () => {
  it('is a nav named Progress over an ordered list, with aria-current on the current step', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('NAV')
    expect(w.attributes('aria-label')).toBe('Progress')
    // role="list" restated for WebKit, which drops list semantics from a
    // list-style: none <ol> — and "2 of 6" is the point of a stepper.
    expect(w.find('ol').attributes('role')).toBe('list')
    const items = w.findAll('ol > li')
    expect(items.length).toBe(4)
    expect(items.map((li) => li.attributes('aria-current'))).toEqual([
      undefined,
      undefined,
      'step',
      undefined,
    ])
    w.unmount()
  })

  it('keeps every label in the DOM, adds "(Completed)" to done steps, and hides the circles', () => {
    const w = mountWith()
    // The LABEL's text: `li.text()` would include the aria-hidden circle's
    // number, which a screen reader does not read but VTU does.
    const labels = w.findAll('.ns-onboarding-stepper__label')
    expect(labels.map((el) => el.text().replace(/\s+/g, ' '))).toEqual([
      'Name (Completed)',
      'Contact (Completed)',
      'Address',
      'Photo',
    ])
    for (const c of w.findAllComponents(NsStepNumber)) {
      expect(c.attributes('aria-hidden')).toBe('true')
    }
    w.unmount()
  })

  // A blank label is no landmark name: `:label="t(key)"` before translations
  // load hands over '' (componentLibrary-d13).
  it('falls back to the locale name for a blank label, not to aria-label=""', () => {
    for (const blank of ['', '   ']) {
      const w = mountWith({ label: blank })
      expect(w.attributes('aria-label')).toBe('Progress')
      w.unmount()
    }
  })

  it('takes a custom nav name and speaks the injected locale', () => {
    expect(mountWith({ label: 'Sign-up progress' }).attributes('aria-label')).toBe(
      'Sign-up progress',
    )
    const fr = mount(NsOnboardingStepper, {
      props: { steps, current: 'contact' },
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(fr.attributes('aria-label')).toBe('Progression')
    expect(fr.find('.ns-onboarding-stepper__label').text().replace(/\s+/g, ' ')).toBe(
      'Name (Terminée)',
    )
    fr.unmount()
  })
})

describe('NsStepNumber', () => {
  it('shows a check for the check variant and the number otherwise, always aria-hidden', () => {
    const check = mount(NsStepNumber, { props: { number: 3, variant: 'check' } })
    expect(check.find('svg').exists()).toBe(true)
    expect(check.text()).toBe('')
    expect(check.attributes('aria-hidden')).toBe('true')
    for (const variant of ['filled', 'outlined'] as const) {
      const w = mount(NsStepNumber, { props: { number: 3, variant } })
      expect(w.find('svg').exists()).toBe(false)
      expect(w.text()).toBe('3')
      expect(w.classes()).toContain(`ns-step-number--${variant}`)
    }
  })

  it('defaults to the 28 size and the outlined variant', () => {
    const w = mount(NsStepNumber, { props: { number: 1 } })
    expect(w.classes()).toContain('ns-step-number--28')
    expect(w.classes()).toContain('ns-step-number--outlined')
    expect(mount(NsStepNumber, { props: { number: 1, size: 20 } }).classes()).toContain(
      'ns-step-number--20',
    )
  })
})
