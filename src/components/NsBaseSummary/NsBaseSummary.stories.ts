import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { PhCurrencyCircleDollar, PhPackage } from '@phosphor-icons/vue'
import NsBaseSummary from './NsBaseSummary.vue'

/** The design's instance (166:6346), word for word. */
const butiqBase = {
  title: 'All plans start with the butiq Base.',
  subtitle: 'What’s included in butiq’s Base?',
  areas: [
    {
      id: 'pos',
      title: 'Core POS & Check Out Tools',
      icon: PhCurrencyCircleDollar,
      features: [
        {
          id: 'dash',
          text: 'Shop management dashboard',
          tooltip: 'Sales, stock and staff in one place.',
        },
        { id: 'tap', text: 'Tap payments', tooltip: 'Take contactless payments on your phone.' },
        { id: 'customers', text: 'Customer profile storage' },
        { id: 'discounts', text: 'Discounts' },
      ],
    },
    {
      id: 'inventory',
      title: 'Inventory Management',
      icon: PhPackage,
      columns: 2 as const,
      features: [
        {
          id: 'upload',
          text: 'butiq Smart Image Upload',
          tooltip: 'Photograph an item; butiq fills in the rest.',
        },
        { id: 'items', text: '250 inventory items with unlimited stock count' },
        { id: 'audit', text: 'Stock counting & auditing' },
        { id: 'alerts', text: 'Low & out of stock alerts' },
        {
          id: 'vendors',
          text: 'Vendor profile storage',
          tooltip: 'Keep every supplier’s details on file.',
        },
        { id: 'restock', text: 'Easy inventory restock' },
        { id: 'receiving', text: 'Order receiving' },
      ],
    },
  ],
  alert:
    'Calling market sellers! This Base is all you need to sell and process payments at your next market.',
}

const meta: Meta<typeof NsBaseSummary> = {
  title: 'Components/NsBaseSummary',
  component: NsBaseSummary,
  tags: ['autodocs'],
  args: butiqBase,
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Default: Story = {}

/** Title and areas only — no subtitle, no callout. */
export const NoCallout: Story = {
  args: { subtitle: undefined, alert: undefined },
}

/**
 * THE OUTLINE A SCREEN READER GETS: a section named by the h2, each area a
 * section named by its h3, each feature list a real list with its count,
 * each tip a button named for its feature that shows its text on focus and
 * hides it on Escape without moving focus.
 */
export const OutlineAndTips: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvasElement.querySelector('.ns-base-summary') as HTMLElement
    const h2 = root.querySelector('h2') as HTMLElement
    await expect(root.getAttribute('aria-labelledby')).toBe(h2.id)
    const areas = root.querySelectorAll('.ns-feature-card')
    await expect(areas.length).toBe(2)
    for (const area of areas) {
      const h3 = area.querySelector('h3') as HTMLElement
      await expect(area.getAttribute('aria-labelledby')).toBe(h3.id)
    }
    await expect(areas[1].querySelectorAll('li').length).toBe(7)

    const tip = canvas.getByRole('button', { name: 'More about Tap payments' })
    tip.focus()
    await waitFor(() => expect(document.querySelector('.ns-tooltip')).not.toBeNull())
    await expect(document.querySelector('.ns-tooltip')!.textContent?.trim()).toBe(
      'Take contactless payments on your phone.',
    )
    await expect(tip.getAttribute('aria-describedby')).toBe(
      document.querySelector('.ns-tooltip')!.id,
    )
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(document.querySelector('.ns-tooltip')).toBeNull())
    await expect(document.activeElement).toBe(tip)
  },
}

