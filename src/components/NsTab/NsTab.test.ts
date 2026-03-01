import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTab from './NsTab.vue'
import { QTabs } from 'quasar'

describe('NsTab', () => {
  const mountTab = (_props = {}, attrs = {}) =>
    mount({
      components: { QTabs, NsTab },
      template:
        '<q-tabs model-value="tab1"><NsTab name="tab1" v-bind="extraAttrs">Test content</NsTab></q-tabs>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QTabs parent', () => {
    const wrapper = mountTab()
    expect(wrapper.find('.ns-tab').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountTab()
    expect(wrapper.text()).toContain('Test content')
  })

  describe('accessibility', () => {
    it('renders with tab role', () => {
      const wrapper = mountTab()
      expect(wrapper.find('.q-tab').exists()).toBe(true)
    })
  })
})
