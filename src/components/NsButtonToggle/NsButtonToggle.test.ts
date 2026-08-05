import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsButtonToggle from './NsButtonToggle.vue'

const defaultProps = {
  modelValue: 'a',
  options: [
    { label: 'A', value: 'a' },
    { label: 'B', value: 'b' },
  ],
}

describe('NsButtonToggle', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsButtonToggle, {
      props: defaultProps,
      slots: { default: 'Test content' },
    })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-button-toggle class', () => {
    const wrapper = mount(NsButtonToggle, { props: defaultProps })
    expect(wrapper.find('.ns-button-toggle').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsButtonToggle, {
      props: defaultProps,
      attrs: { 'data-testid': 'test-ns-button-toggle' },
    })
    expect(wrapper.find('.q-btn-toggle').attributes('data-testid')).toBe('test-ns-button-toggle')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsButtonToggle, {
        props: defaultProps,
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-btn-toggle').attributes('aria-label')).toBe('Test label')
    })
  })

  it('emits update:modelValue when toggled', async () => {
    const wrapper = mount(NsButtonToggle, { props: defaultProps })
    const buttons = wrapper.findAll('.q-btn')
    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsButtonToggle, { props: { ...defaultProps, disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})
