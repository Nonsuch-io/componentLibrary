<template>
  <q-chip
    v-bind="$attrs"
    :color="color"
    :text-color="textColor"
    :outline="outline"
    :dense="dense"
    :removable="removable"
    :clickable="clickable"
    :disable="disable"
    class="ns-chip"
    @remove="$emit('remove')"
  >
    <slot />
  </q-chip>
</template>

<script setup lang="ts">
/**
 * NsChip — A styled chip wrapping Quasar's QChip.
 *
 * Useful for tags, filters, and selections with
 * token-based styling.
 */

export interface NsChipProps {
  /** Background colour */
  color?: string
  /** Text colour */
  textColor?: string
  /** Use outline style */
  outline?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Show a remove button */
  removable?: boolean
  /** Make the chip clickable */
  clickable?: boolean
  /** Disable the chip */
  disable?: boolean
}

withDefaults(defineProps<NsChipProps>(), {
  color: 'primary',
  textColor: 'white',
  outline: false,
  dense: false,
  removable: false,
  clickable: false,
  disable: false,
})

defineEmits<{
  remove: []
}>()
</script>

<style lang="sass" scoped>
.ns-chip
  font-family: var(--ns-font-family-text)
  border-radius: var(--ns-radius-full, 9999px)
</style>
