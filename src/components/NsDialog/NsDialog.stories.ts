import { ref } from 'vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsDialog from './NsDialog.vue'
import NsButton from '../NsButton/NsButton.vue'

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

/**
 * The design system's named widths — 400 / 650 / 820. Storybook is the only
 * place the difference is actually visible, since happy-dom computes no layout.
 */
export const Sizes: Story = {
  render: () => ({
    components: { NsDialog, NsButton },
    setup() {
      const open = ref<'small' | 'default' | 'large' | null>(null)
      return { open }
    },
    template: `
      <div style="display:flex; gap:12px">
        <NsButton label="Small" @click="open = 'small'" />
        <NsButton label="Default" @click="open = 'default'" />
        <NsButton label="Large" @click="open = 'large'" />
      </div>
      <NsDialog
        :model-value="open !== null"
        :size="open ?? 'default'"
        :title="(open ?? '') + ' dialog'"
        @update:model-value="open = null"
      >
        This dialog is the "{{ open }}" size from the design system's scale.
      </NsDialog>
    `,
  }),
}
