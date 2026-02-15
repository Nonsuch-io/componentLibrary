import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCard from './NsCard.vue'

describe('NsCard', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsCard, {
      slots: { default: 'Card body content' },
    })
    expect(wrapper.text()).toContain('Card body content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'My Card' },
    })
    expect(wrapper.text()).toContain('My Card')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'Title', subtitle: '$29.99' },
    })
    expect(wrapper.text()).toContain('$29.99')
  })

  it('does not render header section when no title or header slot', () => {
    const wrapper = mount(NsCard, {
      slots: { default: 'Body only' },
    })
    expect(wrapper.find('.ns-card__header').exists()).toBe(false)
  })

  it('applies ns-card class', () => {
    const wrapper = mount(NsCard)
    expect(wrapper.find('.ns-card').exists()).toBe(true)
  })

  it('applies flat modifier class', () => {
    const wrapper = mount(NsCard, { props: { flat: true } })
    expect(wrapper.find('.ns-card--flat').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(NsCard, {
      slots: {
        default: 'Body',
        actions: '<button>Action</button>',
      },
    })
    expect(wrapper.find('.q-card__actions').exists()).toBe(true)
    expect(wrapper.text()).toContain('Action')
  })

  it('renders custom header slot', () => {
    const wrapper = mount(NsCard, {
      slots: {
        header: '<div class="custom-header">Custom!</div>',
        default: 'Body',
      },
    })
    expect(wrapper.find('.custom-header').text()).toBe('Custom!')
  })

  it('renders title, subtitle, and actions together', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'Full Card', subtitle: 'With everything' },
      slots: {
        default: 'Full body',
        actions: '<button>Action</button>',
      },
    })
    expect(wrapper.text()).toContain('Full Card')
    expect(wrapper.text()).toContain('With everything')
    expect(wrapper.find('.q-card__actions').exists()).toBe(true)
  })
})
