import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTabPanel from './NsTabPanel.vue'

const defaultProps = { name: 'panel-1' }

describe('NsTabPanel', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsTabPanel, { props: defaultProps, slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-tab-panel class', () => {
    const wrapper = mount(NsTabPanel, { props: defaultProps })
    expect(wrapper.find('.ns-tab-panel').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTabPanel, {
      props: defaultProps,
      attrs: { 'data-testid': 'test-ns-tab-panel' },
    })
    expect(wrapper.find('.q-tab-panel').attributes('data-testid')).toBe('test-ns-tab-panel')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTabPanel, {
        props: defaultProps,
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-tab-panel').attributes('aria-label')).toBe('Test label')
    })
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsTabPanel, { props: { ...defaultProps, disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})
