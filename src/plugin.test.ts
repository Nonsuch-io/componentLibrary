/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from 'vitest'
import { createApp, defineComponent, h, inject } from 'vue'
import { mount } from '@vue/test-utils'
import { createNonsuch } from './plugin'
import type { NsLocaleMessages } from './locale/NsLocaleMessages'
import { nsLocaleEnCA } from './locale/en-CA'
import { nsLocaleFrCA } from './locale/fr-CA'
import { NsLocaleKey } from './composables/useNsLocale'

describe('createNonsuch()', () => {
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
