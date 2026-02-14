import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsChip from './NsChip.vue'

const meta: Meta<typeof NsChip> = {
  title: 'Components/NsChip',
  component: NsChip,
  args: {
    color: 'primary',
    textColor: 'white',
    outline: false,
    dense: false,
    removable: false,
    clickable: false,
  },
  argTypes: {
    color: { control: 'text' },
    textColor: { control: 'text' },
    outline: { control: 'boolean' },
    dense: { control: 'boolean' },
    removable: { control: 'boolean' },
    clickable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsChip>

export const Default: Story = {
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Active</NsChip>',
  }),
}

export const Outline: Story = {
  args: { outline: true, color: 'primary', textColor: undefined },
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Outline</NsChip>',
  }),
}

export const Removable: Story = {
  args: { removable: true },
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Removable</NsChip>',
  }),
}

export const Dense: Story = {
  args: { dense: true },
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Dense</NsChip>',
  }),
}
