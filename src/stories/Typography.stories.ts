import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TypographyScale from './TypographyScale.vue'

const meta: Meta<typeof TypographyScale> = {
  title: 'Typography',
  component: TypographyScale,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
}

export default meta
type Story = StoryObj<typeof TypographyScale>

export const Scale: Story = {}
