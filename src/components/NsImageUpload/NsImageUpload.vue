<template>
  <div
    class="ns-image-upload"
    :class="[
      attrs.class,
      {
        'ns-image-upload--dragging': dragging,
        'ns-image-upload--warning': hasWarning(),
        'ns-image-upload--disabled': resolvedDisable,
      },
    ]"
    :style="attrs.style"
  >
    <!--
      The drag handlers on this div are an ENHANCEMENT with a complete
      keyboard equivalent: the <input type="file"> inside it. The rule below
      exists to catch elements reachable only by pointer; this one is reachable
      by Tab, Enter and the picker. Drop has no keyboard analogue by nature,
      and putting the handlers on the input would not help — a drop lands on
      the visible zone, not the 1px clipped control.

      This is an INNER div, not the root, on purpose: an eslint directive
      comment before the root element makes the template a multi-root
      fragment, which broke attribute fallthrough and every drop test.
    -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <div
      class="ns-image-upload__surface"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragEnter"
      @dragleave="onDragLeave($event)"
      @drop.prevent="onDrop"
    >
      <input
        v-bind="attrsWithoutDisabled"
        :id="inputId"
        ref="inputEl"
        type="file"
        class="ns-image-upload__input"
        :accept="accept"
        :disabled="resolvedDisable"
        :aria-label="label"
        :aria-describedby="describedBy()"
        :aria-invalid="internalWarning !== null ? 'true' : undefined"
        @change="onChange"
      />

      <label v-if="!modelValue" :for="inputId" class="ns-image-upload__dropzone">
        <NsText ref="labelEl" as="span" variant="heading-sm-regular" class="ns-image-upload__label">
          <slot name="label">{{ label }}</slot>
        </NsText>
        <NsText as="span" variant="body-md" class="ns-image-upload__prompt">
          {{ locale.media.uploadPrompt }}
          <span class="ns-image-upload__browse">{{ locale.media.uploadBrowse }}</span>
        </NsText>
      </label>

      <div v-else class="ns-image-upload__preview">
        <img v-if="previewUrl" :src="previewUrl" alt="" class="ns-image-upload__thumb" />
        <NsText as="span" variant="label-sm" class="ns-image-upload__filename">
          {{ modelValue.name }}
        </NsText>
        <NsButton
          variant="tertiary"
          size="sm"
          class="ns-image-upload__remove"
          :aria-label="`${locale.media.uploadRemove}: ${modelValue.name}`"
          @click="clear"
        >
          {{ locale.media.uploadRemove }}
        </NsButton>
      </div>

      <NsText
        v-if="hasWarning()"
        :id="warningId"
        as="p"
        variant="body-sm"
        class="ns-image-upload__warning"
      >
        <slot name="warning">{{ warningText() }}</slot>
      </NsText>

      <div :id="liveId" class="ns-image-upload__live" aria-live="polite" aria-atomic="true">
        {{ announcement }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  useAttrs,
  useId,
  useSlots,
  watch,
  type ComponentPublicInstance,
  type Slot,
  type VNode,
} from 'vue'
import { Comment, Fragment } from 'vue'
import NsText from '../NsText/NsText.vue'
import NsButton from '../NsButton/NsButton.vue'
import { useNsLocale } from '../../composables/useNsLocale'
import { useNsDisabled } from '../../composables/useNsDisabled'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsImageUpload — pick or drop one image, with a preview and a remove button.
 *
 * FOUND BY EXPANDING, NOT BY COUNTING. Two of the eleven NsFormSection
 * variants put this in their Fields slot — ShopPhoto (194:15745, 660x229) and
 * SignUpBusinessDetails (165:11339, 870x179) — and it appears in no top-level
 * count, because a Figma section tree renders every instance as a leaf.
 * Sample size 2, both expanded by id. Story: componentLibrary-s5b.
 *
 * BUILT ON A REAL `<input type="file">`, and everything else follows from that.
 * A styled div with a hidden input has no keyboard path and no announced
 * state — the bead names that as where this gets got wrong. So:
 *
 *   - The input is VISUALLY hidden, never `display: none`: display none removes
 *     it from the tab order and from the accessibility tree. The clip pattern
 *     keeps it focusable and announced while the drop zone draws.
 *   - The drop zone is a `<label for>` the input, not a button, so clicking
 *     it opens the picker through the input. The input's NAME is `aria-label`
 *     from the `label` prop — not the label element — because the label
 *     element disappears once a file is selected, and the input does not:
 *     Tab, Enter, pick is how a user REPLACES an image. The first version
 *     named it from the element and axe failed the selected state with "Form
 *     elements must have labels". The prop is required so a name always
 *     exists, and the `label` slot is for formatting the same text, not
 *     different text — otherwise the visible label and the name drift
 *     (WCAG 2.5.3).
 *   - The focus ring is drawn on the drop zone when the INPUT has focus, via
 *     `:focus-visible + label`. Tab reaches the input; the user sees the zone.
 *   - Selection and removal are announced through a polite live region, since
 *     replacing the drop zone with a preview is a DOM change a screen reader
 *     would otherwise not narrate.
 *   - A warning is tied to the input with `aria-describedby` and `aria-invalid`,
 *     so it is read with the control rather than being loose text nearby.
 *   - Remove is a real `<button>`, named with the filename so "Remove image"
 *     is not ambiguous on a form with several of these.
 *
 * DRAG AND DROP IS AN ENHANCEMENT, not the path. It has no keyboard equivalent
 * by nature; the input is the equivalent. A dropped file goes through the same
 * `select()` as a picked one, so acceptance and announcement are identical.
 *
 * TYPE ACCEPTANCE IS CHECKED HERE TOO, not only via the `accept` attribute:
 * `accept` filters the picker dialog but does nothing for a DROP, and the
 * picker can be bypassed on some platforms. A rejected file is refused with the
 * locale's warning rather than silently accepted or silently dropped.
 *
 * PREVIEW URLS ARE REVOKED. `URL.createObjectURL` holds the file in memory
 * until revoked; a form that swaps images leaks one per swap otherwise.
 * Revoked on every change and on unmount.
 *
 * DESIGN GEOMETRY IS NOT YET MEASURED. The Figma MCP server would not return
 * the instance internals this session (design_context and screenshot both
 * timed out; metadata shows the instance as a leaf). What IS measured, from
 * get_variable_defs on 194:15745: a warning state (bg-warning +
 * text-on-warning), a brand border (border-primary), a surface-alt
 * background, radius-md, and the type styles "Small heading regular", "Medium
 * body text" and "Small label". Layout, spacing and the 229px height are
 * built to those tokens and FLAGGED FOR MEASUREMENT on the bead.
 */

