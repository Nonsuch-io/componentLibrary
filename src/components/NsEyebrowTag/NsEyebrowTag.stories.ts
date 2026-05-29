import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsEyebrowTag from './NsEyebrowTag.vue'

const imgCanadaFlag = 'http://localhost:3845/assets/221c38a30f4d2ca8b5d4338ff906ea54dfbb45c2.png'

const meta = {
  title: 'Marketing/NsEyebrowTag',
  component: NsEyebrowTag,
  tags: ['autodocs'],
} satisfies Meta<typeof NsEyebrowTag>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsEyebrowTag },
    setup: () => ({ imgCanadaFlag }),
    template: `
      <NsEyebrowTag>
        A new Canadian retail software
        <img :src="imgCanadaFlag" style="width: 38px; height: 38px; object-fit: cover;" alt="" />
      </NsEyebrowTag>
    `,
  }),
}
