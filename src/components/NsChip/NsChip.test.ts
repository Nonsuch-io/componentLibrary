import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsChip from './NsChip.vue'

describe('NsChip', () => {
  it('renders default slot content', () => {
    const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
    expect(wrapper.text()).toContain('Tag')
  })

  it('applies the ns-chip class', () => {
    const wrapper = mount(NsChip)
    expect(wrapper.find('.ns-chip').exists()).toBe(true)
  })

  describe('variant', () => {
    it('defaults to primary', () => {
      const wrapper = mount(NsChip)
      expect(wrapper.find('.ns-chip--primary').exists()).toBe(true)
    })

    it.each(['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning'] as const)(
      'applies the ns-chip--%s class',
      (variant) => {
        const wrapper = mount(NsChip, { props: { variant } })
        expect(wrapper.find(`.ns-chip--${variant}`).exists()).toBe(true)
      },
    )
  })

  describe('outline', () => {
    it('does not apply ns-chip--outline by default', () => {
      const wrapper = mount(NsChip)
      expect(wrapper.find('.ns-chip--outline').exists()).toBe(false)
    })

    it('applies ns-chip--outline when set', () => {
      const wrapper = mount(NsChip, { props: { outline: true } })
      expect(wrapper.find('.ns-chip--outline').exists()).toBe(true)
    })
  })

  describe('dense', () => {
    it('does not apply ns-chip--dense by default', () => {
      const wrapper = mount(NsChip)
      expect(wrapper.find('.ns-chip--dense').exists()).toBe(false)
    })

    it('applies ns-chip--dense when set', () => {
      const wrapper = mount(NsChip, { props: { dense: true } })
      expect(wrapper.find('.ns-chip--dense').exists()).toBe(true)
    })
  })

  it('forwards arbitrary attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsChip, { attrs: { 'data-testid': 'test-chip' } })
    expect(wrapper.find('.q-chip').attributes('data-testid')).toBe('test-chip')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsChip, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-chip').attributes('aria-label')).toBe('Test label')
    })
  })
})
