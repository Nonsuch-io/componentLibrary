<template>
  <q-btn
    v-bind="$attrs"
    :color="color"
    :size="size"
    :unelevated="unelevated"
    :no-caps="noCaps"
    :rounded="rounded"
    class="ns-button"
  >
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
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
}

withDefaults(defineProps<NsButtonProps>(), {
  color: 'primary',
  size: 'md',
  unelevated: true,
  noCaps: true,
  rounded: true,
})
</script>

<style lang="sass" scoped>
.ns-button
  font-weight: 500
  letter-spacing: 0.02em
</style>
