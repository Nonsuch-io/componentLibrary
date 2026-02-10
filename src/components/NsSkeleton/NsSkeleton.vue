<template>
  <q-skeleton
    v-bind="$attrs"
    :type="type"
    :animation="animation"
    :square="square"
    :bordered="bordered"
    :width="width"
    :height="height"
    class="ns-skeleton"
  />
</template>

<script setup lang="ts">
/**
 * NsSkeleton - A placeholder skeleton wrapping Quasar's QSkeleton.
 *
 * Shows animated placeholder shapes while content is loading.
 * Supports all QSkeleton types including component-matched shapes
 * (QBtn, QInput, QAvatar, etc.).
 */

export type NsSkeletonType =
  | 'text'
  | 'rect'
  | 'circle'
  | 'QBtn'
  | 'QBadge'
  | 'QChip'
  | 'QToolbar'
  | 'QCheckbox'
  | 'QRadio'
  | 'QToggle'
  | 'QSlider'
  | 'QRange'
  | 'QInput'
  | 'QAvatar'

export type NsSkeletonAnimation = 'wave' | 'pulse' | 'pulse-x' | 'pulse-y' | 'fade' | 'blink' | 'none'

export interface NsSkeletonProps {
  /** Shape type — use component names for accurate matching */
  type?: NsSkeletonType
  /** Animation style */
  animation?: NsSkeletonAnimation
  /** Remove border-radius */
  square?: boolean
  /** Add a border */
  bordered?: boolean
  /** Custom width (CSS value) */
  width?: string
  /** Custom height (CSS value) */
  height?: string
}

withDefaults(defineProps<NsSkeletonProps>(), {
  type: 'rect',
  animation: 'wave',
  square: false,
  bordered: false,
  width: undefined,
  height: undefined,
})
</script>

<style lang="sass" scoped>
.ns-skeleton
  border-radius: 8px
</style>