export interface NsImageUploadProps {
  /** The selected file, or null. v-model. */
  modelValue: File | null
  /** Visible heading inside the drop zone, and the input's accessible name. */
  label: string
  /**
   * Accepted MIME types or extensions, as the native `accept` attribute takes
   * them: `image/*`, `image/png`, `.png`, comma-separated. Checked on DROP as
   * well as pick, since `accept` only filters the picker dialog.
   *
   * MIME rules test `File.type` ONLY. A dropped file with an empty type — which
   * some platforms produce — passes only an extension rule, so list
   * `.png,.jpg` alongside `image/*` if those must be accepted. A rule that is
   * none of the three shapes (e.g. `image/` without the star) can never match,
   * and the component warns about it in development rather than rejecting
   * every user's file forever in silence.
   */
  accept?: string
  /** A warning to show under the control, tied to it with aria-describedby. */
  warning?: string
  /** Disables the input. `disabled` (the attribute) is treated as this too, with a warning. */
  disable?: boolean
}

const props = withDefaults(defineProps<NsImageUploadProps>(), {
  accept: 'image/*',
  warning: undefined,
  disable: false,
})

/**
 * `inheritAttrs: false` is REQUIRED, not tidiness. Measured on the built
 * output before this: `<NsImageUpload disabled name="photo" required>` put all
 * three on the wrapper DIV, where they do nothing — the input reported
 * disabled=false, name=undefined. The ob8 shape this library fixed in nineteen
 * other components. Now `class`/`style` stay on the root and everything else
 * lands on the `<input>`, which is where `name`, `required`, `data-testid` and
 * `disabled` belong for a file control.
 */
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const { resolvedDisable, attrsWithoutDisabled: attrsMinusDisabled } = useNsDisabled(
  'NsImageUpload',
  () => props.disable,
)
/** Everything for the input: the consumer's attrs minus `disabled`, `class` and `style`. */
const attrsWithoutDisabled = computed(() => {
  const { class: _c, style: _s, ...rest } = attrsMinusDisabled.value
  return rest
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  /** A dropped or picked file failed the `accept` check. Not emitted for null. */
  rejected: [file: File]
}>()

defineSlots<{
  /**
   * The drop zone heading. For FORMATTING the `label` text, not replacing it —
   * the input is named from the prop, and a slot showing different words would
   * put a visible label outside its control's accessible name.
   */
  label?: () => unknown
  /** Warning content. Overrides `warning`. */
  warning?: () => unknown
}>()

const locale = useNsLocale()
const slots = useSlots()
const inputId = useId()
const warningId = useId()
const liveId = useId()
const inputEl = ref<HTMLInputElement | null>(null)
const labelEl = ref<ComponentPublicInstance | null>(null)
const dragging = ref(false)
const previewUrl = ref<string | null>(null)
const announcement = ref('')
const internalWarning = ref<string | null>(null)

/** Slot CONTENT, not presence — same walk as NsFormSection, same reason. */
function renders(nodes: VNode[]): boolean {
  return nodes.some((node) => {
    if (node.type === Fragment) {
      return Array.isArray(node.children) ? renders(node.children as VNode[]) : false
    }
    return (
      node.type !== Comment && !(typeof node.children === 'string' && node.children.trim() === '')
    )
  })
}
const slotRenders = (slot: Slot | undefined) => slot !== undefined && renders(slot())

/**
 * Plain functions, not computeds — `useSlots()` is not reactive (NsTable.vue:45,
 * and NsFormSection re-shipped that trap once). The internal warning (a
 * rejected drop) wins over the prop, and clears on the next accepted file.
 */
function hasWarning(): boolean {
  return (
    internalWarning.value !== null ||
    slotRenders(slots.warning) ||
    (props.warning?.trim() ?? '') !== ''
  )
}

/**
 * The rejection message wins over the prop while it is set, then the prop
 * shows again. Caught by the test suite: the first version rendered the
 * warning ELEMENT for a rejection (aria-describedby wired, aria-invalid set)
 * with EMPTY text, because the template showed only the prop.
 */
function warningText(): string | undefined {
  return internalWarning.value ?? props.warning
}

function describedBy(): string | undefined {
  return hasWarning() ? warningId : undefined
}

/**
 * Mirrors what the native `accept` attribute means: a comma-separated list of
 * MIME types (with `*` wildcards) or `.ext` extensions. Kept deliberately
 * simple; the picker already enforces this for the pick path.
 */
function isAccepted(file: File): boolean {
  const rules = props.accept
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .filter(Boolean)
  if (rules.length === 0) return true
  const type = file.type.toLowerCase()
  const name = file.name.toLowerCase()
  return rules.some((rule) => {
    if (rule.startsWith('.')) return name.endsWith(rule)
    if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
    return type === rule
  })
}

function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

/**
 * A live region announces on DOM MUTATION. Setting the same string twice does
 * not mutate the text node, so the second announcement never fires — measured
 * in review with a MutationObserver: two identical rejections produced one
 * mutation, and a screen-reader user trying a second bad file heard nothing at
 * all. Clearing across a tick forces a mutation every time.
 */
async function announce(text: string) {
  announcement.value = ''
  await nextTick()
  announcement.value = text
}

/**
 * Only the FIRST dropped file is taken; the rest are ignored, and a drop with
 * no files (dragged text) does nothing. Both deliberate for a single-image
 * control, and both are silent — there is nothing to say about a file that
 * was never a candidate.
 *
 * ON REJECTION THE EXISTING FILE STAYS. `update:modelValue` is not emitted, so
 * a PDF dropped over a chosen image leaves the image; the warning shows under
 * the preview. Replacing the image with nothing because the replacement was
 * bad would be worse than either outcome.
 */
function select(file: File) {
  if (resolvedDisable.value) return
  if (!isAccepted(file)) {
    internalWarning.value = locale.media.uploadRejected
    void announce(locale.media.uploadRejected)
    emit('rejected', file)
    return
  }
  internalWarning.value = null
  emit('update:modelValue', file)
}

function clear() {
  internalWarning.value = null
  emit('update:modelValue', null)
  // Return focus to the input so a keyboard user is not dropped at the top of
  // the document when the remove button they were on disappears.
  inputEl.value?.focus()
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Reset so choosing the SAME file again still fires `change`.
  input.value = ''
  if (file) select(file)
}

function onDragEnter() {
  dragging.value = true
}
function onDragLeave(event: DragEvent) {
  // Moving between CHILDREN of the surface fires dragleave on the parent with
  // the child as relatedTarget — the classic flicker. Only a leave to OUTSIDE
  // the surface should clear the state.
  const to = event.relatedTarget as Node | null
  if (to && (event.currentTarget as Node).contains(to)) return
  dragging.value = false
}
function onDrop(event: DragEvent) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) select(file)
}

