import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import { ref } from 'vue'
import NsImageUpload from './NsImageUpload.vue'
import NsFormSection from '../NsFormSection/NsFormSection.vue'
import NsBadge from '../NsBadge/NsBadge.vue'

const meta: Meta<typeof NsImageUpload> = {
  title: 'Components/NsImageUpload',
  component: NsImageUpload,
  tags: ['autodocs'],
  args: { label: 'Shop photo' },
}

export default meta
type Story = StoryObj<typeof meta>

/** #rrggbb → the `rgb(r, g, b)` shape getComputedStyle returns. */
const toRgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

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
    const tile = canvasElement.querySelector('.ns-image-upload__tile') as HTMLElement
    await userEvent.tab()
    await expect(document.activeElement).toBe(input)
    // The tile is rendered in BOTH states now (the card, componentLibrary-af2),
    // so there is one ring target instead of two to keep in sync.
    // `outlineWidth > 0` would be VACUOUS: Chromium reports the UA default
    // width (3px) even with outline-style: none, so it passes with no ring at
    // all. Assert the rule's own value (review, fable).
    await expect(getComputedStyle(tile).outlineStyle).not.toBe('none')
    await expect(getComputedStyle(tile).outlineWidth).toBe('2px')
    // Filled: the image covers the tile and the dashed edge goes solid.
    await expect(getComputedStyle(tile).borderTopStyle).toBe('solid')
    const thumb = canvasElement.querySelector('.ns-image-upload__thumb') as HTMLImageElement
    await expect(Math.round(thumb.getBoundingClientRect().width)).toBe(98)
  },
}

export const WithWarning: Story = {
  render: () => ({
    components: { NsImageUpload },
    setup: () => ({ file: ref<File | null>(null) }),
    template: `<NsImageUpload v-model="file" label="Shop photo" warning="Images larger than 5 MB will be resized." />`,
  }),
}

/**
 * Inside the section that puts it in the Fields slot — the frame's Business
 * Details card (264:26842) ends with exactly this: an NsFormSection whose last
 * field is the logo card. The section supplies no title or badge for it; the
 * card carries its own (componentLibrary-af2).
 */
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
 * THE CARD, MEASURED AGAINST THE FRAME (264:26835 > Business Details >
 * NsImageUpload, instance I165:10767;6259:19825, measured 2026-09-22).
 *
 * Every number here is from the frame, not from taste: the 100x100 tile in
 * radius-MD 12 while the card is radius-sm 8 (they really do differ), the
 * dashed brand border, the 32px plus, 20 padding, 12 between the card's rows
 * and 4 between the two tip lines. happy-dom has no layout, so this is the
 * only place the geometry is checked.
 *
 * THE BADGE'S COLOUR IS NOT THE FRAME'S, and this story does not pretend
 * otherwise — it asserts the badge's PLACEMENT only. The frame draws
 * bg-warning #f9e3ad with text-on-warning, and `color="warning"` reaches
 * Quasar's saturated #f7bc2b instead; that tone is unreachable through
 * NsBadge today (componentLibrary-6dl). The badge is the consumer's content
 * through the slot, so it is their call either way.
 */
