<template>
  <div v-if="isLabelAbove" :class="['ns-select__field', attrs.class]" :style="attrs.style">
    <label v-if="label" :id="labelId" class="ns-select__label" :for="fieldId">{{ label }}</label>
    <q-select
      ref="root"
      v-bind="fieldBindings"
      :model-value="modelValue"
      :for="fieldId"
      :aria-labelledby="label ? labelId : undefined"
      class="ns-select"
      @update:model-value="$emit('update:modelValue', $event)"
      @popup-show="nameListbox"
    >
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData ?? {}" />
      </template>
    </q-select>
  </div>
  <q-select
    v-else
    ref="root"
    v-bind="fieldBindings"
    :model-value="modelValue"
    :label="label"
    :for="consumerFor"
    class="ns-select"
    @update:model-value="$emit('update:modelValue', $event)"
    @popup-show="nameListbox"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData ?? {}" />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, mergeProps, nextTick, ref, useAttrs, useId } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsSelect — A styled select/dropdown wrapping Quasar's QSelect.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { ValidationRule } from 'quasar'

export type NsSelectOption = string | { label: string; value: unknown; [key: string]: unknown }

export type NsSelectLabelPlacement = 'inside' | 'above'

export interface NsSelectProps {
  /** Select label text */
  label?: string
  /**
   * Where the label sits — NsInput's contract, mirrored (componentLibrary-grj.3).
   * `inside` (default) is Quasar's floating label. `above` renders the design's
   * 14px label over a clean box, associated by for/id: Quasar's `for` becomes
   * the combobox's id (use-field.js), so the <label> names the combobox and the
   * popup listbox takes the same name. The sign-up frame (264:26835) has three
   * selects beside label-above inputs; a form with mixed placements was worse
   * than one on floating labels, so butiq waited for this. `above` renders
   * the label as text: a `#label` slot is not rendered in this placement
   * (Quasar only renders it when given a label).
   */
  labelPlacement?: NsSelectLabelPlacement
  /** v-model value */
  modelValue?: unknown
  /** Dropdown options */
  options?: NsSelectOption[]
  /** Use outlined style */
  outlined?: boolean
  /** Use dense (compact) size */
  dense?: boolean
  /** Allow multiple selections */
  multiple?: boolean
  /** Emit only the value instead of the full option object */
  emitValue?: boolean
  /** Map values to labels when using emit-value */
  mapOptions?: boolean
  /** Validation rules — array of Quasar validation rules */
  rules?: ValidationRule[]
  /** Disable the select */
  disable?: boolean
}

const props = withDefaults(defineProps<NsSelectProps>(), {
  label: undefined,
  modelValue: undefined,
  options: () => [],
  outlined: true,
  dense: false,
  multiple: false,
  emitValue: false,
  mapOptions: false,
  rules: undefined,
  disable: false,
  labelPlacement: 'inside',
})

defineEmits<{
  'update:modelValue': [value: unknown]
}>()

// Accepts the `disabled` spelling too — on a QSelect it would otherwise land
// on the wrapper div and leave the field fully editable. See useNsDisabled.
// inheritAttrs: false is REQUIRED, not tidiness. Vue applies $attrs to the root
// element automatically IN ADDITION to any explicit v-bind, so without this the
// raw `disabled` attribute lands on the DOM anyway and defeats the filtering
// below — measured: the attribute was still present on the rendered element.
defineOptions({ inheritAttrs: false })

const { resolvedDisable, attrsWithoutDisabled } = useNsDisabled('NsSelect', () => props.disable)

const root = ref<{ $el?: HTMLElement } | null>(null)
const attrs = useAttrs()

