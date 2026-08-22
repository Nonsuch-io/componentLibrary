import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTimeline from './NsTimeline.vue'
import NsTimelineEntry from '../NsTimelineEntry/NsTimelineEntry.vue'

const meta: Meta<typeof NsTimeline> = {
  title: 'Components/NsTimeline',
  component: NsTimeline,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTimeline, NsTimelineEntry },
    setup: () => ({ args }),
    // REAL ENTRIES. QTimeline renders a <ul>, which may only contain <li> —
    // bare text made it an invalid list (axe `list`).
    template: `
      <NsTimeline v-bind="args">
        <NsTimelineEntry title="Shipped" subtitle="Today" />
        <NsTimelineEntry title="Reviewed" subtitle="Yesterday" />
      </NsTimeline>
    `,
  }),
}
