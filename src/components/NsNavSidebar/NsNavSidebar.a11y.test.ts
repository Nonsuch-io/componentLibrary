import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsNavSidebar from './NsNavSidebar.vue'

/**
 * componentLibrary-mxa — in the COLLAPSED state every nav pill rendered an icon
 * and nothing else, because the label span is `v-if="isExpanded"`. axe reported
 * link-name / button-name on every item: a screen-reader user heard "link" with
 * no name, for the entire primary navigation, while sighted users decoded the
 * icons and saw nothing wrong.
 *
 * IT SURVIVED BECAUSE NOTHING COULD SEE IT. Every unit test passed, and
 * Storybook's a11y addon was configured `test: 'todo'`, so axe never failed CI
 * (componentLibrary-057). It was found only by flipping that to 'error' to
 * measure the backlog.
 *
 * These assert the attribute rather than the computed accessible name, which is
 * a proxy — the real check is axe in the storybook project. The proxy is here
 * because it is cheap and pins the exact regression: someone re-deriving the
 * label from `isExpanded` and dropping the collapsed branch.
 */
const items = [
  { id: 'dash', label: 'Dashboard', icon: 'house', to: '/dashboard' },
  { id: 'orders', label: 'Orders', icon: 'package', to: '/orders' },
]
const bottomItem = { id: 'settings', label: 'Settings', icon: 'gear', to: '/settings' }

const pills = (w: ReturnType<typeof mount>) => w.findAll('.ns-nav-sidebar__pill')

describe('NsNavSidebar accessible names (componentLibrary-mxa)', () => {
  it('names every pill when COLLAPSED, where no visible label is rendered', () => {
    const wrapper = mount(NsNavSidebar, {
      props: { items, bottomItem, modelValue: 'dash', expanded: false },
    })
    const named = pills(wrapper).map((p) => p.attributes('aria-label'))
    expect(named, 'a pill with no visible label and no aria-label has NO accessible name').toEqual([
      'Dashboard',
      'Orders',
      'Settings',
    ])
  })

  it('does NOT set aria-label when expanded, so it cannot override the visible text', () => {
    // The other half, and it is not symmetry for its own sake: an aria-label set
    // alongside visible text WINS, so a screen reader would announce something
    // that can silently drift from what is on screen.
    const wrapper = mount(NsNavSidebar, {
      props: { items, bottomItem, modelValue: 'dash', expanded: true },
    })
    expect(pills(wrapper).map((p) => p.attributes('aria-label'))).toEqual([
      undefined,
      undefined,
      undefined,
    ])
  })

  it('keeps the visible label as the name source when expanded', () => {
    const wrapper = mount(NsNavSidebar, {
      props: { items, bottomItem, modelValue: 'dash', expanded: true },
    })
    expect(wrapper.findAll('.ns-nav-sidebar__label').map((s) => s.text())).toEqual([
      'Dashboard',
      'Orders',
      'Settings',
    ])
  })

  it('marks the separator presentational, so the list contains only listitems', () => {
    // `role="separator"` on an <li> removes its listitem role, so axe reported a
    // <ul> containing a non-listitem child. A nav separator is decorative.
    const wrapper = mount(NsNavSidebar, {
      props: {
        items: [...items, { id: 'sep', label: '', separator: true }],
        modelValue: 'dash',
      },
    })
    const sep = wrapper.find('.ns-nav-sidebar__separator')
    expect(sep.exists()).toBe(true)
    expect(sep.attributes('role')).toBe('presentation')
    expect(sep.attributes('aria-hidden')).toBe('true')
  })
})
