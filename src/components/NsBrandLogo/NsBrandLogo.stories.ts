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
 * This assertion is meaningless in the unit suite: jsdom has no layout engine and
 * loads no stylesheet, so `getComputedStyle(...).minWidth` there returns the same
 * value whether the rule exists, is misspelled, or was deleted. It passes on the bug.
 *
 * ASSERTS min-width/min-height EXACTLY, not the rendered box within a band. The
 * rendered box is checked too, because a property that APPLIES is not a size that
 * RENDERS — the lesson NsInput's height story paid for twice. Both are needed:
 * min-* alone would stay green if some other rule collapsed the anchor, and the
 * bounding box alone would stay green for a 120px stacked mark whose image is
 * already larger than 44px, which is precisely the case that must not vouch for
 * the 72x27 wordmark.
 */
export const TouchTarget: Story = {
  args: {
    src: placeholderWordmarkSrc,
    alt: placeholderLogoAlt,
    width: 72,
    ratio: 160 / 60,
    href: '/',
  },
  play: async ({ canvasElement }) => {
    const link = canvasElement.querySelector<HTMLElement>('a.ns-brand-logo--link')
    await expect(link).not.toBeNull()

    const style = getComputedStyle(link!)
    await expect(style.minWidth).toBe('44px')
    await expect(style.minHeight).toBe('44px')

    // The wordmark itself is 72x27 — deliberately shorter than the minimum, so a
    // box that merely wrapped the image would fail this.
    const box = link!.getBoundingClientRect()
    await expect(box.width).toBeGreaterThanOrEqual(44)
    await expect(box.height).toBeGreaterThanOrEqual(44)
  },
}
