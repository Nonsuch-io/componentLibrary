import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBreadcrumbs from './NsBreadcrumbs.vue'

const meta: Meta<typeof NsBreadcrumbs> = {
  title: 'Components/NsBreadcrumbs',
  component: NsBreadcrumbs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsBreadcrumbs },
    setup: () => ({ args }),
    template: '<NsBreadcrumbs v-bind="args">Default content</NsBreadcrumbs>',
  }),
}
