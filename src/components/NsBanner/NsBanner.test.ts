import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import NsBanner from './NsBanner.vue'

// Stub QBanner to render all slots directly (avoids v8 template branch artifacts)
const QBannerStub = defineComponent({
  name: 'QBanner',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: ['q-banner', ...(Array.isArray(attrs.class) ? attrs.class : [attrs.class])].filter(
            Boolean,
          ),
        },
        [
          slots.avatar ? h('div', { class: 'q-banner__avatar' }, slots.avatar()) : null,
          slots.default?.(),
          slots.action ? h('div', { class: 'q-banner__action' }, slots.action()) : null,
        ],
      )
  },
})

const sfcSource = readFileSync(resolve(__dirname, 'NsBanner.vue'), 'utf-8')

describe('NsBanner', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsBanner, { slots: { default: 'Notice' } })
    expect(wrapper.find('.ns-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Notice')
  })

  it('applies info type class by default', () => {
    const wrapper = mount(NsBanner, { slots: { default: 'Info' } })
    expect(wrapper.find('.ns-banner--info').exists()).toBe(true)
  })

  it('applies positive type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'positive' },
      slots: { default: 'Saved!' },
    })
    expect(wrapper.find('.ns-banner--positive').exists()).toBe(true)
  })

  it('applies warning type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'warning' },
      slots: { default: 'Careful' },
    })
    expect(wrapper.find('.ns-banner--warning').exists()).toBe(true)
  })

  it('applies negative type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'negative' },
      slots: { default: 'Failed' },
    })
    expect(wrapper.find('.ns-banner--negative').exists()).toBe(true)
  })

  it('renders action slot', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        action: '<button class="test-action">Dismiss</button>',
      },
    })
    expect(wrapper.find('.test-action').exists()).toBe(true)
  })

  it('renders avatar slot', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        avatar: '<span class="test-avatar">!</span>',
      },
    })
    expect(wrapper.find('.test-avatar').exists()).toBe(true)
  })

  it('renders both avatar and action slots together', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        avatar: '<span class="combo-avatar">A</span>',
        action: '<button class="combo-action">OK</button>',
      },
    })
    expect(wrapper.find('.combo-avatar').exists()).toBe(true)
    expect(wrapper.find('.combo-action').exists()).toBe(true)
  })

  describe('with QBanner stub (template branch coverage)', () => {
    const stubs = { QBanner: QBannerStub }

    it('renders without optional slots', () => {
      const wrapper = mount(NsBanner, {
        slots: { default: 'Stub notice' },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('Stub notice')
    })

    it('renders avatar slot through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'With avatar',
          avatar: '<span class="stub-avatar">A</span>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-avatar').exists()).toBe(true)
    })

    it('renders action slot through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'With action',
          action: '<button class="stub-action">Go</button>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-action').exists()).toBe(true)
    })

    it('renders both slots through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'Full',
          avatar: '<span class="stub-av">X</span>',
          action: '<button class="stub-act">Y</button>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-av').exists()).toBe(true)
      expect(wrapper.find('.stub-act').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has role="status" and aria-live="polite" for info type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'info' },
        slots: { default: 'Info message' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('status')
      expect(banner.attributes('aria-live')).toBe('polite')
    })

    it('has role="status" and aria-live="polite" for positive type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'positive' },
        slots: { default: 'Saved!' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('status')
      expect(banner.attributes('aria-live')).toBe('polite')
    })

    it('has role="alert" and aria-live="assertive" for warning type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'warning' },
        slots: { default: 'Careful' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('alert')
      expect(banner.attributes('aria-live')).toBe('assertive')
    })

    it('has role="alert" and aria-live="assertive" for negative type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'negative' },
        slots: { default: 'Failed' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('alert')
      expect(banner.attributes('aria-live')).toBe('assertive')
    })

    it('does not mark polite types (info, positive) as assertive', () => {
      // ADR 0002 rule about aria-live: assertive INTERRUPTS a screen reader, so
      // it must stay scoped to warning/negative and not creep onto the other
      // two types as a "free upgrade" when the vocabulary changes.
      for (const type of ['info', 'positive'] as const) {
        const wrapper = mount(NsBanner, { props: { type }, slots: { default: 'x' } })
        const banner = wrapper.find('.q-banner')
        expect(banner.attributes('aria-live')).not.toBe('assertive')
        expect(banner.attributes('role')).not.toBe('alert')
      }
    })
  })

  describe('token mapping (componentLibrary-whr)', () => {
    // Rule 3 of ADR 0002: the prop name IS the design system's name, and the
    // wrapper must not rename it internally. This reads NsBanner.vue's own
    // source (the same technique NsButton.contrast.test.ts uses) so the test
    // fails the moment a type's class and the token it reads for that class
    // disagree again — which is exactly how this bug shipped the first time.
    const source = readFileSync(resolve(__dirname, 'NsBanner.vue'), 'utf-8')

    function extractDeclaration(className: string, property: 'background-color' | 'color'): string {
      const blockMatch = source.match(
        new RegExp(`&--${className}\\s*\\n([\\s\\S]*?)(?=\\n\\s*&--|\\n<\\/style>)`),
      )
      if (!blockMatch) throw new Error(`.ns-banner--${className} block not found in NsBanner.vue`)
      // `color:` alone would also match inside `background-color:` — exclude that.
      const propPattern =
        property === 'color' ? `(?<!background-)color` : property.replace('-', '\\-')
      const propMatch = blockMatch[1].match(new RegExp(`${propPattern}:\\s*var\\((--ns-[\\w-]+)`))
      if (!propMatch) {
        throw new Error(
          `.ns-banner--${className} does not declare ${property} from a var(--ns-*) token`,
        )
      }
      return propMatch[1]
    }

    // INK IS text-on-bg-*, AND THAT IS THE POINT OF THIS TEST NOW.
    // It previously pinned --ns-color-text-X, which is a coloured text token for
    // a NEUTRAL surface: on the bg-X fill it measured 1.36:1 in light and, in
    // dark, the identical hex for both (componentLibrary-2p1). The pairing this
    // test locked was the bug. It is not --ns-color-text-on-X either — that ink
    // belongs to the SOLID status-X surface and is 1.25:1 on the pale fill.
    it.each([
      ['info', '--ns-color-bg-info', '--ns-color-text-on-bg-info'],
      ['positive', '--ns-color-bg-positive', '--ns-color-text-on-bg-positive'],
      ['warning', '--ns-color-bg-warning', '--ns-color-text-on-bg-warning'],
      ['negative', '--ns-color-bg-negative', '--ns-color-text-on-bg-negative'],
    ])('%s class resolves to %s / %s — not a renamed pair', (className, bgToken, textToken) => {
      expect(extractDeclaration(className, 'background-color')).toBe(bgToken)
      expect(extractDeclaration(className, 'color')).toBe(textToken)
    })
  })

  describe('legacy prop values (componentLibrary-whr — clean rename, no alias)', () => {
    // Kale confirmed backwards compatibility is not a concern and explicitly
    // rejected an alias ("an alias would preserve exactly the confusion this
    // bead is about"). The old `success`/`error` values are therefore NOT
    // recognised at runtime: they fall outside the CSS class map and render
    // with no type-specific class, matching how any other unrecognised value
    // behaves. This test documents that choice so a future change to add a
    // silent alias is a deliberate decision, not an accident.
    it('does not style a banner passed the old "success" value', () => {
      const wrapper = mount(NsBanner, {
        // @ts-expect-error — intentionally passing a value outside the new union
        props: { type: 'success' },
        slots: { default: 'Legacy' },
      })
      // The class binding is a raw string interpolation, so the literal
      // (unrecognised) class DOES land in the DOM — it just matches no CSS
      // rule in NsBanner.vue's <style> block, so the banner renders with no
      // background/text colour at all. Asserting the class is absent would
      // be the wrong claim; the actual defect is that it is unstyled.
      expect(wrapper.find('.ns-banner--success').exists()).toBe(true)
      expect(wrapper.find('.ns-banner--positive').exists()).toBe(false)
    })

    it('does not style a banner passed the old "error" value', () => {
      const wrapper = mount(NsBanner, {
        // @ts-expect-error — intentionally passing a value outside the new union
        props: { type: 'error' },
        slots: { default: 'Legacy' },
      })
      expect(wrapper.find('.ns-banner--error').exists()).toBe(true)
      expect(wrapper.find('.ns-banner--negative').exists()).toBe(false)
    })
    it('has no style block for the old vocabulary, and no stray variants', () => {
      // THE DOM ASSERTIONS ABOVE CANNOT FAIL AGAINST A CSS REVIVAL. Review
      // proved it: reintroducing a `&--success` rule left all 32 tests green,
      // including the one named "does not style a banner passed the old value".
      // The class lands in the DOM either way; what changed was whether it
      // matched anything. The plausible regression is exactly that — a minimal
      // patch answering a "type=success renders unstyled" report by adding the
      // block back.
      //
      // Enumerating the variant blocks also catches a stray new one, which a
      // pair of negative assertions never would.
      const style = sfcSource.slice(sfcSource.indexOf('<style'))
      const variants = [...style.matchAll(/^\s*&--([a-z]+)/gm)].map((m) => m[1]).sort()
      expect(variants, `style block defines variants: ${variants.join(', ')}`).toEqual([
        'info',
        'negative',
        'positive',
        'warning',
      ])
    })

    it('downgrades ARIA for an unrecognised value, and says so', () => {
      // The straggler failure is worse than unstyled: a legacy type="error"
      // takes the else branch of both computeds, so an ERROR banner announces
      // as polite status. Pinned rather than left incidental.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsBanner, { props: { type: 'error' as never } })
      const text = warn.mock.calls.flat().join(' ')
      warn.mockRestore()

      expect(wrapper.attributes('role'), 'legacy error still announced as alert').toBe('status')
      expect(wrapper.attributes('aria-live')).toBe('polite')
      expect(text, 'no warning for an unrecognised type').toContain('not a valid NsBannerType')
    })
  })
})
