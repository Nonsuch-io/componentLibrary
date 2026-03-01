import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTabPanels from './NsTabPanels.vue'
import NsTabPanel from '../NsTabPanel/NsTabPanel.vue'

const meta: Meta<typeof NsTabPanels> = {
  title: 'Components/NsTabPanels',
  component: NsTabPanels,
  tags: ['autodocs'],
  args: {
    modelValue: 'tab-1',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTabPanels, NsTabPanel },
    setup: () => ({ args }),
    template: `
      <NsTabPanels v-bind="args">
        <NsTabPanel name="tab-1">Panel 1</NsTabPanel>
        <NsTabPanel name="tab-2">Panel 2</NsTabPanel>
      </NsTabPanels>
    `,
  }),
}
