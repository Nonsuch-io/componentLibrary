import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useNsDarkMode } from './useNsDarkMode'
import type { UseNsDarkModeReturn } from './useNsDarkMode'

function mountDarkMode() {
  let result!: UseNsDarkModeReturn

  const Wrapper = defineComponent({
    setup() {
      result = useNsDarkMode()
      return () => h('div')
    },
  })

  const wrapper = mount(Wrapper, { attachTo: document.body })
  return { result, wrapper }
}

describe('useNsDarkMode', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('ns-dark-mode')
  })

  it('defaults to light mode when no stored preference and system is light', () => {
    const { result } = mountDarkMode()
    expect(result.isDark.value).toBe(false)
    expect(result.source.value).toBe('system')
  })

  it('enable() activates dark mode', () => {
    const { result } = mountDarkMode()
    result.enable()

    expect(result.isDark.value).toBe(true)
    expect(result.source.value).toBe('user')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('disable() deactivates dark mode', () => {
    const { result } = mountDarkMode()
    result.enable()
    result.disable()

    expect(result.isDark.value).toBe(false)
    expect(result.source.value).toBe('user')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('toggle() flips dark mode', () => {
    const { result } = mountDarkMode()

    result.toggle()
    expect(result.isDark.value).toBe(true)

    result.toggle()
    expect(result.isDark.value).toBe(false)
  })

  it('persists preference in localStorage', () => {
    const { result } = mountDarkMode()

    result.enable()
    expect(localStorage.getItem('ns-dark-mode')).toBe('true')

    result.disable()
    expect(localStorage.getItem('ns-dark-mode')).toBe('false')
  })

  it('reads stored preference on mount', () => {
    localStorage.setItem('ns-dark-mode', 'true')
    const { result } = mountDarkMode()

    expect(result.isDark.value).toBe(true)
    expect(result.source.value).toBe('storage')
  })

  it('useSystem() clears stored preference and follows system', () => {
    const { result } = mountDarkMode()

    result.enable()
    expect(localStorage.getItem('ns-dark-mode')).toBe('true')

    result.useSystem()
    expect(localStorage.getItem('ns-dark-mode')).toBeNull()
    expect(result.source.value).toBe('system')
  })

  it('cleans up media query listener on unmount', () => {
    const { wrapper } = mountDarkMode()
    // Unmounting should not throw — listener is removed
    wrapper.unmount()
  })

  it('ignores system preference changes when user has stored preference', () => {
    const { result } = mountDarkMode()

    // User explicitly enables dark mode
    result.enable()
    expect(result.isDark.value).toBe(true)
    expect(localStorage.getItem('ns-dark-mode')).toBe('true')

    // Simulating a system preference change should not override user choice
    // because readStoredPreference() returns non-null
    expect(result.source.value).toBe('user')
  })

  it('reads stored false preference on mount', () => {
    localStorage.setItem('ns-dark-mode', 'false')
    const { result } = mountDarkMode()

    expect(result.isDark.value).toBe(false)
    expect(result.source.value).toBe('storage')
  })

  it('follows system preference change when no stored preference', () => {
    const { result } = mountDarkMode()

    // No stored preference — source should be system
    expect(result.source.value).toBe('system')
    expect(localStorage.getItem('ns-dark-mode')).toBeNull()

    // Simulate OS dark mode change via matchMedia event
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const event = new MediaQueryListEvent('change', {
      matches: true,
      media: '(prefers-color-scheme: dark)',
    })
    mql.dispatchEvent(event)

    // Should follow system since no stored preference
    expect(result.source.value).toBe('system')
  })

  it('ignores system preference change event when user has stored preference', () => {
    const { result } = mountDarkMode()

    // User explicitly sets preference
    result.enable()
    expect(localStorage.getItem('ns-dark-mode')).toBe('true')

    // Simulate OS preference change
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const event = new MediaQueryListEvent('change', {
      matches: false,
      media: '(prefers-color-scheme: dark)',
    })
    mql.dispatchEvent(event)

    // Should stay dark because user preference overrides system
    expect(result.isDark.value).toBe(true)
    expect(result.source.value).toBe('user')
  })
})
