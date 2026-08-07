import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsInput from '../components/NsInput/NsInput.vue'
import NsButton from '../components/NsButton/NsButton.vue'
import NsCheckbox from '../components/NsCheckbox/NsCheckbox.vue'
import NsSelect from '../components/NsSelect/NsSelect.vue'
import { __resetNsDisabledWarnings } from './useNsDisabled'

describe('useNsDisabled', () => {
  beforeEach(() => {
    // The warning dedupes per component, and that state is module-level — an
    // earlier test's warning would silently suppress a later assertion.
    __resetNsDisabledWarnings()
  })

  const disableOf = (w: ReturnType<typeof mount>) =>
    w.findComponent({ name: 'QInput' }).props('disable')

  it('honours the Quasar spelling', () => {
    expect(disableOf(mount(NsInput, { props: { disable: true } }))).toBe(true)
  })

  it('treats the `disabled` spelling as disable', () => {
    // Without this, `disabled` lands on QInput's wrapper div and the field stays
    // fully editable — measured in a browser, componentLibrary-ob8.
    expect(disableOf(mount(NsInput, { attrs: { disabled: true } }))).toBe(true)
  })

  it('treats a bare `disabled` attribute (empty string) as disable', () => {
    expect(disableOf(mount(NsInput, { attrs: { disabled: '' } }))).toBe(true)
  })

  it('does not disable when neither is given', () => {
    expect(disableOf(mount(NsInput))).toBe(false)
  })

  it('does not disable on `disabled="false"`', () => {
    expect(disableOf(mount(NsInput, { attrs: { disabled: 'false' } }))).toBe(false)
  })

  it('warns once, naming the component', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsInput, { attrs: { disabled: true } })
    mount(NsInput, { attrs: { disabled: true } })
    const text = warn.mock.calls.flat().join(' ')
    expect(text).toContain('[NsInput]')
    expect(text).toContain('disable')
    expect(warn.mock.calls.length, 'should dedupe per component').toBe(1)
    warn.mockRestore()
  })

  it('does not warn when the correct spelling is used', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsInput, { props: { disable: true } })
    expect(warn.mock.calls.flat().join(' ')).not.toContain('componentLibrary-ob8')
    warn.mockRestore()
  })

  // Different Quasar bases exercise different failure shapes: QCheckbox and
  // QSelect render a wrapper around a nested control (the severe case — the
  // control stays fully live), while QBtn renders a real <button> (the mild
  // case — `disabled` already disables it natively, so only the aliasing
  // and warning behaviour is new). See componentLibrary-ob8.
  describe('across Quasar bases with different disabled shapes', () => {
    it('QCheckbox (wrapper-around-control): honours `disable`', () => {
      const disable = mount(NsCheckbox, { props: { disable: true } })
        .findComponent({ name: 'QCheckbox' })
        .props('disable')
      expect(disable).toBe(true)
    })

    it('QCheckbox (wrapper-around-control): aliases `disabled`', () => {
      const disable = mount(NsCheckbox, { attrs: { disabled: true } })
        .findComponent({ name: 'QCheckbox' })
        .props('disable')
      expect(disable).toBe(true)
    })

    it('QSelect (wrapper-around-control): honours `disable`', () => {
      const disable = mount(NsSelect, { props: { disable: true } })
        .findComponent({ name: 'QSelect' })
        .props('disable')
      expect(disable).toBe(true)
    })

    it('QSelect (wrapper-around-control): aliases `disabled`', () => {
      const disable = mount(NsSelect, { attrs: { disabled: true } })
        .findComponent({ name: 'QSelect' })
        .props('disable')
      expect(disable).toBe(true)
    })

    it('QBtn (native button): honours `disable`', () => {
      const disable = mount(NsButton, { props: { disable: true } })
        .findComponent({ name: 'QBtn' })
        .props('disable')
      expect(disable).toBe(true)
    })

    it('QBtn (native button): aliases `disabled`', () => {
      const disable = mount(NsButton, { attrs: { disabled: true } })
        .findComponent({ name: 'QBtn' })
        .props('disable')
      expect(disable).toBe(true)
    })
  })

  describe('coercion matches Vue, with one deliberate carve-out', () => {
    // Review measured `:disabled="0"` rendering a DISABLED field, and the warning
    // then claiming it "has been treated as disable for you" — affirmatively
    // wrong for a falsy binding. Vue's own rule is `!!value || value === ''`.
    it.each([
      ['0 (a falsy count)', 0, false],
      ['NaN', Number.NaN, false],
      ['null', null, false],
      ['false', false, false],
      ["the string 'false'", 'false', false],
      ['empty string (bare attribute)', '', true],
      ['true', true, true],
      ["the string 'true'", 'true', true],
    ])('%s -> disable %s', (_label, value, expected) => {
      expect(disableOf(mount(NsInput, { attrs: { disabled: value } }))).toBe(expected)
    })
  })

  describe('the raw attribute does not also reach the DOM', () => {
    // On NsButton, QBtn renders a real <button>, so a stray disabled="false"
    // falling through set element.disabled = true while our resolved prop said
    // false — a button styled fully enabled that ignores clicks. Every earlier
    // test asserted at the Vue-prop level and could not see it.
    it('does not leave a stray disabled attribute on the rendered element', () => {
      const w = mount(NsButton, { attrs: { disabled: 'false' } })
      expect(w.attributes('disabled'), 'raw attribute leaked through $attrs').toBeUndefined()
    })

    it('still forwards other attrs untouched', () => {
      // Asserted against the rendered output, not the ROOT element: QInput places
      // unknown attrs on its inner <input>, not the outer <label>. Checking the
      // root failed while the behaviour was correct.
      const w = mount(NsInput, { attrs: { disabled: true, 'data-test': 'keep-me' } })
      expect(w.html(), 'unrelated attrs must survive the disabled filtering').toContain('keep-me')
    })
  })
})
