import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsToggle from './NsToggle.vue'

describe('NsToggle', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsToggle)
    expect(wrapper.find('.ns-toggle').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsToggle, { props: { label: 'Notifications' } })
    expect(wrapper.text()).toContain('Notifications')
  })

  it('applies ns-toggle class', () => {
    const wrapper = mount(NsToggle)
    expect(wrapper.classes()).toContain('ns-toggle')
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsToggle, { props: { dense: true } })
    expect(wrapper.find('.q-toggle--dense').exists()).toBe(true)
  })

  it('can be disabled', () => {
    const wrapper = mount(NsToggle, { props: { disable: true } })
    expect(wrapper.find('.disabled').exists()).toBe(true)
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(NsToggle, { props: { modelValue: false } })
    await wrapper.find('.q-toggle__inner').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  describe('accessibility', () => {
    it('has role="switch"', () => {
      const wrapper = mount(NsToggle)
      const toggle = wrapper.find('.q-toggle')
      expect(toggle.attributes('role')).toBe('switch')
    })

    it('reflects aria-checked when on', () => {
      const wrapper = mount(NsToggle, { props: { modelValue: true } })
      const toggle = wrapper.find('.q-toggle')
      expect(toggle.attributes('aria-checked')).toBe('true')
    })

    it('reflects aria-checked when off', () => {
      const wrapper = mount(NsToggle, { props: { modelValue: false } })
      const toggle = wrapper.find('.q-toggle')
      expect(toggle.attributes('aria-checked')).toBe('false')
    })
  })
})
