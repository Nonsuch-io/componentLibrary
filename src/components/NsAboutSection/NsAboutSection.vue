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
  flex-direction: column;
  gap: var(--ns-space-6);
  width: 100%;
  padding: var(--ns-space-6) var(--ns-space-4);
  background: var(--ns-color-bg-brand);
  overflow: hidden;

  @media (min-width: 1024px) {
    flex-direction: row;
    align-items: center;
    gap: var(--ns-space-16);
    padding: var(--ns-space-10) var(--ns-space-12);
  }

  &__eyebrow {
    @media (min-width: 1024px) {
      flex: 0 0 410px;
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-10);
    flex: 1;
    min-width: 0;
    font-family: var(--ns-font-family-text);
    font-size: var(--ns-font-size-xl);
    font-weight: 400;
    line-height: 1.25;
    color: var(--ns-color-text-on-dark);

    @media (min-width: 1024px) {
      font-size: 1.5rem;
      line-height: 1.2;
    }
  }
}
</style>
