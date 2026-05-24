import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AnimatedEye from './AnimatedEye.vue'

describe('AnimatedEye', () => {
  it('applies ns-eye--open class when open=true', () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.classes()).toContain('ns-eye--open')
    expect(wrapper.classes()).not.toContain('ns-eye--closed')
  })

  it('applies ns-eye--closed class when open=false', () => {
    const wrapper = mount(AnimatedEye, { props: { open: false } })
    expect(wrapper.classes()).toContain('ns-eye--closed')
    expect(wrapper.classes()).not.toContain('ns-eye--open')
  })

  it('renders an SVG with eye shape and lid', () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__shape').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__pupil').exists()).toBe(true)
    expect(wrapper.find('.ns-eye__lid').exists()).toBe(true)
  })

  it('is decorative (aria-hidden)', () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.attributes('aria-hidden')).toBe('true')
  })

  it('updates state class when open prop toggles', async () => {
    const wrapper = mount(AnimatedEye, { props: { open: true } })
    expect(wrapper.classes()).toContain('ns-eye--open')
    await wrapper.setProps({ open: false })
    expect(wrapper.classes()).toContain('ns-eye--closed')
    expect(wrapper.classes()).not.toContain('ns-eye--open')
  })
})
