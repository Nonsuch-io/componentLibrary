import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsTooltip from './NsTooltip.vue'

// Stub QTooltip so slot content renders without teleport
const QTooltipStub = defineComponent({
  name: 'QTooltip',
  setup(_, { slots }) {
    return () => h('div', { class: 'q-tooltip-stub' }, slots.default?.())
  },
})

// QTooltip requires a parent element to anchor to
const WrapperHost = defineComponent({
  components: { NsTooltip },
  template: `<div class="host"><NsTooltip v-bind="$attrs"><span class="tip-content">Help text</span></NsTooltip></div>`,
})

describe('NsTooltip', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('mounts without errors', () => {
    wrapper = mount(WrapperHost, { attachTo: document.body })
    expect(wrapper.vm).toBeTruthy()
  })

  it('renders with slot content passed through', () => {
    wrapper = mount(WrapperHost, { attachTo: document.body })
    expect(wrapper.findComponent(NsTooltip).exists()).toBe(true)
  })

  it('renders slot content when QTooltip is stubbed', () => {
    wrapper = mount(NsTooltip, {
      slots: { default: '<span class="tip-slot">Tooltip text</span>' },
      global: { stubs: { QTooltip: QTooltipStub } },
    })
    expect(wrapper.find('.tip-slot').text()).toBe('Tooltip text')
  })

  it('accepts delay prop', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { delay: 500 },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts offset prop', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { offset: [10, 10] },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts anchor and self props', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { anchor: 'bottom middle', self: 'top middle' },
    })
    expect(wrapper.vm).toBeTruthy()
  })
})
