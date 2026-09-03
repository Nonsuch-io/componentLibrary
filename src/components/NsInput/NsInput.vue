<template>
  <!--
    v-if/v-else, NOT a sibling label. A sibling makes the root a FRAGMENT, and
    Vue only stamps a parent's scope id onto a child's root when that element IS
    the subTree — so with a fragment every consumer's scoped-style rule
    targeting a class on <ns-input> silently stops matching. Review measured 8
    such call sites in butiq plus NsAppShell here, all green in tests. It bit the
    DEFAULT placement too, so "no existing call site moves" was false.

    An if/else chain is a single root at runtime, so the scope id lands again.
    Story: componentLibrary-eag.
  -->
  <div v-if="isLabelAbove" :class="['ns-input__field', attrs.class]" :style="attrs.style">
    <label v-if="label" class="ns-input__label" :for="fieldId">{{ label }}</label>
    <q-input
      v-bind="fieldBindings"
      :model-value="modelValue"
      :for="fieldId"
      @update:model-value="onUpdate"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData ?? {}" />
      </template>
    </q-input>
  </div>
  <q-input
    v-else
    v-bind="fieldBindings"
    :model-value="modelValue"
    :label="label"
    :for="consumerFor"
    @update:model-value="onUpdate"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, mergeProps, useAttrs, useId, watchEffect } from 'vue'
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

export type NsInputLabelPlacement = 'inside' | 'above'

export interface NsInputProps {
  /** Input label text */
  label?: string
  /**
   * Where the label sits.
   *
   * `inside` (the default) is Quasar's floating label, which sits on the border
   * when outlined. `above` renders it as the design specifies — 14px text above
   * a clean box, with the placeholder inside.
   *
   * DEFAULTED TO `inside` ON PURPOSE, and it must stay that way: butiq has 369
   * NsInput call sites and this prop must not restyle a single one. Same
   * reasoning as `size` being deliberately undefaulted — see componentLibrary-b5e
   * and the batched breaking release. Story: componentLibrary-eag.
   */
  labelPlacement?: NsInputLabelPlacement
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
  labelPlacement: 'inside',
  label: undefined,
  modelValue: undefined,
  outlined: true,
  dense: false,
  size: undefined,
  rules: undefined,
  disable: false,
})

