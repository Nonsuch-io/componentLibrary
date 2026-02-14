import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsForm from './NsForm.vue'

describe('NsForm', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsForm)
    expect(wrapper.find('.ns-form').exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(NsForm, {
      slots: { default: '<input type="text" class="test-input" />' },
    })
    expect(wrapper.find('.test-input').exists()).toBe(true)
  })

  it('applies ns-form class', () => {
    const wrapper = mount(NsForm)
    expect(wrapper.find('form.ns-form').exists()).toBe(true)
  })

  it('passes through attrs to q-form', () => {
    const wrapper = mount(NsForm, {
      attrs: { 'data-testid': 'my-form' },
    })
    expect(wrapper.find('form').attributes('data-testid')).toBe('my-form')
  })

  it('emits submit on form submission', async () => {
    const wrapper = mount(NsForm)
    await wrapper.find('form').trigger('submit')
    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
