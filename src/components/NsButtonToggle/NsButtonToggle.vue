<template>
  <q-btn-toggle
    v-bind="$attrs"
    v-model="model"
    :options="options"
    :disable="resolvedDisable"
    class="ns-button-toggle"
  >
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
  /** Disable the toggle group */
  disable?: boolean
}

const props = withDefaults(defineProps<NsButtonToggleProps>(), {
  modelValue: undefined,
  options: () => [],
  disable: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// Accepts the `disabled` spelling too — see useNsDisabled.
const resolvedDisable = useNsDisabled('NsButtonToggle', () => props.disable)

import { computed } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
</script>

<style lang="sass" scoped>
.ns-button-toggle
  font-family: var(--ns-font-family-text)
</style>
