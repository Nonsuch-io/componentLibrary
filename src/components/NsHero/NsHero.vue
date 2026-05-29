<template>
  <section class="ns-hero">
    <div class="ns-hero__left">
      <div class="ns-hero__eyebrow">
        <slot name="eyebrow" />
      </div>
      <div class="ns-hero__headline">
        <slot name="headline" />
      </div>
      <div class="ns-hero__capture">
        <slot name="capture" />
      </div>
    </div>
    <div class="ns-hero__right">
      <slot name="media" />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-hero {
  display: flex;
  align-items: flex-start;
  gap: var(--ns-space-3);
  width: 100%;
  min-height: 640px;
  padding: var(--ns-space-10) var(--ns-space-12);
  overflow: hidden;

  &__left {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-8);
    flex: 1;
    min-width: 0;
  }

  &__eyebrow {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__headline {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-4);
    font-family: var(--ns-font-family-text);
    font-size: var(--ns-font-size-display);
    font-weight: 600;
    line-height: 1.1;
    color: var(--ns-color-text-primary);
  }

  &__capture {
    padding-top: var(--ns-space-4);
  }

  &__right {
    display: flex;
    flex: 0 0 auto;
    height: 100%;
    align-items: flex-start;
    justify-content: flex-end;
  }
}
</style>
