import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSelect from './NsSelect.vue'

describe('NsSelect', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.find('.ns-select').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsSelect, { props: { label: 'Country' } })
    expect(wrapper.text()).toContain('Country')
  })

  it('defaults to outlined style', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.find('.q-field--outlined').exists()).toBe(true)
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsSelect, { props: { dense: true } })
    expect(wrapper.find('.q-field--dense').exists()).toBe(true)
  })

  it('applies ns-select class', () => {
    const wrapper = mount(NsSelect)
    expect(wrapper.classes()).toContain('ns-select')
  })

  it('renders with options provided', () => {
    const wrapper = mount(NsSelect, {
      props: { options: ['A', 'B', 'C'] },
    })
    expect(wrapper.find('.ns-select').exists()).toBe(true)
  })

  it('forwards prepend slot to q-select', () => {
    const wrapper = mount(NsSelect, {
      slots: { prepend: '<span class="test-prepend">Icon</span>' },
    })
    expect(wrapper.find('.test-prepend').exists()).toBe(true)
  })
})
