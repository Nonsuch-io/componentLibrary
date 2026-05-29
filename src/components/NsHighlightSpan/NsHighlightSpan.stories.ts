import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsHighlightSpan from './NsHighlightSpan.vue'

const meta = {
  title: 'Marketing/NsHighlightSpan',
  component: NsHighlightSpan,
  tags: ['autodocs'],
} satisfies Meta<typeof NsHighlightSpan>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsHighlightSpan },
    template: '<NsHighlightSpan>software.</NsHighlightSpan>',
  }),
}
