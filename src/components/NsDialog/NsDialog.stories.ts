import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsDialog from './NsDialog.vue'

const meta: Meta<typeof NsDialog> = {
  title: 'Components/NsDialog',
  component: NsDialog,
  args: {
    modelValue: true,
    title: 'Confirm action',
    persistent: false,
    noBackdropDismiss: false,
  },
  argTypes: {
    title: { control: 'text' },
    persistent: { control: 'boolean' },
    noBackdropDismiss: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsDialog>

export const Default: Story = {
  render: (args) => ({
    components: { NsDialog },
    setup: () => ({ args }),
    template: `
      <NsDialog v-bind="args">
        <p>Are you sure you want to proceed?</p>
        <template #actions>
          <button>Cancel</button>
          <button>Confirm</button>
        </template>
      </NsDialog>
    `,
  }),
}

export const Persistent: Story = {
  args: {
    persistent: true,
    title: 'Unsaved changes',
  },
  render: (args) => ({
    components: { NsDialog },
    setup: () => ({ args }),
    template: `
      <NsDialog v-bind="args">
        <p>You have unsaved changes. Discard them?</p>
        <template #actions>
          <button>Keep editing</button>
          <button>Discard</button>
        </template>
      </NsDialog>
    `,
  }),
}
