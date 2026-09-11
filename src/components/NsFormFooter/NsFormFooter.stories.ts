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
 * between them (131.5 - 119.5). The 32px between the last button and the frame
 * edge is the PAGE's gutter (the footer is a full-bleed bar there), so it is
 * not asserted here; see FullBleedPlacement for how a page reproduces it.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: twoActions,
  play: async ({ canvasElement }) => {
    const actions = canvasElement.querySelector('.ns-form-footer__actions') as HTMLElement
    const footer = canvasElement.querySelector('.ns-form-footer') as HTMLElement

    // The viewport guard is LOAD-BEARING, not belt-and-braces: the storybook
    // vitest addon silently ignores an unknown viewport name and falls back to
    // 1200x900, so without this a renamed viewport would leave the mobile story
    // asserting the mobile branch while rendering this one.
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    await expect(getComputedStyle(actions).flexDirection).toBe('row')

    // ASSERT RENDERED POSITION, NOT THE DECLARED RULE. An earlier version
    // checked `justifyContent === 'flex-end'` and compared the button to the
    // ACTIONS width — which passes for a shrink-wrapped container sitting at
    // the LEFT edge, and for `margin-right: auto` on the first child pushing
    // the two apart. Three such mutants passed 4/4 in review. Anchoring to the
    // footer's own box is what makes right-packing falsifiable.
    const rect = footer.getBoundingClientRect()
    const back = canvasElement.querySelector('[data-testid="back"]').getBoundingClientRect()
    const next = canvasElement.querySelector('[data-testid="next"]').getBoundingClientRect()

    // The trailing action ends AT the footer's right edge — the footer owns no
    // horizontal inset. The design's 32px viewport gutter is the page's to add
    // when it places this full-bleed; inline after form sections, this is what
    // makes the buttons align with the cards above them.
    await expect(next.right).toBeCloseTo(rect.right, 0)
    // Both actions live in the right half — this is what "right-aligned" means.
    await expect(back.left).toBeGreaterThan(rect.left + rect.width / 2)
    // 12px between them, measured rather than read off the `gap` declaration.
    await expect(next.left - back.right).toBeCloseTo(12, 0)
    // And they share a row.
    await expect(next.top).toBeCloseTo(back.top, 0)

    // PADDING, PINNED. Deleting every padding rule left all four stories green
    // in review — nothing asserted it. 16px above and below the actions;
    // 68 = 16 + 36 + 16 on 65:3657.
    const actionsRect = actions.getBoundingClientRect()
    await expect(actionsRect.top - rect.top).toBeCloseTo(16, 0)
    await expect(rect.bottom - actionsRect.bottom).toBeCloseTo(16, 0)
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

    // FULL-BLEED, MEASURED AGAINST THE CANVAS. Comparing the button to the
    // ACTIONS width proves nothing on its own — a shrink-wrapped container
    // makes content-width buttons equal to it, and that mutant passed 4/4 in
    // review. The canvas is the fixed reference the viewport actually sets.
    const canvas = canvasElement.clientWidth
    const back = canvasElement.querySelector('[data-testid="back"]').getBoundingClientRect()
    const next = canvasElement.querySelector('[data-testid="next"]').getBoundingClientRect()
    await expect(actions.getBoundingClientRect().width).toBeCloseTo(canvas, 0)
    await expect(back.width).toBeCloseTo(canvas, 0)
    await expect(next.width).toBeCloseTo(canvas, 0)

    // 12px apart, measured from the rendered boxes rather than the declaration.
    await expect(next.top - back.bottom).toBeCloseTo(12, 0)

    // AND STACKED, not merely narrow. On a shared row `next.top === back.top`,
    // which is a full button-height below `back.bottom`, so this fails hard —
    // the -1 only absorbs subpixel rounding.
    await expect(next.top).toBeGreaterThan(back.bottom - 1)

    // PADDING, PINNED: nothing above, 8px below. The Actions child sits at y=0
    // in both mobile frames, so the 53 - 45 difference is entirely underneath.
    // An earlier version read it as per-side and rendered 8px too tall.
    const footerRect = (
      canvasElement.querySelector('.ns-form-footer') as HTMLElement
    ).getBoundingClientRect()
    const actionsRect = actions.getBoundingClientRect()
    await expect(actionsRect.top - footerRect.top).toBeCloseTo(0, 0)
    await expect(footerRect.bottom - actionsRect.bottom).toBeCloseTo(8, 0)
  },
}

/**
 * HOW THE DESIGN ACTUALLY PLACES IT: a full-bleed bar at the foot of the page,
 * actions 32px from the viewport edge. The footer does not carry that inset —
 * placement is the page's, so that the same component aligns with form
 * sections when it flows inline after them. This story is the full-bleed case,
 * with the page supplying the gutter.
 */
export const FullBleedPlacement: Story = {
  render: () => ({
    components: { NsFormFooter, NsButton },
    template: `
      <div style="border-top: 1px solid var(--ns-color-border-default)">
        <NsFormFooter style="padding-inline: var(--ns-space-8)">
          <NsButton variant="tertiary" data-testid="back">Back</NsButton>
          <NsButton variant="primary" data-testid="next">Continue</NsButton>
        </NsFormFooter>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // With the page's gutter applied, the trailing action ends 32px in from
    // the footer's edge — reproducing the design measurement exactly.
    const footer = canvasElement.querySelector('.ns-form-footer') as HTMLElement
    const next = canvasElement.querySelector('[data-testid="next"]') as HTMLElement
    await expect(next.getBoundingClientRect().right).toBeCloseTo(
      footer.getBoundingClientRect().right - 32,
      0,
    )
  },
}
