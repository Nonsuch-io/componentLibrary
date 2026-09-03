<template>
  <nav class="ns-nav-sidebar" :class="{ 'ns-nav-sidebar--expanded': isExpanded }">
    <!-- Toggle button -->
    <!--
      NO aria-label WHEN EXPANDED, deliberately. The button then takes its
      accessible name from the visible text, so the two cannot disagree.

      It used to be named "Collapse menu" while displaying "Hide Menu" — a WCAG
      2.5.3 label-in-name failure: a voice-control user saying "click Hide Menu"
      matched nothing, and a screen reader announced words that were not on
      screen. axe cannot catch this (label-content-name-mismatch is experimental
      and off by default), so the test in NsNavSidebar.test.ts is the only guard.

      Collapsed, the button is icon-only and has no visible text to be named
      from, so an aria-label is correct there. Story: componentLibrary-1ps.
    -->
    <button
      v-if="showToggle"
      class="ns-nav-sidebar__toggle-btn"
      :aria-label="isExpanded ? undefined : expandText"
      @click="isExpanded = !isExpanded"
    >
      <AnimatedEye :open="isExpanded" />
      <span v-if="isExpanded" class="ns-nav-sidebar__toggle-label">{{ collapseText }}</span>
    </button>

    <!-- Main nav items -->
    <ul class="ns-nav-sidebar__list">
      <template v-for="item in items" :key="item.id">
        <li
          v-if="item.separator"
          class="ns-nav-sidebar__separator"
          role="presentation"
          aria-hidden="true"
        />
        <li class="ns-nav-sidebar__item">
          <!--
            aria-label IS SET ONLY WHEN COLLAPSED, and the condition is the point.
            The label span below is `v-if="isExpanded"`, so in the collapsed state
            each pill held an icon and nothing else — axe reported link-name /
            button-name on EVERY item, and a screen-reader user heard "link" with
            no name for the entire primary navigation. Sighted users decode the
            icons, so nothing on screen contradicted it (componentLibrary-mxa).

            NOT unconditional: an aria-label set while the visible label renders
            OVERRIDES that text, so what a screen reader announces could silently
            drift from what everyone else reads.
          -->
          <component
            :is="item.to && !item.disable ? 'a' : 'button'"
            :href="item.to && !item.disable ? item.to : undefined"
            :type="item.to && !item.disable ? undefined : 'button'"
            class="ns-nav-sidebar__pill"
            :class="{
              'ns-nav-sidebar__pill--active': isActive(item),
              'ns-nav-sidebar__pill--disabled': item.disable,
            }"
            :aria-current="isActive(item) ? 'page' : undefined"
            :aria-expanded="hasSub(item) && !item.disable ? openSub === item.id : undefined"
            :aria-controls="
              hasSub(item) && !item.disable && openSub === item.id ? flyoutId : undefined
            "
            :aria-label="isExpanded ? undefined : item.label"
            :aria-disabled="item.disable ? 'true' : undefined"
            :tabindex="item.disable ? -1 : undefined"
            @click="onItemClick(item, $event)"
          >
            <NsIcon
              v-if="typeof item.icon === 'string'"
              :name="item.icon"
              class="ns-nav-sidebar__icon"
              size="20px"
            />
            <component
              :is="item.icon"
              v-else
              class="ns-nav-sidebar__icon"
              :size="20"
              weight="regular"
            />
            <span v-if="isExpanded" class="ns-nav-sidebar__label">{{ item.label }}</span>
            <svg
              v-if="hasSub(item)"
              class="ns-nav-sidebar__chevron"
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
              />
            </svg>
          </component>
        </li>
      </template>
    </ul>

    <!--
      NO aria-haspopup ON THE PILLS, deliberately. It used to be "true", which
      maps to the value "menu" per ARIA — announcing a menu, while what opens is
      this plain <div> of links and buttons with no role="menu" and no
      role="menuitem" children. Announced structure that does not match reality.

      The alternative was building a real menu, which obliges the full WAI-ARIA
      keyboard contract: arrow keys, Home/End, type-ahead. Announcing a menu we
      have not built is worse than announcing nothing — the same reasoning that
      made NsMenu deliberately roleless in componentLibrary-nb7, and the same
      reasoning Quasar used when 2.25.0 stopped writing aria-haspopup unless the
      popup's role is one of dialog/grid/listbox/menu/tree.

      aria-expanded and aria-controls STAY. Those are accurate: the pill does
      toggle a region, and that region does have this id. Story: componentLibrary-cfo.
    -->
    <!-- Sub-menu flyout — teleported to <body> so it escapes the drawer's
         overflow clipping (q-drawer__content .scroll = overflow:auto, and
         ns-app-shell__drawer = overflow:hidden). Only one flyout is open at a
         time, so we render a single instance positioned against its anchor. -->
    <Teleport to="body">
      <div
        v-if="activeFlyout"
        :id="flyoutId"
        ref="flyoutRootEl"
        class="ns-nav-sidebar__flyout"
        :style="flyoutStyle"
        :data-theme="flyoutTheme"
      >
        <component
          :is="sub.to && !sub.disable ? 'a' : 'button'"
          v-for="(sub, subIdx) in activeFlyout.subs"
          :key="sub.id ?? sub.label"
          :href="sub.to && !sub.disable ? sub.to : undefined"
          :type="sub.to && !sub.disable ? undefined : 'button'"
          class="ns-nav-sidebar__sub-pill"
          :class="{
            'ns-nav-sidebar__sub-pill--active': modelValue === subId(activeFlyout.id, sub),
            'ns-nav-sidebar__sub-pill--closing': activeFlyout.closing,
            'ns-nav-sidebar__sub-pill--disabled': sub.disable,
          }"
          :aria-disabled="sub.disable ? 'true' : undefined"
          :tabindex="sub.disable ? -1 : undefined"
          :style="subItemStyle(subIdx, activeFlyout.subs.length, activeFlyout.id)"
          @click="onSubClick(activeFlyout.id, sub, $event)"
        >
          {{ sub.label }}
        </component>
      </div>
    </Teleport>

    <!-- Bottom item (e.g. Settings) -->
    <div v-if="bottomItem" class="ns-nav-sidebar__bottom">
      <component
        :is="bottomItem.to && !bottomItem.disable ? 'a' : 'button'"
        :href="bottomItem.to && !bottomItem.disable ? bottomItem.to : undefined"
        :type="bottomItem.to && !bottomItem.disable ? undefined : 'button'"
        class="ns-nav-sidebar__pill"
        :class="{
          'ns-nav-sidebar__pill--active': isActive(bottomItem),
          'ns-nav-sidebar__pill--disabled': bottomItem.disable,
        }"
        :aria-current="isActive(bottomItem) ? 'page' : undefined"
        :aria-expanded="
          hasSub(bottomItem) && !bottomItem.disable ? openSub === bottomItem.id : undefined
        "
        :aria-controls="
          hasSub(bottomItem) && !bottomItem.disable && openSub === bottomItem.id
            ? flyoutId
            : undefined
        "
        :aria-label="isExpanded ? undefined : bottomItem.label"
        :aria-disabled="bottomItem.disable ? 'true' : undefined"
        :tabindex="bottomItem.disable ? -1 : undefined"
        @click="onItemClick(bottomItem, $event)"
      >
        <NsIcon
          v-if="typeof bottomItem.icon === 'string'"
          :name="bottomItem.icon"
          class="ns-nav-sidebar__icon"
          size="20px"
        />
        <component
          :is="bottomItem.icon"
          v-else
          class="ns-nav-sidebar__icon"
          :size="20"
          weight="regular"
        />
        <span v-if="isExpanded" class="ns-nav-sidebar__label">{{ bottomItem.label }}</span>
        <svg
          v-if="hasSub(bottomItem)"
          class="ns-nav-sidebar__chevron"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"
          />
        </svg>
      </component>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onUnmounted,
  watch,
  nextTick,
  useId,
  defineAsyncComponent,
  type Component,
} from 'vue'
// Lazy-loaded: AnimatedEye is a decorative ~1.5–2 kB gz blink animation that only
// renders when the collapse toggle is shown. Splitting it into its own async
// chunk keeps it out of the main bundle (and off consumers who set showToggle=false).
const AnimatedEye = defineAsyncComponent(() => import('./AnimatedEye.vue'))
import NsIcon from '../NsIcon/NsIcon.vue'
import { useNsLocale } from '../../composables/useNsLocale'

