import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsFormFooter from './NsFormFooter.vue'
import NsButton from '../NsButton/NsButton.vue'

const meta: Meta<typeof NsFormFooter> = {
  title: 'Components/NsFormFooter',
  component: NsFormFooter,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const twoActions = () => ({
  components: { NsFormFooter, NsButton },
  template: `
    <NsFormFooter>
      <NsButton variant="tertiary" data-testid="back">Back</NsButton>
      <NsButton variant="primary" data-testid="next">Continue</NsButton>
    </NsFormFooter>
  `,
})

/** Desktop: a right-aligned row of auto-width buttons. */
export const Default: Story = { render: twoActions }

/** One action. 15 of the 42 instances measured ship a single button. */
export const SingleAction: Story = {
  render: () => ({
    components: { NsFormFooter, NsButton },
    template: `<NsFormFooter><NsButton variant="primary">Continue</NsButton></NsFormFooter>`,
  }),
}

/**
 * THE REFLOW, MEASURED IN A REAL BROWSER AT DESKTOP WIDTH.
 *
 * This is the whole component, and jsdom cannot see any of it: it has no layout
 * engine and loads no stylesheet, so a unit test reading flexDirection returns
 * the same value whether the media query exists, is misspelled, or was deleted.
 * It passes on the bug. Only Chromium proves the rule is in the cascade.
 *
 * Measured on 65:3657 (1440x68): `form actions` begins at x=1157 of 1440 — a
 * RIGHT-ALIGNED ROW — with buttons at their content width (119.5) and 12px
 * between them (131.5 - 119.5).
 */
export const LayoutIsRealOnDesktop: Story = {
  render: twoActions,
  play: async ({ canvasElement }) => {
    const actions = canvasElement.querySelector('.ns-form-footer__actions') as HTMLElement
    const cs = getComputedStyle(actions)

    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    await expect(cs.flexDirection).toBe('row')
    await expect(cs.justifyContent).toBe('flex-end')
    await expect(cs.gap).toBe('12px')

    // AUTO-WIDTH, not full-bleed. Asserted as "narrower than the container"
    // rather than an exact px, because the width is the button's own content.
    const back = canvasElement.querySelector('[data-testid="back"]') as HTMLElement
    await expect(back.getBoundingClientRect().width).toBeLessThan(
      actions.getBoundingClientRect().width / 2,
    )
  },
}

/**
 * THE SAME COMPONENT AT MOBILE WIDTH — a full-width vertical stack.
 *
 * Measured on 83:8002 (350x110): two NsButton at 350 wide, stacked at y=0 and
 * y=57, so 12px apart. Scaling the desktop row down instead would give two
 * cramped buttons side by side, which is the thing this exists to not do.
 *
 * `viewport.defaultViewport` genuinely changes the media-query viewport under
 * the vitest browser runner — verified before relying on it: innerWidth is 320
 * here against 1200 by default, and `matchMedia('(min-width: 1024px)')` reports
 * false. Without that check this story could have asserted the mobile branch
 * while actually rendering the desktop one.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: twoActions,
  play: async ({ canvasElement }) => {
    const actions = canvasElement.querySelector('.ns-form-footer__actions') as HTMLElement
    const cs = getComputedStyle(actions)

    await expect(window.innerWidth).toBeLessThan(1024)
    await expect(cs.flexDirection).toBe('column')
    await expect(cs.gap).toBe('12px')

    // FULL-BLEED. A stack of content-width buttons reads as a ragged list
    // rather than a set of choices.
    const back = canvasElement.querySelector('[data-testid="back"]') as HTMLElement
    const next = canvasElement.querySelector('[data-testid="next"]') as HTMLElement
    const containerWidth = actions.getBoundingClientRect().width
    await expect(back.getBoundingClientRect().width).toBeCloseTo(containerWidth, 0)
    await expect(next.getBoundingClientRect().width).toBeCloseTo(containerWidth, 0)

    // AND STACKED, not merely narrow — the two must not share a row.
    await expect(next.getBoundingClientRect().top).toBeGreaterThan(
      back.getBoundingClientRect().bottom - 1,
    )
  },
}
