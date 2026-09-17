import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
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

/**
 * ENDS OPEN ON PURPOSE. The a11y addon runs axe after play, and QSelect's
 * listbox had no accessible name (aria-input-field-name — every NsSelect on
 * every page, componentLibrary-2e7). NsSelect names it from `label` on
 * popup-show; this story leaves the menu open so the gate sees it.
 */
export const OpenListboxIsNamed: Story = {
  args: { label: 'Shop Category', options: ['Clothing', 'Food', 'Services'] },
  play: async ({ canvasElement }) => {
    const combobox = canvasElement.querySelector('[role="combobox"]') as HTMLElement
    await userEvent.click(combobox)
    const listbox = await waitFor(() => {
      const el = document.querySelector('[role="listbox"]') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    await expect(combobox.getAttribute('aria-controls')).toBe(listbox.id)
    await expect(listbox.getAttribute('aria-label')).toBe('Shop Category')
  },
}
