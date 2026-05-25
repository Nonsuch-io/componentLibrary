import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AnimatedEye from './AnimatedEye.vue'

/**
 * Internal sub-component used by NsNavSidebar's collapse/expand toggle.
 *
 * Not exported from the library — these stories exist so the animations
 * (blink + peek + cursor-tracked pupil) can be exercised in isolation.
 */
const meta = {
  title: 'Internal/AnimatedEye',
  component: AnimatedEye,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Open (eye visible) when true, closed (lid down) when false',
    },
    debugPeek: {
      control: 'boolean',
      description:
        'Compress the peek interval from 20–30 min to 3–8 s so you can actually see it during a Storybook session. Closed state only.',
    },
  },
} satisfies Meta<typeof AnimatedEye>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Eye open. Pupil tracks the cursor. A blink fires at a random 5–30 s interval.
 *
 * Move your mouse around to see the pupil follow; wait a beat for the blink.
 */
export const Open: Story = {
  args: { open: true },
  render: (args) => ({
    components: { AnimatedEye },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; justify-content: center; height: 200px; background: var(--ns-color-bg-canvas, #fefbf5); color: var(--ns-color-text-brand, #d56307); font-size: 64px;">
        <AnimatedEye v-bind="args" />
      </div>
    `,
  }),
}

/**
 * Eye closed. By default a peek happens once every 20–30 min — too rare to see
 * in a Storybook session. This story is the same as the Closed one but is
 * configured to fire at the default rare interval, useful for verifying the
 * static closed appearance.
 */
export const Closed: Story = {
  args: { open: false },
  render: (args) => ({
    components: { AnimatedEye },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; justify-content: center; height: 200px; background: var(--ns-color-bg-canvas, #fefbf5); color: var(--ns-color-text-brand, #d56307); font-size: 64px;">
        <AnimatedEye v-bind="args" />
      </div>
    `,
  }),
}

/**
 * Eye closed with debugPeek enabled — peeks every 3–8 s instead of 20–30 min,
 * so you can actually watch the animation. The pupil tracks your cursor
 * during the brief open window.
 */
export const PeekDebug: Story = {
  args: { open: false, debugPeek: true },
  render: (args) => ({
    components: { AnimatedEye },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; align-items: center; justify-content: center; height: 200px; background: var(--ns-color-bg-canvas, #fefbf5); color: var(--ns-color-text-brand, #d56307); font-size: 64px;">
        <AnimatedEye v-bind="args" />
      </div>
    `,
  }),
}
