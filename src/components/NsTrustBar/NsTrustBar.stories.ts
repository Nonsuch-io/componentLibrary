import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTrustBar from './NsTrustBar.vue'
import type { NsTrustBarItem } from './NsTrustBar.vue'
import imgDoodleX from '../../assets/marketing/icon-x.svg?url'
import imgDoodleCheck from '../../assets/marketing/icon-checkmark.svg?url'
import { placeholderCopy } from '../../stories/placeholderMarketingContent'

const trustItems: NsTrustBarItem[] = [
  { text: 'No credit card', icon: imgDoodleX },
  { text: 'No commitment', icon: imgDoodleX },
  {
    text: placeholderCopy.trustBarBullet,
    icon: imgDoodleCheck,
  },
]

const meta = {
  title: 'Marketing/NsTrustBar',
  component: NsTrustBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsTrustBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsTrustBar },
    setup: () => ({ trustItems }),
    template: '<NsTrustBar :items="trustItems" />',
  }),
}
