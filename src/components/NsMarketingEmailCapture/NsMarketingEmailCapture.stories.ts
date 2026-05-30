import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsMarketingEmailCapture from './NsMarketingEmailCapture.vue'
import NsButton from '../NsButton/NsButton.vue'
import imgButtonArrow from '../../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'

const meta = {
  title: 'Components/NsInput',
  component: NsMarketingEmailCapture,
  tags: ['autodocs'],
  parameters: { layout: 'padded', backgrounds: { default: 'warm' } },
} satisfies Meta<typeof NsMarketingEmailCapture>

export default meta
type Story = StoryObj<typeof meta>

export const MarketingEmailCapture: Story = {
  render: () => ({
    components: { NsMarketingEmailCapture, NsButton },
    setup: () => {
      const email = ref('')
      const submitted = ref(false)
      return { email, submitted, imgButtonArrow, imgDoodleCheck }
    },
    template: `
      <div style="background: #fdf4e7; padding: 40px; max-width: 842px;">
        <NsMarketingEmailCapture v-model="email">
          <template #cta>
            <NsButton variant="marketing" :pushed="submitted" @click="submitted = true">
              <template v-if="submitted">
                You're on the list
                <img :src="imgDoodleCheck" style="width: 43px; height: 25px;" alt="" />
              </template>
              <template v-else>
                I want to know more
                <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
              </template>
            </NsButton>
          </template>
        </NsMarketingEmailCapture>
      </div>
    `,
  }),
}

export const MarketingEmailCaptureDisabled: Story = {
  render: () => ({
    components: { NsMarketingEmailCapture, NsButton },
    setup: () => ({ imgButtonArrow }),
    template: `
      <div style="background: #fdf4e7; padding: 40px; max-width: 842px;">
        <NsMarketingEmailCapture>
          <template #cta>
            <NsButton variant="marketing" disable>
              I want to know more
              <img :src="imgButtonArrow" style="width: 54px; height: 13px;" alt="" />
            </NsButton>
          </template>
        </NsMarketingEmailCapture>
      </div>
    `,
  }),
}
