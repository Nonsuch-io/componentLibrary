import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsButton from './NsButton.vue'

describe('NsButton', () => {
  const mountButton = (props = {}, slots = {}) => {
    return mount(NsButton, {
      props,
      slots,
    })
  }

  it('renders with default slot content', () => {
    const wrapper = mountButton({}, { default: 'Click Me' })
    expect(wrapper.text()).toContain('Click Me')
  })

  it('applies default props', () => {
    const wrapper = mountButton()
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.exists()).toBe(true)
    // Default: unelevated, no-caps, rounded
    expect(qBtn.classes()).toContain('q-btn--unelevated')
    expect(qBtn.classes()).toContain('q-btn--no-uppercase')
    expect(qBtn.classes()).toContain('q-btn--rounded')
  })

  it('accepts color prop', () => {
    const wrapper = mountButton({ color: 'negative' })
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.classes()).toContain('bg-negative')
  })

  it('accepts size prop', () => {
    const wrapper = mountButton({ size: 'lg' })
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.exists()).toBe(true)
  })

  it('passes through additional QBtn attributes', () => {
    const wrapper = mountButton({ disable: true })
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.classes()).toContain('disabled')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mountButton({ loading: true })
    // QBtn renders a loading indicator element when loading
    expect(wrapper.find('.q-spinner').exists() || wrapper.find('.q-spinner-dots').exists()).toBe(true)
  })

  it('does not show loading state by default', () => {
    const wrapper = mountButton()
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.attributes('aria-disabled')).toBeUndefined()
  })
})
