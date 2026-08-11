import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCheckbox from './NsCheckbox.vue'

const meta: Meta<typeof NsCheckbox> = {
  title: 'Components/NsCheckbox',
  component: NsCheckbox,
  args: {
    label: 'I agree to the terms',
    modelValue: false,
    dense: false,
    disable: false,
  },
  argTypes: {
    label: { control: 'text' },
    modelValue: { control: 'boolean' },
    dense: { control: 'boolean' },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsCheckbox>

export const Default: Story = {}

export const Checked: Story = {
  args: { modelValue: true },
}

export const Dense: Story = {
  args: { dense: true, label: 'Compact checkbox' },
}

export const Disabled: Story = {
  args: { disable: true, label: 'Cannot change' },
}

/**
 * Figma's `Checked = partial`. The state a "select all" needs when only some of
 * its children are selected.
 *
 * THE POINT IS `aria-checked="mixed"`, not the dash icon. A screen reader
 * announcing "checked" or "unchecked" over a partial selection states something
 * false, and unlike a wrong icon there is no visual cue to contradict it.
 *
 * `indeterminate` is a separate prop rather than a third `modelValue` — the
 * partial state belongs to the parent ("some of my children are selected"),
 * and widening the model would widen the emit and break every typed `v-model`.
 * Clicking a partial checkbox emits `true`: partial, then click, means select all.
 */
export const Indeterminate: Story = {
  args: {
    label: 'Select all',
    indeterminate: true,
  },
}
