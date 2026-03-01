import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsImage from './NsImage.vue'

const meta: Meta<typeof NsImage> = {
  title: 'Components/NsImage',
  component: NsImage,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsImage },
    setup: () => ({ args }),
    template: '<NsImage v-bind="args">Default content</NsImage>',
  }),
}
