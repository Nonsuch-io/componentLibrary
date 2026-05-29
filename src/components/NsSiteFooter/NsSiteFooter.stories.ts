import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSiteFooter from './NsSiteFooter.vue'
import imgBluesky from '../../assets/marketing/icon-bluesky.svg?url'
import imgInstagram from '../../assets/marketing/icon-instagram.svg?url'

const meta = {
  title: 'Marketing/NsSiteFooter',
  component: NsSiteFooter,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsSiteFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsSiteFooter },
    setup: () => ({ imgBluesky, imgInstagram }),
    template: `
      <NsSiteFooter
        label="Contact or follow us"
        :social-links="[
          { href: 'https://bsky.app', icon: imgBluesky, label: 'Bluesky' },
          { href: 'https://instagram.com', icon: imgInstagram, label: 'Instagram' }
        ]"
      />
    `,
  }),
}
