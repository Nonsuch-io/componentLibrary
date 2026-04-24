<template>
  <nav class="ns-nav-sidebar" :class="{ 'ns-nav-sidebar--expanded': isExpanded }">
    <!-- Toggle button -->
    <button
      class="ns-nav-sidebar__toggle-btn"
      :aria-label="isExpanded ? 'Collapse menu' : 'Expand menu'"
      @click="isExpanded = !isExpanded"
    >
      <PhEye v-if="isExpanded" :size="18" weight="regular" aria-hidden="true" />
      <PhEyeClosed v-else :size="18" weight="regular" aria-hidden="true" />
      <span v-if="isExpanded" class="ns-nav-sidebar__toggle-label">Hide Menu</span>
    </button>

    <!-- Main nav items -->
    <ul class="ns-nav-sidebar__list">
      <li v-for="item in items" :key="item.id" class="ns-nav-sidebar__item">
        <button
          class="ns-nav-sidebar__pill"
          :class="{ 'ns-nav-sidebar__pill--active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
          :aria-expanded="item.sub?.length ? openSub === item.id : undefined"
          @click="onItemClick(item)"
        >
          <component :is="item.icon" class="ns-nav-sidebar__icon" :size="20" weight="regular" />
          <span v-if="isExpanded" class="ns-nav-sidebar__label">{{ item.label }}</span>
          <svg
            v-if="item.sub?.length"
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
        </button>

        <!-- Sub-menu flyout -->
        <div
          v-if="item.sub?.length && (openSub === item.id || closingSub === item.id)"
          class="ns-nav-sidebar__flyout"
        >
          <button
            v-for="(subLabel, subIdx) in item.sub"
            :key="subLabel"
            class="ns-nav-sidebar__sub-pill"
            :class="{
              'ns-nav-sidebar__sub-pill--active': modelValue === subId(item.id, subLabel),
              'ns-nav-sidebar__sub-pill--closing': closingSub === item.id,
            }"
            :style="subItemStyle(subIdx, item.sub!.length, item.id)"
            @click="onSubClick(item.id, subLabel)"
          >
            {{ subLabel }}
          </button>
        </div>
      </li>
    </ul>

    <!-- Bottom item (e.g. Settings) -->
    <div v-if="bottomItem" class="ns-nav-sidebar__bottom">
      <button
        class="ns-nav-sidebar__pill"
        :class="{ 'ns-nav-sidebar__pill--active': modelValue === bottomItem.id }"
        :aria-current="modelValue === bottomItem.id ? 'page' : undefined"
        @click="emit('update:modelValue', bottomItem.id)"
      >
        <component :is="bottomItem.icon" class="ns-nav-sidebar__icon" :size="20" weight="regular" />
        <span v-if="isExpanded" class="ns-nav-sidebar__label">{{ bottomItem.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { PhEye, PhEyeClosed } from '@phosphor-icons/vue'

export interface NsNavItem {
  id: string
  label: string
  icon: Component
  sub?: string[]
}

export interface NsNavSidebarProps {
  items: NsNavItem[]
  bottomItem?: NsNavItem
  modelValue: string
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<NsNavSidebarProps>(), {
  bottomItem: undefined,
  defaultExpanded: true,
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const isExpanded = ref(props.defaultExpanded)
const openSub = ref<string | null>(null)
const closingSub = ref<string | null>(null)
const closeTimers = new Map<string, ReturnType<typeof setTimeout>>()

function subId(parentId: string, subLabel: string): string {
  return `${parentId}/${subLabel.toLowerCase().replace(/ /g, '-')}`
}

function isActive(item: NsNavItem): boolean {
  if (props.modelValue === item.id) return true
  if (item.sub) {
    return item.sub.some((sub) => props.modelValue === subId(item.id, sub))
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
  const subCount = item?.sub?.length ?? 0
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

function onItemClick(item: NsNavItem) {
  if (!item.sub?.length) {
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

function onSubClick(parentId: string, subLabel: string) {
  closeSubMenu(parentId)
  emit('update:modelValue', subId(parentId, subLabel))
}
</script>

<style lang="scss" scoped>
$pill-h: 44px;
$pill-radius: 999px;
$icon-size: 60px;
$active-bg: #d56307;

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

// Main pill
.ns-nav-sidebar__pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ns-space-0);
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
  transition:
    background 150ms ease,
    color 150ms ease;
  @include gradient-border;

  .ns-nav-sidebar--expanded & {
    justify-content: flex-start;
    gap: 10px;
  }

  &:hover:not(&--active) {
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
    color: #ffffff;
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
  transition: background 150ms ease;
  @include gradient-border;

  &:hover:not(&--active) {
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
    color: #ffffff;
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
