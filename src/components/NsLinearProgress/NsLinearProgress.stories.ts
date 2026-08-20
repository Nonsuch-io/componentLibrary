import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsLinearProgress from './NsLinearProgress.vue'

const meta: Meta<typeof NsLinearProgress> = {
  title: 'Components/NsLinearProgress',
  component: NsLinearProgress,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsLinearProgress },
    setup: () => ({ args }),
    // NAMED. QLinearProgress renders role="progressbar" (QLinearProgress.js:135),
    // which announces as an unnamed progress bar without one — the same class as
    // the icon-only button and the unnamed dialog (componentLibrary-057).
    template: '<NsLinearProgress v-bind="args" aria-label="Upload progress" />',
  }),
}
