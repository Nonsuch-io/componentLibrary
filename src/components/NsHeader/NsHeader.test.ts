import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsHeader from './NsHeader.vue'
import { QLayout } from 'quasar'

describe('NsHeader', () => {
  const mountHeader = (attrs = {}) =>
    mount({
      components: { QLayout, NsHeader },
      template: '<q-layout><NsHeader v-bind="extraAttrs">Header content</NsHeader></q-layout>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QLayout parent', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.ns-header').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain('Header content')
  })

  describe('accessibility', () => {
    it('renders as a header element', () => {
      const wrapper = mountHeader()
      expect(wrapper.find('header').exists()).toBe(true)
    })
  })
})
