import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnimatedEye from './AnimatedEye.vue'

describe('AnimatedEye', () => {
  it('should apply ns-eye--open class when open is true', () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.classes()).toContain('ns-eye--open')
    expect(wrapper.classes()).not.toContain('ns-eye--closed')
  })

  it('should apply ns-eye--closed class when open is false', () => {
    const wrapper = mount(AnimatedEye, { props: { open: false } })
    expect(wrapper.classes()).toContain('ns-eye--closed')
    expect(wrapper.classes()).not.toContain('ns-eye--open')
  })

  it('should render an SVG with the eye shape, pupil, and lid', () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__shape').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__pupil').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__lid').exists()).toBe(true)
  })

  it('should update the state class when open prop toggles', async () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.classes()).toContain('ns-eye--open')
    await wrapper.setProps({ open: false })
    expect(wrapper.classes()).toContain('ns-eye--closed')
    expect(wrapper.classes()).not.toContain('ns-eye--open')
  })

  describe('accessibility', () => {
    it('should be aria-hidden so the parent button retains the label', () => {
      const wrapper = mount(AnimatedEye, { props: { open: true } })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
    })
  })
})