const emit = defineEmits<{
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

/**
 * EXTERNAL LABEL. Quasar CANNOT produce the design's layout: q-field__label is
 * rendered `absolute` INSIDE q-field__control, and `stack-label` only forces it
 * to the floated position — it never leaves the box. Measured: with stack-label
 * set, the label carries `q-field__label no-pointer-events absolute ellipsis`
 * and control.contains(label) is true.
 *
 * So the label is rendered by us and QInput is given none. The association is
 * `for`/`id`, NOT proximity — without it the field loses its accessible name,
 * which is worse than the floating label being replaced. Quasar's own `for`
 * prop becomes the native input's id (use-field.js:82,391), so this uses its
 * wiring rather than fighting it.
 *
 * The template is a FRAGMENT as a result. Safe here because inheritAttrs is
 * already false and attrs are bound explicitly, so nothing changes for the 369
 * butiq call sites — verified none of their 18 NsInput test files assert on
 * wrapper.classes(). Story: componentLibrary-eag.
 */
const isLabelAbove = computed(() => props.labelPlacement === 'above')

// Vue's useId is stable across SSR and hydration, which a Math.random id is
// not — a mismatched for/id would silently break the association on hydration
// while looking correct in a client-only test.
//
// A consumer-supplied `for` wins, so an app that already owns its ids keeps
// them rather than having ours imposed.
const generatedId = useId()

// `||`, NOT `??`. Nullish treats '' as a supplied id, and Quasar's own getId
// passes it straight through — so for="" produced for=""/id="" and a field with
// NO accessible name. Review measured it in Chromium: computeAccessibleName was
// the empty string, and AXE DID NOT FLAG IT, so the gate cannot catch this one.
// Realistic trigger: :for="row.id" bound before the row loads.
// Third instance of this class here after componentLibrary-3sy and -knw.
const fieldId = computed(() => (attrs.for as string | undefined) || generatedId)

// Everything the field needs in both branches, so the two <q-input>s below stay
// one line each rather than duplicating twelve bindings.
// In `above` the consumer's class/style go on the WRAPPER, bound directly in
// the template. They must travel WITH the scope id, which lands on the root —
// split them and a consumer's `.my-field { width: 100% }` sits on one element
// and its `data-v-parent` on another, matching nothing. The wrapper is also the
// honest target: in this placement "the field" is the label and box together.

// mergeProps, NOT an object spread. Vue merges `class` and `style` specially —
// a plain spread would let our `class` key REPLACE the consumer's rather than
// combine with it, which is what `v-bind` followed by `:class` used to do in the
// template. Caught by the co-location test above, which is the same test that
// caught the fragment problem.
const fieldBindings = computed(() =>
  mergeProps(
    isLabelAbove.value
      ? { ...attrsWithoutDisabled.value, class: undefined, style: undefined }
      : attrsWithoutDisabled.value,
    {
      outlined: props.outlined,
      dense: resolvedDense.value,
      type: resolvedType.value,
      autogrow: resolvedAutogrow.value,
      rules: props.rules,
      disable: resolvedDisable.value,
      class: ['ns-input', sizeClass.value],
    },
  ),
)

// A computed, not an inline cast: a `|` inside a template expression parses as
// a Vue FILTER (vue/no-deprecated-filter), so `attrs.for as string | undefined`
// is a lint error rather than a type assertion.
const consumerFor = computed(() => attrs.for as string | undefined)

// The consumer's `for` is passed through in the default branch rather than
// bound to undefined. `:for` sits after v-bind, so binding undefined would DELETE a
// consumer-supplied for rather than leave it alone — the trap this file
// documents for `type` below. `for` was the only pre-existing way to attach an
// external label, so deleting it would break the people this feature is for.

function onUpdate(value: string | number | null) {
  emit('update:modelValue', value as string)
}

const NS_INPUT_SIZES: readonly NsInputSize[] = ['dense', 'default', 'large']

/**
 * AN UNRECOGNISED `size` IS TREATED AS ABSENT, not as "some size".
 *
 * TypeScript does not reach a `.js` call site, a spread, or a value off an API
 * response. Before this, `size="huge"` produced `ns-input--huge` — a class
 * matching no rule, so the field silently lost all size styling — AND flipped
 * `resolvedDense` to false, silently discarding a `dense` the consumer had set.
 * Two wrong answers, no signal, from one typo. Falling back to `dense` means the
 * worst case is today's rendering rather than an unstyled field.
 */
// `!= null` catches null AS WELL AS undefined, on purpose: a JS consumer
// passing null to mean "no size" was getting size="null" is not a valid size
// on every mount. Absent is absent however it is spelled.
const isKnownSize = computed(() => props.size != null && NS_INPUT_SIZES.includes(props.size))

/** `size` wins when both are given; `dense` remains the fallback so every call
 *  site that predates `size` renders exactly as it did. */
const resolvedDense = computed(() => (isKnownSize.value ? props.size === 'dense' : props.dense))

const sizeClass = computed(() => (isKnownSize.value ? `ns-input--${props.size}` : undefined))

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

/**
 * LARGE AUTOGROWS, AND WITHOUT THIS IT RENDERED 152px AGAINST A 120px SPEC.
 *
 * Quasar's textarea defaults to rows=6, whose intrinsic height (~124px, 152px of
 * control) EXCEEDS min-height: 120px — so the min-height never governed and the
 * field shipped 32px too tall. Worse, the story asserting min-height was green
 * throughout, because the CSS property genuinely applied; it just did not decide
 * the rendered height. A property assertion that is true and irrelevant.
 *
 * `autogrow` starts the textarea at one row, which puts min-height back in
 * charge of the empty state and makes 120px the floor Figma specifies rather
 * than a number the browser ignores. It also makes the documented "120px is a
 * starting height, not a ceiling" true — measured false before this: a
 * rows=6 textarea scrolls at 30 lines instead of growing.
 *
 * A consumer's own `autogrow` or `rows` wins, same rule as `type`.
 */
// GATED ON resolvedType, NOT ON `size`. Quasar treats autogrow as IMPLYING a
// textarea (isTextarea = type === 'textarea' || autogrow === true), so keying
// this off `size === 'large'` alone re-forced a textarea for
// `size="large" type="number"` — undoing the consumer's explicit type through a
// second, unrelated prop. Caught by the existing override test.
const resolvedAutogrow = computed(() =>
  attrs.autogrow !== undefined || attrs.rows !== undefined
    ? undefined
    : resolvedType.value === 'textarea' || undefined,
)

if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (props.size != null && !isKnownSize.value) {
      // Reported BEFORE the dense+size warning below, and that ordering matters:
      // for a typo'd size the conflict message ("`size` wins") would be actively
      // misleading, since the value that "won" is one this component cannot
      // render.
      console.warn(
        `[NsInput] size="${String(props.size)}" is not a valid size and has been ` +
          `ignored. Expected one of: ${NS_INPUT_SIZES.join(', ')}.`,
      )
      return
    }
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
// 14px above a clean box, per the design. Scoped is correct here — unlike the
// portalled cases in componentLibrary-3sy, this label is rendered by THIS
// component into its own tree, so the scope attribute lands on it.
.ns-input__label
  display: block
  // 6px is the design's label-to-box gap, which falls between --ns-space-1
  // (4px) and --ns-space-2 (8px). Left as a literal deliberately rather than
  // rounded to a token — rounding would change the design by 2px to make the
  // code tidier. If a 6px step is ever added to the scale, use it.
  margin-bottom: 6px
  font-family: var(--ns-font-family-text)
  font-size: var(--ns-font-size-sm, 0.875rem)
  color: var(--ns-color-text-primary)

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
      // NO min-height HERE. It was 120px, and it STACKED with the control's own
      // 120px plus padding to render 148px — the design's number applied twice
      // and satisfied neither time. The control owns the height; the native only
      // owns where the text sits inside it.
      //
      // Text starts at the top of a prose field. Quasar vertically centres a
      // single-line native, which in a 120px box parks the caret in the middle
      // of empty space and reads as a broken layout rather than a writing area.
      align-items: flex-start
      padding-top: var(--ns-space-2, 8px)
</style>
