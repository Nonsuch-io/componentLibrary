import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsSiteHeader from '../components/NsSiteHeader/NsSiteHeader.vue'
import NsHero from '../components/NsHero/NsHero.vue'
import NsEyebrowTag from '../components/NsEyebrowTag/NsEyebrowTag.vue'
import NsHighlightSpan from '../components/NsHighlightSpan/NsHighlightSpan.vue'
import NsTrustBar from '../components/NsTrustBar/NsTrustBar.vue'
import NsExpectSection from '../components/NsExpectSection/NsExpectSection.vue'
import NsSectionEyebrow from '../components/NsSectionEyebrow/NsSectionEyebrow.vue'
import NsStepList from '../components/NsStepList/NsStepList.vue'
import NsStepRow from '../components/NsStepRow/NsStepRow.vue'
import NsAboutSection from '../components/NsAboutSection/NsAboutSection.vue'
import NsSiteFooter from '../components/NsSiteFooter/NsSiteFooter.vue'
import NsButton from '../components/NsButton/NsButton.vue'
import NsMarketingEmailCapture from '../components/NsMarketingEmailCapture/NsMarketingEmailCapture.vue'
import type { NsTrustBarItem } from '../components/NsTrustBar/NsTrustBar.vue'
import imgDoodleArrows from '../assets/marketing/icon-doodle-arrows.svg?url'
import imgButtonArrow from '../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleX from '../assets/marketing/icon-x.svg?url'
import imgDoodleCheck from '../assets/marketing/icon-checkmark.svg?url'
import imgBluesky from '../assets/marketing/icon-bluesky.svg?url'
import imgInstagram from '../assets/marketing/icon-instagram.svg?url'

const imgHeaderWordmark =
  'http://localhost:3845/assets/0729b8cf93958d1076c80331bac123779f43aa2d.svg'
const imgCanadaFlag = 'http://localhost:3845/assets/221c38a30f4d2ca8b5d4338ff906ea54dfbb45c2.png'
const imgSquareLogo = 'http://localhost:3845/assets/1c3f5be0b7b680255201f9068cd036c80d11c1f4.svg'
const imgSendingEmail = 'http://localhost:3845/assets/eb6c59affdea9a3c9b494d8722bb6e38433eb32b.png'
const imgLaptopGirl = 'http://localhost:3845/assets/6b42529352dde1c16ecaa60b91b9c9a2bbcd855a.png'

const trustItems: NsTrustBarItem[] = [
  { text: 'No credit card', icon: imgDoodleX },
  { text: 'No commitment', icon: imgDoodleX },
  {
    text: "Just an early look at what butiq is and how it's built better for in-person retail.",
    icon: imgDoodleCheck,
  },
]

