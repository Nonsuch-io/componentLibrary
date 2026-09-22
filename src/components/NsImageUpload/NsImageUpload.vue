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

      <div class="ns-image-upload__header">
        <NsText ref="labelEl" as="span" variant="heading-sm-regular" class="ns-image-upload__label">
          <slot name="label">{{ label }}</slot>
        </NsText>
        <div v-if="slotRenders(slots.badge)" class="ns-image-upload__badge">
          <slot name="badge" />
        </div>
      </div>

      <div v-if="hasTips()" :id="tipsId" class="ns-image-upload__tips">
        <!--
          ONE predicate, not two: `renders()` treats a whitespace-only slot as
          nothing while Vue's own fallback logic treats it as something, so
          `<slot><fallback/></slot>` can render an empty block AND skip the
          prop. Reachable from a render-function slot; the SFC compiler drops
          whitespace-only slot templates, which is why it hid.
        -->
        <slot v-if="slotRenders(slots.tips)" name="tips" />
        <template v-else>
          <!--
            `${i}:${tip}`, not `tip`: two identical tip strings are legal (a
            repeated line in two locales), and a duplicate key makes Vue's
            keyed diff warn and mis-patch on REORDER. Review measured the
            warning with plain `tip`.
          -->
          <NsText
            v-for="(tip, i) in tips"
            :key="`${i}:${tip}`"
            as="p"
            variant="body-md"
            class="ns-image-upload__tip"
          >
            {{ tip }}
          </NsText>
        </template>
      </div>

      <div class="ns-image-upload__row">
        <!--
          The TILE is the label for the input, in both states: click opens the
          picker, and with a file chosen the same click REPLACES it. The old
          markup swapped the label out for a preview div, which cost the
          keyboard path its visible target (see the focus-ring rule below).
        -->
        <label :for="inputId" class="ns-image-upload__tile">
          <img v-if="previewUrl" :src="previewUrl" alt="" class="ns-image-upload__thumb" />
          <PhPlus v-else :size="32" weight="regular" class="ns-image-upload__plus" />
        </label>

        <div v-if="modelValue" class="ns-image-upload__file">
          <NsText as="span" variant="label-sm" class="ns-image-upload__filename">
            {{ modelValue.name }}
          </NsText>
          <NsButton
            variant="tertiary"
            size="sm"
            :disable="resolvedDisable"
            class="ns-image-upload__remove"
            :aria-label="`${locale.media.uploadRemove}: ${modelValue.name}`"
            @click="clear"
          >
            {{ locale.media.uploadRemove }}
          </NsButton>
        </div>
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
import { PhPlus } from '@phosphor-icons/vue'
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
 *     keeps it focusable and announced while the tile draws.
 *   - The TILE is a `<label for>` the input, not a button, so clicking it opens
 *     the picker through the input — in BOTH states, so a click on a chosen
 *     image REPLACES it. The input's NAME is `aria-label` from the `label`
 *     prop, not the label element, because the tile holds an icon and no
 *     words; axe failed the selected state until the name moved to the input.
 *     The prop is required so a name always exists, and the `label` slot is
 *     for formatting the same text, not different text — otherwise the visible
 *     heading and the name drift (WCAG 2.5.3).
 *   - The focus ring is drawn on the TILE when the INPUT has focus, via
 *     `:focus-visible ~ .row .tile`. Tab reaches the input; the user sees the
 *     tile. A general sibling selector, not `+`: the input's next sibling is
 *     the heading row. One ring target in both states, so unlike the old
 *     markup there is no second element to keep in sync.
 *   - Selection and removal are announced through a polite live region, since
 *     the tile's CONTENTS change without any text changing on screen.
 *   - The tips and any warning are tied to the input with `aria-describedby`,
 *     so the accepted formats are read WITH the control rather than being
 *     loose text above it; a warning also sets `aria-invalid`.
 *   - Remove is a real `<button>`, named with the filename so "Remove image"
 *     is not ambiguous on a form with several of these, and it honours
 *     `disable` in the component rather than through pointer-events.
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
 * DESIGN GEOMETRY IS MEASURED (2026-09-22, Kale selected the instance so the
 * MCP could reach it: I165:10767;6259:19825 in frame 264:26835, 870x229).
 * The frame's "NsImageUpload" is THE WHOLE CARD, not a drop zone — card
 * (bg surface-alt, 1px border-default, radius-sm, padding 20, gap 12), a
 * heading row with the title and a trailing badge, two guidance lines, and a
 * 100x100 dashed tile in radius-MD. Kale's call, same day: the library owns
 * the card, matching the design's own component boundary — so a consumer no
 * longer wraps this in an NsFormSection to get a title and a badge
 * (componentLibrary-af2; -3jh closed as not needed).
 *
 * The full-width "Drag and drop an image, or browse" zone this replaced was
 * built to tokens with the geometry unmeasured, and is gone. Breaking for the
 * one consumer (butiq's sign-up), which is changing here anyway for their #519.
 */

export interface NsImageUploadProps {
  /** The selected file, or null. v-model. */
  modelValue: File | null
  /**
   * The card's visible heading AND the input's accessible name — one string on
   * purpose, so the two can never drift (WCAG 2.5.3). Include any qualifier
   * the design shows: the frame reads "Business Logo (Optional)".
   */
  label: string
  /**
   * Guidance lines under the heading — file types, minimum size. Rendered as
   * one <p> each, 14/19.6 secondary, the frame's two lines. Content is the
   * consumer's: the library does not know a caller's accepted formats.
   */
  tips?: string[]
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
  tips: () => [],
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
   * The card's heading. For FORMATTING the `label` text, not replacing it —
   * the input is named from the prop, and a slot showing different words would
   * put a visible label outside its control's accessible name.
   */
  label?: () => unknown
  /** Warning content. Overrides `warning`. */
  warning?: () => unknown
  /**
   * Trailing content in the heading row, right-aligned — the frame puts an
   * NsBadge there ("Logo Not Added" / "Logo Added"). A slot, not a `badge`
   * prop: the state and its wording belong to the consumer's form, and the
   * frame's own badge swaps tone with it.
   */
  badge?: () => unknown
  /** The guidance lines. Overrides `tips`. */
  tips?: () => unknown
}>()

const locale = useNsLocale()
const slots = useSlots()
const inputId = useId()
const warningId = useId()
const tipsId = useId()
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

function hasTips(): boolean {
  return slotRenders(slots.tips) || props.tips.length > 0
}

/**
 * The tips are the library's own text now (file types, minimum size), so they
 * have to reach the control rather than sit near it: review (fable) called
 * this the dropped-aria class, on surface this component did not have before
 * the card. Warning last, so the newest thing is read last.
 */
function describedBy(): string | undefined {
  const ids = [hasTips() ? tipsId : null, hasWarning() ? warningId : null].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
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
let announcing: Promise<void> = Promise.resolve()

function announce(text: string): Promise<void> {
  // SERIALISED. Two announcements in the same flush — a rejected drop followed
  // at once by an accepted one, or an external modelValue change racing a
  // user's drop — would otherwise interleave: the second's clear ran before
  // the first's text was ever committed, and the first was not delayed, it
  // was GONE. Measured in review: one MutationObserver record for two events.
  // The same silent-loss class the clear-then-set was written to close, one
  // window narrower. Chaining through a promise makes each wait its turn.
  //
  // `.then(run, run)`, NOT `.then(run)`: a chain that only continues on
  // success is poisoned forever by one rejection. Measured in review — a
  // dev-mode error in an UNRELATED component, interleaved one microtask into
  // the window, rejected the flush promise `nextTick()` returns, and every
  // later announcement chained onto a dead promise. The region went silent
  // for the rest of the instance with nothing thrown at any call site. The
  // pre-chain code did not have this failure; the chain must not introduce it.
  const run = async () => {
    announcement.value = ''
    await nextTick()
    announcement.value = text
    await nextTick()
  }
  announcing = announcing.then(run, run)
  return announcing
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

/**
 * No `resolvedDisable` guard here, deliberately, unlike select(): the Remove
 * button takes `:disable`, and QBtn then blocks the click twice — the native
 * attribute and its own handler — so a guard in this function is UNREACHABLE.
 * Measured: deleting it left all tests green even with the attribute stripped
 * from the element by hand, which is the same untestable-branch shape a review
 * rejected on the previous PR. The defence that does the work is the `:disable`
 * binding, and a test asserts the button carries `disabled`.
 *
 * What this replaced: `pointer-events: none` on the preview element, a SINGLE
 * CSS layer, which the card structure deleted along with the element — review
 * (fable) then measured a disabled control clearing its own v-model on click.
 */
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
  // Extensions may carry interior dots — `.tar.gz` is a valid native accept
  // token and isAccepted() handles it with endsWith. The first regex allowed
  // one segment only and cried wolf on it: a false warning on a valid config
  // is worse than no warning, because it teaches people to ignore the real one.
  //
  // THIS REGEX AND isAccepted() ARE TWO VIEWS OF ONE RULE, and review
  // (componentLibrary-3bm) found them disagreeing at the edges: a MIME
  // token may not begin with "." ("./x" passed here, but isAccepted() routes
  // a leading dot to endsWith, which a base name with "/" never satisfies —
  // every drop rejected, silently); and an extension may carry "-" or "_"
  // (".a-b" was flagged as matching no file, but endsWith matches photo.a-b,
  // as the browser's own accept does). So the extension branch is exactly
  // what isAccepted() matches: a dot, then anything without a "/" — the HTML
  // accept token is "a string whose first character is U+002E", no more.
  const RULE = /^(\.[^/]+|[a-z0-9][a-z0-9.+-]*\/(\*|[a-z0-9][a-z0-9.+-]*))$/i
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

  // THE CARD ITSELF. Measured on the frame's NsImageUpload instance
  // (I165:10767;6259:19825, 870x229, Kale selected it 2026-09-22): bg
  // surface-alt, 1px solid border-default, radius-sm, 20 padding, 12 gap.
  // Styled here rather than wrapping NsCard: NsCard is radius-md with a
  // shadow, which is not what the frame draws, and a component dependency
  // would cost bytes for a border and a background.
  &__surface {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-3);
    padding: var(--ns-space-5);
    border: 1px solid var(--ns-color-border-default);
    border-radius: var(--ns-radius-sm);
    background: var(--ns-color-bg-surface-alt);
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

  // Heading row: title takes the space, the badge sits at the end. The title
  // must be allowed to shrink or a long one pushes the badge off the card.
  &__header {
    display: flex;
    align-items: center;
    gap: var(--ns-space-5);
  }

  &__label {
    flex: 1;
    min-width: 0;
    color: var(--ns-color-text-primary);
  }

  &__badge {
    flex-shrink: 0;
  }

  &__tips {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-1);
  }

  &__tip {
    margin: 0;
    color: var(--ns-color-text-secondary);
  }

  &__row {
    display: flex;
    align-items: center;
    gap: var(--ns-space-5);
  }

  // The 100x100 dashed tile, measured: radius-MD (12) while the card is
  // radius-sm (8) — the frame really does differ, so do not "tidy" them.
  // Fixed size, so it never stretches in the row's align-items: center.
  &__tile {
    position: relative;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border: 1px dashed var(--ns-color-border-primary);
    border-radius: var(--ns-radius-md);
    background: var(--ns-color-bg-surface);
    color: var(--ns-color-text-primary);
    cursor: pointer;
    overflow: hidden;
    transition:
      border-color var(--ns-duration-normal) var(--ns-easing-default),
      background var(--ns-duration-normal) var(--ns-easing-default);
  }

  // THE FOCUS RING IS ON THE TILE, driven by the INPUT'S focus: Tab lands on
  // the clipped input and the user must see something. A general sibling
  // selector, not `+`: the input's next sibling is the heading row now. The
  // tile is rendered in BOTH states, so unlike the old markup there is no
  // second target to keep in sync (that omission was a real WCAG 2.4.7 bug).
  &__input:focus-visible ~ &__row &__tile {
    outline: 2px solid var(--ns-color-border-focus);
    outline-offset: 2px;
  }

  &__tile:hover,
  &--dragging &__tile {
    background: var(--ns-color-bg-surface-alt);
  }

  &--disabled &__tile {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  // The filename and Remove dim with the tile: the button is disabled at the
  // component level, so without this a disabled card still looks half-live.
  &--disabled &__file {
    opacity: 0.6;
  }

  // Filled: the image covers the tile and the dashed edge goes, as drawn.
  &__thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__tile:has(&__thumb) {
    border-style: solid;
    border-color: var(--ns-color-border-default);
  }

  // INFERRED, not measured: the frame's row is named "image upload and label"
  // and has a 20 gap with only the tile in it (empty state). The filename and
  // remove button keep their pre-card behaviour, beside the tile.
  &__file {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
    gap: var(--ns-space-3);
  }

  &__filename {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ns-color-text-primary);
  }

  &--warning &__tile {
    border-color: var(--ns-color-border-warning);
  }

  &__warning {
    margin: 0;
    padding: var(--ns-space-2) var(--ns-space-3);
    border-radius: var(--ns-radius-xs);
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
