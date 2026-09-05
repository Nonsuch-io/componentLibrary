import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsText from './NsText.vue'

const VARIANTS = [
  'display',
  'heading-2xl',
  'heading-2xl-regular',
  'heading-xl',
  'heading-xl-regular',
  'heading-lg',
  'heading-lg-regular',
  'heading-md',
  'heading-md-regular',
  'heading-sm',
  'heading-sm-regular',
  'body-md',
  'body-sm',
  'label-md',
  'label-sm',
  'label-xs',
  'overline-lg',
  'overline-md',
  'overline-md-bold',
  'overline',
  'caption',
] as const

const TONES = [
  'primary',
  'secondary',
  'tertiary',
  'brand',
  'accent',
  'positive',
  'negative',
  'warning',
  'info',
  'link',
  'disabled',
] as const

const meta: Meta<typeof NsText> = {
  title: 'Components/NsText',
  component: NsText,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    tone: { control: 'select', options: TONES },
    as: {
      control: 'select',
      options: ['span', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'strong', 'small'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsText },
    setup: () => ({ args }),
    template: '<NsText v-bind="args">The quick brown fox jumps over the lazy dog</NsText>',
  }),
}

/** The whole ramp, in size order. These are the classes `typography.css` defines. */
export const TypeRamp: Story = {
  render: () => ({
    components: { NsText },
    setup: () => ({ VARIANTS }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <div v-for="v in VARIANTS" :key="v">
          <NsText as="div" variant="label-xs" tone="tertiary">{{ v }}</NsText>
          <NsText as="div" :variant="v">The quick brown fox</NsText>
        </div>
      </div>
    `,
  }),
}

/**
 * WHY THESE ARE TWO PROPS AND NOT ONE.
 *
 * If `variant` also picked the element, a consumer needing a large-looking
 * subheading would reach for `heading-xl` and silently emit a second `<h1>`.
 * Appearance and document structure are chosen independently, so the outline a
 * screen-reader user navigates stays correct no matter how the page looks.
 */
export const SemanticsAndAppearanceAreIndependent: Story = {
  render: () => ({
    components: { NsText },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.25rem">
        <div>
          <NsText as="div" variant="label-xs" tone="tertiary">
            as="h2" variant="body-md" — an outline heading that reads as body text
          </NsText>
          <NsText as="h2" variant="body-md">Shipping details</NsText>
        </div>
        <div>
          <NsText as="div" variant="label-xs" tone="tertiary">
            as="span" variant="heading-xl" — looks like a title, is not one
          </NsText>
          <NsText as="span" variant="heading-xl">Not a heading</NsText>
        </div>
      </div>
    `,
  }),
}

export const Tones: Story = {
  render: () => ({
    components: { NsText },
    setup: () => ({ TONES }),
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem">
        <NsText v-for="t in TONES" :key="t" as="div" variant="body-md" :tone="t">
          {{ t }} — the quick brown fox
        </NsText>
      </div>
    `,
  }),
}

/**
 * The composition NsPageTitle is built from, measured off Figma 265:30901:
 * an "XL heading" title over a "Medium heading regular" subtitle.
 */
export const PageTitleComposition: Story = {
  render: () => ({
    components: { NsText },
    template: `
      <div style="display: flex; flex-direction: column; gap: 8px; max-width: 350px">
        <NsText as="h1" variant="heading-xl" tone="primary">Account settings</NsText>
        <NsText as="p" variant="heading-md-regular" tone="secondary">
          Update your profile, change your password, and manage how we contact you.
        </NsText>
      </div>
    `,
  }),
}
