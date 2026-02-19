import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: '@storybook/vue3-vite',
  addons: ['@storybook/addon-a11y'],
}

export default config
