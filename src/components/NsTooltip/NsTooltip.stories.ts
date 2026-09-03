import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent } from 'storybook/test'
import NsTooltip from './NsTooltip.vue'

const meta: Meta<typeof NsTooltip> = {
  title: 'Components/NsTooltip',
  component: NsTooltip,
  args: {
    delay: 300,
  },
  argTypes: {
    delay: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof NsTooltip>

export const Default: Story = {
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Hover me
        <NsTooltip v-bind="args">This is helpful information</NsTooltip>
      </button>
    `,
  }),
}

export const ShortDelay: Story = {
  args: { delay: 100 },
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Quick tooltip
        <NsTooltip v-bind="args">Shows quickly!</NsTooltip>
      </button>
    `,
  }),
}

// componentLibrary-sj1: keyboard and screen-reader access. Tab to the button
// to show the tooltip on focus (not just hover), and press Escape to dismiss
// it without losing focus.
export const KeyboardAccessible: Story = {
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button style="padding: 8px 16px">
        Tab to me, then press Escape
        <NsTooltip v-bind="args">Shown on focus as well as hover</NsTooltip>
      </button>
    `,
  }),
}

/**
 * THE STYLE ACTUALLY REACHING THE ELEMENT, WHICH NO UNIT TEST CAN SEE.
 *
 * Quasar teleports QTooltip to a body-level portal, and Vue does not stamp a
 * scope attribute onto a teleported root — so for the whole life of this
 * component `.ns-tooltip[data-v-xxxx]` matched nothing and every rule was inert.
 * The tooltip rendered with Quasar's defaults.
 *
 * The unit test that guarded this read the SFC SOURCE and asserted the
 * declaration existed. It was green throughout, because the declaration did
 * exist — it simply never applied. A check that asserts a declaration cannot see
 * whether it APPLIES, and happy-dom loads no stylesheets so computed style could
 * not tell the difference either.
 *
 * This runs in Chromium, where there is a cascade. Story: componentLibrary-3sy.
 */
export const HoverableIsReal: Story = {
  args: { delay: 0 },
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button data-testid="anchor" style="padding: 8px 16px">
        Hover me
        <NsTooltip v-bind="args">Readable tooltip</NsTooltip>
      </button>
    `,
  }),
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('[data-testid="anchor"]') as HTMLElement
    await userEvent.hover(anchor)

    const tip = await new Promise<HTMLElement>((resolve, reject) => {
      const started = Date.now()
      const poll = setInterval(() => {
        const el = document.querySelector('.ns-tooltip') as HTMLElement | null
        if (el) {
          clearInterval(poll)
          resolve(el)
        } else if (Date.now() - started > 3000) {
          clearInterval(poll)
          reject(new Error('tooltip never opened on hover'))
        }
      }, 50)
    })

    const style = getComputedStyle(tip)

    // THE LOAD-BEARING ONE. Quasar's own `no-pointer-events` class sets
    // pointer-events: none !important, so without our override reaching the
    // element the bubble is invisible to hit-testing and a pointer moving onto
    // it never generates an enter event — the tooltip closes while being read.
    // That is the hoverable half of WCAG 2.1 SC 1.4.13.
    await expect(style.pointerEvents, 'our stylesheet is not reaching the teleported tooltip').toBe(
      'auto',
    )

    // A second, independent property from the same block. If the block stops
    // applying, pointerEvents alone could in principle be satisfied by some
    // other rule; the token font-size could not.
    await expect(style.fontSize, 'token font-size did not apply').toBe('14px')
  },
}
