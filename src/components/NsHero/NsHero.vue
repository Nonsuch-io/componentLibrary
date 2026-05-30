<template>
  <section class="ns-hero">
    <div class="ns-hero__eyebrow">
      <slot name="eyebrow" />
    </div>
    <div class="ns-hero__media">
      <slot name="media" />
    </div>
    <div class="ns-hero__headline">
      <slot name="headline" />
    </div>
    <div class="ns-hero__capture">
      <slot name="capture" />
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.ns-hero {
  display: flex;
  flex-direction: column;
  gap: var(--ns-space-6);
  width: 100%;
  padding: var(--ns-space-6) var(--ns-space-4);
  overflow: hidden;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'eyebrow  media'
      'headline media'
      'capture  media';
    row-gap: var(--ns-space-8);
    column-gap: var(--ns-space-3);
    min-height: 640px;
    padding: var(--ns-space-10) var(--ns-space-12);
  }

  &__eyebrow {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    @media (min-width: 1024px) {
      grid-area: eyebrow;
    }
  }

  &__media {
    display: flex;
    align-items: center;
    justify-content: center;

    @media (min-width: 1024px) {
      grid-area: media;
      align-items: flex-start;
      justify-content: flex-end;
    }
  }

  &__headline {
    display: flex;
    flex-direction: column;
    gap: var(--ns-space-4);
    font-family: var(--ns-font-family-text);
    font-size: 2rem;
    font-weight: var(--ns-font-weight-semibold);
    line-height: 1.15;
    color: var(--ns-color-text-primary);

    @media (min-width: 1024px) {
      grid-area: headline;
      font-size: var(--ns-font-size-display);
      font-weight: 600;
      line-height: 1.1;
    }
  }

  &__capture {
    @media (min-width: 1024px) {
      grid-area: capture;
      padding-top: var(--ns-space-4);
    }
  }
}
</style>
