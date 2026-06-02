import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsStepRow from './NsStepRow.vue'

describe('NsStepRow', () => {
  it('should render the number prop', () => {
    const wrapper = mount(NsStepRow, { props: { number: 2 } })
    expect(wrapper.text()).toContain('2')
  })

  it('should render slot content when default slot is provided', () => {
    const wrapper = mount(NsStepRow, {
      props: { number: 1 },
      slots: { default: 'A breakdown of why Shopify works for some shops' },
    })
    expect(wrapper.text()).toContain('A breakdown of why Shopify works for some shops')
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsStepRow, { props: { number: 1 } })
    expect(wrapper.find('.ns-step-row').exists()).toBe(true)
  })

  it('should render a separator line', () => {
    const wrapper = mount(NsStepRow, { props: { number: 1 } })
    expect(wrapper.find('.ns-step-row__separator').exists()).toBe(true)
  })

  it('should render the number tile with the correct number', () => {
    const wrapper = mount(NsStepRow, { props: { number: 3 } })
    expect(wrapper.find('.ns-number-tile__number').text()).toBe('3')
  })
})
