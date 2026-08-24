import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsBrandLogo from './NsBrandLogo.vue'
import NsSiteHeader from '../NsSiteHeader/NsSiteHeader.vue'
import NsButton from '../NsButton/NsButton.vue'
import {
  placeholderLogoSrc,
  placeholderWordmarkSrc,
  placeholderLogoAlt,
} from '../../stories/placeholderMarketingContent'

/**
 * The library ships no brand asset — every story passes the product-agnostic
 * placeholder. `ratio` is the placeholder's own aspect: 160÷60 for the wordmark,
 * 1 for the square mark.
 */
const meta = {
  title: 'Components/NsBrandLogo',
  component: NsBrandLogo,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    width: { control: 'text' },
    height: { control: 'text' },
    ratio: { control: 'number' },
    href: { control: 'text' },
  },
} satisfies Meta<typeof NsBrandLogo>

export default meta
type Story = StoryObj<typeof meta>

/** The wide lockup, at the size a site header uses. */
export const Wordmark: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    width: 72,
    ratio: 160 / 60,
  },
}

/** The stacked lockup, at the size a page body uses. */
export const Mark: Story = {
  args: {
    src: placeholderLogoSrc,
    alt: placeholderLogoAlt,
    width: 120,
    ratio: 1,
  },
}

/** With `href`, the logo becomes the usual "click the logo to go home" link. */
export const Linked: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    width: 72,
    ratio: 160 / 60,
    href: '/',
  },
}

/**
 * Sized by `height` instead of `ratio` — the other way to give QImg a real box.
 * Useful when a header row is a fixed height and the width should follow.
 */
export const SizedByHeight: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    height: 27,
  },
}

/**
 * The header slot this component exists to fill. NsSiteHeader's `logo` slot took
 * a raw `<img>` before this component existed.
 */
export const InSiteHeader: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    width: 72,
    ratio: 160 / 60,
    href: '/',
  },
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { NsBrandLogo, NsSiteHeader, NsButton },
    setup: () => ({ args }),
    template: `
      <NsSiteHeader>
        <template #logo>
          <NsBrandLogo v-bind="args" />
        </template>
        <template #actions>
          <NsButton variant="tertiary" label="Sign In" />
        </template>
      </NsSiteHeader>
    `,
  }),
}

/**
 * THE TOUCH TARGET, MEASURED IN A REAL BROWSER.
 *
 * Meaningless in the unit suite: jsdom has no layout engine and loads no stylesheet,
 * so `getComputedStyle` there returns the same value whether the rule exists, is
 * misspelled, or was deleted. It passes on the bug.
 *
 * PROBES WHAT A FINGER HITS, not what a property says. The first version asserted
 * `min-height` on the anchor itself, and review showed that fix was wrong in a way
 * the assertion could never see: sizing the anchor to 44px overflowed NsSiteHeader's
 * 34px content box. The target is now an absolutely-positioned overlay that does not
 * participate in layout, so there is no box property on the anchor left to assert —
 * and `elementFromPoint` is the better test anyway, because it fails for ANY reason
 * the target is unreachable, not just the one the author thought of.
 *
 * Both are checked: the overlay's declared minimums, and the points themselves. The
 * declared value alone would stay green if something covered the overlay; the hit
 * test alone would stay green for a mark already larger than 44px.
 */
export const TouchTarget: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    width: 72,
    ratio: 160 / 60,
    href: '/',
  },
  // The overlay reaches ~8.5px above the 27px wordmark. Flush against the viewport
  // that point is off-screen and elementFromPoint returns null, so the padding is
  // load-bearing for the assertion, not decoration.
  decorators: [() => ({ template: '<div style="padding: 40px"><story /></div>' })],
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLElement>('a.ns-brand-logo--link')
    await expect(link).not.toBeNull()

    const overlay = getComputedStyle(link!, '::after')
    await expect(overlay.minWidth).toBe('44px')
    await expect(overlay.minHeight).toBe('44px')

    // The wordmark is 72x27 — deliberately SHORTER than the minimum, so these two
    // probes sit outside the anchor's own box and only land if the overlay works.
    const box = link!.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    const reach = 21 // just inside 44/2

    for (const y of [cy - reach, cy + reach]) {
      // Guard the probe itself: an off-viewport point returns null from
      // elementFromPoint, which would fail this test for the wrong reason. The
      // decorator's padding is what keeps both probes on screen — measured, after
      // the upward probe landed at y=-7.5 with the logo flush to the viewport.
      await expect(y).toBeGreaterThan(0)
      const hit = document.elementFromPoint(cx, y)
      await expect(link!.contains(hit)).toBe(true)
    }
  },
}

/**
 * THE TOUCH TARGET MUST NOT EAT THE HEADER'S PADDING.
 *
 * Review measured the first touch-target fix doing exactly that: a 44px anchor plus
 * the logo slot's own 8px came to 52px inside a header whose content box is 34px
 * (66px tall, 16px vertical padding), so the logo overflowed 9px into the padding on
 * each side and would have been clipped by any sticky header that hides overflow.
 *
 * The isolated TouchTarget story could not see it — it renders unconstrained, which
 * is correct for what it measures and precisely why this second story exists.
 */
export const InSiteHeaderFits: Story = {
  ...InSiteHeader,
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector<HTMLElement>('.ns-site-header')
    const link = canvasElement.querySelector<HTMLElement>('a.ns-brand-logo--link')
    await expect(header).not.toBeNull()
    await expect(link).not.toBeNull()

    const headerBox = header!.getBoundingClientRect()
    const style = getComputedStyle(header!)
    const padTop = parseFloat(style.paddingTop)
    const padBottom = parseFloat(style.paddingBottom)

    const linkBox = link!.getBoundingClientRect()

    // The logo must sit inside the header's CONTENT box, not merely inside the
    // header — overflowing into the declared padding is the regression.
    await expect(linkBox.top).toBeGreaterThanOrEqual(headerBox.top + padTop - 0.5)
    await expect(linkBox.bottom).toBeLessThanOrEqual(headerBox.bottom - padBottom + 0.5)
  },
}
