import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCheckbox from './NsCheckbox.vue'

describe('NsCheckbox', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsCheckbox)
    expect(wrapper.find('.ns-checkbox').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsCheckbox, { props: { label: 'Accept terms' } })
    expect(wrapper.text()).toContain('Accept terms')
  })

  it('applies ns-checkbox class', () => {
    const wrapper = mount(NsCheckbox)
    expect(wrapper.classes()).toContain('ns-checkbox')
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsCheckbox, { props: { dense: true } })
    expect(wrapper.find('.q-checkbox--dense').exists()).toBe(true)
  })

  it('can be disabled', () => {
    const wrapper = mount(NsCheckbox, { props: { disable: true } })
    expect(wrapper.find('.disabled').exists()).toBe(true)
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(NsCheckbox, { props: { modelValue: false } })
    await wrapper.find('.q-checkbox__inner').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
