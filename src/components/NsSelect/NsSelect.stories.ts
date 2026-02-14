import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSelect from './NsSelect.vue'

const meta: Meta<typeof NsSelect> = {
  title: 'Components/NsSelect',
  component: NsSelect,
  args: {
    label: 'Province',
    options: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
    outlined: true,
    dense: false,
  },
  argTypes: {
    label: { control: 'text' },
    outlined: { control: 'boolean' },
    dense: { control: 'boolean' },
    multiple: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsSelect>

export const Default: Story = {}

export const Dense: Story = {
  args: {
    dense: true,
    label: 'Compact select',
  },
}

export const Multiple: Story = {
  args: {
    label: 'Select multiple',
    multiple: true,
  },
}

export const ObjectOptions: Story = {
  args: {
    label: 'Status',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ],
    emitValue: true,
    mapOptions: true,
  },
}
