import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTrustBar from './NsTrustBar.vue'

const items = [
  { text: 'No credit card', icon: 'x.svg' },
  { text: 'No commitment', icon: 'x.svg' },
  { text: 'Just an early look', icon: 'check.svg' },
]

function mockMatchMedia(reducedMotion: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: reducedMotion && query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

describe('NsTrustBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockMatchMedia(false)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the first item text on mount', () => {
    const wrapper = mount(NsTrustBar, { props: { items } })
    expect(wrapper.text()).toContain('No credit card')
  })

  it('should render the icon when provided', () => {
    const wrapper = mount(NsTrustBar, { props: { items } })
    expect(wrapper.find('.ns-trust-bar__icon').exists()).toBe(true)
  })

  it('should not render an icon element when item has no icon', () => {
    const wrapper = mount(NsTrustBar, {
      props: { items: [{ text: 'No icon here' }] },
    })
    expect(wrapper.find('.ns-trust-bar__icon').exists()).toBe(false)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsTrustBar, { props: { items } })
    expect(wrapper.find('.ns-trust-bar').exists()).toBe(true)
  })

  it('should cycle to the next item after the interval', async () => {
    const wrapper = mount(NsTrustBar, { props: { items, interval: 1000 } })
    expect(wrapper.text()).toContain('No credit card')
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No commitment')
  })

  it('should not start a timer when only one item is provided', () => {
    const spy = vi.spyOn(globalThis, 'setInterval')
    mount(NsTrustBar, { props: { items: [{ text: 'Solo item' }] } })
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('should use the default interval of 3000ms', async () => {
    const wrapper = mount(NsTrustBar, { props: { items } })
    vi.advanceTimersByTime(2999)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No credit card')
    vi.advanceTimersByTime(1)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No commitment')
  })

  it('should still cycle items when prefers-reduced-motion is set', async () => {
    mockMatchMedia(true)
    const wrapper = mount(NsTrustBar, { props: { items, interval: 1000 } })
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('No commitment')
  })
})
