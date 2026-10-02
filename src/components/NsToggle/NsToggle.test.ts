import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsToggle from './NsToggle.vue'

describe('NsToggle', () => {
  describe('rendering', () => {
    it('should render with ns-toggle class', () => {
      const wrapper = mount(NsToggle)
      expect(wrapper.find('.ns-toggle').exists()).toBe(true)
    })

    it('should render a label', () => {
      const wrapper = mount(NsToggle, { props: { label: 'Notifications' } })
      expect(wrapper.find('.ns-toggle__label').text()).toBe('Notifications')
    })

    it('should not render label element when no label prop', () => {
      const wrapper = mount(NsToggle)
      expect(wrapper.find('.ns-toggle__label').exists()).toBe(false)
    })

    it('should render a caption when provided', () => {
      const wrapper = mount(NsToggle, {
        props: { label: 'Notifications', caption: 'Receive email alerts' },
      })
      expect(wrapper.find('.ns-toggle__caption').text()).toBe('Receive email alerts')
    })

    it('should render a badge when badgeLabel is provided', () => {
      const wrapper = mount(NsToggle, {
        props: { label: 'New feature', badgeLabel: 'New' },
      })
      expect(wrapper.find('.ns-toggle__badge').exists()).toBe(true)
    })

    it('should render the visual track', () => {
      const wrapper = mount(NsToggle)
      expect(wrapper.find('.ns-toggle__track').exists()).toBe(true)
    })
  })

  describe('states', () => {
    it('should default to off state', () => {
      const wrapper = mount(NsToggle)
      const input = wrapper.find('input[type="checkbox"]')
      expect((input.element as HTMLInputElement).checked).toBe(false)
    })

    it('should reflect on state when modelValue is true', () => {
      const wrapper = mount(NsToggle, { props: { modelValue: true } })
      expect(wrapper.find('.ns-toggle--on').exists()).toBe(true)
      expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
    })

    it('should apply disabled class when disable is true', () => {
      const wrapper = mount(NsToggle, { props: { disable: true } })
      expect(wrapper.find('.ns-toggle--disabled').exists()).toBe(true)
    })

    it('should disable the native input when disable is true', () => {
      const wrapper = mount(NsToggle, { props: { disable: true } })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })
  })

  describe('accessibility', () => {
    it('should have role="switch" on the input', () => {
      const wrapper = mount(NsToggle)
      expect(wrapper.find('input').attributes('role')).toBe('switch')
    })

    it('should reflect aria-checked when on', () => {
      const wrapper = mount(NsToggle, { props: { modelValue: true } })
      expect(wrapper.find('input').attributes('aria-checked')).toBe('true')
    })

    it('should reflect aria-checked when off', () => {
      const wrapper = mount(NsToggle, { props: { modelValue: false } })
      expect(wrapper.find('input').attributes('aria-checked')).toBe('false')
    })
  })

  describe('interaction', () => {
    it('should emit update:modelValue on change', async () => {
      const wrapper = mount(NsToggle, { props: { modelValue: false } })
      const input = wrapper.find('input')
      ;(input.element as HTMLInputElement).checked = true
      await input.trigger('change')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual([true])
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root label element', () => {
      const wrapper = mount(NsToggle, { attrs: { 'data-testid': 'my-toggle' } })
      expect(wrapper.find('.ns-toggle').attributes('data-testid')).toBe('my-toggle')
    })
  })
})
