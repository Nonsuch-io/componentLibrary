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
})
