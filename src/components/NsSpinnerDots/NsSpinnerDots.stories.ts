import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSpinnerDots from './NsSpinnerDots.vue'

const meta: Meta<typeof NsSpinnerDots> = {
  title: 'Components/NsSpinnerDots',
  component: NsSpinnerDots,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsSpinnerDots },
    setup: () => ({ args }),
    template: '<NsSpinnerDots v-bind="args">Default content</NsSpinnerDots>',
  }),
}
