import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBannerSelectedPlan from './NsBannerSelectedPlan.vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsPlanHeader from '../NsPlanHeader/NsPlanHeader.vue'
import NsPlanHighlights from '../NsPlanHighlights/NsPlanHighlights.vue'
import NsPlanFeatures from '../NsPlanFeatures/NsPlanFeatures.vue'
import NsButton from '../NsButton/NsButton.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — the design's geometry (251 tall at 342,
 * the one-row header, the right-aligned md button) is in the stories under
 * Chromium. These are the contract: what is rendered from what, what a
 * screen reader is told, and that nothing here decides anything.
 */

const plan = {
  name: 'butiq Base + Add-Ons',
  price: '$133',
  period: '/mo',
  highlights: ['Billed monthly on the 13th', 'Cancel anytime'],
  features: ['butiq Base $99/mo', '500 additional items $5/mo', 'Small Team $29/mo'],
  actionLabel: 'Change Plan',
}

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsBannerSelectedPlan, { props: { ...plan, ...props } })

describe('NsBannerSelectedPlan — chrome only', () => {
  it('is the brand banner with the plan parts inside, in the design order', () => {
    const w = mountWith()
    const banner = w.findComponent(NsBanner)
    expect(banner.props('type')).toBe('brand')
    const parts = [...w.find('.ns-banner-selected-plan__body').element.children].map(
      (el) => el.className.split(' ')[0],
    )
    expect(parts).toEqual([
      'ns-plan-header',
      'ns-plan-highlights',
      'ns-plan-features',
      'ns-banner-selected-plan__actions',
    ])
    w.unmount()
  })

  it('hands the header the md size and the price exactly as given', () => {
    const w = mountWith({ price: '133,00 $' })
    const header = w.findComponent(NsPlanHeader)
    expect(header.props('size')).toBe('md')
    expect(header.find('.ns-plan-header__amount').text()).toBe('133,00 $')
    expect(header.find('.ns-plan-header__period').text()).toBe('/mo')
    w.unmount()
  })

  it('omits each optional part when it is absent or blank', () => {
    const w = mountWith({
      price: undefined,
      highlights: [],
      features: [],
      actionLabel: '  ',
    })
    expect(w.find('.ns-plan-header__price').exists()).toBe(false)
    expect(w.findComponent(NsPlanHighlights).exists()).toBe(false)
    expect(w.findComponent(NsPlanFeatures).exists()).toBe(false)
    expect(w.findComponent(NsButton).exists()).toBe(false)
    w.unmount()
  })

  it('emits change on the secondary button and does nothing else with it', async () => {
    const w = mountWith()
    const button = w.findComponent(NsButton)
    expect(button.props('variant')).toBe('secondary')
    expect(button.text()).toBe('Change Plan')
    await button.trigger('click')
    expect(w.emitted('change')).toEqual([[]])
    w.unmount()
  })
})

describe('NsBannerSelectedPlan — what a screen reader is told', () => {
  it('is an article named by the plan name heading, and the button is described by it', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('ARTICLE')
    const heading = w.find('h3')
    expect(heading.text()).toBe(plan.name)
    expect(w.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(w.findComponent(NsButton).attributes('aria-describedby')).toBe(heading.attributes('id'))
    w.unmount()
  })

  it('binds the heading level', () => {
    const w = mountWith({ level: 2 })
    expect(w.find('h2').exists()).toBe(true)
    w.unmount()
  })

  it('names the two lists from the locale', () => {
    const en = mountWith()
    expect(en.findComponent(NsPlanHighlights).attributes('aria-label')).toBe('Included modules')
    expect(en.findComponent(NsPlanFeatures).attributes('aria-label')).toBe('Included features')
    en.unmount()

    const fr = mount(NsBannerSelectedPlan, {
      props: plan,
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(fr.findComponent(NsPlanHighlights).attributes('aria-label')).toBe(
      nsLocaleFrCA.plan.highlights,
    )
    fr.unmount()
  })
})
