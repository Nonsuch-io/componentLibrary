<template>
  <span
    class="ns-tooltip"
    role="button"
    tabindex="0"
    @click.stop="trigger === 'click' ? toggle() : undefined"
    @keydown.enter.stop="trigger === 'click' ? toggle() : undefined"
    @keydown.space.prevent.stop="trigger === 'click' ? toggle() : undefined"
  >
    <!-- PhInfo (info-circle) path inlined for test environment compatibility -->
    <svg
      class="ns-tooltip__icon"
      width="16"
      height="16"
      viewBox="0 0 256 256"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"
      />
    </svg>
    <span v-if="label" class="ns-tooltip__label">{{ label }}</span>

    <!-- Hover (desktop): Quasar's built-in hover behaviour, no close button -->
    <q-tooltip
      v-if="trigger === 'hover'"
      class="ns-tooltip__popup"
      :delay="delay"
      :offset="offset"
      :anchor="anchor"
      :self="self"
    >
      <slot />
    </q-tooltip>

    <!-- Click (touch/mobile): plain in-tree div, always closes reliably -->
    <div v-else v-show="clickOpen" class="ns-tooltip__popup ns-tooltip__popup--click">
      <div class="ns-tooltip__content">
        <slot />
        <button class="ns-tooltip__close" :aria-label="closeLabel" @click.stop="close">
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path
              d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

export type NsTooltipTrigger = 'hover' | 'click'

export interface NsTooltipProps {
  /** Optional text label shown next to the info icon trigger */
  label?: string
  /** Accessible label for the close button (click trigger only) */
  closeLabel?: string
  /** How the tooltip is opened: hover (desktop) or click (touch/mobile) */
  trigger?: NsTooltipTrigger
  /** Delay before showing on hover (ms) */
  delay?: number
  /** Offset from anchor element [y, x] */
  offset?: [number, number]
  /** Anchor point on the trigger (hover only) */
  anchor?: NsTooltipAnchor
  /** Self alignment point of the popup (hover only) */
  self?: NsTooltipAnchor
}

withDefaults(defineProps<NsTooltipProps>(), {
  label: undefined,
  closeLabel: 'Close',
  trigger: 'hover',
  delay: 300,
  offset: () => [8, 0],
  anchor: 'bottom middle',
  self: 'top middle',
})

const clickOpen = ref(false)

function toggle() {
  clickOpen.value = !clickOpen.value
}

function close() {
  clickOpen.value = false
}
</script>

<!-- Trigger styles — scoped -->
<style lang="scss" scoped>
.ns-tooltip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: var(--ns-color-text-primary);
  position: relative;
}

.ns-tooltip__icon {
  flex-shrink: 0;
}

.ns-tooltip__label {
  font-family: var(--ns-font-family-text);
  font-size: 12px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 18px;
  white-space: nowrap;
}

// Click popup — in-tree, absolutely positioned below trigger
.ns-tooltip__popup--click {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  min-width: 200px;
}
</style>

<!-- Popup styles — hover uses Quasar portal; click uses the in-tree div above -->
<style lang="scss">
// Quasar portal styling (hover mode)
.ns-tooltip__popup.q-tooltip {
  background: var(--ns-color-bg-surface);
  color: var(--ns-color-text-primary);
  box-shadow: var(--ns-shadow-md);
  border-radius: var(--ns-radius-md);
  padding: 12px;
  max-width: 320px;
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 1.4;
}

// Shared popup panel styles
.ns-tooltip__popup {
  background: var(--ns-color-bg-surface);
  color: var(--ns-color-text-primary);
  box-shadow: var(--ns-shadow-md);
  border-radius: var(--ns-radius-md);
  padding: 12px;
  max-width: 320px;
  font-family: var(--ns-font-family-text);
  font-size: 14px;
  font-weight: var(--ns-font-weight-regular);
  line-height: 1.4;

  .ns-tooltip__content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .ns-tooltip__close {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--ns-color-text-primary);
    border-radius: var(--ns-radius-sm);
    margin-top: 2px;

    &:hover {
      background: var(--ns-color-bg-subtle);
    }
  }
}
</style>
