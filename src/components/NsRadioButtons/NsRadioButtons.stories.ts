import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PhDeviceMobile, PhWifiHigh, PhQrCode, PhBluetooth } from '@phosphor-icons/vue'
import { ref } from 'vue'
import NsRadioButtons from './NsRadioButtons.vue'
import NsRadio from '../NsRadio/NsRadio.vue'

const SIZES = [
  { value: 'xs', label: 'Extra small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const meta: Meta<typeof NsRadioButtons> = {
  title: 'Components/NsRadioButtons',
  component: NsRadioButtons,
  args: {
    label: 'Size',
    options: SIZES,
    orientation: 'vertical',
    variant: 'simple',
    disable: false,
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    variant: { control: 'select', options: ['simple', 'card'] },
    disable: { control: 'boolean' },
    label: { control: 'text' },
    caption: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsRadioButtons>

// ─── Simple ──────────────────────────────────────────────────────────────────

export const SimpleVertical: Story = {
  name: 'Simple / Vertical',
  args: { orientation: 'vertical', modelValue: 'sm' },
}

export const SimpleHorizontal: Story = {
  name: 'Simple / Horizontal',
  args: { orientation: 'horizontal', modelValue: 'sm' },
}

export const SimpleWithCaption: Story = {
  name: 'Simple / With Caption',
  args: {
    orientation: 'vertical',
    modelValue: 'md',
    caption: 'Choose the size that best fits your needs',
  },
}

export const SimpleInteractive: Story = {
  name: 'Simple / Interactive',
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('md')
      return { selected, options: SIZES }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif;">
        <NsRadioButtons
          v-model="selected"
          label="Size"
          caption="Choose the size that best fits your needs"
          :options="options"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

export const SimpleDisabled: Story = {
  name: 'Simple / Disabled',
  args: { orientation: 'vertical', modelValue: 'sm', disable: true },
}

// ─── Card ────────────────────────────────────────────────────────────────────

export const CardVertical: Story = {
  name: 'Card / Vertical',
  args: { variant: 'card', orientation: 'vertical', modelValue: 'sm' },
}

export const CardHorizontal: Story = {
  name: 'Card / Horizontal',
  args: { variant: 'card', orientation: 'horizontal', modelValue: 'sm' },
}

export const CardInteractive: Story = {
  name: 'Card / Interactive',
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('md')
      return { selected, options: SIZES }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif; width:280px;">
        <NsRadioButtons
          v-model="selected"
          label="Size"
          caption="Choose the size that best fits your needs"
          :options="options"
          variant="card"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

const CONNECTION_OPTIONS = [
  { value: 'qr', label: 'Quick Connect QR Code', icon: PhQrCode },
  { value: 'wifi', label: 'Wi-Fi', icon: PhWifiHigh },
  { value: 'bluetooth', label: 'Bluetooth', icon: PhBluetooth },
  { value: 'mobile', label: 'Mobile App', icon: PhDeviceMobile },
]

export const CardWithIcons: Story = {
  name: 'Card / With Icons',
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('qr')
      return { selected, options: CONNECTION_OPTIONS }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif; width:320px;">
        <NsRadioButtons
          v-model="selected"
          label="Connection method"
          caption="Choose how you'd like to connect"
          :options="options"
          variant="card"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

const CONNECTION_OPTIONS_WITH_CAPTION_BELOW = [
  {
    value: 'qr',
    label: 'Quick Connect QR Code',
    icon: PhQrCode,
    caption: 'Scan to connect instantly',
    captionLayout: 'below' as const,
  },
  {
    value: 'wifi',
    label: 'Wi-Fi',
    icon: PhWifiHigh,
    caption: 'Requires network credentials',
    captionLayout: 'below' as const,
  },
  {
    value: 'bluetooth',
    label: 'Bluetooth',
    icon: PhBluetooth,
    caption: 'Short-range, no internet needed',
    captionLayout: 'below' as const,
  },
  {
    value: 'mobile',
    label: 'Mobile App',
    icon: PhDeviceMobile,
    caption: 'Download required',
    captionLayout: 'below' as const,
  },
]

export const CardCaptionBelow: Story = {
  name: 'Card / Caption Below',
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('qr')
      return { selected, options: CONNECTION_OPTIONS_WITH_CAPTION_BELOW }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif; width:320px;">
        <NsRadioButtons
          v-model="selected"
          label="Connection method"
          :options="options"
          variant="card"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

const CONNECTION_OPTIONS_WITH_CAPTION_INLINE = [
  {
    value: 'qr',
    label: 'Quick Connect QR Code',
    icon: PhQrCode,
    caption: 'Scan · Instant',
    captionLayout: 'inline' as const,
  },
  {
    value: 'wifi',
    label: 'Wi-Fi',
    icon: PhWifiHigh,
    caption: 'Network · Credentials required',
    captionLayout: 'inline' as const,
  },
  {
    value: 'bluetooth',
    label: 'Bluetooth',
    icon: PhBluetooth,
    caption: 'Short-range · No internet',
    captionLayout: 'inline' as const,
  },
  {
    value: 'mobile',
    label: 'Mobile App',
    icon: PhDeviceMobile,
    caption: 'App · Download required',
    captionLayout: 'inline' as const,
  },
]

export const CardCaptionInline: Story = {
  name: 'Card / Caption Inline',
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('qr')
      return { selected, options: CONNECTION_OPTIONS_WITH_CAPTION_INLINE }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif; width:320px;">
        <NsRadioButtons
          v-model="selected"
          label="Connection method"
          :options="options"
          variant="card"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

export const CardWithFields: Story = {
  name: 'Card / With Reveal Fields',
  render: () => ({
    components: { NsRadio },
    setup: () => {
      const selected = ref('custom')
      return { selected }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif; display:flex; flex-direction:column; gap:8px; width:280px;">
        <NsRadio value="standard" v-model="selected" label="Standard" card />
        <NsRadio value="large" v-model="selected" label="Large" card />
        <NsRadio value="custom" v-model="selected" label="Custom" card>
          <input
            type="number"
            placeholder="Enter value"
            style="border:1px solid #e5e7eb; border-radius:8px; padding:8px 12px; font-size:14px; width:100%;"
          />
        </NsRadio>
      </div>
    `,
  }),
}

export const CardDisabled: Story = {
  name: 'Card / Disabled',
  args: { variant: 'card', orientation: 'vertical', modelValue: 'sm', disable: true },
}
