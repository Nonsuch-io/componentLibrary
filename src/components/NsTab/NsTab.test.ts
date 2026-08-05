import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Component } from 'vue'
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

  const mountTabWithProps = (props: Record<string, unknown>) =>
    mount({
      components: { QTabs, NsTab },
      template: '<q-tabs model-value="tab1"><NsTab name="tab1" v-bind="tabProps" /></q-tabs>',
      setup: () => ({ tabProps: props }),
    })

  it('renders within a QTabs parent', () => {
    const wrapper = mountTab()
    expect(wrapper.find('.ns-tab').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountTab()
    expect(wrapper.text()).toContain('Test content')
  })

  describe('icon prop — string', () => {
    it('passes string icon through to q-tab :icon prop', () => {
      const wrapper = mountTabWithProps({ icon: 'home', label: 'Home' })
      // When icon is a string, it should be passed to QTab which renders
      // a QIcon with the icon name
      const qtab = wrapper.findComponent({ name: 'QTab' })
      expect(qtab.props('icon')).toBe('home')
    })

    it('does not render a component when icon is a string', () => {
      const StubIcon: Component = { name: 'StubIcon', template: '<svg class="stub-icon" />' }
      const wrapper = mountTabWithProps({ icon: 'home', label: 'Home' })
      // The StubIcon component should not appear in the DOM
      expect(wrapper.findComponent(StubIcon).exists()).toBe(false)
    })
  })

  describe('icon prop — Component', () => {
    it('renders the component when icon is a Vue component', () => {
      const StubIcon: Component = { name: 'StubIcon', template: '<svg class="stub-icon" />' }
      const wrapper = mountTabWithProps({ icon: StubIcon, label: 'Home' })
      expect(wrapper.find('.stub-icon').exists()).toBe(true)
    })

    it('does not pass a string to q-tab :icon when icon is a component', () => {
      const StubIcon: Component = { name: 'StubIcon', template: '<svg class="stub-icon" />' }
      const wrapper = mountTabWithProps({ icon: StubIcon, label: 'Home' })
      const qtab = wrapper.findComponent({ name: 'QTab' })
      // icon prop should not be a string when a component is provided
      expect(typeof qtab.props('icon')).not.toBe('string')
    })
  })

  describe('icon slot', () => {
    it('renders slot content when icon slot is provided', () => {
      const wrapper = mount({
        components: { QTabs, NsTab },
        template: `
          <q-tabs model-value="tab1">
            <NsTab name="tab1" label="Home">
              <template #icon>
                <svg class="custom-slot-icon" />
              </template>
            </NsTab>
          </q-tabs>
        `,
      })
      expect(wrapper.find('.custom-slot-icon').exists()).toBe(true)
    })
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mountTabWithProps({ label: 'Home', disable: true })
    const nsTab = wrapper.findComponent(NsTab)
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and nsTab.props('disable') would be undefined.
    expect(nsTab.props('disable')).toBe(true)
  })

  describe('accessibility', () => {
    it('renders with tab role', () => {
      const wrapper = mountTab()
      expect(wrapper.find('.q-tab').exists()).toBe(true)
    })

    it('renders correctly with a component icon', () => {
      const StubIcon: Component = {
        name: 'StubIcon',
        template: '<svg class="stub-icon" aria-hidden="true" />',
      }
      const wrapper = mountTabWithProps({ icon: StubIcon, label: 'Home' })
      expect(wrapper.find('.ns-tab').exists()).toBe(true)
      expect(wrapper.find('.stub-icon').exists()).toBe(true)
    })
  })
})
