import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBanner from './NsBanner.vue'

const meta: Meta<typeof NsBanner> = {
  title: 'Components/NsBanner',
  component: NsBanner,
  args: {
    type: 'info',
    dense: false,
    rounded: true,
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'negative'],
    },
    dense: { control: 'boolean' },
    rounded: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsBanner>

export const Info: Story = {
  render: (args) => ({
    components: { NsBanner },
    setup: () => ({ args }),
    template: '<NsBanner v-bind="args">This is an informational message.</NsBanner>',
  }),
}

export const Positive: Story = {
  args: { type: 'positive' },
  render: (args) => ({
    components: { NsBanner },
    setup: () => ({ args }),
    template: '<NsBanner v-bind="args">Changes saved successfully!</NsBanner>',
  }),
}

export const Warning: Story = {
  args: { type: 'warning' },
  render: (args) => ({
    components: { NsBanner },
    setup: () => ({ args }),
    template: '<NsBanner v-bind="args">Please review before continuing.</NsBanner>',
  }),
}

export const Negative: Story = {
  args: { type: 'negative' },
  render: (args) => ({
    components: { NsBanner },
    setup: () => ({ args }),
    template: '<NsBanner v-bind="args">Something went wrong. Try again.</NsBanner>',
  }),
}
