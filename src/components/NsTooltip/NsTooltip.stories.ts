import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTooltip from './NsTooltip.vue'

const meta: Meta<typeof NsTooltip> = {
  title: 'Components/NsTooltip',
  component: NsTooltip,
  args: {
    delay: 300,
  },
  argTypes: {
    delay: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof NsTooltip>

export const Default: Story = {
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Hover me
        <NsTooltip v-bind="args">This is helpful information</NsTooltip>
      </button>
    `,
  }),
}

export const ShortDelay: Story = {
  args: { delay: 100 },
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Quick tooltip
        <NsTooltip v-bind="args">Shows quickly!</NsTooltip>
      </button>
    `,
  }),
}

// componentLibrary-sj1: keyboard and screen-reader access. Tab to the button
// to show the tooltip on focus (not just hover), and press Escape to dismiss
// it without losing focus.
export const KeyboardAccessible: Story = {
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Tab to me, then press Escape
        <NsTooltip v-bind="args">Shown on focus as well as hover</NsTooltip>
      </button>
    `,
  }),
}
