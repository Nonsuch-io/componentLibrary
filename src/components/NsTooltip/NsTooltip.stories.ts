import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { expect, userEvent, waitFor } from 'storybook/test'
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
    //
    // Derived from the token, NOT hardcoded to '14px'. This guards a
    // POINTER-EVENTS defect, and it should not go red because a designer retuned
    // --ns-font-size-sm for unrelated reasons — a test that cries wolf about
    // something it does not guard gets muted, and then it guards nothing.
    const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize)
    const tokenRem = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--ns-font-size-sm') || '0.875',
    )
    await expect(style.fontSize, 'token font-size did not apply').toBe(`${tokenRem * rootFontPx}px`)
  },
}

/**
 * THE HOVER-ONTO-THE-TOOLTIP PATH, IN A REAL BROWSER.
 *
 * HoverableIsReal proves our stylesheet reaches the teleported element. It does
 * NOT exercise handleTooltipMouseEnter/Leave — it hovers the anchor and stops.
 * That code (the dual PointerEvent + MouseEvent re-dispatch of
 * componentLibrary-b6j) was covered only by dispatchEvent in happy-dom, and this
 * component's own history says why that is weak: dispatchEvent bypasses
 * hit-testing, in jsdom AND in a browser. Review caught the gap.
 *
 * Here the pointer genuinely moves anchor -> tooltip, native events fire
 * alongside our synthetic ones, and the tooltip must survive past the hide
 * delay. That is the hoverable half of WCAG 2.1 SC 1.4.13 end to end.
 */
export const HoverOntoTooltipKeepsItOpen: Story = {
  args: { delay: 0, hideDelay: 300 },
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <button data-testid="anchor" style="padding: 8px 16px; margin: 60px">
        Hover me
        <NsTooltip v-bind="args">Read me slowly</NsTooltip>
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

    // Leave the anchor — this schedules Quasar's hide — then move onto the
    // bubble before it fires. A real pointer move, so the browser's own
    // pointerenter fires too, on top of our re-dispatch.
    await userEvent.unhover(anchor)
    await userEvent.hover(tip)

    // Past the hideDelay window. Still open means the pending hide was
    // cancelled, which is the whole point of the re-dispatch.
    await new Promise((r) => setTimeout(r, 600))
    await expect(
      document.querySelector('.ns-tooltip'),
      'tooltip closed while the pointer was on it — the hoverable half of SC 1.4.13',
    ).not.toBeNull()
  },
}

/**
 * TAP TO SHOW, in a real browser (componentLibrary-ewc). A tap is the
 * event sequence Chromium puts on a touched button, dispatched here with
 * pointerType "touch" so Quasar takes its touch path (finger-down schedules
 * a show, finger-up a hide in the same slot — the press-and-hold UX that
 * showed nothing for a tap). The wrapper's click handler then takes that
 * slot back. A second tap hides; a tap elsewhere hides; a MOUSE click does
 * not toggle what hover has shown.
 */
export const TapToShow: Story = {
  args: { delay: 0 },
  render: (args) => ({
    components: { NsTooltip },
    setup: () => ({ args }),
    template: `
      <div style="padding: 60px">
        <button data-testid="anchor" type="button" style="padding: 8px 16px">
          Tap me
          <NsTooltip v-bind="args">Shown by a tap</NsTooltip>
        </button>
        <p data-testid="elsewhere" style="margin-top: 40px">Somewhere else</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const anchor = canvasElement.querySelector('[data-testid="anchor"]') as HTMLElement
    const elsewhere = canvasElement.querySelector('[data-testid="elsewhere"]') as HTMLElement
    const tip = () => document.querySelector('.ns-tooltip')
    const touch = { pointerType: 'touch', isPrimary: true, bubbles: true } as const
    // Chromium's order for a finger: a non-hovering pointer's "leave" is
    // finger-up, before touchend and click.
    const tap = (el: HTMLElement) => {
      el.dispatchEvent(new PointerEvent('pointerenter', touch))
      el.dispatchEvent(new PointerEvent('pointerdown', touch))
      el.dispatchEvent(new Event('touchstart', { bubbles: true }))
      el.dispatchEvent(new PointerEvent('pointerup', touch))
      el.dispatchEvent(new PointerEvent('pointerleave', touch))
      el.dispatchEvent(new Event('touchend', { bubbles: true }))
      el.dispatchEvent(new PointerEvent('click', touch))
    }

    tap(anchor)
    await waitFor(() => expect(tip(), 'shown by the tap').not.toBeNull())
    await new Promise((r) => setTimeout(r, 400))
    await expect(tip(), 'stays: the tap-driven show was the last thing Quasar saw').not.toBeNull()

    // A touch on the tooltip's own text does not dismiss it.
    ;(tip() as HTMLElement).dispatchEvent(new PointerEvent('pointerdown', touch))
    await new Promise((r) => setTimeout(r, 100))
    await expect(tip(), 'a tap on the tooltip keeps it').not.toBeNull()

    tap(anchor)
    await waitFor(() => expect(tip(), 'hidden by the second tap').toBeNull())

    tap(anchor)
    await waitFor(() => expect(tip()).not.toBeNull())
    elsewhere.dispatchEvent(new PointerEvent('pointerdown', touch))
    await waitFor(() => expect(tip(), 'hidden by a tap elsewhere').toBeNull())

    // NOT asserted here: that a mouse click's FOCUS shows nothing. Chromium's
    // :focus-visible heuristic counts only trusted input, and user-event's
    // events are not — a script focus() after a synthetic mousedown reads as
    // keyboard. The gate's pointer branch is pinned in the unit test with
    // `matches` stubbed; the mouse regression below is the observable half.

    // A mouse: hover shows, and the click that follows leaves it shown — the
    // regression two earlier attempts had.
    await userEvent.hover(anchor)
    await waitFor(() => expect(tip(), 'shown by hover').not.toBeNull())
    await userEvent.click(anchor)
    await new Promise((r) => setTimeout(r, 200))
    await expect(tip(), 'a mouse click did not toggle it off').not.toBeNull()
    await userEvent.unhover(anchor)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(tip()).toBeNull())
  },
}
