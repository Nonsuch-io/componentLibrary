import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsButton from './NsButton.vue'
import { __resetAttrConflictWarnings } from '@/composables/useNsAttrConflictWarning'

describe('NsButton', () => {
  beforeEach(() => __resetAttrConflictWarnings())
  const mountButton = (props = {}, slots = {}) => {
    return mount(NsButton, { props, slots })
  }

  it('renders with default slot content', () => {
    const wrapper = mountButton({}, { default: 'Click Me' })
    expect(wrapper.text()).toContain('Click Me')
  })

  it('applies default props', () => {
    const wrapper = mountButton()
    const qBtn = wrapper.find('.q-btn')
    expect(qBtn.exists()).toBe(true)
    expect(qBtn.classes()).toContain('q-btn--unelevated')
    expect(qBtn.classes()).toContain('q-btn--no-uppercase')
  })

  it('applies default variant class', () => {
    const wrapper = mountButton()
    expect(wrapper.find('.ns-btn--primary').exists()).toBe(true)
  })

  it('applies variant class', () => {
    const wrapper = mountButton({ variant: 'negative' })
    expect(wrapper.find('.ns-btn--negative').exists()).toBe(true)
  })

  it('applies size class', () => {
    const wrapper = mountButton({ size: 'lg' })
    expect(wrapper.find('.ns-btn--lg').exists()).toBe(true)
  })

  it('applies icon-only class', () => {
    // Named on purpose. Without it this emits the real unnamed-icon warning into
    // the suite's stderr — noise from a test about a CSS class, in a PR whose
    // whole point is that warnings should be readable when they matter. The
    // warning has its own tests below.
    // mountButton's second argument is SLOTS, not attrs — so this mounts
    // directly rather than quietly passing a bogus slot named "aria-label".
    const wrapper = mount(NsButton, {
      props: { iconOnly: true },
      attrs: { 'aria-label': 'Send' },
    })
    expect(wrapper.find('.ns-btn--icon-only').exists()).toBe(true)
  })

  it('passes through additional QBtn attributes', () => {
    const wrapper = mountButton({ disable: true })
    expect(wrapper.find('.q-btn').classes()).toContain('disabled')
  })

  it('shows loading state when loading prop is true', () => {
    const wrapper = mountButton({ loading: true })
    expect(wrapper.find('.q-spinner').exists() || wrapper.find('.q-spinner-dots').exists()).toBe(
      true,
    )
  })

  describe('accessibility', () => {
    it('sets aria-busy="true" when loading', () => {
      const wrapper = mountButton({ loading: true })
      expect(wrapper.find('.q-btn').attributes('aria-busy')).toBe('true')
    })

    it('sets aria-busy="false" when not loading', () => {
      const wrapper = mountButton({ loading: false })
      expect(wrapper.find('.q-btn').attributes('aria-busy')).toBe('false')
    })
  })

  // componentLibrary-nk3: NsButton declares neither `color` nor `flat` (and
  // friends), so they fall through $attrs to QBtn and can silently collide
  // with our own `.ns-btn--*` variant CSS (e.g. flat + color="primary"
  // rendering orange text on an orange background). This does NOT make the
  // combination work — it only makes the collision loud in dev.
  describe('Quasar styling attr conflicts (componentLibrary-nk3)', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    const conflictingAttrs: Array<Record<string, unknown>> = [
      { color: 'primary' },
      { 'text-color': 'primary' },
      { textColor: 'primary' },
      { flat: true },
      { outline: true },

      { push: true },
      { glossy: true },
    ]

    it.each(conflictingAttrs)('warns in dev when %o is passed', (attrs) => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(NsButton, { attrs, slots: { default: 'Click Me' } })

      expect(warnSpy).toHaveBeenCalled()
      const message = warnSpy.mock.calls[0][0] as string
      expect(message).toContain('NsButton')
      expect(message).toContain('variant')
    })

    it('does not warn for ordinary passthrough attrs', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(NsButton, {
        attrs: { 'aria-label': 'Submit', 'data-testid': 'submit-btn', to: '/home', type: 'submit' },
        slots: { default: 'Click Me' },
      })

      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('does not warn when only variant is used', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(NsButton, { props: { variant: 'tertiary' }, slots: { default: 'Click Me' } })

      expect(warnSpy).not.toHaveBeenCalled()
    })

    it('does not warn in production, proving the NODE_ENV guard actually gates the check', () => {
      vi.stubEnv('NODE_ENV', 'production')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(NsButton, { attrs: { flat: true, color: 'primary' }, slots: { default: 'Click Me' } })

      expect(warnSpy).not.toHaveBeenCalled()
      vi.unstubAllEnvs()
    })
  })
})

/**
 * componentLibrary-057 prerequisite. An `iconOnly` button with no accessible
 * name announces as "button" and nothing else — axe reports button-name, and
 * nothing else in this repo can see it.
 */
describe('NsButton icon-only accessible name', () => {
  beforeEach(() => __resetAttrConflictWarnings())

  it('warns when iconOnly has no name, because the library cannot invent one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { props: { iconOnly: true } })
    expect(warn.mock.calls.flat().join(' ')).toContain('no accessible name')
    warn.mockRestore()
  })

  it.each(['aria-label', 'aria-labelledby', 'title'])('accepts %s as the name', (attr) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { props: { iconOnly: true }, attrs: { [attr]: 'Send message' } })
    expect(warn.mock.calls.flat().join(' ')).not.toContain('no accessible name')
    warn.mockRestore()
  })

  it('says nothing for a normal labelled button', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { slots: { default: 'Send' } })
    expect(warn.mock.calls.flat().join(' ')).not.toContain('no accessible name')
    warn.mockRestore()
  })

  it.each(['', '   '])('treats aria-label=%p as UNNAMED, because it is', (empty) => {
    // `!== undefined` passed an empty label while providing no accessible name —
    // the exact defect this guard exists for. Realistic: :aria-label="t('send')"
    // resolves to '' before translations load.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { props: { iconOnly: true }, attrs: { 'aria-label': empty } })
    expect(warn.mock.calls.flat().join(' ')).toContain('no accessible name')
    warn.mockRestore()
  })

  it('does NOT warn when the default slot supplies the name', () => {
    // <NsButton icon-only>Save</NsButton> has a name from its content, and the
    // visually-hidden-span pattern is a legitimate alternative to aria-label.
    // A guard that cries wolf gets ignored for the cases that matter.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { props: { iconOnly: true }, slots: { default: 'Save' } })
    expect(warn.mock.calls.flat().join(' ')).not.toContain('no accessible name')
    warn.mockRestore()
  })

  it('warns ONCE per instance, not once per re-render', async () => {
    // watchEffect re-ran on every unrelated attrs change: four warnings for one
    // unfixed button across three re-renders. A v-for over reactive data would
    // bury the signal in copies of itself.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const wrapper = mount(NsButton, { props: { iconOnly: true }, attrs: { 'data-n': '0' } })
    for (let i = 1; i <= 3; i++) await wrapper.setProps({ 'data-n': String(i) } as never)
    const hits = warn.mock.calls.flat().filter((c) => String(c).includes('no accessible name'))
    expect(hits, 'the same unfixed button warned on every re-render').toHaveLength(1)
    warn.mockRestore()
  })

  it('names the ACTION in its advice, not the icon', () => {
    // A warning that says "add a label" and stops produces labels like "trash".
    // The useful half is what to put in it.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mount(NsButton, { props: { iconOnly: true } })
    expect(warn.mock.calls.flat().join(' ')).toContain('Delete item')
    warn.mockRestore()
  })
})
