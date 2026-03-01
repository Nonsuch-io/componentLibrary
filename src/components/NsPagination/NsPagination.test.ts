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
})
