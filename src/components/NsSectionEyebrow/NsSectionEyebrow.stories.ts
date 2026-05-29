import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSectionEyebrow from './NsSectionEyebrow.vue'

const meta = {
  title: 'Marketing/NsSectionEyebrow',
  component: NsSectionEyebrow,
  tags: ['autodocs'],
} satisfies Meta<typeof NsSectionEyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsSectionEyebrow },
    template: `
      <div style="background: #2d0b00; padding: 40px; width: 324px;">
        <NsSectionEyebrow>
          <template #label>What to expect</template>
          <template #heading>In your Inbox</template>
        </NsSectionEyebrow>
      </div>
    `,
  }),
}
