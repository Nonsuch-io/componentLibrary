import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTooltip from './NsTooltip.vue'

describe('NsTooltip', () => {
  it('renders component', () => {
    const wrapper = mount(NsTooltip, {
      slots: { default: 'Tooltip text' },
      attachTo: document.body,
    })
    // QTooltip renders conditionally — verify it mounts without errors
    expect(wrapper.vm).toBeTruthy()
    wrapper.unmount()
  })

  it('accepts delay prop', () => {
    const wrapper = mount(NsTooltip, {
      props: { delay: 500 },
      slots: { default: 'Help' },
      attachTo: document.body,
    })
    expect(wrapper.vm).toBeTruthy()
    wrapper.unmount()
  })

  it('accepts anchor and self props', () => {
    const wrapper = mount(NsTooltip, {
      props: { anchor: 'top middle', self: 'bottom middle' },
      slots: { default: 'Tip' },
      attachTo: document.body,
    })
    expect(wrapper.vm).toBeTruthy()
    wrapper.unmount()
  })

  it('accepts offset prop', () => {
    const wrapper = mount(NsTooltip, {
      props: { offset: [16, 0] as [number, number] },
      slots: { default: 'Tip' },
      attachTo: document.body,
    })
    expect(wrapper.vm).toBeTruthy()
    wrapper.unmount()
  })
})
