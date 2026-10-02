import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAvatar from './NsAvatar.vue'

const PLACEHOLDER_PHOTO =
  'data:image/svg+xml;base64,' +
  btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#b8e4fa"/>
    <circle cx="100" cy="80" r="40" fill="#0069b4"/>
    <ellipse cx="100" cy="175" rx="60" ry="40" fill="#0069b4"/>
  </svg>`)

const meta: Meta<typeof NsAvatar> = {
  title: 'Components/NsAvatar',
  component: NsAvatar,
  args: { size: 'md' },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg', 'xl'] },
    src: { control: 'text' },
    alt: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsAvatar>

export const WithPhoto: Story = {
  name: 'With Photo',
  args: { src: PLACEHOLDER_PHOTO, ariaLabel: 'Jane Doe' },
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args" />',
  }),
}

export const WithInitials: Story = {
  name: 'With Initials',
  render: (args) => ({
    components: { NsAvatar },
    setup: () => ({ args }),
    template: '<NsAvatar v-bind="args">JD</NsAvatar>',
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsAvatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="display:flex; gap:24px; align-items:flex-end; flex-wrap:wrap;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="sm" :src="photo" aria-label="Jane Doe" />
          <span>sm · 32px</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="md" :src="photo" aria-label="Jane Doe" />
          <span>md · 48px</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="lg" :src="photo" aria-label="Jane Doe" />
          <span>lg · 64px</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="xl" :src="photo" aria-label="Jane Doe" />
          <span>xl · 96px</span>
        </div>
      </div>
    `,
  }),
}

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsAvatar },
    setup: () => ({ photo: PLACEHOLDER_PHOTO }),
    template: `
      <div style="display:flex; gap:24px; align-items:center; flex-wrap:wrap;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="md" :src="photo" aria-label="Jane Doe" />
          <span>Photo</span>
        </div>
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; font-family:sans-serif; font-size:11px; color:#757575;">
          <NsAvatar size="md">JD</NsAvatar>
          <span>Initials</span>
        </div>
      </div>
    `,
  }),
}
