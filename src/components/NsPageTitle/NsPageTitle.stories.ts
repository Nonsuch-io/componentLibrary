import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPageTitle from './NsPageTitle.vue'

const meta: Meta<typeof NsPageTitle> = {
  title: 'Components/NsPageTitle',
  component: NsPageTitle,
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

export const Default: Story = {}

/** The title alone. No empty subtitle element is rendered. */
export const TitleOnly: Story = {
  args: { subtitle: undefined },
}

/**
 * APPEARANCE AND DOCUMENT OUTLINE ARE INDEPENDENT.
 *
 * `level` changes the element, never the type. A page inside a shell that
 * already has an `h1` sets `level="2"` and still gets the design's title
 * styling — which is the whole point. If dropping the level also shrank the
 * text, consumers would reach back for `level="1"` to get the look right and
 * the page would end up with two `h1`s.
 */
export const HeadingLevels: Story = {
  render: () => ({
    components: { NsPageTitle },
    template: `
      <div style="display: flex; flex-direction: column; gap: 2rem">
        <div v-for="level in [1, 2, 3]" :key="level">
          <p style="font: 12px monospace; opacity: 0.6; margin: 0">level="{{ level }}" &rarr; renders &lt;h{{ level }}&gt;, identical type</p>
          <NsPageTitle :level="level" title="Account settings" subtitle="Same size, different outline position." />
        </div>
      </div>
    `,
  }),
}

/** The subtitle slot takes rich content the prop cannot. */
export const RichSubtitle: Story = {
  render: () => ({
    components: { NsPageTitle },
    template: `
      <NsPageTitle title="Billing">
        <template #subtitle>
          Your plan renews on 1 October. <a href="#">Change plan</a>
        </template>
      </NsPageTitle>
    `,
  }),
}

/** Long content wraps; the block is full-width and the gap is fixed. */
export const LongContent: Story = {
  args: {
    title: 'Storage locations and fulfilment preferences',
    subtitle:
      'Choose where stock is held, how it is picked, and which address customers see at checkout. These settings apply to every product unless overridden per item.',
  },
}