/**
 * A sub-item under a parent nav item.
 * Can also be provided as a plain string (backward-compatible shorthand) —
 * NsNavSidebar normalises strings to `{ label: <string> }` internally.
 */
export interface NsNavSubItem {
  /** Stable id used for v-model selection. If omitted, derived from `<parent.id>/<kebab-label>`. */
  id?: string
  label: string
  /** When set, the sub-pill renders as `<a href>` and the browser handles navigation. */
  to?: string
  /** Disables interaction; aria-disabled + tabindex=-1 + visual fade. */
  disable?: boolean
}

export interface NsNavItem {
  id: string
  label: string
  /**
   * Icon as either a Vue Component (e.g. Phosphor) or a material-icon name string
   * (wrapped in NsIcon internally for Quasar parity). Optional — items without
   * an icon render label-only.
   */
  icon?: string | Component
  /**
   * Navigation target. When set, the pill renders as `<a href>` instead of `<button>`,
   * matching Quasar's QItem `to` convention. Note: this is `<a href>`, not `<router-link>` —
   * consumers wanting SPA navigation should intercept the emitted click event with
   * `e.preventDefault()` and call `router.push(item.to)`.
   */
  to?: string
  /** Explicit active state override (in addition to the id/sub derived match). */
  active?: boolean
  /** Disables interaction (aria-disabled, non-focusable, visually faded). */
  disable?: boolean
  /** When true, renders a visual divider before this item. */
  separator?: boolean
  /** Sub-items shown in a flyout when this item is tapped. */
  sub?: string[] | NsNavSubItem[]
}

