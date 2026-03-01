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
})
