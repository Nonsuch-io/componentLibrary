<template>
  <q-select
    ref="root"
    v-bind="attrsWithoutDisabled"
    :model-value="modelValue"
    :label="label"
    :options="options"
    :outlined="outlined"
    :dense="dense"
    :rules="rules"
    :multiple="multiple"
    :emit-value="emitValue"
    :map-options="mapOptions"
    :disable="resolvedDisable"
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
import { nextTick, ref } from 'vue'
import { useNsDisabled } from '../../composables/useNsDisabled'
/**
 * NsSelect — A styled select/dropdown wrapping Quasar's QSelect.
 *
 * Provides opinionated defaults: outlined style, rounded corners,
 * and Fixel font via design tokens.
 */

import type { ValidationRule } from 'quasar'

export type NsSelectOption = string | { label: string; value: unknown; [key: string]: unknown }

export interface NsSelectProps {
  /** Select label text */
  label?: string
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
  const name = combobox?.getAttribute('aria-label')?.trim()
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
.ns-select
  font-family: var(--ns-font-family-text)

  :deep(.q-field__label)
    font-family: var(--ns-font-family-text)

  :deep(.q-field__control)
    border-radius: var(--ns-radius-sm)
</style>
