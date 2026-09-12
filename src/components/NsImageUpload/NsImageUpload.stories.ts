import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import { ref } from 'vue'
import NsImageUpload from './NsImageUpload.vue'
import NsFormSection from '../NsFormSection/NsFormSection.vue'

const meta: Meta<typeof NsImageUpload> = {
  title: 'Components/NsImageUpload',
  component: NsImageUpload,
  tags: ['autodocs'],
  args: { label: 'Shop photo' },
}

export default meta
type Story = StoryObj<typeof meta>

const controlled = (initial: File | null = null) => ({
  components: { NsImageUpload },
  setup: () => ({ file: ref<File | null>(initial) }),
  template: `<NsImageUpload v-model="file" label="Shop photo" />`,
})

export const Empty: Story = { render: () => controlled() }

/**
 * THE FOCUS RING IN THE SELECTED STATE — the blocker a reviewer measured.
 *
 * The input's next sibling is the drop zone before a file is chosen and the
 * PREVIEW after. The first version rang only the drop zone, so with a file
 * selected, Tab landed on a 1px clipped input and nothing on screen changed:
 * WCAG 2.4.7, in exactly the state the component's own doc calls the replace
 * path. axe cannot see this; only a real browser can.
 */
export const WithSelection: Story = {
  render: () => controlled(new File(['x'], 'storefront.png', { type: 'image/png' })),
  play: async ({ canvasElement }) => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
    const preview = canvasElement.querySelector('.ns-image-upload__preview') as HTMLElement
    await userEvent.tab()
    await expect(document.activeElement).toBe(input)
    await expect(getComputedStyle(preview).outlineStyle).not.toBe('none')
    await expect(parseFloat(getComputedStyle(preview).outlineWidth)).toBeGreaterThan(0)
  },
}

export const WithWarning: Story = {
  render: () => ({
    components: { NsImageUpload },
    setup: () => ({ file: ref<File | null>(null) }),
    template: `<NsImageUpload v-model="file" label="Shop photo" warning="Images larger than 5 MB will be resized." />`,
  }),
}

/** Inside the section that puts it in the Fields slot — ShopPhoto, 194:15745. */
export const InAFormSection: Story = {
  render: () => ({
    components: { NsImageUpload, NsFormSection },
    setup: () => ({ file: ref<File | null>(null) }),
    template: `
      <NsFormSection>
        <NsImageUpload v-model="file" label="Shop photo" />
      </NsFormSection>
    `,
  }),
}

/**
 * THE KEYBOARD PATH, PROVED IN A REAL BROWSER.
 *
 * jsdom cannot see this: the input is hidden by a scoped stylesheet, and a
 * unit test reading `style.display` sees only inline styles. Replacing the
 * clip pattern with `display: none` left all 32 unit tests green — measured.
 * Only Chromium knows whether Tab actually reaches the control.
 */
export const KeyboardReachesTheInput: Story = {
  render: () => controlled(),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
    const zone = canvasElement.querySelector('.ns-image-upload__dropzone') as HTMLElement

    // Visually hidden, present in the tree: it has a box and is not display:none.
    await expect(getComputedStyle(input).display).not.toBe('none')

    // Start from nowhere, whatever a previous story left focused.
    ;(document.activeElement as HTMLElement | null)?.blur()
    // Tab from the body lands on the input — the thing display:none breaks.
    await userEvent.tab()
    await expect(document.activeElement).toBe(input)

    // And the RING draws on the zone the user can see, not on the 1px input.
    // Keyboard focus is what makes :focus-visible match; a mouse click would not.
    await expect(getComputedStyle(zone).outlineStyle).not.toBe('none')
    await expect(parseFloat(getComputedStyle(zone).outlineWidth)).toBeGreaterThan(0)
  },
}

/**
 * PICKING THE SAME FILE TWICE STILL FIRES. A file input does not emit `change`
 * when the chosen file equals its current value, so a user who removes an
 * image and re-adds the same one would get nothing. The handler resets the
 * input after every change. jsdom cannot test this — it never populates a
 * file input's value — so `userEvent.upload` does it here.
 */
export const SameFileTwice: Story = {
  render: () => controlled(),
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['x'], 'same.png', { type: 'image/png' })

    await userEvent.upload(input, file)
    // Preview is up, and the INPUT is already empty again.
    await expect(canvasElement.querySelector('.ns-image-upload__filename')?.textContent).toContain(
      'same.png',
    )
    await expect(input.files?.length ?? 0).toBe(0)

    // Remove, then re-add the identical file: must land again.
    await userEvent.click(canvasElement.querySelector('.ns-image-upload__remove') as HTMLElement)
    await expect(canvasElement.querySelector('.ns-image-upload__dropzone')).not.toBeNull()
    await userEvent.upload(
      canvasElement.querySelector('input[type="file"]') as HTMLInputElement,
      file,
    )
    await expect(canvasElement.querySelector('.ns-image-upload__filename')?.textContent).toContain(
      'same.png',
    )
  },
}
