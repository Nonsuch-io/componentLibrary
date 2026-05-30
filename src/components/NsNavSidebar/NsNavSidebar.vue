<template>
  <nav class="ns-nav-sidebar" :class="{ 'ns-nav-sidebar--expanded': isExpanded }">
    <!-- Toggle button -->
    <button
      v-if="showToggle"
      class="ns-nav-sidebar__toggle-btn"
      :aria-label="isExpanded ? 'Collapse menu' : 'Expand menu'"
      @click="isExpanded = !isExpanded"
    >
      <AnimatedEye :open="isExpanded" />
      <span v-if="isExpanded" class="ns-nav-sidebar__toggle-label">Hide Menu</span>
    </button>

    <!-- Main nav items -->
    <ul class="ns-nav-sidebar__list">
      <template v-for="item in items" :key="item.id">
        <li v-if="item.separator" class="ns-nav-sidebar__separator" role="separator" />
        <li class="ns-nav-sidebar__item">
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

          <!-- Sub-menu flyout -->
          <div
            v-if="hasSub(item) && (openSub === item.id || closingSub === item.id)"
            class="ns-nav-sidebar__flyout"
          >
            <component
              :is="sub.to && !sub.disable ? 'a' : 'button'"
              v-for="(sub, subIdx) in normalizedSub(item)"
              :key="sub.id ?? sub.label"
              :href="sub.to && !sub.disable ? sub.to : undefined"
              :type="sub.to && !sub.disable ? undefined : 'button'"
              class="ns-nav-sidebar__sub-pill"
              :class="{
                'ns-nav-sidebar__sub-pill--active': modelValue === subId(item.id, sub),
                'ns-nav-sidebar__sub-pill--closing': closingSub === item.id,
                'ns-nav-sidebar__sub-pill--disabled': sub.disable,
              }"
              :aria-disabled="sub.disable ? 'true' : undefined"
              :tabindex="sub.disable ? -1 : undefined"
              :style="subItemStyle(subIdx, normalizedSub(item).length, item.id)"
              @click="onSubClick(item.id, sub, $event)"
            >
              {{ sub.label }}
            </component>
          </div>
        </li>
      </template>
    </ul>

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
      </component>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, type Component } from 'vue'
import AnimatedEye from './AnimatedEye.vue'
import NsIcon from '../NsIcon/NsIcon.vue'

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
}

const props = withDefaults(defineProps<NsNavSidebarProps>(), {
  bottomItem: undefined,
  defaultExpanded: true,
  expanded: undefined,
  showToggle: true,
})

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

function normalizedSub(item: NsNavItem): NsNavSubItem[] {
  if (!item.sub) return []
  return item.sub.map((s) => (typeof s === 'string' ? { label: s } : s))
}

function hasSub(item: NsNavItem): boolean {
  return !!item.sub && item.sub.length > 0
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
  if (closeTimers.has(id)) {
    clearTimeout(closeTimers.get(id)!)
    closeTimers.delete(id)
  }
  closingSub.value = null
  openSub.value = id
}

function closeSubMenu(id: string) {
  const item = props.items.find((i) => i.id === id)
  const subCount = item ? normalizedSub(item).length : 0
  closingSub.value = id
  const timer = setTimeout(
    () => {
      openSub.value = null
      closingSub.value = null
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
}

// Cancel any in-flight flyout-close timers so they don't fire after unmount
// and mutate refs on a dead instance.
onUnmounted(() => {
  closeTimers.forEach((t) => clearTimeout(t))
  closeTimers.clear()
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
    linear-gradient(var(--ns-color-background), var(--ns-color-background)) padding-box,
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
  color: var(--ns-color-on-surface);
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
      linear-gradient(var(--ns-color-background), var(--ns-color-background)) padding-box,
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
    color: var(--ns-color-on-primary);
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

// Flyout
.ns-nav-sidebar__flyout {
  position: absolute;
  left: calc(100% + 8px);
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 100;
  min-width: 140px;
}

.ns-nav-sidebar__sub-pill {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 18px;
  border-radius: $pill-radius;
  color: var(--ns-color-on-surface);
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
      linear-gradient(var(--ns-color-background), var(--ns-color-background)) padding-box,
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
    color: var(--ns-color-on-primary);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
