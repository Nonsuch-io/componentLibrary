import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent } from 'storybook/test'
import NsCombo from './NsCombo.vue'
import NsCard from '../NsCard/NsCard.vue'

/** The design's instance (I170:7391 / 178:9614), word for word. */
const brickAndMortar = {
  bestFor: 'Best For: Sellers with one physical location',
  name: 'Independent Brick & Mortar',
  price: '$133',
  period: '/mo',
  highlights: ['butiq Basic', 'Inventory Management', 'NFC Payments', 'Multiple Team Members'],
  features: [
    'Take tap payments from your phone',
    'Up to 5 team members',
    '750 unique inventory items',
  ],
  actionLabel: 'Continue With This Plan',
}

const meta: Meta<typeof NsCombo> = {
  title: 'Components/NsCombo',
  component: NsCombo,
  tags: ['autodocs'],
  args: { ...brickAndMortar, onSelect: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Default: Story = {}

/** No price row, no button — a combo shown for comparison only. */
export const DisplayOnly: Story = {
  args: { price: undefined, period: undefined, actionLabel: undefined },
}

/** Placed as the design does (NsChooseACombo 170:7387): under a heading, in a surface card. */
export const InsideChooseACombo: Story = {
  render: (args) => ({
    components: { NsCombo, NsCard },
    setup: () => ({ args }),
    template: `
      <NsCard flat style="max-width: 910px">
        <h2 class="ns-heading-md-regular" style="margin: 0 0 12px">Option 2: Choose a Combo</h2>
        <NsCombo v-bind="args" />
      </NsCard>
    `,
  }),
}

/**
 * DESKTOP GEOMETRY IS REAL — I170:7391 at 870: the card is 275 tall with
 * three features, the header row 37, the button md and right-aligned at
 * the card's inner edge. jsdom loads no stylesheet; only Chromium sees it.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: (args) => ({
    components: { NsCombo },
    setup: () => ({ args }),
    template: `<div style="width: 870px"><NsCombo v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const card = canvasElement.querySelector('.ns-combo') as HTMLElement
    const rect = card.getBoundingClientRect()
    await expect(rect.width).toBe(870)
    // MEASURED 273.17 against Figma's 275: Figma lays each 19.6px text row
    // out as 20 (the highlights line and three feature rows, +1.6) and the
    // header's 36.8 as 37 (+0.2). The design's number is integer arithmetic
    // on rounded rows; this is the same rows unrounded. Stated, not fudged.
    await expect(rect.height).toBeCloseTo(273.17, 0)

    const header = card.querySelector('.ns-plan-header') as HTMLElement
    await expect(header.getBoundingClientRect().height).toBeCloseTo(36.8, 0) // one row: the 32px price
    const name = header.querySelector('.ns-plan-header__name')!.getBoundingClientRect()
    const price = header.querySelector('.ns-plan-header__price')!.getBoundingClientRect()
    await expect(price.left).toBeGreaterThan(name.right)
    await expect(price.right - rect.right).toBe(-20)

    const overline = card.querySelector('.ns-combo__best-for') as HTMLElement
    await expect(getComputedStyle(overline).fontSize).toBe('12px')
    await expect(getComputedStyle(overline).lineHeight).toBe('18px')
    await expect(getComputedStyle(overline).textTransform).toBe('uppercase')
    await expect(overline.getBoundingClientRect().top - rect.top).toBe(20)

    const button = card.querySelector('.ns-combo__action') as HTMLElement
    await expect(button.getBoundingClientRect().height).toBe(36)
    await expect(button.getBoundingClientRect().right - rect.right).toBe(-20)
    await expect(button.getBoundingClientRect().width).toBeLessThan(300)

    // The pipes are CSS on the item AFTER, so there are three for four items.
    const items = card.querySelectorAll('.ns-plan-highlights__item')
    await expect(items.length).toBe(4)
    await expect(getComputedStyle(items[0], '::before').content).toBe('none')
    await expect(getComputedStyle(items[1], '::before').content).toBe('"|"')
  },
}

/**
 * MOBILE GEOMETRY IS REAL — 178:9614 at 350: 382 tall, the name wrapping
 * above the price, the highlights on two lines, and the button lg and
 * full width (I178:9614;6263:7165, 310x45).
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => ({
    components: { NsCombo },
    setup: () => ({ args }),
    template: `<div style="width: 350px"><NsCombo v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const card = canvasElement.querySelector('.ns-combo') as HTMLElement
    const rect = card.getBoundingClientRect()
    await expect(rect.width).toBe(350)
    // MEASURED 379.36 against Figma's 382: the same per-row rounding as the
    // desktop story, over more wrapped rows (the name on two lines, the
    // highlights on two, the three features).
    await expect(rect.height).toBeCloseTo(379.36, 0)

    const name = card.querySelector('.ns-plan-header__name')!.getBoundingClientRect()
    const price = card.querySelector('.ns-plan-header__price')!.getBoundingClientRect()
    await expect(price.top).toBeGreaterThanOrEqual(name.bottom) // dropped beneath

    const button = card.querySelector('.ns-combo__action') as HTMLElement
    await expect(button.getBoundingClientRect().height).toBe(45)
    await expect(button.getBoundingClientRect().width).toBe(310)
  },
}

/** Selecting is an emit; the button is described by the plan's name. */
export const SelectEmits: Story = {
  play: async ({ canvasElement, args }) => {
    const button = canvasElement.querySelector('.ns-combo__action') as HTMLElement
    const heading = canvasElement.querySelector('.ns-plan-header__name') as HTMLElement
    await expect(button.getAttribute('aria-describedby')).toBe(heading.id)
    await expect(canvasElement.querySelector('article')!.getAttribute('aria-labelledby')).toBe(
      heading.id,
    )
    await userEvent.click(button)
    await expect(args.onSelect).toHaveBeenCalledTimes(1)
  },
}
