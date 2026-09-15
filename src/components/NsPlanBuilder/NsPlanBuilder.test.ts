import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { markRaw, reactive } from 'vue'
import { PhPackage, PhUsersThree } from '@phosphor-icons/vue'
import NsPlanBuilder from './NsPlanBuilder.vue'
import NsPlanAddOn from './NsPlanAddOn.vue'
import NsBanner from '../NsBanner/NsBanner.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsTab from '../NsTab/NsTab.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'
import type { NsPlanAddOnCategory } from './types'

/**
 * NOTHING HERE MEASURES A PIXEL — the banner heights, the tab row and the
 * mobile stack are in the stories under Chromium. These are the contract:
 * nothing is computed, everything is emitted, and what a screen reader hears.
 */

const categories = (): NsPlanAddOnCategory[] => [
  {
    id: 'inventory',
    label: 'Inventory',
    icon: PhPackage,
    name: 'Inventory Items Top Up',
    description: 'More items.',
    options: [
      { id: 'inv-250', name: '+250 items', price: '$5', period: '/mo' },
      { id: 'inv-1000', name: '+1,000 items', price: '$15', period: '/mo', added: true },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    icon: PhUsersThree,
    name: 'Growing Team',
    options: [{ id: 'team-5', name: '+5 team members', price: '$10', period: '/mo' }],
  },
]

const base = { name: 'butiq Base', price: '$99', period: '/mo', note: '+ Add-Ons' }
const total = { price: '$114', period: '/mo', note: 'butiq Base $99 + 1 add-on' }

const mountWith = (props: Record<string, unknown> = {}) =>
  mount(NsPlanBuilder, {
    props: {
      title: 'Option 1: Build Your Plan',
      base,
      categories: categories(),
      total,
      actionLabel: 'Continue With This Plan',
      ...props,
    },
  })

describe('NsPlanBuilder — chrome only', () => {
  it('renders every string as handed and computes nothing', async () => {
    const w = mountWith()
    expect(w.find('.ns-plan-builder__base-name').text()).toBe('butiq Base')
    expect(w.find('.ns-plan-builder__base-price').text()).toBe('$99')
    expect(w.find('.ns-plan-builder__base-note').text()).toBe('+ Add-Ons')
    expect(w.find('.ns-plan-builder__total-amount').text()).toBe('$114')
    expect(w.find('.ns-plan-builder__total-note').text()).toBe('butiq Base $99 + 1 add-on')

    // Add something: the total does NOT move. It is the consumer's number.
    await w.find('.ns-plan-add-on__add').trigger('click')
    expect(w.find('.ns-plan-builder__total-amount').text()).toBe('$114')
    // …and the option is not marked added either; nothing changed until the consumer changes it.
    expect(w.findAll('.ns-plan-add-on__option--added').length).toBe(1)
    w.unmount()
  })

  it('emits add and remove with the option AND its category, and select from the action', async () => {
    const w = mountWith()
    await w.find('.ns-plan-add-on__add').trigger('click')
    await w.find('.ns-plan-add-on__remove').trigger('click')
    await w.find('.ns-plan-builder__action').trigger('click')
    expect(w.emitted('add')![0][0]).toMatchObject({ id: 'inv-250' })
    expect(w.emitted('add')![0][1]).toMatchObject({ id: 'inventory' })
    expect(w.emitted('remove')![0][0]).toMatchObject({ id: 'inv-1000' })
    expect(w.emitted('remove')![0][1]).toMatchObject({ id: 'inventory' })
    expect(w.emitted('select')).toEqual([[]])
    w.unmount()
  })

  it('shows Add for an option not yet added and Remove + a badge for one that is', () => {
    const w = mountWith()
    const [first, second] = w.findAll('.ns-plan-add-on__option')
    expect(first.find('.ns-plan-add-on__add').exists()).toBe(true)
    expect(first.find('.ns-plan-add-on__added').exists()).toBe(false)
    expect(second.find('.ns-plan-add-on__remove').exists()).toBe(true)
    expect(second.find('.ns-plan-add-on__added').text()).toBe('Added')
    w.unmount()
  })

  it('omits the base price row, the note, and the action when absent', () => {
    const w = mountWith({
      base: { name: 'butiq Base' },
      total: { price: '$99' },
      actionLabel: undefined,
    })
    expect(w.find('.ns-plan-builder__base-details').exists()).toBe(false)
    expect(w.find('.ns-plan-builder__total-note').exists()).toBe(false)
    expect(w.find('.ns-plan-builder__total-period').exists()).toBe(false)
    expect(w.find('.ns-plan-builder__actions').exists()).toBe(false)
    w.unmount()
  })
})

describe('NsPlanBuilder — categories', () => {
  it('shows the first category by default, switches on tab change, and emits the change', async () => {
    const w = mountWith()
    expect(w.findComponent(NsPlanAddOn).props('category')).toMatchObject({ id: 'inventory' })
    expect(w.findAllComponents(NsTab).length).toBe(2)
    // The tab component's model change, as QTabs would emit it.
    await w.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'team')
    expect(w.emitted('update:category')).toEqual([['team']])
    expect(w.findComponent(NsPlanAddOn).props('category')).toMatchObject({ id: 'team' })
    w.unmount()
  })

  it('follows a controlled `category` and falls back to the first for an unknown id', async () => {
    const w = mountWith({ category: 'team' })
    expect(w.findComponent(NsPlanAddOn).props('category')).toMatchObject({ id: 'team' })
    await w.findComponent({ name: 'QTabs' }).vm.$emit('update:modelValue', 'inventory')
    expect(w.emitted('update:category')).toEqual([['inventory']])
    expect(w.findComponent(NsPlanAddOn).props('category')).toMatchObject({ id: 'team' }) // parent has not agreed
    await w.setProps({ category: 'nope' })
    expect(w.findComponent(NsPlanAddOn).props('category')).toMatchObject({ id: 'inventory' })
    w.unmount()
  })

  it('renders no tabs for a single category, and no card for none', () => {
    const one = mountWith({ categories: [categories()[0]] })
    expect(one.findAllComponents(NsTab).length).toBe(0)
    expect(one.findComponent(NsPlanAddOn).exists()).toBe(true)
    one.unmount()
    const none = mountWith({ categories: [] })
    expect(none.findComponent(NsPlanAddOn).exists()).toBe(false)
    none.unmount()
  })

  it('does not warn when the categories live in reactive state (the icon is a proxy)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const state = reactive({ categories: categories() })
    const w = mountWith({ categories: state.categories })
    expect(warn.mock.calls.map((c) => String(c[0]))).not.toContainEqual(
      expect.stringContaining('made a reactive object'),
    )
    warn.mockRestore()
    w.unmount()
    // …and markRaw'd icons are still fine.
    const raw = mountWith({
      categories: categories().map((c) => ({ ...c, icon: markRaw(c.icon!) })),
    })
    expect(raw.findComponent(NsPlanAddOn).find('svg').exists()).toBe(true)
    raw.unmount()
  })
})