export interface NsNavSidebarProps {
  items: NsNavItem[]
  bottomItem?: NsNavItem
  modelValue: string
  /** Initial expanded state when uncontrolled. Ignored if `expanded` is provided. */
  defaultExpanded?: boolean
  /**
   * Controlled expanded state (v-model:expanded). When provided, the sidebar
   * mirrors this value and emits `update:expanded` instead of managing state
   * internally. Useful when a parent (e.g. NsAppShell's drawer) needs to drive
   * mini/full mode.
   */
  expanded?: boolean
  /**
   * Whether to render the toggle button (animated eye). Defaults to true.
   * Pass false when a parent already provides its own collapse affordance.
   */
  showToggle?: boolean
  /**
   * VISIBLE text on the toggle when the sidebar is expanded. Overrides the
   * active locale for this instance.
   *
   * It drives the visible string, and the accessible name follows FROM it —
   * there is deliberately no separate label prop. One that set `aria-label`
   * independently would let the name and the visible text disagree again,
   * which is the WCAG 2.5.3 failure componentLibrary-1ps fixed here.
   */
  collapseLabel?: string
  /**
   * Accessible name for the toggle when COLLAPSED, where it is icon-only and
   * has no visible text to be named from. Overrides the active locale.
   */
  expandLabel?: string
}

const props = withDefaults(defineProps<NsNavSidebarProps>(), {
  bottomItem: undefined,
  collapseLabel: undefined,
  expandLabel: undefined,
  defaultExpanded: true,
  expanded: undefined,
  showToggle: true,
})

// The only user-facing strings this component owns. Previously hardcoded
// English literals in the template — i18n is one of this repo's named blind
// spots, and a hardcoded string is invisible to every gate we run.
// Story: componentLibrary-1ps.
const locale = useNsLocale()

// prop ?? locale, the same shape NsBreadcrumbs and NsMarketingEmailCapture use.
// componentLibrary-knw.
const collapseText = computed(() => props.collapseLabel ?? locale.navigation.collapseMenu)
const expandText = computed(() => props.expandLabel ?? locale.navigation.expandMenu)

const emit = defineEmits<{
  'update:modelValue': [id: string]
  'update:expanded': [expanded: boolean]
  click: [event: MouseEvent, item: NsNavItem | NsNavSubItem]
}>()

