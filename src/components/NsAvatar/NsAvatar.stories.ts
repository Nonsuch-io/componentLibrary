import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAvatar from './NsAvatar.vue'

const meta: Meta<typeof NsAvatar> = {
  title: 'Components/NsAvatar',
  component: NsAvatar,
  args: {
    size: 'md',
    color: 'primary',
    textColor: 'white',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: { control: 'text' },
    textColor: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsAvatar>

export const Default: Story = {
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args">JD</NsAvatar>',
  }),
}

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args">S</NsAvatar>',
  }),
}

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args">LG</NsAvatar>',
  }),
}

export const ExtraLarge: Story = {
  args: { size: 'xl' },
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args">XL</NsAvatar>',
  }),
}
