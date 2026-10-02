import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCheckbox from './NsCheckbox.vue'

const meta: Meta<typeof NsCheckbox> = {
  title: 'Components/NsCheckbox',
  component: NsCheckbox,
  args: { label: 'Label', modelValue: false, disable: false },
  argTypes: {
    modelValue: { control: 'select', options: [false, true, null] },
    disable: { control: 'boolean' },
    label: { control: 'text' },
    caption: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsCheckbox>

export const Default: Story = {}

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsCheckbox },
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
            <td style="padding:10px 16px 10px 0; color:#535353;">Unchecked</td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="false" label="Label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="false" label="Label" disable /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">Checked</td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="true" label="Label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="true" label="Label" disable /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">Indeterminate</td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="null" label="Label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsCheckbox :model-value="null" label="Label" disable /></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const WithCaption: Story = {
  name: 'With Caption',
  render: () => ({
    components: { NsCheckbox },
    template: `
      <div style="display:flex; flex-direction:column; gap:16px; padding:16px;">
        <NsCheckbox :model-value="false" label="Accept terms and conditions" caption="Required to continue" />
        <NsCheckbox :model-value="true" label="Subscribe to newsletter" caption="We'll send updates about new features" />
        <NsCheckbox :model-value="false" label="Disabled with caption" caption="You cannot change this" disable />
      </div>
    `,
  }),
}
