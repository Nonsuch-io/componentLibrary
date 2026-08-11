import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsInput from './NsInput.vue'

const meta: Meta<typeof NsInput> = {
  title: 'Components/NsInput',
  component: NsInput,
  args: {
    label: 'Email address',
    outlined: true,
    dense: false,
  },
  argTypes: {
    label: { control: 'text' },
    outlined: { control: 'boolean' },
    dense: { control: 'boolean' },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsInput>

export const Default: Story = {}

export const Dense: Story = {
  args: {
    dense: true,
    label: 'Compact input',
  },
}

export const WithValidation: Story = {
  args: {
    label: 'Email',
    rules: [
      (val: string) => !!val || 'Required',
      (val: string) => val.includes('@') || 'Must be a valid email',
    ],
  },
}

export const NoLabel: Story = {
  args: {
    label: undefined,
  },
}

/**
 * Figma specifies a `State=Disabled` variant, so it is documented here.
 *
 * NOTE THE SPELLING: Quasar uses `disable`, never `disabled` — and `disabled` fails SILENTLY,
 * doing nothing at all with no warning (componentLibrary-ob8). This story exists partly so the
 * correct name is visible to anyone reading the docs.
 */
export const Disabled: Story = {
  args: {
    label: 'Email address',
    disable: true,
  },
}

/**
 * Figma's `Size=Dense` — 38px. Prefer this over the deprecated `dense` boolean,
 * which cannot express three states and will go in the next breaking batch.
 */
export const SizeDense: Story = {
  args: {
    label: 'Search',
    size: 'dense',
  },
}

/**
 * Figma's `Size=Default` — 50px.
 *
 * READ THE HEIGHT CAREFULLY: this is NOT what an input with no `size` renders.
 * Quasar's outlined control is 56px; the design says 50px. `size` is opt-in
 * precisely so adding this prop did not silently restyle every existing form.
 * The reconciliation is scheduled for the batched breaking release
 * (componentLibrary-b5e), not smuggled in here.
 */
export const SizeDefault: Story = {
  args: {
    label: 'Email address',
    size: 'default',
  },
}

/**
 * Figma's `Size=Large` — 120px, and it is a PROSE FIELD rather than a big input.
 *
 * The design's Large and Default resolve to identical tokens — same font, same
 * padding, same radius, same colours. Only the height moves, and a 120px
 * single-line box makes no sense, so Large renders a textarea. That answers a
 * question we had queued for the designer without needing to ask it: the design
 * does specify a multi-line field, not as a separate component but as a size.
 *
 * 120px is the STARTING height, not a cap — it autogrows.
 */
export const SizeLarge: Story = {
  args: {
    label: 'Describe your project',
    size: 'large',
  },
}

/**
 * THE HEIGHTS, MEASURED IN A REAL BROWSER.
 *
 * This is the only place in the suite where these assertions mean anything.
 * jsdom has no layout engine and loads no stylesheet, so a unit test reading
 * getComputedStyle().height returns the same value whether the CSS exists, is
 * misspelled, or was deleted — it passes on the bug. Storybook's vitest project
 * runs real Chromium with the real stylesheet, so offsetHeight is the truth.
 *
 * Tolerances are +/-2px: borders and sub-pixel rounding move the measured value
 * a little, and pinning an exact integer would make this fail for reasons that
 * have nothing to do with the design.
 */
export const HeightsAreReal: Story = {
  args: { label: 'Measured' },
  render: (args) => ({
    components: { NsInput },
    setup: () => ({ args }),
    template: `
      <div>
        <NsInput v-bind="args" size="dense" data-testid="dense" />
        <NsInput v-bind="args" size="default" data-testid="default" />
        <NsInput v-bind="args" size="large" data-testid="large" />
        <NsInput v-bind="args" data-testid="unsized" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    // Queried by DOCUMENT ORDER rather than by test id. `inheritAttrs: false`
    // plus the filtered v-bind means an id lands on the root label, and
    // getByTestId then returned an element the control was not inside — the
    // query, not the component, was wrong. Order is fixed by the template above.
    const controls = canvasElement.querySelectorAll<HTMLElement>('.q-field__control')
    const [dense, def, large, unsized] = Array.from(controls)

    await expect(controls.length).toBe(4)

    await expect(dense.offsetHeight).toBeGreaterThanOrEqual(36)
    await expect(dense.offsetHeight).toBeLessThanOrEqual(40)

    await expect(def.offsetHeight).toBeGreaterThanOrEqual(48)
    await expect(def.offsetHeight).toBeLessThanOrEqual(52)

    await expect(large.offsetHeight).toBeGreaterThanOrEqual(118)

    // The load-bearing one: an UNSIZED input must keep Quasar's 56px, not pick
    // up Figma's 50px. If this drifts, every existing form in the consumer
    // silently changed height and nothing else in the suite would notice.
    await expect(unsized.offsetHeight).toBeGreaterThanOrEqual(54)
  },
}
