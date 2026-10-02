import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsRadioButtons from './NsRadioButtons.vue'

const OPTIONS = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('NsRadioButtons', () => {
  describe('rendering', () => {
    it('should render with ns-radio-buttons class', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: OPTIONS } })
      expect(wrapper.find('.ns-radio-buttons').exists()).toBe(true)
    })

    it('should render all options', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: OPTIONS } })
      expect(wrapper.findAll('.ns-radio').length).toBe(3)
    })

    it('should render a group label when provided', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: OPTIONS, label: 'Choose one' },
      })
      expect(wrapper.find('.ns-radio-buttons__label').text()).toBe('Choose one')
    })

    it('should default to vertical orientation', () => {
      const wrapper = mount(NsRadioButtons, { props: { options: OPTIONS } })
      expect(wrapper.find('.ns-radio-buttons--vertical').exists()).toBe(true)
    })

    it('should apply horizontal orientation class', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: OPTIONS, orientation: 'horizontal' },
      })
      expect(wrapper.find('.ns-radio-buttons--horizontal').exists()).toBe(true)
    })
  })

  describe('selection', () => {
    it('should mark the matching option as selected', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: OPTIONS, modelValue: 'b' },
      })
      const radios = wrapper.findAll('.ns-radio')
      expect(radios[0].classes()).not.toContain('ns-radio--selected')
      expect(radios[1].classes()).toContain('ns-radio--selected')
      expect(radios[2].classes()).not.toContain('ns-radio--selected')
    })

    it('should emit update:modelValue when an option is selected', async () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: OPTIONS, modelValue: 'a' },
      })
      const inputs = wrapper.findAll('input')
      await inputs[1].trigger('change')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['b'])
    })
  })

  describe('disabled', () => {
    it('should disable all options when disable prop is true', () => {
      const wrapper = mount(NsRadioButtons, {
        props: { options: OPTIONS, disable: true },
      })
      const radios = wrapper.findAll('.ns-radio')
      radios.forEach((r) => expect(r.classes()).toContain('ns-radio--disabled'))
    })
  })
})