watch(
  () => props.modelValue,
  (file, previous) => {
    revokePreview()
    if (file) {
      previewUrl.value = URL.createObjectURL(file)
      void announce(`${locale.media.uploadSelected}: ${file.name}`)
    } else if (previous) {
      void announce(locale.media.uploadCleared)
    }
  },
  { immediate: true },
)

onBeforeUnmount(revokePreview)

/**
 * TWO DEV WARNINGS, ONE GUARD. Both fail-open, warn unless production is
 * proven, same polarity as useNsDisabled.
 *
 * 1. An `accept` rule that is none of `.ext`, `type/*` or `type/sub` can never
 *    match. The native attribute ignores malformed tokens, so the picker would
 *    disagree with the drop path, and every drop would say "not accepted"
 *    forever with no signal to the developer.
 *
 * 2. The `label` slot showing text that does not include the `label` prop
 *    puts a visible label outside its control's accessible name (WCAG 2.5.3).
 *    The slot exists for formatting; different words are a defect, and the
 *    component's own doc naming the hazard is not a guard — NsImage warns for
 *    the equivalent (missing alt), and this earns the same bytes.
 */
if (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') {
  const RULE = /^(\.[a-z0-9]+|[a-z0-9.+-]+\/(\*|[a-z0-9.+-]+))$/i
  watch(
    () => props.accept,
    (accept) => {
      const bad = accept
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r !== '' && !RULE.test(r))
      if (bad.length > 0) {
        console.warn(
          `[NsImageUpload] accept contains ${bad.map((r) => `"${r}"`).join(', ')}, which ` +
            'matches no file: rules must be ".ext", "type/*" or "type/subtype". Every ' +
            'dropped file will be rejected until this is fixed.',
        )
      }
    },
    { immediate: true },
  )

  // READ THE RENDERED TEXT, do not invoke the slot. The first version called
  // `slots.label?.()` inside a watch, and Vue warned "Slot invoked outside of
  // the render function" on every mount — the trap NsPageTitle hit too. The
  // label NsText has already rendered the slot; its textContent is the truth.
  let warnedLabel = false
  const checkLabel = () => {
    if (warnedLabel || slots.label === undefined) return
    const el = labelEl.value?.$el as HTMLElement | undefined
    const text = el?.textContent?.trim() ?? ''
    if (text !== '' && !text.includes(props.label.trim())) {
      warnedLabel = true
      console.warn(
        `[NsImageUpload] the label slot shows "${text}" but the input is named ` +
          `"${props.label}". The visible label must be part of the accessible name ` +
          '(WCAG 2.5.3) — use the slot for formatting the same text, not different text.',
      )
    }
  }
  onMounted(checkLabel)
  onUpdated(checkLabel)
}
</script>

