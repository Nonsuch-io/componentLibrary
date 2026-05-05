import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsButton from './NsButton.vue'

describe('NsButton', () => {
  const mountButton = (props = {}, slots = {}) => {
    return mount(NsButton, { props, slots })
  }

  it('renders with default slot content', () => {
    const wrapper = mountButton({}, { default: 'Click Me' })
    expect(wrapper.text()).toContain('Click Me')
  })

  it('applies default props', () => {
    const wrapper = mountButton()
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.exists()).toBe(true)
    expect(qBtn.classes()).toContain('q-btn--unelevated')
    expect(qBtn.classes()).toContain('q-btn--no-uppercase')
  })

  it('applies default variant class', () => {
    const wrapper = mountButton()
    expect(wrapper.find('.ns-btn--primary').exists()).toBe(true)
  })

  it('applies variant class', () => {
    const wrapper = mountButton({ variant: 'negative' })
    expect(wrapper.find('.ns-btn--negative').exists()).toBe(true)
  })

  it('applies size class', () => {
    const wrapper = mountButton({ size: 'lg' })
    expect(wrapper.find('.ns-btn--lg').exists()).toBe(true)
  })

  it('applies icon-only class', () => {
    const wrapper = mountButton({ iconOnly: true })
    expect(wrapper.find('.ns-btn--icon-only').exists()).toBe(true)
  })

  it('passes through additional QBtn attributes', () => {
    const wrapper = mountButton({ disable: true })
    expect(wrapper.find('.q-btn').classes()).toContain('disabled')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mountButton({ loading: true })
    expect(wrapper.find('.q-spinner').exists() || wrapper.find('.q-spinner-dots').exists()).toBe(
      true,
    )
  })

  describe('accessibility', () => {
    it('sets aria-busy="true" when loading', () => {
      const wrapper = mountButton({ loading: true })
      expect(wrapper.find('.q-btn').attributes('aria-busy')).toBe('true')
    })

    it('sets aria-busy="false" when not loading', () => {
      const wrapper = mountButton({ loading: false })
      expect(wrapper.find('.q-btn').attributes('aria-busy')).toBe('false')
    })
  })
})
