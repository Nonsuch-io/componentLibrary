<template>
  <q-tooltip
    :id="tooltipId"
    ref="tooltipRef"
    v-bind="$attrs"
    :delay="delay"
    :offset="offset"
    :anchor="anchor"
    :self="self"
    class="ns-tooltip"
    @mouseenter="handleTooltipMouseEnter"
    @mouseleave="handleTooltipMouseLeave"
    @focus="handleTooltipMouseEnter"
    @blur="handleTooltipMouseLeave"
    @before-hide="handleHidden"
  >
    <slot />
  </q-tooltip>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useAttrs, useId } from 'vue'
import type { QTooltip } from 'quasar'

declare const process: { env: { NODE_ENV?: string } } | undefined

/**
 * NsTooltip — A styled tooltip wrapping Quasar's QTooltip.
 *
 * Provides opinionated defaults: consistent delay, offset,
 * and token-based styling. Place inside a parent element.
 *
 * Quasar's QTooltip only opens on hover/touch and never associates itself
 * with its trigger element for assistive tech (componentLibrary-sj1). This
 * wrapper closes both gaps without patching Quasar:
 *  - shows on focus and hides on blur, in addition to Quasar's own
 *    hover/touch handling, so keyboard users can reach the tooltip
 *  - stays open while the pointer moves onto the tooltip itself, so it can
 *    be read under magnification
 *  - sets `aria-describedby` on the anchor element (the tooltip's DOM
 *    parent, same resolution Quasar uses internally) pointing at the
 *    tooltip's own id, and removes it again on unmount
 *  - Escape hides the tooltip without moving focus (WCAG 2.1 SC 1.4.13)
 *  - a TAP shows it, a second tap or a tap outside hides it
 *    (componentLibrary-ewc). QTooltip's own touch UX is press-and-hold:
 *    finger-down schedules a show, finger-up schedules a hide in the same
 *    timer slot, so a tap shows nothing — and a tap has no hover and, on
 *    iOS, no focus. Two attempts from OUTSIDE this component failed under
 *    review: a click that toggles hid what a mouse click's own focus had
 *    just shown, and a click that shows lost to the finger-up hide timer.
 *    Here, after a touch-driven click, a synthetic non-touch `pointerenter`
 *    drives Quasar's delayShow, which REPLACES the pending hide in that
 *    shared slot — the same lever the hover-onto-tooltip fix uses below.
 *    Keyboard focus is gated on `:focus-visible` (as Quasar's own focus
 *    handler is), so a tap's or click's focus no longer races the pointer.
 */

export type NsTooltipAnchor =
  | 'top left'
  | 'top middle'
  | 'top right'
  | 'top start'
  | 'top end'
  | 'center left'
  | 'center middle'
  | 'center right'
  | 'center start'
  | 'center end'
  | 'bottom left'
  | 'bottom middle'
  | 'bottom right'
  | 'bottom start'
  | 'bottom end'

export interface NsTooltipProps {
  /** Delay before showing (ms) */
  delay?: number
  /** Offset from anchor element [y, x] */
  offset?: [number, number]
  /** Anchor point on the parent */
  anchor?: NsTooltipAnchor
  /** Self alignment point */
  self?: NsTooltipAnchor
}

withDefaults(defineProps<NsTooltipProps>(), {
  delay: 300,
  offset: () => [8, 0],
  anchor: 'bottom middle',
  self: 'top middle',
})

const $attrs = useAttrs()
const tooltipId = `ns-tooltip-${useId()}`
const tooltipRef = ref<QTooltip | null>(null)

let anchorEl: HTMLElement | null = null

/**
 * `focusin`/`focusout` BUBBLE, so an anchor wrapping more than one focusable
 * child fires focusout(A) immediately followed by focusin(B) when Tab moves
 * between them — even though focus never left the anchor. Hiding on the first
 * and showing on the second makes the tooltip visibly flicker on every such
 * transition. Coalescing across a microtask turns that pair into a no-op while
 * leaving a genuine departure (focusout with no following focusin) intact.
 */
let focusHideQueued = false

function handleFocusIn(event: FocusEvent) {
  focusHideQueued = false
  // Keyboard focus only, as Quasar's own onFocusin: a pointer's focus (a
  // mouse click's on Chromium/Firefox, a tap's on Android) used to show the
  // tooltip a beat before the pointer path hid it again. `:focus-visible`
  // is what the browser says about the focus's origin; a selector engine
  // without it (older jsdom) treats focus as visible, as before.
  const el = event.target as HTMLElement | null
  if (el && !matchesFocusVisible(el)) return
  tooltipRef.value?.show()
}

function matchesFocusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

/**
 * TAP TO SHOW. A touch-driven click (a tap) after QTooltip's finger-up hide
 * has been scheduled: re-dispatching a non-touch pointerenter on the anchor
 * makes Quasar's delayShow take the shared timer slot from that hide, so the
 * tooltip shows after `delay` and stays — touch has no pointerleave. A
 * second tap hides it; so does a tap anywhere else, through a capture
 * listener that lives only while a tap holds it open. Any hide (Escape,
 * blur, that listener) releases it via QTooltip's `before-hide` — `hide`
 * fires after the leave transition, and a test caught the listener alive
 * through a hover-show in that window.
 */
let lastPointerType = ''
let tapShown = false

function handlePointerDown(event: PointerEvent) {
  lastPointerType = event.pointerType
}

function handleClick(event: MouseEvent) {
  const pointerType = (event as PointerEvent).pointerType || lastPointerType
  lastPointerType = ''
  if (pointerType !== 'touch') return
  if (tapShown) {
    tooltipRef.value?.hide()
    return
  }
  tapShown = true
  document.addEventListener('pointerdown', handleOutsidePointerDown, true)
  anchorEl?.dispatchEvent(new PointerEvent('pointerenter'))
  anchorEl?.dispatchEvent(new MouseEvent('mouseenter'))
}

function handleOutsidePointerDown(event: PointerEvent) {
  const target = event.target as Node | null
  if (!target) return
  if (anchorEl?.contains(target)) return
  if (tooltipRef.value?.$el?.contains?.(target)) return
  tooltipRef.value?.hide()
}

function handleHidden() {
  if (!tapShown) return
  tapShown = false
  document.removeEventListener('pointerdown', handleOutsidePointerDown, true)
}

function handleFocusOut() {
  focusHideQueued = true
  queueMicrotask(() => {
    if (focusHideQueued) tooltipRef.value?.hide()
  })
}

/**
 * Escape is bound to the DOCUMENT, not the anchor.
 *
 * WCAG 2.1 SC 1.4.13 requires hover-triggered content to be dismissible, and a
 * listener on the anchor only fires when focus is already inside it. A mouse
 * user who hovers a trigger has focus on document.body, so an anchor-scoped
 * handler covers precisely the path that does NOT need it and misses the one
 * the criterion is about. Quasar provides no Escape handling of its own
 * (verified in node_modules/quasar/src/components/tooltip/QTooltip.js).
 *
 * Registered only while a listener exists, and torn down on unmount.
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  tooltipRef.value?.hide()
}

// BOTH EVENTS, because Quasar changed which one it listens to and our peer
// range spans the change. Measured in dist/quasar.client.js, the artifact that
// actually runs:
//
//   2.25.0  QTooltip binds mouseenter / mouseleave on the anchor
//   2.27.0  binds pointerenter / pointerleave — mouseenter is not listened to
//
// The tooltip lives in a body-level portal, not inside the anchor, so a pointer
// moving onto it never reaches Quasar's anchor logic and the pending hide fires
// anyway. Re-dispatching on the anchor drives Quasar's own delayShow, which
// cancels that hide as a side effect of registering its own timer — reusing its
// delay/hideDelay handling rather than reimplementing it.
//
// Old Quasar ignores the PointerEvent, new Quasar ignores the MouseEvent, so
// dispatching both is correct across ^2.17.0 rather than only on the version we
// happen to develop against. Quasar's delayShow explicitly tolerates synthetic
// PointerEvents (isPrimary false, pointerType empty), with a comment saying it
// is for everyone dispatching them, tests included. Story: componentLibrary-b6j.
function handleTooltipMouseEnter() {
  anchorEl?.dispatchEvent(new PointerEvent('pointerenter'))
  anchorEl?.dispatchEvent(new MouseEvent('mouseenter'))
}

function handleTooltipMouseLeave() {
  anchorEl?.dispatchEvent(new PointerEvent('pointerleave'))
  anchorEl?.dispatchEvent(new MouseEvent('mouseleave'))
}

/**
 * `aria-describedby` is a SPACE-SEPARATED ID LIST, not a single value.
 *
 * Setting it outright would destroy any description a consumer had already
 * associated with the anchor, and removing the whole attribute on unmount
 * would delete theirs along with ours — an accessibility fix that silently
 * removes accessibility metadata. The library's own tests cannot see that;
 * only the consuming app would, which is exactly why it is handled here.
 */
function describedByIds(el: HTMLElement): string[] {
  return (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean)
}

function addDescribedBy(el: HTMLElement) {
  const ids = describedByIds(el)
  if (!ids.includes(tooltipId)) ids.push(tooltipId)
  el.setAttribute('aria-describedby', ids.join(' '))
}

