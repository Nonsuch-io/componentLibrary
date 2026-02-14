<template>
  <q-tooltip
    v-bind="$attrs"
    :delay="delay"
    :offset="offset"
    :anchor="anchor"
    :self="self"
    class="ns-tooltip"
  >
    <slot />
  </q-tooltip>
</template>

<script setup lang="ts">
/**
 * NsTooltip — A styled tooltip wrapping Quasar's QTooltip.
 *
 * Provides opinionated defaults: consistent delay, offset,
 * and token-based styling. Place inside a parent element.
 */

export type NsTooltipAnchor =
  | 'top left'
  | 'top middle'
  | 'top right'
  | 'top start'
  | 'top end'
  | 'center left'
  | 'center middle'
  | 'center right'
  | 'center start'
  | 'center end'
  | 'bottom left'
  | 'bottom middle'
  | 'bottom right'
  | 'bottom start'
  | 'bottom end'

export interface NsTooltipProps {
  /** Delay before showing (ms) */
  delay?: number
  /** Offset from anchor element [y, x] */
  offset?: [number, number]
  /** Anchor point on the parent */
  anchor?: NsTooltipAnchor
  /** Self alignment point */
  self?: NsTooltipAnchor
}

withDefaults(defineProps<NsTooltipProps>(), {
  delay: 300,
  offset: () => [8, 0],
  anchor: 'bottom middle',
  self: 'top middle',
})
</script>

<style lang="sass" scoped>
.ns-tooltip
  font-family: var(--ns-font-family-text)
  font-size: var(--ns-font-size-sm, 0.875rem)
  border-radius: var(--ns-radius-sm)
  padding: var(--ns-space-1, 4px) var(--ns-space-2, 8px)
</style>
