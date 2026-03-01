import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTable from './NsTable.vue'

const defaultProps = { rows: [{ id: 1, name: 'Test' }] }

describe('NsTable', () => {
  it('renders table with row data', () => {
    const wrapper = mount(NsTable, { props: defaultProps })
    expect(wrapper.text()).toContain('Test')
  })

  it('applies the ns-table class', () => {
    const wrapper = mount(NsTable, { props: defaultProps })
    expect(wrapper.find('.ns-table').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTable, {
      props: defaultProps,
      attrs: { 'data-testid': 'test-ns-table' },
    })
    expect(wrapper.find('.q-table__container').attributes('data-testid')).toBe('test-ns-table')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTable, { props: defaultProps, attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-table__container').attributes('aria-label')).toBe('Test label')
    })
  })
})
