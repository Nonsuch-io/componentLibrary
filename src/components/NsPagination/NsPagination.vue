<template>
  <q-pagination
    v-bind="$attrs"
    v-model="model"
    :max="max"
    :disable="resolvedDisable"
    class="ns-pagination"
  >
    <slot />
  </q-pagination>
</template>

<script setup lang="ts">
/**
 * NsPagination — A styled wrapper around Quasar's QPagination.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QPagination props and events are forwarded via $attrs.
 */
export interface NsPaginationProps {
  /** Current page (v-model) */
  modelValue?: number
  /** Total number of pages */
  max?: number
  /** Disable the pagination controls */
  disable?: boolean
}

const props = withDefaults(defineProps<NsPaginationProps>(), {
  modelValue: 1,
  max: 1,
  disable: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Accepts the `disabled` spelling too — see useNsDisabled.
const resolvedDisable = useNsDisabled('NsPagination', () => props.disable)

import { computed } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
</script>

<style lang="sass" scoped>
.ns-pagination
  font-family: var(--ns-font-family-text)
</style>
