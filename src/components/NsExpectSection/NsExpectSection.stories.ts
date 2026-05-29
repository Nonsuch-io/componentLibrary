import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsExpectSection from './NsExpectSection.vue'
import NsSectionEyebrow from '../NsSectionEyebrow/NsSectionEyebrow.vue'
import NsStepList from '../NsStepList/NsStepList.vue'
import NsStepRow from '../NsStepRow/NsStepRow.vue'

const meta = {
  title: 'Marketing/NsExpectSection',
  component: NsExpectSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsExpectSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsExpectSection, NsSectionEyebrow, NsStepList, NsStepRow },
    template: `
      <NsExpectSection>
        <template #eyebrow>
          <NsSectionEyebrow label-color="brand">
            <template #label>What to expect</template>
            <template #heading>In your Inbox</template>
          </NsSectionEyebrow>
        </template>
        <NsStepList>
          <NsStepRow :number="1">A no-nonsense breakdown of why Shopify works for some shops and not others</NsStepRow>
          <NsStepRow :number="2">A look at what butiq actually does differently and how it's built to stay that way</NsStepRow>
          <NsStepRow :number="3">An early look at the product, and the option to book a demo if you like what you see</NsStepRow>
        </NsStepList>
      </NsExpectSection>
    `,
  }),
}
