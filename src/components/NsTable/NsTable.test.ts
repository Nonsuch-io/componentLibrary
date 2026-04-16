import { describe, it, expect, expectTypeOf } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import type { QTableColumn, QTableProps } from 'quasar'
import NsTable from './NsTable.vue'
import NsTableCell from '../NsTableCell/NsTableCell.vue'
import type {
  NsTableBodyCellSlotProps,
  NsTableCellProps,
  NsTableColumn,
  NsTableProps,
} from './types'

interface Row {
  id: number
  name: string
}

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
]

const columns: NsTableColumn<Row>[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
]

describe('NsTable', () => {
  it('renders table with row data', () => {
    const wrapper = mount(NsTable, {
      props: { rows: [{ id: 1, name: 'Test' }] },
      slots: { default: 'Table content' },
    })
    expect(wrapper.text()).toContain('Test')
  })

  it('applies the ns-table class', () => {
    const wrapper = mount(NsTable, {
      props: { rows: [{ id: 1, name: 'Test' }] },
      slots: { default: 'content' },
    })
    expect(wrapper.find('.ns-table').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTable, {
      props: { rows: [{ id: 1, name: 'Test' }] },
      slots: { default: 'content' },
      attrs: { 'data-testid': 'test-ns-table' },
    })
    expect(wrapper.find('.q-table__container').attributes('data-testid')).toBe('test-ns-table')
  })

  it('renders with columns and rows', () => {
    const wrapper = mount(NsTable, {
      props: { rows, columns, rowKey: 'id' },
    })
    expect(wrapper.text()).toContain('ID')
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })

  it('forwards the body-cell-<name> slot to the underlying QTable', () => {
    const wrapper = mount(NsTable, {
      props: { rows, columns, rowKey: 'id' },
      slots: {
        'body-cell-name': (cellProps: NsTableBodyCellSlotProps) =>
          h('td', { class: 'custom-name-cell' }, `custom:${String(cellProps.row.name)}`),
      },
    })
    expect(wrapper.findAll('.custom-name-cell').length).toBe(2)
    expect(wrapper.text()).toContain('custom:Alice')
    expect(wrapper.text()).toContain('custom:Bob')
  })

  it('renders the no-data slot when rows is empty', () => {
    const wrapper = mount(NsTable, {
      props: { rows: [], columns },
      slots: { 'no-data': () => h('div', { class: 'empty-state' }, 'No rows') },
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No rows')
  })

  it('renders the top slot', () => {
    const wrapper = mount(NsTable, {
      props: { rows, columns },
      slots: { top: () => h('div', { class: 'top-slot' }, 'Table top') },
    })
    expect(wrapper.find('.top-slot').exists()).toBe(true)
    expect(wrapper.text()).toContain('Table top')
  })

  it('passes through the loading prop to QTable', () => {
    const wrapper = mount(NsTable, {
      props: { rows, columns, loading: true },
    })
    expect(wrapper.find('.q-table--loading').exists()).toBe(true)
  })

  it('passes through the pagination prop to QTable', () => {
    const wrapper = mount(NsTable, {
      props: {
        rows,
        columns,
        pagination: { rowsPerPage: 1 },
      },
    })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('passes through the selection prop to QTable', () => {
    const wrapper = mount(NsTable, {
      props: {
        rows,
        columns,
        rowKey: 'id',
        selection: 'multiple',
        selected: [],
      },
    })
    expect(wrapper.find('.q-table__top, thead').exists()).toBe(true)
    expect(wrapper.findAll('.q-checkbox').length).toBeGreaterThan(0)
  })

  it('passes through flat, bordered, and hide-pagination attrs', () => {
    const wrapper = mount(NsTable, {
      props: {
        rows,
        columns,
        flat: true,
        bordered: true,
        hidePagination: true,
      },
    })
    const container = wrapper.find('.q-table__container')
    expect(container.classes()).toContain('q-table--flat')
    expect(container.classes()).toContain('q-table--bordered')
  })

  describe('types', () => {
    it('NsTableProps is equivalent to QTableProps', () => {
      expectTypeOf<NsTableProps>().toEqualTypeOf<QTableProps>()
    })

    it('NsTableColumn is equivalent to QTableColumn', () => {
      expectTypeOf<NsTableColumn>().toEqualTypeOf<QTableColumn>()
      expectTypeOf<NsTableColumn<Row>>().toEqualTypeOf<QTableColumn<Row>>()
    })

    it('NsTableColumn assignments are bidirectional with QTableColumn', () => {
      const ns: NsTableColumn<Row> = {
        name: 'id',
        label: 'ID',
        field: 'id',
        align: 'left',
      }
      const q: QTableColumn<Row> = ns
      const ns2: NsTableColumn<Row> = q
      expect(ns2.name).toBe('id')
    })

    it('NsTableProps accepts the full QTable API surface', () => {
      const props: NsTableProps = {
        rows,
        columns,
        rowKey: 'id',
        loading: false,
        flat: true,
        bordered: true,
        hidePagination: true,
        pagination: { page: 1, rowsPerPage: 20, rowsNumber: 0, sortBy: null, descending: false },
        selection: 'multiple',
      }
      expect(props.rows?.length).toBe(2)
    })

    it('NsTableCellProps accepts a props scope object', () => {
      const _cellProps: NsTableCellProps = { props: {} as NsTableBodyCellSlotProps }
      expect(_cellProps).toBeDefined()
    })
  })

  describe('NsTableCell integration', () => {
    it('works inside a body-cell-<name> slot using NsTableCell + :props="cellProps"', () => {
      const wrapper = mount(NsTable, {
        props: { rows, columns, rowKey: 'id' },
        slots: {
          'body-cell-name': (cellProps: NsTableBodyCellSlotProps) =>
            h(
              NsTableCell,
              { props: cellProps, class: 'cell-alias' },
              () => `>${String(cellProps.row.name)}`,
            ),
        },
      })
      expect(wrapper.findAll('.cell-alias').length).toBe(2)
      expect(wrapper.text()).toContain('>Alice')
      expect(wrapper.text()).toContain('>Bob')
    })
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTable, {
        props: { rows: [{ id: 1, name: 'Test' }] },
        slots: { default: 'content' },
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-table__container').attributes('aria-label')).toBe('Test label')
    })
  })
})
