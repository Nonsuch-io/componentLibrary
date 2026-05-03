import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBadge from './NsBadge.vue'

const meta = {
  title: 'Components/NsBadge',
  component: NsBadge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'accent',
        'positive',
        'positive-subtle',
        'negative',
        'negative-subtle',
        'info',
        'warning',
        'warning-subtle',
        'ghost',
      ],
    },
    size: {
      control: 'select',
      options: ['dense', 'medium'],
    },
  },
} satisfies Meta<typeof NsBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'primary', size: 'dense' },
  render: (args) => ({
    components: { NsBadge },
    setup: () => ({ args }),
    template: '<NsBadge v-bind="args">Badge</NsBadge>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { NsBadge },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsBadge variant="primary">Primary</NsBadge>
        <NsBadge variant="secondary">Secondary</NsBadge>
        <NsBadge variant="accent">Accent</NsBadge>
        <NsBadge variant="positive">Positive</NsBadge>
        <NsBadge variant="positive-subtle">Positive subtle</NsBadge>
        <NsBadge variant="negative">Negative</NsBadge>
        <NsBadge variant="negative-subtle">Negative subtle</NsBadge>
        <NsBadge variant="info">Info</NsBadge>
        <NsBadge variant="warning">Warning</NsBadge>
        <NsBadge variant="warning-subtle">Warning subtle</NsBadge>
        <NsBadge variant="ghost">Ghost</NsBadge>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsBadge },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsBadge size="dense">Dense</NsBadge>
        <NsBadge size="medium">Medium</NsBadge>
      </div>
    `,
  }),
}

export const Showcase: Story = {
  render: () => ({
    components: { NsBadge },
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Dense</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsBadge size="dense" variant="primary">Badge</NsBadge>
            <NsBadge size="dense" variant="secondary">Badge</NsBadge>
            <NsBadge size="dense" variant="accent">Badge</NsBadge>
            <NsBadge size="dense" variant="positive">Badge</NsBadge>
            <NsBadge size="dense" variant="positive-subtle">Badge</NsBadge>
            <NsBadge size="dense" variant="negative">Badge</NsBadge>
            <NsBadge size="dense" variant="negative-subtle">Badge</NsBadge>
            <NsBadge size="dense" variant="info">Badge</NsBadge>
            <NsBadge size="dense" variant="warning">Badge</NsBadge>
            <NsBadge size="dense" variant="warning-subtle">Badge</NsBadge>
            <NsBadge size="dense" variant="ghost">Badge</NsBadge>
          </div>
        </div>
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Medium</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsBadge size="medium" variant="primary">Badge</NsBadge>
            <NsBadge size="medium" variant="secondary">Badge</NsBadge>
            <NsBadge size="medium" variant="accent">Badge</NsBadge>
            <NsBadge size="medium" variant="positive">Badge</NsBadge>
            <NsBadge size="medium" variant="positive-subtle">Badge</NsBadge>
            <NsBadge size="medium" variant="negative">Badge</NsBadge>
            <NsBadge size="medium" variant="negative-subtle">Badge</NsBadge>
            <NsBadge size="medium" variant="info">Badge</NsBadge>
            <NsBadge size="medium" variant="warning">Badge</NsBadge>
            <NsBadge size="medium" variant="warning-subtle">Badge</NsBadge>
            <NsBadge size="medium" variant="ghost">Badge</NsBadge>
          </div>
        </div>
      </div>
    `,
  }),
}
