import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsMarketingEmailCapture from './NsMarketingEmailCapture.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleEnCA } from '../../locale/en-CA'

describe('NsMarketingEmailCapture', () => {
  it('should render an email input', () => {
    const wrapper = mount(NsMarketingEmailCapture)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsMarketingEmailCapture)
    expect(wrapper.find('.ns-marketing-email-capture').exists()).toBe(true)
  })

  it('should use default placeholder when none provided', () => {
    const wrapper = mount(NsMarketingEmailCapture)
    expect(wrapper.find('input').attributes('placeholder')).toBe('your@email.com')
  })

  it('should use custom placeholder when provided', () => {
    const wrapper = mount(NsMarketingEmailCapture, { props: { placeholder: 'Enter email...' } })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter email...')
  })

  it('should reflect modelValue in the input', () => {
    const wrapper = mount(NsMarketingEmailCapture, { props: { modelValue: 'test@example.com' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('test@example.com')
  })

  it('should emit update:modelValue on input', async () => {
    const wrapper = mount(NsMarketingEmailCapture)
    await wrapper.find('input').setValue('hello@example.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello@example.com'])
  })

  it('should render cta slot content', () => {
    const wrapper = mount(NsMarketingEmailCapture, {
      slots: { cta: '<button class="cta-btn">Submit</button>' },
    })
    expect(wrapper.find('.cta-btn').exists()).toBe(true)
  })

  it('should add focused class when input is focused', async () => {
    const wrapper = mount(NsMarketingEmailCapture)
    await wrapper.find('input').trigger('focus')
    expect(wrapper.find('.ns-marketing-email-capture--focused').exists()).toBe(true)
  })

  it('should remove focused class when input loses focus', async () => {
    const wrapper = mount(NsMarketingEmailCapture)
    await wrapper.find('input').trigger('focus')
    await wrapper.find('input').trigger('blur')
    expect(wrapper.find('.ns-marketing-email-capture--focused').exists()).toBe(false)
  })

  describe('accessibility', () => {
    it('should have an aria-label on the input', () => {
      const wrapper = mount(NsMarketingEmailCapture)
      expect(wrapper.find('input').attributes('aria-label')).toBeTruthy()
    })

    it('should use the default aria-label from en-CA locale', () => {
      const wrapper = mount(NsMarketingEmailCapture)
      expect(wrapper.find('input').attributes('aria-label')).toBe('Email address')
    })

    it('should use a custom aria-label when provided via prop', () => {
      const wrapper = mount(NsMarketingEmailCapture, {
        props: { ariaLabel: 'Newsletter signup email' },
      })
      expect(wrapper.find('input').attributes('aria-label')).toBe('Newsletter signup email')
    })
  })

  describe('locale integration', () => {
    it('should use injected locale for aria-label and placeholder', () => {
      const wrapper = mount(NsMarketingEmailCapture, {
        global: {
          provide: {
            [NsLocaleKey as symbol]: {
              ...nsLocaleEnCA,
              marketing: {
                emailAddress: 'Courriel',
                emailPlaceholder: 'vous@exemple.ca',
              },
            },
          },
        },
      })
      expect(wrapper.find('input').attributes('aria-label')).toBe('Courriel')
      expect(wrapper.find('input').attributes('placeholder')).toBe('vous@exemple.ca')
    })

    it('should let explicit props override injected locale', () => {
      const wrapper = mount(NsMarketingEmailCapture, {
        props: { placeholder: 'Override', ariaLabel: 'Override label' },
        global: {
          provide: {
            [NsLocaleKey as symbol]: {
              ...nsLocaleEnCA,
              marketing: {
                emailAddress: 'Locale label',
                emailPlaceholder: 'Locale placeholder',
              },
            },
          },
        },
      })
      expect(wrapper.find('input').attributes('aria-label')).toBe('Override label')
      expect(wrapper.find('input').attributes('placeholder')).toBe('Override')
    })
  })
})
