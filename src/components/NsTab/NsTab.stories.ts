import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTab from './NsTab.vue'
import NsTabs from '../NsTabs/NsTabs.vue'

const meta: Meta<typeof NsTab> = {
  title: 'Components/NsTab',
  component: NsTab,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'tab1',
    label: 'Tab 1',
  },
  render: (args) => ({
    components: { NsTab, NsTabs },
    setup: () => ({ args }),
    template: `
      <NsTabs model-value="tab1">
        <NsTab v-bind="args" />
        <NsTab name="tab2" label="Tab 2" />
      </NsTabs>
    `,
  }),
}
