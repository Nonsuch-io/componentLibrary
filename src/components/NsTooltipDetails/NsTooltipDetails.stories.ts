import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { PhInfo } from '@phosphor-icons/vue'
import NsTooltipDetails from './NsTooltipDetails.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsInput from '../NsInput/NsInput.vue'

const meta: Meta<typeof NsTooltipDetails> = {
  title: 'Components/NsTooltipDetails',
  component: NsTooltipDetails,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

/**
 * A REAL Escape. `userEvent.keyboard('{Escape}')` sends `key`/`code` and no
 * `keyCode`, and Quasar's escape handler (escape-key.js) checks
 * `evt.keyCode === 27` on keydown then keyup — so the synthetic key never
 * reaches the popup. Both halves, with the code, on the focused element.
 */
async function pressEscape() {
  const target = document.activeElement ?? document.body
  for (const type of ['keydown', 'keyup'] as const) {
    target.dispatchEvent(
      new KeyboardEvent(type, { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }),
    )
    await new Promise((r) => setTimeout(r, 0))
  }
}

/**
 * The design's placement (185:10879): a "What is this?" trigger beside a
 * field label — the design's own `NsTooltip` frame, an icon and 12px text,
 * which is a tertiary xs NsButton here — opening the panel under it. The
 * trigger and the anchoring are the consumer's; the panel is the library's.
 */
const postalCode = () => ({
  components: { NsTooltipDetails, NsButton, NsInput, PhInfo },
  setup: () => ({ open: ref(false), postal: ref('') }),
  template: `
    <div style="max-width: 425px; display: flex; flex-direction: column; gap: 4px">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <label for="postal" class="ns-body-md">Postal Code</label>
        <NsButton variant="tertiary" size="xs" data-testid="trigger">
          <PhInfo :size="16" weight="regular" aria-hidden="true" />
          What is this?
          <NsTooltipDetails v-model="open" data-testid="details">
            Enter the postal code for the address associated with this card or bank account.
          </NsTooltipDetails>
        </NsButton>
      </div>
      <NsInput id="postal" v-model="postal" outlined placeholder="A1A 1A1" />
    </div>
  `,
})

export const BesideAField: Story = { render: postalCode }

/**
 * NO v-model: NsMenu opens it from its anchor and the X still closes it —
 * review found the first draft's X inert here (a bare emit that reached
 * nobody), while Escape kept working. The popup is a named non-modal dialog.
 */
export const Uncontrolled: Story = {
  render: () => ({
    components: { NsTooltipDetails, NsButton, PhInfo },
    template: `
      <NsButton variant="tertiary" size="xs" data-testid="trigger">
        <PhInfo :size="16" weight="regular" aria-hidden="true" />
        What is this?
        <NsTooltipDetails>Enter the postal code for the card or bank account.</NsTooltipDetails>
      </NsButton>
    `,
  }),
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
    const panel = () => document.querySelector('.ns-tooltip-details__panel') as HTMLElement | null
    await userEvent.click(trigger)
    await waitFor(() => expect(panel()).not.toBeNull())
    const popup = panel()!.closest('.q-menu') as HTMLElement
    await expect(popup.getAttribute('role')).toBe('dialog')
    await expect(popup.getAttribute('aria-label')).toBe('Details')
    await userEvent.click(panel()!.querySelector('.ns-tooltip-details__close') as HTMLElement)
    await waitFor(() => expect(panel(), 'the X closes it with no v-model').toBeNull())
    await expect(trigger.getAttribute('aria-expanded')).toBe('false')
  },
}

/**
 * THE ROUND TRIP, in a real browser: the trigger opens it, focus lands in
 * the panel, Escape closes it and focus RETURNS to the trigger; the X does
 * the same. The bead named the return path as the thing a dismissible
 * panel usually loses — this is the assertion.
 */
