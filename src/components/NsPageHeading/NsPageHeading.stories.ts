import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPageHeading from './NsPageHeading.vue'
import NsButton from '../NsButton/NsButton.vue'
import { expect } from 'storybook/test'
import { PhArrowLeft } from '@phosphor-icons/vue'

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

/**
 * THE SIGN-UP HEADING (componentLibrary-grj.1) — Figma 264:26835: a
 * "Back to Pricing" tertiary control on the left, and the title CENTRED
 * in the 910 column beneath it. `align="center"` moves the title block
 * only; the controls row stays where the design draws it.
 */
export const CenteredTitleWithControls: Story = {
  args: { title: 'Create your butiq shop.', align: 'center' },
  render: (args) => ({
    components: { NsPageHeading, NsButton, PhArrowLeft },
    setup: () => ({ args }),
    template: `
      <div style="width: 910px">
        <NsPageHeading v-bind="args">
          <template #controls>
            <NsButton variant="tertiary" size="md" data-testid="back">
              <PhArrowLeft :size="20" weight="regular" aria-hidden="true" />
              Back to Pricing
            </NsButton>
          </template>
        </NsPageHeading>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    await document.fonts.ready
    const header = canvasElement.querySelector('.ns-page-heading') as HTMLElement
    const h = header.getBoundingClientRect()
    const back = canvasElement.querySelector('[data-testid="back"]')!.getBoundingClientRect()
    const title = canvasElement.querySelector('.ns-page-title__title') as HTMLElement
    const t = title.getBoundingClientRect()
    // Controls stay left; the title's centre is the column's centre.
    await expect(back.left - h.left).toBe(0)
    await expect(Math.abs((t.left + t.right) / 2 - (h.left + h.right) / 2)).toBeLessThan(1)
    await expect(t.width).toBeLessThan(h.width) // centred as a block, not stretched
    await expect(getComputedStyle(canvasElement.querySelector('.ns-page-title')!).textAlign).toBe(
      'center',
    )
  },
}
