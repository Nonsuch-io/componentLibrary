import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsNumberTile from './NsNumberTile.vue'

describe('NsNumberTile', () => {
  it('should render a numeric number prop', () => {
    const wrapper = mount(NsNumberTile, { props: { number: 3 } })
    expect(wrapper.text()).toContain('3')
  })

  it('should render a string number prop', () => {
    const wrapper = mount(NsNumberTile, { props: { number: '01' } })
    expect(wrapper.text()).toContain('01')
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsNumberTile, { props: { number: 1 } })
    expect(wrapper.find('.ns-number-tile').exists()).toBe(true)
  })

  it('should render the number inside the number element', () => {
    const wrapper = mount(NsNumberTile, { props: { number: 7 } })
    expect(wrapper.find('.ns-number-tile__number').text()).toBe('7')
  })
})
