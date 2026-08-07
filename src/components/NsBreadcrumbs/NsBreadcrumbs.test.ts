import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBreadcrumbs from './NsBreadcrumbs.vue'
import NsBreadcrumbElement from '../NsBreadcrumbElement/NsBreadcrumbElement.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleEnCA } from '../../locale/en-CA'

/** Mounts NsBreadcrumbs with three real NsBreadcrumbElement crumbs, matching typical usage. */
function mountThreeCrumbs(extraProps: Record<string, unknown> = {}) {
  return mount(
    {
      components: { NsBreadcrumbs, NsBreadcrumbElement },
      props: Object.keys(extraProps),
      template: `
        <NsBreadcrumbs v-bind="$props">
          <NsBreadcrumbElement label="Home" to="/" />
          <NsBreadcrumbElement label="Category" to="/category" />
          <NsBreadcrumbElement label="Current Page" />
        </NsBreadcrumbs>
      `,
    },
    { props: extraProps },
  )
}

describe('NsBreadcrumbs', () => {
  it('mounts without errors', () => {
    const wrapper = mountThreeCrumbs()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders a li per breadcrumb element', () => {
    const wrapper = mountThreeCrumbs()
    expect(wrapper.findAll('li')).toHaveLength(3)
  })

  describe('accessibility', () => {
    it('renders a nav landmark with an accessible name', () => {
      const wrapper = mountThreeCrumbs()
      const nav = wrapper.find('nav')
      expect(nav.exists()).toBe(true)
      expect(nav.attributes('aria-label')).toBeTruthy()
    })

    it('uses the en-CA locale default for the nav accessible name', () => {
      const wrapper = mountThreeCrumbs()
      expect(wrapper.find('nav').attributes('aria-label')).toBe('Breadcrumb')
    })

    it('lets an explicit ariaLabel prop override the default', () => {
      const wrapper = mountThreeCrumbs({ ariaLabel: 'You are here' })
      expect(wrapper.find('nav').attributes('aria-label')).toBe('You are here')
    })

    it('uses an injected locale for the nav accessible name when no prop is given', () => {
      const wrapper = mount(
        {
          components: { NsBreadcrumbs, NsBreadcrumbElement },
          template: `
            <NsBreadcrumbs>
              <NsBreadcrumbElement label="Home" />
              <NsBreadcrumbElement label="Current" />
            </NsBreadcrumbs>
          `,
        },
        {
          global: {
            provide: {
              [NsLocaleKey as symbol]: {
                ...nsLocaleEnCA,
                navigation: { breadcrumbs: 'Fil de navigation' },
              },
            },
          },
        },
      )
      expect(wrapper.find('nav').attributes('aria-label')).toBe('Fil de navigation')
    })

    it('renders the breadcrumb trail as a real ordered list', () => {
      const wrapper = mountThreeCrumbs()
      const nav = wrapper.find('nav')
      const list = nav.find('ol')
      expect(list.exists()).toBe(true)
      // every li is a direct child of the ol, not buried in extra wrapper markup
      expect(list.findAll(':scope > li')).toHaveLength(3)
    })

    it('marks the last breadcrumb element aria-current="page" and no other', () => {
      const wrapper = mountThreeCrumbs()
      const elements = wrapper.findAll('.q-breadcrumbs__el')
      expect(elements).toHaveLength(3)
      expect(elements[0]?.attributes('aria-current')).toBeUndefined()
      expect(elements[1]?.attributes('aria-current')).toBeUndefined()
      expect(elements[2]?.attributes('aria-current')).toBe('page')
    })

    it('marks the actual last breadcrumb element as current, not merely the last rendered node', () => {
      // Non-crumb content (e.g. a trailing icon) rendered after the real last
      // crumb must not steal aria-current, and must not stop the true last
      // crumb from getting it.
      const wrapper = mount({
        components: { NsBreadcrumbs, NsBreadcrumbElement },
        template: `
          <NsBreadcrumbs>
            <NsBreadcrumbElement label="Home" />
            <NsBreadcrumbElement label="Current Page" />
            <span class="trailing-decoration">*</span>
          </NsBreadcrumbs>
        `,
      })
      const elements = wrapper.findAll('.q-breadcrumbs__el')
      expect(elements[elements.length - 1]?.attributes('aria-current')).toBe('page')
      expect(wrapper.find('.trailing-decoration').attributes('aria-current')).toBeUndefined()
    })

    it('respects an explicit aria-current set by the consumer instead of double-marking the last crumb', () => {
      const wrapper = mount({
        components: { NsBreadcrumbs, NsBreadcrumbElement },
        template: `
          <NsBreadcrumbs>
            <NsBreadcrumbElement label="Home" />
            <NsBreadcrumbElement label="Middle" aria-current="page" />
            <NsBreadcrumbElement label="Last" />
          </NsBreadcrumbs>
        `,
      })
      const elements = wrapper.findAll('.q-breadcrumbs__el')
      const currentElements = elements.filter((el) => el.attributes('aria-current') === 'page')
      expect(currentElements).toHaveLength(1)
      expect(currentElements[0]?.text()).toBe('Middle')
    })

    it('does not render any separator content as a real DOM/text node', () => {
      const wrapper = mountThreeCrumbs()
      // Separators must be CSS-only (never real nodes) so they can never be
      // announced by assistive tech. Assert there is no dedicated separator
      // element and no stray "/" text node between crumbs — jsdom/happy-dom
      // don't load stylesheets, so a getComputedStyle assertion here could
      // never fail; checking for the absence of real nodes can.
      expect(wrapper.find('.q-breadcrumbs__separator').exists()).toBe(false)
      expect(wrapper.findAll('li')).toHaveLength(wrapper.findAll('.q-breadcrumbs__el').length)
    })

    it('renders non-link crumbs as non-focusable elements', () => {
      const wrapper = mountThreeCrumbs()
      const elements = wrapper.findAll('.q-breadcrumbs__el')
      // "Current Page" has no `to`, so it must not render as a link and must
      // not be focusable.
      const current = elements[2]
      expect(current?.element.tagName).not.toBe('A')
      expect(current?.attributes('tabindex')).toBeUndefined()
      expect(current?.attributes('href')).toBeUndefined()
    })
  })
})
