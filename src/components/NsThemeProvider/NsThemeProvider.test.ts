import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, inject } from 'vue'
import NsThemeProvider from './NsThemeProvider.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleEnCA } from '../../locale/en-CA'
import { nsLocaleFrCA } from '../../locale/fr-CA'
import type { NsLocaleMessages } from '../../locale/NsLocaleMessages'

function createChild() {
  let injected: NsLocaleMessages | undefined

  const Child = defineComponent({
    setup() {
      injected = inject(NsLocaleKey)
      return () => h('span', injected?.common.loading)
    },
  })

  return { Child, getInjected: () => injected }
}

describe('NsThemeProvider', () => {
  it('renders slot content', () => {
    const wrapper = mount(NsThemeProvider, {
      slots: { default: () => h('div', { class: 'child' }, 'Hello') },
    })
    expect(wrapper.find('.child').text()).toBe('Hello')
  })

  it('provides en-CA locale by default', () => {
    const { Child, getInjected } = createChild()

    mount(NsThemeProvider, {
      slots: { default: () => h(Child) },
    })

    expect(getInjected()).toBeDefined()
    expect(getInjected()!.common.loading).toBe(nsLocaleEnCA.common.loading)
  })

  it('provides custom locale when specified', () => {
    const { Child, getInjected } = createChild()

    mount(NsThemeProvider, {
      props: { locale: nsLocaleFrCA },
      slots: { default: () => h(Child) },
    })

    expect(getInjected()).toBeDefined()
    expect(getInjected()!.common.loading).toBe('Chargement…')
    expect(getInjected()!.product.addToCart).toBe('Ajouter au panier')
  })
})
