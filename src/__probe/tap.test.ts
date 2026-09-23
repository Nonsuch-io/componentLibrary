import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import NsTooltip from '../components/NsTooltip/NsTooltip.vue'
import NsButton from '../components/NsButton/NsButton.vue'

const wait = (ms = 30) => new Promise((r) => setTimeout(r, ms))
const tooltip = () => document.querySelector('.ns-tooltip')
function tap(el: HTMLElement) {
  const touch = { pointerType: 'touch', isPrimary: true, bubbles: true }
  el.dispatchEvent(new PointerEvent('pointerenter', touch))
  el.dispatchEvent(new PointerEvent('pointerdown', touch))
  el.dispatchEvent(new PointerEvent('pointerup', touch))
  el.dispatchEvent(new PointerEvent('pointerleave', touch))
  el.dispatchEvent(new Event('touchend', { bubbles: true }))
  el.dispatchEvent(new PointerEvent('click', { pointerType: 'touch', bubbles: true }))
}

// butiq's actual shape: tooltip SIBLING of an icon-only NsButton inside a span,
// because a tooltip INSIDE the button never shows on keyboard focus (84n).
const ButiqShape = defineComponent({
  components: { NsTooltip, NsButton },
  template: `
    <span class="tip-anchor">
      <NsButton variant="tertiary" icon-only aria-label="What is this?" class="the-btn">?</NsButton>
      <NsTooltip :delay="0">A GST/HST number is…</NsTooltip>
    </span>
  `,
})

describe('PROBE: butiq tooltip shape on quasar 2.32', () => {
  let w: VueWrapper
  afterEach(() => w?.unmount())

  it('tap on the BUTTON (descendant of the anchor)', async () => {
    w = mount(ButiqShape, { attachTo: document.body })
    await nextTick()
    const btn = w.find('.the-btn').element as HTMLElement
    tap(btn)
    await wait()
    process.stdout.write(`TAP-ON-BUTTON: ${tooltip() ? 'SHOWN' : 'NOT SHOWN'}\n`)
    expect(true).toBe(true)
  })

  it('tap on the SPAN anchor itself', async () => {
    w = mount(ButiqShape, { attachTo: document.body })
    await nextTick()
    const span = w.find('.tip-anchor').element as HTMLElement
    tap(span)
    await wait()
    process.stdout.write(`TAP-ON-ANCHOR: ${tooltip() ? 'SHOWN' : 'NOT SHOWN'}\n`)
    expect(true).toBe(true)
  })
})
