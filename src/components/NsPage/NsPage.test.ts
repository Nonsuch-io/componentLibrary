import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPage from './NsPage.vue'
import { QLayout, QPageContainer } from 'quasar'

describe('NsPage', () => {
  const mountPage = (attrs = {}) =>
    mount({
      components: { QLayout, QPageContainer, NsPage },
      template:
        '<q-layout><q-page-container><NsPage v-bind="extraAttrs">Page content</NsPage></q-page-container></q-layout>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QLayout parent', () => {
    const wrapper = mountPage()
    expect(wrapper.find('.ns-page').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Page content')
  })

  describe('accessibility', () => {
    it('renders as a main content area', () => {
      const wrapper = mountPage()
      expect(wrapper.find('.q-page').exists()).toBe(true)
    })
  })
})