export const OpensClosesAndReturnsFocus: Story = {
  render: postalCode,
  play: async ({ canvasElement }) => {
    await fontsReady()
    const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
    const panel = () => document.querySelector('.ns-tooltip-details__panel') as HTMLElement | null
    await expect(panel()).toBeNull()

    trigger.focus()
    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(panel()).not.toBeNull())
    await waitFor(() => expect(trigger.getAttribute('aria-expanded')).toBe('true'))
    // Focus is inside the popup (QMenu focuses it on open).
    await waitFor(() =>
      expect(panel()!.closest('.q-menu')!.contains(document.activeElement)).toBe(true),
    )

    await pressEscape()
    await waitFor(() => expect(panel()).toBeNull())
    await waitFor(() => expect(document.activeElement, 'focus after Escape').toBe(trigger))
    await expect(trigger.getAttribute('aria-expanded')).toBe('false')

    // …and the X button, for a pointer user.
    await userEvent.click(trigger)
    await waitFor(() => expect(panel()).not.toBeNull())
    const close = panel()!.querySelector('.ns-tooltip-details__close') as HTMLElement
    await expect(close.getAttribute('aria-label')).toBe('Close')
    await userEvent.click(close)
    await waitFor(() => expect(panel()).toBeNull())
    // Back INSIDE the trigger: a pointer press on a QBtn parks focus on its
    // own `.q-focus-helper` (Quasar's no-ring-after-click behaviour, every
    // QBtn in the library), and QMenu gives focus back to exactly the element
    // that had it. The keyboard path above lands on the button itself.
    await waitFor(() =>
      expect(trigger.contains(document.activeElement), 'focus after the X').toBe(true),
    )
  },
}

/**
 * ENDS OPEN ON PURPOSE. The a11y addon runs axe AFTER play, on document.body:
 * every other story here closes the panel before it ends, so the dialog's
 * role and name were only ever scanned by a race (LayoutIsReal's un-awaited
 * Escape leaving the popup mid-transition — fable's review). This one leaves
 * the dialog in the DOM for the scan and pins the ANCHOR's aria-haspopup,
 * the one consumer-visible change the role makes outside the popup.
 */
export const OpenDialogIsNamed: Story = {
  render: postalCode,
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement
    await expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    await userEvent.click(trigger)
    const panel = await waitFor(() => {
      const el = document.querySelector('.ns-tooltip-details__panel') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    const popup = panel.closest('.q-menu') as HTMLElement
    await expect(popup.getAttribute('role')).toBe('dialog')
    await expect(popup.getAttribute('aria-label')).toBe('Details')
    await expect(popup.getAttribute('aria-describedby')).toBe(
      panel.querySelector('.ns-tooltip-details__text')!.id,
    )
    await expect(trigger.getAttribute('aria-expanded')).toBe('true')
  },
}

/**
 * GEOMETRY IS REAL — 185:11426: 12px padding, 10 between text and X, a
 * 32px X, radius 8, the panel content-sized up to 450.
 */
export const LayoutIsReal: Story = {
  render: postalCode,
  play: async ({ canvasElement }) => {
    await fontsReady()
    await userEvent.click(canvasElement.querySelector('[data-testid="trigger"]') as HTMLElement)
    const panel = await waitFor(() => {
      const el = document.querySelector('.ns-tooltip-details__panel') as HTMLElement
      expect(el).not.toBeNull()
      return el
    })
    const rect = panel.getBoundingClientRect()
    const text = panel.querySelector('.ns-tooltip-details__text')!.getBoundingClientRect()
    const close = panel.querySelector('.ns-tooltip-details__close')!.getBoundingClientRect()
    await expect(text.left - rect.left).toBe(12)
    await expect(text.top - rect.top).toBe(12)
    await expect(close.left - text.right).toBe(10)
    await expect(rect.right - close.right).toBe(12)
    await expect(close.width).toBe(32)
    await expect(close.height).toBe(32)
    const menu = panel.closest('.q-menu') as HTMLElement
    // The text unwrapped is wider than 450 and QMenu's own cap is 95vw: the
    // width here is the prop's doing.
    await expect(menu.style.maxWidth).toBe('450px')
    await expect(rect.width).toBeLessThanOrEqual(450)
    await expect(getComputedStyle(menu).borderRadius).toBe('8px')
    await expect(getComputedStyle(menu).boxShadow).not.toBe('none')
    await pressEscape()
    await waitFor(() => expect(document.querySelector('.ns-tooltip-details__panel')).toBeNull())
  },
}
