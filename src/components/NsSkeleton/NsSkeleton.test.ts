import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSkeleton from './NsSkeleton.vue'

describe('NsSkeleton', () => {
  const mountSkeleton = (props = {}) => {
    return mount(NsSkeleton, { props })
  }

  it('renders with default props', () => {
    const wrapper = mountSkeleton()
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.exists()).toBe(true)
  })

  it('applies wave animation by default', () => {
    const wrapper = mountSkeleton()
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.classes()).toContain('q-skeleton--anim-wave')
  })

  it('accepts type prop', () => {
    const wrapper = mountSkeleton({ type: 'circle' })
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.classes()).toContain('q-skeleton--type-circle')
  })

  it('accepts animation prop', () => {
    const wrapper = mountSkeleton({ animation: 'pulse' })
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.classes()).toContain('q-skeleton--anim-pulse')
  })

  it('applies bordered prop', () => {
    const wrapper = mountSkeleton({ bordered: true })
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.classes()).toContain('q-skeleton--bordered')
  })

  it('applies square prop', () => {
    const wrapper = mountSkeleton({ square: true })
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.classes()).toContain('q-skeleton--square')
  })

  it('applies custom width and height', () => {
    const wrapper = mountSkeleton({ width: '200px', height: '100px' })
    const skeleton = wrapper.find('.q-skeleton')
    expect(skeleton.attributes('style')).toContain('width: 200px')
    expect(skeleton.attributes('style')).toContain('height: 100px')
  })

  it('has ns-skeleton class', () => {
    const wrapper = mountSkeleton()
    expect(wrapper.find('.ns-skeleton').exists()).toBe(true)
  })

  describe('accessibility', () => {
    it('is hidden from screen readers with aria-hidden', () => {
      const wrapper = mountSkeleton()
      const skeleton = wrapper.find('.q-skeleton')
      expect(skeleton.attributes('aria-hidden')).toBe('true')
    })
  })
})
