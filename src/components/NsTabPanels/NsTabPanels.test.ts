import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTabPanels from './NsTabPanels.vue'

const defaultProps = { modelValue: 'panel-1' }

describe('NsTabPanels', () => {
  it('renders tab panels container', () => {
    const wrapper = mount(NsTabPanels, { props: defaultProps })
    expect(wrapper.find('.q-tab-panels').exists()).toBe(true)
  })

  it('applies the ns-tab-panels class', () => {
    const wrapper = mount(NsTabPanels, { props: defaultProps })
    expect(wrapper.find('.ns-tab-panels').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTabPanels, {
      props: defaultProps,
      attrs: { 'data-testid': 'test-ns-tab-panels' },
    })
    expect(wrapper.find('.q-tab-panels').attributes('data-testid')).toBe('test-ns-tab-panels')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTabPanels, {
        props: defaultProps,
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-tab-panels').attributes('aria-label')).toBe('Test label')
    })
  })

  it('emits update:modelValue when panel changes', async () => {
    const wrapper = mount(NsTabPanels, { props: defaultProps, slots: { default: 'panel content' } })
    // Trigger model update via the underlying QTabPanels component
    const qTabPanels = wrapper.findComponent({ name: 'QTabPanels' })
    qTabPanels.vm.$emit('update:modelValue', 'panel-2')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['panel-2'])
  })
})
