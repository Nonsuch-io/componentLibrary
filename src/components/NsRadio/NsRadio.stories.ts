import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsRadio from './NsRadio.vue'

const meta: Meta<typeof NsRadio> = {
  title: 'Components/NsRadio',
  component: NsRadio,
  args: { value: 'a', label: 'Label', disable: false },
  argTypes: {
    value: { control: 'text' },
    modelValue: { control: 'text' },
    label: { control: 'text' },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsRadio>

export const Default: Story = {}

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsRadio },
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
            <td style="padding:10px 16px 10px 0; color:#535353;">Unselected</td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" label="Label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" label="Label" disable /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">Selected</td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" model-value="a" label="Label" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" model-value="a" label="Label" disable /></td>
          </tr>
          <tr>
            <td style="padding:10px 16px 10px 0; color:#535353;">Label-less</td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" /></td>
            <td style="text-align:center; padding:10px 16px;"><NsRadio value="a" disable /></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const WithInlineField: Story = {
  name: 'With Inline Field',
  render: () => ({
    components: { NsRadio },
    template: `
      <div style="display:flex; gap:48px; padding:16px; font-family:sans-serif; align-items:flex-start;">

        <div>
          <p style="font-size:11px; color:#757575; margin:0 0 12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Field right of label (default)</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <NsRadio value="a" model-value="a" label="Quantity">
              <template #inline>
                <input type="number" value="1" min="1"
                  style="border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; font-size:14px; width:64px;" />
              </template>
            </NsRadio>
            <NsRadio value="b" label="Fixed rate" />
            <NsRadio value="c" label="Ship via">
              <template #inline>
                <select style="border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; font-size:14px; background:white;">
                  <option>Standard</option><option>Express</option><option>Overnight</option>
                </select>
              </template>
            </NsRadio>
          </div>
        </div>

        <div>
          <p style="font-size:11px; color:#757575; margin:0 0 12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Field left of label</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <NsRadio value="a" model-value="a" label="Quantity" inline-position="left">
              <template #inline>
                <input type="number" value="1" min="1"
                  style="border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; font-size:14px; width:64px;" />
              </template>
            </NsRadio>
            <NsRadio value="b" label="Fixed rate" />
            <NsRadio value="c" label="Ship via" inline-position="left">
              <template #inline>
                <select style="border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; font-size:14px; background:white;">
                  <option>Standard</option><option>Express</option><option>Overnight</option>
                </select>
              </template>
            </NsRadio>
          </div>
        </div>

      </div>
    `,
  }),
}

export const WithRevealedContent: Story = {
  name: 'With Revealed Content',
  render: () => ({
    components: { NsRadio },
    setup() {
      const selected = ref('custom')
      return { selected }
    },
    template: `
      <div style="display:flex; gap:48px; padding:16px; font-family:sans-serif; align-items:flex-start;">

        <div>
          <p style="font-size:11px; color:#757575; margin:0 0 12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Interactive — click to reveal</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <NsRadio value="standard" v-model="selected" label="Standard" />
            <NsRadio value="large" v-model="selected" label="Large" />
            <NsRadio value="custom" v-model="selected" label="Custom">
              <input
                v-if="selected === 'custom'"
                type="text"
                placeholder="Enter custom value"
                style="border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; width:180px;"
              />
            </NsRadio>
          </div>
        </div>

        <div>
          <p style="font-size:11px; color:#757575; margin:0 0 12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Static preview — content always shown</p>
          <div style="display:flex; flex-direction:column; gap:12px;">
            <NsRadio value="a" label="Standard" />
            <NsRadio value="b" label="Large" />
            <NsRadio value="c" model-value="c" label="Custom — input revealed below">
              <input
                type="text"
                placeholder="Enter custom value"
                style="border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; width:180px;"
              />
            </NsRadio>
          </div>
        </div>

      </div>
    `,
  }),
}
