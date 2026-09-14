import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsChecklistBanner, { type NsChecklistTask } from './NsChecklistBanner.vue'
import NsButton from '../NsButton/NsButton.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

/**
 * NOTHING HERE MEASURES A PIXEL — happy-dom has no layout. The design's
 * geometry (58px rows, the mobile tag-first order, equal-width mobile
 * buttons) lives in the stories under the Chromium project. These tests are
 * the contract and what a screen reader is told.
 */

const tasks = (): NsChecklistTask[] => [
  {
    id: 'a',
    title: 'Add vendors',
    description: 'so you can order.',
    actionLabel: 'Go to Vendors',
    dismissable: true,
  },
  {
    id: 'b',
    title: 'Add items',
    description: 'to sell.',
    actionLabel: 'Go to Items',
    dismissable: true,
  },
  { id: 'c', title: 'Count inventory', complete: true },
]

/** v-show is an inline `display: none`; that is the thing to assert. */
const hidden = (w: ReturnType<typeof mount>) =>
  (w.find('ol').element as HTMLElement).style.display === 'none'

const mountWith = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(NsChecklistBanner, {
    props: { title: 'Shop Set Up Checklist', subtitle: 'In this order.', tasks: tasks(), ...props },
    slots,
  })

describe('NsChecklistBanner — structure and names', () => {
  it('is a section named by its own heading, with an ordered list of tasks', () => {
    const w = mountWith()
    expect(w.element.tagName).toBe('SECTION')
    const heading = w.find('h2')
    expect(heading.text()).toBe('Shop Set Up Checklist')
    expect(w.attributes('aria-labelledby')).toBe(heading.attributes('id'))
    const items = w.findAll('ol > li')
    expect(items.length).toBe(3)
    // The step number is decoration: the <ol> carries the order.
    expect(items[0].find('.ns-checklist-banner__step').attributes('aria-hidden')).toBe('true')
    expect(items[2].find('.ns-checklist-banner__step').text()).toBe('3')
    w.unmount()
  })

  it('reads each task as "state, title description"', () => {
    const w = mountWith()
    const items = w.findAll('ol > li')
    expect(items[0].find('p').text().replace(/\s+/g, ' ')).toBe(
      'Not complete, Add vendors so you can order.',
    )
    expect(items[2].find('p').text().replace(/\s+/g, ' ')).toBe('Complete, Count inventory')
    expect(items[2].classes()).toContain('ns-checklist-banner__task--complete')
    w.unmount()
  })

  it('binds the heading level and clamps it', () => {
    expect(mountWith({ level: 3 }).find('h3').exists()).toBe(true)
    expect(mountWith({ level: 9 }).find('h6').exists()).toBe(true)
    expect(mountWith({ level: 0 }).find('h1').exists()).toBe(true)
  })

  it('names the dismiss button with the task so four of them are not four "Dismiss"s', () => {
    const w = mountWith()
    const dismiss = w.findAll('.ns-checklist-banner__task-dismiss')
    expect(dismiss.length).toBe(2)
    expect(dismiss[0].attributes('aria-label')).toBe('Dismiss: Add vendors')
    expect(dismiss[1].attributes('aria-label')).toBe('Dismiss: Add items')
    // The action button is described by the task's sentence.
    const action = w.find('.ns-checklist-banner__task-action')
    const text = w.find('ol > li p')
    expect(action.attributes('aria-describedby')).toBe(text.attributes('id'))
    w.unmount()
  })

  it('renders no action or dismiss for a task that declares neither', () => {
    const w = mountWith()
    const third = w.findAll('ol > li')[2]
    expect(third.find('.ns-checklist-banner__task-actions').exists()).toBe(false)
    expect(third.findAllComponents(NsButton).length).toBe(0)
    w.unmount()
  })

  it('lets a per-task slot replace the sentence, keeping the state prefix', () => {
    const w = mountWith({}, { 'task-b': '<em>Add items</em> to your shop.' })
    const second = w.findAll('ol > li')[1]
    expect(second.find('em').exists()).toBe(true)
    expect(second.find('p').text().replace(/\s+/g, ' ')).toBe(
      'Not complete, Add items to your shop.',
    )
    expect(second.find('strong').exists()).toBe(false)
    w.unmount()
  })
})

