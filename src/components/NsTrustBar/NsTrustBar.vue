<template>
  <div class="ns-trust-bar">
    <div class="ns-trust-bar__viewport">
      <Transition name="ns-trust-bar">
        <div :key="currentIndex" class="ns-trust-bar__item">
          <img v-if="currentItem.icon" :src="currentItem.icon" class="ns-trust-bar__icon" alt="" />
          <span>{{ currentItem.text }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

export interface NsTrustBarItem {
  text: string
  icon?: string
}

export interface NsTrustBarProps {
  items: NsTrustBarItem[]
  /** Milliseconds each item is shown before cycling to the next */
  interval?: number
}

const props = withDefaults(defineProps<NsTrustBarProps>(), {
  interval: 3000,
})

const currentIndex = ref(0)
const currentItem = computed(() => props.items[currentIndex.value])

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (props.items.length > 1) {
    timer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % props.items.length
    }, props.interval)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.ns-trust-bar {
  width: 100%;
  background: var(--ns-color-bg-highlight);
  padding: 11px var(--ns-space-12);

  &__viewport {
    position: relative;
    overflow: hidden;
    height: 103px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 11px;
    font-family: var(--ns-font-family-text);
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.25;
    color: var(--ns-color-text-primary);
    position: absolute;
    inset: 0;
  }

  &__icon {
    width: 26px;
    height: auto;
    flex-shrink: 0;
  }
}

.ns-trust-bar-enter-active,
.ns-trust-bar-leave-active {
  transition: transform 400ms ease;
}

.ns-trust-bar-enter-from {
  transform: translateX(100%);
}

.ns-trust-bar-leave-to {
  transform: translateX(-100%);
}
</style>
