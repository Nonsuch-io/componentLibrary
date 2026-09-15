import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPlanSelectionCard from './NsPlanSelectionCard.vue'
import NsPlanBuilder from '../NsPlanBuilder/NsPlanBuilder.vue'

describe('NsPlanSelectionCard', () => {
  it('is a section named by its own heading, with the slot as its contents', () => {
    const w = mount(NsPlanSelectionCard, {
      props: { title: 'Option 2: Choose a Combo' },
      slots: { default: '<p class="probe">combo</p>' },
    })
    expect(w.element.tagName).toBe('SECTION')
    const heading = w.find('h2')
    expect(heading.text()).toBe('Option 2: Choose a Combo')
    expect(w.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    expect(w.find('.probe').exists()).toBe(true)
    w.unmount()
  })

  it('binds and clamps the heading level', () => {
    expect(
      mount(NsPlanSelectionCard, { props: { title: 'T', level: 3 } })
        .find('h3')
        .exists(),
    ).toBe(true)
    expect(
      mount(NsPlanSelectionCard, { props: { title: 'T', level: 9 } })
        .find('h6')
        .exists(),
    ).toBe(true)
  })

  it("is NsPlanBuilder's root — the design draws both options in the same card", () => {
    const w = mount(NsPlanBuilder, {
      props: {
        title: 'Option 1: Build Your Plan',
        base: { name: 'butiq Base' },
        categories: [],
        total: { price: '$99' },
        level: 3,
      },
    })
    expect(w.classes()).toContain('ns-plan-selection-card')
    expect(w.classes()).toContain('ns-plan-builder')
    expect(w.find('h3').text()).toBe('Option 1: Build Your Plan')
    expect(w.attributes('aria-labelledby')).toBe(w.find('h3').attributes('id'))
    w.unmount()
  })
})
