import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSiteHeader from './NsSiteHeader.vue'

const imgLogo = 'http://localhost:3845/assets/0729b8cf93958d1076c80331bac123779f43aa2d.svg'

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
    setup: () => ({ imgLogo }),
    template: `
      <NsSiteHeader>
        <template #logo>
          <img :src="imgLogo" style="height: 27px; width: 72px;" alt="butiq" />
        </template>
        <template #nav>
          <span style="font-size: 0.875rem; font-weight: 700; text-transform: uppercase; color: white;">Home</span>
          <span style="font-size: 0.875rem; font-weight: 500; text-transform: uppercase; color: white;">Blog</span>
        </template>
      </NsSiteHeader>
    `,
  }),
}
