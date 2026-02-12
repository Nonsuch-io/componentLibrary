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
})