<style lang="scss" scoped>
.ns-image-upload {
  width: 100%;

  &__surface {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-2);
  }

  // VISUALLY HIDDEN, NOT display:none. The input must stay in the tab order and
  // the accessibility tree; this is the standard clip pattern for exactly that.
  &__input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  // Tokens measured on 194:15745; geometry is not — see the doc comment.
  &__dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--ns-space-1);
    min-height: 229px;
    padding: var(--ns-space-5);
    border: 1px dashed var(--ns-color-border-default);
    border-radius: var(--ns-radius-md);
    background: var(--ns-color-bg-surface-alt);
    text-align: center;
    cursor: pointer;
    transition:
      border-color var(--ns-duration-normal) var(--ns-easing-default),
      background var(--ns-duration-normal) var(--ns-easing-default);
  }

  // The FOCUS RING IS ON THE ZONE, driven by the INPUT'S focus. Tab lands on
  // the input; the user sees the zone light up. `:focus-visible` so a mouse
  // click on the label does not leave a ring behind.
  // BOTH SIBLINGS. The input's next sibling is the drop zone before a file is
  // chosen and the preview after. The first version rang only the drop zone —
  // measured in Chromium: with a file selected, Tab landed on a 1px clipped
  // input and nothing on screen changed. WCAG 2.4.7, in exactly the state the
  // doc comment calls the replace path. axe cannot see this.
  &__input:focus-visible + &__dropzone,
  &__input:focus-visible + &__preview {
    outline: 2px solid var(--ns-color-border-focus);
    outline-offset: 2px;
  }

  // Drop feedback in both states too: a drop over the preview REPLACES the
  // file, so the preview is a live target and must say so.
  &__dropzone:hover,
  &--dragging &__dropzone,
  &--dragging &__preview {
    border-color: var(--ns-color-border-primary);
  }

  &--disabled &__dropzone,
  &--disabled &__preview {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &__label {
    color: var(--ns-color-text-primary);
  }

  &__prompt {
    color: var(--ns-color-text-secondary);
  }

  &__browse {
    color: var(--ns-color-text-link);
    text-decoration: underline;
  }

  &__preview {
    display: flex;
    align-items: center;
    gap: var(--ns-space-3);
    padding: var(--ns-space-3);
    border: 1px solid var(--ns-color-border-default);
    border-radius: var(--ns-radius-md);
    background: var(--ns-color-bg-surface);
  }

  &__thumb {
    width: 64px;
    height: 64px;
    object-fit: cover;
    border-radius: var(--ns-radius-sm);
    flex-shrink: 0;
  }

  &__filename {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ns-color-text-primary);
  }

  &--warning &__dropzone {
    border-color: var(--ns-color-border-warning);
  }

  &__warning {
    margin: 0;
    padding: var(--ns-space-2) var(--ns-space-3);
    border-radius: var(--ns-radius-sm);
    background: var(--ns-color-bg-warning);
    color: var(--ns-color-text-on-warning);
  }

  // The live region is for screen readers only.
  &__live {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
}
</style>
