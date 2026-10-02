import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsToggle from './NsToggle.vue'

const meta: Meta<typeof NsToggle> = {
  title: 'Components/NsToggle',
  component: NsToggle,
  args: { label: 'Toggle label', modelValue: false, disable: false },
  argTypes: {
    modelValue: { control: 'boolean' },
    disable: { control: 'boolean' },
    label: { control: 'text' },
    caption: { control: 'text' },
    badgeLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsToggle>

export const Default: Story = {}

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsToggle },
    template: `
      <table style="border-collapse:collapse; font-family:sans-serif; font-size:12px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px 16px 8px 0; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">State</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Enabled</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Disabled</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">Off</td>
            <td style="text-align:center; padding:10px 16px;"><NsToggle :model-value="false" label="Toggle label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsToggle :model-value="false" label="Toggle label" disable /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">On</td>
            <td style="text-align:center; padding:10px 16px;"><NsToggle :model-value="true" label="Toggle label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsToggle :model-value="true" label="Toggle label" disable /></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const WithCaption: Story = {
  name: 'With Caption',
  render: () => ({
    components: { NsToggle },
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; padding:16px;">
        <NsToggle :model-value="false" label="Email notifications" caption="Receive updates via email" />
        <NsToggle :model-value="true" label="Push notifications" caption="Get alerts on your device" />
        <NsToggle :model-value="false" label="Disabled setting" caption="Managed by your organisation" disable />
      </div>
    `,
  }),
}

export const WithBadge: Story = {
  name: 'With Badge',
  render: () => ({
    components: { NsToggle },
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; padding:16px;">
        <NsToggle :model-value="false" label="Smart suggestions" badge-label="New" />
        <NsToggle :model-value="true" label="AI auto-complete" badge-label="Beta" />
      </div>
    `,
  }),
}
