<template>
  <q-form
    v-bind="$attrs"
    class="ns-form"
    :greedy="greedy"
    :aria-label="ariaLabel"
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
  /** Accessible label for the form */
  ariaLabel?: string
}

withDefaults(defineProps<NsFormProps>(), {
  greedy: true,
  ariaLabel: undefined,
})

defineEmits<{
  submit: [event: Event]
  validationError: [ref: unknown]
}>()
</script>

<style lang="sass" scoped>
.ns-form
  font-family: var(--ns-font-family-text)
</style>
