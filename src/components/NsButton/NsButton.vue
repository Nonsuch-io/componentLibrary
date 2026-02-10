<template>
  <q-btn
    v-bind="$attrs"
    :color="color"
    :size="size"
    :unelevated="unelevated"
    :no-caps="noCaps"
    :rounded="rounded"
    :loading="loading"
    class="ns-button"
  >
    <slot />
    <template #loading>
      <slot name="loading">
        <q-spinner-dots color="white" />
      </slot>
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { QSpinnerDots } from 'quasar'

/**
 * NsButton - A styled button wrapping Quasar's QBtn.
 *
 * Provides opinionated defaults: no uppercase text,
 * unelevated style, and rounded edges.
 */

export interface NsButtonProps {
  /** Quasar color name (from the palette) */
  color?: string
  /** Button size: xs | sm | md | lg | xl */
  size?: string
  /** Remove box-shadow elevation */
  unelevated?: boolean
  /** Disable uppercase text transform */
  noCaps?: boolean
  /** Apply rounded border-radius */
  rounded?: boolean
  /** Show a loading spinner overlay */
  loading?: boolean
}

withDefaults(defineProps<NsButtonProps>(), {
  color: 'primary',
  size: 'md',
  unelevated: true,
  noCaps: true,
  rounded: true,
  loading: false,
})
</script>

<style lang="sass" scoped>
.ns-button
  font-family: 'Fixel Text', 'Roboto', sans-serif
  font-weight: 500
  letter-spacing: 0.02em
</style>
