import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTimelineEntry from './NsTimelineEntry.vue'

const meta: Meta<typeof NsTimelineEntry> = {
  title: 'Components/NsTimelineEntry',
  component: NsTimelineEntry,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTimelineEntry },
    setup: () => ({ args }),
    template: '<NsTimelineEntry v-bind="args">Default content</NsTimelineEntry>',
  }),
}
