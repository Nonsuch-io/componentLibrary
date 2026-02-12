import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCard from './NsCard.vue'
import NsButton from '../NsButton/NsButton.vue'

const meta: Meta<typeof NsCard> = {
  title: 'Components/NsCard',
  component: NsCard,
  args: {
    title: 'Product Name',
    subtitle: '$49.99',
    flat: false,
  },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    flat: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsCard>

export const Default: Story = {
  render: (args) => ({
    components: { NsCard },
    setup: () => ({ args }),
    template: `
      <NsCard v-bind="args">
        <p>A high-quality product with excellent features and competitive pricing.</p>
      </NsCard>
    `,
  }),
}

export const WithActions: Story = {
  render: (args) => ({
    components: { NsCard, NsButton },
    setup: () => ({ args }),
    template: `
      <NsCard v-bind="args">
        <p>This card has action buttons in the footer.</p>
        <template #actions>
          <NsButton color="primary">Add to cart</NsButton>
          <NsButton flat color="grey">Save for later</NsButton>
        </template>
      </NsCard>
    `,
  }),
}

export const Flat: Story = {
  args: {
    flat: true,
    title: 'Flat Card',
    subtitle: 'No shadow',
  },
  render: (args) => ({
    components: { NsCard },
    setup: () => ({ args }),
    template: `
      <NsCard v-bind="args">
        <p>A flat card with no box-shadow, useful for nested layouts.</p>
      </NsCard>
    `,
  }),
}

export const NoTitle: Story = {
  args: {
    title: undefined,
    subtitle: undefined,
  },
  render: (args) => ({
    components: { NsCard },
    setup: () => ({ args }),
    template: `
      <NsCard v-bind="args">
        <p>A card with no header section — just content.</p>
      </NsCard>
    `,
  }),
}
