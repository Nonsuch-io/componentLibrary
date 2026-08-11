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
 * `toggle-indeterminate` is Quasar's own tri-state cycling, and it reaches this
 * component through $attrs because it is undeclared. Found in review of PR #262
 * and PRE-DATING it: clicking then cycled false -> true -> null while
 * `defineEmits` promised `[value: boolean]`, so a typed handler received a value
 * TypeScript had told the consumer was impossible.
 *
 * The previous test titled "emits a BOOLEAN" only exercised the `indeterminate`
 * prop path, so its NAME asserted more than it checked — the exact shape of
 * unfalsifiable check this repo keeps finding. These cover the path that could
 * actually break it.
 */
describe('NsCheckbox emit type holds on every reachable path', () => {
  // The conflict warning dedupes per (component, attr) at MODULE level, so an
  // earlier test in this file that mounts with `toggle-indeterminate` silently
  // suppresses the one asserting it — the exact order-dependence the composable's
  // own docstring warns about, walked into anyway.
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

  it('emits a boolean even with toggle-indeterminate, where Quasar would emit null', () => {
    // Reaches the third state directly: Quasar cycles false -> true -> null, so
    // starting from true puts the next click on the null step.
    const value = clickAndRead({ modelValue: true }, { 'toggle-indeterminate': true })
    expect(value, 'null reached a consumer whose handler is typed boolean').not.toBeNull()
    expect(typeof value).toBe('boolean')
  })

  it('warns that toggle-indeterminate is not supported, rather than silently coercing', () => {
    // Coercion alone would turn their three-state cycle into a two-state one with
    // no explanation — correct types, quietly wrong behaviour.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsCheckbox, { attrs: { 'toggle-indeterminate': true } })
    expect(warn.mock.calls.flat().join(' ')).toContain('toggle-indeterminate')
    warn.mockRestore()
  })
})
