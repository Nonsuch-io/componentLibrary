import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAboutSection from './NsAboutSection.vue'
import NsSectionEyebrow from '../NsSectionEyebrow/NsSectionEyebrow.vue'

import imgWomanTechnologist from '../../assets/marketing/icon-woman-technologist.svg?url'

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
    setup: () => ({ imgWomanTechnologist }),
    template: `
      <NsAboutSection>
        <template #eyebrow>
          <NsSectionEyebrow label-color="primary">
            <template #label>More About</template>
            <template #heading>butiq</template>
            <template #icon>
              <img :src="imgWomanTechnologist" alt="" />
            </template>
          </NsSectionEyebrow>
        </template>
        <hr style="width: 100%; margin: 0; border: none; border-top: 1px solid var(--ns-color-text-primary);" />
        <p style="margin: 0;">
          Owned and operated in Alberta, butiq is launching a way to manage all your in-store
          processes while still handling your online sales and order fulfillment without the gaps.
        </p>
        <p style="margin: 0;">
          Built by an experienced team who have all actually worked in retail, which is why the
          priorities are different.
        </p>
        <hr style="width: 100%; margin: 0; border: none; border-top: 1px solid var(--ns-color-text-primary);" />
      </NsAboutSection>
    `,
  }),
}
