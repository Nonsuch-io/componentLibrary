import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsStepList from './NsStepList.vue'
import NsStepRow from '../NsStepRow/NsStepRow.vue'

const meta = {
  title: 'Marketing/NsStepList',
  component: NsStepList,
  tags: ['autodocs'],
} satisfies Meta<typeof NsStepList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsStepList, NsStepRow },
    template: `
      <div style="background: #2d0b00; padding: 40px; width: 780px;">
        <NsStepList>
          <NsStepRow :number="1">A no-nonsense breakdown of why Shopify works for some shops and not others</NsStepRow>
          <NsStepRow :number="2">A look at what butiq actually does differently and how it's built to stay that way</NsStepRow>
          <NsStepRow :number="3">An early look at the product, and the option to book a demo if you like what you see</NsStepRow>
        </NsStepList>
      </div>
    `,
  }),
}
