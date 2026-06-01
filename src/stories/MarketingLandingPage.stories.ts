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
import imgHeaderWordmark from '../assets/marketing/icon-brand-logo.svg?url'
import imgCanadaFlag from '../assets/marketing/icon-flag-canada.svg?url'
import imgSquareLogo from '../assets/marketing/icon-logo-badge.svg?url'
import imgSendingEmail from '../assets/marketing/icon-incoming-envelope.svg?url'
import imgLaptopGirl from '../assets/marketing/icon-woman-technologist.svg?url'

const trustItems: NsTrustBarItem[] = [
  { text: 'No credit card', icon: imgDoodleX },
  { text: 'No commitment', icon: imgDoodleX },
  {
    text: "Just an early look at what butiq is and how it's built better for in-person retail.",
    icon: imgDoodleCheck,
  },
]

const meta = {
  title: 'Marketing/Templates/Landing Page',
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
      <div style="background: var(--ns-color-bg-header); font-family: var(--ns-font-family-text);">

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

        <!-- Trust Bar -->
        <NsTrustBar :items="trustItems" />

        <!-- Expect Section -->
        <NsExpectSection>
          <template #eyebrow>
            <NsSectionEyebrow label-color="brand">
              <template #label>What to expect</template>
              <template #heading>In your Inbox</template>
              <template #icon>
                <img :src="imgSendingEmail" alt="" />
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
                <img :src="imgLaptopGirl" alt="" />
              </template>
            </NsSectionEyebrow>
          </template>
          <div style="height: 1px; width: 100%; background: var(--ns-color-text-primary);"></div>
          <p style="margin: 0;">
            Owned and operated in Alberta, butiq is launching a way to manage all your in-store processes - from staff management to inventory reordering - while still handling your online sales and order fulfillment without the gaps.
          </p>
          <p style="margin: 0;">
            butiq was built by an experienced team of developers, designers, and success managers who have all actually worked in retail, which is why the priorities are different. It is built to handle the back-of-house so you can pay attention to the actual shop and designed to run in the background, not become another thing to manage.
          </p>
          <div style="height: 1px; width: 100%; background: var(--ns-color-text-primary);"></div>
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
