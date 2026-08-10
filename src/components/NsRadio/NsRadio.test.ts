import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsRadio from './NsRadio.vue'

describe('NsRadio', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsRadio)
    expect(wrapper.find('.ns-radio').exists()).toBe(true)
  })

  it('renders a label', () => {
    const wrapper = mount(NsRadio, { props: { label: 'Small', val: 'small' } })
    expect(wrapper.text()).toContain('Small')
  })

  it('applies ns-radio class', () => {
    const wrapper = mount(NsRadio)
    expect(wrapper.classes()).toContain('ns-radio')
  })

  it('reflects the checked state when modelValue matches val', () => {
    const wrapper = mount(NsRadio, { props: { modelValue: 'a', val: 'a' } })
    expect(wrapper.find('[role="radio"]').attributes('aria-checked')).toBe('true')
  })

  it('reflects the unchecked state when modelValue does not match val', () => {
    const wrapper = mount(NsRadio, { props: { modelValue: 'a', val: 'b' } })
    expect(wrapper.find('[role="radio"]').attributes('aria-checked')).toBe('false')
  })

  it('can be disabled', () => {
    const wrapper = mount(NsRadio, { props: { disable: true } })
    expect(wrapper.find('.disabled').exists()).toBe(true)
  })

  it('emits update:modelValue on click', async () => {
    const wrapper = mount(NsRadio, { props: { modelValue: 'a', val: 'b' } })
    await wrapper.find('[role="radio"]').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  describe('accessibility', () => {
    it('has role="radio"', () => {
      const wrapper = mount(NsRadio)
      expect(wrapper.find('[role="radio"]').exists()).toBe(true)
    })
  })
})
