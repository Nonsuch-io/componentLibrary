import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsDrawer from './NsDrawer.vue'
import { QLayout } from 'quasar'

describe('NsDrawer', () => {
  const mountDrawer = (attrs = {}) =>
    mount({
      components: { QLayout, NsDrawer },
      template:
        '<q-layout><NsDrawer v-bind="extraAttrs" :model-value="true" side="left">Drawer content</NsDrawer></q-layout>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QLayout parent', () => {
    const wrapper = mountDrawer()
    expect(wrapper.find('.ns-drawer').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountDrawer()
    expect(wrapper.text()).toContain('Drawer content')
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mountDrawer({ 'data-testid': 'test-ns-drawer' })
    expect(wrapper.find('.ns-drawer').attributes('data-testid')).toBe('test-ns-drawer')
  })

  describe('accessibility', () => {
    it('renders as an aside element', () => {
      const wrapper = mountDrawer()
      expect(wrapper.find('aside').exists()).toBe(true)
    })
  })
})
