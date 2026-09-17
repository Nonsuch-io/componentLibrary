import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { PhPackage } from '@phosphor-icons/vue'
import NsBaseSummary from './NsBaseSummary.vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsTooltip from '../NsTooltip/NsTooltip.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — the design's geometry (the 1:2 row, the
 * balanced 3 | 4 list, the 56px callout) is in the stories under Chromium.
 * These are the contract: what is rendered from what, what a screen reader
 * is told, and that nothing here decides anything.
 */

const base = {
  title: 'All plans start with the butiq Base.',
  subtitle: 'What’s included in butiq’s Base?',
  areas: [
    {
      id: 'pos',
      title: 'Core POS & Check Out Tools',
      features: [
        { id: 'dash', text: 'Shop management dashboard', tooltip: 'Sales and stock in one place.' },
        { id: 'discounts', text: 'Discounts' },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: PhPackage,
      columns: 2 as const,
      features: [
        { id: 'a', text: 'Stock counting & auditing' },
        { id: 'b', text: 'Low & out of stock alerts' },
        { id: 'c', text: 'Order receiving' },
      ],
    },
  ],
  alert: 'Calling market sellers! This Base is all you need at your next market.',
}

const mountWith = (props: Record<string, unknown> = {}, provide: Record<symbol, unknown> = {}) =>
  mount(NsBaseSummary, { props: { ...base, ...props }, global: { provide } })

describe('NsBaseSummary — chrome only', () => {
  it('renders the title, subtitle, one card per area and the callout, in order', () => {
    const w = mountWith()
    // QBanner's own class comes first on the callout; ours is on it too.
    const parts = [...w.element.children].map(
      (el) => [...el.classList].find((c) => c.startsWith('ns-base-summary')) ?? el.className,
    )
    expect(parts).toEqual([
      'ns-base-summary__title',
      'ns-base-summary__subtitle',
      'ns-base-summary__areas',
      'ns-base-summary__alert',
    ])
    expect(w.findAll('.ns-feature-card').length).toBe(2)
    w.unmount()
  })

  it('a click on a tip toggles its tooltip (a tap has no hover and no focus)', async () => {
    const w = mount(NsBaseSummary, { props: base, attachTo: document.body })
    const tip = w.find('.ns-feature-card__tip')
    await tip.trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    expect(document.querySelector('.ns-tooltip'), 'shown by the click').not.toBeNull()
    await tip.trigger('click')
    await new Promise((r) => setTimeout(r, 0))
    expect(document.querySelector('.ns-tooltip'), 'hidden by the second').toBeNull()
    w.unmount()
  })

  it('renders each feature as a list item with its text, and a tip button only where there is a tooltip', () => {
    const w = mountWith()
    const pos = w.findAll('.ns-feature-card')[0]
    const items = pos.findAll('li')
    expect(items.map((li) => li.find('.ns-feature-card__text').text())).toEqual([
      'Shop management dashboard',
      'Discounts',
    ])
    expect(items[0].find('button').exists()).toBe(true)
    expect(items[1].find('button').exists()).toBe(false)
    expect(w.findAllComponents(NsTooltip).length).toBe(1)
    w.unmount()
  })

  it('marks a two-column area, and renders the icon only where there is one', () => {
    const w = mountWith()
    const [pos, inventory] = w.findAll('.ns-feature-card')
    expect(pos.classes()).toContain('ns-feature-card--1')
    expect(inventory.classes()).toContain('ns-feature-card--2')
    expect(pos.find('.ns-feature-card__icon').exists()).toBe(false)
    expect(inventory.find('.ns-feature-card__icon').exists()).toBe(true)
    // The row's tracks are the column counts.
    expect(
      (w.find('.ns-base-summary__areas').element as HTMLElement).style.getPropertyValue(
        '--ns-base-summary-columns',
      ),
    ).toBe('1fr 2fr')
    w.unmount()
  })

  it('puts the callout on the promo banner tone, and omits it — and the subtitle — when blank', () => {
    const w = mountWith()
    const banner = w.findComponent(NsBanner)
    expect(banner.props('type')).toBe('promo')
    // A surface, not a status: review deleted 'promo' from SURFACE_TYPES and
    // the callout became role="status" aria-live="polite" with every test green.
    expect(banner.attributes('role')).toBeUndefined()
    expect(banner.attributes('aria-live')).toBeUndefined()
    expect(w.find('.ns-base-summary__alert-text').text()).toBe(base.alert)
    w.unmount()
    const bare = mountWith({ subtitle: '  ', alert: '', areas: [] })
    expect(bare.findComponent(NsBanner).exists()).toBe(false)
    expect(bare.find('.ns-base-summary__subtitle').exists()).toBe(false)
    expect(bare.find('.ns-base-summary__areas').exists()).toBe(false)
    bare.unmount()
  })
})

describe('NsBaseSummary — what a screen reader is told', () => {
  it('is a section named by its heading, each area a section named by its heading one level down', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('SECTION')
    const h2 = w.find('h2')
    expect(h2.text()).toBe(base.title)
    expect(w.attributes('aria-labelledby')).toBe(h2.attributes('id'))
    for (const area of w.findAll('.ns-feature-card')) {
      const h3 = area.find('h3')
      expect(h3.exists()).toBe(true)
      expect(area.attributes('aria-labelledby')).toBe(h3.attributes('id'))
    }
    w.unmount()
  })

  it('follows the level down and clamps at 6', () => {
    const w = mountWith({ level: 6 })
    expect(w.find('h6.ns-base-summary__title').exists()).toBe(true)
    expect(w.find('.ns-feature-card h6').exists()).toBe(true)
    w.unmount()
  })

  it('names each tip button for its feature, from the locale', () => {
    const en = mountWith()
    expect(en.find('.ns-feature-card__tip').attributes('aria-label')).toBe(
      'More about Shop management dashboard',
    )
    en.unmount()
    const fr = mountWith({}, { [NsLocaleKey as symbol]: nsLocaleFrCA })
    expect(fr.find('.ns-feature-card__tip').attributes('aria-label')).toBe(
      'En savoir plus sur Shop management dashboard',
    )
    fr.unmount()
  })

  it('keeps the feature lists real lists (role restated for WebKit)', () => {
    const w = mountWith()
    for (const list of w.findAll('.ns-feature-card__features')) {
      expect(list.element.tagName).toBe('UL')
      expect(list.attributes('role')).toBe('list')
    }
    w.unmount()
  })
})
