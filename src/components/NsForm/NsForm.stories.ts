import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsForm from './NsForm.vue'

const meta: Meta<typeof NsForm> = {
  title: 'Components/NsForm',
  component: NsForm,
  args: {
    greedy: true,
  },
  argTypes: {
    greedy: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsForm>

export const Default: Story = {
  render: (args) => ({
    components: { NsForm },
    setup: () => ({ args }),
    template: `
      <NsForm v-bind="args">
        <p>Form content goes here (NsInput, NsSelect, etc.)</p>
      </NsForm>
    `,
  }),
}
