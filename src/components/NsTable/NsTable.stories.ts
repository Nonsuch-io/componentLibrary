import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTable from './NsTable.vue'
import NsTableCell from '../NsTableCell/NsTableCell.vue'
import type { NsTableColumn } from './types'

interface SessionRow {
  sessionId: string
  startedAt: string
  status: 'active' | 'ended'
}

const sessions: SessionRow[] = [
  { sessionId: 'sess_01H', startedAt: '2026-04-14T09:21:00Z', status: 'active' },
  { sessionId: 'sess_01J', startedAt: '2026-04-14T10:02:00Z', status: 'active' },
  { sessionId: 'sess_01K', startedAt: '2026-04-13T16:47:00Z', status: 'ended' },
  { sessionId: 'sess_01L', startedAt: '2026-04-13T14:11:00Z', status: 'ended' },
  { sessionId: 'sess_01M', startedAt: '2026-04-12T20:30:00Z', status: 'ended' },
]

const sessionColumns: NsTableColumn<SessionRow>[] = [
  { name: 'sessionId', label: 'Session ID', field: 'sessionId', align: 'left' },
  { name: 'startedAt', label: 'Started', field: 'startedAt', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
]

const meta: Meta<typeof NsTable> = {
  title: 'Components/NsTable',
  component: NsTable,
  tags: ['autodocs'],
  args: {
    rows: [
      { id: 1, name: 'Row 1' },
      { id: 2, name: 'Row 2' },
    ],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTable },
    setup: () => ({ args }),
    template: '<NsTable v-bind="args" />',
  }),
}

export const WithColumns: Story = {
  args: {
    rows: sessions,
    columns: sessionColumns,
    rowKey: 'sessionId',
    flat: true,
  },
  render: (args) => ({
    components: { NsTable },
    setup: () => ({ args }),
    template: '<NsTable v-bind="args" />',
  }),
}

export const WithBodyCellSlot: Story = {
  args: {
    rows: sessions,
    columns: sessionColumns,
    rowKey: 'sessionId',
    flat: true,
  },
  render: (args) => ({
    components: { NsTable, NsTableCell },
    setup: () => {
      const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-CA')
      return { args, formatDateTime }
    },
    template: `
      <NsTable v-bind="args">
        <template #body-cell-startedAt="cellProps">
          <NsTableCell :props="cellProps">{{ formatDateTime(cellProps.row.startedAt) }}</NsTableCell>
        </template>
        <template #no-data>
          <div class="full-width text-center text-grey-6 q-pa-lg">No sessions</div>
        </template>
      </NsTable>
    `,
  }),
}

export const Paginated: Story = {
  args: {
    rows: sessions,
    columns: sessionColumns,
    rowKey: 'sessionId',
    pagination: { page: 1, rowsPerPage: 2 },
  },
  render: (args) => ({
    components: { NsTable },
    setup: () => ({ args }),
    template: '<NsTable v-bind="args" />',
  }),
}

export const Loading: Story = {
  args: {
    rows: [],
    columns: sessionColumns,
    rowKey: 'sessionId',
    loading: true,
  },
  render: (args) => ({
    components: { NsTable },
    setup: () => ({ args }),
    template: '<NsTable v-bind="args" />',
  }),
}
