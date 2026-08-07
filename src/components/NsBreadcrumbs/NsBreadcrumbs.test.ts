import { describe, it, expect, vi } from 'vitest'
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

    it('puts no separator into the DOM — the list text is exactly the crumb labels', () => {
      const wrapper = mountThreeCrumbs()
      // This previously asserted the ABSENCE of `.q-breadcrumbs__separator`, a
      // Quasar class that was absent even in the broken pre-fix state — Quasar
      // never matched our children, so it rendered no separators at all. The
      // test could not fail against its own stated target. Asserting the list's
      // text catches any DOM-borne separator (a <span>, a bare "/" text node,
      // any class at all), because a real separator node shows up in it.
      expect(wrapper.find('.q-breadcrumbs__separator').exists()).toBe(false)
      expect(wrapper.find('ol').text().replace(/\s+/g, '')).toBe('HomeCategoryCurrentPage')
    })

    it('handles v-for crumbs, which compile to a single Fragment vnode', () => {
      // THE BLOCKER FOUND IN REVIEW. `v-for` is the standard way a dynamic
      // trail is written, and it produced ONE <li> holding every crumb, with
      // aria-current [null, null, null] — and since separators are
      // li:not(:first-child)::before, no separators either. A worse
      // accessibility tree than the bug this component was written to fix.
      const wrapper = mount({
        components: { NsBreadcrumbs, NsBreadcrumbElement },
        setup: () => ({ trail: ['Home', 'Catalogue', 'Now'] }),
        template: `
          <NsBreadcrumbs>
            <NsBreadcrumbElement v-for="c in trail" :key="c" :label="c" />
          </NsBreadcrumbs>
        `,
      })
      const items = wrapper.findAll('ol > li')
      expect(items.length, `rendered ${items.length} <li>, expected one per crumb`).toBe(3)
      // aria-current is cloned onto the crumb component, not the <li> wrapper —
      // same element the static-children tests above assert on.
      const elements = wrapper.findAll('.q-breadcrumbs__el')
      expect(elements.map((el) => el.attributes('aria-current'))).toEqual([
        undefined,
        undefined,
        'page',
      ])
    })

    it('warns when the slot holds nothing it can mark as current', () => {
      // Silence is the failure this component exists to remove: a consumer
      // wrapping NsBreadcrumbElement gets a perfect-looking trail with no
      // current-page marker and no signal at all.
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount({
        components: { NsBreadcrumbs },
        template: '<NsBreadcrumbs><span>not a crumb</span></NsBreadcrumbs>',
      })
      expect(warn.mock.calls.flat().join(' ')).toContain('[NsBreadcrumbs]')
      warn.mockRestore()
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
