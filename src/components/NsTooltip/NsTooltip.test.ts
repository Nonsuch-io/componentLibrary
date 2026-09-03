import { describe, it, expect, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import NsTooltip from './NsTooltip.vue'

// Stub QTooltip so slot content renders without teleport
const QTooltipStub = defineComponent({
  name: 'QTooltip',
  setup(_, { slots }) {
    return () => h('div', { class: 'q-tooltip-stub' }, slots.default?.())
  },
})

// QTooltip requires a parent element to anchor to
const WrapperHost = defineComponent({
  components: { NsTooltip },
  template: `<div class="host"><NsTooltip v-bind="$attrs"><span class="tip-content">Help text</span></NsTooltip></div>`,
})

describe('NsTooltip', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  it('mounts without errors', () => {
    wrapper = mount(WrapperHost, { attachTo: document.body })
    expect(wrapper.vm).toBeTruthy()
  })

  it('renders with slot content passed through', () => {
    wrapper = mount(WrapperHost, { attachTo: document.body })
    expect(wrapper.findComponent(NsTooltip).exists()).toBe(true)
  })

  it('renders slot content when QTooltip is stubbed', () => {
    wrapper = mount(NsTooltip, {
      slots: { default: '<span class="tip-slot">Tooltip text</span>' },
      global: { stubs: { QTooltip: QTooltipStub } },
    })
    expect(wrapper.find('.tip-slot').text()).toBe('Tooltip text')
  })

  it('accepts delay prop', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { delay: 500 },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts offset prop', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { offset: [10, 10] },
    })
    expect(wrapper.vm).toBeTruthy()
  })

  it('accepts anchor and self props', () => {
    wrapper = mount(WrapperHost, {
      attachTo: document.body,
      props: { anchor: 'bottom middle', self: 'top middle' },
    })
    expect(wrapper.vm).toBeTruthy()
  })
})

// componentLibrary-sj1: NsTooltip is unreachable by keyboard and unannounced
// to screen readers because it is a pass-through wrapper over Quasar's
// QTooltip, which only binds mouseenter/mouseleave/touchstart and never sets
// aria-describedby on the trigger. These tests use the REAL QTooltip (no
// stub) so they exercise the actual DOM behaviour that ships, not a fake.
const ButtonHost = defineComponent({
  components: { NsTooltip },
  template: `
    <button type="button" class="anchor-btn">
      Trigger
      <NsTooltip v-bind="$attrs">Helpful information</NsTooltip>
    </button>
  `,
})

