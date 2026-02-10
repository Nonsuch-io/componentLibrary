/* eslint-disable vue/one-component-per-file */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { provideNsLocale, useNsLocale } from './useNsLocale'
import { useNsDefault } from './useNsDefaults'
import { nsLocaleEnCA } from '../locale/en-CA'
import type { NsLocaleMessages } from '../locale/NsLocaleMessages'

// Helper: component that exposes locale via slot
const LocaleConsumer = defineComponent({
  setup(_, { slots }) {
    const locale = useNsLocale()
    return () => slots.default?.({ locale }) ?? h('span', locale.common.loading)
  },
})

// Helper: component that uses useNsDefault
const DefaultConsumer = defineComponent({
  props: {
    label: { type: String, default: undefined },
  },
  setup(props) {
    const text = useNsDefault(() => props.label, 'product.addToCart')
    return () => h('span', text.value)
  },
})

describe('useNsLocale', () => {
  it('returns en-CA defaults when no locale is provided', () => {
    const wrapper = mount(LocaleConsumer)
    expect(wrapper.text()).toBe('Loading…')
  })

  it('returns injected locale when provideNsLocale is called', () => {
    const customLocale: NsLocaleMessages = {
      ...nsLocaleEnCA,
      common: {
        ...nsLocaleEnCA.common,
        loading: 'Chargement…',
      },
    }

    const Provider = defineComponent({
      setup() {
        provideNsLocale(customLocale)
        return () => h(LocaleConsumer)
      },
    })

    const wrapper = mount(Provider)
    expect(wrapper.text()).toBe('Chargement…')
  })
})

describe('useNsDefault', () => {
  it('returns locale default when prop is undefined', () => {
    const wrapper = mount(DefaultConsumer)
    expect(wrapper.text()).toBe('Add to cart')
  })

  it('returns locale default when prop is null', () => {
    const wrapper = mount(DefaultConsumer, {
      props: { label: null as unknown as string },
    })
    expect(wrapper.text()).toBe('Add to cart')
  })

  it('returns explicit prop when provided', () => {
    const wrapper = mount(DefaultConsumer, {
      props: { label: 'Ajouter au panier' },
    })
    expect(wrapper.text()).toBe('Ajouter au panier')
  })

  it('uses injected locale over en-CA default', () => {
    const frLocale: NsLocaleMessages = {
      ...nsLocaleEnCA,
      product: {
        ...nsLocaleEnCA.product,
        addToCart: 'Ajouter au panier',
      },
    }

    const Provider = defineComponent({
      setup() {
        provideNsLocale(frLocale)
        return () => h(DefaultConsumer)
      },
    })

    const wrapper = mount(Provider)
    expect(wrapper.text()).toBe('Ajouter au panier')
  })

  it('explicit prop takes priority over injected locale', () => {
    const frLocale: NsLocaleMessages = {
      ...nsLocaleEnCA,
      product: {
        ...nsLocaleEnCA.product,
        addToCart: 'Ajouter au panier',
      },
    }

    const Provider = defineComponent({
      setup() {
        provideNsLocale(frLocale)
        return () => h(DefaultConsumer, { label: 'Custom override' })
      },
    })

    const wrapper = mount(Provider)
    expect(wrapper.text()).toBe('Custom override')
  })
})
