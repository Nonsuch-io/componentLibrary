import type { Meta, StoryObj } from '@storybook/vue3-vite'
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
