import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PhArrowRight, PhArrowLeft, PhPaperPlaneTilt, PhX } from '@phosphor-icons/vue'
import NsButton from './NsButton.vue'
import imgButtonArrow from '../../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'

const meta = {
  title: 'Components/NsButton',
  component: NsButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'tertiary-negative',
        'x',
        'accent',
        'positive',
        'negative',
        'warning',
        'marketing',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    iconOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof NsButton>

export default meta
type Story = StoryObj<typeof meta>

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsButton, PhX, PhPaperPlaneTilt },
    template: `
      <table style="border-collapse: collapse; font-family: sans-serif; font-size: 12px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 16px 8px 0; color: #757575; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Variant</th>
            <th style="text-align: center; padding: 8px 16px; color: #757575; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Default</th>
            <th style="text-align: center; padding: 8px 16px; color: #757575; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Hover</th>
            <th style="text-align: center; padding: 8px 16px; color: #757575; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Pressed</th>
            <th style="text-align: center; padding: 8px 16px; color: #757575; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Disabled</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="variant in ['primary','secondary','tertiary','tertiary-negative','accent','positive','negative','warning']" :key="variant">
            <td style="padding: 10px 16px 10px 0; color: #535353; white-space: nowrap;">{{ variant }}</td>
            <td style="text-align: center; padding: 10px 16px;">
              <NsButton :variant="variant">Click me</NsButton>
            </td>
            <td style="text-align: center; padding: 10px 16px;">
              <NsButton :variant="variant" class="ns-btn--hover">Click me</NsButton>
            </td>
            <td style="text-align: center; padding: 10px 16px;">
              <NsButton :variant="variant" class="ns-btn--active">Click me</NsButton>
            </td>
            <td style="text-align: center; padding: 10px 16px;">
              <NsButton :variant="variant" disable>Click me</NsButton>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px 10px 0; color: #535353;">x</td>
            <td style="text-align: center; padding: 10px 16px;"><NsButton variant="x" :icon-only="true"><PhX :size="16" /></NsButton></td>
            <td style="text-align: center; padding: 10px 16px;"><NsButton variant="x" :icon-only="true" class="ns-btn--hover"><PhX :size="16" /></NsButton></td>
            <td style="text-align: center; padding: 10px 16px;"><NsButton variant="x" :icon-only="true" class="ns-btn--active"><PhX :size="16" /></NsButton></td>
            <td style="text-align: center; padding: 10px 16px;"><NsButton variant="x" :icon-only="true" disable><PhX :size="16" /></NsButton></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const Default: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { NsButton },
    setup: () => ({ args }),
    template: '<NsButton v-bind="args">Click Me</NsButton>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton variant="primary">Primary</NsButton>
        <NsButton variant="secondary">Secondary</NsButton>
        <NsButton variant="tertiary">Tertiary</NsButton>
        <NsButton variant="tertiary-negative">Tertiary Negative</NsButton>
        <NsButton variant="accent">Accent</NsButton>
        <NsButton variant="positive">Positive</NsButton>
        <NsButton variant="negative">Negative</NsButton>
        <NsButton variant="warning">Warning</NsButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs">Extra Small</NsButton>
        <NsButton size="sm">Small</NsButton>
        <NsButton size="md">Medium</NsButton>
        <NsButton size="lg">Large</NsButton>
        <NsButton size="xl">Extra Large</NsButton>
      </div>
    `,
  }),
}

export const WithIconLeft: Story = {
  render: () => ({
    components: { NsButton, PhArrowLeft },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton size="xs"><PhArrowLeft :size="12" />Send</NsButton>
        <NsButton size="sm"><PhArrowLeft :size="16" />Send</NsButton>
        <NsButton size="md"><PhArrowLeft :size="20" />Send</NsButton>
        <NsButton size="lg"><PhArrowLeft :size="20" />Send</NsButton>
        <NsButton size="xl"><PhArrowLeft :size="28" />Send</NsButton>
      </div>
    `,
  }),
}

export const WithIconRight: Story = {
  render: () => ({
    components: { NsButton, PhArrowRight },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton size="xs">Send<PhArrowRight :size="12" /></NsButton>
        <NsButton size="sm">Send<PhArrowRight :size="16" /></NsButton>
        <NsButton size="md">Send<PhArrowRight :size="20" /></NsButton>
        <NsButton size="lg">Send<PhArrowRight :size="20" /></NsButton>
        <NsButton size="xl">Send<PhArrowRight :size="28" /></NsButton>
      </div>
    `,
  }),
}

export const IconOnly: Story = {
  render: () => ({
    components: { NsButton, PhPaperPlaneTilt },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs" :icon-only="true"><PhPaperPlaneTilt :size="12" /></NsButton>
        <NsButton size="sm" :icon-only="true"><PhPaperPlaneTilt :size="16" /></NsButton>
        <NsButton size="md" :icon-only="true"><PhPaperPlaneTilt :size="20" /></NsButton>
        <NsButton size="lg" :icon-only="true"><PhPaperPlaneTilt :size="24" /></NsButton>
        <NsButton size="xl" :icon-only="true"><PhPaperPlaneTilt :size="32" /></NsButton>
      </div>
    `,
  }),
}

export const XDismiss: Story = {
  name: 'X (Dismiss)',
  render: () => ({
    components: { NsButton, PhX },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton variant="x" size="xs" :icon-only="true"><PhX :size="12" /></NsButton>
        <NsButton variant="x" size="sm" :icon-only="true"><PhX :size="16" /></NsButton>
        <NsButton variant="x" size="md" :icon-only="true"><PhX :size="20" /></NsButton>
        <NsButton variant="x" size="lg" :icon-only="true"><PhX :size="24" /></NsButton>
        <NsButton variant="x" size="xl" :icon-only="true"><PhX :size="32" /></NsButton>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton variant="primary" disable>Primary</NsButton>
        <NsButton variant="secondary" disable>Secondary</NsButton>
        <NsButton variant="tertiary" disable>Tertiary</NsButton>
        <NsButton variant="tertiary-negative" disable>Tertiary Negative</NsButton>
        <NsButton variant="accent" disable>Accent</NsButton>
        <NsButton variant="positive" disable>Positive</NsButton>
        <NsButton variant="negative" disable>Negative</NsButton>
        <NsButton variant="warning" disable>Warning</NsButton>
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs" loading>Extra Small</NsButton>
        <NsButton size="sm" loading>Small</NsButton>
        <NsButton size="md" loading>Medium</NsButton>
        <NsButton size="lg" loading>Large</NsButton>
        <NsButton size="xl" loading>Extra Large</NsButton>
      </div>
    `,
  }),
}

export const MarketingCTA: Story = {
  render: () => ({
    components: { NsButton },
    setup: () => ({ imgButtonArrow, imgDoodleCheck }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 32px; background: #fdf4e7;">
        <NsButton variant="marketing">
          I want to know more
          <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
        </NsButton>
        <NsButton variant="marketing-pushed">
          You're on the list
          <img :src="imgDoodleCheck" style="width: 43px; height: 25px;" alt="" />
        </NsButton>
        <NsButton variant="marketing" disable>
          I want to know more
          <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
        </NsButton>
      </div>
    `,
  }),
}
