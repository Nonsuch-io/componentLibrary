<template>
  <q-dialog
    v-bind="$attrs"
    :model-value="modelValue"
    :persistent="persistent"
    :no-backdrop-dismiss="noBackdropDismiss"
    :aria-labelledby="hasTitle ? titleId : undefined"
    :aria-label="hasTitle ? undefined : ariaLabel"
    :aria-describedby="bodyId"
    class="ns-dialog"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!--
      NO role/aria-modal HERE. QDialog already sets both on its portal node
      (QDialog.js:432) and spreads ...attrs onto that SAME node, so naming
      attributes belong on <q-dialog> above. Declaring role="dialog" here created a
      NESTED second dialog, and the one axe flagged as unnamed was Quasar's.
    -->
    <q-card :class="['ns-dialog__card', size && `ns-dialog__card--${size}`]">
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
import { computed, useId, useSlots, watchEffect } from 'vue'

declare const process: { env: { NODE_ENV?: string } } | undefined
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
  /**
   * Accessible name for a dialog with no visible title. Ignored when `title` or
   * the header slot is present — the visible heading names it, and an aria-label
   * would override that text.
   */
  ariaLabel?: string
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
   *
   * NO DEFAULT, DELIBERATELY. Defaulting to `default` (650px) was a BREAKING
   * change disguised as an opt-in prop: consumers nest their own sized card
   * inside this one, so a max-width on the parent caps the child by
   * CONTAINMENT — nothing a consumer writes can override it. Review measured
   * butiq's 780px dialogs silently rendering at 618px with no change on their
   * side. Omitting `size` leaves the card unconstrained, exactly as before,
   * so upgrading is inert and adoption is a real choice.
   */
  size?: NsDialogSize
}

const props = withDefaults(defineProps<NsDialogProps>(), {
  modelValue: false,
  title: undefined,
  ariaLabel: undefined,
  persistent: false,
  noBackdropDismiss: false,
  size: undefined,
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const slots = useSlots()
const titleId = `ns-dialog-title-${useId()}`
const bodyId = `ns-dialog-body-${useId()}`

// SLOT PRESENCE, not slot content — a header slot that renders nothing still
// counts as named. A deliberate under-report (inspecting rendered vnodes at
// setup is fragile), stated here rather than hidden, same as NsButton.
const hasTitle = computed(() => Boolean(props.title) || slots.header !== undefined)

// A modal with no accessible name announces as "dialog" and nothing else, and the
// user is trapped inside it until they find a way out. The library cannot invent
// the name. Story: componentLibrary-057.
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  let warned = false
  watchEffect(() => {
    if (warned || hasTitle.value || (props.ariaLabel ?? '').trim() !== '') return
    warned = true
    console.warn(
      '[NsDialog] has no accessible name — it announces as "dialog" with no ' +
        'description while trapping focus. Pass `title`, use the header slot, or ' +
        'pass `aria-label` for a dialog with no visible heading.',
    )
  })
}
</script>

<style lang="sass" scoped>
.ns-dialog__card
  border-radius: var(--ns-radius-lg)
  font-family: var(--ns-font-family-text)
  min-width: 320px

  // `width: 100%` with a per-size max-width, NOT a fixed width: an 820px
  // `large` dialog on a narrow viewport must shrink rather than overflow.
  // Scoped to the size modifiers so that omitting `size` leaves the card
  // completely unstyled for width — see NsDialogProps.size on why there is
  // no default.
  //
  // MEASURED SHRINK THRESHOLDS, because they are higher than "narrow" suggests:
  // Quasar's .q-dialog__inner--minimized has fixed 24px padding either side, so
  // the card resolves against (viewport - 48px). `large` therefore reaches its
  // full 820px only above ~868px of viewport, and `default` above ~698px. At an
  // 800px window `large` renders ~751px; at 601px every size collapses to the
  // same ~553px. That is correct behaviour, not a bug, but a consumer measuring
  // "large" on a small laptop will not see 820 and should not conclude it broke.
  &--small,
  &--default,
  &--large
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
