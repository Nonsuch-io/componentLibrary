import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsLandingLayout from './NsLandingLayout.vue'
import NsSiteHeader from '../NsSiteHeader/NsSiteHeader.vue'
import NsHero from '../NsHero/NsHero.vue'
import NsEyebrowTag from '../NsEyebrowTag/NsEyebrowTag.vue'
import NsHighlightSpan from '../NsHighlightSpan/NsHighlightSpan.vue'
import NsTrustBar from '../NsTrustBar/NsTrustBar.vue'
import NsExpectSection from '../NsExpectSection/NsExpectSection.vue'
import NsSectionEyebrow from '../NsSectionEyebrow/NsSectionEyebrow.vue'
import NsStepList from '../NsStepList/NsStepList.vue'
import NsStepRow from '../NsStepRow/NsStepRow.vue'
import NsAboutSection from '../NsAboutSection/NsAboutSection.vue'
import NsSiteFooter from '../NsSiteFooter/NsSiteFooter.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsMarketingEmailCapture from '../NsMarketingEmailCapture/NsMarketingEmailCapture.vue'
import type { NsTrustBarItem } from '../NsTrustBar/NsTrustBar.vue'
import imgDoodleArrows from '../../assets/marketing/icon-doodle-arrows.svg?url'
import imgButtonArrow from '../../assets/marketing/icon-arrow-button.svg?url'
import imgDoodleX from '../../assets/marketing/icon-x.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'
import imgBluesky from '../../assets/marketing/icon-bluesky.svg?url'
import imgInstagram from '../../assets/marketing/icon-instagram.svg?url'
import imgCanadaFlag from '../../assets/marketing/icon-flag-canada.svg?url'
import imgSendingEmail from '../../assets/marketing/icon-incoming-envelope.svg?url'
import imgLaptopGirl from '../../assets/marketing/icon-woman-technologist.svg?url'
import {
  placeholderLogoSrc,
  placeholderWordmarkSrc,
  placeholderLogoAlt,
  placeholderCopy,
} from '../../stories/placeholderMarketingContent'

const trustItems: NsTrustBarItem[] = [
  { text: 'No credit card', icon: imgDoodleX },
  { text: 'No commitment', icon: imgDoodleX },
  {
    text: placeholderCopy.trustBarBullet,
    icon: imgDoodleCheck,
  },
]

const meta = {
  title: 'Templates/NsLandingLayout',
  component: NsLandingLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsLandingLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: {
      NsLandingLayout,
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
        placeholderLogoSrc,
        placeholderWordmarkSrc,
        placeholderLogoAlt,
        placeholderCopy,
        imgCanadaFlag,
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
      <NsLandingLayout>
        <template #header>
          <NsSiteHeader>
            <template #logo>
              <img :src="placeholderWordmarkSrc" style="height: 27px; width: 72px;" :alt="placeholderLogoAlt" />
            </template>
            <template #nav>
              <span style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; color: white;">Home</span>
              <span style="font-size: 0.875rem; font-weight: 500; text-transform: uppercase; color: white;">Blog</span>
            </template>
          </NsSiteHeader>
        </template>

        <template #hero>
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
                <img :src="imgDoodleArrows" class="ns-hero__capture-doodle" alt="" />
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
              <img :src="placeholderLogoSrc" style="width: 145px; height: 156px;" :alt="placeholderLogoAlt" />
            </template>
          </NsHero>
        </template>

        <NsTrustBar :items="trustItems" />

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
            <NsStepRow :number="2">{{ placeholderCopy.stepListItem }}</NsStepRow>
            <NsStepRow :number="3">An early look at the product, and the option to book a demo if you like what you see</NsStepRow>
          </NsStepList>
        </NsExpectSection>

        <NsAboutSection>
          <template #eyebrow>
            <NsSectionEyebrow label-color="primary">
              <template #label>More About</template>
              <template #heading>{{ placeholderCopy.aboutHeading }}</template>
              <template #icon>
                <img :src="imgLaptopGirl" alt="" />
              </template>
            </NsSectionEyebrow>
          </template>
          <hr style="width: 100%; margin: 0; border: none; border-top: 1px solid var(--ns-color-text-primary);" />
          <p style="margin: 0;">
            {{ placeholderCopy.aboutParagraphOne }}
          </p>
          <p style="margin: 0;">
            {{ placeholderCopy.aboutParagraphTwo }}
          </p>
          <hr style="width: 100%; margin: 0; border: none; border-top: 1px solid var(--ns-color-text-primary);" />
        </NsAboutSection>

        <template #footer>
          <NsSiteFooter
            label="Contact or follow us"
            :social-links="[
              { href: 'https://bsky.app', icon: imgBluesky, label: 'Bluesky' },
              { href: 'https://instagram.com', icon: imgInstagram, label: 'Instagram' }
            ]"
          />
        </template>
      </NsLandingLayout>
    `,
  }),
}
