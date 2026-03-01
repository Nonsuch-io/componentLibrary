import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTimeline from './NsTimeline.vue'

const meta: Meta<typeof NsTimeline> = {
  title: 'Components/NsTimeline',
  component: NsTimeline,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTimeline },
    setup: () => ({ args }),
    template: '<NsTimeline v-bind="args">Default content</NsTimeline>',
  }),
}
