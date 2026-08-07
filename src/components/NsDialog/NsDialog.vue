<template>
  <q-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :persistent="persistent"
    :no-backdrop-dismiss="noBackdropDismiss"
    :aria-labelledby="title || $slots.header ? titleId : undefined"
    :aria-describedby="bodyId"
    class="ns-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-card
      :class="['ns-dialog__card', `ns-dialog__card--${size}`]"
      role="dialog"
      :aria-modal="true"
    >
      <q-card-section v-if="title || $slots.header" :id="titleId" class="ns-dialog__header">
        <slot name="header">
          <div class="text-h6">{{ title }}</div>
        </slot>
      </q-card-section>

      <q-card-section :id="bodyId" class="ns-dialog__body">
        <slot />
      </q-card-section>

      <q-card-actions v-if="$slots.actions" align="right" class="ns-dialog__actions">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useId } from 'vue'
/**
 * NsDialog — A styled dialog wrapping Quasar's QDialog.
 *
 * Provides a consistent header/body/actions layout with
 * token-based styling. Uses a QCard internally for structure.
 */

/**
 * The widths the design system names, from Figma's NsDialog frame (5628:2889):
 *
 *   Size=Small    400px
 *   Size=Default  650px
 *   Size=Large    820px
 *
 * DELIBERATELY NOT `tablet` OR `mobile`, though Figma has symbols named that.
 * Both are 400px wide, but both carry `Style=Secondary` — and their resolved
 * variables differ from the Style=Default row in more than width: Mobile uses
 * `Small heading` (16/20.8) where Small uses `Medium heading` (20/25), and a
 * different surface token. They are a different PRESENTATION, not a size, so
 * exposing them here would let a consumer pick "mobile" on a desktop and get a
 * width without the typography that defines it. The Secondary style is not
 * modelled yet; see componentLibrary-0bw.
 */
export type NsDialogSize = 'small' | 'default' | 'large'

export interface NsDialogProps {
  /** v-model to show/hide the dialog */
  modelValue?: boolean
  /** Dialog title shown in the header */
  title?: string
  /** Prevent closing by pressing Escape */
  persistent?: boolean
  /** Prevent closing by clicking backdrop */
  noBackdropDismiss?: boolean
  /**
   * Maximum width, from the design system's named scale.
   *
   * Before this existed, every consumer set its own `max-width` in a scoped
   * style block — butiq had five dialogs at 780px and 720px, neither of which
   * is a named size. Pass a name, not a number.
   */
  size?: NsDialogSize
}

withDefaults(defineProps<NsDialogProps>(), {
  modelValue: false,
  title: undefined,
  persistent: false,
  noBackdropDismiss: false,
  size: 'default',
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const titleId = `ns-dialog-title-${useId()}`
const bodyId = `ns-dialog-body-${useId()}`
</script>

<style lang="sass" scoped>
.ns-dialog__card
  border-radius: var(--ns-radius-lg)
  font-family: var(--ns-font-family-text)
  min-width: 320px
  // `width: 100%` with a per-size max-width, NOT a fixed width: an 820px
  // `large` dialog on a 400px phone must shrink rather than overflow the
  // viewport. Quasar's .q-dialog__inner already caps at the screen edge, but
  // a fixed width would fight that instead of cooperating.
  width: 100%

  &--small
    max-width: var(--ns-dialog-width-small)

  &--default
    max-width: var(--ns-dialog-width-default)

  &--large
    max-width: var(--ns-dialog-width-large)

.ns-dialog__header
  font-family: var(--ns-font-family-display)
</style>
