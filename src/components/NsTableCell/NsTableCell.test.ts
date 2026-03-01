import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTableCell from './NsTableCell.vue'

describe('NsTableCell', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsTableCell, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-table-cell class', () => {
    const wrapper = mount(NsTableCell)
    expect(wrapper.find('.ns-table-cell').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTableCell, { attrs: { 'data-testid': 'test-ns-table-cell' } })
    expect(wrapper.find('.q-td').attributes('data-testid')).toBe('test-ns-table-cell')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTableCell, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-td').attributes('aria-label')).toBe('Test label')
    })
  })
})