export const TheCardAsDrawn: Story = {
  render: () => ({
    components: { NsImageUpload, NsBadge },
    setup: () => ({ file: ref<File | null>(null) }),
    template: `
      <div style="width: 870px">
        <NsImageUpload
          v-model="file"
          label="Business Logo (Optional)"
          :tips="[
            'File types allowed: PNG, JPEG',
            'For best results, make sure the image is at least 512 x 512.',
          ]"
        >
          <template #badge>
            <NsBadge color="warning">{{ file ? 'Logo Added' : 'Logo Not Added' }}</NsBadge>
          </template>
        </NsImageUpload>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.ns-image-upload__surface') as HTMLElement
    const header = canvasElement.querySelector('.ns-image-upload__header') as HTMLElement
    const label = canvasElement.querySelector('.ns-image-upload__label') as HTMLElement
    const badge = canvasElement.querySelector('.ns-image-upload__badge') as HTMLElement
    const tile = canvasElement.querySelector('.ns-image-upload__tile') as HTMLElement
    const tips = canvasElement.querySelectorAll('.ns-image-upload__tip')

    const cardStyle = getComputedStyle(card)
    await expect(cardStyle.borderRadius).toBe('8px')
    await expect(cardStyle.padding).toBe('20px')
    await expect(cardStyle.borderTopWidth).toBe('1px')
    await expect(cardStyle.borderTopStyle).toBe('solid')

    const tileStyle = getComputedStyle(tile)
    await expect(tile.getBoundingClientRect().width).toBe(100)
    await expect(tile.getBoundingClientRect().height).toBe(100)
    await expect(tileStyle.borderRadius).toBe('12px')
    await expect(tileStyle.borderTopStyle).toBe('dashed')

    const plus = canvasElement.querySelector('.ns-image-upload__plus') as SVGElement
    await expect(plus.getBoundingClientRect().width).toBe(32)

    // The three colours the frame names, not just the geometry: without these
    // the story passes with the tile on surface-alt or a border-default dash.
    await expect(cardStyle.backgroundColor).toBe('rgb(253, 253, 249)') // bg-surface-alt
    await expect(tileStyle.backgroundColor).toBe('rgb(255, 255, 255)') // bg-surface
    await expect(tileStyle.borderTopColor).toBe('rgb(213, 99, 7)') // border-primary
    // The tips take --ns-color-text-secondary, which is what the frame names.
    // They render #757575 and the frame draws #535353 — that gap is the TOKEN's
    // (componentLibrary-dyk: our text-secondary is the design's text-TERTIARY),
    // not this component's, so assert the component resolves the token rather
    // than pinning a hex this file cannot fix. When dyk lands, this still
    // passes and the colour moves with it.
    const tokenSecondary = getComputedStyle(document.documentElement)
      .getPropertyValue('--ns-color-text-secondary')
      .trim()
    await expect(tokenSecondary).toBeTruthy()
    await expect(getComputedStyle(tips[0] as HTMLElement).color).toBe(toRgb(tokenSecondary))

    // The badge sits at the card's right edge; the title takes the rest.
    await expect(Math.round(badge.getBoundingClientRect().right)).toBe(
      Math.round(header.getBoundingClientRect().right),
    )
    await expect(label.getBoundingClientRect().left).toBe(header.getBoundingClientRect().left)
    await expect(badge.getBoundingClientRect().left).toBeGreaterThan(
      label.getBoundingClientRect().left,
    )

    // 12 between the card's rows, 4 between the tip lines.
    await expect(tips[1].getBoundingClientRect().top - tips[0].getBoundingClientRect().bottom).toBe(
      4,
    )
    await expect(
      tile.getBoundingClientRect().top - (tips[1] as HTMLElement).getBoundingClientRect().bottom,
    ).toBe(12)
    await expect(getComputedStyle(tips[0] as HTMLElement).fontSize).toBe('14px')
    await expect(getComputedStyle(label).fontSize).toBe('16px')

    // The frame's card is 229 high at 870 wide. Ours lands within 2px (the
    // badge's 21px line vs the label's 20.8, plus 2px of border) — assert the
    // WHOLE, so a future gap or line-height change cannot drift unnoticed
    // while every individual number still passes.
    const height = card.getBoundingClientRect().height
    await expect(Math.abs(height - 229)).toBeLessThanOrEqual(2)
  },
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
    const zone = canvasElement.querySelector('.ns-image-upload__tile') as HTMLElement

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
    await expect(getComputedStyle(zone).outlineWidth).toBe('2px')
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
    await expect(canvasElement.querySelector('.ns-image-upload__tile img')).toBeNull()
    await userEvent.upload(
      canvasElement.querySelector('input[type="file"]') as HTMLInputElement,
      file,
    )
    await expect(canvasElement.querySelector('.ns-image-upload__filename')?.textContent).toContain(
      'same.png',
    )
  },
}
