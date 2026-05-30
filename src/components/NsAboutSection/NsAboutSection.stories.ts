import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAboutSection from './NsAboutSection.vue'
import NsSectionEyebrow from '../NsSectionEyebrow/NsSectionEyebrow.vue'

const meta = {
  title: 'Marketing/NsAboutSection',
  component: NsAboutSection,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsAboutSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsAboutSection, NsSectionEyebrow },
    template: `
      <NsAboutSection>
        <template #eyebrow>
          <NsSectionEyebrow label-color="primary">
            <template #label>More About</template>
            <template #heading>butiq</template>
          </NsSectionEyebrow>
        </template>
        <div style="height: 1px; width: 100%; background: #2d0b00;"></div>
        <p style="margin: 0;">
          Owned and operated in Alberta, butiq is launching a way to manage all your in-store
          processes while still handling your online sales and order fulfillment without the gaps.
        </p>
        <p style="margin: 0;">
          Built by an experienced team who have all actually worked in retail, which is why the
          priorities are different.
        </p>
        <div style="height: 1px; width: 100%; background: #2d0b00;"></div>
      </NsAboutSection>
    `,
  }),
}
