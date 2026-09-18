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

/**
 * DIALOG MODE, ENDS OPEN — Quasar's default on a phone or tablet, and
 * `behavior="dialog"` anywhere: the combobox moves into a teleported dialog
 * and nothing under the root has the role. The listbox is named there too
 * (componentLibrary-2e7's first draft was not, and no desktop-mode test
 * could see it).
 */
export const OpenDialogListboxIsNamed: Story = {
  args: { label: 'Shop Category', options: ['Clothing', 'Food', 'Services'], behavior: 'dialog' },
  play: async ({ canvasElement }) => {
    await userEvent.click(canvasElement.querySelector('.q-field__control') as HTMLElement)
    const listbox = await waitFor(() => {
      const el = document.querySelector('.q-select__dialog [role="listbox"]') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    const combobox = document.querySelector('.q-select__dialog [role="combobox"]') as HTMLElement
    await expect(combobox.getAttribute('aria-controls')).toBe(listbox.id)
    await expect(listbox.getAttribute('aria-label')).toBe('Shop Category')
    await expect(listbox.closest('[role="dialog"]')!.getAttribute('aria-label')).toBe(
      'Shop Category',
    )
  },
}

/**
 * LABEL ABOVE (componentLibrary-grj.3) — NsInput's contract mirrored, so the
 * sign-up form's three selects sit beside its label-above inputs. The name
 * comes from the LABEL by for/id (Quasar is given none, so no floating
 * label and no padding for one); the popup listbox takes the same name.
 * Ends with the menu OPEN so the a11y addon scans the named listbox.
 */
export const LabelAbove: Story = {
  args: {
    label: 'Province / Territory',
    labelPlacement: 'above',
    options: ['Alberta', 'British Columbia', 'Saskatchewan'],
  },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('label.ns-select__label') as HTMLElement
    const combobox = canvasElement.querySelector('[role="combobox"]') as HTMLInputElement
    await expect(combobox.labels?.[0]).toBe(label)
    await expect(label.getAttribute('for')).toBe(combobox.id)
    await expect(combobox.id).not.toBe('')
    await expect(canvasElement.querySelector('.q-field__label')).toBeNull()
    await expect(getComputedStyle(label).fontSize).toBe('14px')
    // 6px between the label and the box, the design's gap.
    const control = canvasElement.querySelector('.q-field__control') as HTMLElement
    await expect(control.getBoundingClientRect().top - label.getBoundingClientRect().bottom).toBe(6)

    await userEvent.click(control)
    const listbox = await waitFor(() => {
      const el = document.querySelector('[role="listbox"]') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    await expect(listbox.getAttribute('aria-label')).toBe('Province / Territory')
  },
}