const internalExpanded = ref(props.expanded ?? props.defaultExpanded)
const isExpanded = computed({
  get: () => props.expanded ?? internalExpanded.value,
  set: (value: boolean) => {
    internalExpanded.value = value
    emit('update:expanded', value)
  },
})
const openSub = ref<string | null>(null)
const closingSub = ref<string | null>(null)
const closeTimers = new Map<string, ReturnType<typeof setTimeout>>()

// The flyout is teleported to <body>, so it can't be absolutely positioned
// relative to its pill. We capture the anchor pill on open and drive the
// flyout's position with `position: fixed` off its bounding rect.
const anchorEl = ref<HTMLElement | null>(null)
const flyoutRootEl = ref<HTMLElement | null>(null)
const flyoutStyle = ref<Record<string, string>>({})
// Mirrors the anchor's dark-theme context onto the teleported flyout. The flyout
// lives on <body>, so it won't inherit dark mode applied to a sub-<body> ancestor
// (Quasar's .q-dark on the drawer, or a wrapper's [data-theme="dark"]).
const flyoutTheme = ref<'dark' | undefined>(undefined)
// Stable id linking the anchor pill (aria-controls) to the flyout it opens.
const flyoutId = useId()

// Selectors that tokens.css treats as a dark-mode trigger (plus Quasar's own).
const DARK_CONTEXT_SELECTOR = '.q-dark, .body--dark, .dark, [data-theme="dark"]'

/**
 * The single item whose flyout is currently open (or animating closed). Only
 * one is ever visible at a time, so we hoist one flyout out of the item loop
 * and teleport it, rather than rendering one per item inside the clipped drawer.
 */
const activeFlyout = computed(() => {
  const id = openSub.value ?? closingSub.value
  if (!id) return null
  const item = findFlyoutItem(id)
  if (!item || !hasSub(item)) return null
  return { id, label: item.label, subs: normalizedSub(item), closing: closingSub.value === id }
})

const FLYOUT_GAP = 8

function updateFlyoutPosition() {
  const anchor = anchorEl.value
  if (!anchor) return
  const a = anchor.getBoundingClientRect()
  const flyout = flyoutRootEl.value
  // Fall back to the CSS min-width before the flyout has been measured (the
  // pre-render call); the nextTick call re-runs with real dimensions.
  const fw = flyout?.offsetWidth || 140
  const fh = flyout?.offsetHeight || 0
  const vw = window.innerWidth
  const vh = window.innerHeight
  const rtl = anchor.closest('[dir="rtl"]') !== null

  const rightOfPill = a.right + FLYOUT_GAP
  const leftOfPill = a.left - fw - FLYOUT_GAP

  // Preferred side flips for RTL; each side flips again if it would overflow the
  // viewport, so the flyout is never clipped off-screen.
  let left: number
  if (rtl) {
    left = leftOfPill >= FLYOUT_GAP ? leftOfPill : rightOfPill
  } else {
    left = rightOfPill + fw <= vw - FLYOUT_GAP ? rightOfPill : leftOfPill
  }
  left = Math.max(FLYOUT_GAP, Math.min(left, vw - fw - FLYOUT_GAP))

  // Vertical clamp keeps it on-screen when the anchor sits near the bottom edge
  // (e.g. the bottom item's flyout).
  let top = a.top
  if (fh > 0 && top + fh > vh - FLYOUT_GAP) {
    top = Math.max(FLYOUT_GAP, vh - fh - FLYOUT_GAP)
  }

  flyoutStyle.value = { position: 'fixed', top: `${top}px`, left: `${left}px` }
}

function syncFlyoutTheme() {
  flyoutTheme.value = anchorEl.value?.closest(DARK_CONTEXT_SELECTOR) ? 'dark' : undefined
}

// --- viewport (scroll / resize) tracking ---
function attachViewportListeners() {
  detachViewportListeners()
  // capture: true so we also catch scrolling of the drawer's inner content,
  // not just the window — the flyout must track its anchor as the nav scrolls.
  window.addEventListener('scroll', updateFlyoutPosition, true)
  window.addEventListener('resize', updateFlyoutPosition)
}
function detachViewportListeners() {
  window.removeEventListener('scroll', updateFlyoutPosition, true)
  window.removeEventListener('resize', updateFlyoutPosition)
}

