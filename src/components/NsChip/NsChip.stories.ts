import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsChip from './NsChip.vue'

const meta = {
  title: 'Components/NsChip',
  component: NsChip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'positive', 'negative', 'info', 'warning'],
    },
    outline: { control: 'boolean' },
    dense: { control: 'boolean' },
  },
} satisfies Meta<typeof NsChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'primary', outline: false, dense: false },
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Chip label</NsChip>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsChip variant="primary">Primary</NsChip>
        <NsChip variant="secondary">Secondary</NsChip>
        <NsChip variant="accent">Accent</NsChip>
        <NsChip variant="positive">Positive</NsChip>
        <NsChip variant="negative">Negative</NsChip>
        <NsChip variant="info">Info</NsChip>
        <NsChip variant="warning">Warning</NsChip>
      </div>
    `,
  }),
}

export const Outlined: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsChip variant="primary" outline>Primary</NsChip>
        <NsChip variant="secondary" outline>Secondary</NsChip>
        <NsChip variant="accent" outline>Accent</NsChip>
        <NsChip variant="positive" outline>Positive</NsChip>
        <NsChip variant="negative" outline>Negative</NsChip>
        <NsChip variant="info" outline>Info</NsChip>
        <NsChip variant="warning" outline>Warning</NsChip>
      </div>
    `,
  }),
}

export const Dense: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsChip variant="primary" dense>Primary</NsChip>
        <NsChip variant="secondary" dense>Secondary</NsChip>
        <NsChip variant="accent" dense>Accent</NsChip>
        <NsChip variant="positive" dense>Positive</NsChip>
        <NsChip variant="negative" dense>Negative</NsChip>
        <NsChip variant="info" dense>Info</NsChip>
        <NsChip variant="warning" dense>Warning</NsChip>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsChip variant="primary" disable>Primary</NsChip>
        <NsChip variant="primary" outline disable>Primary outline</NsChip>
        <NsChip variant="primary" dense disable>Primary dense</NsChip>
      </div>
    `,
  }),
}

export const Showcase: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Default size — filled</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsChip variant="primary">Chip label</NsChip>
            <NsChip variant="secondary">Chip label</NsChip>
            <NsChip variant="accent">Chip label</NsChip>
            <NsChip variant="positive">Chip label</NsChip>
            <NsChip variant="negative">Chip label</NsChip>
            <NsChip variant="info">Chip label</NsChip>
            <NsChip variant="warning">Chip label</NsChip>
          </div>
        </div>
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Default size — outlined</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsChip variant="primary" outline>Chip label</NsChip>
            <NsChip variant="secondary" outline>Chip label</NsChip>
            <NsChip variant="accent" outline>Chip label</NsChip>
            <NsChip variant="positive" outline>Chip label</NsChip>
            <NsChip variant="negative" outline>Chip label</NsChip>
            <NsChip variant="info" outline>Chip label</NsChip>
            <NsChip variant="warning" outline>Chip label</NsChip>
          </div>
        </div>
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Dense — filled</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsChip variant="primary" dense>Chip label</NsChip>
            <NsChip variant="secondary" dense>Chip label</NsChip>
            <NsChip variant="accent" dense>Chip label</NsChip>
            <NsChip variant="positive" dense>Chip label</NsChip>
            <NsChip variant="negative" dense>Chip label</NsChip>
            <NsChip variant="info" dense>Chip label</NsChip>
            <NsChip variant="warning" dense>Chip label</NsChip>
          </div>
        </div>
        <div>
          <p style="font-family: var(--ns-font-family-text); font-size: 12px; margin: 0 0 8px 0; color: var(--ns-color-text-secondary);">Dense — outlined</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <NsChip variant="primary" outline dense>Chip label</NsChip>
            <NsChip variant="secondary" outline dense>Chip label</NsChip>
            <NsChip variant="accent" outline dense>Chip label</NsChip>
            <NsChip variant="positive" outline dense>Chip label</NsChip>
            <NsChip variant="negative" outline dense>Chip label</NsChip>
            <NsChip variant="info" outline dense>Chip label</NsChip>
            <NsChip variant="warning" outline dense>Chip label</NsChip>
          </div>
        </div>
      </div>
    `,
  }),
}
