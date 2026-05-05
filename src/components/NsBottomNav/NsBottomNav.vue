<template>
  <div class="ns-bottom-nav-wrap" @click.stop>
    <!-- Sub-row for MAIN bar items (centered, above bar) -->
    <div v-if="mainActiveSub" class="ns-bottom-nav__sub-row-wrap">
      <div class="ns-bottom-nav__sub-row">
        <button
          v-for="(subLabel, i) in mainActiveSub.items"
          :key="subLabel"
          class="ns-bottom-nav__sub-pill"
          :class="{
            'ns-bottom-nav__sub-pill--active': modelValue === subId(mainActiveSub.id, subLabel),
          }"
          :style="subPillStyle(i, mainActiveSub.items.length, closingSub === mainActiveSub.id)"
          @click="handleSelect(subId(mainActiveSub.id, subLabel))"
        >
          {{ subLabel }}
        </button>
      </div>
    </div>

    <!-- More popup — absolutely positioned above bar, right-aligned -->
    <Transition name="ns-popup">
      <div v-if="moreOpen" class="ns-bottom-nav__more-popup" @click.stop>
        <!-- Sub-row for MORE items (above the popup pill row) -->
        <div v-if="moreActiveSub" class="ns-bottom-nav__sub-row">
          <button
            v-for="(subLabel, i) in moreActiveSub.items"
            :key="subLabel"
            class="ns-bottom-nav__sub-pill"
            :class="{
              'ns-bottom-nav__sub-pill--active': modelValue === subId(moreActiveSub.id, subLabel),
            }"
            :style="subPillStyle(i, moreActiveSub.items.length, closingSub === moreActiveSub.id)"
            @click="handleSelect(subId(moreActiveSub.id, subLabel))"
          >
            {{ subLabel }}
          </button>
        </div>

        <!-- More pill row -->
        <div class="ns-bottom-nav__more-row">
          <button
            v-for="(item, i) in moreItems"
            :key="item.id"
            class="ns-bottom-nav__pill"
            :class="{ 'ns-bottom-nav__pill--active': isPillActive(item) }"
            :style="{
              animation: `ns-sub-in 0.28s cubic-bezier(0.34,1.56,0.64,1) ${i * 60}ms both`,
            }"
            @click.stop="handleTap(item)"
          >
            <component :is="item.icon" :size="22" weight="regular" />
            <span class="ns-bottom-nav__label">{{ item.label }}</span>
            <span v-if="item.sub?.length && !isPillActive(item)" class="ns-bottom-nav__chevron"
              >›</span
            >
          </button>
        </div>
      </div>
    </Transition>

    <!-- Main bar -->
    <div class="ns-bottom-nav">
      <button
        v-for="item in mainItems"
        :key="item.id"
        class="ns-bottom-nav__pill"
        :class="{ 'ns-bottom-nav__pill--active': isPillActive(item) }"
        @click.stop="handleTap(item, true)"
      >
        <component :is="item.icon" class="ns-bottom-nav__icon" :size="22" weight="regular" />
        <span class="ns-bottom-nav__label">{{ item.label }}</span>
        <span v-if="item.sub?.length && !isPillActive(item)" class="ns-bottom-nav__chevron">›</span>
      </button>

      <!-- More button -->
      <button
        v-if="moreItems.length"
        class="ns-bottom-nav__pill"
        :class="{ 'ns-bottom-nav__pill--active': moreOpen }"
        @click.stop="toggleMore"
      >
        <svg
          v-if="moreOpen"
          class="ns-bottom-nav__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
          />
        </svg>
        <span v-else class="ns-bottom-nav__dots" aria-hidden="true">···</span>
        <span class="ns-bottom-nav__label">More</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NsNavItem } from '../NsNavSidebar/NsNavSidebar.vue'

export interface NsBottomNavProps {
  /** Items always visible in the main bar */
  mainItems: NsNavItem[]
  /** Items shown in the More popup */
  moreItems?: NsNavItem[]
  modelValue: string
}

