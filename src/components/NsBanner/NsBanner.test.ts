import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBanner from './NsBanner.vue'

describe('NsBanner', () => {
  describe('rendering', () => {
    it('should render slot content', () => {
      const wrapper = mount(NsBanner, { slots: { default: 'Notice' } })
      expect(wrapper.find('.ns-banner').exists()).toBe(true)
      expect(wrapper.text()).toContain('Notice')
    })

    it('should default to info type', () => {
      const wrapper = mount(NsBanner, { slots: { default: 'Info' } })
      expect(wrapper.find('.ns-banner--info').exists()).toBe(true)
    })

    it('should apply type class for all variants', () => {
      const types = [
        'positive',
        'info',
        'negative',
        'warning',
        'neutral',
        'attention',
        'accent',
      ] as const
      types.forEach((type) => {
        const wrapper = mount(NsBanner, { props: { type }, slots: { default: 'Msg' } })
        expect(wrapper.find(`.ns-banner--${type}`).exists()).toBe(true)
      })
    })
  })

  describe('icons', () => {
    it('should render an icon for positive type', () => {
      const wrapper = mount(NsBanner, { props: { type: 'positive' }, slots: { default: 'OK' } })
      expect(wrapper.find('.ns-banner__icon').exists()).toBe(true)
    })

    it('should render an icon for info type', () => {
      const wrapper = mount(NsBanner, { props: { type: 'info' }, slots: { default: 'FYI' } })
      expect(wrapper.find('.ns-banner__icon').exists()).toBe(true)
    })

    it('should not render an icon for neutral type', () => {
      const wrapper = mount(NsBanner, { props: { type: 'neutral' }, slots: { default: 'Note' } })
      expect(wrapper.find('.ns-banner__icon').exists()).toBe(false)
    })

    it('should not render an icon for accent type', () => {
      const wrapper = mount(NsBanner, { props: { type: 'accent' }, slots: { default: 'Note' } })
      expect(wrapper.find('.ns-banner__icon').exists()).toBe(false)
    })
  })

  describe('removable', () => {
    it('should not show dismiss button by default', () => {
      const wrapper = mount(NsBanner, { slots: { default: 'Msg' } })
      expect(wrapper.find('.ns-banner__remove').exists()).toBe(false)
    })

    it('should show dismiss button when removable is true', () => {
      const wrapper = mount(NsBanner, {
        props: { removable: true },
        slots: { default: 'Msg' },
      })
      expect(wrapper.find('.ns-banner__remove').exists()).toBe(true)
    })

    it('should emit remove when dismiss button is clicked', async () => {
      const wrapper = mount(NsBanner, {
        props: { removable: true },
        slots: { default: 'Msg' },
      })
      await wrapper.find('.ns-banner__remove').trigger('click')
      expect(wrapper.emitted('remove')).toBeTruthy()
    })

    it('should use removeLabel on the dismiss button', () => {
      const wrapper = mount(NsBanner, {
        props: { removable: true, removeLabel: 'Close alert' },
        slots: { default: 'Msg' },
      })
      expect(wrapper.find('.ns-banner__remove').attributes('aria-label')).toBe('Close alert')
    })
  })

  describe('accessibility', () => {
    it('should have role=status and aria-live=polite for info', () => {
      const wrapper = mount(NsBanner, { props: { type: 'info' }, slots: { default: 'FYI' } })
      expect(wrapper.find('.ns-banner').attributes('role')).toBe('status')
      expect(wrapper.find('.ns-banner').attributes('aria-live')).toBe('polite')
    })

    it('should have role=status and aria-live=polite for positive', () => {
      const wrapper = mount(NsBanner, { props: { type: 'positive' }, slots: { default: 'OK' } })
      expect(wrapper.find('.ns-banner').attributes('role')).toBe('status')
      expect(wrapper.find('.ns-banner').attributes('aria-live')).toBe('polite')
    })

    it('should have role=alert and aria-live=assertive for warning', () => {
      const wrapper = mount(NsBanner, { props: { type: 'warning' }, slots: { default: 'Careful' } })
      expect(wrapper.find('.ns-banner').attributes('role')).toBe('alert')
      expect(wrapper.find('.ns-banner').attributes('aria-live')).toBe('assertive')
    })

    it('should have role=alert and aria-live=assertive for negative', () => {
      const wrapper = mount(NsBanner, { props: { type: 'negative' }, slots: { default: 'Error' } })
      expect(wrapper.find('.ns-banner').attributes('role')).toBe('alert')
      expect(wrapper.find('.ns-banner').attributes('aria-live')).toBe('assertive')
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root element', () => {
      const wrapper = mount(NsBanner, {
        attrs: { 'data-testid': 'my-banner' },
        slots: { default: 'Msg' },
      })
      expect(wrapper.find('.ns-banner').attributes('data-testid')).toBe('my-banner')
    })
  })
})
