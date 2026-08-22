import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTabs from './NsTabs.vue'
import NsTab from '../NsTab/NsTab.vue'

const meta: Meta<typeof NsTabs> = {
  title: 'Components/NsTabs',
  component: NsTabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTabs, NsTab },
    setup: () => ({ args }),
    // REAL NsTab CHILDREN. QTabs renders role="tablist", which REQUIRES tab
    // children — 'Default content' left it with none (aria-required-children).
    // A docs page showing a container used wrongly is the version people copy.
    template: `
      <NsTabs v-bind="args" model-value="one">
        <NsTab name="one" label="One" />
        <NsTab name="two" label="Two" />
      </NsTabs>
    `,
  }),
}