const props = withDefaults(defineProps<NsBottomNavProps>(), {
  moreItems: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [id: string]
}>()

const moreOpen = ref(false)
const openSub = ref<string | null>(null)
const closingSub = ref<string | null>(null)
let closeTimer: ReturnType<typeof setTimeout> | null = null

function subId(parentId: string, subLabel: string): string {
  return `${parentId}/${subLabel.toLowerCase().replace(/ /g, '-')}`
}

function isPillActive(item: NsNavItem): boolean {
  return props.modelValue === item.id || openSub.value === item.id
}

const mainActiveSub = computed(() => {
  const id = openSub.value || closingSub.value
  if (!id) return null
  const item = props.mainItems.find((i) => i.id === id)
  if (!item?.sub?.length) return null
  return { id, items: item.sub }
})

const moreActiveSub = computed(() => {
  const id = openSub.value || closingSub.value
  if (!id) return null
  const item = props.moreItems.find((i) => i.id === id)
  if (!item?.sub?.length) return null
  return { id, items: item.sub }
})

function subPillStyle(idx: number, total: number, isClosing: boolean): Record<string, string> {
  const animIdx = isClosing ? total - 1 - idx : idx
  const easing = isClosing ? 'cubic-bezier(0.4,0,0.2,1)' : 'cubic-bezier(0.34,1.56,0.64,1)'
  const name = isClosing ? 'ns-sub-out' : 'ns-sub-in'
  return { animation: `${name} 0.28s ${easing} ${animIdx * 60}ms both` }
}

function handleTap(item: NsNavItem, isMainBar = false) {
  if (isMainBar) moreOpen.value = false
  if (item.sub?.length) {
    if (openSub.value === item.id) {
      closingSub.value = item.id
      openSub.value = null
      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = setTimeout(
        () => {
          closingSub.value = null
        },
        item.sub.length * 60 + 240,
      )
    } else {
      closingSub.value = null
      if (closeTimer) clearTimeout(closeTimer)
      openSub.value = item.id
      if (props.moreItems.find((x) => x.id === item.id)) {
        moreOpen.value = true
      }
    }
  } else {
    handleSelect(item.id)
  }
}

function handleSelect(id: string) {
  moreOpen.value = false
  openSub.value = null
  closingSub.value = null
  if (closeTimer) clearTimeout(closeTimer)
  emit('update:modelValue', id)
}

function toggleMore() {
  openSub.value = null
  closingSub.value = null
  moreOpen.value = !moreOpen.value
}

function closeAll() {
  moreOpen.value = false
  if (openSub.value) {
    const item = [...props.mainItems, ...props.moreItems].find((i) => i.id === openSub.value)
    const subCount = item?.sub?.length ?? 0
    closingSub.value = openSub.value
    openSub.value = null
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(
      () => {
        closingSub.value = null
      },
      subCount * 60 + 240,
    )
  }
}

onMounted(() => window.addEventListener('click', closeAll))
onUnmounted(() => {
  window.removeEventListener('click', closeAll)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<style lang="scss" scoped>
$active-bg: var(--ns-color-bg-brand);
$pill-radius: 999px;
$pill-h: 56px;

@mixin gradient-border {
  border: 1.5px solid transparent;
  background:
    linear-gradient(var(--ns-color-background), var(--ns-color-background)) padding-box,
    radial-gradient(ellipse at 30% 50%, rgba(242, 150, 77, 0.55) 0%, rgba(255, 255, 255, 0.55) 100%)
      border-box;
}

.ns-bottom-nav-wrap {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.ns-bottom-nav__sub-row-wrap {
  display: flex;
  justify-content: center;
}

.ns-bottom-nav__sub-row {
  display: inline-flex;
  flex-direction: row;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(254, 247, 238, 0.85);
  backdrop-filter: blur(8px);
  border-radius: $pill-radius;
  box-shadow: 0 2px 12px rgba(45, 11, 0, 0.1);
}

.ns-bottom-nav__sub-pill {
  height: 44px;
  min-width: 70px;
  padding: 0 14px;
  border-radius: $pill-radius;
  color: var(--ns-color-on-surface);
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  @include gradient-border;

  &--active {
    background: $active-bg;
    border-color: transparent;
    color: var(--ns-color-on-primary);
    font-weight: 700;
  }

  &:hover:not(&--active) {
    background: var(--ns-color-bg-brand-subtle);
    border-color: transparent;
  }
}

.ns-bottom-nav__more-popup {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 6px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  z-index: 30;
}

.ns-bottom-nav__more-row {
  display: inline-flex;
  flex-direction: row;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(254, 247, 238, 0.9);
  backdrop-filter: blur(8px);
  border-radius: $pill-radius;
  box-shadow: 0 2px 12px rgba(45, 11, 0, 0.12);
}

.ns-bottom-nav {
  display: flex;
  align-items: center;
  padding: 8px 10px 10px;
  gap: 6px;
  background: transparent;
}

.ns-bottom-nav__pill {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: $pill-h;
  min-width: 72px;
  max-width: 110px;
  padding: 6px 10px;
  border-radius: $pill-radius;
  cursor: pointer;
  transition: background 0.15s;
  color: var(--ns-color-on-surface);
  @include gradient-border;

  &--active {
    background: $active-bg;
    border-color: transparent;
    color: var(--ns-color-on-primary);
  }
}

.ns-bottom-nav__icon {
  flex-shrink: 0;
}

.ns-bottom-nav__label {
  font-family: var(--ns-font-family-text);
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;

  .ns-bottom-nav__pill--active & {
    font-weight: 700;
  }
}

.ns-bottom-nav__dots {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  line-height: 1;
}

.ns-bottom-nav__chevron {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 9px;
  color: var(--ns-color-text-tertiary);
  line-height: 1;
}

.ns-popup-enter-active,
.ns-popup-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.ns-popup-enter-from,
.ns-popup-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>

<style>
@keyframes ns-sub-in {
  from {
    opacity: 0;
    transform: translateX(16px) scale(0.88);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
@keyframes ns-sub-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(16px) scale(0.88);
  }
}
</style>
