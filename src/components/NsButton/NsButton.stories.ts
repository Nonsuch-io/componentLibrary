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
 * ASSERTS `gap` EXACTLY. Verified against installed Quasar 2.28.0 source
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
 * NsButton used to carry `:deep(.q-btn__wrapper) { min-height: unset }`.
 *
 * QUASAR 1 DID RENDER THAT CLASS — `QBtn.js` emitted
 * `staticClass: 'q-btn__wrapper col row q-anchor--skip'` as a span wrapping
 * `.q-btn__content`. So this rule was almost certainly a Quasar 1 override
 * carried across the 2.x migration and never re-checked, which is a more
 * useful thing to know than "dead". An earlier version of this comment said
 * Quasar had NEVER rendered it; that was wrong, and it was wrong in a comment
 * whose whole purpose is to reproduce as written. Corrected in review.
 *
 * QUASAR 2 DOES NOT: 0 files contain `q-btn__wrapper` in 2.28.0's src and
 * dist, against 13 for `.q-btn__content` in the same two directories as a
 * control that the search works. (An earlier version said 39 — that came from
 * a glob spanning three cached Quasar versions in the pnpm store, not from
 * 2.28.0.) Also checked in butiq's installed 2.18.6, the low end of our
 * `^2.17.0` peer range: same 0, and the same `minHeight` gate below.
 *
 * The reset is real, it is just not ours: QBtn's use-btn.js sets an INLINE
 * `min-width: 0; min-height: 0` whenever the `padding` prop is DEFINED — the
 * gate is `props.padding !== void 0`, not truthiness — and NsButton always
 * passes `:padding="buttonPadding"`. Inline beats any class selector, dead or
 * not, which is exactly why the deleted rule looked like it worked.
 *
 * THE ASSERTIONS, AND HOW THEY DEPEND ON EACH OTHER:
 *
 *   1. `.q-btn__wrapper` matches nothing. Fails if a Quasar upgrade starts
 *      rendering that class AGAIN — which is the day the deleted rule would
 *      have mattered. It does NOT guard against someone reinstating the rule:
 *      a non-matching scoped selector cannot change the DOM either way.
 *
 *   2. the inline declaration is PRESENT. Fails if NsButton stops passing
 *      `padding`, or Quasar stops setting it.
 *
 *   3. the computed value WINS — but ONLY MEANINGFUL GIVEN 2, and an earlier
 *      version of this comment had that backwards. `0px` is also what NO
 *      min-height computes to: `auto` resolves to `0px` on a non-flex-item, so
 *      a bare unstyled button reads `0px` too. Measured in review — with the
 *      padding prop removed and a `min-height: auto` rule added, assertion 3
 *      ALONE passes. It is not the strong one. Do not delete 2 as redundant.
 *
 *   The control below fixes that dependency in place: clearing the inline
 *   value must CHANGE the computed one, which proves a real competitor exists
 *   to be beaten rather than assuming one does.
 *
 * WHAT THIS CANNOT SEE: a consumer's own stylesheet. None is loaded here, so
 * these assertions cover Quasar's CSS and this library's SCSS only. Every
 * button min-height Quasar 2.28.0 ships (.q-btn 2.572em, --round 3em, --dense
 * 2em, --dense.--round 2.4em, --fab 56px, --fab-mini 40px) is a
 * non-`!important` class rule on the root, which is why inline wins today.
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

    // THE CONTROL. Without it, assertion 3 above passes against a button with
    // no min-height at all. Clearing the inline value must change the computed
    // one — that is what proves Quasar's own rule is really there and really
    // being beaten, rather than that nothing is setting anything.
    md.style.minHeight = ''
    await expect(getComputedStyle(md).minHeight).not.toBe('0px')
    md.style.minHeight = '0px'
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
