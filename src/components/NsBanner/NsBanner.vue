<template>
  <q-banner
    v-bind="$attrs"
    :class="['ns-banner', `ns-banner--${type}`]"
    :dense="dense"
    :rounded="rounded"
    :role="ariaRole"
    :aria-live="ariaLive"
  >
    <template v-if="$slots.avatar" #avatar>
      <slot name="avatar" />
    </template>

    <slot />

    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
/**
 * NsBanner — A styled banner wrapping Quasar's QBanner.
 *
 * Provides semantic type variants (info, success, warning, error)
 * with token-based colours and layout.
 */

import { computed } from 'vue'

export type NsBannerType = 'info' | 'success' | 'warning' | 'error'

export interface NsBannerProps {
  /** Semantic type controlling the banner colour */
  type?: NsBannerType
  /** Use dense (compact) layout */
  dense?: boolean
  /** Apply rounded border-radius */
  rounded?: boolean
}

const props = withDefaults(defineProps<NsBannerProps>(), {
  type: 'info',
  dense: false,
  rounded: true,
})

/** Error/warning banners are assertive alerts; info/success are polite status messages */
const ariaRole = computed(() =>
  props.type === 'error' || props.type === 'warning' ? 'alert' : 'status',
)
const ariaLive = computed(() =>
  props.type === 'error' || props.type === 'warning' ? 'assertive' : 'polite',
)
</script>

<style lang="sass" scoped>
.ns-banner
  font-family: var(--ns-font-family-text)
  border-radius: var(--ns-radius-md)

  &--info
    background-color: var(--ns-color-info-bg, #e3f2fd)
    color: var(--ns-color-info-text, #0d47a1)

  &--success
    background-color: var(--ns-color-success-bg, #e8f5e9)
    color: var(--ns-color-success-text, #1b5e20)

  &--warning
    background-color: var(--ns-color-warning-bg, #fff3e0)
    color: var(--ns-color-warning-text, #e65100)

  &--error
    background-color: var(--ns-color-error-bg, #ffebee)
    color: var(--ns-color-error-text, #b71c1c)
</style>
