import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAuthLayout from './NsAuthLayout.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsInput from '../NsInput/NsInput.vue'
import NsFormSection from '../NsFormSection/NsFormSection.vue'
import NsPageHeading from '../NsPageHeading/NsPageHeading.vue'
import { expect } from 'storybook/test'

const meta: Meta<typeof NsAuthLayout> = {
  title: 'Templates/NsAuthLayout',
  component: NsAuthLayout,
  args: {
    maxWidth: '440px',
  },
  argTypes: {
    maxWidth: { control: 'text' },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof NsAuthLayout>

export const Default: Story = {
  render: (args) => ({
    components: { NsAuthLayout, NsButton, NsInput },
    setup: () => ({ args }),
    template: `
      <NsAuthLayout v-bind="args">
        <template #branding>
          <h4 class="text-h4 text-weight-bold">Acme</h4>
          <p class="text-subtitle2 text-grey">Sign in to your account</p>
        </template>
        <div class="column q-gutter-y-md">
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsButton variant="primary" class="full-width">Sign In</NsButton>
        </div>
      </NsAuthLayout>
    `,
  }),
}

export const NoBranding: Story = {
  render: (args) => ({
    components: { NsAuthLayout, NsButton, NsInput },
    setup: () => ({ args }),
    template: `
      <NsAuthLayout v-bind="args">
        <div class="column q-gutter-y-md">
          <div class="text-h5 text-center">Create Account</div>
          <NsInput label="Full Name" />
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsInput label="Confirm Password" type="password" />
          <NsButton variant="primary" class="full-width">Register</NsButton>
        </div>
      </NsAuthLayout>
    `,
  }),
}

export const CustomWidth: Story = {
  args: {
    maxWidth: '600px',
  },
  render: (args) => ({
    components: { NsAuthLayout, NsButton, NsInput },
    setup: () => ({ args }),
    template: `
      <NsAuthLayout v-bind="args">
        <template #branding>
          <h4 class="text-h4 text-weight-bold">Acme</h4>
          <p class="text-subtitle2 text-grey">Two-factor authentication</p>
        </template>
        <div class="column q-gutter-y-md">
          <p>Enter the 6-digit code from your authenticator app.</p>
          <NsInput label="Verification Code" mask="### ###" />
          <NsButton variant="primary" class="full-width">Verify</NsButton>
        </div>
      </NsAuthLayout>
    `,
  }),
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => ({
    components: { NsAuthLayout, NsButton, NsInput },
    setup: () => ({ args }),
    template: `
      <NsAuthLayout v-bind="args">
        <template #branding>
          <h4 class="text-h4 text-weight-bold">Acme</h4>
        </template>
        <div class="column q-gutter-y-md">
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsButton variant="primary" class="full-width">Sign In</NsButton>
        </div>
      </NsAuthLayout>
    `,
  }),
}

/**
 * THE SIGN-UP SHELL (componentLibrary-grj.2) — Figma 264:26835 "Sign Up
 * Form (FULL) [Desktop]": the page heading and three NsFormSection cards
 * sit DIRECTLY on the canvas fill, 910 wide, top-aligned, 40 above and 32
 * at the sides; no card around them. Before `surface="canvas"` a sign-up
 * page in this layout was a card inside a card on a white body. Login and
 * friends keep the card.
 */
export const SignUpOnTheCanvas: Story = {
  args: { surface: 'canvas', maxWidth: '910px' },
  render: (args) => ({
    components: { NsAuthLayout, NsFormSection, NsInput, NsPageHeading },
    setup: () => ({ args }),
    template: `
      <NsAuthLayout v-bind="args">
        <div style="display: flex; flex-direction: column; gap: 20px">
          <NsPageHeading title="Create your butiq shop." />
          <NsFormSection title="Profile" description="Who is setting up this shop?">
            <NsInput label="First name" label-placement="above" />
          </NsFormSection>
          <NsFormSection title="Account">
            <NsInput label="Email" label-placement="above" type="email" />
          </NsFormSection>
          <NsFormSection title="Business Details">
            <NsInput label="Shop name" label-placement="above" />
          </NsFormSection>
        </div>
      </NsAuthLayout>
    `,
  }),
  play: async ({ canvasElement }) => {
    await document.fonts.ready
    const page = canvasElement.querySelector('.ns-auth-layout__page') as HTMLElement
    const container = canvasElement.querySelector('.ns-auth-layout__container') as HTMLElement
    const token = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    const rgb = (hex: string) => {
      const n = parseInt(hex.slice(1), 16)
      return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
    }
    // The canvas fill, no card, the column at the frame's 910.
    await expect(getComputedStyle(page).backgroundColor).toBe(rgb(token('--ns-color-bg-canvas')))
    await expect(canvasElement.querySelector('.ns-auth-layout__card')).toBeNull()
    await expect(container.getBoundingClientRect().width).toBeLessThanOrEqual(910)
    // Top-aligned with the design's 40 above (desktop), not floated to the middle.
    const pageRect = page.getBoundingClientRect()
    await expect(container.getBoundingClientRect().top - pageRect.top).toBe(40)
    // The section cards are direct children of the column's flow, on the canvas.
    await expect(canvasElement.querySelectorAll('.ns-form-section').length).toBe(3)
  },
}
