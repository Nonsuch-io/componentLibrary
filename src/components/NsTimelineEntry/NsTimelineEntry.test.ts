import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTimelineEntry from './NsTimelineEntry.vue'
import { QTimeline } from 'quasar'

describe('NsTimelineEntry', () => {
  const mountEntry = (attrs = {}) =>
    mount({
      components: { QTimeline, NsTimelineEntry },
      template:
        '<q-timeline><NsTimelineEntry v-bind="extraAttrs">Entry content</NsTimelineEntry></q-timeline>',
      setup: () => ({ extraAttrs: attrs }),
    })

  it('renders within a QTimeline parent', () => {
    const wrapper = mountEntry()
    expect(wrapper.find('.ns-timeline-entry').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountEntry()
    expect(wrapper.text()).toContain('Entry content')
  })

  describe('accessibility', () => {
    it('renders as a timeline entry', () => {
      const wrapper = mountEntry()
      expect(wrapper.find('.q-timeline__entry').exists()).toBe(true)
    })
  })
})
