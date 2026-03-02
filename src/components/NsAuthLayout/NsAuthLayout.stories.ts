import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsAuthLayout from './NsAuthLayout.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsInput from '../NsInput/NsInput.vue'

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
          <h4 class="text-h4 text-weight-bold">butiq</h4>
          <p class="text-subtitle2 text-grey">Sign in to your account</p>
        </template>
        <div class="column q-gutter-md">
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsButton color="primary" class="full-width">Sign In</NsButton>
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
        <div class="column q-gutter-md">
          <div class="text-h5 text-center">Create Account</div>
          <NsInput label="Full Name" />
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsInput label="Confirm Password" type="password" />
          <NsButton color="primary" class="full-width">Register</NsButton>
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
          <h4 class="text-h4 text-weight-bold">butiq</h4>
          <p class="text-subtitle2 text-grey">Two-factor authentication</p>
        </template>
        <div class="column q-gutter-md">
          <p>Enter the 6-digit code from your authenticator app.</p>
          <NsInput label="Verification Code" mask="### ###" />
          <NsButton color="primary" class="full-width">Verify</NsButton>
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
          <h4 class="text-h4 text-weight-bold">butiq</h4>
        </template>
        <div class="column q-gutter-md">
          <NsInput label="Email" type="email" />
          <NsInput label="Password" type="password" />
          <NsButton color="primary" class="full-width">Sign In</NsButton>
        </div>
      </NsAuthLayout>
    `,
  }),
}
