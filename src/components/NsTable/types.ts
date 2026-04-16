import type { QTableColumn, QTableProps, QTableSlots, QTdProps } from 'quasar'

/**
 * NsTableProps — drop-in compatible with Quasar's QTableProps.
 *
 * Accepts every prop QTable accepts (columns, pagination, rowKey, loading,
 * flat, bordered, hidePagination, selection, etc.). `rows` is optional so
 * existing consumers that only pass `rows` — or no rows at all — continue to
 * work; when omitted, NsTable defaults it to an empty array at runtime.
 */
export type NsTableProps = Omit<QTableProps, 'rows'> & {
  rows?: QTableProps['rows']
}

/**
 * Column definition for NsTable. Re-exports Quasar's QTableColumn<Row> so
 * consumers never need to reach into `quasar` for table types.
 *
 * Generic parameter mirrors Quasar's QTableColumn signature (`Record<string,
 * any>` with an `any` default) so arbitrary row interfaces assign cleanly.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NsTableColumn<Row extends Record<string, any> = any> = QTableColumn<Row>

/**
 * Scope object passed to NsTable's body-cell / body-cell-<name> slots.
 *
 * Matches the shape QTable emits — use this when typing a scoped slot
 * consumer, e.g. `#body-cell-foo="cellProps: NsTableBodyCellSlotProps"`.
 */
export type NsTableBodyCellSlotProps = Parameters<NonNullable<QTableSlots['body-cell']>>[0]

/**
 * NsTableCellProps — drop-in compatible with Quasar's QTdProps.
 *
 * Used inside a body-cell slot with `:props="cellProps"`.
 */
export type NsTableCellProps = QTdProps

// Compile-time assertions: enforce NsTableColumn ↔ QTableColumn equivalence.
// If these ever drift from Quasar's types, `vue-tsc` will flag it during
// `pnpm typecheck` / `pnpm build`.
type Assert<T, U extends T> = U
type _AssertColumnAssignableToQ = Assert<QTableColumn, NsTableColumn>
type _AssertQColumnAssignableToNs = Assert<NsTableColumn, QTableColumn>
interface _SampleRow {
  id: number
  name: string
}
type _AssertTypedColumnToQ = Assert<QTableColumn<_SampleRow>, NsTableColumn<_SampleRow>>
type _AssertQTypedColumnToNs = Assert<NsTableColumn<_SampleRow>, QTableColumn<_SampleRow>>
export type __NsTableTypeAssertions = [
  _AssertColumnAssignableToQ,
  _AssertQColumnAssignableToNs,
  _AssertTypedColumnToQ,
  _AssertQTypedColumnToNs,
]
