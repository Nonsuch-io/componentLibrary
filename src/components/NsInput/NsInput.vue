<template>
  <q-input
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :label="label"
    :outlined="outlined"
    :dense="resolvedDense"
    :type="resolvedType"
    :rules="rules"
    :disable="resolvedDisable"
    :class="['ns-input', sizeClass]"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, useAttrs, watchEffect } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'

declare const process: { env: { NODE_ENV?: string } } | undefined
/**
 * NsInput — A styled text input wrapping Quasar's QInput.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { QInput, ValidationRule } from 'quasar'

/**
 * The design's three sizes. Figma (Inputs page, frame 5513:9121, 505 symbols)
 * specifies Dense 38px / Default 50px / Large 120px, and the variable defs for a
 * Large symbol and a Default one are IDENTICAL — same font, padding, radius and
 * colours. Only the height moves, which is what makes Large a PROSE FIELD rather
 * than a bigger input: a 120px single-line box would be absurd, a 120px box with
 * body-14 text and unchanged padding is a description field.
 */
export type NsInputSize = 'dense' | 'default' | 'large'

export interface NsInputProps {
  /** Input label text */
  label?: string
  /** v-model value */
  modelValue?: string
  /** Use outlined style */
  outlined?: boolean
  /**
   * Use dense (compact) size.
   * @deprecated Use `size="dense"`. A boolean cannot carry the design's three
   * sizes. Still honoured, and still the fallback when `size` is absent, so no
   * existing call site changes; it will be removed in the batched breaking
   * release (componentLibrary-b5e).
   */
  dense?: boolean
  /**
   * Field size. DELIBERATELY UNDEFAULTED — see the note in the style block.
   * Omitting it renders exactly what this component rendered before `size`
   * existed. Setting it opts into the design's measurements.
   */
  size?: NsInputSize
  /** Validation rules — array of Quasar validation rules */
  rules?: ValidationRule[]
  /** Disable the input */
  disable?: boolean
}

const props = withDefaults(defineProps<NsInputProps>(), {
  label: undefined,
  modelValue: undefined,
  outlined: true,
  dense: false,
  size: undefined,
  rules: undefined,
  disable: false,
})

defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

// Accepts the `disabled` spelling too — on a QInput it would otherwise land on
// the wrapper div and leave the field fully editable. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsInput', () => props.disable)

const attrs = useAttrs()

/** `size` wins when both are given; `dense` remains the fallback so every call
 *  site that predates `size` renders exactly as it did. */
const resolvedDense = computed(() =>
  props.size === undefined ? props.dense : props.size === 'dense',
)

const sizeClass = computed(() => (props.size ? `ns-input--${props.size}` : undefined))

/**
 * Large is multi-line, because that is what the design's 120px MEANS. Quasar
 * renders a textarea only for `type="textarea"`, so without this the component
 * would honour the height and still give a single-line field the user cannot
 * type a second line into — the measurement satisfied and the intent missed.
 *
 * A consumer's explicit `type` always wins: `size="large" type="number"` is
 * their call to make, not ours to override.
 */
// PASSES THE CONSUMER'S `type` BACK THROUGH rather than returning undefined.
// An explicit `:type` binding sits AFTER `v-bind="attrsWithoutDisabled"` in the
// template, so it wins even when its value is undefined — returning undefined
// here did not "leave attrs alone", it deleted the consumer's type. Caught by
// the test for `size="large" type="number"`, which is the one combination where
// the two rules disagree.
type QInputType = InstanceType<typeof QInput>['$props']['type']

const resolvedType = computed<QInputType>(() =>
  attrs.type !== undefined
    ? (attrs.type as QInputType)
    : props.size === 'large'
      ? 'textarea'
      : undefined,
)

if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (props.size !== undefined && props.dense) {
      console.warn(
        '[NsInput] `dense` and `size` were both set. `size` wins and `dense` is ' +
          'ignored. Use `size="dense"` instead — `dense` is deprecated because a ' +
          'boolean cannot express the three sizes the design specifies.',
      )
    }
  })
}
</script>

<style lang="sass" scoped>
.ns-input
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-md)

  // SIZES ARE OPT-IN, AND `default` IS NOT WHAT AN UNSIZED INPUT RENDERS.
  //
  // That reads like a bug, so: Quasar's outlined control is 56px and its dense
  // native is 40px, while Figma specifies 50px and 38px (Inputs page, 505
  // symbols). Those disagree by 6px and 2px. Making `size` default to 'default'
  // would have restyled all 369 <ns-input> sites in the only consumer — a silent
  // visual change to every form in the product, shipped as "added a prop". So
  // `size` starts undefined and an unsized input renders exactly what it did.
  //
  // The reconciliation (make 50px the true default and drop `dense`) belongs in
  // the batched breaking release this bead already calls for, NOT here.
  // Scheduled decision, not a thing someone rediscovers: componentLibrary-b5e.
  //
  // Heights land on .q-field__control, which is what Quasar sizes; setting them
  // on .ns-input is overridden by Quasar's own rule at higher specificity.
  //
  // KEEP THIS COMMENT INDENTED. In indented sass a comment at column 0 CLOSES
  // the enclosing block: an earlier version had this flush left and all three
  // size rules silently vanished — zero `.ns-input--*` rules in the compiled
  // CSS, with the build, the typecheck and every unit test still green. Only
  // the real-browser height story caught it, measuring 56px where the design
  // says 50px. That is precisely the gap the story was added to cover.

  &--dense
    :deep(.q-field__control)
      height: 38px
      min-height: 38px

  &--default
    :deep(.q-field__control)
      height: 50px
      min-height: 50px

  // Large is the PROSE field: a textarea (see resolvedType), so height must be
  // min-height only — a fixed height would cap autogrow and clip the text the
  // field exists to hold. Figma's 120px is the STARTING height, not a ceiling.
  &--large
    :deep(.q-field__control)
      height: auto
      min-height: 120px

    :deep(.q-field__native)
      // Text starts at the top of a prose field. Quasar vertically centres a
      // single-line native, which in a 120px box parks the caret in the middle
      // of empty space and reads as a broken layout rather than a writing area.
      align-items: flex-start
      min-height: 120px
      padding-top: var(--ns-space-2, 8px)
</style>