describe('NsPlanBuilder — what a screen reader is told', () => {
  it('is a section named by its title; the card is a section named by the category; buttons are described by their option', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('SECTION')
    const title = w.find('h2')
    expect(title.text()).toBe('Option 1: Build Your Plan')
    expect(w.attributes('aria-labelledby')).toBe(title.attributes('id'))

    const card = w.findComponent(NsPlanAddOn)
    expect(card.element.tagName).toBe('SECTION')
    expect(card.attributes('aria-labelledby')).toBe(card.find('h4').attributes('id'))
    const add = card.find('.ns-plan-add-on__add')
    expect(add.attributes('aria-describedby')).toBe(
      card.find('.ns-plan-add-on__option-name').attributes('id'),
    )
    // The tab points at the panel it controls.
    expect(w.findComponent(NsTab).attributes('aria-controls')).toBe(card.attributes('id'))
    w.unmount()
  })

  it('renders the two banners as surfaces: no role, no aria-live', () => {
    const w = mountWith()
    const banners = w.findAllComponents(NsBanner)
    expect(banners.map((b) => b.props('type'))).toEqual(['brand', 'accent'])
    for (const b of banners) {
      expect(b.attributes('role')).toBeUndefined()
      expect(b.attributes('aria-live')).toBeUndefined()
    }
    w.unmount()
  })

  it('speaks the injected locale', () => {
    const fr = mount(NsPlanBuilder, {
      props: { title: 'T', base, categories: categories(), total },
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(fr.find('.ns-plan-builder__add-ons-title').text()).toBe('Choisir des options')
    expect(fr.find('.ns-plan-builder__total-label').text()).toBe('Votre total')
    expect(fr.find('.ns-plan-add-on__add').text()).toBe('Ajouter')
    expect(fr.find('.ns-plan-add-on__added').text()).toBe('Ajoutée')
    fr.unmount()
  })
})

describe('NsBanner — surface tones', () => {
  it('brand and accent carry no role or aria-live; the message types still do', () => {
    for (const type of ['brand', 'accent'] as const) {
      const w = mount(NsBanner, { props: { type }, slots: { default: 'x' } })
      expect(w.classes()).toContain(`ns-banner--${type}`)
      expect(w.attributes('role')).toBeUndefined()
      expect(w.attributes('aria-live')).toBeUndefined()
      w.unmount()
    }
    const info = mount(NsBanner, { props: { type: 'info' }, slots: { default: 'x' } })
    expect(info.attributes('role')).toBe('status')
    expect(info.attributes('aria-live')).toBe('polite')
    info.unmount()
  })

  it('does not warn for the new tones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsBanner, { props: { type: 'accent' }, slots: { default: 'x' } }).unmount()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('NsPlanAddOn', () => {
  it('passes the button size through to both buttons', () => {
    const w = mount(NsPlanAddOn, { props: { category: categories()[0], buttonSize: 'lg' } })
    for (const b of w.findAllComponents(NsButton)) expect(b.props('size')).toBe('lg')
    w.unmount()
  })
})
