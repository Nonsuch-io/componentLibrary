import type { Meta, StoryObj } from '@storybook/vue3-vite'
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

export const WithIcon: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton size="xs" icon="send">Send</NsButton>
        <NsButton size="sm" icon="send">Send</NsButton>
        <NsButton size="md" icon="send">Send</NsButton>
        <NsButton size="lg" icon="send">Send</NsButton>
        <NsButton size="xl" icon="send">Send</NsButton>
      </div>
    `,
  }),
}

export const IconOnly: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs" icon="send" icon-only />
        <NsButton size="sm" icon="send" icon-only />
        <NsButton size="md" icon="send" icon-only />
        <NsButton size="lg" icon="send" icon-only />
        <NsButton size="xl" icon="send" icon-only />
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
