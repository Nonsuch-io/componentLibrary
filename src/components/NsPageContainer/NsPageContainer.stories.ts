import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPageContainer from './NsPageContainer.vue'

const meta: Meta<typeof NsPageContainer> = {
  title: 'Components/NsPageContainer',
  component: NsPageContainer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsPageContainer },
    setup: () => ({ args }),
    template: '<NsPageContainer v-bind="args">Default content</NsPageContainer>',
  }),
}
