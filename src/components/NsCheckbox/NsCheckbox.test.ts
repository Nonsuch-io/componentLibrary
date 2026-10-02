import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCheckbox from './NsCheckbox.vue'

describe('NsCheckbox', () => {
  describe('rendering', () => {
    it('should render with ns-checkbox class', () => {
      const wrapper = mount(NsCheckbox)
      expect(wrapper.find('.ns-checkbox').exists()).toBe(true)
    })

    it('should render a label', () => {
      const wrapper = mount(NsCheckbox, { props: { label: 'Accept terms' } })
      expect(wrapper.find('.ns-checkbox__label').text()).toBe('Accept terms')
    })

    it('should not render label element when no label prop', () => {
      const wrapper = mount(NsCheckbox)
      expect(wrapper.find('.ns-checkbox__label').exists()).toBe(false)
    })

    it('should render a caption when caption prop is provided', () => {
      const wrapper = mount(NsCheckbox, {
        props: { label: 'Accept terms', caption: 'Required to continue' },
      })
      expect(wrapper.find('.ns-checkbox__caption').text()).toBe('Required to continue')
    })

    it('should not render caption when not provided', () => {
      const wrapper = mount(NsCheckbox, { props: { label: 'Accept terms' } })
      expect(wrapper.find('.ns-checkbox__caption').exists()).toBe(false)
    })
  })

  describe('states', () => {
    it('should default to unchecked', () => {
      const wrapper = mount(NsCheckbox)
      const input = wrapper.find('input[type="checkbox"]')
      expect((input.element as HTMLInputElement).checked).toBe(false)
    })

    it('should show checked state when modelValue is true', () => {
      const wrapper = mount(NsCheckbox, { props: { modelValue: true } })
      const input = wrapper.find('input[type="checkbox"]')
      expect((input.element as HTMLInputElement).checked).toBe(true)
    })

    it('should show indeterminate state when modelValue is null', async () => {
      const wrapper = mount(NsCheckbox, { props: { modelValue: null } })
      await wrapper.vm.$nextTick()
      const input = wrapper.find('input[type="checkbox"]')
      expect((input.element as HTMLInputElement).indeterminate).toBe(true)
    })

    it('should apply disabled class when disable is true', () => {
      const wrapper = mount(NsCheckbox, { props: { disable: true } })
      expect(wrapper.find('.ns-checkbox--disabled').exists()).toBe(true)
    })

    it('should disable the native input when disable is true', () => {
      const wrapper = mount(NsCheckbox, { props: { disable: true } })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })
  })

  describe('interaction', () => {
    it('should emit update:modelValue on change', async () => {
      const wrapper = mount(NsCheckbox, { props: { modelValue: false } })
      const input = wrapper.find('input[type="checkbox"]')
      ;(input.element as HTMLInputElement).checked = true
      await input.trigger('change')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root label element', () => {
      const wrapper = mount(NsCheckbox, { attrs: { 'data-testid': 'my-checkbox' } })
      expect(wrapper.find('.ns-checkbox').attributes('data-testid')).toBe('my-checkbox')
    })
  })
})
