import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import NsText from './NsText.vue'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('NsText', () => {
  it('renders default slot content', () => {
    const wrapper = mount(NsText, { slots: { default: 'Hello' } })
    expect(wrapper.text()).toContain('Hello')
  })

  it('renders a span with body-md by default', () => {
    const wrapper = mount(NsText)
    expect(wrapper.element.tagName).toBe('SPAN')
    expect(wrapper.classes()).toContain('ns-body-md')
  })

  it('applies the ns-text hook class', () => {
    expect(mount(NsText).classes()).toContain('ns-text')
  })

  it('passes attributes through to the rendered element', () => {
    const wrapper = mount(NsText, { attrs: { 'data-testid': 'greeting' } })
    expect(wrapper.attributes('data-testid')).toBe('greeting')
  })

  describe('variant and element are independent', () => {
    it('renders a heading element with body type', () => {
      const wrapper = mount(NsText, { props: { as: 'h2', variant: 'body-md' } })
      expect(wrapper.element.tagName).toBe('H2')
      expect(wrapper.classes()).toContain('ns-body-md')
      expect(wrapper.classes()).not.toContain('ns-heading-md')
    })

    it('renders a span with heading type', () => {
      const wrapper = mount(NsText, { props: { as: 'span', variant: 'heading-xl' } })
      expect(wrapper.element.tagName).toBe('SPAN')
      expect(wrapper.classes()).toContain('ns-heading-xl')
    })

    it('does not infer an element from the variant', () => {
      // The regression this guards: a "helpful" mapping that renders <h1> for
      // heading-xl would give a page three h1s the moment two titles appear.
      const wrapper = mount(NsText, { props: { variant: 'heading-2xl' } })
      expect(wrapper.element.tagName).toBe('SPAN')
    })
  })

  describe('tone', () => {
    it('sets no colour when tone is omitted, so text inherits', () => {
      const wrapper = mount(NsText)
      expect(wrapper.attributes('style')).toBeUndefined()
    })

    it('resolves a tone to its text token', () => {
      const wrapper = mount(NsText, { props: { tone: 'brand' } })
      expect(wrapper.attributes('style')).toContain('var(--ns-color-text-brand)')
    })
  })

  describe('dev warnings', () => {
    it('warns that an unknown variant renders unstyled', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsText, {
        props: { variant: 'heading-huge' as unknown as 'heading-xl' },
      })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown variant "heading-huge"'))
    })

    it('warns that an unknown tone silently inherits colour', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsText, { props: { tone: 'branded' as unknown as 'brand' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown tone "branded"'))
    })

    it('stays silent for every documented variant and tone', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      for (const variant of VARIANTS) mount(NsText, { props: { variant } })
      for (const tone of TONES) mount(NsText, { props: { tone } })
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('every variant has a rule to match', () => {
    // THE FAILURE THIS EXISTS FOR: `variant` is a union in TypeScript and a
    // class name at runtime. A value in the union with no rule in
    // typography.css type-checks, renders, passes every mount assertion above,
    // and displays at the browser default. Only the stylesheet can falsify it.
    const css = readFileSync(resolve(__dirname, '../../tokens/typography.css'), 'utf8')

    it.each(VARIANTS)('typography.css defines .ns-%s', (variant) => {
      expect(css).toContain(`.ns-${variant} {`)
    })

    it('checks a non-empty list', () => {
      expect(VARIANTS.length).toBeGreaterThan(0)
    })
  })
})

const VARIANTS = [
  'caption',
  'overline',
  'overline-lg',
  'overline-md',
  'overline-md-bold',
  'body-sm',
  'body-md',
  'label-xs',
  'label-sm',
  'label-md',
  'heading-sm',
  'heading-sm-regular',
  'heading-md',
  'heading-md-regular',
  'heading-lg',
  'heading-lg-regular',
  'heading-xl',
  'heading-xl-regular',
  'heading-2xl',
  'heading-2xl-regular',
  'display',
] as const

const TONES = [
  'primary',
  'secondary',
  'tertiary',
  'brand',
  'accent',
  'inverse',
  'positive',
  'negative',
  'warning',
  'info',
  'disabled',
  'link',
] as const
