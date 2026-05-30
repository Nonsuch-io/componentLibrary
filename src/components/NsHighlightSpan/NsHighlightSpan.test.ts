import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsHighlightSpan from './NsHighlightSpan.vue'

describe('NsHighlightSpan', () => {
  it('should render slot content when default slot is provided', () => {
    const wrapper = mount(NsHighlightSpan, { slots: { default: 'software.' } })
    expect(wrapper.text()).toContain('software.')
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsHighlightSpan)
    expect(wrapper.find('.ns-highlight-span').exists()).toBe(true)
  })

  it('should render as a div element', () => {
    const wrapper = mount(NsHighlightSpan)
    expect(wrapper.element.tagName).toBe('DIV')
  })
})
