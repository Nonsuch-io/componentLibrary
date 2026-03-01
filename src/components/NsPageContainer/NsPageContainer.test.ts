import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPageContainer from './NsPageContainer.vue'
import { QLayout } from 'quasar'

describe('NsPageContainer', () => {
  const mountPageContainer = (attrs = {}) =>
    mount({
      components: { QLayout, NsPageContainer },
      template:
        '<q-layout><NsPageContainer v-bind="extraAttrs">Container content</NsPageContainer></q-layout>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QLayout parent', () => {
    const wrapper = mountPageContainer()
    expect(wrapper.find('.ns-page-container').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountPageContainer()
    expect(wrapper.text()).toContain('Container content')
  })

  describe('accessibility', () => {
    it('renders as a page container', () => {
      const wrapper = mountPageContainer()
      expect(wrapper.find('.q-page-container').exists()).toBe(true)
    })
  })
})
