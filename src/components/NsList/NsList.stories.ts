import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsList from './NsList.vue'

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
    components: { NsList },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <div class="q-item">Item 1</div>
        <div class="q-item">Item 2</div>
        <div class="q-item">Item 3</div>
      </NsList>
    `,
  }),
}

export const Bordered: Story = {
  args: { bordered: true },
  render: (args) => ({
    components: { NsList },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <div class="q-item">Bordered item 1</div>
        <div class="q-item">Bordered item 2</div>
      </NsList>
    `,
  }),
}

export const Dense: Story = {
  args: { dense: true },
  render: (args) => ({
    components: { NsList },
    setup: () => ({ args }),
    template: `
      <NsList v-bind="args">
        <div class="q-item">Dense item 1</div>
        <div class="q-item">Dense item 2</div>
        <div class="q-item">Dense item 3</div>
      </NsList>
    `,
  }),
}
