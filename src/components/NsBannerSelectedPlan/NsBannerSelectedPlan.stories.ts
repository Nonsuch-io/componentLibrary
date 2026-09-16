import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import NsBannerSelectedPlan from './NsBannerSelectedPlan.vue'
import NsPlanSelectionCard from '../NsPlanSelectionCard/NsPlanSelectionCard.vue'

/** The design's instance (2440:278611), word for word. */
const baseWithAddOns = {
  name: 'butiq Base + Add-Ons',
  price: '$133',
  period: '/mo',
  highlights: ['Billed monthly on the 13th', 'Cancel anytime'],
  features: ['butiq Base $99/mo', '500 additional items $5/mo', 'Small Team $29/mo'],
  actionLabel: 'Change Plan',
}

const meta: Meta<typeof NsBannerSelectedPlan> = {
  title: 'Components/NsBannerSelectedPlan',
  component: NsBannerSelectedPlan,
  tags: ['autodocs'],
  args: { ...baseWithAddOns, onChange: fn() },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Default: Story = {}

/** No action — the plan restated where it cannot be changed (a receipt). */
export const DisplayOnly: Story = {
  args: { actionLabel: undefined },
}

/**
 * Placed as the design does: NsOrderSummary (185:10182) is
 * NsPlanSelectionCard titled "Order Summary" with this above the totals.
 * A composition, like NsChooseACombo — the totals are componentLibrary-rbe.2.
 */
export const InsideOrderSummary: Story = {
  render: (args) => ({
    components: { NsBannerSelectedPlan, NsPlanSelectionCard },
    setup: () => ({ args }),
    template: `
      <NsPlanSelectionCard title="Order Summary" style="max-width: 382px">
        <NsBannerSelectedPlan v-bind="args" />
      </NsPlanSelectionCard>
    `,
  }),
}

/**
 * THE CONTRACT: named by the plan, the button described by it, and the
 * click an emit — nothing here decides what changing the plan does.
 */
export const ChangeIsAnEmit: Story = {
  play: async ({ canvasElement, args }) => {
    const article = canvasElement.querySelector('.ns-banner-selected-plan') as HTMLElement
    const heading = article.querySelector('h3') as HTMLElement
    await expect(heading.textContent?.trim()).toBe('butiq Base + Add-Ons')
    await expect(article.getAttribute('aria-labelledby')).toBe(heading.id)
    const button = within(canvasElement).getByRole('button', { name: 'Change Plan' })
    await expect(button.getAttribute('aria-describedby')).toBe(heading.id)
    await userEvent.click(button)
    await expect(args.onChange).toHaveBeenCalledTimes(1)
  },
}

/**
 * GEOMETRY IS REAL — 2440:278611 at 342: 16px inset, 20 between parts, the
 * header row with the 20px name left and the 24px price right, features in
 * the surface's text colour, the md secondary button right-aligned, 36 tall.
 * jsdom loads no stylesheet; only Chromium sees it.
 */
export const LayoutIsReal: Story = {
  render: (args) => ({
    components: { NsBannerSelectedPlan },
    setup: () => ({ args }),
    template: `<div style="width: 342px"><NsBannerSelectedPlan v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    const banner = canvasElement.querySelector('.ns-banner') as HTMLElement
    const rect = banner.getBoundingClientRect()
    await expect(rect.width).toBe(342)
    // MEASURED 251.2 against Figma's 253: Figma lays the 19.6px rows out as
    // 20 (the highlights line and three features, +1.6) and the 28.8 header
    // as 29 (+0.2). Same rows, unrounded — stated, not fudged.
    await expect(rect.height).toBeCloseTo(251.2, 0)

    // The content is the full 310 inside the 16px inset — QBanner's empty
    // avatar column used to take a pixel of it (NsBanner hides it now).
    const content = banner.querySelector('.q-banner__content') as HTMLElement
    await expect(content.getBoundingClientRect().width).toBe(310)

    const header = banner.querySelector('.ns-plan-header') as HTMLElement
    await expect(header.getBoundingClientRect().top - rect.top).toBe(16)
    // ONE row: the design's copy fits at 342 (name 213 + price 90 < 310).
    await expect(header.getBoundingClientRect().height).toBeCloseTo(28.8, 0)
    const name = header.querySelector('.ns-plan-header__name') as HTMLElement
    await expect(getComputedStyle(name).fontSize).toBe('20px')
    await expect(getComputedStyle(name).fontWeight).toBe('600')
    const amount = header.querySelector('.ns-plan-header__amount') as HTMLElement
    await expect(getComputedStyle(amount).fontSize).toBe('24px')
    const period = header.querySelector('.ns-plan-header__period') as HTMLElement
    await expect(getComputedStyle(period).fontSize).toBe('16px')
    // The price is the surface's text colour, not brand (2440:278618).
    await expect(getComputedStyle(amount).color).toBe(getComputedStyle(name).color)
    await expect(
      amount.getBoundingClientRect().left - period.getBoundingClientRect().left,
    ).toBeLessThan(0)
    await expect(period.getBoundingClientRect().left - amount.getBoundingClientRect().right).toBe(8)
    await expect(rect.right - header.getBoundingClientRect().right).toBe(16)

    const highlights = banner.querySelector('.ns-plan-highlights') as HTMLElement
    await expect(
      highlights.getBoundingClientRect().top - header.getBoundingClientRect().bottom,
    ).toBe(20)

    const features = banner.querySelector('.ns-plan-features') as HTMLElement
    await expect(getComputedStyle(features).color).toBe(getComputedStyle(name).color)

    const button = banner.querySelector('.ns-banner-selected-plan__action') as HTMLElement
    const b = button.getBoundingClientRect()
    await expect(b.height).toBe(36)
    await expect(rect.right - b.right).toBe(16)
    await expect(rect.bottom - b.bottom).toBe(16)
    await expect(b.width).toBeLessThan(200)
  },
}
