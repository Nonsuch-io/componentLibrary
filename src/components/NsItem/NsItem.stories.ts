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
    // WRAPPED IN NsList, because QItem renders role="listitem" for a plain item and a
    // listitem outside a list is invalid (aria-required-parent). The story was
    // always showing invalid markup; measuring it is what surfaced it.
    template: '<NsList><NsItem v-bind="args">Default content</NsItem></NsList>',
  }),
}