describe('NsChecklistBanner — the badge', () => {
  it('counts the tasks left, with a singular form and an all-done form', async () => {
    const w = mountWith()
    expect(w.find('.ns-checklist-banner__badge').text()).toBe('2 Tasks to Complete')
    await w.setProps({ tasks: tasks().map((t, i) => ({ ...t, complete: i > 0 })) })
    expect(w.find('.ns-checklist-banner__badge').text()).toBe('1 Task to Complete')
    await w.setProps({ tasks: tasks().map((t) => ({ ...t, complete: true })) })
    expect(w.find('.ns-checklist-banner__badge').text()).toBe('All tasks complete')
    expect(w.find('.ns-checklist-banner__badge').classes()).toContain(
      'ns-checklist-banner__badge--complete',
    )
    w.unmount()
  })
})

describe('NsChecklistBanner — expanded', () => {
  it('starts expanded and toggles on its own without a v-model, emitting each change', async () => {
    const w = mountWith()
    const toggle = w.find('.ns-checklist-banner__toggle')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.attributes('aria-controls')).toBe(w.find('ol').attributes('id'))
    expect(w.find('.ns-checklist-banner__subtitle').exists()).toBe(true)

    await toggle.trigger('click')
    expect(w.emitted('update:expanded')).toEqual([[false]])
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(hidden(w)).toBe(true)
    // Collapsed drops the subtitle (248:35337) but keeps the badge.
    expect(w.find('.ns-checklist-banner__subtitle').exists()).toBe(false)
    expect(w.find('.ns-checklist-banner__badge').exists()).toBe(true)
    expect(toggle.text()).toBe('Show')
    w.unmount()
  })

  it('follows a controlled `expanded` and does not toggle itself', async () => {
    const w = mountWith({ expanded: false })
    expect(hidden(w)).toBe(true)
    await w.find('.ns-checklist-banner__toggle').trigger('click')
    expect(w.emitted('update:expanded')).toEqual([[true]])
    expect(hidden(w)).toBe(true) // parent has not agreed yet
    await w.setProps({ expanded: true })
    expect(hidden(w)).toBe(false)
    w.unmount()
  })

  it('has no toggle when not collapsible, and stays expanded', () => {
    const w = mountWith({ collapsible: false })
    expect(w.find('.ns-checklist-banner__toggle').exists()).toBe(false)
    expect(hidden(w)).toBe(false)
    w.unmount()
  })
})

describe('NsChecklistBanner — emits', () => {
  it('emits the task on action and on dismiss, and handles neither itself', async () => {
    const w = mountWith()
    await w.find('.ns-checklist-banner__task-action').trigger('click')
    await w.findAll('.ns-checklist-banner__task-dismiss')[1].trigger('click')
    expect(w.emitted('action')![0][0]).toMatchObject({ id: 'a' })
    expect(w.emitted('dismiss')![0][0]).toMatchObject({ id: 'b' })
    // Still three tasks: dismissal is the consumer's to apply.
    expect(w.findAll('ol > li').length).toBe(3)
    w.unmount()
  })
})

describe('NsChecklistBanner — locale', () => {
  it('speaks the injected locale', () => {
    const w = mount(NsChecklistBanner, {
      props: { title: 'Liste', tasks: tasks() },
      global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } },
    })
    expect(w.find('.ns-checklist-banner__badge').text()).toBe('2 tâches à faire')
    expect(w.find('.ns-checklist-banner__toggle').text()).toBe('Masquer')
    expect(w.find('.ns-checklist-banner__task-dismiss').attributes('aria-label')).toBe(
      'Ignorer: Add vendors',
    )
    w.unmount()
  })
})
