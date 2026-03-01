<template>
  <q-tab-panels v-bind="$attrs" v-model="model" class="ns-tab-panels">
    <slot />
  </q-tab-panels>
</template>

<script setup lang="ts">
/**
 * NsTabPanels — A styled wrapper around Quasar's QTabPanels.
 *
 * Provides Nonsuch design-token integration and a consistent API surface.
 * All QTabPanels props and events are forwarded via $attrs.
 */
export interface NsTabPanelsProps {
  /** Currently active panel name (v-model) */
  modelValue?: string | number
}

const props = withDefaults(defineProps<NsTabPanelsProps>(), {
  modelValue: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const model = computed({
  get: () => props.modelValue as string | number,
  set: (val) => emit('update:modelValue', val),
})

import { computed } from 'vue'
</script>

<style lang="sass" scoped>
.ns-tab-panels
  font-family: var(--ns-font-family-text)
</style>