// --- anchor-size tracking: the sidebar collapse and the drawer mini↔full
// transition animate `width` with no scroll event, which would otherwise strand
// the flyout beside a pill that has since moved. ---
let anchorResizeObserver: ResizeObserver | null = null
function observeAnchor() {
  disconnectAnchorObserver()
  if (typeof ResizeObserver === 'undefined' || !anchorEl.value) return
  anchorResizeObserver = new ResizeObserver(() => updateFlyoutPosition())
  anchorResizeObserver.observe(anchorEl.value)
}
function disconnectAnchorObserver() {
  anchorResizeObserver?.disconnect()
  anchorResizeObserver = null
}

// --- dismiss on outside pointerdown: the flyout now lives on <body>, so it can
// outlive its visual context (e.g. a mobile drawer sliding closed behind it, or
// the sidebar collapsing). Close it when a pointerdown lands outside both the
// flyout and its anchor pill. ---
function onDocumentPointerDown(e: Event) {
  // Already animating closed — don't re-arm the close timer, which would keep
  // the (invisible but still hit-testable) flyout lingering in the DOM.
  if (closingSub.value) return
  const target = e.target as Node | null
  if (!target) return
  if (anchorEl.value?.contains(target)) return
  if (flyoutRootEl.value?.contains(target)) return
  if (openSub.value) closeSubMenu(openSub.value)
}
// Close on Escape (from anywhere) and return focus to the anchor pill.
function onDocumentKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  const id = openSub.value ?? closingSub.value
  if (!id) return
  const anchor = anchorEl.value
  closeSubMenu(id)
  anchor?.focus()
}
// Close when focus leaves both the flyout and its anchor (e.g. Tab past the last
// sub-item). The flyout is teleported to <body>, so it isn't adjacent to the
// anchor in the tab order — without this, focus can silently walk out of it.
function onDocumentFocusIn(e: FocusEvent) {
  if (closingSub.value) return
  const target = e.target as Node | null
  if (!target) return
  if (anchorEl.value?.contains(target)) return
  if (flyoutRootEl.value?.contains(target)) return
  if (openSub.value) closeSubMenu(openSub.value)
}
function attachDismissListener() {
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
  document.addEventListener('keydown', onDocumentKeydown, true)
  document.addEventListener('focusin', onDocumentFocusIn, true)
}
function detachDismissListener() {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
  document.removeEventListener('keydown', onDocumentKeydown, true)
  document.removeEventListener('focusin', onDocumentFocusIn, true)
}

// Reposition, sync theme, wire listeners, and move focus whenever a flyout
// opens; tear it all down when it closes.
watch(
  () => activeFlyout.value?.id,
  (id) => {
    if (id) {
      syncFlyoutTheme()
      updateFlyoutPosition()
      attachViewportListeners()
      observeAnchor()
      attachDismissListener()
      nextTick(() => {
        // Re-run now that the flyout is in the DOM and measurable, so the
        // edge-flip / clamp use its real width and height.
        updateFlyoutPosition()
        // Move focus into the freshly opened menu — the flyout is teleported out
        // of the nav's tab position, so keyboard/SR users need it brought to them.
        flyoutRootEl.value
          ?.querySelector<HTMLElement>('.ns-nav-sidebar__sub-pill:not([aria-disabled="true"])')
          ?.focus()
      })
    } else {
      detachViewportListeners()
      disconnectAnchorObserver()
      detachDismissListener()
      anchorEl.value = null
    }
  },
)

function normalizedSub(item: NsNavItem): NsNavSubItem[] {
  if (!item.sub) return []
  return item.sub.map((s) => (typeof s === 'string' ? { label: s } : s))
}

function hasSub(item: NsNavItem): boolean {
  return !!item.sub && item.sub.length > 0
}

/** Items that can own a flyout: the main list plus the optional bottom item. */
function findFlyoutItem(id: string): NsNavItem | undefined {
  if (props.bottomItem?.id === id) return props.bottomItem
  return props.items.find((i) => i.id === id)
}

