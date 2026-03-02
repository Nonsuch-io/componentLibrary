import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsDashboardGrid from './NsDashboardGrid.vue'
import NsCard from '../NsCard/NsCard.vue'

const meta: Meta<typeof NsDashboardGrid> = {
  title: 'Templates/NsDashboardGrid',
  component: NsDashboardGrid,
  args: {
    gap: 'md',
  },
  argTypes: {
    gap: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof NsDashboardGrid>

const widgetData = [
  { title: 'Revenue', value: '$12,340' },
  { title: 'Orders', value: '156' },
  { title: 'Customers', value: '2,847' },
  { title: 'Conversion', value: '3.2%' },
  { title: 'Avg Order', value: '$79.10' },
  { title: 'Returns', value: '12' },
]

export const Default: Story = {
  render: (args) => ({
    components: { NsDashboardGrid, NsCard },
    setup: () => ({ args, widgetData }),
    template: `
      <div class="q-pa-md">
        <NsDashboardGrid v-bind="args">
          <NsCard v-for="widget in widgetData" :key="widget.title" :title="widget.title">
            <div class="text-h4 text-weight-bold">{{ widget.value }}</div>
          </NsCard>
        </NsDashboardGrid>
      </div>
    `,
  }),
}

export const TwoColumns: Story = {
  args: {
    columns: { xs: 1, sm: 2, md: 2, lg: 2 },
  },
  render: (args) => ({
    components: { NsDashboardGrid, NsCard },
    setup: () => ({ args, widgetData: widgetData.slice(0, 4) }),
    template: `
      <div class="q-pa-md">
        <NsDashboardGrid v-bind="args">
          <NsCard v-for="widget in widgetData" :key="widget.title" :title="widget.title">
            <div class="text-h4 text-weight-bold">{{ widget.value }}</div>
          </NsCard>
        </NsDashboardGrid>
      </div>
    `,
  }),
}

export const LargeGap: Story = {
  args: {
    gap: 'xl',
  },
  render: (args) => ({
    components: { NsDashboardGrid, NsCard },
    setup: () => ({ args, widgetData: widgetData.slice(0, 4) }),
    template: `
      <div class="q-pa-md">
        <NsDashboardGrid v-bind="args">
          <NsCard v-for="widget in widgetData" :key="widget.title" :title="widget.title">
            <div class="text-h4 text-weight-bold">{{ widget.value }}</div>
          </NsCard>
        </NsDashboardGrid>
      </div>
    `,
  }),
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => ({
    components: { NsDashboardGrid, NsCard },
    setup: () => ({ args, widgetData: widgetData.slice(0, 4) }),
    template: `
      <div class="q-pa-md">
        <NsDashboardGrid v-bind="args">
          <NsCard v-for="widget in widgetData" :key="widget.title" :title="widget.title">
            <div class="text-h4 text-weight-bold">{{ widget.value }}</div>
          </NsCard>
        </NsDashboardGrid>
      </div>
    `,
  }),
}
