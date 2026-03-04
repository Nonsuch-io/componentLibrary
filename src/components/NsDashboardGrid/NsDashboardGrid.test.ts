import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, createCommentVNode, createTextVNode } from 'vue'
import NsDashboardGrid from './NsDashboardGrid.vue'

// Helper to create a grid with N widget children
function mountGrid(widgetCount: number, props: Record<string, unknown> = {}) {
  const widgets = Array.from({ length: widgetCount }, (_, i) =>
    h('div', { class: 'test-widget' }, `Widget ${i + 1}`),
  )

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(NsDashboardGrid, props, {
          default: () => widgets,
        })
    },
  })

  return mount(Wrapper)
}

describe('NsDashboardGrid', () => {
  it('renders the grid container with row class', () => {
    const wrapper = mountGrid(3)
    expect(wrapper.find('.ns-dashboard-grid.row').exists()).toBe(true)
  })

  it('wraps each slot child in a column div', () => {
    const wrapper = mountGrid(4)
    const columns = wrapper.findAll('.ns-dashboard-grid > div')
    expect(columns).toHaveLength(4)
  })

  it('applies default column classes (xs:1, sm:2, md:4, lg:4)', () => {
    const wrapper = mountGrid(2)
    const col = wrapper.find('.ns-dashboard-grid > div')
    expect(col.classes()).toContain('col-12')
    expect(col.classes()).toContain('col-sm-6')
    expect(col.classes()).toContain('col-md-3')
    expect(col.classes()).toContain('col-lg-3')
  })

  it('applies custom column configuration', () => {
    const wrapper = mountGrid(2, {
      columns: { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
    })
    const col = wrapper.find('.ns-dashboard-grid > div')
    expect(col.classes()).toContain('col-12')
    expect(col.classes()).toContain('col-sm-6')
    expect(col.classes()).toContain('col-md-6')
    expect(col.classes()).toContain('col-lg-4')
    expect(col.classes()).toContain('col-xl-3')
  })

  it('applies default gap class (q-gutter-md)', () => {
    const wrapper = mountGrid(2)
    expect(wrapper.find('.ns-dashboard-grid').classes()).toContain('q-gutter-md')
  })

  it('applies custom gap class', () => {
    const wrapper = mountGrid(2, { gap: 'lg' })
    expect(wrapper.find('.ns-dashboard-grid').classes()).toContain('q-gutter-lg')
  })

  it('renders slot content inside column wrappers', () => {
    const wrapper = mountGrid(3)
    const widgets = wrapper.findAll('.test-widget')
    expect(widgets).toHaveLength(3)
    expect(widgets[0].text()).toBe('Widget 1')
    expect(widgets[2].text()).toBe('Widget 3')
  })

  it('renders empty grid with no children', () => {
    const Wrapper = defineComponent({
      setup() {
        return () => h(NsDashboardGrid, null, { default: () => [] })
      },
    })
    const wrapper = mount(Wrapper)
    expect(wrapper.find('.ns-dashboard-grid').exists()).toBe(true)
    expect(wrapper.findAll('.ns-dashboard-grid > div')).toHaveLength(0)
  })

  it('applies items-stretch for equal-height cards', () => {
    const wrapper = mountGrid(2)
    expect(wrapper.find('.ns-dashboard-grid').classes()).toContain('items-stretch')
  })

  it('filters out text and comment nodes from slot children', () => {
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(NsDashboardGrid, null, {
            default: () => [
              h('div', { class: 'real-widget' }, 'Widget'),
              createTextVNode('stray text'),
              createCommentVNode('a comment'),
              h('div', { class: 'real-widget' }, 'Widget 2'),
            ],
          })
      },
    })
    const wrapper = mount(Wrapper)
    // Only real element vnodes should be wrapped in columns
    const columns = wrapper.findAll('.ns-dashboard-grid > div')
    expect(columns).toHaveLength(2)
    expect(wrapper.findAll('.real-widget')).toHaveLength(2)
  })

  it('handles empty column configuration (all breakpoints omitted)', () => {
    const wrapper = mountGrid(2, {
      columns: {},
    })
    const col = wrapper.find('.ns-dashboard-grid > div')
    // With no breakpoints specified, no col-* classes should be applied
    expect(col.classes()).not.toContain('col-12')
    expect(col.classes()).not.toContain('col-sm-6')
    expect(col.classes()).not.toContain('col-md-4')
    expect(col.classes()).not.toContain('col-lg-3')
  })
})
