import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsList from './NsList.vue'
import NsItem from '../NsItem/NsItem.vue'

const meta: Meta<typeof NsList> = {
  title: 'Components/NsList',
  component: NsList,
  args: {
    bordered: false,
    separator: true,
    dense: false,
  },
  argTypes: {
    bordered: { control: 'boolean' },
    separator: { control: 'boolean' },
    dense: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsList>

export const Default: Story = {
  render: (args) => ({
    components: { NsList, NsItem },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <NsItem>Item 1</NsItem>
        <NsItem>Item 2</NsItem>
        <NsItem>Item 3</NsItem>
      </NsList>
    `,
  }),
}

export const Bordered: Story = {
  args: { bordered: true },
  render: (args) => ({
    components: { NsList, NsItem },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <NsItem>Bordered item 1</NsItem>
        <NsItem>Bordered item 2</NsItem>
      </NsList>
    `,
  }),
}

export const Dense: Story = {
  args: { dense: true },
  render: (args) => ({
    components: { NsList, NsItem },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <NsItem>Dense item 1</NsItem>
        <NsItem>Dense item 2</NsItem>
        <NsItem>Dense item 3</NsItem>
      </NsList>
    `,
  }),
}