function subId(parentId: string, sub: NsNavSubItem): string {
  return sub.id ?? `${parentId}/${sub.label.toLowerCase().replace(/ /g, '-')}`
}

function isActive(item: NsNavItem): boolean {
  if (item.active === true) return true
  if (props.modelValue === item.id) return true
  if (item.sub) {
    return normalizedSub(item).some((sub) => props.modelValue === subId(item.id, sub))
  }
  return false
}

function subItemStyle(idx: number, total: number, itemId: string): Record<string, string> {
  const isClosing = closingSub.value === itemId
  const animIdx = isClosing ? total - 1 - idx : idx
  const easing = isClosing ? 'cubic-bezier(0.4,0,0.2,1)' : 'cubic-bezier(0.34,1.56,0.64,1)'
  const name = isClosing ? 'ns-sidebar-sub-out' : 'ns-sidebar-sub-in'
  return { animation: `${name} 0.28s ${easing} ${animIdx * 60}ms both` }
}

function openSubMenu(id: string) {
  // Clear every pending close timer — not just this id's — so a stale timer from
  // the previously open menu can't fire and close the one we're opening.
  closeTimers.forEach((t) => clearTimeout(t))
  closeTimers.clear()
  closingSub.value = null
  openSub.value = id
}

function closeSubMenu(id: string) {
  const existing = closeTimers.get(id)
  if (existing) clearTimeout(existing)
  const item = findFlyoutItem(id)
  const subCount = item ? normalizedSub(item).length : 0
  closingSub.value = id
  const timer = setTimeout(
    () => {
      // Guard against clobbering a different menu that opened in the meantime.
      if (openSub.value === id) openSub.value = null
      if (closingSub.value === id) closingSub.value = null
      closeTimers.delete(id)
    },
    subCount * 45 + 200,
  )
  closeTimers.set(id, timer)
}

function onItemClick(item: NsNavItem, event: MouseEvent) {
  if (item.disable) {
    event.preventDefault()
    return
  }
  emit('click', event, item)
  if (!hasSub(item)) {
    if (openSub.value) closeSubMenu(openSub.value)
    emit('update:modelValue', item.id)
    return
  }
  if (openSub.value === item.id) {
    closeSubMenu(item.id)
  } else {
    if (openSub.value) closeSubMenu(openSub.value)
    // The clicked pill is the anchor the teleported flyout positions against.
    anchorEl.value = event.currentTarget as HTMLElement
    openSubMenu(item.id)
  }
}

function onSubClick(parentId: string, sub: NsNavSubItem, event: MouseEvent) {
  if (sub.disable) {
    event.preventDefault()
    return
  }
  emit('click', event, sub)
  closeSubMenu(parentId)
  emit('update:modelValue', subId(parentId, sub))
  // Button sub-items don't navigate, so return focus to the anchor pill instead
  // of letting it drop to <body> when the closing flyout is removed.
  if (!sub.to) anchorEl.value?.focus()
}

// Cancel any in-flight flyout-close timers so they don't fire after unmount
// and mutate refs on a dead instance.
onUnmounted(() => {
  closeTimers.forEach((t) => clearTimeout(t))
  closeTimers.clear()
  detachViewportListeners()
  disconnectAnchorObserver()
  detachDismissListener()
})
</script>

<style lang="scss" scoped>
$pill-h: 44px;
$pill-radius: 999px;
// Collapsed container width — chosen so pills render as ovals (~60×44)
// rather than circles (~44×44), giving the icon and sub-menu chevron
// room to coexist when the sidebar is collapsed.
$icon-size: 76px;
$active-bg: var(--ns-color-bg-brand);

@mixin gradient-border {
  border: 1.5px solid transparent;
  background:
    linear-gradient(var(--ns-color-bg-canvas), var(--ns-color-bg-canvas)) padding-box,
    radial-gradient(ellipse at 30% 50%, rgba(242, 150, 77, 0.55) 0%, rgba(255, 255, 255, 0.55) 100%)
      border-box;
}

