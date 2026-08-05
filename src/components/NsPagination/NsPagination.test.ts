import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPagination from './NsPagination.vue'

const defaultProps = { modelValue: 1, max: 5 }

describe('NsPagination', () => {
  it('renders pagination controls', () => {
    const wrapper = mount(NsPagination, { props: defaultProps })
    expect(wrapper.find('.q-pagination').exists()).toBe(true)
  })

  it('applies the ns-pagination class', () => {
    const wrapper = mount(NsPagination, { props: defaultProps })
    expect(wrapper.find('.ns-pagination').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsPagination, {
      props: defaultProps,
      attrs: { 'data-testid': 'test-ns-pagination' },
    })
    expect(wrapper.find('.q-pagination').attributes('data-testid')).toBe('test-ns-pagination')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsPagination, {
        props: defaultProps,
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-pagination').attributes('aria-label')).toBe('Test label')
    })
  })

  it('emits update:modelValue when page changes', async () => {
    const wrapper = mount(NsPagination, { props: defaultProps })
    const buttons = wrapper.findAll('.q-btn')
    // Click the next/last page button
    if (buttons.length > 1) {
      await buttons[buttons.length - 1].trigger('click')
    }
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsPagination, { props: { ...defaultProps, disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})
