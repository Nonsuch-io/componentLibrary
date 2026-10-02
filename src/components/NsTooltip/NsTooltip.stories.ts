import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTooltip from './NsTooltip.vue'

const meta: Meta<typeof NsTooltip> = {
  title: 'Components/NsTooltip',
  component: NsTooltip,
  args: { trigger: 'hover', delay: 300 },
  argTypes: {
    trigger: { control: 'select', options: ['hover', 'click'] },
    label: { control: 'text' },
    delay: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof NsTooltip>

export const HoverTrigger: Story = {
  name: 'Hover (desktop)',
  render: () => ({
    components: { NsTooltip },
    template: `
      <div style="padding:48px; display:flex; justify-content:center; gap:32px; align-items:center;">
        <NsTooltip trigger="hover">
          Hover over the icon to see this tooltip. It disappears when you move your cursor away.
        </NsTooltip>
        <NsTooltip trigger="hover" label="What is this?">
          Hover over the icon to see this tooltip. It disappears when you move your cursor away.
        </NsTooltip>
      </div>
    `,
  }),
}

export const ClickTrigger: Story = {
  name: 'Click (mobile / touch)',
  render: () => ({
    components: { NsTooltip },
    template: `
      <div style="padding:48px; display:flex; justify-content:center; gap:32px; align-items:center;">
        <NsTooltip trigger="click">
          Click the icon to open this tooltip. Use the × to close it.
        </NsTooltip>
        <NsTooltip trigger="click" label="What is this?">
          Click the icon to open this tooltip. Use the × to close it.
        </NsTooltip>
      </div>
    `,
  }),
}

export const Placements: Story = {
  render: () => ({
    components: { NsTooltip },
    template: `
      <div style="padding:80px; display:grid; grid-template-columns:1fr 1fr; gap:48px; justify-items:center; align-items:center;">
        <NsTooltip label="Above" anchor="top middle" self="bottom middle" :offset="[8, 0]">Tooltip appears above</NsTooltip>
        <NsTooltip label="Below" anchor="bottom middle" self="top middle" :offset="[8, 0]">Tooltip appears below (default)</NsTooltip>
        <NsTooltip label="Left" anchor="center left" self="center right" :offset="[0, 8]">Tooltip appears to the left</NsTooltip>
        <NsTooltip label="Right" anchor="center right" self="center left" :offset="[0, 8]">Tooltip appears to the right</NsTooltip>
      </div>
    `,
  }),
}

export const InContext: Story = {
  name: 'In Context (form field)',
  render: () => ({
    components: { NsTooltip },
    template: `
      <div style="padding:48px; font-family:sans-serif;">
        <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
          <label style="font-size:14px; font-weight:600; color:#2d0b00;">GST / HST Number</label>
          <NsTooltip trigger="click" label="What is this?">
            Your business tax registration number issued by the CRA. Required if you are registered for GST/HST.
          </NsTooltip>
        </div>
        <input type="text" placeholder="123456789RT0001" style="border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; width:280px; font-size:14px;" />
      </div>
    `,
  }),
}