/**
 * DESKTOP GEOMETRY IS REAL — 166:6346 at 910: 20px inset, 12 between parts,
 * the POS card a third of the row beside the two-column inventory card
 * (283 / 567 against the design's 280 / 570), the inventory list flowing
 * down then across, the callout 56 tall with its 24px icon. jsdom loads no
 * stylesheet; only Chromium sees it.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: (args) => ({
    components: { NsBaseSummary },
    setup: () => ({ args }),
    template: `<div style="width: 910px"><NsBaseSummary v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const root = canvasElement.querySelector('.ns-base-summary') as HTMLElement
    const rect = root.getBoundingClientRect()
    await expect(rect.width).toBe(910)

    const title = root.querySelector('.ns-base-summary__title') as HTMLElement
    await expect(title.getBoundingClientRect().top - rect.top).toBe(20)
    await expect(getComputedStyle(title).fontSize).toBe('20px')
    await expect(getComputedStyle(title).fontWeight).toBe('400')
    const subtitle = root.querySelector('.ns-base-summary__subtitle') as HTMLElement
    await expect(subtitle.getBoundingClientRect().top - title.getBoundingClientRect().bottom).toBe(
      12,
    )

    const [pos, inventory] = [...root.querySelectorAll('.ns-feature-card')].map((el) =>
      el.getBoundingClientRect(),
    )
    await expect(pos.left - rect.left).toBe(20)
    await expect(inventory.left - pos.right).toBe(20)
    await expect(rect.right - inventory.right).toBe(20)
    // The share is the column count: 1 : 2 of the 850 inside.
    await expect(pos.width).toBeCloseTo(283.33, 0)
    await expect(inventory.width).toBeCloseTo(566.67, 0)
    await expect(pos.height).toBe(inventory.height)
    // The design's 180 is a fixed frame; the content would be a header, 12,
    // and four 19.6 rows 8 apart inside 20 — 175.2 — except that the
    // browser's Fixel Text 600 sets "Core POS & Check Out Tools" 212 wide
    // where the design's frame fits it in 208, so at the design's own width
    // the title wraps by under a pixel and the card is 196. Stated, not
    // fudged; a narrower renderer gets 175.2.
    const posTitle = root.querySelector('.ns-feature-card__title') as HTMLElement
    await expect(getComputedStyle(posTitle).fontFamily).toMatch(/^"Fixel Text"/)
    await expect(pos.height).toBeCloseTo(175.2 + posTitle.getBoundingClientRect().height - 20.8, 0)
    // The inventory card on its own is 178.4 (24px icon header, 3 | 4 balanced
    // list at 102.4) — the design's 180 — and stretches to the POS card.

    // Inventory balances 3 | 4 as the design does: the wrapped second item
    // makes the first column 94 and the second 102.
    const items = [...root.querySelectorAll('.ns-feature-card--2 li')].map((li) =>
      li.getBoundingClientRect(),
    )
    await expect(items[0].left).toBe(items[2].left)
    await expect(items[3].left).toBeGreaterThan(items[0].right)
    await expect(items[3].top).toBe(items[0].top)
    await expect(items[6].left).toBe(items[3].left)
    await expect(items[1].height).toBeCloseTo(39.2, 0)
    await expect(items[1].top - items[0].bottom).toBe(8)

    // A feature's text starts 21 in from the list edge (the design's marker indent).
    const list = root.querySelector('.ns-feature-card__features') as HTMLElement
    const text = root.querySelector('.ns-feature-card__text') as HTMLElement
    await expect(text.getBoundingClientRect().left - list.getBoundingClientRect().left).toBe(21)

    const alert = root.querySelector('.ns-base-summary__alert') as HTMLElement
    await expect(alert.getBoundingClientRect().height).toBe(56)
    await expect(alert.getBoundingClientRect().top - pos.bottom).toBe(12)
    await expect(rect.bottom - alert.getBoundingClientRect().bottom).toBe(20)
    await expect(getComputedStyle(alert).borderTopColor).toBe(
      getComputedStyle(root.querySelector('.ns-feature-card')!).borderTopColor,
    )
  },
}

/**
 * MOBILE — INFERRED, the flow's mobile frame was not readable: the areas
 * stack and the inventory list is one column.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => ({
    components: { NsBaseSummary },
    setup: () => ({ args }),
    template: `<div style="width: 350px"><NsBaseSummary v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const [pos, inventory] = [...canvasElement.querySelectorAll('.ns-feature-card')].map((el) =>
      el.getBoundingClientRect(),
    )
    await expect(inventory.top - pos.bottom).toBe(20)
    await expect(pos.width).toBe(inventory.width)
    const items = [...canvasElement.querySelectorAll('.ns-feature-card--2 li')].map((li) =>
      li.getBoundingClientRect(),
    )
    await expect(items[4].left).toBe(items[0].left)
    await expect(items[4].top).toBeGreaterThan(items[3].top)
  },
}
