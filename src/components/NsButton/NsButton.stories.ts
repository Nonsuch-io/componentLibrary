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
 * The min-height half of this investigation moved to MinHeightIsReal below,
 * so a failure here names the gap and a failure there names the height.
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

/**
 * THE min-height MECHANISM, after deleting the rule that pretended to own it
 * (componentLibrary-cqy).
 *
 * NsButton used to carry `:deep(.q-btn__wrapper) { min-height: unset }`. Quasar
 * has never rendered that class — 0 files in quasar 2.28.0's src and dist,
 * against 13 for `.q-btn__content` in the same two directories as a control
 * that the search works. (An earlier version of this comment said 39; that
 * number came from a glob spanning three cached Quasar versions in the pnpm
 * store, not from 2.28.0. Corrected in review — a number in a permanent comment
 * has to reproduce as written.)
 *
 * The reset is real, it is just not ours: QBtn's use-btn.js sets an INLINE
 * `min-width: 0; min-height: 0` whenever the `padding` prop is DEFINED — the
 * gate is `props.padding !== void 0`, not truthiness — and NsButton always
 * passes `:padding="buttonPadding"`. Inline beats any class selector, dead or
 * not, which is exactly why the deleted rule looked like it worked.
 *
 * THREE ASSERTIONS, EACH OWNING A DIFFERENT FAILURE:
 *   1. `.q-btn__wrapper` matches nothing — fails if a future Quasar starts
 *      rendering that class, which is the day the deleted rule would have
 *      mattered. It does NOT guard against someone reinstating the rule: a
 *      non-matching scoped selector cannot change the DOM either way.
 *   2. the inline declaration is PRESENT — fails if NsButton stops passing
 *      `padding`, or Quasar stops setting it.
 *   3. the computed value WINS. Added in review, and it is the one that turns
 *      this from a description into a guarantee: presence is not victory.
 *      Every other min-height Quasar sets on a button (.q-btn 2.572em, --round
 *      3em, --dense 2em, --dense.--round 2.4em, --fab 56px, --fab-mini 40px) is
 *      a non-`!important` class rule on the root, so inline wins TODAY. A
 *      future Quasar or a consumer sheet adding `!important` would leave the
 *      inline value present-but-dead — syntactically there, semantically gone,
 *      the exact shape componentLibrary-cqy existed to remove — with assertion
 *      2 still green.
 */
export const MinHeightIsReal: Story = {
  args: { variant: 'primary' },
  render: (args) => ({
    components: { NsButton },
    setup: () => ({ args }),
    template: `<NsButton v-bind="args" size="md" data-testid="md">Send</NsButton>`,
  }),
  play: async ({ canvasElement }) => {
    const md = canvasElement.querySelector('[data-testid="md"]') as HTMLElement

    await expect(md.querySelector('.q-btn__wrapper')).toBeNull()
    await expect(md.style.minHeight).toBe('0px')
    await expect(getComputedStyle(md).minHeight).toBe('0px')
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
