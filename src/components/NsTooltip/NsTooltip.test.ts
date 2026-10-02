import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent } from 'vue'
import NsTooltip from './NsTooltip.vue'

// Wrap NsTooltip in a host element — q-tooltip needs a parent DOM node to anchor to
const Host = defineComponent({
  components: { NsTooltip },
  template: `<div><NsTooltip><span class="tip-content">Help text</span></NsTooltip></div>`,
})

const HostWithLabel = defineComponent({
  components: { NsTooltip },
  template: `<div><NsTooltip label="What is this?"><span>Help</span></NsTooltip></div>`,
})

describe('NsTooltip', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  describe('trigger', () => {
    it('should render with ns-tooltip class', () => {
      wrapper = mount(Host, { attachTo: document.body })
      expect(wrapper.find('.ns-tooltip').exists()).toBe(true)
    })

    it('should render the info icon', () => {
      wrapper = mount(Host, { attachTo: document.body })
      expect(wrapper.find('.ns-tooltip__icon').exists()).toBe(true)
    })

    it('should not render a label by default', () => {
      wrapper = mount(Host, { attachTo: document.body })
      expect(wrapper.find('.ns-tooltip__label').exists()).toBe(false)
    })

    it('should render label when label prop is provided', () => {
      wrapper = mount(HostWithLabel, { attachTo: document.body })
      expect(wrapper.find('.ns-tooltip__label').text()).toBe('What is this?')
    })
  })

  describe('props', () => {
    it('should mount with delay prop', () => {
      wrapper = mount(
        defineComponent({
          components: { NsTooltip },
          template: `<div><NsTooltip :delay="500">Help</NsTooltip></div>`,
        }),
        { attachTo: document.body },
      )
      expect(wrapper.vm).toBeTruthy()
    })

    it('should mount with anchor and self props', () => {
      wrapper = mount(
        defineComponent({
          components: { NsTooltip },
          template: `<div><NsTooltip anchor="top middle" self="bottom middle">Help</NsTooltip></div>`,
        }),
        { attachTo: document.body },
      )
      expect(wrapper.vm).toBeTruthy()
    })
  })
})
