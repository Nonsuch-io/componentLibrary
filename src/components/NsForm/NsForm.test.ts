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

  it('emits validationError when q-form fires validation-error', async () => {
    const wrapper = mount(NsForm)
    // Simulate QForm emitting the validation-error event
    const qForm = wrapper.findComponent({ name: 'QForm' })
    qForm.vm.$emit('validation-error', { field: 'email' })
    expect(wrapper.emitted('validationError')).toBeTruthy()
    expect(wrapper.emitted('validationError')![0]).toEqual([{ field: 'email' }])
  })

  it('accepts greedy prop', () => {
    const wrapper = mount(NsForm, { props: { greedy: true } })
    expect(wrapper.find('.ns-form').exists()).toBe(true)
  })

  describe('accessibility', () => {
    it('passes aria-label to the form element', () => {
      const wrapper = mount(NsForm, {
        props: { ariaLabel: 'Sign up form' },
      })
      expect(wrapper.find('form').attributes('aria-label')).toBe('Sign up form')
    })

    it('omits aria-label when not provided', () => {
      const wrapper = mount(NsForm)
      expect(wrapper.find('form').attributes('aria-label')).toBeUndefined()
    })
  })
})