// The template is a v-if/v-else chain with NO comment before it: a sibling
// label OR a leading HTML comment makes the root a fragment, and a consumer's
// scoped rule on <ns-select> stops matching (NsInput's lesson, componentLibrary-eag;
// this file's own tests read wrapper.classes()). In `above` the wrapper carries
// the consumer's class/style and the label; the field gets the rest of the attrs.
const isLabelAbove = computed(() => props.labelPlacement === 'above')
const generatedId = useId()
// `||`, not `??`: for="" would name nothing (NsInput's note, componentLibrary-3sy/knw).
const fieldId = computed(() => (attrs.for as string | undefined) || generatedId)
// QField's ROOT is itself a <label for=fieldId>, so in `above` the combobox has
// TWO associated labels — ours and Quasar's wrapper, whose content includes the
// selected value's text once picked. Review raised it; measured in Chromium
// (dom-accessibility-api): the name still computes to the label alone, because
// the control embedded in Quasar's label counts as the control, not as text.
// aria-labelledby names it by construction regardless of that subtlety, and
// it goes to the native input through Quasar's attr split. NsInput's `above`
// has the same two labels (componentLibrary-2z7).
const labelId = useId()
const consumerFor = computed(() => attrs.for as string | undefined)

// mergeProps so a consumer's `class` combines with ours; in `above` the
// consumer's class/style go on the wrapper instead, with the scope id.
const fieldBindings = computed(() =>
  mergeProps(
    isLabelAbove.value
      ? { ...attrsWithoutDisabled.value, class: undefined, style: undefined }
      : attrsWithoutDisabled.value,
    {
      options: props.options,
      outlined: props.outlined,
      dense: props.dense,
      rules: props.rules,
      multiple: props.multiple,
      emitValue: props.emitValue,
      mapOptions: props.mapOptions,
      disable: resolvedDisable.value,
    },
  ),
)

/**
 * NAME THE LISTBOX (componentLibrary-2e7). QSelect names its combobox
 * (`label`, or a consumer's aria-label — Quasar's own precedence) but
 * renders the popup's listbox with a role and an id and no name — axe's
 * aria-input-field-name, on every NsSelect on every page, found by the gate
 * while a story had a menu open. The combobox's `aria-controls` is that
 * listbox's id (QSelect.js: `${targetUid}_lb`, set only while the popup
 * shows), so on popup-show the listbox is looked up through it and given
 * THE COMBOBOX'S OWN NAME, so the two can never disagree (review measured a
 * first draft preferring `label` where Quasar lets a consumer's aria-label
 * win). Set on the element because QSelect exposes no prop for it; the
 * element persists while the popup is open, so re-renders keep it.
 *
 * TWO HOMES FOR THE COMBOBOX. With a menu (desktop) it is under this
 * component's root. On a phone or tablet — Quasar's default there, or
 * `behavior="dialog"` anywhere — QSelect moves the whole control into a
 * teleported dialog and the element under the root loses its role; review
 * measured a first draft finding nothing there and returning silently, the
 * original gap intact for every mobile user. The dialog is modal, so the
 * one `.q-select__dialog` open is this select's.
 */
async function nameListbox() {
  // popup-show fires as the popup opens; the combobox's aria-controls and the
  // listbox land on the next render.
  await nextTick()
  const combobox =
    root.value?.$el?.querySelector<HTMLElement>('[role="combobox"]') ??
    document.querySelector<HTMLElement>('.q-select__dialog [role="combobox"]')
  // The combobox's own name: Quasar's aria-label from `label`, or a
  // consumer's; with the label ABOVE, QSelect is given no label and the
  // <label for> names the combobox instead, so the same text is used here.
  const name =
    combobox?.getAttribute('aria-label')?.trim() ||
    (isLabelAbove.value ? props.label?.trim() : undefined)
  const listboxId = combobox?.getAttribute('aria-controls')
  if (!name || !listboxId) return
  nameIfUnnamed(document.getElementById(listboxId), name)
  // In dialog mode the dialog is the picker itself, and Quasar leaves it
  // unnamed too (axe aria-dialog-name — found the moment a story ended
  // with the dialog open). Same name: it is the same control.
  nameIfUnnamed(combobox?.closest('[role="dialog"]'), name)
}

function nameIfUnnamed(el: Element | null | undefined, name: string) {
  if (el && !el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
    el.setAttribute('aria-label', name)
  }
}
</script>

<style lang="sass" scoped>
// The label above the box — NsInput's rule, verbatim (6px is the design's
// label-to-box gap, between space-1 and space-2; left literal on purpose).
.ns-select__label
  display: block
  margin-bottom: 6px
  font-family: var(--ns-font-family-text)
  font-size: var(--ns-font-size-sm, 0.875rem)
  color: var(--ns-color-text-primary)

.ns-select
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-sm)
</style>
