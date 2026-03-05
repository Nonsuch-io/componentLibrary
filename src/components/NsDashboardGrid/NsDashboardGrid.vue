<script setup lang="ts">
import { computed, useSlots, h, type VNode, Fragment } from 'vue'

/**
 * NsDashboardGrid — A responsive grid layout for dashboard widgets.
 *
 * Mobile-first responsive columns using Quasar's ascending breakpoint system.
 * Default: 1 column (xs) → 2 columns (sm) → 4 columns (md) → 4 columns (lg).
 *
 * Each direct child in the default slot is automatically wrapped in a
 * responsive column div. Works with any content but optimized for
 * equal-height cards in each row.
 */
export interface NsDashboardGridColumns {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

export interface NsDashboardGridProps {
  /** Override breakpoint column configuration */
  columns?: NsDashboardGridColumns
  /** Spacing between widgets (Quasar gutter size: xs, sm, md, lg, xl) */
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<NsDashboardGridProps>(), {
  columns: () => ({ xs: 1, sm: 2, md: 4, lg: 4 }),
  gap: 'md',
})

const slots = useSlots()

const gutterClass = computed(() => `q-col-gutter-${props.gap}`)

function colClass(breakpoint: string, cols: number): string {
  const span = Math.floor(12 / cols)
  if (breakpoint === 'xs') return `col-${span}`
  return `col-${breakpoint}-${span}`
}

const columnClassList = computed(() => {
  const classes: string[] = []
  const c = props.columns

  if (c.xs) classes.push(colClass('xs', c.xs))
  if (c.sm) classes.push(colClass('sm', c.sm))
  if (c.md) classes.push(colClass('md', c.md))
  if (c.lg) classes.push(colClass('lg', c.lg))
  if (c.xl) classes.push(colClass('xl', c.xl))

  return classes
})

function flattenSlotChildren(vnodes: VNode[]): VNode[] {
  const result: VNode[] = []
  for (const vnode of vnodes) {
    if (vnode.type === Fragment && Array.isArray(vnode.children)) {
      result.push(...flattenSlotChildren(vnode.children as VNode[]))
    } else if (typeof vnode.type !== 'symbol') {
      // Skip text nodes and comments
      result.push(vnode)
    }
  }
  return result
}

const render = () => {
  const defaultSlot = slots.default?.()
  const children = defaultSlot ? flattenSlotChildren(defaultSlot) : []

  const wrapped = children.map((child, index) =>
    h('div', { key: index, class: columnClassList.value }, [child]),
  )

  return h(
    'div',
    { class: ['ns-dashboard-grid', 'row', 'items-stretch', gutterClass.value] },
    wrapped,
  )
}
</script>

<template>
  <render />
</template>
