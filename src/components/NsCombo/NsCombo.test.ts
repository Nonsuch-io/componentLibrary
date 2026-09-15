import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCombo from './NsCombo.vue'
import NsPlanHeader from '../NsPlanHeader/NsPlanHeader.vue'
import NsPlanHighlights from '../NsPlanHighlights/NsPlanHighlights.vue'
import NsPlanFeatures from '../NsPlanFeatures/NsPlanFeatures.vue'
import NsButton from '../NsButton/NsButton.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — the design's geometry (275 / 382 cards,
 * the wrapping header, the md/lg button) is in the stories under Chromium.
 * These are the contract: what is rendered from what, what a screen reader
 * is told, and that nothing here decides anything.
 */

const plan = {
  bestFor: 'Best For: Sellers with one physical location',
  name: 'Independent Brick & Mortar',
  price: '$133',
  period: '/mo',
  highlights: ['butiq Basic', 'Inventory Management'],
  features: ['Take tap payments from your phone', 'Up to 5 team members'],
  actionLabel: 'Continue With This Plan',
}

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsCombo, { props: { ...plan, ...props } })

describe('NsCombo — chrome only', () => {
  it('renders every part from props, in the design order', () => {
    const w = mountWith()
    const parts = [...w.element.children].map((el) => el.className.split(' ')[0])
    expect(parts).toEqual([
      'ns-combo__best-for',
      'ns-plan-header',
      'ns-plan-highlights',
      'ns-plan-features',
      'ns-combo__actions',
    ])
    expect(w.find('.ns-combo__best-for').text()).toBe(plan.bestFor)
    expect(w.findComponent(NsPlanHeader).props()).toMatchObject({
      name: plan.name,
      price: '$133',
      period: '/mo',
    })
    expect(w.findComponent(NsPlanHighlights).props('highlights')).toEqual(plan.highlights)
    expect(w.findComponent(NsPlanFeatures).props('features')).toEqual(plan.features)
    expect(w.findComponent(NsButton).text()).toBe('Continue With This Plan')
    w.unmount()
  })

  it('shows the price exactly as handed — it formats nothing', () => {
    const w = mountWith({ price: '133,00 $', period: '/mois' })
    expect(w.find('.ns-plan-header__amount').text()).toBe('133,00 $')
    expect(w.find('.ns-plan-header__period').text()).toBe('/mois')
    w.unmount()
  })

  it('omits each optional part when it is absent or blank', () => {
    const w = mountWith({
      bestFor: '  ',
      price: undefined,
      highlights: [],
      features: [],
      actionLabel: '',
    })
    expect(w.find('.ns-combo__best-for').exists()).toBe(false)
    expect(w.find('.ns-plan-header__price').exists()).toBe(false)
    expect(w.findComponent(NsPlanHighlights).exists()).toBe(false)
    expect(w.findComponent(NsPlanFeatures).exists()).toBe(false)
    expect(w.find('.ns-combo__actions').exists()).toBe(false)
    // The name is required and still there.
    expect(w.find('.ns-plan-header__name').text()).toBe(plan.name)
    w.unmount()
  })

  it('emits select on the button and does nothing else with it', async () => {
    const w = mountWith()
    await w.findComponent(NsButton).trigger('click')
    expect(w.emitted('select')).toEqual([[]])
    w.unmount()
  })
})

describe('NsCombo — what a screen reader is told', () => {
  it('is an article named by the plan name heading, and the button is described by it', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('ARTICLE')
    const heading = w.find('h3')
    expect(heading.text()).toBe(plan.name)
    expect(w.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(w.findComponent(NsButton).attributes('aria-describedby')).toBe(heading.attributes('id'))
    w.unmount()
  })

  it('binds and clamps the heading level', () => {
    expect(mountWith({ level: 2 }).find('h2').exists()).toBe(true)
    expect(mountWith({ level: 8 }).find('h6').exists()).toBe(true)
  })

  it('names the two lists from the locale', () => {
    const w = mountWith()
    expect(w.find('.ns-plan-highlights').attributes('aria-label')).toBe('Included modules')
    expect(w.find('.ns-plan-features').attributes('aria-label')).toBe('Included features')
    const fr = mount(NsCombo, {
      props: plan,
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(fr.find('.ns-plan-highlights').attributes('aria-label')).toBe('Modules inclus')
    fr.unmount()
    w.unmount()
  })
})

describe('NsPlanHighlights', () => {
  it('is a list of the items — the pipes are CSS, not content — and drops blanks', () => {
    const w = mount(NsPlanHighlights, { props: { highlights: ['A', ' ', 'B ', ''] } })
    expect(w.element.tagName).toBe('UL')
    expect(w.findAll('li').map((li) => li.text())).toEqual(['A', 'B'])
    expect(w.text()).not.toContain('|')
    w.unmount()
  })

  it('renders nothing at all for no items', () => {
    const w = mount(NsPlanHighlights, { props: { highlights: [' '] } })
    expect(w.find('ul').exists()).toBe(false)
    w.unmount()
  })
})

describe('NsPlanFeatures', () => {
  it('is a list with a decorative check after each item, dropping blanks', () => {
    const w = mount(NsPlanFeatures, { props: { features: ['One', '', 'Two'] } })
    const items = w.findAll('li')
    expect(items.map((li) => li.text())).toEqual(['One', 'Two'])
    for (const li of items) {
      const check = li.find('svg')
      expect(check.exists()).toBe(true)
      expect(check.attributes('aria-hidden')).toBe('true')
    }
    w.unmount()
  })
})

describe('NsPlanHeader', () => {
  it('renders no price row without a price, and no period without one', () => {
    expect(
      mount(NsPlanHeader, { props: { name: 'X' } })
        .find('.ns-plan-header__price')
        .exists(),
    ).toBe(false)
    const w = mount(NsPlanHeader, { props: { name: 'X', price: '$1' } })
    expect(w.find('.ns-plan-header__amount').text()).toBe('$1')
    expect(w.find('.ns-plan-header__period').exists()).toBe(false)
    w.unmount()
  })

  it('puts headingId on the heading, not the row', () => {
    const w = mount(NsPlanHeader, { props: { name: 'X', headingId: 'plan-x' } })
    expect(w.find('h3').attributes('id')).toBe('plan-x')
    expect(w.attributes('id')).toBeUndefined()
    w.unmount()
  })
})
