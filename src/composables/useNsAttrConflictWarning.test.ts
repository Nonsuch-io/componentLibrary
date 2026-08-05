import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import {
  useNsAttrConflictWarning,
  type NsAttrConflict,
  __resetAttrConflictWarnings,
} from './useNsAttrConflictWarning'

// Helper: a bare component that runs the guard against a fixed conflict list,
// mirroring how a real Ns wrapper (e.g. NsButton) would call it in setup().
const CONFLICTS: NsAttrConflict[] = [
  { attrs: ['color'], useInstead: 'variant' },
  { attrs: ['text-color', 'textColor'], useInstead: 'variant' },
  { attrs: ['flat'], useInstead: 'variant' },
]

const Harness = defineComponent({
  inheritAttrs: false,
  setup() {
    useNsAttrConflictWarning('Harness', CONFLICTS)
    return () => h('div')
  },
})

describe('useNsAttrConflictWarning', () => {
  beforeEach(() => __resetAttrConflictWarnings())
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('warns naming the component, the offending attr, and the prop to use instead', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, { attrs: { color: 'primary' } })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('Harness')
    expect(message).toContain('color')
    expect(message).toContain('variant')
  })

  it('warns for the kebab-case spelling of a multi-word attr', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, { attrs: { 'text-color': 'primary' } })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('text-color')
  })

  it('warns for the camelCase spelling of a multi-word attr', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, { attrs: { textColor: 'primary' } })

    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy.mock.calls[0][0]).toContain('textColor')
  })

  it('warns once per conflicting attr when multiple are present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, { attrs: { color: 'primary', flat: true } })

    expect(warnSpy).toHaveBeenCalledTimes(2)
  })

  it('does not warn for ordinary attrs unrelated to the conflict list', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, {
      attrs: { 'aria-label': 'Submit', 'data-testid': 'submit-btn', to: '/home', type: 'submit' },
    })

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does not warn when no conflicting attrs are passed at all', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness)

    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('does not warn when NODE_ENV is production, proving the production guard works', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(Harness, { attrs: { color: 'primary' } })

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
