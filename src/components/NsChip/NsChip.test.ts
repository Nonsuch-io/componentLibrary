import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsChip from './NsChip.vue'

describe('NsChip', () => {
  describe('rendering', () => {
    it('should render slot content', () => {
      const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
      expect(wrapper.find('.ns-chip').exists()).toBe(true)
      expect(wrapper.text()).toContain('Tag')
    })

    it('should apply variant class', () => {
      const wrapper = mount(NsChip, {
        props: { variant: 'negative' },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip--negative').exists()).toBe(true)
    })

    it('should apply size class', () => {
      const wrapper = mount(NsChip, {
        props: { size: 'lg' },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip--lg').exists()).toBe(true)
    })

    it('should default to primary variant and md size', () => {
      const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
      expect(wrapper.find('.ns-chip--primary').exists()).toBe(true)
      expect(wrapper.find('.ns-chip--md').exists()).toBe(true)
    })
  })

  describe('outline', () => {
    it('should apply outline class when outline prop is true', () => {
      const wrapper = mount(NsChip, {
        props: { outline: true },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip--outline').exists()).toBe(true)
    })

    it('should not apply outline class by default', () => {
      const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
      expect(wrapper.find('.ns-chip--outline').exists()).toBe(false)
    })
  })

  describe('selected', () => {
    it('should render checkmark when selected is true', () => {
      const wrapper = mount(NsChip, {
        props: { selected: true },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip__check').exists()).toBe(true)
    })

    it('should not render checkmark by default', () => {
      const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
      expect(wrapper.find('.ns-chip__check').exists()).toBe(false)
    })

    it('should not render checkmark when selected but disabled', () => {
      const wrapper = mount(NsChip, {
        props: { selected: true, disabled: true },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip__check').exists()).toBe(false)
    })

    it('should render both checkmark and remove icon when selected and removable', () => {
      const wrapper = mount(NsChip, {
        props: { selected: true, removable: true },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip__check').exists()).toBe(true)
      expect(wrapper.find('.ns-chip__remove').exists()).toBe(true)
    })
  })

  describe('removable', () => {
    it('should render remove icon when removable is true', () => {
      const wrapper = mount(NsChip, {
        props: { removable: true },
        slots: { default: 'Removable' },
      })
      expect(wrapper.find('.ns-chip__remove').exists()).toBe(true)
    })

    it('should not render remove icon by default', () => {
      const wrapper = mount(NsChip, { slots: { default: 'Tag' } })
      expect(wrapper.find('.ns-chip__remove').exists()).toBe(false)
    })

    it('should emit remove when remove icon is clicked', async () => {
      const wrapper = mount(NsChip, {
        props: { removable: true },
        slots: { default: 'Removable' },
      })
      await wrapper.find('.ns-chip__remove').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('should not render remove icon when disabled', () => {
      const wrapper = mount(NsChip, {
        props: { removable: true, disabled: true },
        slots: { default: 'Disabled' },
      })
      expect(wrapper.find('.ns-chip__remove').exists()).toBe(false)
    })
  })

  describe('disabled', () => {
    it('should apply disabled class when disabled is true', () => {
      const wrapper = mount(NsChip, {
        props: { disabled: true },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.ns-chip--disabled').exists()).toBe(true)
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root Quasar chip', () => {
      const wrapper = mount(NsChip, {
        attrs: { 'data-testid': 'my-chip' },
        slots: { default: 'Tag' },
      })
      expect(wrapper.find('.q-chip').attributes('data-testid')).toBe('my-chip')
    })
  })
})
