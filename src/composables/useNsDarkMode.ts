import { ref, onMounted, onUnmounted, type Ref, readonly } from 'vue'

const STORAGE_KEY = 'ns-dark-mode'

type DarkModeSource = 'user' | 'system' | 'storage'

export interface UseNsDarkModeReturn {
  /** Whether dark mode is currently active */
  isDark: Readonly<Ref<boolean>>
  /** What triggered the current state */
  source: Readonly<Ref<DarkModeSource>>
  /** Enable dark mode */
  enable: () => void
  /** Disable dark mode */
  disable: () => void
  /** Toggle dark mode */
  toggle: () => void
  /** Reset to system preference (clears localStorage override) */
  useSystem: () => void
}

/**
 * Dark-mode composable that syncs the document root classes/attributes
 * with the design-token dark selectors and persists user preference.
 *
 * Activation order:
 * 1. localStorage override (if previously set by user)
 * 2. OS `prefers-color-scheme: dark`
 * 3. Explicit `enable()` / `disable()` / `toggle()` calls
 *
 * This sets `class="dark"` and `data-theme="dark"` on `<html>`,
 * matching the selectors in `tokens.css`.
 *
 * @example
 * ```ts
 * import { useNsDarkMode } from '@nonsuch/component-library'
 *
 * const { isDark, toggle } = useNsDarkMode()
 * ```
 */
export function useNsDarkMode(): UseNsDarkModeReturn {
  const isDark = ref(false)
  const source = ref<DarkModeSource>('system')
  let mediaQuery: MediaQueryList | null = null
  // Initialise as no-op so cleanup never needs a null check
  let mediaHandler: (e: MediaQueryListEvent) => void = () => {}

  function applyDark(dark: boolean) {
    isDark.value = dark

    if (typeof document !== 'undefined') {
      const el = document.documentElement
      el.classList.toggle('dark', dark)
      el.setAttribute('data-theme', dark ? 'dark' : 'light')
    }
  }

  function readSystemPreference(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  function readStoredPreference(): boolean | null {
    if (typeof localStorage === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return null
  }

  function persist(dark: boolean) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(dark))
    }
  }

  function clearStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function enable() {
    source.value = 'user'
    persist(true)
    applyDark(true)
  }

  function disable() {
    source.value = 'user'
    persist(false)
    applyDark(false)
  }

  function toggle() {
    if (isDark.value) {
      disable()
    } else {
      enable()
    }
  }

  function useSystem() {
    clearStorage()
    source.value = 'system'
    applyDark(readSystemPreference())
  }

  // Initialise from stored preference or system
  function init() {
    const stored = readStoredPreference()
    if (stored !== null) {
      source.value = 'storage'
      applyDark(stored)
    } else {
      source.value = 'system'
      applyDark(readSystemPreference())
    }

    // Listen for OS preference changes
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaHandler = (e: MediaQueryListEvent) => {
        // Only follow system if user hasn't explicitly chosen
        if (readStoredPreference() === null) {
          source.value = 'system'
          applyDark(e.matches)
        }
      }
      mediaQuery.addEventListener('change', mediaHandler)
    }
  }

  onMounted(init)

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', mediaHandler)
  })

  return {
    isDark: readonly(isDark),
    source: readonly(source),
    enable,
    disable,
    toggle,
    useSystem,
  }
}