const meta = {
  title: 'Marketing/Landing Page',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FullPage: Story = {
  render: () => ({
    components: {
      NsSiteHeader,
      NsHero,
      NsEyebrowTag,
      NsHighlightSpan,
      NsTrustBar,
      NsExpectSection,
      NsSectionEyebrow,
      NsStepList,
      NsStepRow,
      NsAboutSection,
      NsSiteFooter,
      NsButton,
      NsMarketingEmailCapture,
    },
    setup: () => {
      const email = ref('')
      const submitted = ref(false)
      return {
        email,
        submitted,
        imgHeaderWordmark,
        imgCanadaFlag,
        imgSquareLogo,
        imgButtonArrow,
        imgDoodleArrows,
        imgDoodleCheck,
        imgSendingEmail,
        imgLaptopGirl,
        imgBluesky,
        imgInstagram,
        trustItems,
      }
    },
    template: `
      <div style="background: #fdf4e7; font-family: 'Fixel Text', sans-serif;">

        <!-- Header -->
        <NsSiteHeader>
          <template #logo>
            <img :src="imgHeaderWordmark" style="height: 27px; width: 72px;" alt="butiq" />
          </template>
          <template #nav>
            <span style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; color: white;">Home</span>
            <span style="font-size: 0.875rem; font-weight: 500; text-transform: uppercase; color: white;">Blog</span>
          </template>
        </NsSiteHeader>

        <!-- Hero -->
        <NsHero>
          <template #eyebrow>
            <NsEyebrowTag>
              A new Canadian retail software
              <img :src="imgCanadaFlag" style="width: 38px; height: 38px; object-fit: cover;" alt="" />
            </NsEyebrowTag>
          </template>
          <template #headline>
            <div style="font-size: 5.75rem; font-weight: 600; line-height: 1.1; color: #2d0b00;">
              Run your shop.
            </div>
            <div style="display: flex; align-items: baseline; white-space: nowrap;">
              <span style="font-size: 5.75rem; font-weight: 600; line-height: 1.1; color: #2d0b00; margin-right: 8px;">Not your</span>
              <NsHighlightSpan>software.</NsHighlightSpan>
            </div>
            <p style="font-size: 1.5rem; font-weight: 400; line-height: 1.2; color: #2d0b00; padding-top: 16px; margin: 0; max-width: 641px;">
              If Shopify has become a workaround rather than a solution, it might be time to see what else is out there.
            </p>
          </template>
          <template #capture>
            <div style="position: relative; max-width: 842px; width: 100%;">
              <img :src="imgDoodleArrows" style="position: absolute; width: 214px; height: 145px; right: -10px; bottom: calc(100% - 5px); pointer-events: none;" alt="" />
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
          </template>
          <template #media>
            <img :src="imgSquareLogo" style="width: 145px; height: 156px;" alt="butiq logo" />
          </template>
        </NsHero>

        <!-- Trust Bar -->
        <NsTrustBar :items="trustItems" />

        <!-- Expect Section -->
        <NsExpectSection>
          <template #eyebrow>
            <NsSectionEyebrow label-color="brand">
              <template #label>What to expect</template>
              <template #heading>In your Inbox</template>
              <template #icon>
                <img :src="imgSendingEmail" style="width: 120px; height: 120px; object-fit: contain;" alt="" />
              </template>
            </NsSectionEyebrow>
          </template>
          <NsStepList>
            <NsStepRow :number="1">A no-nonsense breakdown of why Shopify works for some shops and not others</NsStepRow>
            <NsStepRow :number="2">A look at what butiq actually does differently and how it's built to stay that way</NsStepRow>
            <NsStepRow :number="3">An early look at the product, and the option to book a demo if you like what you see</NsStepRow>
          </NsStepList>
        </NsExpectSection>

        <!-- About Section -->
        <NsAboutSection>
          <template #eyebrow>
            <NsSectionEyebrow label-color="primary">
              <template #label>More About</template>
              <template #heading>butiq</template>
              <template #icon>
                <img :src="imgLaptopGirl" style="width: 120px; height: 120px; object-fit: contain;" alt="" />
              </template>
            </NsSectionEyebrow>
          </template>
          <div style="height: 1px; width: 100%; background: #2d0b00;"></div>
          <p style="font-size: 1.5rem; font-weight: 400; line-height: 1.2; margin: 0;">
            Owned and operated in Alberta, butiq is launching a way to manage all your in-store processes - from staff management to inventory reordering - while still handling your online sales and order fulfillment without the gaps.
          </p>
          <p style="font-size: 1.5rem; font-weight: 400; line-height: 1.2; margin: 0;">
            butiq was built by an experienced team of developers, designers, and success managers who have all actually worked in retail, which is why the priorities are different. It is built to handle the back-of-house so you can pay attention to the actual shop and designed to run in the background, not become another thing to manage.
          </p>
          <div style="height: 1px; width: 100%; background: #2d0b00;"></div>
        </NsAboutSection>

        <!-- Footer -->
        <NsSiteFooter
          label="Contact or follow us"
          :social-links="[
            { href: 'https://bsky.app', icon: imgBluesky, label: 'Bluesky' },
            { href: 'https://instagram.com', icon: imgInstagram, label: 'Instagram' }
          ]"
        />

      </div>
    `,
  }),
}
