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

    it('should let a consumer override a logo default through imgProps', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, imgProps: { fit: 'cover' } } })
      expect(wrapper.find('img').attributes('style')).toContain('object-fit: cover')
    })

    it('should apply imgProps to the image in the linked variant too', () => {
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/', imgProps: { fit: 'cover' } },
      })
      expect(wrapper.find('a img').attributes('style')).toContain('object-fit: cover')
    })

    it('should route layout and selector attrs to the anchor when linked', () => {
      // The anchor is the element that participates in the CONSUMER'S layout —
      // it is what sits in NsSiteHeader's logo slot. A utility class aimed at
      // positioning the link is inert one level down on the image.
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/' },
        attrs: { 'data-testid': 'brand', id: 'logo-link', class: 'ml-auto' },
      })
      expect(wrapper.attributes('data-testid')).toBe('brand')
      expect(wrapper.attributes('id')).toBe('logo-link')
      expect(wrapper.classes()).toContain('ml-auto')
    })

    it('should fire a click handler bound to the anchor', async () => {
      // The regression that shipped in the first attrs fix: `onClick` landed on the
      // inner image div, so clicking the LINK never called it.
      const onClick = vi.fn()
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' }, attrs: { onClick } })
      await wrapper.find('a').trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should route link-behaviour attrs to the anchor', () => {
      // On a <div> these are inert: target="_blank" silently opened in the same tab.
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/' },
        attrs: { target: '_blank', rel: 'noopener', title: 'Home' },
      })
      expect(wrapper.attributes('target')).toBe('_blank')
      expect(wrapper.attributes('rel')).toBe('noopener')
      expect(wrapper.attributes('title')).toBe('Home')
    })

    it('should route link-level aria to the anchor, not the hidden image', () => {
      // aria-current on the image would land on an aria-hidden element and be
      // discarded by every assistive technology.
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/' },
        attrs: { 'aria-current': 'page' },
      })
      expect(wrapper.attributes('aria-current')).toBe('page')
    })

    it('should not leak imgProps onto the anchor', () => {
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/', imgProps: { fit: 'cover' } },
      })
      expect(wrapper.attributes('fit')).toBeUndefined()
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
        props: { ...sized, href: '/', imgProps: { 'aria-hidden': 'true' } },
      })
      expect(wrapper.attributes('aria-label')).toBe('Acme')
      // ASSERTS THE INNER IMAGE TOO. Checking only the anchor's own binding was
      // trivially true: it is bound from `alt` and cannot be affected by attrs
      // forwarding at all, so the test could not fail in the direction it named.
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBe('true')
    })

    it('should hide the inner image from assistive tech when linked', () => {
      // The anchor already carries the name. Leaving the nested role="img" named
      // too announces the brand TWICE as two separate accessible objects — and it
      // does so for the exact call pattern the stories recommend.
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '/' } })
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBe('true')
    })

    it('should not hide the image when it is not a link', () => {
      // Unlinked, the image IS the accessible object — hiding it would erase the
      // logo from the accessibility tree entirely.
      const wrapper = mount(NsBrandLogo, { props: sized })
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBeUndefined()
    })

    it('should let a consumer un-hide the inner image when linked', () => {
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '/', imgProps: { 'aria-hidden': 'false' } },
      })
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBe('false')
    })

    it('should warn when a linked logo has no accessible name', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, ratio: 2.62, href: '/' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsBrandLogo]'))
    })

    it('should allow a decorative logo to be hidden from assistive tech', () => {
      // ASSERTS ON THE ROOT, NOT THROUGH [role="img"]. This mount has no `alt`,
      // and from Quasar 2.25.0 QImg claims the img role only when it has a name:
      //
      //   // the img role requires an accessible name, so it is only claimed
      //   ...(props.alt ? { role: 'img', 'aria-label': props.alt } : {})
      //
      // So the selector matched nothing and the test failed on the merge with
      // main, which carries that bump. The root IS the image in the unlinked
      // variant, so ask it directly — which is also what the test meant.
      const wrapper = mount(NsBrandLogo, {
        props: { src: SRC, ratio: 2.62 },
        attrs: { 'aria-hidden': 'true' },
      })
      expect(wrapper.attributes('aria-hidden')).toBe('true')
    })

    it('should claim no img role at all when it has no name to put on it', () => {
      // Pins the Quasar 2.25.0 behaviour the test above now depends on. An image
      // role with no accessible name is an axe failure (role-img-alt); upstream
      // now omits the role rather than emitting an unnamed one, so an unnamed
      // decorative logo is out of the accessibility tree without any help from us.
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsBrandLogo, { props: { src: SRC, ratio: 2.62 } })
      expect(wrapper.find('[role="img"]').exists()).toBe(false)
      expect(wrapper.attributes('role')).toBeUndefined()
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

  describe('blank href is not a link', () => {
    // Review found the template deciding with `v-if="href"` (truthy) while the
    // script decided three more times with `href === undefined`. `href=""` split
    // them, and the disagreement was silent in every direction that mattered.

    it('should not render an anchor for an empty href', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '' } })
      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('should not render an anchor for a whitespace-only href', () => {
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '   ' } })
      expect(wrapper.find('a').exists()).toBe(false)
    })

    it('should forward attrs to the image when href is blank', () => {
      // The bug: attrs were routed to an anchor the template never rendered, so a
      // class, a data-testid or a @click passed alongside a blank href vanished.
      const wrapper = mount(NsBrandLogo, {
        props: { ...sized, href: '' },
        attrs: { 'data-testid': 'brand' },
      })
      expect(wrapper.attributes('data-testid')).toBe('brand')
    })

    it('should keep the image in the accessibility tree when href is blank', () => {
      // The worse half of the same bug: aria-hidden="true" was applied because the
      // script thought this was a link, but the anchor that would have carried the
      // name did not exist. The logo left the accessibility tree holding a good alt.
      const wrapper = mount(NsBrandLogo, { props: { ...sized, href: '' } })
      expect(wrapper.find('[role="img"]').attributes('aria-hidden')).toBeUndefined()
      expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Acme')
    })
  })

  describe('blank alt on a linked logo', () => {
    it('should warn, because an empty alt names the link no better than a missing one', () => {
      // alt="" is the standard HTML idiom for a DECORATIVE image, so it arrives
      // here from consumers doing the normally-correct thing. The guard checked
      // presence, so it stayed quiet for exactly this case.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, ratio: 2.62, href: '/', alt: '' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `alt`'))
    })

    it('should omit aria-label rather than emit an empty one', () => {
      // aria-label="" is its own axe failure on top of the unnamed link.
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsBrandLogo, { props: { src: SRC, ratio: 2.62, href: '/', alt: '' } })
      expect(wrapper.attributes('aria-label')).toBeUndefined()
    })
  })

  describe('missing src', () => {
    it('should warn when src is blank, because no img element is created at all', () => {
      // QImg builds a source only when src || srcset || sizes, so a blank src means
      // no <img>, which means no error event either — a consumer's own onError
      // cannot catch this. The box and the labelled role="img" still render.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: '', alt: 'Acme', ratio: 2.62 } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('no `src`'))
    })

    it('should render no img element for a blank src', () => {
      // Pins the reason the warning exists, so the warning cannot be "fixed" by
      // deleting it while the component still renders an empty labelled box.
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsBrandLogo, { props: { src: '', alt: 'Acme', ratio: 2.62 } })
      expect(wrapper.find('img').exists()).toBe(false)
    })

    it('should not warn when srcset alone sources the image', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, {
        props: { src: '', alt: 'Acme', ratio: 2.62, imgProps: { srcset: `${SRC} 1x` } },
      })
      expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('no `src`'))
    })

    it('should not warn when src is given', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: sized })
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('invalid ratio', () => {
    // QImg computes `props.ratio || naturalRatio`, so every falsy ratio lands on
    // the same 16:9 fallback the sizing warning exists for — with byte-identical
    // output to passing nothing. A presence check was silent for all three.
    it.each([
      ['zero', 0],
      ['NaN', Number.NaN],
      ['an empty string', ''],
    ])('should warn for %s, which falls back to the 16:9 box', (_label, ratio) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', ratio } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('neither `ratio` nor `height`'))
    })

    it('should reserve the 16:9 box for a zero ratio, which is what makes it worth warning about', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', ratio: 0 } })
      const filler = wrapper.find('[role="img"] > div:first-child')
      expect(filler.attributes('style')).toContain('padding-bottom: 56.2')
    })

    it('should accept a valid ratio passed as a string', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', ratio: '2.62' } })
      expect(warn).not.toHaveBeenCalled()
    })

    it('should still accept height as the alternative to a ratio', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsBrandLogo, { props: { src: SRC, alt: 'Acme', ratio: 0, height: 27 } })
      expect(warn).not.toHaveBeenCalled()
    })
  })
})
