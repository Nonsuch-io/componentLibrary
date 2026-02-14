<template>
  <q-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :persistent="persistent"
    :no-backdrop-dismiss="noBackdropDismiss"
    class="ns-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card class="ns-dialog__card">
      <q-card-section v-if="title || $slots.header" class="ns-dialog__header">
        <slot name="header">
          <div class="text-h6">{{ title }}</div>
        </slot>
      </q-card-section>

      <q-card-section class="ns-dialog__body">
        <slot />
      </q-card-section>

      <q-card-actions v-if="$slots.actions" align="right" class="ns-dialog__actions">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
/**
 * NsDialog — A styled dialog wrapping Quasar's QDialog.
 *
 * Provides a consistent header/body/actions layout with
 * token-based styling. Uses a QCard internally for structure.
 */

export interface NsDialogProps {
  /** v-model to show/hide the dialog */
  modelValue?: boolean
  /** Dialog title shown in the header */
  title?: string
  /** Prevent closing by pressing Escape */
  persistent?: boolean
  /** Prevent closing by clicking backdrop */
  noBackdropDismiss?: boolean
}

withDefaults(defineProps<NsDialogProps>(), {
  modelValue: false,
  title: undefined,
  persistent: false,
  noBackdropDismiss: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style lang="sass" scoped>
.ns-dialog__card
  border-radius: var(--ns-radius-lg)
  font-family: var(--ns-font-family-text)
  min-width: 320px

.ns-dialog__header
  font-family: var(--ns-font-family-display)
</style>
