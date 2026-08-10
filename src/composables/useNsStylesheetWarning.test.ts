import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { warnIfNsStylesheetMissing, __resetNsStylesheetWarning } from './useNsStylesheetWarning'

/**
 * UNIT-LEVEL COVERAGE ONLY. happy-dom's `getComputedStyle` reflects inline
 * styles set directly on an element, which is close enough to fake "the
 * sentinel resolves" — but it is NOT a real CSS cascade: no `<link>`, no
 * `<style>` tag, no actual stylesheet parsing. A test here can prove this
 * function's OWN logic (warn when empty, don't warn when non-empty, warn
 * once, respect the production/SSR guards) — it cannot prove the sentinel
 * rule survives the library build, isn't tree-shaken, or genuinely resolves
 * when a consumer loads `style.css` in a real browser. That is what the
 * Storybook/Chromium test (`src/stories/StylesLoaded.stories.ts`) and the
 * built-bundle dist test cover instead.
 */
describe('warnIfNsStylesheetMissing', () => {
  beforeEach(() => {
    __resetNsStylesheetWarning()
    document.documentElement.style.removeProperty('--ns-styles-loaded')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    document.documentElement.style.removeProperty('--ns-styles-loaded')
  })

  it('warns once when the sentinel custom property is not set', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    warnIfNsStylesheetMissing()

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('style.css')
    expect(message).toContain('Quasar')
  })

  it('does not warn when the sentinel custom property resolves', () => {
    document.documentElement.style.setProperty('--ns-styles-loaded', '1')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    warnIfNsStylesheetMissing()

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns only once even when called repeatedly', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    warnIfNsStylesheetMissing()
    warnIfNsStylesheetMissing()
    warnIfNsStylesheetMissing()

    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('does not warn when NODE_ENV is production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    warnIfNsStylesheetMissing()

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does not warn when `document` is undefined, as during Nuxt SSR', () => {
    vi.stubGlobal('document', undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() => warnIfNsStylesheetMissing()).not.toThrow()
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
