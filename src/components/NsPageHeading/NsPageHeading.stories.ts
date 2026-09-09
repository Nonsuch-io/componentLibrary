import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPageHeading from './NsPageHeading.vue'
import NsButton from '../NsButton/NsButton.vue'

const meta: Meta<typeof NsPageHeading> = {
  title: 'Components/NsPageHeading',
  component: NsPageHeading,
  tags: ['autodocs'],
  argTypes: {
    level: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
  },
  args: {
    title: 'Account settings',
    subtitle: 'Update your profile, change your password, and manage how we contact you.',
  },
}

export default meta
type Story = StoryObj<typeof meta>

/** Without controls, this is an NsPageTitle in a `<header>` landmark. */
export const Default: Story = {}

/** The composition measured in Figma: a controls row above the page title. */
export const WithControls: Story = {
  render: (args) => ({
    components: { NsPageHeading, NsButton },
    setup: () => ({ args }),
    template: `
      <NsPageHeading v-bind="args">
        <template #controls>
          <NsButton variant="tertiary" size="sm" icon="arrow_back">Back</NsButton>
        </template>
      </NsPageHeading>
    `,
  }),
}

/**
 * NO EMPTY CONTROLS ROW. The slot is declared but renders nothing, so the row
 * is not rendered at all — otherwise it would still take its gap and push the
 * title down, which reads as a spacing bug rather than a slot bug.
 */
export const ControlsThatRenderNothing: Story = {
  render: (args) => ({
    components: { NsPageHeading, NsButton },
    setup: () => ({ args, canEdit: false }),
    template: `
      <NsPageHeading v-bind="args">
        <template #controls>
          <NsButton v-if="canEdit">Edit</NsButton>
        </template>
      </NsPageHeading>
    `,
  }),
}

/**
 * Several actions, and the case that needs `controlsLabel`.
 *
 * The controls row is a named `role="group"`, but the DEFAULT name is the same
 * for every instance ("Page actions"). On a page carrying more than one of
 * these — where "Cancel" and "Save changes" repeat verbatim — the default
 * groups the buttons without distinguishing the groups. Passing
 * `controlsLabel` is what tells a screen-reader user which set they are in.
 */
export const MultipleControls: Story = {
  args: { controlsLabel: 'Billing actions' },
  render: (args) => ({
    components: { NsPageHeading, NsButton },
    setup: () => ({ args }),
    template: `
      <NsPageHeading v-bind="args">
        <template #controls>
          <NsButton variant="tertiary" size="sm">Cancel</NsButton>
          <NsButton variant="primary" size="sm">Save changes</NsButton>
        </template>
      </NsPageHeading>
    `,
  }),
}

/**
 * `level` is forwarded to NsPageTitle and never changes the type — a heading
 * inside a shell that already has an `h1` stays visually identical.
 */
export const InsideAShell: Story = {
  args: { level: 2, subtitle: 'This page sits inside a layout that already owns the h1.' },
}

/**
 * THE LANDMARK DEMOTES ITSELF, AND THAT IS THE POINT.
 *
 * `<header>` is a `banner` landmark only outside sectioning content. At the top
 * of a page this component is the banner; inside `<main>` — where most pages
 * put it — it is a plain group instead. Several of these on one page therefore
 * never compete to be the page banner. Shown here because the behaviour comes
 * from HTML semantics rather than from anything the component does, which makes
 * it easy to mistake for an accident.
 */
export const InsideAMainLandmark: Story = {
  render: (args) => ({
    components: { NsPageHeading, NsButton },
    setup: () => ({ args }),
    template: `
      <main>
        <NsPageHeading v-bind="args">
          <template #controls>
            <NsButton variant="tertiary" size="sm">Cancel</NsButton>
          </template>
        </NsPageHeading>
      </main>
    `,
  }),
}
