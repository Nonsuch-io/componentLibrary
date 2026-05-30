<template>
  <div class="ns-step-row">
    <div class="ns-step-row__separator" />
    <div class="ns-step-row__content">
      <NsNumberTile :number="number" />
      <p class="ns-step-row__text">
        <slot />
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import NsNumberTile from '../NsNumberTile/NsNumberTile.vue'

/** Designed for use on dark backgrounds (e.g. NsExpectSection). Text uses --ns-color-text-on-dark. */
export interface NsStepRowProps {
  number: number | string
}

defineProps<NsStepRowProps>()
</script>

<style lang="scss" scoped>
.ns-step-row {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-10);
  padding-bottom: var(--ns-space-10);
  width: 100%;

  &__separator {
    height: 1px;
    width: 100%;
    background: var(--ns-color-border-brand);
  }

  &__content {
    display: flex;
    gap: var(--ns-space-10);
    align-items: center;
  }

  &__text {
    flex: 1;
    font-family: var(--ns-font-family-text);
    font-size: var(--ns-font-size-xl);
    font-weight: 400;
    line-height: 1.25;
    color: var(--ns-color-text-on-dark);
    margin: 0;

    @media (min-width: 1024px) {
      font-size: 1.5rem;
      line-height: 1.2;
    }
  }
}
</style>
