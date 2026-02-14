<template>
  <q-toggle
    v-bind="$attrs"
    :model-value="modelValue"
    :label="label"
    :color="color"
    :dense="dense"
    :disable="disable"
    class="ns-toggle"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
/**
 * NsToggle — A styled toggle switch wrapping Quasar's QToggle.
 *
 * Provides opinionated defaults: token-based colours and font styling.
 */

export interface NsToggleProps {
  /** Toggle label text */
  label?: string
  /** v-model value */
  modelValue?: boolean
  /** Quasar colour name */
  color?: string
  /** Use dense (compact) size */
  dense?: boolean
  /** Disable the toggle */
  disable?: boolean
}

withDefaults(defineProps<NsToggleProps>(), {
  label: undefined,
  modelValue: false,
  color: 'primary',
  dense: false,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style lang="sass" scoped>
.ns-toggle
  font-family: var(--ns-font-family-text)
</style>
