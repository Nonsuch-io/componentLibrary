/* eslint-disable vue/one-component-per-file */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createApp, defineComponent, h, inject } from 'vue'
import { mount } from '@vue/test-utils'
import { createNonsuch } from './plugin'
import type { NsLocaleMessages } from './locale/NsLocaleMessages'
import { nsLocaleEnCA } from './locale/en-CA'
import { nsLocaleFrCA } from './locale/fr-CA'
import { NsLocaleKey } from './composables/useNsLocale'
import { __resetNsStylesheetWarning } from './composables/useNsStylesheetWarning'

describe('createNonsuch()', () => {
  // Every test in this file installs the plugin, which now also runs the
  // stylesheet check (componentLibrary-07u). happy-dom never loads a real
  // stylesheet, so left unmocked every test below would print a warning —
  // noisy, and it would make the FIRST test's mount silently own the
  // warn-once state for the rest of the file. Reset the state and swallow
  // the warning here; the dedicated describe block below asserts on it
  // explicitly.
  beforeEach(() => {
    __resetNsStylesheetWarning()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a Vue plugin with an install method', () => {
    const plugin = createNonsuch()
    expect(plugin).toHaveProperty('install')
    expect(typeof plugin.install).toBe('function')
  })

  it('provides en-CA locale by default', () => {
    let injected: NsLocaleMessages | undefined

    const Child = defineComponent({
      setup() {
        injected = inject(NsLocaleKey)
        return () => h('div')
      },
    })

    mount(Child, {
      global: {
        plugins: [createNonsuch()],
      },
    })

    expect(injected).toBeDefined()
    expect(injected!.common.loading).toBe(nsLocaleEnCA.common.loading)
    expect(injected!.product.addToCart).toBe('Add to cart')
  })

  it('accepts a custom locale', () => {
    let injected: NsLocaleMessages | undefined

    const Child = defineComponent({
      setup() {
        injected = inject(NsLocaleKey)
        return () => h('div')
      },
    })

    mount(Child, {
      global: {
        plugins: [createNonsuch({ locale: nsLocaleFrCA })],
      },
    })

    expect(injected).toBeDefined()
    expect(injected!.common.loading).toBe('Chargement…')
    expect(injected!.product.addToCart).toBe('Ajouter au panier')
  })

  it('works with createApp().use() pattern', () => {
    let injected: NsLocaleMessages | undefined

    const Root = defineComponent({
      setup() {
        injected = inject(NsLocaleKey)
        return () => h('div')
      },
    })

    const app = createApp(Root)
    app.use(createNonsuch())

    const el = document.createElement('div')
    app.mount(el)

    expect(injected).toBeDefined()
    expect(injected!.common.cancel).toBe('Cancel')

    app.unmount()
  })
})

describe('createNonsuch() stylesheet check (componentLibrary-07u)', () => {
  beforeEach(() => {
    __resetNsStylesheetWarning()
    document.documentElement.style.removeProperty('--ns-styles-loaded')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.style.removeProperty('--ns-styles-loaded')
  })

  it('warns on install() when the stylesheet sentinel is not present', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const app = createApp(defineComponent({ render: () => h('div') }))
    app.use(createNonsuch())

    expect(warnSpy).toHaveBeenCalledTimes(1)
    const message = warnSpy.mock.calls[0][0] as string
    expect(message).toContain('style.css')
    expect(message).toContain('Quasar')
  })

  it('does not warn on install() when the stylesheet sentinel resolves', () => {
    document.documentElement.style.setProperty('--ns-styles-loaded', '1')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const app = createApp(defineComponent({ render: () => h('div') }))
    app.use(createNonsuch())

    expect(warnSpy).not.toHaveBeenCalled()
  })
})
