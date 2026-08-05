import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsInput from './NsInput.vue'

describe('NsInput', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsInput)
    expect(wrapper.find('.ns-input').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsInput, { props: { label: 'Email' } })
    expect(wrapper.text()).toContain('Email')
  })

  it('defaults to outlined style', () => {
    const wrapper = mount(NsInput)
    expect(wrapper.find('.q-field--outlined').exists()).toBe(true)
  })

  it('supports dense mode', () => {
    const wrapper = mount(NsInput, { props: { dense: true } })
    expect(wrapper.find('.q-field--dense').exists()).toBe(true)
  })

  it('applies ns-input class', () => {
    const wrapper = mount(NsInput)
    expect(wrapper.classes()).toContain('ns-input')
  })

  it('passes through attrs to q-input', () => {
    const wrapper = mount(NsInput, {
      attrs: { placeholder: 'Type here...' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Type here...')
  })

  it('binds modelValue to q-input', () => {
    const wrapper = mount(NsInput, {
      props: { modelValue: 'hello' },
    })
    const input = wrapper.find('input')
    expect(input.element.value).toBe('hello')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(NsInput, {
      props: { modelValue: '' },
    })
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('forwards slots to q-input', () => {
    const wrapper = mount(NsInput, {
      slots: { prepend: '<span class="test-prepend">$</span>' },
    })
    expect(wrapper.find('.test-prepend').exists()).toBe(true)
  })

  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsInput, { props: { disable: true } })
    // If `disable` were not a declared prop, it would land in $attrs
    // instead of $props, and wrapper.props('disable') would be undefined.
    expect(wrapper.props('disable')).toBe(true)
  })
})