.ns-nav-sidebar {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: $icon-size;
  padding: var(--ns-space-2);
  box-sizing: border-box;
  transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  &--expanded {
    width: 166px; // 150px pill + 8px padding each side
  }
}

// Toggle button (Hide Menu / eye)
.ns-nav-sidebar__toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: $pill-h;
  padding: 0 10px;

  .ns-nav-sidebar--expanded & {
    justify-content: flex-start;
  }

  border: none;
  border-radius: $pill-radius;
  background: transparent;
  color: var(--ns-color-text-brand);
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: background 150ms ease;

  &:hover {
    background: var(--ns-color-bg-brand-subtle);
  }
}

.ns-nav-sidebar__toggle-label {
  flex-shrink: 0;
}

// Nav list
.ns-nav-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.ns-nav-sidebar__item {
  position: relative;
}

// Divider rendered before items that have separator: true
.ns-nav-sidebar__separator {
  height: 1px;
  margin: 4px 8px;
  background: var(--ns-color-border-default, currentColor);
  opacity: 0.2;
  list-style: none;
}

// Main pill
.ns-nav-sidebar__pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: $pill-h;
  padding: 0 10px;
  border-radius: $pill-radius;
  color: var(--ns-color-text-primary);
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  text-decoration: none; // for <a> rendering
  transition:
    background 150ms ease,
    color 150ms ease;
  @include gradient-border;

  .ns-nav-sidebar--expanded & {
    justify-content: flex-start;
  }

  &:hover:not(&--active):not(&--disabled) {
    background:
      radial-gradient(ellipse at center, rgba(213, 99, 7, 0.22) 0%, transparent 90%) padding-box,
      linear-gradient(var(--ns-color-bg-canvas), var(--ns-color-bg-canvas)) padding-box,
      radial-gradient(
          ellipse at 30% 50%,
          rgba(242, 150, 77, 0.55) 0%,
          rgba(255, 255, 255, 0.55) 100%
        )
        border-box;
    border-color: transparent;
  }

  &--active {
    background: $active-bg;
    border-color: transparent;
    color: var(--ns-color-text-on-brand);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

.ns-nav-sidebar__icon {
  flex-shrink: 0;
}

.ns-nav-sidebar__label {
  flex: 1;
  text-align: left;
}

.ns-nav-sidebar__chevron {
  flex-shrink: 0;

  .ns-nav-sidebar__pill--active & {
    opacity: 0.8;
  }
}

// Flyout — teleported to <body>; `position: fixed` + top/left are supplied
// inline from the anchor pill's rect (see updateFlyoutPosition). z-index sits
// above Quasar drawers/overlays, matching QMenu's layer.
.ns-nav-sidebar__flyout {
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 6000;
  min-width: 140px;
}

.ns-nav-sidebar__sub-pill {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border-radius: $pill-radius;
  color: var(--ns-color-text-primary);
  font-family: var(--ns-font-family-text);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none; // for <a> rendering
  transition: background 150ms ease;
  @include gradient-border;

  &:hover:not(&--active):not(&--disabled) {
    background:
      radial-gradient(ellipse at center, rgba(213, 99, 7, 0.22) 0%, transparent 90%) padding-box,
      linear-gradient(var(--ns-color-bg-canvas), var(--ns-color-bg-canvas)) padding-box,
      radial-gradient(
          ellipse at 30% 50%,
          rgba(242, 150, 77, 0.55) 0%,
          rgba(255, 255, 255, 0.55) 100%
        )
        border-box;
    border-color: transparent;
  }

  &--active {
    background: $active-bg;
    border-color: transparent;
    color: var(--ns-color-text-on-brand);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // While animating out the flyout is fading (opacity 0) but still in the DOM;
  // don't let its sub-pills hit-test over the content beneath.
  &--closing {
    pointer-events: none;
  }
}

// Bottom section
.ns-nav-sidebar__bottom {
  margin-top: auto;
  padding-top: 8px;
}
</style>

<style>
@keyframes ns-sidebar-sub-in {
  from {
    opacity: 0;
    transform: translateX(-16px) scale(0.88);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
@keyframes ns-sidebar-sub-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(-16px) scale(0.88);
  }
}
</style>
