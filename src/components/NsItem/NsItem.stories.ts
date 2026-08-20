import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsItem from './NsItem.vue'
import NsList from '../NsList/NsList.vue'

const meta: Meta<typeof NsItem> = {
  title: 'Components/NsItem',
  component: NsItem,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsItem, NsList },
    setup: () => ({ args }),
    // WRAPPED IN NsList, because NsItem now declares role="listitem" and a
    // listitem outside a list is invalid (aria-required-parent). It was already
    // showing invalid markup — the role just made it visible.
    template: '<NsList><NsItem v-bind="args">Default content</NsItem></NsList>',
  }),
}
