import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBreadcrumbs from './NsBreadcrumbs.vue'
import NsBreadcrumbElement from '../NsBreadcrumbElement/NsBreadcrumbElement.vue'

const meta: Meta<typeof NsBreadcrumbs> = {
  title: 'Components/NsBreadcrumbs',
  component: NsBreadcrumbs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * The stories deliberately render REAL crumbs rather than bare slot text.
 *
 * The previous default story passed the string "Default content", which under
 * the current component becomes an `<ol>` holding one non-crumb `<li>`: no
 * crumbs, no separators, no `aria-current`. Storybook runs in real Chromium and
 * is the ONLY place in this repo where the `::before` separator CSS is
 * observable at all — happy-dom does not compute generated content — so a story
 * that renders no separators is the one thing that must not happen here.
 */
export const Default: Story = {
  render: (args) => ({
    components: { NsBreadcrumbs, NsBreadcrumbElement },
    setup: () => ({ args }),
    template: `
      <NsBreadcrumbs v-bind="args">
        <NsBreadcrumbElement label="Home" to="/" />
        <NsBreadcrumbElement label="Products" to="/products" />
        <NsBreadcrumbElement label="Espresso Machine" />
      </NsBreadcrumbs>
    `,
  }),
}

/** `v-for` is how dynamic trails are actually written — and it regressed once. */
export const FromAList: Story = {
  render: (args) => ({
    components: { NsBreadcrumbs, NsBreadcrumbElement },
    setup: () => ({
      args,
      trail: [
        { label: 'Home', to: '/' },
        { label: 'Catalogue', to: '/catalogue' },
        { label: 'Grinders', to: '/catalogue/grinders' },
        { label: 'Hand Grinder' },
      ],
    }),
    template: `
      <NsBreadcrumbs v-bind="args">
        <NsBreadcrumbElement
          v-for="crumb in trail"
          :key="crumb.label"
          :label="crumb.label"
          :to="crumb.to"
        />
      </NsBreadcrumbs>
    `,
  }),
}

/** The landmark's accessible name is overridable for non-English or nested trails. */
export const CustomAriaLabel: Story = {
  args: { ariaLabel: 'Product category' },
  render: (args) => ({
    components: { NsBreadcrumbs, NsBreadcrumbElement },
    setup: () => ({ args }),
    template: `
      <NsBreadcrumbs v-bind="args">
        <NsBreadcrumbElement label="Home" to="/" />
        <NsBreadcrumbElement label="Beans" />
      </NsBreadcrumbs>
    `,
  }),
}