function removeDescribedBy(el: HTMLElement) {
  const ids = describedByIds(el).filter((id) => id !== tooltipId)
  // Only drop the attribute entirely when OUR id was the only one in it.
  if (ids.length > 0) el.setAttribute('aria-describedby', ids.join(' '))
  else el.removeAttribute('aria-describedby')
}

onMounted(() => {
  // Quasar resolves QTooltip's anchor the same way internally when `target`
  // is left at its default (`true`): the DOM parent of QTooltip's own root
  // node. See useAnchor's pickAnchorEl() -> setAnchorEl(proxy.$el.parentNode)
  // in node_modules/quasar/src/composables/private.use-anchor/use-anchor.js.
  const el = tooltipRef.value?.$el?.parentElement
  if (!el) return

  anchorEl = el
  addDescribedBy(el)
  el.addEventListener('focusin', handleFocusIn)
  el.addEventListener('focusout', handleFocusOut)
  el.addEventListener('pointerdown', handlePointerDown, { passive: true })
  el.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)

  // QTooltip's `target` prop redirects which element Quasar anchors to
  // (pickAnchorEl in use-anchor.js). This wrapper's a11y layer always attaches
  // to the DOM parent, so with `target` set the tooltip would point visually at
  // one element while aria-describedby and the focus listeners landed on
  // another — actively WRONG assistive-tech metadata rather than merely absent.
  // Refuse quietly-wrong behaviour and say so, the same way NsButton warns
  // about Quasar styling attrs it cannot honour.
  // GUARDED ON process.env.NODE_ENV, NOT import.meta.env — load-bearing, and I
  // got it wrong here once before shipping. Vite inlines import.meta.env.* to a
  // literal when it builds THIS LIBRARY, so the branch is tree-shaken out of
  // dist/ and the warning never reaches a consumer, while still passing tests
  // because vitest runs from source. process.env.NODE_ENV survives the library
  // build verbatim for the consumer's bundler. Same reasoning as
  // useNsAttrConflictWarning, which documents the measurement.
  if (
    (typeof process === 'undefined' || process?.env?.NODE_ENV !== 'production') &&
    $attrs.target !== undefined
  ) {
    console.warn(
      '[NsTooltip] `target` is not supported: the accessibility wiring ' +
        '(aria-describedby, focus and Escape handling) attaches to the ' +
        "tooltip's DOM parent, so passing `target` would point the tooltip at " +
        'one element and describe another. Place NsTooltip inside the element ' +
        'it describes instead.',
    )
  }
})

onBeforeUnmount(() => {
  const el = anchorEl
  if (!el) return
  removeDescribedBy(el)
  el.removeEventListener('focusin', handleFocusIn)
  el.removeEventListener('focusout', handleFocusOut)
  el.removeEventListener('pointerdown', handlePointerDown)
  el.removeEventListener('click', handleClick)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('pointerdown', handleOutsidePointerDown, true)
  focusHideQueued = false
  tapShown = false
  anchorEl = null
})
</script>

<style lang="sass">
// NOT SCOPED, AND THAT IS THE POINT. Quasar teleports QTooltip to a body-level
// portal (usePortal), and Vue does not stamp a component scope attribute onto a
// teleported root — so `.ns-tooltip[data-v-xxxx]` matched NOTHING. Measured: the
// live element's attributes are id, class, role, style, with no data-v-*.
//
// Every rule below was therefore inert for the whole life of this component. The
// tooltip rendered with Quasar's default font, size, radius and padding, and the
// pointer-events override never applied — which is why the hoverable half of
// WCAG 2.1 SC 1.4.13 could not work even with the correct events.
//
// COST OF THE FIX, stated because it is real: a global selector leaves our scope,
// so `.ns-tooltip` is now a name a consumer stylesheet can collide with. That is
// the price of styling something Vue has teleported out of reach; the alternative
// is not styling it at all. Story: componentLibrary-3sy.
.ns-tooltip
  // Quasar renders tooltip content with `no-pointer-events`, which is
  // `pointer-events: none !important` (quasar/src/css/core/mouse.sass). That
  // makes the tooltip invisible to hit-testing, so a real pointer moving onto it
  // never generates an enter event and it closes out from under the reader.
  // !important is required to beat theirs.
  pointer-events: auto !important
  font-family: var(--ns-font-family-text)
  font-size: var(--ns-font-size-sm, 0.875rem)
  border-radius: var(--ns-radius-xs)
  padding: var(--ns-space-1, 4px) var(--ns-space-2, 8px)
</style>
