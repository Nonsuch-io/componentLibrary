<template>
  <section class="ns-about-section">
    <div class="ns-about-section__eyebrow">
      <slot name="eyebrow" />
    </div>
    <div class="ns-about-section__content">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-about-section {
  display: flex;
  align-items: center;
  gap: 150px;
  width: 100%;
  padding: var(--ns-space-10) var(--ns-space-12);
  background: var(--ns-color-bg-brand);
  overflow: hidden;

  &__eyebrow {
    flex: 0 0 324px;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-10);
    flex: 1;
    min-width: 0;
    font-family: var(--ns-font-family-text);
    font-size: 1.5rem;
    font-weight: 400;
    line-height: 1.2;
    color: var(--ns-color-text-on-dark);
  }
}
</style>
