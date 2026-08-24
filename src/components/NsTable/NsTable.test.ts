import { describe, it, expect, expectTypeOf } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
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
    // NsTableProps CANNOT DETECT QUASAR DRIFT, and no assertion routed through it
    // can. types.ts defines it AS `Omit<QTableProps,'rows'> & { rows?: ... }`, so
    // `Omit<NsTableProps,'rows'>` and `Omit<QTableProps,'rows'>` are the same type
    // by construction — comparing them is algebra, not a test.
    //
    // This file has now shipped two bad versions of that idea. The original
    // asserted NsTableProps EQUALS QTableProps, which was false from the day it
    // was written (`rows` is optional here on purpose) and never failed because
    // nothing typechecked tests. Its replacement was tautological instead: review
    // renamed a Quasar prop and vue-tsc still exited 0. Both looked like coverage.
    //
    // So the drift check below does NOT go through NsTableProps. It is a literal
    // list of the props this component actually relies on, checked against
    // Quasar's own keys — independent of our derivation, and it fails if Quasar
    // renames or removes any of them. componentLibrary-9ka.
    it('still has the QTable props NsTable is built on', () => {
      type ReliedUpon =
        | 'rows'
        | 'columns'
        | 'rowKey'
        | 'loading'
        | 'flat'
        | 'bordered'
        | 'hidePagination'
        | 'pagination'
        | 'selection'
        | 'selected'
        | 'filter'
        | 'title'
      // `Exclude` rather than the more obvious
      // `ReliedUpon extends keyof QTableProps ? true : never`, because that
      // conditional only stays strict while `ReliedUpon` is a type ALIAS. Lift it
      // into a generic helper (`type Has<K> = K extends ... ? ...`) and it
      // distributes over the union: partial failures collapse to `true | never`
      // = `true` and the check goes silently vacuous. This assertion is on its
      // THIRD attempt — one false, one tautological — so it is worth using the
      // form with no distribution hazard to reintroduce.
      type Missing = Exclude<ReliedUpon, keyof QTableProps>

      // BOTH LINES, for one reason: diagnostics. expectTypeOf fails with
      // "Expected 1 arguments, but got 0", which names nothing — review expected
      // it to report the missing key and it does not, measured. The assignment
      // below fails with `Type '"hidePagination"' is not assignable to type
      // 'never'`, naming the prop Quasar took. Keep the first for consistency
      // with this file, the second so the failure is readable.
      expectTypeOf<Missing>().toEqualTypeOf<never>()
      const _namesTheMissingProp: never = null as unknown as Missing
      void _namesTheMissingProp
    })

    // The one intended divergence, asserted in BOTH directions. Only the
    // QTableProps half is real drift detection — the NsTableProps half restates
    // types.ts — but it is kept because it fails if Quasar ever makes `rows`
    // optional too and the divergence we document stops existing.
    it('makes rows optional — the one intended divergence from QTable', () => {
      type IsOptional<T, K extends keyof T> =
        Record<string, never> extends Pick<T, K> ? true : false
      expectTypeOf<IsOptional<NsTableProps, 'rows'>>().toEqualTypeOf<true>()
      expectTypeOf<IsOptional<QTableProps, 'rows'>>().toEqualTypeOf<false>()
      expectTypeOf<NsTableProps['rows']>().toEqualTypeOf<QTableProps['rows'] | undefined>()
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

/**
 * componentLibrary-057. NsTable always declares a `#loading` slot, which
 * PERMANENTLY suppresses QTable's native indicator (QTable.js:704). Review showed
 * that replacing the default with an empty slot kept 18 unit tests and all 5
 * story axe checks green — axe passes on nothing rendered. So a regression here
 * would leave consumers with no loading indicator at all, silently.
 */
describe('NsTable loading indicator', () => {
  const columns = [{ name: 'a', label: 'A', field: 'a' }]

  it('RENDERS a named indicator while loading — not nothing', () => {
    const wrapper = mount(NsTable, { props: { rows: [], columns, loading: true } })
    const bar = wrapper.find('.ns-table__loading')
    expect(bar.exists(), 'no loading indicator rendered — QTable’s native one is suppressed').toBe(
      true,
    )
    expect(bar.attributes('role')).toBe('progressbar')
    expect(bar.attributes('aria-label')).toBe('Loading')
  })

  it('renders nothing when not loading', () => {
    const wrapper = mount(NsTable, { props: { rows: [], columns, loading: false } })
    expect(wrapper.find('.ns-table__loading').exists()).toBe(false)
  })

  it('uses loadingLabel when given, so the name is not a hardcoded literal', () => {
    const wrapper = mount(NsTable, {
      props: { rows: [], columns, loading: true, loadingLabel: 'Fetching sessions' },
    })
    expect(wrapper.find('.ns-table__loading').attributes('aria-label')).toBe('Fetching sessions')
  })

  it("a consumer's own loading slot still wins", () => {
    const wrapper = mount(NsTable, {
      props: { rows: [], columns, loading: true },
      slots: { loading: '<div class="mine">Custom</div>' },
    })
    expect(wrapper.find('.mine').exists()).toBe(true)
    expect(wrapper.find('.ns-table__loading').exists()).toBe(false)
  })

  it('forwards a slot added AFTER mount — the forwarder must re-read $slots', async () => {
    // A computed over useSlots() caches forever, so a `v-if`-guarded slot never
    // appeared. Measured in review against a consumer template.
    const harness = defineComponent({
      components: { NsTable },
      props: { show: { type: Boolean, default: false } },
      setup: () => ({ cols: columns }),
      template: `
        <NsTable :rows="[]" :columns="cols">
          <template v-if="show" #top><div class="late">Late</div></template>
        </NsTable>
      `,
    })
    const wrapper = mount(harness, { props: { show: false } })
    expect(wrapper.find('.late').exists()).toBe(false)
    await wrapper.setProps({ show: true })
    expect(wrapper.find('.late').exists(), 'a slot added after mount never rendered').toBe(true)
  })
})
