import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsFooter from './NsFooter.vue'
import { QLayout } from 'quasar'

describe('NsFooter', () => {
  const mountFooter = (attrs = {}) =>
    mount({
      components: { QLayout, NsFooter },
      template: '<q-layout><NsFooter v-bind="extraAttrs">Footer content</NsFooter></q-layout>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QLayout parent', () => {
    const wrapper = mountFooter()
    expect(wrapper.find('.ns-footer').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountFooter()
    expect(wrapper.text()).toContain('Footer content')
  })

  describe('accessibility', () => {
    it('renders as a footer element', () => {
      const wrapper = mountFooter()
      expect(wrapper.find('footer').exists()).toBe(true)
    })
  })
})
