import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTabPanel from './NsTabPanel.vue'

const meta: Meta<typeof NsTabPanel> = {
  title: 'Components/NsTabPanel',
  component: NsTabPanel,
  tags: ['autodocs'],
  args: {
    name: 'panel-1',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTabPanel },
    setup: () => ({ args }),
    template: '<NsTabPanel v-bind="args">Panel content</NsTabPanel>',
  }),
}
