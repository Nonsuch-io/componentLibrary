import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsButton from './NsButton.vue'
import { NsSkeleton } from '../NsSkeleton'

const meta = {
  title: 'Components/NsButton',
  component: NsButton,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning'],
      description: 'Quasar color palette name',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Button size',
    },
    unelevated: {
      control: 'boolean',
      description: 'Remove elevation (box-shadow)',
    },
    noCaps: {
      control: 'boolean',
      description: 'Disable uppercase text',
    },
    rounded: {
      control: 'boolean',
      description: 'Apply rounded border-radius',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner overlay',
    },
  },
} satisfies Meta<typeof NsButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  render: (args) => ({
    components: { NsButton },
    setup() {
      return { args }
    },
    template: '<NsButton v-bind="args">Click Me</NsButton>',
  }),
}

export const Colors: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <NsButton color="primary">Primary</NsButton>
        <NsButton color="secondary">Secondary</NsButton>
        <NsButton color="accent">Accent</NsButton>
        <NsButton color="positive">Positive</NsButton>
        <NsButton color="negative">Negative</NsButton>
        <NsButton color="info">Info</NsButton>
        <NsButton color="warning">Warning</NsButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <NsButton size="xs">Extra Small</NsButton>
        <NsButton size="sm">Small</NsButton>
        <NsButton size="md">Medium</NsButton>
        <NsButton size="lg">Large</NsButton>
        <NsButton size="xl">Extra Large</NsButton>
      </div>
    `,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    components: { NsButton },
    template: '<NsButton icon="send">Send</NsButton>',
  }),
}

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => ({
    components: { NsButton },
    setup() {
      return { args }
    },
    template: '<NsButton v-bind="args">Submit</NsButton>',
  }),
}

export const LoadingSizes: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <NsButton size="xs" loading>Extra Small</NsButton>
        <NsButton size="sm" loading>Small</NsButton>
        <NsButton size="md" loading>Medium</NsButton>
        <NsButton size="lg" loading>Large</NsButton>
        <NsButton size="xl" loading>Extra Large</NsButton>
      </div>
    `,
  }),
}

export const SkeletonPlaceholder: Story = {
  render: () => ({
    components: { NsSkeleton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center;">
        <NsSkeleton type="QBtn" />
        <NsSkeleton type="QBtn" width="120px" />
        <NsSkeleton type="QBtn" width="160px" />
      </div>
    `,
  }),
}
