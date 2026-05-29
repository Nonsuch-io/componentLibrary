import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsStepRow from './NsStepRow.vue'

const meta = {
  title: 'Marketing/NsStepRow',
  component: NsStepRow,
  tags: ['autodocs'],
} satisfies Meta<typeof NsStepRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsStepRow },
    template: `
      <div style="background: #2d0b00; padding: 40px; width: 780px;">
        <NsStepRow :number="1">
          A no-nonsense breakdown of why Shopify works for some shops and not others
        </NsStepRow>
      </div>
    `,
  }),
}
