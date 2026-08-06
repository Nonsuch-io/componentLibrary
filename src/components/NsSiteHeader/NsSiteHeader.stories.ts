import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSiteHeader from './NsSiteHeader.vue'
import {
  placeholderWordmarkSrc,
  placeholderLogoAlt,
} from '../../stories/placeholderMarketingContent'

const meta = {
  title: 'Marketing/NsSiteHeader',
  component: NsSiteHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsSiteHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsSiteHeader },
    setup: () => ({ placeholderWordmarkSrc, placeholderLogoAlt }),
    template: `
      <NsSiteHeader>
        <template #logo>
          <img :src="placeholderWordmarkSrc" style="height: 27px; width: 72px;" :alt="placeholderLogoAlt" />
        </template>
        <template #nav>
          <span style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; color: white;">Home</span>
          <span style="font-size: 0.875rem; font-weight: 500; text-transform: uppercase; color: white;">Blog</span>
        </template>
      </NsSiteHeader>
    `,
  }),
}
