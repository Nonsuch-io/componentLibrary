import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCheckbox from './NsCheckbox.vue'
import { __resetAttrConflictWarnings } from '../../composables/useNsAttrConflictWarning'

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

  it('emits a boolean from the indeterminate PROP path specifically', () => {
    // The reason this is a separate prop rather than `modelValue?: boolean | null`.
    // Widening the model widens the emit, and butiq's 12 call sites all bind
    // v-model to a boolean ref.
    //
    // SCOPED DELIBERATELY. This was titled "emits a BOOLEAN, so a typed v-model
    // still compiles", which claimed more than it checked: it only exercises the
    // `indeterminate` prop, and review found a path (toggle-indeterminate) where
    // the emit genuinely was not boolean. The blanket claim now lives in the
    // suite below, which tests every reachable path.
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

/**
 * QCheckbox is tri-state and value-configurable, and all four relevant props are
 * undeclared here, so they used to reach Quasar through $attrs while
 * `defineEmits` promised `[value: boolean]`.
 *
 * TWO EARLIER VERSIONS OF THIS SUITE WERE WRONG, BOTH IN THE SAME DIRECTION:
 *   1. A test titled "emits a BOOLEAN" that only exercised the `indeterminate`
 *      prop — its NAME asserted the contract, its BODY checked one path.
 *   2. Its replacement clicked from `true` with `toggle-indeterminate`, on the
 *      belief that Quasar cycles false -> true -> null. IT DOES NOT: a click
 *      from true returns falseValue (use-checkbox.js:178-181), and null is
 *      reached from FALSE (:182-190). So it asserted `not.toBeNull()` on a value
 *      that was always false, and review proved the whole suite stayed green
 *      with the fix deleted.
 *
 * These click from FALSE, which is the state that actually produced null.
 */
describe('NsCheckbox holds its boolean contract on every reachable path', () => {
  beforeEach(() => __resetAttrConflictWarnings())

  const clickAndRead = (props: Record<string, unknown>, attrs: Record<string, unknown> = {}) => {
    const wrapper = mount(NsCheckbox, { props, attrs })
    wrapper.find('.ns-checkbox').trigger('click')
    return wrapper.emitted('update:modelValue')?.[0]?.[0]
  }

  it.each([
    ['from false', { modelValue: false }],
    ['from true', { modelValue: true }],
    ['from the partial state', { indeterminate: true }],
  ])('emits a boolean %s', (_label, props) => {
    expect(typeof clickAndRead(props)).toBe('boolean')
  })

  it('emits a boolean from FALSE with toggle-indeterminate — the path that produced null', () => {
    // The one that matters. Quasar reaches its indeterminate value from false,
    // not from true, so this is the click the contract used to break on.
    const value = clickAndRead({ modelValue: false }, { 'toggle-indeterminate': true })
    expect(value, 'null reached a consumer whose handler is typed boolean').not.toBeNull()
    expect(typeof value).toBe('boolean')
  })

  it('STAYS USABLE with toggle-indeterminate, rather than sticking at unchecked', () => {
    // Coercing null -> false kept the type honest and bricked the control: the
    // model never advanced past false and the checkbox stopped responding
    // entirely. Stripping the attr keeps it a working two-state toggle, which a
    // type-only assertion cannot tell apart from the dead version.
    const wrapper = mount(NsCheckbox, {
      props: { modelValue: false },
      attrs: { 'toggle-indeterminate': true },
    })
    expect(clickAndRead({ modelValue: false }, { 'toggle-indeterminate': true })).toBe(true)
    expect(clickAndRead({ modelValue: true }, { 'toggle-indeterminate': true })).toBe(false)
    expect(wrapper.find('.ns-checkbox').attributes('aria-checked')).toBe('false')
  })

  it('does not let true-value leak a STRING into a boolean emit', () => {
    // A second route to the same broken contract, and the reason the fix strips
    // rather than coerces: `?? false` only intercepts null/undefined, so
    // true-value="yes" sailed through it.
    const value = clickAndRead({ modelValue: false }, { 'true-value': 'yes' })
    expect(typeof value, `emitted ${JSON.stringify(value)} for a boolean-typed emit`).toBe(
      'boolean',
    )
  })

  it.each([
    ['toggle-indeterminate', { 'toggle-indeterminate': true }],
    ['toggleIndeterminate', { toggleIndeterminate: true }],
    ['true-value', { 'true-value': 'yes' }],
    ['indeterminate-value', { 'indeterminate-value': 'maybe' }],
  ])('warns that %s was ignored', (name, attrs) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsCheckbox, { attrs })
    const text = warn.mock.calls.flat().join(' ')
    expect(text).toContain(name)
    expect(text, 'the warning must say it was IGNORED, not merely that it conflicts').toContain(
      'IGNORED',
    )
    warn.mockRestore()
  })

  it('describes a BEHAVIOUR conflict, not a colour-contrast one', () => {
    // The composable was written for NsButton, where every conflict is two
    // styling systems fighting. Its stock sentence about "unreadable output
    // (e.g. matching text and background colours)" would send someone hunting a
    // contrast bug they do not have.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsCheckbox, { attrs: { 'toggle-indeterminate': true } })
    const text = warn.mock.calls.flat().join(' ')
    expect(text).not.toContain('background colours')
    expect(text).toContain('changes behaviour')
    warn.mockRestore()
  })
})
