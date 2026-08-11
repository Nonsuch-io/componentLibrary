import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCheckbox from './NsCheckbox.vue'

/**
 * componentLibrary-eom — Figma specifies Checked = false | true | PARTIAL, and
 * the component declared `modelValue?: boolean`, so the partial variant was
 * unreachable.
 *
 * THE ASSERTION THAT MATTERS IS aria-checked="mixed", NOT THE ICON. A screen
 * reader announcing "checked" or "unchecked" for a partially-selected group is
 * being told something FALSE, and unlike a wrong icon there is no visual cue to
 * contradict it. Everything else here is secondary to that one attribute.
 *
 * These assertions read the rendered DOM rather than the SFC source, because
 * Quasar owns the ARIA and the point is to verify OUR mapping reaches it — a
 * source-level check would pass while the prop was wired to the wrong place.
 */
describe('NsCheckbox indeterminate (componentLibrary-eom)', () => {
  const aria = (w: ReturnType<typeof mount>) => w.find('.ns-checkbox').attributes('aria-checked')

  it('announces "mixed" to assistive tech when indeterminate', () => {
    expect(aria(mount(NsCheckbox, { props: { indeterminate: true } }))).toBe('mixed')
  })

  it.each([
    [true, 'true'],
    [false, 'false'],
  ])('announces %s normally when not indeterminate', (modelValue, expected) => {
    expect(aria(mount(NsCheckbox, { props: { modelValue } }))).toBe(expected)
  })

  it('lets indeterminate WIN over modelValue, so a stale true cannot mask it', () => {
    // The select-all case: a parent tracking "all children selected" may still
    // hold `true` from a previous render while the selection has since become
    // partial. Announcing "checked" there is the exact falsehood this fixes.
    expect(aria(mount(NsCheckbox, { props: { modelValue: true, indeterminate: true } }))).toBe(
      'mixed',
    )
  })

  it('emits a BOOLEAN, so a typed v-model still compiles', () => {
    // The reason this is a separate prop rather than `modelValue?: boolean | null`.
    // Widening the model widens the emit, and butiq's 12 call sites all bind
    // v-model to a boolean ref.
    const wrapper = mount(NsCheckbox, { props: { indeterminate: true } })
    wrapper.find('.ns-checkbox').trigger('click')
    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeTruthy()
    expect(typeof emitted![0][0]).toBe('boolean')
  })

  it('emits TRUE from the partial state — partial then click means select all', () => {
    const wrapper = mount(NsCheckbox, { props: { indeterminate: true } })
    wrapper.find('.ns-checkbox').trigger('click')
    expect(wrapper.emitted('update:modelValue')![0][0]).toBe(true)
  })

  it('defaults to not indeterminate, so no existing call site changes', () => {
    expect(aria(mount(NsCheckbox))).toBe('false')
  })
})
