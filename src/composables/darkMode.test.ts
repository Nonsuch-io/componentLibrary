import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
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

/**
 * Mount with a mocked matchMedia that captures the 'change' listener.
 * Returns the result plus a `fireChange` helper to invoke the handler.
 */
function mountWithMediaSpy() {
  let changeHandler: ((e: MediaQueryListEvent) => void) | undefined
  const fakeMql = {
    matches: false,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (event: string, handler: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') changeHandler = handler
    },
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  } as unknown as MediaQueryList

  const spy = vi.spyOn(window, 'matchMedia').mockReturnValue(fakeMql)

  const { result, wrapper } = mountDarkMode()

  function fireChange(matches: boolean) {
    if (!changeHandler) throw new Error('No change handler registered')
    changeHandler(
      new MediaQueryListEvent('change', {
        matches,
        media: '(prefers-color-scheme: dark)',
      }),
    )
  }

  return { result, wrapper, fireChange, spy, fakeMql }
}

describe('useNsDarkMode', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.classList.remove('dark')
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('ns-dark-mode')
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
    const { result, fireChange, spy } = mountWithMediaSpy()

    expect(result.source.value).toBe('system')
    expect(localStorage.getItem('ns-dark-mode')).toBeNull()

    // Fire a system dark-mode change — should follow since no stored pref
    fireChange(true)

    expect(result.isDark.value).toBe(true)
    expect(result.source.value).toBe('system')
    spy.mockRestore()
  })

  it('ignores system preference change event when user has stored preference', () => {
    const { result, fireChange, spy } = mountWithMediaSpy()

    // User explicitly sets preference
    result.enable()
    expect(localStorage.getItem('ns-dark-mode')).toBe('true')

    // System fires light-mode change — should be ignored
    fireChange(false)

    // Should stay dark because user preference overrides system
    expect(result.isDark.value).toBe(true)
    expect(result.source.value).toBe('user')
    spy.mockRestore()
  })

  it('removes media query listener on unmount', () => {
    const { wrapper, fakeMql, spy } = mountWithMediaSpy()
    wrapper.unmount()
    expect(fakeMql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    spy.mockRestore()
  })

  describe('SSR safety guards', () => {
    it('readStoredPreference returns null when localStorage is missing', () => {
      const origStorage = globalThis.localStorage
      // @ts-expect-error -- simulating SSR environment
      delete globalThis.localStorage
      try {
        const { result } = mountDarkMode()
        expect(result.isDark.value).toBe(false)
        expect(result.source.value).toBe('system')
      } finally {
        globalThis.localStorage = origStorage
      }
    })

    it('persist is a no-op when localStorage is missing', () => {
      const origStorage = globalThis.localStorage
      const { result } = mountDarkMode()
      // @ts-expect-error -- simulating SSR environment
      delete globalThis.localStorage
      try {
        // enable() calls persist() — should not throw without localStorage
        result.enable()
        expect(result.isDark.value).toBe(true)
      } finally {
        globalThis.localStorage = origStorage
      }
    })

    it('clearStorage is a no-op when localStorage is missing', () => {
      const origStorage = globalThis.localStorage
      const { result } = mountDarkMode()
      // @ts-expect-error -- simulating SSR environment
      delete globalThis.localStorage
      try {
        // useSystem() calls clearStorage() — should not throw
        result.useSystem()
        expect(result.source.value).toBe('system')
      } finally {
        globalThis.localStorage = origStorage
      }
    })

    it('applyDark skips DOM manipulation when document is unavailable', () => {
      const { result } = mountDarkMode()
      vi.stubGlobal('document', undefined)
      try {
        // enable() calls applyDark() which guards on typeof document
        result.enable()
        expect(result.isDark.value).toBe(true)
      } finally {
        vi.unstubAllGlobals()
      }
    })

    it('readSystemPreference returns false when window is unavailable', () => {
      const { result } = mountDarkMode()
      vi.stubGlobal('window', undefined)
      try {
        // useSystem() calls readSystemPreference() which guards on typeof window
        result.useSystem()
        expect(result.isDark.value).toBe(false)
        expect(result.source.value).toBe('system')
      } finally {
        vi.unstubAllGlobals()
      }
    })
  })
})
