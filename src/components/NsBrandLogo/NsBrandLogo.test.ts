import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBrandLogo from './NsBrandLogo.vue'

const SRC = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>'

/** Every mount that omits both `ratio` and `height` trips the sizing warning by
 *  design, so the specs that are not ABOUT that warning pass a ratio. */
const sized = { src: SRC, alt: 'Acme', ratio: 2.62 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('NsBrandLogo', () => {
  describe('rendering', () => {
    it('should render the image when src is provided', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('img').attributes('src')).toBe(SRC)
    })

    it('should apply the root class', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.classes()).toContain('ns-brand-logo')
    })

    it('should render the image element class', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('.ns-brand-logo__image').exists()).toBe(true)
    })
  })

  describe('sizing', () => {
    it('should convert a numeric width to pixels', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, width: 72 } })
      expect(wrapper.find('[role="img"]').attributes('style')).toContain('width: 72px')
    })

    it('should pass a string width through unchanged', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, width: '4rem' } })
      expect(wrapper.find('[role="img"]').attributes('style')).toContain('width: 4rem')
    })

    it('should convert a numeric height to pixels', () => {
      const wrapper = mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', height: 27 } })
      expect(wrapper.find('[role="img"]').attributes('style')).toContain('height: 27px')
    })

    it('should reserve a box matching the given ratio rather than QImg 16:9 default', () => {
      // 100 / 2.62 = 38.16% — the wordmark's true box. Without `ratio` QImg
      // reserves 56.25% (16:9) and letterboxes the logo in dead space.
      const wrapper = mount(NsBrandLogo, { props: sized })
      const filler = wrapper.find('[role="img"] > div:first-child')
      expect(filler.attributes('style')).toContain('padding-bottom: 38.1')
    })
  })

  describe('logo-appropriate QImg defaults', () => {
    it('should contain rather than crop the logo', () => {
      // QImg defaults to fit="cover", which CROPS a wordmark to fill its box.
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('img').attributes('style')).toContain('object-fit: contain')
    })

    it('should load eagerly because a logo is above-the-fold chrome', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('img').attributes('loading')).toBe('eager')
    })

    it('should not render a spinner', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('.q-spinner').exists()).toBe(false)
    })

    it('should not fade the image in', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('img').classes()).toContain('q-img__image--without-transition')
    })
  })

  describe('link', () => {
    it('should render an anchor when href is provided', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' } })
      expect(wrapper.element.tagName).toBe('A')
      expect(wrapper.attributes('href')).toBe('/')
    })

    it('should not render an anchor when href is absent', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('should still render the image inside the anchor', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' } })
      expect(wrapper.find('a img').attributes('src')).toBe(SRC)
    })
  })

  describe('passthrough', () => {
    it('should forward unrecognised attributes to the image', () => {
      const wrapper = mount(NsBrandLogo, {
        props: sized,
        attrs: { 'data-testid': 'brand' },
      })
      expect(wrapper.find('[data-testid="brand"]').exists()).toBe(true)
    })

    it('should let a consumer override a logo default', () => {
      const wrapper = mount(NsBrandLogo, { props: sized, attrs: { fit: 'cover' } })
      expect(wrapper.find('img').attributes('style')).toContain('object-fit: cover')
    })

    it('should keep passthrough attributes off the anchor', () => {
      // The anchor is navigation; the attrs belong to the image it wraps.
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/' },
        attrs: { 'data-testid': 'brand' },
      })
      expect(wrapper.attributes('data-testid')).toBeUndefined()
      expect(wrapper.find('a [data-testid="brand"]').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should name the image with alt', () => {
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Acme')
    })

    it('should name the link from the logo it wraps', () => {
      // QImg hides the inner <img> and puts the name on a role="img" wrapper, so
      // the anchor's accessible name comes from that descendant, not from alt.
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' } })
      expect(wrapper.find('a [role="img"]').attributes('aria-label')).toBe('Acme')
    })

    it('should name the anchor itself, not only the image it wraps', () => {
      // Relying on name-from-content would leave the link ANONYMOUS the moment a
      // consumer marks the image decorative — the combination below.
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' } })
      expect(wrapper.attributes('aria-label')).toBe('Acme')
    })

    it('should keep the link named when the image is marked decorative', () => {
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/' },
        attrs: { 'aria-hidden': 'true' },
      })
      expect(wrapper.attributes('aria-label')).toBe('Acme')
    })

    it('should warn when a linked logo has no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, ratio: 2.62, href: '/' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsBrandLogo]'))
    })

    it('should allow a decorative logo to be hidden from assistive tech', () => {
      const wrapper = mount(NsBrandLogo, {
        props: { src: SRC, ratio: 2.62 },
        attrs: { 'aria-hidden': 'true' },
      })
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBe('true')
    })
  })

  describe('sizing warning', () => {
    it('should warn when neither ratio nor height is given', () => {
      // QImg falls back to a 16:9 box, which no brand lockup is. The logo then
      // renders in dead space and snaps to its real box on load.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', width: 72 } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsBrandLogo]'))
    })

    it('should not warn when ratio is given', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: sized })
      expect(warn).not.toHaveBeenCalled()
    })

    it('should not warn when height is given', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', height: 27 } })
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
