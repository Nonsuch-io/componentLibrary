import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect } from 'storybook/test'
import NsOnboardingStepper from './NsOnboardingStepper.vue'

/** The design's instance (I189:15062): six steps, the first done, the second current. */
const signUp = [
  { id: 'name', label: 'Name' },
  { id: 'contact', label: 'Contact' },
  { id: 'address', label: 'Address' },
  { id: 'photo', label: 'Photo' },
  { id: 'hours', label: 'Hours' },
  { id: 'storage', label: 'Storage' },
]

const meta: Meta<typeof NsOnboardingStepper> = {
  title: 'Components/NsOnboardingStepper',
  component: NsOnboardingStepper,
  tags: ['autodocs'],
  args: { steps: signUp, current: 'contact' },
}

export default meta
type Story = StoryObj<typeof meta>

const fontsReady = () => document.fonts.ready

export const Default: Story = {}

export const FirstStep: Story = { args: { current: 'name' } }

export const LastStep: Story = { args: { current: 'storage' } }

/** A skipped step stays upcoming behind the current one; a step done out of order shows complete. */
export const OutOfOrder: Story = {
  args: {
    steps: signUp.map((s) =>
      s.id === 'address'
        ? { ...s, complete: false }
        : s.id === 'hours'
          ? { ...s, complete: true }
          : s,
    ),
    current: 'photo',
  },
}

/**
 * DESKTOP GEOMETRY IS REAL — I189:15062 at 700: a 28px row, six labelled
 * steps, five 1px brand connectors sharing the leftover width equally, the
 * current label the only bold one. jsdom loads no stylesheet.
 */
export const LayoutIsRealOnDesktop: Story = {
  render: (args) => ({
    components: { NsOnboardingStepper },
    setup: () => ({ args }),
    template: `<div style="width: 700px"><NsOnboardingStepper v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeGreaterThanOrEqual(1024)
    const list = canvasElement.querySelector('.ns-onboarding-stepper__steps') as HTMLElement
    await expect(list.getBoundingClientRect().width).toBe(700)
    await expect(list.getBoundingClientRect().height).toBe(28)

    const steps = [...canvasElement.querySelectorAll<HTMLElement>('.ns-onboarding-stepper__step')]
    await expect(steps.length).toBe(6)
    for (const step of steps) {
      const circle = step.querySelector('.ns-step-number') as HTMLElement
      await expect(circle.getBoundingClientRect().width).toBe(28)
      await expect(circle.getBoundingClientRect().height).toBe(28)
    }

    // Labels: visible, 8px from their circle, 12px; only the current one is
    // bold; the "(Completed)" suffix is for screen readers only. Review
    // deleted the gap and the suffix's hiding and this story stayed green.
    for (const step of steps) {
      const circle = step.querySelector('.ns-step-number')!.getBoundingClientRect()
      const label = step.querySelector('.ns-onboarding-stepper__label')!.getBoundingClientRect()
      await expect(label.left - circle.right).toBe(8)
    }
    for (const sr of canvasElement.querySelectorAll<HTMLElement>('.ns-onboarding-stepper__sr')) {
      await expect(sr.getBoundingClientRect().width).toBeLessThanOrEqual(1)
    }
    const weights = steps.map(
      (s) => getComputedStyle(s.querySelector('.ns-onboarding-stepper__label')!).fontWeight,
    )
    await expect(weights).toEqual(['400', '600', '400', '400', '400', '400'])
    const label = steps[0].querySelector('.ns-onboarding-stepper__label') as HTMLElement
    await expect(getComputedStyle(label).position).not.toBe('absolute')
    await expect(getComputedStyle(label).fontSize).toBe('12px')

    // Connectors: five, 1px, brand, and EQUAL — the leftover width is
    // shared, so the gap from one step's label to the next circle is the
    // same everywhere. Measured as circle-to-circle spacing minus label
    // widths, which is what the eye sees.
    const lines = steps.slice(1).map((s) => getComputedStyle(s, '::before'))
    for (const line of lines) {
      await expect(line.borderTopWidth).toBe('1px')
      await expect(line.borderTopColor).toBe('rgb(213, 99, 7)')
    }
    const lineWidths = lines.map((l) => parseFloat(l.width))
    for (const w of lineWidths) await expect(Math.abs(w - lineWidths[0])).toBeLessThan(1)
    await expect(lineWidths[0]).toBeGreaterThan(20)
    // The last step ends at the row's right edge.
    await expect(steps[5].getBoundingClientRect().right).toBe(list.getBoundingClientRect().right)
  },
}

/**
 * MOBILE GEOMETRY IS REAL — 2440:379011 at 350: circles and lines only, 28
 * tall; the labels are off-screen for the eye and still in the DOM for a
 * screen reader.
 */
export const LayoutIsRealOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => ({
    components: { NsOnboardingStepper },
    setup: () => ({ args }),
    template: `<div style="width: 350px"><NsOnboardingStepper v-bind="args" /></div>`,
  }),
  play: async ({ canvasElement }) => {
    await fontsReady()
    await expect(window.innerWidth).toBeLessThan(1024)
    const list = canvasElement.querySelector('.ns-onboarding-stepper__steps') as HTMLElement
    await expect(list.getBoundingClientRect().width).toBe(350)
    await expect(list.getBoundingClientRect().height).toBe(28)
    const labels = canvasElement.querySelectorAll<HTMLElement>('.ns-onboarding-stepper__label')
    await expect(labels.length).toBe(6)
    for (const label of labels) {
      await expect(getComputedStyle(label).position).toBe('absolute')
      await expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1)
      await expect(label.textContent?.trim()).not.toBe('')
    }
    const circles = [...canvasElement.querySelectorAll<HTMLElement>('.ns-step-number')]
    await expect(circles[0].getBoundingClientRect().left).toBe(list.getBoundingClientRect().left)
    await expect(circles[5].getBoundingClientRect().right).toBe(list.getBoundingClientRect().right)
    // Circle to circle is 8 + the line + 8, the same line every time — the
    // decomposition, so a lost gap cannot hide inside an even pitch.
    const second = canvasElement.querySelectorAll('.ns-onboarding-stepper__step')[1]
    const lineWidth = parseFloat(getComputedStyle(second, '::before').width)
    for (let i = 1; i < circles.length; i++) {
      const gap =
        circles[i].getBoundingClientRect().left - circles[i - 1].getBoundingClientRect().right
      await expect(Math.abs(gap - (8 + lineWidth + 8))).toBeLessThan(0.1)
    }
  },
}
