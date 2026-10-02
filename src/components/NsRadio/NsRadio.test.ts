import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsRadio from './NsRadio.vue'

describe('NsRadio', () => {
  describe('rendering', () => {
    it('should render with ns-radio class', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a' } })
      expect(wrapper.find('.ns-radio').exists()).toBe(true)
    })

    it('should render a label when provided', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', label: 'Option A' } })
      expect(wrapper.find('.ns-radio__label').text()).toBe('Option A')
    })

    it('should not render a label when not provided', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a' } })
      expect(wrapper.find('.ns-radio__label').exists()).toBe(false)
    })

    it('should render the visual circle', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a' } })
      expect(wrapper.find('.ns-radio__circle').exists()).toBe(true)
    })
  })

  describe('states', () => {
    it('should not be selected by default', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a' } })
      expect(wrapper.find('.ns-radio--selected').exists()).toBe(false)
      expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(false)
    })

    it('should be selected when modelValue matches value', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', modelValue: 'a' } })
      expect(wrapper.find('.ns-radio--selected').exists()).toBe(true)
    })

    it('should not be selected when modelValue differs from value', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', modelValue: 'b' } })
      expect(wrapper.find('.ns-radio--selected').exists()).toBe(false)
    })

    it('should apply disabled class when disable is true', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', disable: true } })
      expect(wrapper.find('.ns-radio--disabled').exists()).toBe(true)
    })

    it('should disable the native input when disable is true', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', disable: true } })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })
  })

  describe('interaction', () => {
    it('should emit update:modelValue with value on change', async () => {
      const wrapper = mount(NsRadio, { props: { value: 'a', modelValue: 'b' } })
      await wrapper.find('input').trigger('change')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['a'])
    })
  })

  describe('accessibility', () => {
    it('should have type="radio" on the input', () => {
      const wrapper = mount(NsRadio, { props: { value: 'a' } })
      expect(wrapper.find('input').attributes('type')).toBe('radio')
    })

    it('should forward attrs to the root label', () => {
      const wrapper = mount(NsRadio, {
        props: { value: 'a' },
        attrs: { 'data-testid': 'my-radio' },
      })
      expect(wrapper.find('.ns-radio').attributes('data-testid')).toBe('my-radio')
    })
  })
})
