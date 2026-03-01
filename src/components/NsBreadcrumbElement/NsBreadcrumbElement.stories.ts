import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBreadcrumbElement from './NsBreadcrumbElement.vue'

const meta: Meta<typeof NsBreadcrumbElement> = {
  title: 'Components/NsBreadcrumbElement',
  component: NsBreadcrumbElement,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsBreadcrumbElement },
    setup: () => ({ args }),
    template: '<NsBreadcrumbElement v-bind="args">Default content</NsBreadcrumbElement>',
  }),
}
