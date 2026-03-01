<template>
  <q-btn-toggle v-bind="$attrs" v-model="model" :options="options" class="ns-button-toggle">
    <slot />
  </q-btn-toggle>
</template>

<script setup lang="ts">
/**
 * NsButtonToggle — A styled wrapper around Quasar's QBtnToggle.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QBtnToggle props and events are forwarded via $attrs.
 */
export interface NsButtonToggleProps {
  /** Currently selected value */
  modelValue?: unknown
  /** Toggle button options */
  options?: Array<{ label: string; value: unknown }>
}

const props = withDefaults(defineProps<NsButtonToggleProps>(), {
  modelValue: undefined,
  options: () => [],
})

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

import { computed } from 'vue'
</script>

<style lang="sass" scoped>
.ns-button-toggle
  font-family: var(--ns-font-family-text)
</style>
