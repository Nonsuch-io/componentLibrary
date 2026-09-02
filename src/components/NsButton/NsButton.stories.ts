import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsButton from './NsButton.vue'
import imgButtonArrow from '../../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'

const meta = {
  title: 'Components/NsButton',
  component: NsButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'accent',
        'positive',
        'negative',
        'warning',
        'marketing',
      ],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    iconOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof NsButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { NsButton },
    setup: () => ({ args }),
    template: '<NsButton v-bind="args">Click Me</NsButton>',
  }),
}

export const Variants: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton variant="primary">Primary</NsButton>
        <NsButton variant="secondary">Secondary</NsButton>
        <NsButton variant="tertiary">Tertiary</NsButton>
        <NsButton variant="accent">Accent</NsButton>
        <NsButton variant="positive">Positive</NsButton>
        <NsButton variant="negative">Negative</NsButton>
        <NsButton variant="warning">Warning</NsButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs">Extra Small</NsButton>
        <NsButton size="sm">Small</NsButton>
        <NsButton size="md">Medium</NsButton>
        <NsButton size="lg">Large</NsButton>
        <NsButton size="xl">Extra Large</NsButton>
      </div>
    `,
  }),
}

export const WithIcon: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton size="xs" icon="send">Send</NsButton>
        <NsButton size="sm" icon="send">Send</NsButton>
        <NsButton size="md" icon="send">Send</NsButton>
        <NsButton size="lg" icon="send">Send</NsButton>
        <NsButton size="xl" icon="send">Send</NsButton>
      </div>
    `,
  }),
}

/**
 * EVERY ONE OF THESE CARRIES aria-label, and that is the demonstration.
 *
 * This story previously rendered five icon-only buttons with no accessible name.
 * axe reported button-name on all five, and it was the last name-level violation
 * blocking componentLibrary-057. A docs page showing a control used wrongly is
 * worse than no page: it is the version people copy.
 *
 * The label names the ACTION, not the icon — "Send message", not "send".
 */
export const IconOnly: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs" icon="send" icon-only aria-label="Send message" />
        <NsButton size="sm" icon="send" icon-only aria-label="Send message" />
        <NsButton size="md" icon="send" icon-only aria-label="Send message" />
        <NsButton size="lg" icon="send" icon-only aria-label="Send message" />
        <NsButton size="xl" icon="send" icon-only aria-label="Send message" />
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <NsButton variant="primary" disable>Primary</NsButton>
        <NsButton variant="secondary" disable>Secondary</NsButton>
        <NsButton variant="tertiary" disable>Tertiary</NsButton>
        <NsButton variant="accent" disable>Accent</NsButton>
        <NsButton variant="positive" disable>Positive</NsButton>
        <NsButton variant="negative" disable>Negative</NsButton>
        <NsButton variant="warning" disable>Warning</NsButton>
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    components: { NsButton },
    template: `
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <NsButton size="xs" loading>Extra Small</NsButton>
        <NsButton size="sm" loading>Small</NsButton>
        <NsButton size="md" loading>Medium</NsButton>
        <NsButton size="lg" loading>Large</NsButton>
        <NsButton size="xl" loading>Extra Large</NsButton>
      </div>
    `,
  }),
}

/**
 * THE ICON-TO-LABEL GAP, MEASURED IN A REAL BROWSER.
 *
 * happy-dom has no layout engine and loads no stylesheet, so a unit test
 * reading getComputedStyle().gap would return the same value whether the
 * `:deep(.q-btn__content) { gap: ... }` rule exists, is misspelled, or was
 * deleted — it passes on the bug. Only Chromium, via the storybook project,
 * proves the rule is actually in the cascade.
 *
 * ASSERTS `gap` EXACTLY. Verified against installed Quasar 2.25.0 source
 * (node_modules/quasar/src/components/btn/QBtn.sass and the compiled
 * dist/quasar.css): Quasar sets NO `gap` anywhere on `.q-btn__content`, at
 * any size/dense/round/fab variant. A fallback cannot produce "4px", "8px",
 * or "12px" — Chromium's initial value for `gap` is "normal", which computes
 * to "0px" for a row flex container. So an exact match here is not merely
 * distinguishing our value from Quasar's; it is presence vs. absence,
 * exactly the HeightsAreReal principle (componentLibrary-7lp).
 *
 * NOTE ON `.q-btn__wrapper`: this story does NOT assert the
 * `:deep(.q-btn__wrapper) { min-height: unset }` rule in NsButton.vue.
 * Measured directly in Chromium (and confirmed by reading QBtn.js's render
 * function, in both the installed 2.25.0 and the 2.18.6 used elsewhere in
 * the monorepo): Quasar's QBtn NEVER renders an element with the class
 * `q-btn__wrapper`, in any version checked — only `.q-btn__content`. The
 * selector cannot ever match, so this rule is dead CSS, not merely
 * currently-inert. The button's actual min-height reset comes from
 * elsewhere: NsButton always passes Quasar's own `padding` prop
 * (`:padding="buttonPadding"`), and QBtn's use-btn.js sets an INLINE style
 * `min-width: 0; min-height: 0` whenever `padding` is provided — with
 * higher specificity than any class selector, dead or not. Confirmed by
 * reading the rendered button's `style` attribute in Chromium:
 * `padding: 8px 16px; min-width: 0px; min-height: 0px;`. There is no
 * property left for this rule to falsifiably own, so no assertion for it is
 * included here — writing one would be exactly the kind of check that
 * cannot fail this bead exists to stop shipping. See componentLibrary-7lp
 * for the full investigation. Deleting the dead selector is filed separately
 * as componentLibrary-cqy; it is a behaviour-adjacent change and out of
 * scope for a test-only bead.
 */
export const LayoutIsReal: Story = {
  args: { variant: 'primary' },
  render: (args) => ({
    components: { NsButton },
    setup: () => ({ args }),
    template: `
      <div>
        <NsButton v-bind="args" size="md" icon="send" data-testid="md">Send</NsButton>
        <NsButton v-bind="args" size="lg" icon="send" data-testid="lg">Send</NsButton>
        <NsButton v-bind="args" size="xl" icon="send" data-testid="xl">Send</NsButton>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const gapOf = (testId: string) => {
      const btn = canvasElement.querySelector(`[data-testid="${testId}"]`) as HTMLElement
      const content = btn.querySelector('.q-btn__content') as HTMLElement
      return getComputedStyle(content).gap
    }

    // Base rule (.ns-btn) — also governs xs/sm, which share the 4px base.
    await expect(gapOf('md')).toBe('4px')
    // .ns-btn--lg override.
    await expect(gapOf('lg')).toBe('8px')
    // .ns-btn--xl override.
    await expect(gapOf('xl')).toBe('12px')
  },
}

export const MarketingCTA: Story = {
  render: () => ({
    components: { NsButton },
    setup: () => ({ imgButtonArrow, imgDoodleCheck }),
    template: `
      <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; padding: 32px; background: #fdf4e7;">
        <NsButton variant="marketing">
          I want to know more
          <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
        </NsButton>
        <NsButton variant="marketing-pushed">
          You're on the list
          <img :src="imgDoodleCheck" style="width: 43px; height: 25px;" alt="" />
        </NsButton>
        <NsButton variant="marketing" disable>
          I want to know more
          <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
        </NsButton>
      </div>
    `,
  }),
}