describe('NsTooltip accessibility', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper?.unmount()
    document.body.innerHTML = ''
  })

  // Same shape as ButtonHost, but the anchor ALREADY carries a description of
  // the consumer's own — the case that distinguishes appending from clobbering.
  const DescribedButtonHost = defineComponent({
    components: { NsTooltip },
    template: `
      <button type="button" class="anchor-btn" aria-describedby="consumer-hint">
        Trigger
        <NsTooltip v-bind="$attrs">Helpful information</NsTooltip>
      </button>
    `,
  })

  it("appends to the consumer's aria-describedby instead of replacing it", async () => {
    wrapper = mount(DescribedButtonHost, { attachTo: document.body })
    await nextTick()

    const value = wrapper.find('.anchor-btn').element.getAttribute('aria-describedby') ?? ''
    const ids = value.split(/\s+/).filter(Boolean)
    expect(ids, `anchor aria-describedby was "${value}"`).toContain('consumer-hint')
    expect(ids.length, `anchor aria-describedby was "${value}"`).toBe(2)
  })

  it("leaves the consumer's aria-describedby intact after unmount", async () => {
    wrapper = mount(DescribedButtonHost, { attachTo: document.body })
    await nextTick()
    const anchor = wrapper.find('.anchor-btn').element
    wrapper.unmount()

    const after = anchor.getAttribute('aria-describedby')
    expect(after, `anchor aria-describedby after unmount was "${after}"`).toBe('consumer-hint')
  })

  // REMOVED: a test that read the SFC source and asserted the
  // `pointer-events: auto !important` DECLARATION existed.
  //
  // It was honest about being an artifact check — its own comment said jsdom
  // loads no stylesheet, so computed style could not tell the difference. What
  // neither it nor its author could see is that the declaration was inert
  // anyway: the rule was SCOPED, and Quasar teleports the tooltip out of the
  // scope, so `.ns-tooltip[data-v-xxxx]` matched nothing at all. The test was
  // green, the source was correct, and the style never reached the element.
  //
  // A check that asserts a declaration exists cannot see whether it APPLIES.
  // The real assertion now lives in NsTooltip.stories.ts (HoverableIsReal),
  // which reads computed pointer-events in Chromium where a cascade exists.
  // componentLibrary-3sy.

  it('dismisses on Escape when shown by hover, with focus outside the anchor', async () => {
    // SC 1.4.13 dismissibility applies to HOVER-triggered content. A keydown
    // listener on the anchor only fires when focus is already inside it, so it
    // covers the path that does not need it and misses the one the criterion is
    // about. Focus stays on document.body here, as it would for a mouse user.
    wrapper = mount(ButtonHost, { attachTo: document.body })
    await nextTick()
    const anchor = wrapper.find('.anchor-btn').element as HTMLElement

    // BOTH, exactly as a real browser does for a mouse — and as the component
    // itself now dispatches. Quasar binds mouseenter on <=2.25 and pointerenter
    // on >=2.26, and our peer range spans that change, so a test that picks one
    // passes on one half of the range and fails on the other.
    // componentLibrary-b6j.
    anchor.dispatchEvent(new PointerEvent('pointerenter'))
    anchor.dispatchEvent(new MouseEvent('mouseenter'))
    await new Promise((r) => setTimeout(r, 400))
    await nextTick()
    expect(document.querySelector('.ns-tooltip'), 'tooltip should be open').not.toBeNull()

    expect(document.activeElement, 'focus should not be on the anchor').not.toBe(anchor)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()
    expect(document.querySelector('.ns-tooltip'), 'Escape did not dismiss it').toBeNull()
  })

  it('does not hide when focus moves between two children of one anchor', async () => {
    // focusin/focusout BUBBLE, so tabbing between siblings inside the anchor
    // fires focusout(A) then focusin(B) even though focus never left.
    //
    // THIS SPIES ON hide() RATHER THAN ASSERTING THE END STATE. The flicker is
    // TRANSIENT — without coalescing the sequence is hide() then show(), so the
    // tooltip is open at assert time either way and an end-state assertion
    // cannot fail. I wrote that version first and proved it could not.
    const TwoChildHost = defineComponent({
      components: { NsTooltip },
      template: `
        <div class="anchor-btn">
          <button type="button" class="child-a">A</button>
          <button type="button" class="child-b">B</button>
          <NsTooltip ref="tip">Helpful information</NsTooltip>
        </div>
      `,
    })
    wrapper = mount(TwoChildHost, { attachTo: document.body })
    await nextTick()

    const anchor = wrapper.find('.anchor-btn').element
    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await nextTick()

    const tooltipVm = wrapper.findComponent(NsTooltip).vm as unknown as {
      $refs: { tooltipRef?: { hide: () => void } }
    }
    const inner = wrapper.findComponent(NsTooltip).vm.$.refs.tooltipRef as { hide: () => void }
    const hideSpy = vi.spyOn(inner, 'hide')
    void tooltipVm

    // The browser's real sequence for Tab A -> B: focusout then focusin, synchronously.
    anchor.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
    anchor.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))

    expect(
      hideSpy.mock.calls.length,
      `hide() was called ${hideSpy.mock.calls.length}x while focus stayed inside the anchor`,
    ).toBe(0)
  })

  it("sets aria-describedby on the anchor, pointing at the tooltip's actual rendered id", async () => {
    wrapper = mount(ButtonHost, { attachTo: document.body })
    await nextTick()

    const anchor = wrapper.find('.anchor-btn').element
    const describedBy = anchor.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()

    // Show the tooltip and confirm the id it points at is the id the
    // tooltip actually renders with — not just any non-empty string.
    await wrapper.find('.anchor-btn').trigger('focusin')
    await nextTick()
    await nextTick()

    const tooltipEl = document.getElementById(describedBy as string)
    expect(tooltipEl).not.toBeNull()
    expect(tooltipEl?.getAttribute('role')).toBe('tooltip')
  })

  it('shows the tooltip on a focus event on the anchor', async () => {
    wrapper = mount(ButtonHost, { attachTo: document.body })
    await nextTick()

    const anchorWrapper = wrapper.find('.anchor-btn')
    const describedBy = anchorWrapper.element.getAttribute('aria-describedby')

    expect(document.getElementById(describedBy as string)).toBeNull()

    await anchorWrapper.trigger('focusin')
    await nextTick()
    await nextTick()

    expect(document.getElementById(describedBy as string)).not.toBeNull()
  })

  it('hides the tooltip on Escape without moving focus away from the anchor', async () => {
    wrapper = mount(ButtonHost, { attachTo: document.body })
    await nextTick()

    const anchorWrapper = wrapper.find('.anchor-btn')
    const anchorEl = anchorWrapper.element as HTMLElement
    const describedBy = anchorEl.getAttribute('aria-describedby')

    anchorEl.focus()
    await anchorWrapper.trigger('focusin')
    await nextTick()
    await nextTick()
    expect(document.getElementById(describedBy as string)).not.toBeNull()
    expect(document.activeElement).toBe(anchorEl)

    await anchorWrapper.trigger('keydown', { key: 'Escape' })
    await nextTick()
    await nextTick()

    expect(document.getElementById(describedBy as string)).toBeNull()
    // Focus must stay put — WCAG 2.1 SC 1.4.13 requires Escape to dismiss
    // without moving focus.
    expect(document.activeElement).toBe(anchorEl)
  })

  it('removes aria-describedby from the anchor on unmount', async () => {
    wrapper = mount(ButtonHost, { attachTo: document.body })
    await nextTick()

    const anchor = wrapper.find('.anchor-btn').element
    expect(anchor.getAttribute('aria-describedby')).toBeTruthy()

    wrapper.unmount()

    expect(anchor.getAttribute('aria-describedby')).toBeNull()
  })

  it('keeps the tooltip open while the pointer moves onto it', async () => {
    vi.useFakeTimers()
    try {
      wrapper = mount(ButtonHost, {
        attachTo: document.body,
        attrs: { delay: 0, 'hide-delay': 100 },
      })
      await nextTick()

      const anchorWrapper = wrapper.find('.anchor-btn')
      const anchorEl = anchorWrapper.element
      const describedBy = anchorEl.getAttribute('aria-describedby') as string

      // Show via a real mouse hover on the anchor.
      await anchorWrapper.trigger('pointerenter')
      await anchorWrapper.trigger('mouseenter')
      await vi.advanceTimersByTimeAsync(0)
      await nextTick()
      await nextTick()
      const tooltipEl = document.getElementById(describedBy)
      expect(tooltipEl).not.toBeNull()

      // Leave the anchor (schedules Quasar's own delayed hide) but move the
      // pointer onto the tooltip itself before that hide fires.
      await anchorWrapper.trigger('pointerleave')
      await anchorWrapper.trigger('mouseleave')
      await tooltipEl!.dispatchEvent(new MouseEvent('mouseenter'))
      await vi.advanceTimersByTimeAsync(0)
      await nextTick()

      // Advance past the original hideDelay window — the tooltip must still
      // be there, proving the pending hide was cancelled rather than merely
      // raced.
      await vi.advanceTimersByTimeAsync(100)
      await nextTick()
      expect(document.getElementById(describedBy)).not.toBeNull()

      // Now actually leave the tooltip — it should close like normal.
      tooltipEl!.dispatchEvent(new MouseEvent('mouseleave'))
      await vi.advanceTimersByTimeAsync(100)
      await nextTick()
      expect(document.getElementById(describedBy)).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
