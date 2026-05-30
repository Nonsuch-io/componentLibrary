import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsHero from './NsHero.vue'
import NsEyebrowTag from '../NsEyebrowTag/NsEyebrowTag.vue'
import NsHighlightSpan from '../NsHighlightSpan/NsHighlightSpan.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsMarketingEmailCapture from '../NsMarketingEmailCapture/NsMarketingEmailCapture.vue'

import imgDoodleArrows from '../../assets/marketing/icon-doodle-arrows.svg?url'
import imgButtonArrow from '../../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'

const imgCanadaFlag = 'http://localhost:3845/assets/221c38a30f4d2ca8b5d4338ff906ea54dfbb45c2.png'
const imgSquareLogo = 'http://localhost:3845/assets/1c3f5be0b7b680255201f9068cd036c80d11c1f4.svg'

const meta = {
  title: 'Marketing/NsHero',
  component: NsHero,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsHero>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsHero, NsEyebrowTag, NsHighlightSpan, NsButton, NsMarketingEmailCapture },
    setup: () => {
      const email = ref('')
      const submitted = ref(false)
      return {
        imgCanadaFlag,
        imgSquareLogo,
        imgButtonArrow,
        imgDoodleArrows,
        imgDoodleCheck,
        email,
        submitted,
      }
    },
    template: `
      <div style="background: #fdf4e7; position: relative;">
        <NsHero>
          <template #eyebrow>
            <NsEyebrowTag>
              A new Canadian retail software
              <img :src="imgCanadaFlag" style="width: 38px; height: 38px; object-fit: cover;" alt="" />
            </NsEyebrowTag>
          </template>
          <template #headline>
            <div>Run your shop.</div>
            <div style="display: flex; align-items: baseline; white-space: nowrap;">
              <span style="margin-right: 8px;">Not your</span>
              <NsHighlightSpan>software.</NsHighlightSpan>
            </div>
            <p style="font-size: 1.5rem; font-weight: 400; line-height: 1.2; padding-top: 16px; margin: 0; max-width: 641px;">
              If Shopify has become a workaround rather than a solution, it might be time to see what else is out there.
            </p>
          </template>
          <template #capture>
            <div style="position: relative; max-width: 842px; width: 100%;">
              <img :src="imgDoodleArrows" style="position: absolute; width: 214px; height: 145px; right: -10px; bottom: calc(100% - 5px); pointer-events: none;" alt="" />
              <NsMarketingEmailCapture v-model="email">
                <template #cta>
                  <NsButton :variant="submitted ? 'marketing-pushed' : 'marketing'" @click="submitted = true">
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
          </template>
          <template #media>
            <img :src="imgSquareLogo" style="width: 145px; height: 156px;" alt="butiq logo" />
          </template>
        </NsHero>
      </div>
    `,
  }),
}
