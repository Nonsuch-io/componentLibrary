<template>
  <q-form
    v-bind="$attrs"
    class="ns-form"
    :greedy="greedy"
    @submit="$emit('submit', $event)"
    @validation-error="$emit('validationError', $event)"
  >
    <slot />
  </q-form>
</template>

<script setup lang="ts">
/**
 * NsForm — A lightweight form wrapper around Quasar's QForm.
 *
 * Provides validation orchestration with a greedy default
 * (validates all fields, not just until the first error).
 */

export interface NsFormProps {
  /** Validate all fields even after the first error */
  greedy?: boolean
}

withDefaults(defineProps<NsFormProps>(), {
  greedy: true,
})

defineEmits<{
  /* eslint-disable-next-line no-undef */
  submit: [event: Event]
  validationError: [ref: unknown]
}>()
</script>

<style lang="sass" scoped>
.ns-form
  font-family: var(--ns-font-family-text)
</style>
