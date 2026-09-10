import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsFormFooter from './NsFormFooter.vue'

describe('NsFormFooter', () => {
  // NOTE ON SCOPE: this component is almost entirely CSS, and jsdom has no
  // layout engine and loads no stylesheet — a unit test reading flexDirection
  // here would pass whether the media query exists or was deleted. The reflow
  // that IS this component is asserted in real Chromium, in
  // NsFormFooter.stories.ts (LayoutIsRealOnDesktop / LayoutIsRealOnMobile).
  // What is left for jsdom is the markup contract.
  it('renders its actions', () => {
    const wrapper = mount(NsFormFooter, {
      slots: { default: '<button>Back</button><button>Continue</button>' },
    })
    expect(wrapper.findAll('.ns-form-footer__actions button')).toHaveLength(2)
  })

  it('imposes no action count — one is as valid as two', () => {
    // 15 of the 42 instances measured ship a single action; the second is a
    // hidden sibling in Figma, not an absent one.
    const wrapper = mount(NsFormFooter, { slots: { default: '<button>Continue</button>' } })
    expect(wrapper.findAll('.ns-form-footer__actions button')).toHaveLength(1)
  })

  it('renders the actions wrapper even with no actions', () => {
    // Deliberate: the footer is a layout band, and an empty one still reserves
    // its space. Nothing measured suggests it should collapse.
    expect(mount(NsFormFooter).find('.ns-form-footer__actions').exists()).toBe(true)
  })

  it('passes attributes through to the root', () => {
    const wrapper = mount(NsFormFooter, { attrs: { 'data-testid': 'footer' } })
    expect(wrapper.attributes('data-testid')).toBe('footer')
  })
})
