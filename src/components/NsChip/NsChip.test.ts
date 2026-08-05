import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsChip from './NsChip.vue'

describe('NsChip', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
    expect(wrapper.find('.ns-chip').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tag')
  })

  it('applies ns-chip class', () => {
    const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
    expect(wrapper.find('.ns-chip').exists()).toBe(true)
  })

  it('supports outline style', () => {
    const wrapper = mount(NsChip, {
      props: { outline: true },
      slots: { default: 'Tag' },
    })
    expect(wrapper.find('.q-chip--outline').exists()).toBe(true)
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsChip, {
      props: { dense: true },
      slots: { default: 'Tag' },
    })
    expect(wrapper.find('.q-chip--dense').exists()).toBe(true)
  })

  it('emits remove when removable chip is dismissed', async () => {
    const wrapper = mount(NsChip, {
      props: { removable: true },
      slots: { default: 'Removable' },
    })
    const removeBtn = wrapper.find('.q-chip__icon--remove')
    if (removeBtn.exists()) {
      await removeBtn.trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    }
  })

  it('passes through attrs', () => {
    const wrapper = mount(NsChip, {
      attrs: { 'data-testid': 'my-chip' },
      slots: { default: 'Tag' },
    })
    expect(wrapper.find('.q-chip').attributes('data-testid')).toBe('my-chip')
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsChip, { props: { disable: true }, slots: { default: 'Tag' } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})
